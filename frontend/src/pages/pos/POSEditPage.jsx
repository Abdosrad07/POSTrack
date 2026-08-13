import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import posService from '../../services/posService';
import partenaireService from '../../services/partenaireService';
import dsmService from '../../services/dsmService';
import POSForm from '../../components/POS/POSForm';

export default function POSEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [pos, setPos] = useState(null);
  const [partenaires, setPartenaires] = useState([]);
  const [dsms, setDsms] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);

  useEffect(() => {
    partenaireService.getAll({ statut: 'ACTIF', limit: 100 }).then((r) => setPartenaires(r.data.data ?? []));
    dsmService.getAll({ statut: 'ACTIF', limit: 100 }).then((r) => setDsms(r.data.data ?? []));
  }, []);

  useEffect(() => {
    posService
      .getById(id)
      .then((res) => { setPos(res.data); setStatus('success'); })
      .catch(() => { setError('POS introuvable.'); setStatus('error'); });
  }, [id]);

  const handleSubmit = async (data) => {
    setSubmitting(true);
    setError(null);
    try {
      const res = await posService.update(id, data);
      navigate(`/pos/${res.data.id}`);
    } catch (err) {
      setError(err.response?.data?.detail ?? "Erreur lors de la modification du POS.");
      setSubmitting(false);
    }
  };

  if (status === 'loading') return <p className="text-gray-400">Chargement...</p>;
  if (status === 'error') return <p className="text-red-600">{error}</p>;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Modifier le POS {pos.code_pos}</h1>

      {error && <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      <POSForm
        initialData={pos}
        partenaires={partenaires}
        dsms={dsms}
        onSubmit={handleSubmit}
        onCancel={() => navigate(-1)}
        submitting={submitting}
      />
    </div>
  );
}
