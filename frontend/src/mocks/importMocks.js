/**
 * Données mockées du Module A3 — Import Excel centralisé (ImportBatch).
 *
 * Ces fixtures permettent de tester et de démontrer le parcours
 * Valider → Prévisualiser → Appliquer tant que le Backend
 * (POST /api/partners/{id}/imports/validate & /apply) n'est pas disponible.
 */

const DEFAULT_COLUMNS = {
  POS: ['nom_pos', 'ville', 'dsm', 'type_pos'],
  CLIENT: ['nom', 'prenom', 'tel', 'pos'],
  DSM: ['matricule', 'nom', 'region'],
  BTS: ['code_bts', 'localisation', 'ville'],
  SIM: ['iccid', 'msisdn', 'statut'],
  PERFORMANCE: ['code_bts', 'date', 'charge', 'rendement'],
};

const DEFAULT_ROWS = [
  {
    row_number: 2,
    cells: { nom_pos: 'POS Kotto', ville: 'Douala', dsm: 'DSM-01', type_pos: 'NOUVEAU' },
    valid: true,
  },
  {
    row_number: 3,
    cells: { nom_pos: 'POS Bonapriso', ville: 'Douala', dsm: 'DSM-02', type_pos: 'NOUVEAU' },
    valid: true,
  },
  {
    row_number: 4,
    cells: { nom_pos: 'POS Akwa', ville: 'Douala', dsm: 'DSM-01', type_pos: 'RECONDUIT' },
    valid: true,
  },
  {
    row_number: 5,
    cells: { nom_pos: '', ville: 'Yaoundé', dsm: 'DSM-03', type_pos: 'N/A' },
    valid: false,
  },
];

const DEFAULT_ERRORS = [
  {
    row: 5,
    column: 'nom_pos',
    message: 'Le nom du POS est obligatoire.',
    severity: 'ERROR',
  },
  {
    row: 5,
    column: 'type_pos',
    message: 'Type inconnu (attendu NOUVEAU ou RECONDUIT).',
    severity: 'ERROR',
  },
];

const DEFAULT_WARNINGS = [
  {
    row: 6,
    column: 'ville',
    message: 'Ville manquante, valeur par défaut appliquée.',
    severity: 'WARNING',
  },
];

/**
 * Construit une fixture de lot validé (rapport de validation ImportBatch).
 * @param {string} entityType — POS, CLIENT, DSM, BTS, SIM, PERFORMANCE...
 * @param {string} [fileName]
 */
export function buildMockImportBatch(entityType = 'POS', fileName = 'import-exemple.xlsx') {
  const columns = DEFAULT_COLUMNS[entityType] || DEFAULT_COLUMNS.POS;
  const id = `BATCH-${entityType}-${Date.now()}`;

  const summary = {
    total_lines: DEFAULT_ROWS.length,
    created: 3,
    updated: 1,
    errors: DEFAULT_ERRORS.length,
    warnings: DEFAULT_WARNINGS.length,
    status: 'VALIDATED',
  };

  return {
    id,
    entity_type: entityType,
    status: 'VALIDATED',
    file_name: fileName,
    created_at: new Date().toISOString(),
    columns,
    rows: DEFAULT_ROWS,
    errors: DEFAULT_ERRORS,
    warnings: DEFAULT_WARNINGS,
    summary,
  };
}

/** Fixture statique réutilisable dans les tests de composants. */
export const mockImportBatch = buildMockImportBatch('POS', 'master-color-pos.xlsx');

export default { mockImportBatch, buildMockImportBatch };