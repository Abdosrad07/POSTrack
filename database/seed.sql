PRAGMA foreign_keys = ON;
 
-- 1. USERS
INSERT INTO users (id, email, password_hash, nom_complet, role, actif) VALUES
(1, 'admin@postrack.cm', 'hash_admin_123', 'Amina Ngono (Admin)', 'ADMIN', 1),
(2, 'manager@postrack.cm', 'hash_manager_123', 'Patrick Moukoko (Manager)', 'MANAGER', 1),
(3, 'dsm.douala@postrack.cm', 'hash_dsm_123', 'Jean Marc (DSM Douala)', 'DSM', 1),
(4, 'dsm.bafoussam@postrack.cm', 'hash_dsm_456', 'Clarisse Fokou (DSM Ouest)', 'DSM', 1),
(5, 'viewer@postrack.cm', 'hash_viewer_123', 'Lucien Biloa (Lecture)', 'VIEWER', 1);
 
-- 2. PARTENAIRES
-- Master Color et Glothelo sont deux vrais partenaires (pas des provisoires) :
-- on connait leur identité, seuls certains de leurs DSM restent à confirmer.
-- Glothelo n'a pas encore de fichier de données : la ligne existe déjà,
-- prête à recevoir des POS dès que le fichier arrivera.
INSERT INTO partenaires (id, code_partenaire, nom, type_partenaire, ville, statut, est_provisoire) VALUES
(1, 'PART-001', 'Camtel Express', 'DISTRIBUTEUR', 'Douala', 'ACTIF', 0),
(2, 'PART-MC', 'Master Color', 'DISTRIBUTEUR', 'Douala', 'ACTIF', 0),
(3, 'PART-GL', 'Glothelo', 'DISTRIBUTEUR', 'Yaounde', 'ACTIF', 0),
(4, 'PART-OM', 'Orange Market', 'MASTER_DEALER', 'Bafoussam', 'ACTIF', 0);

INSERT INTO partenaires (id, code_partenaire, nom, type_partenaire, ville, statut, est_provisoire) VALUES
(5, 'PART-NTL', 'Nexttel Network', 'REVENDEUR', 'Yaounde', 'ACTIF', 0),
(6, 'PART-MTN', 'MTN Business', 'DISTRIBUTEUR', 'Yaounde', 'ACTIF', 0);
 
-- 3. DSM (un réel de démo + les provisoires Master Color, un par numéro de téléphone distinct)
INSERT INTO dsm (id, matricule, nom_complet, zone_couverture, telephone, statut, est_provisoire) VALUES
(1, 'DSM-DLA-01', 'Jean Marc', 'Douala Akwa - Bonanjo', '699112233', 'ACTIF', 0),
(2, 'DSM-DLA-02', 'Clarence Njie', 'Douala New-Bell - Bepanda', '677445566', 'ACTIF', 0),
(3, 'DSM-TEMP-622493002', 'DSM à identifier (import Master Color)', NULL, '622493002', 'ACTIF', 1),
(4, 'DSM-TEMP-622095909', 'DSM à identifier (import Master Color)', NULL, '622095909', 'ACTIF', 1),
(5, 'DSM-OUEST-01', 'Sylvie Tchatchou', 'Bafoussam Centre', '675998811', 'ACTIF', 0);

INSERT INTO dsm (id, matricule, nom_complet, zone_couverture, telephone, statut, est_provisoire) VALUES
(6, 'DSM-LIT-01', 'Armel Ebelle', 'Littoral Nord', '676112244', 'ACTIF', 0),
(7, 'DSM-SUD-01', 'Nadine Mballa', 'Centre Sud', '677221144', 'ACTIF', 0),
(8, 'DSM-OUEST-02', 'Roger Mvogo', 'Bafoussam Peripherie', '679445588', 'ACTIF', 0);
 
