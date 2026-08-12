-- Vue : POS avec partenaire et DSM déjà résolus
CREATE VIEW IF NOT EXISTS v_pos_detail AS
SELECT
    p.id, p.code_pos, p.nom, p.categorie_pos, p.type_pos, p.statut,
    p.quartier, p.lieu_dit, p.montant_initial,
    pa.id AS partenaire_id, pa.nom AS partenaire_nom,
    d.id AS dsm_id, d.nom_complet AS dsm_nom, d.est_provisoire AS dsm_provisoire
FROM pos p
JOIN partenaires pa ON p.partenaire_id = pa.id
JOIN dsm d ON p.dsm_id = d.id;

-- Vue : charge de travail de chaque DSM
CREATE VIEW IF NOT EXISTS v_dsm_charge AS
SELECT d.id, d.matricule, d.nom_complet, COUNT(p.id) AS nb_pos
FROM dsm d
LEFT JOIN pos p ON p.dsm_id = d.id
GROUP BY d.id;