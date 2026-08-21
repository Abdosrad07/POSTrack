PRAGMA foreign_keys = ON;
 
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    nom_complet VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'OPERATIONNEL' CHECK (role IN ('ADMIN','MANAGER','CHEF_OPERATIONNEL','OPERATIONNEL')),
    actif INTEGER NOT NULL DEFAULT 1 CHECK (actif IN (0,1)),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
 
CREATE TABLE IF NOT EXISTS partenaires (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code_partenaire VARCHAR(50) NOT NULL UNIQUE,
    nom VARCHAR(100) NOT NULL,
    type_partenaire VARCHAR(30) DEFAULT 'DISTRIBUTEUR' CHECK (type_partenaire IN ('DISTRIBUTEUR','MASTER_DEALER','REVENDEUR')),
    region VARCHAR(100),
    ville VARCHAR(100),
    adresse VARCHAR(255),
    contact_principal VARCHAR(100),
    telephone VARCHAR(20),
    email VARCHAR(100),
    date_signature_contrat DATE,
    date_fin_contrat DATE,
    statut VARCHAR(20) NOT NULL DEFAULT 'ACTIF' CHECK (statut IN ('ACTIF','SUSPENDU','RESILIE')),
    est_provisoire INTEGER NOT NULL DEFAULT 0 CHECK (est_provisoire IN (0,1)),
    created_by INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);
 
CREATE TABLE IF NOT EXISTS dsm (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    matricule VARCHAR(50) NOT NULL UNIQUE,
    nom_complet VARCHAR(100) NOT NULL,
    zone_couverture VARCHAR(100),
    telephone VARCHAR(20),
    email VARCHAR(100),
    date_affectation DATE,
    statut VARCHAR(20) NOT NULL DEFAULT 'ACTIF' CHECK (statut IN ('ACTIF','INACTIF')),
    est_provisoire INTEGER NOT NULL DEFAULT 0 CHECK (est_provisoire IN (0,1)),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);
 
CREATE TABLE IF NOT EXISTS pos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code_pos VARCHAR(50) NOT NULL UNIQUE,
    nom VARCHAR(150) NOT NULL,
    adresse VARCHAR(255),
    ville VARCHAR(100),
    region VARCHAR(100),
    quartier VARCHAR(100),
    lieu_dit VARCHAR(150),
    latitude REAL,
    longitude REAL,
    categorie_pos VARCHAR(30),
    type_pos VARCHAR(20) NOT NULL DEFAULT 'NOUVEAU' CHECK (type_pos IN ('NOUVEAU','RECONDUIT')),
    statut VARCHAR(20) NOT NULL DEFAULT 'ACTIF' CHECK (statut IN ('ACTIF','SUSPENDU','RENOUVELLEMENT','CLOTURE')),
    numero_pos VARCHAR(20) UNIQUE,
    contact_principal VARCHAR(100),
    telephone VARCHAR(20),
    email_contact VARCHAR(100),
    contact_secondaire VARCHAR(20),
    montant_initial NUMERIC(10,2),
    notes TEXT,
    partenaire_id INTEGER NOT NULL,
    dsm_id INTEGER NOT NULL,
    gestionnaire_id INTEGER,
    date_creation DATE NOT NULL DEFAULT (date('now')),
    date_expiration DATE,
    date_derniere_reconduction DATE,
    created_by INTEGER,
    updated_by INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (partenaire_id) REFERENCES partenaires(id) ON DELETE RESTRICT,
    FOREIGN KEY (dsm_id) REFERENCES dsm(id) ON DELETE RESTRICT,
    FOREIGN KEY (gestionnaire_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
);
 
CREATE TABLE IF NOT EXISTS reconductions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pos_id INTEGER NOT NULL,
    date_reconduction DATE NOT NULL,
    ancienne_date_expiration DATE NOT NULL,
    nouvelle_date_expiration DATE NOT NULL,
    motif TEXT,
    valide_par INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (pos_id) REFERENCES pos(id) ON DELETE CASCADE,
    FOREIGN KEY (valide_par) REFERENCES users(id) ON DELETE SET NULL
);
 