-- 4. POS — démo standard (couvre NOUVEAU + RECONDUIT)
INSERT INTO pos (id, code_pos, nom, categorie_pos, type_pos, statut, ville, partenaire_id, dsm_id, date_creation) VALUES
(101, 'POS-DEMO-0001', 'Kiosque Akwa Liberte', 'KIOSQUE', 'NOUVEAU', 'ACTIF', 'Douala', 1, 1, date('now')),
(102, 'POS-DEMO-0002', 'Boutique Bonanjo Central', 'BOUTIQUE', 'NOUVEAU', 'ACTIF', 'Douala', 1, 1, date('now')),
(103, 'POS-DEMO-0003', 'Mini Market Bepanda', 'MINI_MARKET', 'NOUVEAU', 'ACTIF', 'Douala', 1, 2, date('now')),
(104, 'POS-DEMO-0004', 'Stand Deido Carrefour', 'STAND', 'NOUVEAU', 'SUSPENDU', 'Douala', 1, 2, date('now'));

INSERT INTO pos (id, code_pos, nom, categorie_pos, type_pos, statut, ville, region, quartier, partenaire_id, dsm_id, date_creation) VALUES
(105, 'POS-DEMO-0005', 'Pharmacie Bessengue', 'PHARMACIE', 'NOUVEAU', 'ACTIF', 'Douala', 'Littoral', 'Bessengue', 1, 6, date('now')),
(106, 'POS-DEMO-0006', 'Station Total Makepe', 'STATION_SERVICE', 'NOUVEAU', 'ACTIF', 'Douala', 'Littoral', 'Makepe', 1, 6, date('now')),
(107, 'POS-DEMO-0007', 'Agence Bafoussam Centre', 'AGENCE', 'NOUVEAU', 'ACTIF', 'Bafoussam', 'Ouest', 'Centre Ville', 4, 5, date('now')),
(108, 'POS-DEMO-0008', 'Cyber Melen', 'CYBER', 'NOUVEAU', 'ACTIF', 'Yaounde', 'Centre', 'Melen', 6, 7, date('now')),
(109, 'POS-DEMO-0009', 'Boutique Elig-Essono', 'BOUTIQUE', 'NOUVEAU', 'ACTIF', 'Yaounde', 'Centre', 'Elig-Essono', 5, 7, date('now')),
(110, 'POS-DEMO-0010', 'Kiosque Bonamoussadi', 'KIOSQUE', 'NOUVEAU', 'ACTIF', 'Douala', 'Littoral', 'Bonamoussadi', 2, 2, date('now'));
 
-- 4bis. POS — echantillon reel Master Color (partenaire = 2, PART-MC)
INSERT INTO pos (id, code_pos, nom, quartier, lieu_dit, contact_secondaire, montant_initial, notes, partenaire_id, dsm_id, date_creation) VALUES
(201, 'POS-MC-000001', 'ALI - NEWBELL', 'NEWBELL', 'CASINO', '674135510', 10000.00, 'RAS', 2, 2, '2026-06-01'),
(202, 'POS-MC-000002', 'KAMGA - NEWBELL', 'NEWBELL', 'GANGUE CARREFOUR SENEGALAISE', '676845050', 10000.00, 'RAS', 2, 2, '2026-06-01'),
(205, 'POS-MC-000005', 'MBOA - NDOKOTI', 'NDOKOTI', 'ENTREE QUARTIER', '673221144', 15000.00, 'Fort trafic clients', 2, 3, '2026-07-15');
 
INSERT INTO pos (id, code_pos, nom, quartier, lieu_dit, numero_pos, contact_secondaire, montant_initial, notes, partenaire_id, dsm_id, date_creation) VALUES
(203, 'POS-MC-000003', 'YOUSSOUF - NEWBELL', 'NEWBELL', 'MOSQUEE KDD EN ALLANT VERS MONKAM', '622486897', '656361885', 10000.00, 'RAS', 2, 3, '2026-07-01'),
(204, 'POS-MC-000004', 'IDELETTE - NEWBELL', 'NEWBELL', 'CERCLE MUNICIPAL MONKAM MOSQUEE', '622486896', '696632492', 5000.00, 'RAS', 2, 3, '2026-07-01'),
(206, 'POS-MC-000006', 'SANDRA - BONAPRISO', 'BONAPRISO', 'VERS ECOLE PRIMAIRE', '622487777', '656363636', 20000.00, 'Nouvelle ouverture', 2, 4, '2026-07-20');

