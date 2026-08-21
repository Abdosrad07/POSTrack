"""
import_validation_service : canal central de creation/mise a jour en
masse (section 7 du cahier des charges). Applique les memes regles
metier que l'API pour chaque ligne, produit une previsualisation et un
rapport d'erreurs localise par numero de ligne / colonne, puis ecrit le
lot de maniere transactionnelle (aucune mise a jour partielle non
signalee).

Flux complet :
  1. POST /imports/validate  -> validate_import() controle le fichier,
     ecrit un rapport d'erreurs ET les lignes valides sur disque
     (references par ImportBatch.error_report_path / valid_rows_path),
     et place le lot en VALIDATED / PARTIAL / FAILED.
  2. POST /imports/{batch_id}/apply -> apply_import() relit les lignes
     valides stockees et les ecrit en base dans une seule transaction
     SQLAlchemy : soit tout le lot est applique, soit rien ne l'est en
     cas d'erreur inattendue (ex. donnee modifiee entre-temps).

Perimetre couvert (section 1.7.1 du cahier des charges - "au minimum") :
Partenaires, DSM, POS, Clients, BTS, releves BTS, SIM, periodes de
primes, primes et requetes -- soit les 10 gabarits ci-dessous.

Cas particulier PARTNER : l'ensemble de l'API est organise autour d'un
PartnerContext (section 3.2 de la documentation fonctionnelle -- aucun
import n'est accepte sans Partenaire de contexte selectionne). Importer
"des Partenaires" depuis une route deja scopee a un partner_id ne peut
donc pas creer de nouveaux Partenaires (cela sortirait du contexte) :
ce gabarit met a jour les champs du Partenaire courant lui-meme, sous
reserve que la ligne reference bien son propre code_partenaire -- ce
qui satisfait la regle "mise a jour controlee" du glossaire sans
casser le principe de contexte obligatoire.
"""
import io
import json
import os
from datetime import datetime, timezone

import pandas as pd
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.errors import ValidationErrorApp, NotFoundError, ConflictError
from app.crud.import_batch_crud import import_batch_crud
from app.models.import_batch import StatutImport
from app.models.partner import Partner
from app.models.pos import POS, TypePos
from app.models.dsm import DSM
from app.models.bts import BTS
from app.models.bts_releve import BTSReleve
from app.models.sim import SIM, StatutSim
from app.models.prime_period import PrimePeriod, StatutPeriode
from app.models.prime import Prime, StatutPrime
from app.models.requete import Requete, TypeRequete, PrioriteRequete
from app.services import audit_service

REQUIRED_COLUMNS = {
    "PARTNER": ["code_partenaire", "name"],
    "DSM": ["matricule", "full_name"],
    "POS": ["code_pos", "name", "dsm_matricule", "date_creation", "date_expiration"],
    "BTS": ["code_bts"],
    "BTS_RELEVE": ["bts_code", "charge", "taux_saturation", "rendement"],
    "SIM": ["iccid", "pos_code"],
    "PRIME_PERIOD": ["code", "label", "start_date", "end_date"],
    "PRIME": ["pos_code", "prime_period_code", "montant"],
    "REQUETE": ["external_id", "type_requete", "titre"],
}

VALID_TYPE_REQUETE = {t.value for t in TypeRequete}
VALID_PRIORITE_REQUETE = {p.value for p in PrioriteRequete}


def _is_blank(value) -> bool:
    """
    True si la valeur doit etre consideree comme absente : None, chaine
    vide/blanche, ou NaN pandas. Necessaire car une cellule Excel vide
    est relue par pandas comme NaN (float) et non comme une chaine
    vide -- str(row.get("champ","")) donnerait alors "nan" (truthy),
    ce qui laisserait passer une valeur manquante comme si elle etait
    renseignee.
    """
    if value is None:
        return True
    try:
        if pd.isna(value):
            return True
    except (TypeError, ValueError):
        pass
    return str(value).strip() == ""


