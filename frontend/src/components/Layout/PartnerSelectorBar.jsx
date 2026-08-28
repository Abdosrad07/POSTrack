import React from 'react';
import { useNavigate } from 'react-router-dom';
import usePartner from '../../hooks/usePartner';
import Button from '../Common/Button/Button';
import DemoDataBanner from '../Common/DemoDataBanner/DemoDataBanner';
import { envFlag } from '../../utils/envFlags';

/**
 * Barre de contexte partenaire actif — design system polish.
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
    <div className="glass-strong border-b border-indigo-100/60">
      <div className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between md:pl-72">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-widest text-brand-500">
            Contexte partenaire
          </p>
          <p className="truncate text-sm font-bold text-slate-900">{name}</p>
          {meta ? <p className="truncate text-xs text-slate-500">{meta}</p> : null}
        </div>
        <Button
          type="button"
          variant="primary"
          className="shrink-0 text-sm"
          onClick={() => navigate('/select-partner')}
        >
          Changer de partenaire
        </Button>
      </div>
      {partner?.__mock && !envFlag(import.meta.env.VITE_DISABLE_DEMO_BANNER) ? (
        <DemoDataBanner
          compact
          message="Le backend est indisponible : le contexte partenaire actif utilise des données de démonstration."
        />
      ) : null}
    </div>
  );
};

export default PartnerSelectorBar;
