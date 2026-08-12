 CREATE VIEW IF NOT EXISTS v_bts_historique AS
    SELECT b.code_bts, b.nom, r.date_releve, r.taux_saturation, r.rendement, r.charge_mesuree
    FROM bts b
    JOIN bts_releves r ON r.bts_id = b.id
    ORDER BY b.code_bts, r.date_releve;