import type { Period, RankedRepository, RankingBundle } from "@/lib/types"

type SampleRepository = Omit<
  RankedRepository,
  "starGain" | "forkGain" | "momentumScore" | "trend"
> & {
  createdAt: string
  weeklyStars: number
  weeklyForks: number
  weeklyTrend: number[]
}

const SAMPLE_REPOSITORIES: SampleRepository[] = [
  {
    id: 1,
    fullName: "Shpigford/knockoff",
    owner: "Shpigford",
    name: "knockoff",
    description:
      "Chrome extension that filters pseudo-brand junk out of Amazon.",
    url: "https://github.com/Shpigford/knockoff",
    homepage: "https://knockoff.co",
    language: "JavaScript",
    topics: ["browser-extension", "consumer-tools", "shopping"],
    aiCategory: null,
    aiCategoryZh: null,
    aiSummary: null,
    aiSummaryZh: null,
    aiAudience: null,
    aiAudienceZh: null,
    aiReason: null,
    aiReasonZh: null,
    aiSignals: [],
    aiSignalsZh: [],
    aiModel: null,
    aiEnrichedAt: null,
    stars: 1937,
    forks: 70,
    weeklyStars: 1440,
    weeklyForks: 48,
    weeklyTrend: [72, 126, 218, 364, 592, 831, 1124, 1440],
    createdAt: "2026-07-06T15:06:06.000Z",
    pushedAt: "2026-07-17T19:12:51.000Z",
  },
  {
    id: 3,
    fullName: "pixel-point/aval",
    owner: "pixel-point",
    name: "aval",
    description:
      "Open format for interactive video with state machines and frame-accurate transitions.",
    url: "https://github.com/pixel-point/aval",
    homepage: "https://pixelpoint.io/aval",
    language: "TypeScript",
    topics: ["interactive-video", "web", "media-tools"],
    aiCategory: null,
    aiCategoryZh: null,
    aiSummary: null,
    aiSummaryZh: null,
    aiAudience: null,
    aiAudienceZh: null,
    aiReason: null,
    aiReasonZh: null,
    aiSignals: [],
    aiSignalsZh: [],
    aiModel: null,
    aiEnrichedAt: null,
    stars: 1165,
    forks: 63,
    weeklyStars: 990,
    weeklyForks: 47,
    weeklyTrend: [28, 88, 171, 303, 496, 692, 851, 990],
    createdAt: "2026-07-13T07:42:51.000Z",
    pushedAt: "2026-07-17T14:31:21.000Z",
  },
  {
    id: 2,
    fullName: "littledivy/mimic",
    owner: "littledivy",
    name: "mimic",
    description: "Intercept any app, then call it from Python like a library.",
    url: "https://github.com/littledivy/mimic",
    homepage: "",
    language: "Python",
    topics: ["python", "automation", "developer-tools"],
    aiCategory: null,
    aiCategoryZh: null,
    aiSummary: null,
    aiSummaryZh: null,
    aiAudience: null,
    aiAudienceZh: null,
    aiReason: null,
    aiReasonZh: null,
    aiSignals: [],
    aiSignalsZh: [],
    aiModel: null,
    aiEnrichedAt: null,
    stars: 1149,
    forks: 67,
    weeklyStars: 910,
    weeklyForks: 52,
    weeklyTrend: [21, 61, 152, 266, 421, 618, 791, 910],
    createdAt: "2026-07-13T05:13:00.000Z",
    pushedAt: "2026-07-15T04:14:38.000Z",
  },
  {
    id: 4,
    fullName: "Sahir619/fable-method",
    owner: "Sahir619",
    name: "fable-method",
    description:
      "A workflow for model skills with an evaluation loop: think, act, prove.",
    url: "https://github.com/Sahir619/fable-method",
    homepage: null,
    language: "Python",
    topics: ["ai-agents", "evals", "agent-skills"],
    aiCategory: "AI agent evaluation workflow",
    aiCategoryZh: "AI 智能体评估工作流",
    aiSummary:
      "A structured workflow for building and evaluating model skills through repeated think, act, and prove cycles.",
    aiSummaryZh:
      "通过反复执行思考、行动和验证，为模型技能提供一套结构化的构建与评估流程。",
    aiAudience:
      "AI agent builders and teams designing repeatable skill evaluations",
    aiAudienceZh: "构建 AI 智能体及设计可复用技能评估流程的开发者团队",
    aiReason:
      "Rapid early adoption suggests strong demand for practical, testable agent workflows.",
    aiReasonZh:
      "项目早期增长迅速，说明开发者正在寻找更实用、可验证的智能体工作流。",
    aiSignals: [
      "agent skills",
      "evaluation loop",
      "repeatable workflow",
      "fast early traction",
    ],
    aiSignalsZh: ["智能体技能", "评估闭环", "可复用流程", "早期增长快"],
    aiModel: "sensenova-6.7-flash-lite",
    aiEnrichedAt: "2026-07-18T02:20:00.000Z",
    stars: 1654,
    forks: 231,
    weeklyStars: 1320,
    weeklyForks: 174,
    weeklyTrend: [49, 134, 246, 421, 672, 911, 1142, 1320],
    createdAt: "2026-07-06T22:35:18.000Z",
    pushedAt: "2026-07-15T15:11:12.000Z",
  },
  {
    id: 6,
    fullName: "yynxxxxx/Codex-X",
    owner: "yynxxxxx",
    name: "Codex-X",
    description: "Desktop manager for switching Codex profiles and prompts.",
    url: "https://github.com/yynxxxxx/Codex-X",
    homepage: "https://github.com/yynxxxxx/Codex-X",
    language: "Rust",
    topics: ["codex", "desktop", "developer-tools"],
    aiCategory: null,
    aiCategoryZh: null,
    aiSummary: null,
    aiSummaryZh: null,
    aiAudience: null,
    aiAudienceZh: null,
    aiReason: null,
    aiReasonZh: null,
    aiSignals: [],
    aiSignalsZh: [],
    aiModel: null,
    aiEnrichedAt: null,
    stars: 1262,
    forks: 193,
    weeklyStars: 1030,
    weeklyForks: 151,
    weeklyTrend: [31, 94, 188, 327, 516, 705, 899, 1030],
    createdAt: "2026-07-04T03:28:35.000Z",
    pushedAt: "2026-07-16T13:48:10.000Z",
  },
  {
    id: 5,
    fullName: "vinhhien112/Three.js-Object-Sculptor-Codex-Plugin",
    owner: "vinhhien112",
    name: "Three.js-Object-Sculptor-Codex-Plugin",
    description:
      "Codex plugin that turns object images into procedural Three.js models.",
    url: "https://github.com/vinhhien112/Three.js-Object-Sculptor-Codex-Plugin",
    homepage: null,
    language: "Python",
    topics: ["codex", "threejs", "procedural-modeling"],
    aiCategory: null,
    aiCategoryZh: null,
    aiSummary: null,
    aiSummaryZh: null,
    aiAudience: null,
    aiAudienceZh: null,
    aiReason: null,
    aiReasonZh: null,
    aiSignals: [],
    aiSignalsZh: [],
    aiModel: null,
    aiEnrichedAt: null,
    stars: 1084,
    forks: 124,
    weeklyStars: 840,
    weeklyForks: 95,
    weeklyTrend: [24, 76, 139, 251, 386, 552, 711, 840],
    createdAt: "2026-07-09T16:23:29.000Z",
    pushedAt: "2026-07-17T16:56:59.000Z",
  },
  {
    id: 7,
    fullName: "Robbyant/lingbot-world-v2",
    owner: "Robbyant",
    name: "lingbot-world-v2",
    description: "Infinite worlds with versatile interactions.",
    url: "https://github.com/Robbyant/lingbot-world-v2",
    homepage: "https://technology.robbyant.com/lingbot-world-v2",
    language: "Python",
    topics: ["ai", "simulation", "interactive-worlds"],
    aiCategory: null,
    aiCategoryZh: null,
    aiSummary: null,
    aiSummaryZh: null,
    aiAudience: null,
    aiAudienceZh: null,
    aiReason: null,
    aiReasonZh: null,
    aiSignals: [],
    aiSignalsZh: [],
    aiModel: null,
    aiEnrichedAt: null,
    stars: 1282,
    forks: 78,
    weeklyStars: 960,
    weeklyForks: 54,
    weeklyTrend: [35, 111, 203, 341, 503, 684, 842, 960],
    createdAt: "2026-07-08T09:24:50.000Z",
    pushedAt: "2026-07-14T14:04:37.000Z",
  },
  {
    id: 8,
    fullName: "MaximeRivest/riddle",
    owner: "MaximeRivest",
    name: "riddle",
    description:
      "A reMarkable Paper Pro diary app that answers handwritten notes.",
    url: "https://github.com/MaximeRivest/riddle",
    homepage: null,
    language: "Rust",
    topics: ["eink", "handwriting", "creative-tools"],
    aiCategory: null,
    aiCategoryZh: null,
    aiSummary: null,
    aiSummaryZh: null,
    aiAudience: null,
    aiAudienceZh: null,
    aiReason: null,
    aiReasonZh: null,
    aiSignals: [],
    aiSignalsZh: [],
    aiModel: null,
    aiEnrichedAt: null,
    stars: 1656,
    forks: 150,
    weeklyStars: 1180,
    weeklyForks: 101,
    weeklyTrend: [42, 128, 244, 396, 617, 821, 1024, 1180],
    createdAt: "2026-07-05T15:48:08.000Z",
    pushedAt: "2026-07-12T23:53:42.000Z",
  },
]

