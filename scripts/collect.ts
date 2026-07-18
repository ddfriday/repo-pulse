import { createClient } from "@supabase/supabase-js"
import { Octokit } from "octokit"

const githubToken = process.env.GITHUB_TOKEN
const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const configuredMaxRepositories = Number(process.env.MAX_REPOSITORIES ?? 500)
const configuredAiInsightLimit = Number(
  process.env.AI_PROJECT_INSIGHTS_LIMIT ?? 25
)
const aiInsightsEnabled = process.env.AI_PROJECT_INSIGHTS_ENABLED === "true"
const maxRepositories = Math.min(
  Math.max(
    Number.isFinite(configuredMaxRepositories)
      ? configuredMaxRepositories
      : 500,
    50
  ),
  1000
)

if (!githubToken) throw new Error("GITHUB_TOKEN is required")
if (!supabaseUrl) throw new Error("SUPABASE_URL is required")
if (!supabaseServiceRoleKey) {
  throw new Error("SUPABASE_SERVICE_ROLE_KEY is required")
}

const octokit = new Octokit({ auth: githubToken })
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})
type SearchRepository = Awaited<
  ReturnType<typeof octokit.rest.search.repos>
>["data"]["items"][number]

type AiInsightConfig = {
  apiKey: string
  baseUrl: string
  limit: number
  model: string
}

type ProjectInsight = {
  audience: string
  category: string
  reason: string
  signals: string[]
  summary: string
}

function isoDateDaysAgo(days: number) {
  const date = new Date()
  date.setUTCDate(date.getUTCDate() - days)
  return date.toISOString().slice(0, 10)
}

function chunk<T>(items: T[], size: number) {
  const batches: T[][] = []
  for (let index = 0; index < items.length; index += size) {
    batches.push(items.slice(index, index + size))
  }
  return batches
}

function clamp(value: number, minimum: number, maximum: number) {
  if (!Number.isFinite(value)) return minimum
  return Math.min(Math.max(value, minimum), maximum)
}

function getAiInsightConfig(): AiInsightConfig | null {
  if (!aiInsightsEnabled) return null

  const usesDeepSeek =
    !process.env.AI_PROJECT_INSIGHTS_API_KEY &&
    !process.env.SENSENOVA_API_KEY &&
    Boolean(process.env.DEEPSEEK_API_KEY)
  const apiKey =
    process.env.AI_PROJECT_INSIGHTS_API_KEY ??
    process.env.SENSENOVA_API_KEY ??
    process.env.DEEPSEEK_API_KEY

  if (!apiKey) {
    console.warn(
      "AI project insights are enabled but no API key is configured."
    )
    return null
  }

  return {
    apiKey,
    baseUrl:
      process.env.AI_PROJECT_INSIGHTS_BASE_URL ??
      process.env.SENSENOVA_BASE_URL ??
      process.env.DEEPSEEK_BASE_URL ??
      (usesDeepSeek
        ? "https://api.deepseek.com"
        : "https://token.sensenova.cn/v1"),
    limit: clamp(configuredAiInsightLimit, 0, Math.min(maxRepositories, 100)),
    model:
      process.env.AI_PROJECT_INSIGHTS_MODEL ??
      process.env.SENSENOVA_MODEL ??
      process.env.DEEPSEEK_MODEL ??
      (usesDeepSeek ? "deepseek-chat" : "sensenova-6.7-flash-lite"),
  }
}

function chatCompletionUrl(baseUrl: string) {
  const trimmed = baseUrl.replace(/\/+$/, "")
  return trimmed.endsWith("/chat/completions")
    ? trimmed
    : trimmed + "/chat/completions"
}

function repositoryOwner(repository: SearchRepository) {
  return repository.owner?.login ?? repository.full_name.split("/")[0]
}

function readJsonObject(text: string) {
  const fencedJson = text.match(/```(?:json)?\s*([\s\S]*?)```/i)
  const candidate = fencedJson?.[1] ?? text
  const start = candidate.indexOf("{")
  const end = candidate.lastIndexOf("}")

  if (start === -1 || end === -1 || end <= start) return null

  try {
    return JSON.parse(candidate.slice(start, end + 1)) as Record<
      string,
      unknown
    >
  } catch {
    return null
  }
}

