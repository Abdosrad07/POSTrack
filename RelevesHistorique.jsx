import PropTypes from 'prop-types'

const mockReleves = [
  { id: 1, date: '2024-07-20', charge: 75, rendement: 98.5 },
  { id: 2, date: '2024-07-19', charge: 72, rendement: 99.1 },
  { id: 3, date: '2024-07-18', charge: 68, rendement: 99.2 },
]

function RelevesHistorique({ btsId }) {
  // TODO: Remplacer mockReleves par un appel API avec btsId
  const releves = mockReleves

  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-200 px-6 py-4">
        <h2 className="text-lg font-semibold text-gray-900">Historique des relevés</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Charge (%)</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Rendement (%)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {releves.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-6 py-8 text-center text-sm text-gray-500">Aucun relevé disponible.</td>
              </tr>
            ) : (
              releves.map((releve) => (
                <tr key={releve.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{releve.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{releve.charge}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{releve.rendement}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

RelevesHistorique.propTypes = {
  btsId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
}

export default RelevesHistorique