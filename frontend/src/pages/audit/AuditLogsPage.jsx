import React from 'react';
import PageHeader from '../../components/Common/PageHeader/PageHeader';
import EmptyState from '../../components/Common/EmptyState/EmptyState';

const AuditLogsPage = () => (
  <div>
    <PageHeader
      title="Audit"
      subtitle="Journal des actions sensibles de la plateforme."
      breadcrumbs={['Administration', 'Audit']}
    />
    <EmptyState
      title="Journal d'audit"
      message="Le backend expose des traces d'audit, mais aucun endpoint frontend dédié n'est encore branché ici."
      icon="📝"
    />
  </div>
);

export default AuditLogsPage;
