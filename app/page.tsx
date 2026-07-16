import { RepoPulseDashboard } from "@/components/repo-pulse-dashboard"
import { getRepositoryRankings } from "@/lib/data/repositories"
import {
  isPeriod,
  isSortKey,
  type InitialFilters,
  type RankingsByPeriod,
} from "@/lib/types"

type SearchParams = Promise<{
  language?: string | string[]
  period?: string | string[]
  q?: string | string[]
  sort?: string | string[]
  topic?: string | string[]
}>

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}

export default async function Page({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const query = await searchParams
  const requestedPeriod = firstValue(query.period)
  const requestedSort = firstValue(query.sort)

  const initialFilters: InitialFilters = {
    period: isPeriod(requestedPeriod) ? requestedPeriod : "weekly",
    query: firstValue(query.q) ?? "",
    language: firstValue(query.language) ?? "all",
    topic: firstValue(query.topic) ?? "all",
    sort: isSortKey(requestedSort) ? requestedSort : "stars",
  }

  const [daily, weekly, monthly] = await Promise.all([
    getRepositoryRankings("daily"),
    getRepositoryRankings("weekly"),
    getRepositoryRankings("monthly"),
  ])

  const rankings: RankingsByPeriod = { daily, weekly, monthly }

  return (
    <RepoPulseDashboard initialFilters={initialFilters} rankings={rankings} />
  )
}
