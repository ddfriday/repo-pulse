import type { Period, RankedRepository, RankingBundle } from "@/lib/types"

type SampleRepository = Omit<
  RankedRepository,
  "starGain" | "forkGain" | "momentumScore" | "trend"
> & {
  weeklyStars: number
  weeklyForks: number
  weeklyTrend: number[]
}

const SAMPLE_REPOSITORIES: SampleRepository[] = [
  {
    id: 1,
    fullName: "mendableai/firecrawl",
    owner: "mendableai",
    name: "firecrawl",
    description: "Turn websites into LLM-ready data.",
    url: "https://github.com/mendableai/firecrawl",
    homepage: "https://firecrawl.dev",
    language: "TypeScript",
    topics: ["ai", "web-crawling", "developer-tools"],
    stars: 45300,
    forks: 4200,
    weeklyStars: 3214,
    weeklyForks: 612,
    weeklyTrend: [284, 318, 402, 531, 489, 604, 760, 826],
    pushedAt: "2026-07-16T03:12:00.000Z",
  },
  {
    id: 2,
    fullName: "ollama/ollama",
    owner: "ollama",
    name: "ollama",
    description: "Run large language models locally.",
    url: "https://github.com/ollama/ollama",
    homepage: "https://ollama.com",
    language: "Go",
    topics: ["ai", "llm", "local-first"],
    stars: 113000,
    forks: 14200,
    weeklyStars: 2742,
    weeklyForks: 498,
    weeklyTrend: [241, 379, 305, 416, 388, 511, 486, 633],
    pushedAt: "2026-07-16T02:45:00.000Z",
  },
  {
    id: 3,
    fullName: "grafana/k6",
    owner: "grafana",
    name: "k6",
    description: "A modern load testing tool for developers.",
    url: "https://github.com/grafana/k6",
    homepage: "https://k6.io",
    language: "Go",
    topics: ["testing", "performance", "developer-tools"],
    stars: 27600,
    forks: 1400,
    weeklyStars: 2117,
    weeklyForks: 372,
    weeklyTrend: [198, 237, 262, 241, 309, 288, 354, 428],
    pushedAt: "2026-07-15T21:09:00.000Z",
  },
  {
    id: 4,
    fullName: "microsoft/autogen",
    owner: "microsoft",
    name: "autogen",
    description: "A framework for building multi-agent applications.",
    url: "https://github.com/microsoft/autogen",
    homepage: "https://microsoft.github.io/autogen",
    language: "Python",
    topics: ["ai", "agents", "framework"],
    stars: 28400,
    forks: 4100,
    weeklyStars: 1842,
    weeklyForks: 305,
    weeklyTrend: [174, 193, 241, 213, 284, 251, 332, 349],
    pushedAt: "2026-07-15T19:24:00.000Z",
  },
  {
    id: 5,
    fullName: "supabase/supabase",
    owner: "supabase",
    name: "supabase",
    description: "The open source Firebase alternative.",
    url: "https://github.com/supabase/supabase",
    homepage: "https://supabase.com",
    language: "TypeScript",
    topics: ["database", "postgres", "developer-tools"],
    stars: 71200,
    forks: 7900,
    weeklyStars: 1621,
    weeklyForks: 281,
    weeklyTrend: [133, 184, 166, 221, 203, 276, 251, 319],
    pushedAt: "2026-07-16T04:01:00.000Z",
  },
  {
    id: 6,
    fullName: "hashicorp/terraform",
    owner: "hashicorp",
    name: "terraform",
    description: "Infrastructure as code for any cloud.",
    url: "https://github.com/hashicorp/terraform",
    homepage: "https://terraform.io",
    language: "Go",
    topics: ["infrastructure", "devops", "cloud"],
    stars: 44900,
    forks: 9600,
    weeklyStars: 1298,
    weeklyForks: 210,
    weeklyTrend: [112, 142, 189, 126, 201, 179, 224, 246],
    pushedAt: "2026-07-15T16:40:00.000Z",
  },
  {
    id: 7,
    fullName: "vercel/next.js",
    owner: "vercel",
    name: "next.js",
    description: "The React framework for the web.",
    url: "https://github.com/vercel/next.js",
    homepage: "https://nextjs.org",
    language: "JavaScript",
    topics: ["react", "framework", "web"],
    stars: 135000,
    forks: 29100,
    weeklyStars: 1187,
    weeklyForks: 196,
    weeklyTrend: [106, 131, 144, 167, 159, 188, 201, 227],
    pushedAt: "2026-07-16T05:12:00.000Z",
  },
  {
    id: 8,
    fullName: "huggingface/transformers",
    owner: "huggingface",
    name: "transformers",
    description: "State-of-the-art machine learning for every modality.",
    url: "https://github.com/huggingface/transformers",
    homepage: "https://huggingface.co/docs/transformers",
    language: "Python",
    topics: ["ai", "machine-learning", "python"],
    stars: 148000,
    forks: 29800,
    weeklyStars: 1032,
    weeklyForks: 184,
    weeklyTrend: [92, 118, 109, 147, 139, 162, 179, 196],
    pushedAt: "2026-07-16T01:30:00.000Z",
  },
]

const PERIOD_MULTIPLIERS: Record<Period, number> = {
  daily: 0.18,
  weekly: 1,
  monthly: 3.65,
}

export function getSampleRankings(period: Period): RankingBundle {
  const multiplier = PERIOD_MULTIPLIERS[period]
  const items = SAMPLE_REPOSITORIES.map((repository) => {
    const { weeklyStars, weeklyForks, weeklyTrend, ...details } = repository
    const starGain = Math.round(weeklyStars * multiplier)
    const forkGain = Math.round(weeklyForks * multiplier)
    const trend = weeklyTrend.map((value) =>
      Math.max(1, Math.round(value * multiplier))
    )

    return {
      ...details,
      starGain,
      forkGain,
      momentumScore:
        Math.round((starGain * 0.55 + forkGain * 1.8 + 25) * 10) / 10,
      trend,
    }
  }).toSorted((a, b) => b.starGain - a.starGain)

  return {
    items,
    mode: "sample",
    updatedAt: "2026-07-16T10:24:00.000Z",
  }
}