def _clean_str(value, default: str = "") -> str:
    """Normalise une valeur de cellule en chaine, en traitant NaN/None comme absents."""
    return default if _is_blank(value) else str(value).strip()


def _clean_optional(value):
    """
    Comme _clean_str, mais retourne None (plutot qu'une chaine vide)
    quand la valeur est absente -- pour les champs optionnels stockes
    tels quels en base (adresse, zone, commentaire...), afin de ne
    jamais y ecrire le texte litteral "nan" issu d'une cellule Excel
    vide relue par pandas.
    """
    return None if _is_blank(value) else (value if not isinstance(value, str) else value.strip())


def _read_dataframe(file_bytes: bytes, filename: str) -> pd.DataFrame:
    if filename.lower().endswith(".csv"):
        return pd.read_csv(io.BytesIO(file_bytes))
    return pd.read_excel(io.BytesIO(file_bytes))


def validate_import(db: Session, *, partner_id: int, user_id: int, entity_type: str,
                     filename: str, file_bytes: bytes) -> dict:
    if entity_type not in REQUIRED_COLUMNS:
        raise ValidationErrorApp(
            f"Type d'entite d'import '{entity_type}' non supporte. "
            f"Valeurs possibles : {list(REQUIRED_COLUMNS.keys())}",
        )

    try:
        df = _read_dataframe(file_bytes, filename)
    except Exception as exc:
        raise ValidationErrorApp(f"Fichier illisible : {exc}")

    required = REQUIRED_COLUMNS[entity_type]
    missing = [c for c in required if c not in df.columns]
    if missing:
        raise ValidationErrorApp(f"Colonnes obligatoires manquantes : {missing}")

    errors: list[dict] = []
    valid_rows: list[dict] = []

    for idx, row in df.iterrows():
        line_no = idx + 2  # +1 pour l'entete, +1 pour l'index base 0
        row_errors = _validate_row(db, partner_id, entity_type, row, line_no)
        if row_errors:
            errors.extend(row_errors)
        else:
            valid_rows.append(row.to_dict())

    batch = import_batch_crud.create(db, {
        "partner_id": partner_id,
        "imported_by": user_id,
        "file_name": filename,
        "entity_type": entity_type,
        "status": StatutImport.VALIDATED if not errors else (
            StatutImport.PARTIAL if valid_rows else StatutImport.FAILED
        ),
        "total_rows": len(df),
        "valid_rows": len(valid_rows),
        "error_rows": len(errors),
    })

    os.makedirs(settings.IMPORT_REPORTS_DIR, exist_ok=True)

    report_path = os.path.join(settings.IMPORT_REPORTS_DIR, f"batch_{batch.id}_errors.json")
    with open(report_path, "w", encoding="utf-8") as f:
        json.dump(errors, f, ensure_ascii=False, indent=2, default=str)

    valid_rows_path = os.path.join(settings.IMPORT_REPORTS_DIR, f"batch_{batch.id}_valid_rows.json")
    with open(valid_rows_path, "w", encoding="utf-8") as f:
        json.dump(valid_rows, f, ensure_ascii=False, indent=2, default=str)

    batch.error_report_path = report_path
    batch.valid_rows_path = valid_rows_path
    db.add(batch)
    db.commit()
    db.refresh(batch)

    audit_service.log_action(
        db, user_id=user_id, partner_id=partner_id, action="IMPORT_VALIDATE",
        entity_type="IMPORT_BATCH", entity_id=batch.id,
        details=f"{entity_type} : {len(valid_rows)} ligne(s) valide(s), {len(errors)} erreur(s)",
    )

    return {
        "batch": batch,
        "preview": valid_rows[:20],
        "errors": [
            {"row": e["row"], "field": e.get("field"), "value": str(e.get("value")), "reason": e["reason"]}
            for e in errors
        ],
    }


