import React from 'react';
import FileDropZone from '../../components/Import/FileDropZone';
import importService from '../../services/importService';
import { IMPORT_ENTITY_TYPES } from '../../utils/constants';

/**
 * Étapes 1 à 3 du workflow A3 :
 *   1. Téléchargement du gabarit Excel officiel.
 *   2. Sélection du type d'entité.
 *   3. Dépôt du fichier & Validation.
 */
const ImportSetupStep = ({ entityType, setEntityType, file, setFile, onValidate, validating }) => (
  <div className="space-y-6">
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-base font-semibold text-slate-900">Type d'entité à importer</h2>
      <p className="mt-1 text-sm text-slate-500">
        L'import Excel en masse remplace les CRUDs référentiels autonomes pour le
        partenaire actif.
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {IMPORT_ENTITY_TYPES.map((type) => (
          <button
            key={type.value}
            type="button"
            onClick={() => setEntityType(type.value)}
            className={`rounded-lg border px-4 py-3 text-left text-sm font-medium transition-colors ${
              entityType === type.value
                ? 'border-indigo-500 bg-indigo-50 text-indigo-900 ring-1 ring-indigo-400'
                : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300'
            }`}
          >
            {type.label}
          </button>
        ))}
      </div>
      <div className="mt-4">
        <a
          href={importService.getTemplateUrl(entityType)}
          download
          className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-800"
        >
          ⬇️ Télécharger le gabarit Excel officiel ({entityType})
        </a>
      </div>
    </section>

    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-base font-semibold text-slate-900">3. Déposez votre fichier</h2>
      <p className="mt-1 text-sm text-slate-500">
        Glissez-déposez votre fichier Excel ou CSV, puis lancez la validation pour vérifier le contenu.
      </p>
      <div className="mt-4">
        <FileDropZone value={file} onChange={setFile} />
      </div>
      <div className="mt-4 flex justify-end">
        <button
          type="button"
          onClick={onValidate}
          disabled={!file || validating}
          className="rounded-md bg-indigo-600 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {validating ? 'Validation…' : 'Valider le fichier'}
        </button>
      </div>
    </section>
  </div>
);

export default ImportSetupStep;