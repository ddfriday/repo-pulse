import type { Period, RankedRepository } from "@/lib/types"

const PERIOD_LABELS: Record<Period, string[]> = {
  daily: ["00h", "04h", "08h", "12h", "16h", "20h", "24h"],
  weekly: ["Day 1", "Day 2", "Day 3", "Day 4", "Day 5", "Day 6", "Day 7"],
  monthly: ["Week 1", "Week 2", "Week 3", "Week 4"],
}

function compactNumber(value: number) {
  return Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value)
}

export function MomentumChart({
  repository,
  period,
}: {
  repository: RankedRepository
  period: Period
}) {
  const width = 420
  const height = 230
  const left = 42
  const right = 16
  const top = 22
  const bottom = 38
  const values =
    repository.trend.length > 1
      ? repository.trend
      : [repository.starGain * 0.45, repository.starGain]
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = Math.max(max - min, 1)
  const plotWidth = width - left - right
  const plotHeight = height - top - bottom
  const points = values.map((value, index) => ({
    x: left + (index / (values.length - 1)) * plotWidth,
    y: top + plotHeight - ((value - min) / range) * plotHeight,
    value,
  }))
  const pointString = points.map((point) => point.x + "," + point.y).join(" ")
  const areaPath =
    "M " +
    left +
    " " +
    (height - bottom) +
    " L " +
    pointString.replaceAll(",", " ") +
    " L " +
    (width - right) +
    " " +
    (height - bottom) +
    " Z"
  const labels = PERIOD_LABELS[period]
  const visibleLabels = [
    labels[0],
    labels[Math.floor(labels.length / 2)],
    labels.at(-1),
  ]

  return (
    <svg
      className="momentum-chart"
      role="img"
      aria-label={
        repository.fullName +
        " star growth for the selected " +
        period +
        " period"
      }
      viewBox={"0 0 " + width + " " + height}
    >
      {[0, 0.5, 1].map((ratio) => {
        const y = top + plotHeight * ratio
        const value = max - range * ratio
        return (
          <g key={ratio}>
            <line x1={left} x2={width - right} y1={y} y2={y} />
            <text x={0} y={y + 4}>
              {compactNumber(Math.max(value, 0))}
            </text>
          </g>
        )
      })}
      <path className="momentum-chart-area" d={areaPath} />
      <polyline
        className="momentum-chart-line"
        points={pointString}
        fill="none"
        vectorEffect="non-scaling-stroke"
      />
      {points.map((point, index) => (
        <circle
          key={index}
          cx={point.x}
          cy={point.y}
          r={index === points.length - 1 ? 5 : 3.5}
        />
      ))}
      {visibleLabels.map((label, index) => (
        <text
          className="momentum-chart-x-label"
          key={label}
          x={left + (index / (visibleLabels.length - 1)) * plotWidth}
          y={height - 10}
          textAnchor={
            index === 0
              ? "start"
              : index === visibleLabels.length - 1
                ? "end"
                : "middle"
          }
        >
          {label}
        </text>
      ))}
      <text
        className="momentum-chart-direct-label"
        x={points.at(-1)?.x ?? width - right}
        y={(points.at(-1)?.y ?? top) - 12}
        textAnchor="end"
      >
        +{compactNumber(repository.starGain)} stars
      </text>
    </svg>
  )
}
