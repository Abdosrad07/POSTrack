import PropTypes from 'prop-types'

function SaturationGauge({ percentage }) {
  const getBarColor = () => {
    if (percentage > 80) return 'bg-red-500'
    if (percentage > 60) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  return (
    <div className="w-full">
      <div className="flex justify-between mb-1">
        <span className="text-sm font-medium text-gray-700">Taux de saturation</span>
        <span className="text-sm font-medium text-gray-700">{percentage}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className={`h-2.5 rounded-full ${getBarColor()}`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  )
}

SaturationGauge.propTypes = {
  percentage: PropTypes.number.isRequired,
}

export default SaturationGauge