import React from 'react';

const COLOR_CLASSES = {
  success: 'badge-success',
  warning: 'badge-warning',
  danger: 'badge-danger',
  info: 'badge-info',
  brand: 'badge-indigo',
  neutral: 'badge-gray',
  sky: 'badge-sky',
};

/**
 * Statuts métier POSTrack → couleur sémantique.
 * Les clés sont normalisées (minuscules, sans accents, espaces → _).
 */
const STATUS_COLORS = {
  actif: 'success',
  active: 'success',
  linked: 'success',
  lie: 'success',
  liee: 'success',
  valide: 'success',
  validee: 'success',
  approuve: 'success',
  paye: 'success',
  termine: 'success',
  terminee: 'success',
  reconduit: 'brand',
  nouveau: 'info',
  ouvert: 'info',
  open: 'info',
  en_cours: 'info',
  renouvellement: 'info',
  en_attente: 'warning',
  attente: 'warning',
  pending: 'warning',
  maintenance: 'warning',
  suspendu: 'warning',
  delinke: 'warning',
  delinked: 'warning',
  a_reconduire: 'warning',
  inactif: 'danger',
  inactive: 'danger',
  rejete: 'danger',
  saturee: 'danger',
  sature: 'danger',
  hors_service: 'danger',
  horsservice: 'danger',
  bloque: 'danger',
  ferme: 'neutral',
  closed: 'neutral',
  cloture: 'neutral',
  annule: 'neutral',
};

const normalizeStatus = (value) =>
  String(value ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[\s-]+/g, '_');

/**
 * Pill de statut standardisée — remplace les spans inline ad hoc
 * dispersés dans les tableaux (Dashboard, PartnersList, BTSTable…).
 *
 * @param {Object}   props
 * @param {string}   [props.status]  Libellé (ex. 'actif', 'En attente')
 * @param {string}   [props.color]   'success'|'warning'|'danger'|'info'|'brand'|'neutral'|'sky'
 * @param {boolean}  [props.dot]     Affiche le point de statut (défaut true)
 * @param {string}   [props.size]    'sm' | undefined
 * @param {string}   [props.className]
 */
const StatusPill = ({ status = '', color = '', dot = true, size = '', className = '' }) => {
  const key = normalizeStatus(status);
  const resolved =
    COLOR_CLASSES[color] || COLOR_CLASSES[STATUS_COLORS[key]] || COLOR_CLASSES.neutral;
  const classes = ['badge', resolved, dot ? 'badge-dot' : '', size === 'sm' ? 'badge-sm' : '', className]
    .filter(Boolean)
    .join(' ');

  return <span className={classes}>{status ?? '—'}</span>;
};

export default StatusPill;
