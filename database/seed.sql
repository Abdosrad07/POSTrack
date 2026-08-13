PRAGMA foreign_keys = ON;
 
-- 1. USERS
INSERT INTO users (id, email, password_hash, nom_complet, role, actif) VALUES
(1, 'admin@postrack.cm', 'hash_admin_123', 'Toi (Admin)', 'ADMIN', 1),
(2, 'dsm.douala@postrack.cm', 'hash_dsm_123', 'Jean Marc (DSM Douala)', 'DSM', 1);
 
-- 2. PARTENAIRES
-- Master Color et Glothelo sont deux vrais partenaires (pas des provisoires) :
-- on connait leur identité, seuls certains de leurs DSM restent à confirmer.
-- Glothelo n'a pas encore de fichier de données : la ligne existe déjà,
-- prête à recevoir des POS dès que le fichier arrivera.
INSERT INTO partenaires (id, code_partenaire, nom, type_partenaire, ville, statut, est_provisoire) VALUES
(1, 'PART-001', 'Camtel Express', 'DISTRIBUTEUR', 'Douala', 'ACTIF', 0),
(2, 'PART-MC', 'Master Color', 'DISTRIBUTEUR', NULL, 'ACTIF', 0),
(3, 'PART-GL', 'Glothelo', 'DISTRIBUTEUR', NULL, 'ACTIF', 0);
 
-- 3. DSM (un réel de démo + les provisoires Master Color, un par numéro de téléphone distinct)
INSERT INTO dsm (id, matricule, nom_complet, zone_couverture, telephone, statut, est_provisoire) VALUES
(1, 'DSM-DLA-01', 'Jean Marc', 'Douala Akwa', NULL, 'ACTIF', 0),
(2, 'DSM-TEMP-622493002', 'DSM à identifier (import Master Color)', NULL, '622493002', 'ACTIF', 1),
(3, 'DSM-TEMP-622095909', 'DSM à identifier (import Master Color)', NULL, '622095909', 'ACTIF', 1);
 
-- 4. POS — démo standard (couvre NOUVEAU + RECONDUIT)
INSERT INTO pos (id, code_pos, nom, categorie_pos, type_pos, statut, ville, partenaire_id, dsm_id, date_creation) VALUES
(101, 'POS-DEMO-0001', 'Kiosque Akwa Liberte', 'KIOSQUE', 'NOUVEAU', 'ACTIF', 'Douala', 1, 1, date('now')),
(102, 'POS-DEMO-0002', 'Boutique Bonanjo Central', 'BOUTIQUE', 'NOUVEAU', 'ACTIF', 'Douala', 1, 1, date('now'));
 
-- 4bis. POS — echantillon reel Master Color (partenaire = 2, PART-MC)
INSERT INTO pos (id, code_pos, nom, quartier, lieu_dit, contact_secondaire, montant_initial, notes, partenaire_id, dsm_id, date_creation) VALUES
(201, 'POS-MC-000001', 'ALI - NEWBELL', 'NEWBELL', 'CASINO', '674135510', 10000.00, 'RAS', 2, 2, '2026-06-01'),
(202, 'POS-MC-000002', 'KAMGA - NEWBELL', 'NEWBELL', 'GANGUE CARREFOUR SENEGALAISE', '676845050', 10000.00, 'RAS', 2, 2, '2026-06-01');
 
INSERT INTO pos (id, code_pos, nom, quartier, lieu_dit, numero_pos, contact_secondaire, montant_initial, notes, partenaire_id, dsm_id, date_creation) VALUES
(203, 'POS-MC-000003', 'YOUSSOUF - NEWBELL', 'NEWBELL', 'MOSQUEE KDD EN ALLANT VERS MONKAM', '622486897', '656361885', 10000.00, 'RAS', 2, 3, '2026-07-01'),
(204, 'POS-MC-000004', 'IDELETTE - NEWBELL', 'NEWBELL', 'CERCLE MUNICIPAL MONKAM MOSQUEE', '622486896', '696632492', 5000.00, 'RAS', 2, 3, '2026-07-01');
 
-- 5. RECONDUCTIONS — on reconduit le POS 102 pour tester le trigger
INSERT INTO reconductions (id, pos_id, date_reconduction, ancienne_date_expiration, nouvelle_date_expiration, motif) VALUES
(1, 102, '2026-01-01', '2025-12-31', '2026-12-31', 'Renouvellement annuel effectue avec succes');
 
-- 6. PRIMES — les 3 statuts representes, jamais sur un POS reconduit
INSERT INTO primes (id, pos_id, statut, montant, date_attribution) VALUES
(1, 101, 'EN_ATTENTE', 25000.00, date('now')),
(2, 201, 'VALIDEE', 25000.00, date('now')),
(3, 203, 'PAYEE', 25000.00, date('now'));
 
-- 7. CLIENTS
INSERT INTO clients (id, code_client, nom_complet, telephone, pos_id, date_enregistrement) VALUES
(1, 'CLI-0001', 'Paul Etoundi', '677123456', 101, date('now'));
 
-- 8. BTS
INSERT INTO bts (id, code_bts, nom, partenaire_id, operateur, capacite_max) VALUES
(1, 'BTS-DLA-01', 'Antenne Akwa', 1, 'CAMTEL', 1000);
 
-- 9. BTS_RELEVES
INSERT INTO bts_releves (bts_id, date_releve, charge_mesuree, taux_saturation, rendement) VALUES
(1, '2026-08-01T08:00:00', 400, 40.0, 92.5),
(1, '2026-08-05T08:00:00', 650, 65.0, 89.0),
(1, '2026-08-10T08:00:00', 820, 82.0, 85.0);
 
-- 10. SIMS
INSERT INTO sims (iccid, operateur, statut, pos_id, client_id) VALUES
('89237010000000000001', 'CAMTEL', 'EN_STOCK', 101, NULL),
('89237010000000000002', 'CAMTEL', 'VENDUE', 101, 1),
('89237010000000000003', 'CAMTEL', 'ACTIVEE', 101, 1),
('89237010000000000004', 'CAMTEL', 'DEFECTUEUSE', 102, NULL),
('89237010000000000005', 'CAMTEL', 'RETOURNEE', 102, NULL);
 
-- 11. REQUETES
INSERT INTO requetes (id, code_requete, type_requete, objet, description, partenaire_id, pos_id, statut, demandeur_id) VALUES
(1, 'REQ-0001', 'APPROVISIONNEMENT_SIM', 'Rupture de stock SIM', 'Le POS Akwa Liberte n a plus de SIM CAMTEL en stock.', 1, 101, 'OUVERTE', 2);
 
-- 12. AUDIT_LOGS
INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details) VALUES
(1, 'CREATE', 'POS', 101, 'Creation du POS Akwa Liberte'),
(1, 'UPDATE', 'POS', 102, 'Reconduction du POS Bonanjo Central'),
(1, 'CREATE', 'PARTENAIRE', 2, 'Creation du partenaire reel Master Color'),
(1, 'CREATE', 'PARTENAIRE', 3, 'Creation du partenaire reel Glothelo (structure prete, en attente de donnees)');
 