function textField(value: unknown, fallback: string, maxLength: number) {
  if (typeof value !== "string") return fallback
  const normalized = value.replace(/\s+/g, " ").trim()
  if (!normalized) return fallback
  return normalized.slice(0, maxLength)
}

function normalizeSignals(value: unknown) {
  if (!Array.isArray(value)) return []

  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .slice(0, 5)
}

function normalizeProjectInsight(
  value: Record<string, unknown>,
  repository: SearchRepository
): ProjectInsight {
  const fallbackCategory =
    repository.topics?.find((topic) => topic.length > 2) ??
    repository.language ??
    "Open source project"
  const fallbackSummary =
    repository.description ??
    "No clear project description was available from GitHub metadata."
  const signals = normalizeSignals(value.signals)

  return {
    audience: textField(value.audience, "Developers exploring new tools", 90),
    category: textField(value.category, fallbackCategory, 70),
    reason: textField(
      value.reason,
      "Early traction and recent repository activity make it worth tracking.",
      180
    ),
    signals: signals.length
      ? signals
      : [repository.language, ...(repository.topics ?? [])]
          .filter((item): item is string => Boolean(item))
          .slice(0, 5),
    summary: textField(value.summary, fallbackSummary, 220),
  }
}

function extractAssistantContent(value: unknown) {
  if (!value || typeof value !== "object") return null
  const choices = (value as { choices?: unknown }).choices
  if (!Array.isArray(choices)) return null
  const firstChoice = choices[0]
  if (!firstChoice || typeof firstChoice !== "object") return null
  const message = (firstChoice as { message?: unknown }).message
  if (!message || typeof message !== "object") return null
  const content = (message as { content?: unknown }).content

  return typeof content === "string" ? content : null
}

async function fetchRepositoryReadme(repository: SearchRepository) {
  try {
    const response = await octokit.rest.repos.getReadme({
      owner: repositoryOwner(repository),
      repo: repository.name,
      mediaType: { format: "raw" },
    })
    const data: unknown = response.data

    if (typeof data === "string") return data
    if (
      data &&
      typeof data === "object" &&
      "content" in data &&
      typeof data.content === "string"
    ) {
      return Buffer.from(data.content, "base64").toString("utf8")
    }
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "status" in error &&
      error.status === 404
    ) {
      return ""
    }

    console.warn(
      "README lookup failed for " +
        repository.full_name +
        ": " +
        (error instanceof Error ? error.message : "unknown error")
    )
  }

  return ""
}

async function generateProjectInsight(
  config: AiInsightConfig,
  repository: SearchRepository
) {
  const readme = (await fetchRepositoryReadme(repository)).slice(0, 5000)
  const response = await fetch(chatCompletionUrl(config.baseUrl), {
    body: JSON.stringify({
      max_tokens: 600,
      messages: [
        {
          role: "system",
          content:
            "You classify GitHub repositories for a discovery dashboard. Return only compact JSON.",
        },
        {
          role: "user",
          content:
            "Identify what this project does. Return JSON with category, summary, audience, reason, and signals as an array of short strings.\n\nRepository: " +
            repository.full_name +
            "\nLanguage: " +
            (repository.language ?? "Unknown") +
            "\nStars: " +
            repository.stargazers_count +
            "\nForks: " +
            repository.forks_count +
            "\nTopics: " +
            (repository.topics ?? []).join(", ") +
            "\nDescription: " +
            (repository.description ?? "No description") +
            "\nREADME excerpt:\n" +
            readme,
        },
      ],
      model: config.model,
      temperature: 0.2,
    }),
    headers: {
      Authorization: "Bearer " + config.apiKey,
      "Content-Type": "application/json",
    },
    method: "POST",
  })

  if (!response.ok) {
    console.warn(
      "AI insight request failed for " +
        repository.full_name +
        ": HTTP " +
        response.status
    )
    return null
  }

  const content = extractAssistantContent(await response.json())
  if (!content) return null
  const parsed = readJsonObject(content)

  return parsed ? normalizeProjectInsight(parsed, repository) : null
}

