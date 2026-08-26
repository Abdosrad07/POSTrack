import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import dsmService from '../../services/dsmService'
import requeteService from '../../services/requeteService'
import posService from '../../services/posService'
import DSMIdentityCard from '../../components/DSM/DSMIdentityCard'
import DSMPerformanceCard from '../../components/DSM/DSMPerformanceCard'
import DSMRequestsCard from '../../components/DSM/DSMRequestsCard'
import DSMRequestProgressCard from '../../components/DSM/DSMRequestProgressCard'
import DSMPOSCard from '../../components/DSM/DSMPOSCard'
import POSLinkageStatsCard from '../../components/POS/POSLinkageStatsCard'
import DSMTerritoryMap from '../../components/DSMTerritoryMap'
import usePartner from '../../hooks/usePartner'

export default function DSMDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { partnerContextId } = usePartner()
  const [dashboardData, setDashboardData] = useState(null)
  const [requestSummary, setRequestSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [dsmPartnerId, setDsmPartnerId] = useState(null)

  useEffect(() => {
    let active = true
    const fetchDSMDashboard = async () => {
      try {
        setLoading(true)
        setError('')
        
        // Fetch the comprehensive dashboard data
        const response = await dsmService.getDSMDashboard(id)
        
        // Fetch DSM-specific request summary
        const requestResponse = await requeteService.getDSMSummary(id)
        
        if (active) {
          const data = response?.data || null
          setDashboardData(data)
          setDsmPartnerId(data?.identity?.partner_id || partnerContextId)
          setRequestSummary(requestResponse)
        }
      } catch (error) {
        if (active) {
          setError(error?.apiMessage || error?.message || 'Impossible de charger le dashboard du DSM.')
          setDashboardData(null)
          setRequestSummary(null)
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    fetchDSMDashboard()
    return () => {
      active = false
    }
  }, [id, partnerContextId])

  const handleRequestClick = (request) => {
    console.log('Request clicked:', request)
    // Navigate to request detail page when implemented
    // navigate(`/requetes/${request.id}`)
  }

  const handlePOSClick = (pos) => {
    console.log('POS clicked:', pos)
    // Navigate to POS detail page
    navigate(`/pos/${pos.id}`)
  }

  const handleMapSelect = (item) => {
    console.log('Map item selected:', item)
    if (item.entity_type === 'POS' || item.code_pos) {
      navigate(`/pos/${item.id}`)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-slate-600">Chargement du dashboard DSM...</div>
      </div>
    )
  }

  if (!dashboardData) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-800">
        <p>{error || 'DSM introuvable.'}</p>
        <button
          type="button"
          onClick={() => navigate('/dsm')}
          className="mt-4 rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
        >
          Retour à la liste DSM
        </button>
      </div>
    )
  }

  const { identity, performance, requetes, pos, summary } = dashboardData

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard DSM</h1>
          <p className="mt-1 text-sm text-gray-600">
            Vue complète et détaillée du DSM - {identity?.full_name || identity?.nom || `DSM #${id}`}
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/dsm')}
          className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
        >
          Retour
        </button>
      </div>

      {/* Summary stats - DSM-specific */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Total POS</div>
          <div className="mt-2 text-2xl font-bold text-slate-900">{summary?.total_pos || 0}</div>
          <div className="mt-1 text-xs text-slate-600">POS assignés à ce DSM</div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Requêtes DSM</div>
          <div className="mt-2 text-2xl font-bold text-slate-900">{requestSummary?.total || 0}</div>
          <div className="mt-1 text-xs text-slate-600">{requestSummary?.en_cours || 0} en cours</div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Progression requêtes</div>
          <div className="mt-2 text-2xl font-bold text-slate-900">
            {requestSummary?.progression != null ? `${requestSummary.progression.toFixed(1)}%` : '—'}
          </div>
          <div className="mt-1 text-xs text-slate-600">{requestSummary?.terminees || 0} terminées</div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Requêtes en retard</div>
          <div className="mt-2 text-2xl font-bold text-slate-900">{requestSummary?.en_retard || 0}</div>
          <div className="mt-1 text-xs text-slate-600">Requêtes dépassant les délais</div>
        </div>
      </div>

      {/* Main grid layout */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left column */}
        <div className="space-y-6">
          {/* Identity */}
          <DSMIdentityCard dsm={identity} />
          
          {/* Performance */}
          <DSMPerformanceCard performance={performance} loading={false} />
          
          {/* Request Progress */}
          <DSMRequestProgressCard data={requestSummary} />
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Requests */}
          <DSMRequestsCard 
            requests={requetes} 
            loading={false} 
            onRequestClick={handleRequestClick}
          />
        </div>
      </div>

      {/* POS Linkage Stats - Full width */}
      <POSLinkageStatsCard dsmId={parseInt(id)} />

      {/* POS Management - Full width */}
      <DSMPOSCard 
        posData={pos} 
        loading={false} 
        onPOSClick={handlePOSClick}
      />

      {/* Territory Map - Full width */}
      {dsmPartnerId && (
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Territoire du DSM</h2>
              <p className="mt-1 text-sm text-gray-600">
                Représentation géographique du territoire du DSM : POS assignés, zones, micro-zones et contexte BTS.
              </p>
            </div>
          </div>
          <DSMTerritoryMap 
            partnerId={dsmPartnerId} 
            dsmId={parseInt(id)} 
            onSelect={handleMapSelect} 
          />
        </div>
      )}
    </div>
  )
}
