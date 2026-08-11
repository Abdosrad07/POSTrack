PRAGMA foreign_keys = ON;

-- ============================================================================
-- 1. USERS (les 4 rôles)
-- ============================================================================
INSERT INTO USERS (id, nom, email, mot_de_passe_hash, role, actif) VALUES
(1, 'Alma Daniela (Admin)',        'admin@postrack.cm',        'hash_admin_123',   'ADMIN',   1),
(2, 'Jean Marc (DSM Douala)',      'dsm.douala@postrack.cm',   'hash_dsm_123',     'DSM',     1),
(3, 'Salem Manager',               'manager@postrack.cm',      'hash_manager_123', 'MANAGER', 1),
(4, 'Moktar Viewer',               'viewer@postrack.cm',       'hash_viewer_123',  'VIEWER',  1);

-- ============================================================================
-- 2. PARTENAIRES
-- ============================================================================
INSERT INTO PARTENAIRES (id, code_partenaire, raison_sociale, contact_email, contact_telephone) VALUES
(1, 'PART-001', 'Camtel Express', 'contact@camtel-express.cm', '699000001');

-- ============================================================================
-- 3. DSM
-- ============================================================================
INSERT INTO DSM (id, matricule, nom, zone, user_id) VALUES
(1, 'DSM-DLA-01', 'Jean Marc', 'Douala Akwa', 2);

-- ============================================================================
-- 4. POS
-- ============================================================================

-- Cas 1 : POS NOUVEAU avec une PRIME EN_ATTENTE
INSERT INTO POS (id, nom, type_pos, statut, partenaire_id, dsm_id) VALUES
(101, 'POS-AKWA-01 - Kiosque Akwa Liberté', 'KIOSQUE', 'NOUVEAU', 1, 1);

-- Cas 1b : POS NOUVEAU avec prime VALIDEE
INSERT INTO POS (id, nom, type_pos, statut, partenaire_id, dsm_id) VALUES
(103, 'POS-BEPANDA-01 - Kiosque Bepanda', 'KIOSQUE', 'NOUVEAU', 1, 1);

-- Cas 1c : POS NOUVEAU avec prime PAYEE
INSERT INTO POS (id, nom, type_pos, statut, partenaire_id, dsm_id) VALUES
(104, 'POS-DEIDO-01 - Kiosque Deido', 'KIOSQUE', 'NOUVEAU', 1, 1);

-- Cas 2 : POS qui va être RECONDUIT (le trigger passera son statut à RECONDUIT
-- dès qu'une ligne sera insérée dans RECONDUCTIONS, voir plus bas)
INSERT INTO POS (id, nom, type_pos, statut, partenaire_id, dsm_id) VALUES
(102, 'POS-BONANJO-01 - Boutique Bonanjo Central', 'BOUTIQUE', 'NOUVEAU', 1, 1);

-- ============================================================================
-- 5. PRIMES (UNIQUE pos_id : une prime max par POS)
-- ============================================================================
INSERT INTO PRIMES (id, pos_id, statut, montant) VALUES
(1, 101, 'EN_ATTENTE', 25000.00),
(2, 103, 'VALIDEE',    25000.00),
(3, 104, 'PAYEE',      25000.00);

-- ============================================================================
-- 6. RECONDUCTIONS
-- L'insertion ci-dessous déclenche trg_reconductions_update_pos, qui met
-- automatiquement POS.statut = 'RECONDUIT' et POS.date_derniere_reconduction
-- pour le POS 102.
-- ============================================================================
INSERT INTO RECONDUCTIONS (id, pos_id, date_reconduction, commentaire) VALUES
(1, 102, '2026-01-01', 'Renouvellement annuel effectué avec succès');

-- ============================================================================
-- 7. CLIENTS
-- ============================================================================
INSERT INTO CLIENTS (id, pos_id, nom, telephone) VALUES
(1, 101, 'Paul Etoundi', '677123456');

-- ============================================================================
-- 8. SIMS (tous les statuts représentés)
-- ============================================================================
INSERT INTO SIMS (numero_sim, statut, pos_id, client_id) VALUES
('89237010000000000001', 'EN_STOCK',    101, NULL),
('89237010000000000002', 'VENDUE',      101, 1),
('89237010000000000003', 'ACTIVEE',     101, 1),
('89237010000000000004', 'DEFECTUEUSE', 102, NULL),
('89237010000000000005', 'RETOURNEE',   102, NULL);

-- ============================================================================
-- 9. BTS
-- ============================================================================
INSERT INTO BTS (id, code_bts, localisation) VALUES
(1, 'BTS-DLA-01', 'Antenne Akwa');

-- ============================================================================
-- 10. BTS_RELEVES
-- Chaque insertion déclenche trg_bts_releves_update_cache, qui met à jour
-- les colonnes de cache sur BTS (dernier_taux_saturation, dernier_rendement,
-- date_dernier_releve). Après ces 3 lignes, le cache reflète le relevé du 10/08.
-- ============================================================================
INSERT INTO BTS_RELEVES (bts_id, taux_saturation, rendement, date_releve) VALUES
(1, 40.0, 92.5, '2026-08-01T08:00:00'),
(1, 65.0, 89.0, '2026-08-05T08:00:00'),
(1, 82.0, 85.0, '2026-08-10T08:00:00');

-- ============================================================================
-- 11. REQUETES
-- ============================================================================
INSERT INTO REQUETES (id, objet, description, partenaire_id, pos_id, bts_id, client_id, statut) VALUES
(1, 'Rupture de stock SIM',
    'Le POS Akwa Liberté n''a plus de SIM CAMTEL en stock.',
    1, 101, NULL, NULL, 'OUVERTE');

-- ============================================================================
-- 12. AUDIT_LOGS
-- ============================================================================
INSERT INTO AUDIT_LOGS (user_id, action, table_cible, enregistrement_id, details) VALUES
(1, 'CREATE', 'POS', 101, 'Création du POS Akwa Liberté'),
(1, 'UPDATE', 'POS', 102, 'Reconduction du POS Bonanjo Central');
