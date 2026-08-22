import React from 'react';
import { useNavigate } from 'react-router-dom';
import usePartner from '../../hooks/usePartner';
import Button from '../Common/Button/Button';
import DemoDataBanner from '../Common/DemoDataBanner/DemoDataBanner';

/**
 * Barre de contexte partenaire actif.
 * Pour le nouveau modèle, le changement de contexte reste géré via
 * la sélection hiérarchique dans la sidebar.
 */
const PartnerSelectorBar = () => {
  const { partner, partnerContextId, hasPartner } = usePartner();
  const navigate = useNavigate();

  if (!hasPartner) return null;

  const name = partner?.nom || partner?.code_partenaire || `Partenaire #${partnerContextId}`;
  const meta = [partner?.code_partenaire, partner?.ville, partner?.region]
    .filter(Boolean)
    .join(' · ');

  return (
    <div className="border-b border-sky-100 bg-sky-50">
      <div className="flex flex-col gap-2 px-4 py-2.5 sm:flex-row sm:items-center sm:justify-between md:pl-72">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-sky-700">
            Contexte partenaire
          </p>
          <p className="truncate text-sm font-semibold text-slate-900">{name}</p>
          {meta ? <p className="truncate text-xs text-slate-500">{meta}</p> : null}
        </div>
        <Button
          type="button"
          variant="indigo"
          className="shrink-0 text-sm"
          onClick={() => navigate('/select-partner')}
        >
          Changer de partenaire
        </Button>
      </div>
      {partner?.__mock ? (
        <DemoDataBanner
          compact
          message="Le backend est indisponible : le contexte partenaire actif utilise des données de démonstration."
        />
      ) : null}
    </div>
  );
};

export default PartnerSelectorBar;
