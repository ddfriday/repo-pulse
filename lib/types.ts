export const PERIODS = ["daily", "weekly", "monthly"] as const
export type Period = (typeof PERIODS)[number]

export const SORT_KEYS = ["stars", "forks", "momentum"] as const
export type SortKey = (typeof SORT_KEYS)[number]

export type DataMode = "live" | "sample"

export type RankedRepository = {
  id: number
  fullName: string
  owner: string
  name: string
  description: string
  url: string
  homepage: string | null
  language: string
  topics: string[]
  stars: number
  forks: number
  starGain: number
  forkGain: number
  momentumScore: number
  trend: number[]
  pushedAt: string
}

export type RankingBundle = {
  items: RankedRepository[]
  mode: DataMode
  updatedAt: string
}

export type RankingsByPeriod = Record<Period, RankingBundle>

export type InitialFilters = {
  period: Period
  query: string
  language: string
  topic: string
  sort: SortKey
}

export function isPeriod(value: unknown): value is Period {
  return typeof value === "string" && PERIODS.includes(value as Period)
}

export function isSortKey(value: unknown): value is SortKey {
  return typeof value === "string" && SORT_KEYS.includes(value as SortKey)
}