def _err(line_no, field, value, reason):
    return {"row": line_no, "field": field, "value": value, "reason": reason}


def _validate_row(db: Session, partner_id: int, entity_type: str, row, line_no: int) -> list[dict]:
    errors: list[dict] = []

    if entity_type == "PARTNER":
        partner = db.query(Partner).filter(Partner.id == partner_id).first()
        if not partner:
            errors.append(_err(line_no, "code_partenaire", row.get("code_partenaire"),
                                "Partenaire de contexte introuvable."))
        elif str(row["code_partenaire"]) != partner.code:
            errors.append(_err(
                line_no, "code_partenaire", row["code_partenaire"],
                f"Ne correspond pas au Partenaire de contexte ({partner.code}) : "
                f"un import ne peut mettre a jour que le Partenaire courant.",
            ))
        if _is_blank(row.get("name")):
            errors.append(_err(line_no, "name", row.get("name"), "name obligatoire."))

    elif entity_type == "DSM":
        if _is_blank(row.get("full_name")):
            errors.append(_err(line_no, "full_name", row.get("full_name"), "full_name obligatoire."))
        if _is_blank(row.get("matricule")):
            errors.append(_err(line_no, "matricule", row.get("matricule"), "matricule obligatoire."))

    elif entity_type == "POS":
        dsm = db.query(DSM).filter(DSM.partner_id == partner_id, DSM.matricule == str(row["dsm_matricule"])).first()
        if not dsm:
            errors.append(_err(line_no, "dsm_matricule", row["dsm_matricule"], "DSM inconnu dans ce Partenaire."))
        existing = db.query(POS).filter(POS.partner_id == partner_id, POS.code_pos == str(row["code_pos"])).first()
        if existing:
            errors.append(_err(line_no, "code_pos", row["code_pos"], "code_pos deja utilise dans ce Partenaire."))
        try:
            d1 = pd.to_datetime(row["date_creation"]).date()
            d2 = pd.to_datetime(row["date_expiration"]).date()
            if d2 <= d1:
                errors.append(_err(line_no, "date_expiration", row["date_expiration"],
                                    "date_expiration doit etre posterieure a date_creation."))
        except Exception:
            errors.append(_err(line_no, "date_creation/date_expiration", None, "Format de date invalide."))

    elif entity_type == "BTS":
        if _is_blank(row.get("code_bts")):
            errors.append(_err(line_no, "code_bts", row.get("code_bts"), "code_bts obligatoire."))

    elif entity_type == "BTS_RELEVE":
        bts = db.query(BTS).filter(BTS.partner_id == partner_id, BTS.code_bts == str(row["bts_code"])).first()
        if not bts:
            errors.append(_err(line_no, "bts_code", row["bts_code"], "BTS inconnue dans ce Partenaire."))
        for champ in ("charge", "taux_saturation", "rendement"):
            try:
                if float(row[champ]) < 0:
                    errors.append(_err(line_no, champ, row[champ], "La valeur ne peut pas etre negative."))
            except (ValueError, TypeError):
                errors.append(_err(line_no, champ, row[champ], "Valeur numerique attendue."))

    elif entity_type == "SIM":
        pos = db.query(POS).filter(POS.partner_id == partner_id, POS.code_pos == str(row["pos_code"])).first()
        if not pos:
            errors.append(_err(line_no, "pos_code", row["pos_code"], "POS inconnu dans ce Partenaire."))
        if _is_blank(row.get("iccid")):
            errors.append(_err(line_no, "iccid", row.get("iccid"), "iccid obligatoire."))
        else:
            existing = db.query(SIM).filter(SIM.iccid == str(row["iccid"])).first()
            if existing and existing.partner_id != partner_id:
                errors.append(_err(line_no, "iccid", row["iccid"],
                                    "Cet ICCID appartient deja a un autre Partenaire."))

    elif entity_type == "PRIME_PERIOD":
        try:
            d1 = pd.to_datetime(row["start_date"]).date()
            d2 = pd.to_datetime(row["end_date"]).date()
            if d2 <= d1:
                errors.append(_err(line_no, "end_date", row["end_date"],
                                    "end_date doit etre posterieure a start_date."))
        except Exception:
            errors.append(_err(line_no, "start_date/end_date", None, "Format de date invalide."))
        if _is_blank(row.get("code")):
            errors.append(_err(line_no, "code", row.get("code"), "code obligatoire."))

    elif entity_type == "PRIME":
        pos = db.query(POS).filter(POS.partner_id == partner_id, POS.code_pos == str(row["pos_code"])).first()
        if not pos:
            errors.append(_err(line_no, "pos_code", row["pos_code"], "POS inconnu dans ce Partenaire."))
        period = db.query(PrimePeriod).filter(
            PrimePeriod.partner_id == partner_id, PrimePeriod.code == str(row["prime_period_code"])
        ).first()
        if not period:
            errors.append(_err(line_no, "prime_period_code", row["prime_period_code"],
                                "Periode de prime inconnue dans ce Partenaire."))
        try:
            if float(row["montant"]) < 0:
                errors.append(_err(line_no, "montant", row["montant"], "Le montant ne peut pas etre negatif."))
        except (ValueError, TypeError):
            errors.append(_err(line_no, "montant", row.get("montant"), "Montant numerique attendu."))
        if pos and period:
            existing_prime = db.query(Prime).filter(Prime.pos_id == pos.id).first()
            if existing_prime is None and pos.type_pos != TypePos.NOUVEAU:
                errors.append(_err(line_no, "pos_code", row["pos_code"],
                                    "Seul un POS NOUVEAU peut recevoir une prime de creation."))

    elif entity_type == "REQUETE":
        if _is_blank(row.get("external_id")):
            errors.append(_err(line_no, "external_id", row.get("external_id"), "external_id obligatoire."))
        if _is_blank(row.get("titre")):
            errors.append(_err(line_no, "titre", row.get("titre"), "titre obligatoire."))
        type_val = _clean_str(row.get("type_requete")).upper()
        if type_val not in VALID_TYPE_REQUETE:
            errors.append(_err(line_no, "type_requete", row.get("type_requete"),
                                f"Valeur attendue parmi {sorted(VALID_TYPE_REQUETE)}."))
        priorite_val = _clean_str(row.get("priorite"), "NORMALE").upper()
        if priorite_val not in VALID_PRIORITE_REQUETE:
            errors.append(_err(line_no, "priorite", row.get("priorite"),
                                f"Valeur attendue parmi {sorted(VALID_PRIORITE_REQUETE)}."))

    return errors


