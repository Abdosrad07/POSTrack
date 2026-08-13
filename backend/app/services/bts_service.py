"""
Règle métier BTS (Vol.1 §3.5, Vol.2 §5.4) :
- taux_saturation = charge_mesuree / capacite_max * 100
- la fiche BTS affiche en permanence les valeurs du DERNIER relevé (champs cache
  dernier_taux_saturation / dernier_rendement / date_dernier_releve sur BTS),
  tout en conservant l'historique complet dans bts_releves.
"""
from sqlalchemy.orm import Session

from app.models.bts import BTS
from app.models.bts_releve import BTSReleve
from app.schemas.bts import BTSReleveCreate


def ajouter_releve(db: Session, bts: BTS, data: BTSReleveCreate, created_by: int) -> BTSReleve:
    taux_saturation = round((data.charge_mesuree / bts.capacite_max) * 100, 2) if bts.capacite_max else None

    releve = BTSReleve(
        bts_id=bts.id,
        date_releve=data.date_releve,
        charge_mesuree=data.charge_mesuree,
        taux_saturation=taux_saturation,
        rendement=data.rendement,
        remarque=data.remarque,
        created_by=created_by,
    )
    db.add(releve)

    # Mise à jour du cache sur BTS — uniquement si ce relevé est le plus récent connu,
    # pour ne pas écraser le cache avec un relevé saisi en retard (import Excel, etc.)
    if bts.date_dernier_releve is None or data.date_releve >= bts.date_dernier_releve:
        bts.dernier_taux_saturation = taux_saturation
        bts.dernier_rendement = data.rendement
        bts.date_dernier_releve = data.date_releve

    db.commit()
    db.refresh(releve)
    return releve
