import React from 'react';
import PageHeader from '../../components/Common/PageHeader/PageHeader';
import EmptyState from '../../components/Common/EmptyState/EmptyState';

/** Stub Module A3 — Import Excel centralisé. */
const ImportExportPage = () => (
  <div>
    <PageHeader
      title="Import Excel"
      subtitle="Canal central d'importation en masse (ImportBatch)."
      breadcrumbs={['Administration', 'Import Excel']}
    />
    <EmptyState
      title="Module Import Excel"
      message="Le parcours Validate → Preview → Apply sera livré dans le module A3 (Lead Frontend)."
    />
  </div>
);

export default ImportExportPage;
