import React from 'react';
import PageHeader from '../../components/Common/PageHeader/PageHeader';
import EmptyState from '../../components/Common/EmptyState/EmptyState';

/** Stub Module C1 — liste clients (page en cours côté Frontend Clients). */
const ClientsListPage = () => (
  <div>
    <PageHeader
      title="Clients"
      subtitle="Clients rattachés aux POS du partenaire actif."
      breadcrumbs={['Espace partenaire', 'Clients']}
    />
    <EmptyState
      title="Module Clients"
      message="La liste détaillée sera fournie par le module Frontend Clients (C1)."
    />
  </div>
);

export default ClientsListPage;
