import React from 'react';
import PageHeader from '../../components/Common/PageHeader/PageHeader';
import EmptyState from '../../components/Common/EmptyState/EmptyState';

/** Stub Module C2 — stock SIM. */
const SimsStockPage = () => (
  <div>
    <PageHeader
      title="Stock SIM"
      subtitle="Suivi des cartes SIM du partenaire actif."
      breadcrumbs={['Espace partenaire', 'Stock SIM']}
    />
    <EmptyState
      title="Module Stock SIM"
      message="Le stock et les mouvements seront livrés par le module Frontend Clients (C2)."
    />
  </div>
);

export default SimsStockPage;