INSERT INTO pos (id, code_pos, nom, quartier, lieu_dit, numero_pos, contact_secondaire, montant_initial, notes, partenaire_id, dsm_id, date_creation) VALUES
(207, 'POS-MC-000007', 'NATHALIE - NEWTOWN', 'NEWTOWN', 'CARREFOUR KONDENGUI', '622488888', '656364646', 12000.00, 'Flux moyen, bon potentiel SIM', 2, 4, '2026-07-22'),
(208, 'POS-MC-000008', 'EMMANUEL - AKWA', 'AKWA', 'FACE ANCIEN PORT', '622489999', '656365656', 18000.00, 'Zone tres frequentee', 2, 3, '2026-07-23'),
(209, 'POS-MC-000009', 'CELINE - BONABERI', 'BONABERI', 'ENTREE FACULTE', '622481111', '656366666', 8000.00, 'Petit stock de depart', 3, 1, '2026-07-24'),
(210, 'POS-MC-000010', 'HERVE - DEIDO', 'DEIDO', 'VERS MARCHE', '622482222', '656367676', 9000.00, 'A suivre dans 30 jours', 4, 5, '2026-07-25');
 
-- 5. RECONDUCTIONS — on reconduit le POS 102 pour tester le trigger
INSERT INTO reconductions (id, pos_id, date_reconduction, ancienne_date_expiration, nouvelle_date_expiration, motif) VALUES
(1, 102, '2026-01-01', '2025-12-31', '2026-12-31', 'Renouvellement annuel effectue avec succes'),
(2, 201, '2026-07-01', '2026-06-30', '2027-06-30', 'Renouvellement apres bon historique de ventes');
 
-- 6. PRIMES — les 3 statuts representes, jamais sur un POS reconduit
INSERT INTO primes (id, pos_id, statut, montant, date_attribution) VALUES
(1, 101, 'EN_ATTENTE', 25000.00, date('now')),
(2, 201, 'VALIDEE', 25000.00, date('now')),
(3, 203, 'PAYEE', 25000.00, date('now')),
(4, 205, 'REJETEE', 18000.00, date('now'));
 
-- 7. CLIENTS
INSERT INTO clients (id, code_client, nom_complet, telephone, pos_id, date_enregistrement) VALUES
(1, 'CLI-0001', 'Paul Etoundi', '677123456', 101, date('now')),
(2, 'CLI-0002', 'Mireille Tamba', '679998877', 103, date('now')),
(3, 'CLI-0003', 'Fabrice Mvondo', '655443322', 201, date('now'));
 
-- 8. BTS
INSERT INTO bts (id, code_bts, nom, partenaire_id, operateur, capacite_max) VALUES
(1, 'BTS-DLA-01', 'Antenne Akwa', 1, 'CAMTEL', 1000),
(2, 'BTS-DLA-02', 'Antenne Bonanjo', 1, 'CAMTEL', 1200),
(3, 'BTS-BFO-01', 'Antenne Centre Ville', 4, 'ORANGE', 900);
 
-- 9. BTS_RELEVES
INSERT INTO bts_releves (bts_id, date_releve, charge_mesuree, taux_saturation, rendement) VALUES
(1, '2026-08-01T08:00:00', 400, 40.0, 92.5),
(1, '2026-08-05T08:00:00', 650, 65.0, 89.0),
(1, '2026-08-10T08:00:00', 820, 82.0, 85.0),
(2, '2026-08-10T08:15:00', 540, 45.0, 93.2),
(3, '2026-08-12T09:00:00', 760, 84.4, 81.7);
 
