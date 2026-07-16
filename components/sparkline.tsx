import { cn } from "@/lib/utils"

function normalizePoints(values: number[], width: number, height: number) {
  const safeValues =
    values.length > 1 ? values : [values[0] ?? 0, values[0] ?? 0]
  const min = Math.min(...safeValues)
  const max = Math.max(...safeValues)
  const range = Math.max(max - min, 1)

  return safeValues
    .map((value, index) => {
      const x = (index / (safeValues.length - 1)) * width
      const y = height - ((value - min) / range) * (height - 6) - 3
      return x.toFixed(2) + "," + y.toFixed(2)
    })
    .join(" ")
}

export function Sparkline({
  values,
  className,
  label,
}: {
  values: number[]
  className?: string
  label: string
}) {
  const width = 132
  const height = 38
  const points = normalizePoints(values, width, height)
  const lastPoint = points.split(" ").at(-1)?.split(",") ?? ["0", "0"]

  return (
    <svg
      className={cn("sparkline", className)}
      role="img"
      aria-label={label}
      viewBox={"0 0 " + width + " " + height}
    >
      <polyline points={points} fill="none" vectorEffect="non-scaling-stroke" />
      <circle cx={lastPoint[0]} cy={lastPoint[1]} r="3.5" />
    </svg>
  )
}
