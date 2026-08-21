import React from 'react';
import PageHeader from '../../components/Common/PageHeader/PageHeader';
import EmptyState from '../../components/Common/EmptyState/EmptyState';

/** Stub Module C3 — requêtes multi-entités. */
const RequetesListPage = () => (
  <div>
    <PageHeader
      title="Requêtes"
      subtitle="Demandes et incidents terrain du partenaire actif."
      breadcrumbs={['Espace partenaire', 'Requêtes']}
    />
    <EmptyState
      title="Module Requêtes"
      message="Le workflow des requêtes sera livré par le module Requêtes."
    />
  </div>
);

export default RequetesListPage;
