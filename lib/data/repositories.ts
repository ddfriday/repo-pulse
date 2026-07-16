import "server-only"

import { cache } from "react"

import { getSampleRankings } from "@/lib/sample-data"
import { createPublicSupabaseClient } from "@/lib/supabase/server"
import type { Period, RankedRepository, RankingBundle } from "@/lib/types"

const PERIOD_HOURS: Record<Period, number> = {
  daily: 24,
  weekly: 168,
  monthly: 720,
}

type RankingRow = {
  repository_id: number
  full_name: string
  owner: string
  name: string
  description: string | null
  html_url: string
  homepage: string | null
  language: string | null
  topics: string[] | null
  stars_count: number
  forks_count: number
  star_gain: number
  fork_gain: number
  momentum_score: number
  trend: number[] | null
  pushed_at: string
  captured_at: string
}

function toRepository(row: RankingRow): RankedRepository {
  return {
    id: Number(row.repository_id),
    fullName: row.full_name,
    owner: row.owner,
    name: row.name,
    description: row.description ?? "No description provided.",
    url: row.html_url,
    homepage: row.homepage,
    language: row.language ?? "Other",
    topics: row.topics ?? [],
    stars: Number(row.stars_count),
    forks: Number(row.forks_count),
    starGain: Number(row.star_gain),
    forkGain: Number(row.fork_gain),
    momentumScore: Number(row.momentum_score),
    trend: (row.trend ?? []).map(Number),
    pushedAt: row.pushed_at,
  }
}

export const getRepositoryRankings = cache(
  async (period: Period): Promise<RankingBundle> => {
    const supabase = createPublicSupabaseClient()

    if (!supabase) {
      return getSampleRankings(period)
    }

    const { data, error } = await supabase.rpc("get_repository_rankings", {
      p_result_limit: 100,
      p_window_hours: PERIOD_HOURS[period],
    })

    if (error || !data?.length) {
      console.warn("RepoPulse is using sample rankings:", error?.message)
      return getSampleRankings(period)
    }

    const rows = data as RankingRow[]

    return {
      items: rows.map(toRepository),
      mode: "live",
      updatedAt: rows[0].captured_at,
    }
  }
)