const PERIOD_MULTIPLIERS: Record<Period, number> = {
  daily: 0.18,
  weekly: 1,
  monthly: 3.65,
}

const SAMPLE_UPDATED_AT = "2026-07-18T02:20:00.000Z"

function sampleDaysSince(isoDate: string) {
  return Math.max(
    (Date.parse(SAMPLE_UPDATED_AT) - Date.parse(isoDate)) / 86_400_000,
    1
  )
}

function sampleDiscoveryScore({
  forks,
  forkGain,
  pushedAt,
  starGain,
  stars,
  createdAt,
}: {
  createdAt: string
  forks: number
  forkGain: number
  pushedAt: string
  starGain: number
  stars: number
}) {
  const repositoryAgeDays = sampleDaysSince(createdAt)
  const activityAgeDays = sampleDaysSince(pushedAt)
  const velocityScore = Math.min(
    (starGain / Math.sqrt(Math.max(stars, 1))) * 45,
    160
  )
  const forkVelocityScore = Math.min(
    (forkGain / Math.sqrt(Math.max(forks, 1))) * 35,
    100
  )
  const tractionScore = Math.min(
    Math.log1p(stars) * 12 + Math.log1p(forks) * 8,
    100
  )
  const ageBoost =
    repositoryAgeDays <= 14
      ? 130
      : repositoryAgeDays <= 30
        ? 105
        : repositoryAgeDays <= 90
          ? 70
          : repositoryAgeDays <= 180
            ? 40
            : repositoryAgeDays <= 365
              ? 18
              : 0
  const activityBoost =
    activityAgeDays <= 3
      ? 60
      : activityAgeDays <= 7
        ? 45
        : activityAgeDays <= 30
          ? 25
          : activityAgeDays <= 90
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

  return Math.max(
    0,
    Math.round(
      (Math.min(starGain, 500) * 0.12 +
        Math.min(forkGain, 150) * 0.5 +
        velocityScore +
        forkVelocityScore +
        tractionScore +
        ageBoost +
        activityBoost -
        sizePenalty) *
        10
    ) / 10
  )
}

export function getSampleRankings(period: Period): RankingBundle {
  const multiplier = PERIOD_MULTIPLIERS[period]
  const items = SAMPLE_REPOSITORIES.map((repository) => {
    const { createdAt, weeklyStars, weeklyForks, weeklyTrend, ...details } =
      repository
    const starGain = Math.round(weeklyStars * multiplier)
    const forkGain = Math.round(weeklyForks * multiplier)
    const trend = weeklyTrend.map((value) =>
      Math.max(1, Math.round(value * multiplier))
    )

    return {
      ...details,
      starGain,
      forkGain,
      momentumScore: sampleDiscoveryScore({
        createdAt,
        forks: details.forks,
        forkGain,
        pushedAt: details.pushedAt,
        starGain,
        stars: details.stars,
      }),
      trend,
    }
  }).toSorted((a, b) => b.momentumScore - a.momentumScore)

  return {
    items,
    mode: "sample",
    updatedAt: SAMPLE_UPDATED_AT,
  }
}
