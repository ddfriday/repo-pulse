import { createClient } from "@supabase/supabase-js"
import { Octokit } from "octokit"

const githubToken = process.env.GITHUB_TOKEN
const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const maxRepositories = Number(process.env.MAX_REPOSITORIES ?? 250)

if (!githubToken) throw new Error("GITHUB_TOKEN is required")
if (!supabaseUrl) throw new Error("SUPABASE_URL is required")
if (!supabaseServiceRoleKey) {
  throw new Error("SUPABASE_SERVICE_ROLE_KEY is required")
}

const octokit = new Octokit({ auth: githubToken })
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

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

const searchQueries = [
  "stars:>500 fork:false archived:false pushed:>=" + isoDateDaysAgo(90),
  "created:>=" + isoDateDaysAgo(30) + " stars:>20 fork:false archived:false",
  "topic:ai stars:>200 fork:false archived:false pushed:>=" +
    isoDateDaysAgo(60),
]

const searchResults = await Promise.all(
  searchQueries.map((query) =>
    octokit.rest.search.repos({
      q: query,
      sort: "stars",
      order: "desc",
      per_page: 100,
    })
  )
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
  .toSorted((left, right) => right.stargazers_count - left.stargazers_count)
  .slice(0, maxRepositories)

const capturedAt = new Date()
capturedAt.setUTCMinutes(0, 0, 0)
const capturedAtIso = capturedAt.toISOString()

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

console.log(
  "Collected " + repositories.length + " repositories at " + capturedAtIso
)
