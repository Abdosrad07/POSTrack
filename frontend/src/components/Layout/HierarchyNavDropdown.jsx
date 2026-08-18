import React, { useState, useEffect, useRef, useMemo, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { PartnerContext } from '../../context/PartnerContext';
import { hierarchyService } from '../../services/hierarchyService';
import { ROLES, ROLE_LABELS } from '../../utils/constants';
import { normalizeRole } from '../../utils/roles';

/**
 * Composant de navigation hiérarchique déroulant (Partenaire → DSM → POS → BTS).
 * Respecte strictement la portée d'accès (AccessScope) de l'utilisateur connecté :
 * - ADMIN : Accès à tous les partenaires et leurs DSM, BTS, POS
 * - REPRÉSENTANT PARTENAIRE : Accès uniquement aux DSM, POS, BTS de son entreprise
 * - REPRÉSENTANT DSM : Accès uniquement aux POS de son DSM
 * - REPRÉSENTANT POS : Accès uniquement à son POS
 */
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
  const [expandedNodes, setExpandedNodes] = useState({});

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

      // Déplier automatiquement tous les partenaires et DSMs au premier chargement
      const initialExpanded = {};
      (result || []).forEach((p) => {
        initialExpanded[`part-${p.id}`] = true;
        (p.dsms || []).forEach((d) => {
          initialExpanded[`dsm-${p.id}-${d.id}`] = true;
        });
        initialExpanded[`bts-group-${p.id}`] = false;
      });
      setExpandedNodes(initialExpanded);
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

  const toggleNode = (nodeKey, e) => {
    e?.stopPropagation();
    setExpandedNodes((prev) => ({
      ...prev,
      [nodeKey]: !prev[nodeKey],
    }));
  };

  const expandAll = () => {
    const all = {};
    data.forEach((p) => {
      all[`part-${p.id}`] = true;
      all[`bts-group-${p.id}`] = true;
      (p.dsms || []).forEach((d) => {
        all[`dsm-${p.id}-${d.id}`] = true;
      });
    });
    setExpandedNodes(all);
  };

  const collapseAll = () => {
    setExpandedNodes({});
  };

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
      {/* Bouton d'ouverture du menu déroulant */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs sm:text-sm font-medium text-slate-700 shadow-sm hover:border-sky-300 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-colors"
        aria-expanded={isOpen}
        aria-haspopup="true"
        title="Navigation hiérarchique selon vos permissions"
      >
        <span className="flex h-5 w-5 items-center justify-center rounded bg-sky-100 text-sky-700 text-xs font-bold">
          🌳
        </span>
        <span className="hidden sm:inline font-semibold text-slate-800">Hiérarchie</span>
        <span
          className={`inline-flex items-center rounded px-2 py-0.5 text-[11px] font-semibold border ${scopeBadge.bg}`}
        >
          {scopeBadge.label}
        </span>
        <svg
          className={`h-4 w-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Menu déroulant hiérarchique */}
      {isOpen && (
        <div className="absolute left-0 top-full mt-2 w-[340px] max-w-[95vw] rounded-2xl border border-slate-200 bg-white shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150 sm:left-auto sm:right-0 sm:w-[480px]">
          {/* Header du dropdown */}
          <div className="border-b border-slate-100 bg-slate-50/80 px-4 py-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-base">🌳</span>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 leading-tight">
                    Navigation Réseau
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Partenaire → DSM → POS (+ BTS)
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-[11px]">
                <button
                  type="button"
                  onClick={expandAll}
                  className="rounded px-2 py-1 text-slate-600 hover:bg-slate-200 font-medium transition"
                >
                  Déplier tout
                </button>
                <span className="text-slate-300">|</span>
                <button
                  type="button"
                  onClick={collapseAll}
                  className="rounded px-2 py-1 text-slate-600 hover:bg-slate-200 font-medium transition"
                >
                  Replier tout
                </button>
              </div>
            </div>

            {/* Barre de recherche instantanée */}
            <div className="mt-2.5 relative">
              <input
                type="text"
                placeholder="Filtrer (nom, code, ville...)"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 pl-8 text-xs text-slate-800 placeholder-slate-400 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
              <svg
                className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-2.5 top-1.5 text-slate-400 hover:text-slate-600 text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Badges de comptage */}
            {!loading && !error && (
              <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500">
                <span className="rounded bg-slate-200/70 px-1.5 py-0.5 font-medium text-slate-700">
                  🏢 {stats.nbPart} {stats.nbPart > 1 ? 'Partenaires' : 'Partenaire'}
                </span>
                <span className="rounded bg-slate-200/70 px-1.5 py-0.5 font-medium text-slate-700">
                  👤 {stats.nbDSM} DSM
                </span>
                <span className="rounded bg-slate-200/70 px-1.5 py-0.5 font-medium text-slate-700">
                  🏪 {stats.nbPOS} POS
                </span>
                {stats.nbBTS > 0 && (
                  <span className="rounded bg-slate-200/70 px-1.5 py-0.5 font-medium text-slate-700">
                    📡 {stats.nbBTS} BTS
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Corps de l'arborescence */}
          <div className="max-h-[380px] overflow-y-auto p-2 space-y-2">
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
                const isPartExpanded = expandedNodes[`part-${part.id}`] ?? true;
                const isCurrentPartner = partner?.id === part.id;
                const btsCount = (part.bts || []).length;
                const dsms = part.dsms || [];
                const totalPos = dsms.reduce((acc, d) => acc + (d.pos || []).length, 0);

                return (
                  <div
                    key={`part-${part.id}`}
                    className={`rounded-xl border transition-all ${
                      isCurrentPartner
                        ? 'border-sky-300 bg-sky-50/40'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    {/* Niveau 1 : Partenaire */}
                    <div
                      onClick={(e) => toggleNode(`part-${part.id}`, e)}
                      className="flex items-center justify-between px-3 py-2.5 cursor-pointer select-none rounded-t-xl hover:bg-slate-50/80"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-xs text-slate-400 font-mono">
                          {isPartExpanded ? '▼' : '▶'}
                        </span>
                        <span className="text-sm">🏢</span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-900 text-xs sm:text-sm truncate">
                              {part.nom}
                            </span>
                            <span className="rounded bg-slate-100 px-1.5 py-0.2 text-[10px] font-mono text-slate-600 border border-slate-200">
                              {part.code_partenaire}
                            </span>
                          </div>
                          {part.ville && (
                            <span className="text-[11px] text-slate-500">📍 {part.ville}</span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0 ml-2">
                        {isCurrentPartner ? (
                          <span className="rounded-full bg-sky-600 px-2 py-0.5 text-[10px] font-semibold text-white">
                            Actif
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={(e) => handleSelectPartner(part, e)}
                            className="rounded-md border border-sky-200 bg-white px-2 py-0.5 text-[11px] font-medium text-sky-700 hover:bg-sky-50 transition shadow-2xs"
                            title="Définir comme contexte actif"
                          >
                            Sélectionner
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Contenu déroulé du Partenaire */}
                    {isPartExpanded && (
                      <div className="px-3 pb-2.5 pt-1 space-y-2 border-t border-slate-100/80">
                        {/* Section BTS (si présente) */}
                        {btsCount > 0 && (
                          <div className="ml-3 rounded-lg border border-slate-100 bg-slate-50/60 p-2">
                            <div
                              onClick={(e) => toggleNode(`bts-group-${part.id}`, e)}
                              className="flex items-center justify-between cursor-pointer select-none text-[11px] font-semibold text-slate-700"
                            >
                              <div className="flex items-center gap-1.5">
                                <span>{expandedNodes[`bts-group-${part.id}`] ? '▼' : '▶'}</span>
                                <span>📡 Antenne(s) BTS ({btsCount})</span>
                              </div>
                            </div>

                            {expandedNodes[`bts-group-${part.id}`] && (
                              <div className="mt-1.5 space-y-1 pl-3 border-l-2 border-slate-200">
                                {part.bts.map((b) => (
                                  <div
                                    key={`bts-${b.id}`}
                                    onClick={(e) => handleNavigateToBTS(b.id, part, e)}
                                    className="flex items-center justify-between py-1 px-2 rounded hover:bg-white cursor-pointer text-xs transition"
                                  >
                                    <div className="flex items-center gap-1.5 min-w-0 truncate">
                                      <span className="font-medium text-slate-800">{b.nom}</span>
                                      <span className="text-[10px] text-slate-400 font-mono">
                                        ({b.code_bts})
                                      </span>
                                    </div>
                                    <span className="text-[10px] text-sky-600 font-medium hover:underline">
                                      Voir →
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Niveau 2 : DSMs du Partenaire */}
                        {dsms.length === 0 ? (
                          <p className="text-[11px] text-slate-400 italic pl-4 py-1">
                            Aucun DSM assigné à ce partenaire.
                          </p>
                        ) : (
                          <div className="space-y-1.5 pl-2">
                            {dsms.map((dsm) => {
                              const isDsmExpanded =
                                expandedNodes[`dsm-${part.id}-${dsm.id}`] ?? true;
                              const posList = dsm.pos || [];

                              return (
                                <div
                                  key={`dsm-${part.id}-${dsm.id}`}
                                  className="rounded-lg border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition"
                                >
                                  {/* Ligne DSM */}
                                  <div
                                    onClick={(e) =>
                                      toggleNode(`dsm-${part.id}-${dsm.id}`, e)
                                    }
                                    className="flex items-center justify-between px-2.5 py-1.5 cursor-pointer select-none"
                                  >
                                    <div className="flex items-center gap-2 min-w-0">
                                      <span className="text-[10px] text-slate-400 font-mono">
                                        {isDsmExpanded ? '▼' : '▶'}
                                      </span>
                                      <span className="text-xs">👤</span>
                                      <div className="min-w-0">
                                        <div className="flex items-center gap-1.5">
                                          <span className="font-semibold text-slate-800 text-xs truncate">
                                            {dsm.nom}
                                          </span>
                                          <span className="text-[10px] text-slate-400 font-mono">
                                            [{dsm.matricule}]
                                          </span>
                                        </div>
                                        {dsm.zone_couverture && (
                                          <span className="text-[10px] text-slate-500">
                                            Zone : {dsm.zone_couverture}
                                          </span>
                                        )}
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-1.5">
                                      <span className="rounded bg-slate-200/80 px-1.5 py-0.2 text-[10px] font-bold text-slate-700">
                                        {posList.length} POS
                                      </span>
                                      {role !== ROLES.DETENTEUR_POS && (
                                        <button
                                          type="button"
                                          onClick={(e) => handleNavigateToDSM(dsm.id, part, e)}
                                          className="text-[11px] text-sky-600 hover:text-sky-800 font-medium px-1"
                                          title="Consulter le DSM"
                                        >
                                          →
                                        </button>
                                      )}
                                    </div>
                                  </div>

                                  {/* Niveau 3 : POS rattachés au DSM */}
                                  {isDsmExpanded && (
                                    <div className="px-2.5 pb-2 pt-1">
                                      {posList.length === 0 ? (
                                        <p className="text-[10px] text-slate-400 italic pl-5 py-0.5">
                                          Aucun POS dans ce périmètre.
                                        </p>
                                      ) : (
                                        <ul className="space-y-1 pl-4 border-l-2 border-slate-200">
                                          {posList.map((p) => (
                                            <li
                                              key={`pos-${p.id}`}
                                              onClick={(e) => handleNavigateToPOS(p.id, part, e)}
                                              className="group flex items-center justify-between rounded-md px-2 py-1 hover:bg-white hover:shadow-2xs cursor-pointer transition"
                                            >
                                              <div className="flex items-center gap-1.5 min-w-0">
                                                <span className="text-xs">🏪</span>
                                                <span className="text-xs font-medium text-slate-800 truncate group-hover:text-sky-600">
                                                  {p.nom}
                                                </span>
                                                <span className="text-[10px] text-slate-400 font-mono">
                                                  {p.code_pos}
                                                </span>
                                                {p.type_pos && (
                                                  <span
                                                    className={`rounded px-1 text-[9px] font-semibold ${
                                                      p.type_pos === 'NOUVEAU'
                                                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                                        : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                                                    }`}
                                                  >
                                                    {p.type_pos}
                                                  </span>
                                                )}
                                              </div>
                                              <span className="text-[10px] font-semibold text-sky-600 opacity-0 group-hover:opacity-100 transition">
                                                Consulter →
                                              </span>
                                            </li>
                                          ))}
                                        </ul>
                                      )}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
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
