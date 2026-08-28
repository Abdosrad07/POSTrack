import React from 'react';

/**
 * Champ de formulaire standardisé — label + contrôle + aide/erreur.
 * Le contrôle est fourni via `children` ; ce wrapper gère l'accessibilité
 * (association label↔champ, role="alert" sur l'erreur) et les états.
 *
 * @param {Object} props
 * @param {string} [props.label]
 * @param {string} [props.htmlFor]   id du contrôle (requis avec label)
 * @param {boolean} [props.required]
 * @param {string} [props.error]
 * @param {string} [props.help]
 * @param {import('react').ReactNode} [props.children]
 * @param {string} [props.className]
 */
const FormField = ({
  label = /** @type {string} */ (undefined),
  htmlFor = /** @type {string} */ (undefined),
  required = false,
  error = /** @type {string} */ (undefined),
  help = /** @type {string} */ (undefined),
  children = /** @type {any} */ (undefined),
  className = '',
}) => (
  <div className={className}>
    {label ? (
      <label htmlFor={htmlFor} className="label">
        {label}
        {required && (
          <span className="ml-0.5 text-red-500" aria-hidden="true">
            *
          </span>
        )}
      </label>
    ) : null}
    {children}
    {error ? (
      <p className="field-error" role="alert">
        {error}
      </p>
    ) : help ? (
      <p className="field-help">{help}</p>
    ) : null}
  </div>
);

export default FormField;
