import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../../components/Common/PageHeader/PageHeader';
import EmptyState from '../../components/Common/EmptyState/EmptyState';
import LoadingSpinner from '../../components/Common/LoadingSpinner/LoadingSpinner';
import ErrorState from '../../components/Common/ErrorState/ErrorState';
import ExportButtons from '../../components/Common/ExportButtons/ExportButtons';
import api from '../../services/api';

const formatDate = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString('fr-FR');
};

const normalizeAuditRows = (payload) => {
  const rows = Array.isArray(payload?.items)
    ? payload.items
    : Array.isArray(payload?.data)
      ? payload.data
      : Array.isArray(payload)
        ? payload
        : [];

  return rows.map((row) => ({
    id: row?.id,
    action: row?.action || row?.event || '—',
    entityType: row?.entity_type || row?.entityType || '—',
    entityId: row?.entity_id ?? row?.entityId ?? '—',
    details: row?.details || row?.message || '—',
    partnerId: row?.partner_id ?? row?.partnerId ?? null,
    userId: row?.user_id ?? row?.userId ?? null,
    createdAt: row?.created_at || row?.createdAt || null,
  }));
};

/** Colonnes du tableau / export Audit — alignées sur AuditEntryOut (backend). */
const EXPORT_COLUMNS = [
  { label: 'Date', value: (r) => (r.createdAt ? new Date(r.createdAt).toLocaleString('fr-FR') : '') },
  { label: 'Action', value: 'action' },
  { label: 'Entité', value: 'entityType' },
  { label: 'ID entité', value: 'entityId' },
  { label: 'Partenaire', value: 'partnerId' },
  { label: 'Utilisateur', value: 'userId' },
  { label: 'Détails', value: 'details' },
];

const AuditLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    const fetchLogs = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await api.get('/admin/audit', {
          params: { limit: 100 },
          skipPartnerPrefix: true,
        });
        if (cancelled) return;
        setLogs(normalizeAuditRows(response.data));
      } catch (err) {
        if (!cancelled) {
          setError(err?.apiMessage || err?.message || 'Impossible de charger le journal d’audit.');
          setLogs([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchLogs();
    return () => {
      cancelled = true;
    };
  }, []);

  const hasRows = useMemo(() => logs.length > 0, [logs]);

  return (
    <div>
      <PageHeader
        title="Audit"
        subtitle="Journal des actions sensibles de la plateforme."
        breadcrumbs={['Administration', 'Audit']}
      />

      {loading ? <LoadingSpinner label="Chargement du journal d’audit..." /> : null}

      {!loading && error ? <ErrorState title="Audit indisponible" message={error} /> : null}

      {!loading && !error && !hasRows ? (
        <EmptyState
          title="Journal d'audit"
          message="Aucune trace d’audit disponible pour le moment."
        />
            ) : null}

      {!loading && !error && hasRows ? (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
            <span className="text-sm font-semibold text-slate-600">
              {logs.length} événement{logs.length > 1 ? 's' : ''} chargé{logs.length > 1 ? 's' : ''}.
            </span>
            <ExportButtons
              rows={logs}
              columns={EXPORT_COLUMNS}
              fileName="audit"
              title="Journal d'audit"
              disabled={loading}
            />
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Action</th>
                  <th className="px-4 py-3">Entité</th>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Détails</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((row) => (
                  <tr key={row.id ?? `${row.action}-${row.entityType}-${row.entityId}-${row.createdAt}`}>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-500">{formatDate(row.createdAt)}</td>
                    <td className="px-4 py-3 font-medium text-slate-900">{row.action}</td>
                    <td className="px-4 py-3 text-slate-700">{row.entityType}</td>
                    <td className="px-4 py-3 text-slate-700">{row.entityId}</td>
                    <td className="px-4 py-3 text-slate-600">{row.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="border-t border-slate-100 px-4 py-3 text-xs text-slate-500">
            {logs.length} événement{logs.length > 1 ? 's' : ''} chargé{logs.length > 1 ? 's' : ''}.
          </div>
        </div>
      ) : null}

      <div className="mt-4">
        <Link to="/" className="text-sm font-medium text-sky-700 hover:text-sky-800">
          ← Retour au dashboard
        </Link>
      </div>
    </div>
  );
};

export default AuditLogsPage;
