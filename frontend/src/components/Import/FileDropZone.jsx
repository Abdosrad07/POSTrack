import React, { useRef, useState } from 'react';
import { IMPORT_FILE_ACCEPT } from '../../utils/constants';

const ALLOWED_EXTENSIONS = ['xlsx', 'xls', 'csv'];

/** Vérifie qu'un fichier est un format Excel/CSV accepté. */
export function isAcceptedFile(file, accept = IMPORT_FILE_ACCEPT) {
  if (!file) return false;
  const accepted = accept.split(',').map((part) => part.trim().toLowerCase()).filter(Boolean);
  if (!accepted.length) return true;
  return accepted.some((pattern) => {
    if (pattern.startsWith('.')) {
      const ext = file.name.split('.').pop()?.toLowerCase();
      return `.${ext}` === pattern;
    }
    return false;
  });
}

export { ALLOWED_EXTENSIONS };

/**
 * Zone de dépôt de fichier (Module A3 — étape 3).
 * @param {File|null} value
 * @param {(file: File|null) => void} onChange
 */
const FileDropZone = ({ value, onChange, accept = IMPORT_FILE_ACCEPT, disabled = false }) => {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState(null);

  const handleFile = (file) => {
    setError(null);
    if (!file) return;
    if (!isAcceptedFile(file, accept)) {
      setError('Format non supporté. Utilisez un fichier .xlsx, .xls ou .csv.');
      return;
    }
    onChange(file);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragging(false);
    const file = event.dataTransfer?.files?.[0];
    if (file) handleFile(file);
  };

  const openPicker = () => {
    if (!disabled) inputRef.current?.click();
  };

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="Zone de dépôt du fichier Excel"
      data-testid="file-drop-zone"
      onClick={openPicker}
      onKeyDown={(e) => e.key === 'Enter' && openPicker()}
      onDragOver={(e) => {
        e.preventDefault();
        if (!disabled) setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      className={`rounded-xl border-2 border-dashed p-8 text-center transition-colors ${
        dragging ? 'border-indigo-500 bg-indigo-50' : 'border-slate-300 bg-slate-50'
      } ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:bg-slate-100'} `}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        data-testid="file-input"
        disabled={disabled}
        onChange={(e) => {
          handleFile(e.target.files?.[0]);
          e.target.value = '';
        }}
      />

      {value ? (
        <div>
          <p className="text-sm font-semibold text-slate-800">{value.name}</p>
          <p className="mt-1 text-xs text-slate-500">
            Fichier sélectionné — cliquez pour en choisir un autre.
          </p>
        </div>
      ) : (
        <div>
          <div className="mx-auto mb-3 text-3xl" aria-hidden="true">
            📄
          </div>
          <p className="text-sm font-medium text-slate-700">
            Glissez-déposez votre fichier ici, ou cliquez pour parcourir
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Formats acceptés : {accept.replaceAll(',', ', ')}
          </p>
        </div>
      )}

      {error ? <p className="mt-3 text-sm font-medium text-red-600">{error}</p> : null}
    </div>
  );
};

export default FileDropZone;