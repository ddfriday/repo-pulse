"use client"

import { useMemo, useState } from "react"

import type { Locale, Period, RankedRepository } from "@/lib/types"

const AXIS_LABELS: Record<Locale, Record<Period, string[]>> = {
  en: {
    daily: ["Start", "12h", "Now"],
    weekly: ["Start", "Day 4", "Now"],
    monthly: ["Start", "Week 2", "Now"],
  },
  zh: {
    daily: ["开始", "12时", "现在"],
    weekly: ["开始", "第4天", "现在"],
    monthly: ["开始", "第2周", "现在"],
  },
}

function compactNumber(value: number, locale: Locale) {
  return Intl.NumberFormat(locale === "zh" ? "zh-CN" : "en", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value)
}

function normalizeTrend(repository: RankedRepository) {
  const rawValues = repository.trend
    .filter((value) => Number.isFinite(value))
    .map(Number)

  if (rawValues.length > 1) {
    const min = Math.min(...rawValues)
    const max = Math.max(...rawValues)
    const range = max - min

    if (range > 0) {
      return rawValues.map((value) =>
        Math.round(((value - min) / range) * repository.starGain)
      )
    }

    return rawValues.map(() => 0)
  }

  return [0, Math.max(repository.starGain, 0)]
}

function pointLabel(locale: Locale, index: number) {
  return locale === "zh" ? "点 " + (index + 1) : "Point " + (index + 1)
}

export function MomentumChart({
  locale,
  repository,
  period,
}: {
  locale: Locale
  repository: RankedRepository
  period: Period
}) {
  const width = 420
  const height = 230
  const left = 42
  const right = 16
  const top = 22
  const bottom = 38
  const values = useMemo(() => normalizeTrend(repository), [repository])
  const [activeIndex, setActiveIndex] = useState(values.length - 1)
  const activeSafeIndex = Math.min(activeIndex, values.length - 1)
  const max = Math.max(...values, repository.starGain, 1)
  const range = Math.max(max, 1)
  const plotWidth = width - left - right
  const plotHeight = height - top - bottom
  const points = values.map((value, index) => ({
    x: left + (index / (values.length - 1)) * plotWidth,
    y: top + plotHeight - (value / range) * plotHeight,
    value,
  }))
  const activePoint = points[activeSafeIndex] ?? points.at(-1)
  const pointString = points.map((point) => point.x + "," + point.y).join(" ")
  const linePath = points
    .map(
      (point, index) => (index === 0 ? "M " : "L ") + point.x + " " + point.y
    )
    .join(" ")
  const areaPath =
    linePath +
    " L " +
    (points.at(-1)?.x ?? width - right) +
    " " +
    (height - bottom) +
    " L " +
    (points[0]?.x ?? left) +
    " " +
    (height - bottom) +
    " Z"
  const axisLabels = AXIS_LABELS[locale][period]

  return (
    <div className="momentum-chart-shell">
      <div className="momentum-chart-readout" aria-live="polite">
        <span>{pointLabel(locale, activeSafeIndex)}</span>
        <strong>
          +{compactNumber(activePoint?.value ?? 0, locale)}{" "}
          {locale === "zh" ? "Star" : "stars"}
        </strong>
      </div>
      <svg
        className="momentum-chart"
        role="img"
        aria-label={
          locale === "zh"
            ? repository.fullName + " 在所选周期内的新增 Star 趋势"
            : repository.fullName +
              " star gain trend for the selected " +
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
                {compactNumber(Math.max(value, 0), locale)}
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
        {activePoint ? (
          <line
            className="momentum-chart-focus-line"
            x1={activePoint.x}
            x2={activePoint.x}
            y1={top}
            y2={height - bottom}
          />
        ) : null}
        {points.map((point, index) => (
          <g
            aria-label={
              pointLabel(locale, index) +
              ", +" +
              compactNumber(point.value, locale) +
              " " +
              (locale === "zh" ? "Star" : "stars")
            }
            className="momentum-chart-point"
            data-active={index === activeSafeIndex || undefined}
            key={index}
            onClick={() => setActiveIndex(index)}
            onFocus={() => setActiveIndex(index)}
            onPointerEnter={() => setActiveIndex(index)}
            role="button"
            tabIndex={0}
          >
            <circle
              className="momentum-chart-point-dot"
              cx={point.x}
              cy={point.y}
              r={index === activeSafeIndex ? 5 : 3.5}
            />
            <circle
              className="momentum-chart-hit-area"
              cx={point.x}
              cy={point.y}
              r={15}
            />
          </g>
        ))}
        {axisLabels.map((label, index) => (
          <text
            className="momentum-chart-x-label"
            key={label}
            x={left + (index / (axisLabels.length - 1)) * plotWidth}
            y={height - 10}
            textAnchor={
              index === 0
                ? "start"
                : index === axisLabels.length - 1
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
          +{compactNumber(repository.starGain, locale)}{" "}
          {locale === "zh" ? "Star" : "stars"}
        </text>
      </svg>
      <div className="momentum-chart-controls">
        {points.map((point, index) => (
          <button
            aria-pressed={index === activeSafeIndex}
            key={index}
            onClick={() => setActiveIndex(index)}
            onFocus={() => setActiveIndex(index)}
            type="button"
          >
            <span>{index + 1}</span>
            <strong>+{compactNumber(point.value, locale)}</strong>
          </button>
        ))}
      </div>
    </div>
  )
}
