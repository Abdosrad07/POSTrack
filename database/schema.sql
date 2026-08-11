PRAGMA foreign_keys = ON;
CREATE TABLE USERS (
    id              INTEGER PRIMARY KEY,
    nom             TEXT NOT NULL,
    email           TEXT NOT NULL UNIQUE,
    mot_de_passe_hash TEXT NOT NULL,
    role            TEXT NOT NULL
                    CHECK (role IN ('ADMIN','MANAGER','DSM','VIEWER')),
    actif           INTEGER NOT NULL DEFAULT 1 CHECK (actif IN (0,1)),
    date_creation   TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%S','now'))
);

-- ----------------------------------------------------------------------------
-- 2. PARTENAIRES
-- code_partenaire UNIQUE NOT NULL
-- ----------------------------------------------------------------------------
CREATE TABLE PARTENAIRES (
    id                  INTEGER PRIMARY KEY,
    code_partenaire     TEXT NOT NULL UNIQUE,
    raison_sociale      TEXT NOT NULL,
    contact_email       TEXT,
    contact_telephone   TEXT,
    date_creation       TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%S','now'))
);

-- ----------------------------------------------------------------------------
-- 3. DSM
-- matricule UNIQUE NOT NULL
-- ----------------------------------------------------------------------------
CREATE TABLE DSM (
    id              INTEGER PRIMARY KEY,
    matricule       TEXT NOT NULL UNIQUE,
    nom             TEXT NOT NULL,
    zone            TEXT,
    user_id         INTEGER
                    REFERENCES USERS(id) ON DELETE SET NULL,
    date_creation   TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%S','now'))
);

-- ----------------------------------------------------------------------------
-- 4. POS
-- statut CHECK ('NOUVEAU','RECONDUIT') ; FK partenaire_id, dsm_id
-- index type_pos / partenaire_id / dsm_id
-- ----------------------------------------------------------------------------
CREATE TABLE POS (
    id                              INTEGER PRIMARY KEY,
    nom                             TEXT NOT NULL,
    type_pos                        TEXT NOT NULL,
    statut                          TEXT NOT NULL DEFAULT 'NOUVEAU'
                                    CHECK (statut IN ('NOUVEAU','RECONDUIT')),
    partenaire_id                   INTEGER NOT NULL
                                    REFERENCES PARTENAIRES(id) ON DELETE RESTRICT,
    dsm_id                          INTEGER
                                    REFERENCES DSM(id) ON DELETE SET NULL,
    date_derniere_reconduction      TEXT,
    date_creation                   TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%S','now'))
);

CREATE INDEX idx_pos_type_pos       ON POS(type_pos);
CREATE INDEX idx_pos_partenaire_id  ON POS(partenaire_id);
CREATE INDEX idx_pos_dsm_id         ON POS(dsm_id);

-- ----------------------------------------------------------------------------
-- 5. RECONDUCTIONS
-- FK vers POS ; doit garder POS.date_derniere_reconduction cohérente
-- (mise à jour applicative ou via trigger, cf. note plus bas)
-- ----------------------------------------------------------------------------
CREATE TABLE RECONDUCTIONS (
    id              INTEGER PRIMARY KEY,
    pos_id          INTEGER NOT NULL
                    REFERENCES POS(id) ON DELETE CASCADE,
    date_reconduction TEXT NOT NULL,
    commentaire     TEXT,
    date_creation   TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%S','now'))
);

CREATE INDEX idx_reconductions_pos_id ON RECONDUCTIONS(pos_id);

-- Trigger optionnel : garde POS.date_derniere_reconduction synchronisée
-- à chaque insertion dans RECONDUCTIONS (à valider avec le Backend).
CREATE TRIGGER trg_reconductions_update_pos
AFTER INSERT ON RECONDUCTIONS
BEGIN
    UPDATE POS
    SET date_derniere_reconduction = NEW.date_reconduction,
        statut = 'RECONDUIT'
    WHERE id = NEW.pos_id;
END;

-- ----------------------------------------------------------------------------
-- 6. PRIMES
-- UNIQUE(pos_id) — socle de la règle métier (jalon J9)
-- statut CHECK IN ('EN_ATTENTE','VALIDEE','PAYEE','REJETEE')
-- ----------------------------------------------------------------------------
CREATE TABLE PRIMES (
    id              INTEGER PRIMARY KEY,
    pos_id          INTEGER NOT NULL UNIQUE
                    REFERENCES POS(id) ON DELETE RESTRICT,
    statut          TEXT NOT NULL DEFAULT 'EN_ATTENTE'
                    CHECK (statut IN ('EN_ATTENTE','VALIDEE','PAYEE','REJETEE')),
    montant         NUMERIC NOT NULL,
    date_creation   TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%S','now'))
);

CREATE INDEX idx_primes_statut ON PRIMES(statut);

