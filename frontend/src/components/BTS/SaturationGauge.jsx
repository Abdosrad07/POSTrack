import React from 'react'

const GAUGE_COLORS = [
  { threshold: 0, color: '#9ca3af', bgClass: 'bg-gray-200', textColor: 'text-gray-500', label: 'Non mesurée' },
  { threshold: 30, color: '#22c55e', bgClass: 'bg-green-500', textColor: 'text-green-600', label: 'Faible' },
  { threshold: 50, color: '#eab308', bgClass: 'bg-yellow-500', textColor: 'text-yellow-600', label: 'Modérée' },
  { threshold: 70, color: '#f97316', bgClass: 'bg-orange-500', textColor: 'text-orange-600', label: 'Élevée' },
  { threshold: 90, color: '#ef4444', bgClass: 'bg-red-500', textColor: 'text-red-600', label: 'Critique' },
  { threshold: 101, color: '#b91c1c', bgClass: 'bg-red-700', textColor: 'text-red-800', label: 'Saturée' },
]

function getGaugeLevel(value) {
  if (value == null || isNaN(value)) return GAUGE_COLORS[0]
  for (let i = GAUGE_COLORS.length - 1; i >= 0; i--) {
    if (value >= GAUGE_COLORS[i].threshold) {
      return GAUGE_COLORS[i]
    }
  }
  return GAUGE_COLORS[0]
}

export default function SaturationGauge({ value, size = 'md', showLabel = true }) {
  const level = getGaugeLevel(value)
  const percentage = Math.min(value ?? 0, 100)

  const sizes = {
    sm: { container: 'w-20 h-20', text: 'text-lg', label: 'text-xs' },
    md: { container: 'w-32 h-32', text: 'text-2xl', label: 'text-sm' },
    lg: { container: 'w-40 h-40', text: 'text-3xl', label: 'text-base' },
  }

  const s = sizes[size] || sizes.md

  // Conic gradient for gauge effect
  const conicStyle = {
    background: `conic-gradient(${level.color} ${percentage}%, #e5e7eb ${percentage}%)`,
  }

  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={`relative ${s.container} rounded-full flex items-center justify-center bg-gray-100`}
        style={conicStyle}
      >
        <div className="absolute inset-1 rounded-full bg-white flex items-center justify-center">
          <span className={`${s.text} font-bold ${level.textColor}`}>
            {value != null ? `${Math.round(value)}%` : 'N/A'}
          </span>
        </div>
      </div>
      {showLabel && (
        <span className={`${s.label} font-medium ${level.textColor}`}>
          {level.label}
        </span>
      )}
    </div>
  )
}