async function collectProjectInsights(
  config: AiInsightConfig,
  repositories: SearchRepository[]
) {
  const insights = new Map<number, ProjectInsight>()

  for (const repository of repositories.slice(0, config.limit)) {
    const insight = await generateProjectInsight(config, repository)
    if (insight) {
      insights.set(repository.id, insight)
      console.log("Generated AI insight for " + repository.full_name)
    }
  }

  return insights
}

type RepositorySearch = {
  label: string
  query: string
  sort: "stars" | "updated"
}

const searchQueries: RepositorySearch[] = [
  {
    label: "fresh early traction",
    query:
      "created:>=" +
      isoDateDaysAgo(14) +
      " stars:>=5 fork:false archived:false",
    sort: "stars",
  },
  {
    label: "new this month",
    query:
      "created:>=" +
      isoDateDaysAgo(45) +
      " stars:10..2000 fork:false archived:false",
    sort: "stars",
  },
  {
    label: "active new quarter",
    query:
      "created:>=" +
      isoDateDaysAgo(120) +
      " stars:25..5000 fork:false archived:false pushed:>=" +
      isoDateDaysAgo(14),
    sort: "stars",
  },
  {
    label: "small active repositories",
    query:
      "pushed:>=" +
      isoDateDaysAgo(7) +
      " stars:10..1500 fork:false archived:false",
    sort: "updated",
  },
  {
    label: "new AI repositories",
    query:
      "topic:ai created:>=" +
      isoDateDaysAgo(180) +
      " stars:20..5000 fork:false archived:false pushed:>=" +
      isoDateDaysAgo(30),
    sort: "stars",
  },
  {
    label: "new agent repositories",
    query:
      "topic:agents created:>=" +
      isoDateDaysAgo(180) +
      " stars:20..5000 fork:false archived:false pushed:>=" +
      isoDateDaysAgo(30),
    sort: "stars",
  },
  {
    label: "new LLM repositories",
    query:
      "topic:llm created:>=" +
      isoDateDaysAgo(180) +
      " stars:20..5000 fork:false archived:false pushed:>=" +
      isoDateDaysAgo(30),
    sort: "stars",
  },
  {
    label: "new MCP repositories",
    query:
      "topic:mcp created:>=" +
      isoDateDaysAgo(365) +
      " stars:10..5000 fork:false archived:false pushed:>=" +
      isoDateDaysAgo(30),
    sort: "stars",
  },
  {
    label: "new developer tools",
    query:
      "topic:developer-tools created:>=" +
      isoDateDaysAgo(180) +
      " stars:20..5000 fork:false archived:false pushed:>=" +
      isoDateDaysAgo(30),
    sort: "stars",
  },
]

const searchResults = await Promise.all(
  searchQueries.map(async (search) => {
    const response = await octokit.rest.search.repos({
      q: search.query,
      sort: search.sort,
      order: "desc",
      per_page: 100,
    })

    console.log(
      "Search " +
        JSON.stringify(search.label) +
        " returned " +
        response.data.items.length +
        " repositories"
    )

    return response
  })
)

const repositoriesById = new Map<
  number,
  (typeof searchResults)[number]["data"]["items"][number]
>()
for (const response of searchResults) {
  for (const repository of response.data.items) {
    repositoriesById.set(repository.id, repository)
  }
}

const repositories = Array.from(repositoriesById.values())
  .toSorted(
    (left, right) =>
      discoveryScore(right) - discoveryScore(left) ||
      right.stargazers_count - left.stargazers_count ||
      right.forks_count - left.forks_count
  )
  .slice(0, maxRepositories)

function daysSince(isoDate: string | null | undefined) {
  if (!isoDate) return 9999

  const timestamp = Date.parse(isoDate)
  if (!Number.isFinite(timestamp)) return 9999

  return Math.max((Date.now() - timestamp) / 86_400_000, 1)
}