-- ----------------------------------------------------------------------------
-- 7. CLIENTS
-- FK vers POS
-- ----------------------------------------------------------------------------
CREATE TABLE CLIENTS (
    id              INTEGER PRIMARY KEY,
    pos_id          INTEGER NOT NULL
                    REFERENCES POS(id) ON DELETE CASCADE,
    nom             TEXT NOT NULL,
    telephone       TEXT,
    date_creation   TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%S','now'))
);

CREATE INDEX idx_clients_pos_id ON CLIENTS(pos_id);

-- ----------------------------------------------------------------------------
-- 8. BTS
-- Colonnes de cache : dernier_taux_saturation, dernier_rendement, date_dernier_releve
-- ----------------------------------------------------------------------------
CREATE TABLE BTS (
    id                          INTEGER PRIMARY KEY,
    code_bts                    TEXT NOT NULL UNIQUE,
    localisation                TEXT,
    dernier_taux_saturation     NUMERIC,
    dernier_rendement           NUMERIC,
    date_dernier_releve         TEXT,
    date_creation                TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%S','now'))
);

-- ----------------------------------------------------------------------------
-- 9. BTS_RELEVES
-- FK vers BTS ; doit rester cohérent avec les colonnes de cache de BTS
-- ----------------------------------------------------------------------------
CREATE TABLE BTS_RELEVES (
    id                  INTEGER PRIMARY KEY,
    bts_id              INTEGER NOT NULL
                        REFERENCES BTS(id) ON DELETE CASCADE,
    taux_saturation     NUMERIC NOT NULL,
    rendement           NUMERIC NOT NULL,
    date_releve         TEXT NOT NULL,
    date_creation       TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%S','now'))
);

CREATE INDEX idx_bts_releves_bts_id ON BTS_RELEVES(bts_id);

-- Trigger optionnel : met à jour le cache BTS à chaque nouveau relevé
CREATE TRIGGER trg_bts_releves_update_cache
AFTER INSERT ON BTS_RELEVES
BEGIN
    UPDATE BTS
    SET dernier_taux_saturation = NEW.taux_saturation,
        dernier_rendement       = NEW.rendement,
        date_dernier_releve     = NEW.date_releve
    WHERE id = NEW.bts_id;
END;

-- ----------------------------------------------------------------------------
-- 10. SIMS
-- statut CHECK IN ('EN_STOCK','VENDUE','ACTIVEE','DEFECTUEUSE','RETOURNEE')
-- FK POS / CLIENTS
-- ----------------------------------------------------------------------------
CREATE TABLE SIMS (
    id              INTEGER PRIMARY KEY,
    numero_sim      TEXT NOT NULL UNIQUE,
    statut          TEXT NOT NULL DEFAULT 'EN_STOCK'
                    CHECK (statut IN ('EN_STOCK','VENDUE','ACTIVEE','DEFECTUEUSE','RETOURNEE')),
    pos_id          INTEGER
                    REFERENCES POS(id) ON DELETE SET NULL,
    client_id       INTEGER
                    REFERENCES CLIENTS(id) ON DELETE SET NULL,
    date_creation   TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%S','now'))
);

CREATE INDEX idx_sims_pos_id    ON SIMS(pos_id);
CREATE INDEX idx_sims_client_id ON SIMS(client_id);

-- ----------------------------------------------------------------------------
-- 11. REQUETES
-- FK multiples nullable : partenaire_id, pos_id, bts_id, client_id
-- ----------------------------------------------------------------------------
CREATE TABLE REQUETES (
    id              INTEGER PRIMARY KEY,
    objet           TEXT NOT NULL,
    description     TEXT,
    partenaire_id   INTEGER
                    REFERENCES PARTENAIRES(id) ON DELETE SET NULL,
    pos_id          INTEGER
                    REFERENCES POS(id) ON DELETE SET NULL,
    bts_id          INTEGER
                    REFERENCES BTS(id) ON DELETE SET NULL,
    client_id       INTEGER
                    REFERENCES CLIENTS(id) ON DELETE SET NULL,
    statut          TEXT NOT NULL DEFAULT 'OUVERTE',
    date_creation   TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%S','now'))
);

CREATE INDEX idx_requetes_partenaire_id ON REQUETES(partenaire_id);
CREATE INDEX idx_requetes_pos_id        ON REQUETES(pos_id);
CREATE INDEX idx_requetes_bts_id        ON REQUETES(bts_id);
CREATE INDEX idx_requetes_client_id     ON REQUETES(client_id);

-- ----------------------------------------------------------------------------
-- 12. AUDIT_LOGS
-- Journal d'actions, sans contrainte métier bloquante
-- ----------------------------------------------------------------------------
CREATE TABLE AUDIT_LOGS (
    id              INTEGER PRIMARY KEY,
    user_id         INTEGER
                    REFERENCES USERS(id) ON DELETE SET NULL,
    action          TEXT NOT NULL,
    table_cible     TEXT,
    enregistrement_id INTEGER,
    details         TEXT,
    date_creation   TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%S','now'))
);

CREATE INDEX idx_audit_logs_user_id ON AUDIT_LOGS(user_id);

-- ============================================================================
-- Fin du schéma — 12 tables créées.
-- ============================================================================