-- 10. SIMS
INSERT INTO sims (iccid, operateur, statut, pos_id, client_id) VALUES
('89237010000000000001', 'CAMTEL', 'EN_STOCK', 101, NULL),
('89237010000000000002', 'CAMTEL', 'VENDUE', 101, 1),
('89237010000000000003', 'CAMTEL', 'ACTIVEE', 101, 1),
('89237010000000000004', 'CAMTEL', 'DEFECTUEUSE', 102, NULL),
('89237010000000000005', 'CAMTEL', 'RETOURNEE', 102, NULL),
('89237010000000000006', 'ORANGE', 'EN_STOCK', 103, NULL),
('89237010000000000007', 'ORANGE', 'VENDUE', 103, 2),
('89237010000000000008', 'NEXTTEL', 'ACTIVEE', 201, 3);
 
-- 11. REQUETES
INSERT INTO requetes (id, code_requete, type_requete, objet, description, partenaire_id, pos_id, statut, demandeur_id) VALUES
(1, 'REQ-0001', 'APPROVISIONNEMENT_SIM', 'Rupture de stock SIM', 'Le POS Akwa Liberte n a plus de SIM CAMTEL en stock.', 1, 101, 'OUVERTE', 2),
(2, 'REQ-0002', 'MAINTENANCE_BTS', 'Saturation BTS Bonanjo', 'Le taux de saturation a depasse 80% sur plusieurs releves.', 1, NULL, 'EN_COURS', 3),
(3, 'REQ-0003', 'RECLAMATION_CLIENT', 'Client non active apres achat', 'Le client signale une SIM vendue mais non activee.', 2, 103, 'RESOLUE', 3),
(4, 'REQ-0004', 'SUPPORT_POS', 'Probleme de couverture POS', 'Le POS de Bonapriso signale une baisse de couverture reseau.', 2, 206, 'OUVERTE', 4);

INSERT INTO requetes (id, code_requete, type_requete, objet, description, statut, priorite, partenaire_id, pos_id, bts_id, client_id, demandeur_id, assigne_a) VALUES
(5, 'REQ-0005', 'APPROVISIONNEMENT_SIM', 'Besoin urgent de 50 SIM', 'Le POS de Bonamoussadi demande un réassort avant le week-end.', 'EN_COURS', 'HAUTE', 2, 110, NULL, NULL, 2, 1),
(6, 'REQ-0006', 'MAINTENANCE_BTS', 'Baisse de rendement à Bafoussam', 'Le BTS BFO-01 dépasse régulièrement 80% de saturation.', 'OUVERTE', 'URGENTE', 4, NULL, 3, NULL, 3, 2),
(7, 'REQ-0007', 'RECLAMATION_CLIENT', 'SIM vendue mais non activée', 'Le client du POS Melen attend son activation depuis 24h.', 'EN_COURS', 'NORMALE', 5, 108, NULL, 2, 4, 1),
(8, 'REQ-0008', 'SUPPORT_POS', 'Support caisse et saisie', 'Le POS de Bessengue signale un problème de saisie des ventes.', 'OUVERTE', 'BASSE', 1, 105, NULL, NULL, 2, 2);
 
-- 12. AUDIT_LOGS
INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details) VALUES
(1, 'CREATE', 'POS', 101, 'Creation du POS Akwa Liberte'),
(1, 'UPDATE', 'POS', 102, 'Reconduction du POS Bonanjo Central'),
(1, 'CREATE', 'PARTENAIRE', 2, 'Creation du partenaire reel Master Color'),
(1, 'CREATE', 'PARTENAIRE', 3, 'Creation du partenaire reel Glothelo (structure prete, en attente de donnees)'),
(2, 'CREATE', 'BTS', 2, 'Ajout de l antenne Bonanjo'),
(3, 'CREATE', 'SIM', 7, 'SIM vendue au POS Bepanda'),
(4, 'UPDATE', 'REQUETE', 2, 'Prise en charge de la saturation BTS Bonanjo');
 