function discoveryScore(repository: SearchRepository) {
  const stars = repository.stargazers_count
  const forks = repository.forks_count
  const ageDays = daysSince(repository.created_at)
  const activityDays = Math.min(
    daysSince(repository.pushed_at),
    daysSince(repository.updated_at)
  )
  const starVelocity = stars / Math.max(ageDays, 1)
  const velocityScore = Math.min(starVelocity * 80, 220)
  const tractionScore = Math.min(
    Math.log1p(stars) * 14 + Math.log1p(forks) * 10,
    110
  )
  const ageBoost =
    ageDays <= 14
      ? 130
      : ageDays <= 30
        ? 105
        : ageDays <= 90
          ? 70
          : ageDays <= 180
            ? 40
            : ageDays <= 365
              ? 18
              : 0
  const activityBoost =
    activityDays <= 3
      ? 60
      : activityDays <= 7
        ? 45
        : activityDays <= 30
          ? 25
          : activityDays <= 90
            ? 10
            : 0
  const sizePenalty =
    stars > 100_000
      ? 240
      : stars > 50_000
        ? 180
        : stars > 10_000
          ? 95
          : stars > 5_000
            ? 50
            : stars > 2_000
              ? 25
              : 0
  const quietPenalty = activityDays > 90 ? 50 : activityDays > 30 ? 20 : 0

  return (
    velocityScore +
    tractionScore +
    ageBoost +
    activityBoost -
    sizePenalty -
    quietPenalty
  )
}

console.log(
  "Selected " +
    repositories.length +
    " repositories from " +
    repositoriesById.size +
    " unique candidates"
)

const capturedAt = new Date()
capturedAt.setUTCMinutes(0, 0, 0)
const capturedAtIso = capturedAt.toISOString()
const aiInsightConfig = getAiInsightConfig()
const projectInsights = aiInsightConfig
  ? await collectProjectInsights(aiInsightConfig, repositories)
  : new Map<number, ProjectInsight>()

const repositoryRows = repositories.map((repository) => ({
  id: repository.id,
  node_id: repository.node_id,
  owner: repository.owner?.login ?? repository.full_name.split("/")[0],
  name: repository.name,
  full_name: repository.full_name,
  description: repository.description,
  html_url: repository.html_url,
  homepage: repository.homepage || null,
  language: repository.language,
  topics: repository.topics ?? [],
  license_spdx: repository.license?.spdx_id ?? null,
  stars_count: repository.stargazers_count,
  forks_count: repository.forks_count,
  open_issues_count: repository.open_issues_count,
  is_fork: repository.fork,
  is_archived: repository.archived,
  github_created_at: repository.created_at,
  pushed_at: repository.pushed_at,
  github_updated_at: repository.updated_at,
  collected_at: capturedAtIso,
}))

for (const batch of chunk(repositoryRows, 100)) {
  const { error } = await supabase
    .from("repositories")
    .upsert(batch, { onConflict: "id" })
  if (error) throw new Error("Repository upsert failed: " + error.message)
}

const snapshotRows = repositories.map((repository) => ({
  repository_id: repository.id,
  captured_at: capturedAtIso,
  stars_count: repository.stargazers_count,
  forks_count: repository.forks_count,
  open_issues_count: repository.open_issues_count,
}))

for (const batch of chunk(snapshotRows, 100)) {
  const { error } = await supabase
    .from("repository_snapshots")
    .upsert(batch, { onConflict: "repository_id,captured_at" })
  if (error) throw new Error("Snapshot upsert failed: " + error.message)
}

if (aiInsightConfig && projectInsights.size) {
  for (const [repositoryId, insight] of projectInsights) {
    const { error } = await supabase
      .from("repositories")
      .update({
        ai_audience: insight.audience,
        ai_category: insight.category,
        ai_enriched_at: capturedAtIso,
        ai_model: aiInsightConfig.model,
        ai_reason: insight.reason,
        ai_signals: insight.signals,
        ai_summary: insight.summary,
      })
      .eq("id", repositoryId)

    if (error) throw new Error("AI insight update failed: " + error.message)
  }
}

console.log(
  "Collected " + repositories.length + " repositories at " + capturedAtIso
)
