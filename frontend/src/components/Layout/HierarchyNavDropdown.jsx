import React, { useState, useEffect, useRef, useMemo, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { PartnerContext } from '../../context/PartnerContext';
import { hierarchyService } from '../../services/hierarchyService';
import { ROLES, ROLE_LABELS } from '../../utils/constants';
import { normalizeRole } from '../../utils/roles';

/**
 * Composant de navigation hiérarchique déroulant (Partenaire → DSM → POS → BTS).
 * Affiché sous forme de liste déroulante plate, groupée par partenaire, pour rester
 * lisible et utilisable sur toutes les tailles d'écran (pas d'arborescence imbriquée
 * à déplier/replier).
 *
 * Respecte strictement la portée d'accès (AccessScope) de l'utilisateur connecté :
 * - ADMIN : Accès à tous les partenaires et leurs DSM, BTS, POS
 * - REPRÉSENTANT PARTENAIRE : Accès uniquement aux DSM, POS, BTS de son entreprise
 * - REPRÉSENTANT DSM : Accès uniquement aux POS de son DSM
 * - REPRÉSENTANT POS : Accès uniquement à son POS
 */

/** Petite étiquette de type (remplace les icônes/émojis par un badge textuel compact). */
const TypeTag = ({ children, className = '' }) => (
  <span
    className={`inline-flex h-4 min-w-4 shrink-0 items-center justify-center rounded px-1 text-[9px] font-bold leading-none ${className}`}
  >
    {children}
  </span>
);

const ChevronDownIcon = ({ className = '' }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

const SearchIcon = ({ className = '' }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const HierarchyNavDropdown = () => {
  const auth = useAuth() || {};
  const user = auth.user;
  const partnerCtx = useContext(PartnerContext);
  const partner = partnerCtx?.partner || null;
  const setPartner = partnerCtx?.setPartner || (() => {});
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState([]);
  const [search, setSearch] = useState('');

  const dropdownRef = useRef(null);

  const role = normalizeRole(user?.role);

  // Détermine le libellé du rôle et du périmètre
  const scopeBadge = useMemo(() => {
    if (role === ROLES.ADMIN) {
      return {
        label: 'Accès Global',
        roleText: 'Administrateur',
        bg: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      };
    }
    if (role === ROLES.REPRESENTANT_PARTENAIRE) {
      return {
        label: partner?.nom || 'Périmètre Entreprise',
        roleText: 'Représentant Partenaire',
        bg: 'bg-sky-100 text-sky-800 border-sky-200',
      };
    }
    if (role === ROLES.REPRESENTANT_DSM) {
      return {
        label: 'Périmètre DSM',
        roleText: 'Représentant DSM',
        bg: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      };
    }
    if (role === ROLES.DETENTEUR_POS) {
      return {
        label: 'Mon POS',
        roleText: 'Détenteur POS',
        bg: 'bg-amber-100 text-amber-800 border-amber-200',
      };
    }
    return {
      label: ROLE_LABELS[role] || 'Utilisateur',
      roleText: ROLE_LABELS[role] || 'Utilisateur',
      bg: 'bg-slate-100 text-slate-800 border-slate-200',
    };
  }, [role, partner]);

  // Chargement des données hiérarchiques
  const loadHierarchy = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await hierarchyService.getHierarchy();
      setData(result || []);
    } catch (err) {
      setError(err.response?.data?.detail || 'Erreur lors du chargement de la hiérarchie');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadHierarchy();
    }
  }, [isOpen]);

  // Fermer le menu lors d'un clic extérieur
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Filtrage selon la recherche
  const filteredData = useMemo(() => {
    if (!search.trim()) return data;
    const q = search.toLowerCase().trim();

    return data
      .map((part) => {
        const matchPart =
          part.nom?.toLowerCase().includes(q) ||
          part.code_partenaire?.toLowerCase().includes(q) ||
          part.ville?.toLowerCase().includes(q);

        const matchingBTS = (part.bts || []).filter(
          (b) =>
            b.nom?.toLowerCase().includes(q) ||
            b.code_bts?.toLowerCase().includes(q) ||
            b.ville?.toLowerCase().includes(q)
        );

        const matchingDSMs = (part.dsms || [])
          .map((dsm) => {
            const matchDSM =
              dsm.nom?.toLowerCase().includes(q) ||
              dsm.matricule?.toLowerCase().includes(q) ||
              dsm.zone_couverture?.toLowerCase().includes(q);

            const matchingPOS = (dsm.pos || []).filter(
              (p) =>
                p.nom?.toLowerCase().includes(q) ||
                p.code_pos?.toLowerCase().includes(q) ||
                p.ville?.toLowerCase().includes(q)
            );

            if (matchDSM || matchingPOS.length > 0) {
              return {
                ...dsm,
                pos: matchDSM ? dsm.pos : matchingPOS,
              };
            }
            return null;
          })
          .filter(Boolean);

        if (matchPart || matchingBTS.length > 0 || matchingDSMs.length > 0) {
          return {
            ...part,
            dsms: matchPart ? part.dsms : matchingDSMs,
            bts: matchPart ? part.bts : matchingBTS,
          };
        }
        return null;
      })
      .filter(Boolean);
  }, [data, search]);

  const handleSelectPartner = (part, e) => {
    e?.stopPropagation();
    setPartner({
      id: part.id,
      nom: part.nom,
      code_partenaire: part.code_partenaire,
      ville: part.ville,
      region: part.region,
    });
    setIsOpen(false);
    navigate('/');
  };

  const handleNavigateToPOS = (posId, part, e) => {
    e?.stopPropagation();
    if (part && (!partner || partner.id !== part.id)) {
      setPartner({
        id: part.id,
        nom: part.nom,
        code_partenaire: part.code_partenaire,
        ville: part.ville,
        region: part.region,
      });
    }
    setIsOpen(false);
    navigate(`/pos/${posId}`);
  };

  const handleNavigateToDSM = (dsmId, part, e) => {
    e?.stopPropagation();
    if (part && (!partner || partner.id !== part.id)) {
      setPartner({
        id: part.id,
        nom: part.nom,
        code_partenaire: part.code_partenaire,
        ville: part.ville,
        region: part.region,
      });
    }
    setIsOpen(false);
    navigate(`/dsm/${dsmId}`);
  };

  const handleNavigateToBTS = (btsId, part, e) => {
    e?.stopPropagation();
    if (part && (!partner || partner.id !== part.id)) {
      setPartner({
        id: part.id,
        nom: part.nom,
        code_partenaire: part.code_partenaire,
        ville: part.ville,
        region: part.region,
      });
    }
    setIsOpen(false);
    navigate(`/bts/${btsId}`);
  };

  // Compteurs globaux
  const stats = useMemo(() => {
    let nbPart = data.length;
    let nbDSM = 0;
    let nbPOS = 0;
    let nbBTS = 0;
    data.forEach((p) => {
      nbBTS += (p.bts || []).length;
      (p.dsms || []).forEach((d) => {
        nbDSM += 1;
        nbPOS += (d.pos || []).length;
      });
    });
    return { nbPart, nbDSM, nbPOS, nbBTS };
  }, [data]);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Bouton d'ouverture de la liste déroulante */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs sm:text-sm font-medium text-slate-700 shadow-sm hover:border-sky-300 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-colors"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        title="Navigation hiérarchique selon vos permissions"
      >
        <span className="hidden sm:inline font-semibold text-slate-800">Hiérarchie</span>
        <span
          className={`inline-flex items-center rounded px-2 py-0.5 text-[11px] font-semibold border ${scopeBadge.bg}`}
        >
          {scopeBadge.label}
        </span>
        <ChevronDownIcon className={`h-4 w-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Liste déroulante hiérarchique */}
      {isOpen && (
        <div className="fixed inset-x-3 top-16 z-50 rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150 sm:absolute sm:inset-x-auto sm:left-auto sm:right-0 sm:top-full sm:mt-2 sm:w-[420px]">
          {/* En-tête */}
          <div className="border-b border-slate-100 bg-slate-50/80 px-4 py-3">
            <h3 className="text-sm font-bold text-slate-900 leading-tight">Navigation Réseau</h3>
            <p className="text-[11px] text-slate-500">Partenaire → DSM → POS (+ BTS)</p>

            {/* Barre de recherche instantanée */}
            <div className="mt-2.5 relative">
              <input
                type="text"
                placeholder="Filtrer (nom, code, ville...)"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 pl-8 text-xs text-slate-800 placeholder-slate-400 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
              <SearchIcon className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-2.5 top-1.5 text-slate-400 hover:text-slate-600 text-xs"
                  aria-label="Effacer la recherche"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Badges de comptage */}
            {!loading && !error && (
              <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500">
                <span className="rounded bg-slate-200/70 px-1.5 py-0.5 font-medium text-slate-700">
                  {stats.nbPart} {stats.nbPart > 1 ? 'Partenaires' : 'Partenaire'}
                </span>
                <span className="rounded bg-slate-200/70 px-1.5 py-0.5 font-medium text-slate-700">
                  {stats.nbDSM} DSM
                </span>
                <span className="rounded bg-slate-200/70 px-1.5 py-0.5 font-medium text-slate-700">
                  {stats.nbPOS} POS
                </span>
                {stats.nbBTS > 0 && (
                  <span className="rounded bg-slate-200/70 px-1.5 py-0.5 font-medium text-slate-700">
                    {stats.nbBTS} BTS
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Liste plate, groupée par partenaire */}
          <div className="max-h-[60vh] overflow-y-auto p-2 space-y-3 sm:max-h-[420px]">
            {loading ? (
              <div className="py-8 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-sky-600 border-t-transparent"></div>
                Chargement de la hiérarchie...
              </div>
            ) : error ? (
              <div className="rounded-lg bg-red-50 p-3 text-xs text-red-700">{error}</div>
            ) : filteredData.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400">
                {search ? 'Aucun résultat pour cette recherche.' : 'Aucun élément accessible.'}
              </div>
            ) : (
              filteredData.map((part) => {
                const isCurrentPartner = partner?.id === part.id;
                const dsms = part.dsms || [];
                const bts = part.bts || [];

                return (
                  <div
                    key={`part-${part.id}`}
                    className={`rounded-xl border ${
                      isCurrentPartner ? 'border-sky-300 bg-sky-50/40' : 'border-slate-200 bg-white'
                    }`}
                  >
                    {/* En-tête Partenaire */}
                    <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-slate-100">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-900 text-xs sm:text-sm truncate">{part.nom}</span>
                          <span className="rounded bg-slate-100 px-1.5 py-0.2 text-[10px] font-mono text-slate-600 border border-slate-200">
                            {part.code_partenaire}
                          </span>
                        </div>
                        {part.ville && <span className="text-[11px] text-slate-500">{part.ville}</span>}
                      </div>
                      {isCurrentPartner ? (
                        <span className="shrink-0 rounded-full bg-sky-600 px-2 py-0.5 text-[10px] font-semibold text-white">
                          Actif
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => handleSelectPartner(part, e)}
                          className="shrink-0 rounded-md border border-sky-200 bg-white px-2 py-0.5 text-[11px] font-medium text-sky-700 hover:bg-sky-50 transition shadow-2xs"
                          title="Définir comme contexte actif"
                        >
                          Sélectionner
                        </button>
                      )}
                    </div>

                    {/* Liste plate des DSM / POS / BTS rattachés */}
                    {dsms.length === 0 && bts.length === 0 ? (
                      <p className="text-[11px] text-slate-400 italic px-3 py-2">
                        Aucun élément assigné à ce partenaire.
                      </p>
                    ) : (
                      <ul className="divide-y divide-slate-50">
                        {dsms.map((dsm) => (
                          <React.Fragment key={`dsm-${part.id}-${dsm.id}`}>
                            <li
                              onClick={(e) => handleNavigateToDSM(dsm.id, part, e)}
                              className="group flex items-center justify-between gap-2 px-3 py-1.5 cursor-pointer hover:bg-slate-50 transition"
                            >
                              <div className="flex min-w-0 items-center gap-1.5">
                                <TypeTag className="bg-emerald-100 text-emerald-700">D</TypeTag>
                                <span className="truncate text-xs font-medium text-slate-800">{dsm.nom}</span>
                                <span className="shrink-0 text-[10px] text-slate-400 font-mono">[{dsm.matricule}]</span>
                              </div>
                              <span className="shrink-0 text-[10px] text-slate-400 group-hover:text-sky-600">
                                {(dsm.pos || []).length} POS
                              </span>
                            </li>
                            {(dsm.pos || []).map((p) => (
                              <li
                                key={`pos-${p.id}`}
                                onClick={(e) => handleNavigateToPOS(p.id, part, e)}
                                className="group flex items-center justify-between gap-2 py-1.5 pl-8 pr-3 cursor-pointer hover:bg-slate-50 transition"
                              >
                                <div className="flex min-w-0 items-center gap-1.5">
                                  <TypeTag className="bg-indigo-100 text-indigo-700">P</TypeTag>
                                  <span className="truncate text-xs text-slate-700 group-hover:text-sky-600">{p.nom}</span>
                                  <span className="shrink-0 text-[10px] text-slate-400 font-mono">{p.code_pos}</span>
                                  {p.type_pos && (
                                    <span
                                      className={`shrink-0 rounded px-1 text-[9px] font-semibold ${
                                        p.type_pos === 'NOUVEAU'
                                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                          : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                                      }`}
                                    >
                                      {p.type_pos}
                                    </span>
                                  )}
                                </div>
                              </li>
                            ))}
                          </React.Fragment>
                        ))}
                        {bts.map((b) => (
                          <li
                            key={`bts-${b.id}`}
                            onClick={(e) => handleNavigateToBTS(b.id, part, e)}
                            className="group flex items-center justify-between gap-2 px-3 py-1.5 cursor-pointer hover:bg-slate-50 transition"
                          >
                            <div className="flex min-w-0 items-center gap-1.5">
                              <TypeTag className="bg-amber-100 text-amber-700">B</TypeTag>
                              <span className="truncate text-xs font-medium text-slate-800">{b.nom}</span>
                              <span className="shrink-0 text-[10px] text-slate-400 font-mono">({b.code_bts})</span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer d'information du scope */}
          <div className="border-t border-slate-100 bg-slate-50 px-4 py-2 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Rôle : <strong className="text-slate-700">{scopeBadge.roleText}</strong></span>
            <span className="text-slate-400">POSTrack Hierarchy Scope v3.1</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default HierarchyNavDropdown;