CREATE TRIGGER IF NOT EXISTS trg_reconductions_update_pos
AFTER INSERT ON reconductions
BEGIN
    UPDATE pos
    SET type_pos = 'RECONDUIT',
        date_derniere_reconduction = NEW.date_reconduction,
        date_expiration = NEW.nouvelle_date_expiration,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.pos_id;
END;
 
CREATE TABLE IF NOT EXISTS primes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pos_id INTEGER UNIQUE NOT NULL,
    dsm_id INTEGER,
    partenaire_id INTEGER,
    montant DECIMAL(10,2) NOT NULL,
    statut VARCHAR(20) NOT NULL DEFAULT 'EN_ATTENTE' CHECK (statut IN ('EN_ATTENTE','VALIDEE','PAYEE','REJETEE')),
    date_attribution DATE NOT NULL DEFAULT (date('now')),
    commentaire TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (pos_id) REFERENCES pos(id) ON DELETE RESTRICT,
    FOREIGN KEY (dsm_id) REFERENCES dsm(id) ON DELETE SET NULL,
    FOREIGN KEY (partenaire_id) REFERENCES partenaires(id) ON DELETE SET NULL
);
 
CREATE TABLE IF NOT EXISTS clients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code_client VARCHAR(50) NOT NULL UNIQUE,
    nom_complet VARCHAR(100) NOT NULL,
    telephone VARCHAR(20),
    numero_piece_identite VARCHAR(50),
    type_piece VARCHAR(20) CHECK (type_piece IN ('CNI','PASSEPORT','CARTE_SEJOUR')),
    pos_id INTEGER NOT NULL,
    date_enregistrement DATE NOT NULL DEFAULT (date('now')),
    statut VARCHAR(20) NOT NULL DEFAULT 'ACTIF' CHECK (statut IN ('ACTIF','INACTIF')),
    created_by INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (pos_id) REFERENCES pos(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);
 
CREATE TABLE IF NOT EXISTS bts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code_bts VARCHAR(50) NOT NULL UNIQUE,
    nom VARCHAR(100),
    partenaire_id INTEGER NOT NULL,
    operateur VARCHAR(30) NOT NULL CHECK (operateur IN ('MTN','ORANGE','CAMTEL','NEXTTEL')),
    technologie VARCHAR(20),
    region VARCHAR(100),
    ville VARCHAR(100),
    latitude REAL,
    longitude REAL,
    capacite_max INTEGER NOT NULL,
    dernier_taux_saturation REAL,
    dernier_rendement REAL,
    date_dernier_releve DATETIME,
    date_mise_service DATE,
    statut VARCHAR(20) NOT NULL DEFAULT 'ACTIF' CHECK (statut IN ('ACTIF','MAINTENANCE','HORS_SERVICE')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (partenaire_id) REFERENCES partenaires(id) ON DELETE RESTRICT
);
 
