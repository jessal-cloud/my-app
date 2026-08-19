import { useMemo, useState } from 'react'

const WIDTH = 560
const HEIGHT = 200
const PAD = { top: 20, right: 16, bottom: 28, left: 40 }

function niceStep(rawStep) {
  const exponent = Math.floor(Math.log10(rawStep))
  const fraction = rawStep / 10 ** exponent
  let niceFraction
  if (fraction <= 1) niceFraction = 1
  else if (fraction <= 2) niceFraction = 2
  else if (fraction <= 5) niceFraction = 5
  else niceFraction = 10
  return niceFraction * 10 ** exponent
}

function niceTicks(min, max, count = 4) {
  if (min === max) {
    min -= 1
    max += 1
  }
  const step = niceStep((max - min) / count) || 1
  const niceMin = Math.floor(min / step) * step
  const niceMax = Math.ceil(max / step) * step
  const ticks = []
  for (let v = niceMin; v <= niceMax + step / 2; v += step) {
    ticks.push(Math.round(v * 100) / 100)
  }
  return ticks
}

function formatShortDate(date) {
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

function LineChart({ points, color, unit }) {
  const [hoverIndex, setHoverIndex] = useState(null)

  const sorted = useMemo(
    () => [...points].sort((a, b) => a.date.getTime() - b.date.getTime()),
    [points],
  )

  const xMin = sorted[0].date.getTime()
  const xMax = sorted[sorted.length - 1].date.getTime()
  const values = sorted.map((p) => p.value)
  const yTicks = niceTicks(Math.min(...values), Math.max(...values), 4)
  const yMin = yTicks[0]
  const yMax = yTicks[yTicks.length - 1]

  const innerW = WIDTH - PAD.left - PAD.right
  const innerH = HEIGHT - PAD.top - PAD.bottom

  const xScale = (t) => (xMax === xMin ? PAD.left + innerW / 2 : PAD.left + ((t - xMin) / (xMax - xMin)) * innerW)
  const yScale = (v) => (yMax === yMin ? PAD.top + innerH / 2 : PAD.top + innerH - ((v - yMin) / (yMax - yMin)) * innerH)

  const linePath = sorted
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${xScale(p.date.getTime()).toFixed(1)} ${yScale(p.value).toFixed(1)}`)
    .join(' ')

  const last = sorted[sorted.length - 1]
  const hovered = hoverIndex !== null ? sorted[hoverIndex] : null

  return (
    <div className="line-chart">
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="line-chart-svg" role="img" aria-label={`${unit} over time`}>
        {yTicks.map((t) => (
          <g key={t}>
            <line x1={PAD.left} x2={WIDTH - PAD.right} y1={yScale(t)} y2={yScale(t)} className="chart-gridline" />
            <text x={PAD.left - 8} y={yScale(t)} className="chart-axis-label" textAnchor="end" dominantBaseline="middle">
              {t}
            </text>
          </g>
        ))}

        <path d={linePath} className="chart-line" stroke={color} fill="none" />

        {sorted.map((p, i) => (
          <g key={p.id}>
            <circle
              cx={xScale(p.date.getTime())}
              cy={yScale(p.value)}
              r={12}
              fill="transparent"
              onMouseEnter={() => setHoverIndex(i)}
              onMouseLeave={() => setHoverIndex((h) => (h === i ? null : h))}
              onFocus={() => setHoverIndex(i)}
              onBlur={() => setHoverIndex((h) => (h === i ? null : h))}
              tabIndex={0}
            />
            <circle cx={xScale(p.date.getTime())} cy={yScale(p.value)} r={4} fill={color} stroke="var(--surface)" strokeWidth="2" />
          </g>
        ))}

        <text x={xScale(last.date.getTime())} y={yScale(last.value) - 12} textAnchor="end" className="chart-end-label">
          {last.value}{unit}
        </text>

        <text x={PAD.left} y={HEIGHT - 6} className="chart-axis-label">
          {formatShortDate(sorted[0].date)}
        </text>
        <text x={WIDTH - PAD.right} y={HEIGHT - 6} textAnchor="end" className="chart-axis-label">
          {formatShortDate(last.date)}
        </text>
      </svg>

      {hovered && (
        <div
          className="chart-tooltip"
          style={{
            left: `${(xScale(hovered.date.getTime()) / WIDTH) * 100}%`,
            top: `${(yScale(hovered.value) / HEIGHT) * 100}%`,
          }}
        >
          <strong>{hovered.value}{unit}</strong>
          <span>{formatShortDate(hovered.date)}</span>
        </div>
      )}
    </div>
  )
}

export default LineChart
