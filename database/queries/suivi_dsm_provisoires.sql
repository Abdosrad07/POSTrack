-- Combien de POS, par partenaire, attendent encore un vrai DSM ?
-- À relancer chaque semaine jusqu'à confirmation complète des DSM Master Color / Glothelo.
SELECT pa.nom AS partenaire, COUNT(*) AS pos_dsm_provisoire
FROM pos p
JOIN partenaires pa ON p.partenaire_id = pa.id
JOIN dsm d ON p.dsm_id = d.id
WHERE d.est_provisoire = 1
GROUP BY pa.nom;