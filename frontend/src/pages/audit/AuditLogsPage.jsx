import React from 'react';
import PageHeader from '../../components/Common/PageHeader/PageHeader';
import EmptyState from '../../components/Common/EmptyState/EmptyState';

/** Stub administration — journaux d'audit (ADMIN). */
const AuditLogsPage = () => (
  <div>
    <PageHeader
      title="Audit"
      subtitle="Journal des actions sensibles de la plateforme."
      breadcrumbs={['Administration', 'Audit']}
    />
    <EmptyState
      title="Journaux d'audit"
      message="L'écran d'audit détaillé sera branché sur l'API audit existante."
    />
  </div>
);

export default AuditLogsPage;
