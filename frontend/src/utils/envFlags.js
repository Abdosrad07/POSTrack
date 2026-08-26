/**
 * Interprétation robuste des drapeaux booléens Vite (import.meta.env).
 *
 * Les variables VITE_* sont toujours des chaînes : "false" est truthy.
 * Ce helper considère comme « activé » uniquement true, "true" et "1",
 * ce qui correspond à l'intent documenté dans frontend/.env
 * (ex. VITE_DISABLE_DEMO_BANNER=false => bandeaux démo affichés).
 */
export const envFlag = (value) => value === true || value === 'true' || value === '1';