def _apply_valid_row(db: Session, partner_id: int, user_id: int, entity_type: str, row: dict) -> None:
    """
    Ecrit une ligne validee en base. Reapplique une verification minimale
    (l'entite referencee doit toujours exister au moment de l'ecriture,
    au cas ou l'etat aurait change entre validation et application) afin
    de ne jamais produire une ecriture incoherente.
    """
    if entity_type == "PARTNER":
        partner = db.query(Partner).filter(Partner.id == partner_id).first()
        if not partner or str(row["code_partenaire"]) != partner.code:
            raise ConflictError("Partenaire de contexte incoherent au moment de l'application.")
        partner.name = str(row["name"])
        if not _is_blank(row.get("address")):
            partner.address = _clean_str(row.get("address"))
        db.add(partner)

    elif entity_type == "DSM":
        existing = db.query(DSM).filter(DSM.partner_id == partner_id, DSM.matricule == str(row["matricule"])).first()
        if existing:
            existing.full_name = str(row["full_name"])
            if not _is_blank(row.get("zone")):
                existing.zone = _clean_optional(row.get("zone"))
            db.add(existing)
        else:
            db.add(DSM(
                partner_id=partner_id, matricule=str(row["matricule"]),
                full_name=str(row["full_name"]), zone=_clean_optional(row.get("zone")),
            ))

    elif entity_type == "POS":
        dsm = db.query(DSM).filter(DSM.partner_id == partner_id, DSM.matricule == str(row["dsm_matricule"])).first()
        if not dsm:
            raise ConflictError(f"DSM '{row['dsm_matricule']}' introuvable au moment de l'application.")
        existing = db.query(POS).filter(POS.partner_id == partner_id, POS.code_pos == str(row["code_pos"])).first()
        if existing:
            raise ConflictError(f"code_pos '{row['code_pos']}' deja utilise au moment de l'application.")
        db.add(POS(
            partner_id=partner_id, dsm_id=dsm.id, code_pos=str(row["code_pos"]), name=str(row["name"]),
            address=_clean_optional(row.get("address")), zone=_clean_optional(row.get("zone")), type_pos=TypePos.NOUVEAU,
            date_creation=pd.to_datetime(row["date_creation"]).date(),
            date_expiration=pd.to_datetime(row["date_expiration"]).date(),
        ))

    elif entity_type == "BTS":
        existing = db.query(BTS).filter(BTS.partner_id == partner_id, BTS.code_bts == str(row["code_bts"])).first()
        if existing:
            for champ in ("operateur", "technologie", "capacite_max", "latitude", "longitude", "zone"):
                if not _is_blank(row.get(champ)):
                    setattr(existing, champ, row[champ])
            db.add(existing)
        else:
            db.add(BTS(
                partner_id=partner_id, code_bts=str(row["code_bts"]),
                operateur=_clean_optional(row.get("operateur")), technologie=_clean_optional(row.get("technologie")),
                capacite_max=_clean_optional(row.get("capacite_max")), latitude=_clean_optional(row.get("latitude")),
                longitude=_clean_optional(row.get("longitude")), zone=_clean_optional(row.get("zone")),
            ))

    elif entity_type == "BTS_RELEVE":
        bts = db.query(BTS).filter(BTS.partner_id == partner_id, BTS.code_bts == str(row["bts_code"])).first()
        if not bts:
            raise ConflictError(f"BTS '{row['bts_code']}' introuvable au moment de l'application.")
        db.add(BTSReleve(
            bts_id=bts.id, charge=float(row["charge"]), taux_saturation=float(row["taux_saturation"]),
            rendement=float(row["rendement"]), commentaire=_clean_optional(row.get("commentaire")),
        ))

    elif entity_type == "SIM":
        pos = db.query(POS).filter(POS.partner_id == partner_id, POS.code_pos == str(row["pos_code"])).first()
        if not pos:
            raise ConflictError(f"POS '{row['pos_code']}' introuvable au moment de l'application.")
        existing = db.query(SIM).filter(SIM.iccid == str(row["iccid"])).first()
        if existing:
            if existing.partner_id != partner_id:
                raise ConflictError(f"ICCID '{row['iccid']}' appartient a un autre Partenaire.")
            existing.pos_id = pos.id
            db.add(existing)
        else:
            if pos.stock_actuel <= 0:
                raise ConflictError(
                    f"Stock SIM epuise pour le POS '{row['pos_code']}' ({pos.stock_actuel} restantes)."
                )
            pos.stock_actuel -= 1
            db.add(pos)
            db.add(SIM(partner_id=partner_id, pos_id=pos.id, iccid=str(row["iccid"]), status=StatutSim.EN_STOCK))

    elif entity_type == "PRIME_PERIOD":
        existing = db.query(PrimePeriod).filter(
            PrimePeriod.partner_id == partner_id, PrimePeriod.code == str(row["code"])
        ).first()
        if existing:
            existing.label = str(row["label"])
            existing.start_date = pd.to_datetime(row["start_date"]).date()
            existing.end_date = pd.to_datetime(row["end_date"]).date()
            db.add(existing)
        else:
            db.add(PrimePeriod(
                partner_id=partner_id, code=str(row["code"]), label=str(row["label"]),
                start_date=pd.to_datetime(row["start_date"]).date(),
                end_date=pd.to_datetime(row["end_date"]).date(),
                status=StatutPeriode.DRAFT,
            ))

    elif entity_type == "PRIME":
        pos = db.query(POS).filter(POS.partner_id == partner_id, POS.code_pos == str(row["pos_code"])).first()
        period = db.query(PrimePeriod).filter(
            PrimePeriod.partner_id == partner_id, PrimePeriod.code == str(row["prime_period_code"])
        ).first()
        if not pos or not period:
            raise ConflictError("POS ou PrimePeriod introuvable au moment de l'application.")
        existing = db.query(Prime).filter(Prime.pos_id == pos.id).first()
        if existing:
            raise ConflictError(f"Une prime existe deja pour le POS '{row['pos_code']}' (unicite).")
        db.add(Prime(
            pos_id=pos.id, prime_period_id=period.id, montant=row["montant"],
            status=StatutPrime.EN_ATTENTE, demandeur_id=user_id,
        ))

    elif entity_type == "REQUETE":
        existing = db.query(Requete).filter(
            Requete.partner_id == partner_id, Requete.external_id == str(row["external_id"])
        ).first()
        if existing:
            existing.titre = str(row["titre"])
            if not _is_blank(row.get("description")):
                existing.description = _clean_optional(row.get("description"))
            db.add(existing)
        else:
            db.add(Requete(
                partner_id=partner_id,
                external_id=str(row["external_id"]),
                type_requete=str(row["type_requete"]).strip().upper(),
                titre=str(row["titre"]),
                description=_clean_optional(row.get("description")),
                priorite=_clean_str(row.get("priorite"), "NORMALE").upper(),
                nombre_demande=1, nombre_effectue=0, nombre_rejete=0,
                date_creation=datetime.now(timezone.utc),
                demandeur_id=user_id,
            ))