CREATE TABLE IF NOT EXISTS bts_releves (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    bts_id INTEGER NOT NULL,
    date_releve DATETIME NOT NULL,
    charge_mesuree INTEGER NOT NULL,
    taux_saturation REAL,
    rendement REAL,
    remarque TEXT,
    created_by INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (bts_id) REFERENCES bts(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);
 
CREATE TRIGGER IF NOT EXISTS trg_bts_releves_update_cache
AFTER INSERT ON bts_releves
BEGIN
    UPDATE bts
    SET dernier_taux_saturation = NEW.taux_saturation,
        dernier_rendement = NEW.rendement,
        date_dernier_releve = NEW.date_releve
    WHERE id = NEW.bts_id
      AND (date_dernier_releve IS NULL OR NEW.date_releve >= date_dernier_releve);
END;
 
CREATE TABLE IF NOT EXISTS sims (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    iccid VARCHAR(22) NOT NULL UNIQUE,
    numero_msisdn VARCHAR(20),
    operateur VARCHAR(30) NOT NULL CHECK (operateur IN ('MTN','ORANGE','CAMTEL','NEXTTEL')),
    statut VARCHAR(20) NOT NULL DEFAULT 'EN_STOCK' CHECK (statut IN ('EN_STOCK','VENDUE','ACTIVEE','DEFECTUEUSE','RETOURNEE')),
    pos_id INTEGER NOT NULL,
    client_id INTEGER,
    date_reception_stock DATE,
    date_vente DATE,
    date_activation DATE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (pos_id) REFERENCES pos(id) ON DELETE RESTRICT,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL
);
 
CREATE TABLE IF NOT EXISTS requetes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code_requete VARCHAR(50) NOT NULL UNIQUE,
    type_requete VARCHAR(30) NOT NULL CHECK (type_requete IN ('APPROVISIONNEMENT_SIM','MAINTENANCE_BTS','RECLAMATION_CLIENT','SUPPORT_POS','AUTRE')),
    objet VARCHAR(255) NOT NULL,
    description TEXT,
    statut VARCHAR(20) NOT NULL DEFAULT 'OUVERTE' CHECK (statut IN ('OUVERTE','EN_COURS','RESOLUE','FERMEE')),
    priorite VARCHAR(20) NOT NULL DEFAULT 'NORMALE' CHECK (priorite IN ('BASSE','NORMALE','HAUTE','URGENTE')),
    partenaire_id INTEGER,
    pos_id INTEGER,
    bts_id INTEGER,
    client_id INTEGER,
    demandeur_id INTEGER,
    assigne_a INTEGER,
    date_creation DATETIME DEFAULT CURRENT_TIMESTAMP,
    date_resolution DATETIME,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (partenaire_id) REFERENCES partenaires(id) ON DELETE SET NULL,
    FOREIGN KEY (pos_id) REFERENCES pos(id) ON DELETE SET NULL,
    FOREIGN KEY (bts_id) REFERENCES bts(id) ON DELETE SET NULL,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL,
    FOREIGN KEY (demandeur_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (assigne_a) REFERENCES users(id) ON DELETE SET NULL
);
 
CREATE TABLE IF NOT EXISTS audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    action VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id INTEGER,
    ancien_statut VARCHAR(50),
    nouveau_statut VARCHAR(50),
    details TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);
 
CREATE INDEX IF NOT EXISTS idx_pos_type_pos ON pos(type_pos);
CREATE INDEX IF NOT EXISTS idx_pos_statut ON pos(statut);
CREATE INDEX IF NOT EXISTS idx_pos_partenaire ON pos(partenaire_id);
CREATE INDEX IF NOT EXISTS idx_pos_dsm ON pos(dsm_id);
CREATE INDEX IF NOT EXISTS idx_pos_quartier ON pos(quartier);
CREATE INDEX IF NOT EXISTS idx_primes_pos ON primes(pos_id);
CREATE INDEX IF NOT EXISTS idx_primes_statut ON primes(statut);
CREATE INDEX IF NOT EXISTS idx_reconductions_pos ON reconductions(pos_id);
CREATE INDEX IF NOT EXISTS idx_clients_pos ON clients(pos_id);
CREATE INDEX IF NOT EXISTS idx_bts_partenaire ON bts(partenaire_id);
CREATE INDEX IF NOT EXISTS idx_bts_releves_bts ON bts_releves(bts_id);
CREATE INDEX IF NOT EXISTS idx_sims_pos ON sims(pos_id);
CREATE INDEX IF NOT EXISTS idx_sims_client ON sims(client_id);
CREATE INDEX IF NOT EXISTS idx_requetes_pos ON requetes(pos_id);
CREATE INDEX IF NOT EXISTS idx_requetes_partenaire ON requetes(partenaire_id);
CREATE INDEX IF NOT EXISTS idx_requetes_bts ON requetes(bts_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
