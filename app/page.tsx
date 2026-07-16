import type { Metadata } from "next"

import { RepoPulseDashboard } from "@/components/repo-pulse-dashboard"
import { getRepositoryRankings } from "@/lib/data/repositories"
import {
  isLocale,
  isPeriod,
  isSortKey,
  type InitialFilters,
  type RankingsByPeriod,
} from "@/lib/types"

type SearchParams = Promise<{
  lang?: string | string[]
  language?: string | string[]
  period?: string | string[]
  q?: string | string[]
  sort?: string | string[]
  topic?: string | string[]
}>

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams
}): Promise<Metadata> {
  const query = await searchParams
  const requestedLocale = firstValue(query.lang)
  const locale = isLocale(requestedLocale) ? requestedLocale : "en"

  if (locale === "zh") {
    const title = "RepoPulse — 发现正在崛起的 GitHub 项目"
    const description =
      "通过 Star、Fork、版本发布和活跃度，发现热门及正在崛起的 GitHub 开源项目。"

    return {
      title: { absolute: title },
      description,
      openGraph: { title, description },
      twitter: { title, description },
    }
  }

  const title = "RepoPulse — Discover rising GitHub repositories"
  const description =
    "Discover rising and popular GitHub repositories through stars, forks, activity, and growth trends."

  return {
    title: { absolute: title },
    description,
    openGraph: { title, description },
    twitter: { title, description },
  }
}

export default async function Page({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const query = await searchParams
  const requestedPeriod = firstValue(query.period)
  const requestedSort = firstValue(query.sort)
  const requestedLocale = firstValue(query.lang)

  const initialFilters: InitialFilters = {
    locale: isLocale(requestedLocale) ? requestedLocale : "en",
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