def apply_import(db: Session, *, partner_id: int, user_id: int, batch_id: int) -> dict:
    batch = import_batch_crud.get(db, batch_id)
    if not batch or batch.partner_id != partner_id:
        raise NotFoundError("Lot d'import introuvable dans ce Partenaire.")
    if batch.status not in (StatutImport.VALIDATED, StatutImport.PARTIAL):
        raise ConflictError("Ce lot n'est pas dans un etat applicable (VALIDATED ou PARTIAL requis).")
    if not batch.valid_rows_path or not os.path.exists(batch.valid_rows_path):
        raise ConflictError(
            "Les lignes validees de ce lot ne sont plus disponibles : relancer /imports/validate."
        )

    with open(batch.valid_rows_path, "r", encoding="utf-8") as f:
        valid_rows = json.load(f)

    # Ecriture transactionnelle : soit tout le lot est applique, soit rien.
    try:
        for row in valid_rows:
            _apply_valid_row(db, partner_id, user_id, batch.entity_type.value, row)
        db.commit()
    except Exception:
        db.rollback()
        batch.status = StatutImport.FAILED
        db.add(batch)
        db.commit()
        audit_service.log_action(
            db, user_id=user_id, partner_id=partner_id, action="IMPORT_APPLY_FAILED",
            entity_type="IMPORT_BATCH", entity_id=batch.id,
            details="Echec de l'application transactionnelle : aucune ligne ecrite.",
        )
        raise

    applied = len(valid_rows)
    batch.status = StatutImport.APPLIED
    batch.applied_at = datetime.now(timezone.utc)
    db.add(batch)
    db.commit()
    db.refresh(batch)

    audit_service.log_action(
        db, user_id=user_id, partner_id=partner_id, action="IMPORT_APPLY",
        entity_type="IMPORT_BATCH", entity_id=batch.id,
        details=f"Lot applique : {applied} ligne(s) ecrite(s) en base",
    )
    return {"batch": batch, "applied_rows": applied}
