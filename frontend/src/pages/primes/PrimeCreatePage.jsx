import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'
import Alert from '../../components/Common/Alert/Alert'

export default function PrimeCreatePage() {
	const navigate = useNavigate()
	const [pos, setPos] = useState('')
	const [partenaireId, setPartenaireId] = useState('')
	const [partenaires, setPartenaires] = useState([])
	const [montant, setMontant] = useState('')
	const [date, setDate] = useState('')
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState('')
	const [success, setSuccess] = useState('')

	useEffect(() => {
		let mounted = true
		const fetch = async () => {
			try {
				const res = await api.get('/partenaires')
				if (mounted) setPartenaires(res.data.data || res.data || [])
			} catch (e) {
				if (mounted) setPartenaires([])
			}
		}
		void fetch()
		return () => { mounted = false }
	}, [])

	const handleSubmit = async (e) => {
		e.preventDefault()
		setLoading(true)
		try {
			if (!pos.trim() || !montant) {
				setError('Les champs POS et Montant sont requis.')
				setLoading(false)
				return
			}
			await api.post('/primes', { pos, partenaire_id: partenaireId || null, montant, date })
			setSuccess('Prime créée avec succès')
			setTimeout(() => navigate('/primes'), 700)
		} catch (err) {
			console.error(err)
			setError('Erreur lors de la création. Vérifiez le backend et réessayez.')
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className="space-y-8">
			<div>
				<h1 className="text-3xl font-semibold tracking-tight text-slate-900">Nouvelle prime</h1>
				<p className="mt-2 max-w-2xl text-sm text-slate-600">Saisissez une prime liée à un POS du partenaire actif.</p>
			</div>
			<form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-100">
				{error && <div className="mb-4"><Alert type="error" message={error} onClose={() => setError('')} /></div>}
				{success && <div className="mb-4"><Alert type="success" message={success} /></div>}
				<div className="space-y-4">
					<div>
						<label className="block text-sm font-medium text-gray-700">POS</label>
						<input value={pos} onChange={(e)=>setPos(e.target.value)} required className="mt-1 block w-full rounded-md border px-3 py-2" />
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700">Partenaire</label>
						<select value={partenaireId} onChange={(e)=>setPartenaireId(e.target.value)} className="mt-1 block w-full rounded-md border px-3 py-2">
							<option value="">-- Aucun --</option>
							{partenaires.map(p => (
								<option key={p.id} value={p.id}>{p.nom}</option>
							))}
						</select>
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700">Montant</label>
						<input value={montant} onChange={(e)=>setMontant(e.target.value)} type="number" className="mt-1 block w-full rounded-md border px-3 py-2" />
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700">Date</label>
						<input value={date} onChange={(e)=>setDate(e.target.value)} type="date" className="mt-1 block w-full rounded-md border px-3 py-2" />
					</div>
				</div>
				<div className="mt-6 flex items-center justify-end gap-3">
					<button type="submit" className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800">{loading ? 'Enregistrement…' : 'Créer la prime'}</button>
				</div>
			</form>
		</div>
	)
}
