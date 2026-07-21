"use client"

import {
  type SVGProps,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
} from "react"
import {
  ArrowUpDownIcon,
  BotIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  Code2Icon,
  CompassIcon,
  CpuIcon,
  ExternalLinkIcon,
  LanguagesIcon,
  LinkIcon,
  MenuIcon,
  SearchIcon,
  SearchXIcon,
  SlidersHorizontalIcon,
  SparklesIcon,
  StarIcon,
  TagIcon,
  UsersIcon,
  type LucideIcon,
} from "lucide-react"
import { useRouter } from "next/navigation"

import { MomentumChart } from "@/components/momentum-chart"
import { RepoPulseLogo } from "@/components/repo-pulse-logo"
import { Sparkline } from "@/components/sparkline"
import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import {
  PERIODS,
  isPeriod,
  type InitialFilters,
  type Locale,
  type Period,
  type RankedRepository,
  type RankingBundle,
  type RankingsByPeriod,
  type SortKey,
} from "@/lib/types"

type SelectOption = { label: string; value: string }
type IconComponent = LucideIcon
type ProjectCategoryKey =
  | "aiAgent"
  | "automation"
  | "creative"
  | "developerTool"
  | "library"
  | "newProject"

function GitHubMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M12 .7a11.5 11.5 0 0 0-3.64 22.41c.58.11.79-.25.79-.56v-2.23c-3.22.7-3.9-1.37-3.9-1.37-.53-1.34-1.28-1.7-1.28-1.7-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.74-1.55-2.57-.29-5.27-1.29-5.27-5.73 0-1.27.45-2.3 1.19-3.11-.12-.29-.52-1.47.11-3.07 0 0 .97-.31 3.16 1.19a10.96 10.96 0 0 1 5.76 0c2.19-1.5 3.16-1.19 3.16-1.19.63 1.6.23 2.78.11 3.07.74.81 1.19 1.84 1.19 3.11 0 4.45-2.71 5.43-5.29 5.72.42.36.79 1.07.79 2.16v3.2c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .7Z" />
    </svg>
  )
}

const PERIOD_LABELS: Record<Locale, Record<Period, string>> = {
  en: {
    daily: "Daily",
    weekly: "Weekly",
    monthly: "Monthly",
  },
  zh: {
    daily: "每日",
    weekly: "每周",
    monthly: "每月",
  },
}

const COPY = {
  en: {
    documentTitle: "RepoPulse — Discover new GitHub repositories",
    switchLanguage: "中文",
    switchLanguageAria: "Switch to Simplified Chinese",
    navigation: [
      { label: "Explore", href: "#explore", active: true },
      { label: "AI Insight", href: "#ai-insight", active: false },
      { label: "Rankings", href: "#rankings", active: false },
      { label: "New & Rising", href: "#rankings", active: false },
    ],
    primaryNavigation: "Primary navigation",
    openNavigation: "Open navigation",
    mobileNavigationTitle: "RepoPulse navigation",
    mobileNavigationDescription: "Jump to rankings and project insight.",
    mobileNavigation: "Mobile navigation",
    heroTitle: "Discover what's rising on GitHub",
    heroDescription:
      "Surface young repositories with fast early traction and recent activity.",
    quickLinks: [
      { label: "Rankings", href: "#rankings" },
      { label: "AI insight", href: "#ai-insight" },
      {
        label: "Source code",
        href: "https://github.com/ddfriday/repo-pulse",
        external: true,
      },
    ],
    searchAria: "Search repositories",
    searchPlaceholder: "Search repositories...",
    filters: "Filters",
    filterTitle: "Filter repositories",
    filterDescription: "Narrow the ranking by language and topic.",
    languageFilter: "Filter by language",
    topicFilter: "Filter by topic",
    sortRepositories: "Sort repositories",
    allLanguages: "All languages",
    allTopics: "All topics",
    done: "Done",
    sampleData: "Sample data",
    liveSnapshot: "Live snapshot",
    updated: "Updated",
    repository: "repository",
    repositories: "repositories",
    rank: "Rank",
    repositoryHeading: "Repository",
    starsGained: "Stars gained",
    forksGained: "Forks gained",
    trend: "Trend",
    growthTrend: "growth trend",
    showLess: "Show less",
    showMore: "Show more",
    emptyTitle: "No repositories found",
    emptyDescription:
      "Try a broader search or reset the language and topic filters.",
    resetFilters: "Reset filters",
    rankingDetails: "Ranking details",
    momentumOverview: "Discovery overview",
    openRepository: "Open repository",
    openHomepage: "Open homepage",
    growth: "growth",
    aiInsightEyebrow: "Project read",
    aiInsightTitle: "AI project insight",
    aiInsightSourceAi: "AI model",
    aiInsightSourceMetadata: "Metadata",
    aiSummaryLabel: "Project brief",
    aiCategory: "Type",
    aiAudience: "Audience",
    aiReason: "Why now",
    aiSignals: "Signals",
    aiModelPending: "Waiting for the first README analysis.",
    aiModelName: "Model",
    aiUpdated: "Updated",
    aiCategoryLabels: {
      aiAgent: "AI / agent app",
      automation: "Automation workflow",
      creative: "Creative or media tool",
      developerTool: "Developer tool",
      library: "Library / framework",
      newProject: "New OSS project",
    },
    footer:
      "Tracking public repositories. Historical coverage grows over time.",
    sortOptions: [
      { label: "Stars gained", value: "stars" },
      { label: "Forks gained", value: "forks" },
      { label: "Discovery score", value: "momentum" },
    ],
  },
  zh: {
    documentTitle: "RepoPulse — 发现新的 GitHub 项目",
    switchLanguage: "EN",
    switchLanguageAria: "切换到英文",
    navigation: [
      { label: "探索", href: "#explore", active: true },
      { label: "AI 识别", href: "#ai-insight", active: false },
      { label: "排行榜", href: "#rankings", active: false },
      { label: "新锐项目", href: "#rankings", active: false },
    ],
    primaryNavigation: "主导航",
    openNavigation: "打开导航菜单",
    mobileNavigationTitle: "RepoPulse 导航",
    mobileNavigationDescription: "快速前往排行榜和项目识别。",
    mobileNavigation: "移动端导航",
    heroTitle: "发现 GitHub 新锐项目",
    heroDescription: "优先发现近期出现、早期增长快、仍在活跃更新的新锐项目。",
    quickLinks: [
      { label: "看排行榜", href: "#rankings" },
      { label: "AI 识别", href: "#ai-insight" },
      {
        label: "源码仓库",
        href: "https://github.com/ddfriday/repo-pulse",
        external: true,
      },
    ],
    searchAria: "搜索仓库",
    searchPlaceholder: "搜索仓库名称、描述或 Topic...",
    filters: "筛选",
    filterTitle: "筛选仓库",
    filterDescription: "按编程语言和 Topic 缩小排行榜范围。",
    languageFilter: "按编程语言筛选",
    topicFilter: "按 Topic 筛选",
    sortRepositories: "仓库排序方式",
    allLanguages: "全部语言",
    allTopics: "全部 Topic",
    done: "完成",
    sampleData: "示例数据",
    liveSnapshot: "实时快照",
    updated: "更新于",
    repository: "个仓库",
    repositories: "个仓库",
    rank: "排名",
    repositoryHeading: "仓库",
    starsGained: "新增 Star",
    forksGained: "新增 Fork",
    trend: "趋势",
    growthTrend: "增长趋势",
    showLess: "收起",
    showMore: "查看更多",
    emptyTitle: "没有找到仓库",
    emptyDescription: "请尝试更宽泛的关键词，或重置语言和 Topic 筛选。",
    resetFilters: "重置筛选",
    rankingDetails: "排行榜详情",
    momentumOverview: "发现分概览",
    openRepository: "打开仓库",
    openHomepage: "打开主页",
    growth: "增长",
    aiInsightEyebrow: "项目内容识别",
    aiInsightTitle: "AI 项目识别",
    aiInsightSourceAi: "AI 模型",
    aiInsightSourceMetadata: "元数据",
    aiSummaryLabel: "项目简报",
    aiCategory: "类型",
    aiAudience: "适合人群",
    aiReason: "为什么值得看",
    aiSignals: "识别信号",
    aiModelPending: "等待首次 README 模型识别。",
    aiModelName: "模型",
    aiUpdated: "更新于",
    aiCategoryLabels: {
      aiAgent: "AI / 智能体应用",
      automation: "自动化工作流",
      creative: "创意或媒体工具",
      developerTool: "开发者工具",
      library: "库 / 框架",
      newProject: "新开源项目",
    },
    footer: "正在追踪公开仓库；随着采集持续进行，历史数据覆盖会逐步增长。",
    sortOptions: [
      { label: "按新增 Star", value: "stars" },
      { label: "按新增 Fork", value: "forks" },
      { label: "按发现分", value: "momentum" },
    ],
  },
} as const

const PROJECT_CATEGORY_RULES: Array<{
  key: ProjectCategoryKey
  terms: string[]
}> = [
  {
    key: "aiAgent",
    terms: [
      "agent",
      "agents",
      "ai",
      "chatbot",
      "codex",
      "llm",
      "mcp",
      "model",
      "rag",
    ],
  },
  {
    key: "developerTool",
    terms: [
      "cli",
      "compiler",
      "database",
      "developer-tools",
      "devtool",
      "framework",
      "sdk",
      "testing",
    ],
  },
  {
    key: "automation",
    terms: ["automation", "bot", "browser", "pipeline", "scraper", "workflow"],
  },
  {
    key: "creative",
    terms: [
      "3d",
      "audio",
      "creative",
      "design",
      "image",
      "media",
      "threejs",
      "video",
    ],
  },
  {
    key: "library",
    terms: ["component", "library", "package", "plugin", "ui"],
  },
]

function compactNumber(value: number, locale: Locale) {
  return Intl.NumberFormat(locale === "zh" ? "zh-CN" : "en", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value)
}

function formatUpdatedAt(value: string, locale: Locale) {
  return new Intl.DateTimeFormat(locale === "zh" ? "zh-CN" : "en", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
    timeZoneName: "short",
  }).format(new Date(value))
}

function urlWithParameter(name: string, value: string, defaultValue?: string) {
  const url = new URL(window.location.href)

  if (!value || value === defaultValue) {
    url.searchParams.delete(name)
  } else {
    url.searchParams.set(name, value)
  }

  return url.pathname + url.search + url.hash
}

function updateUrlParameter(
  name: string,
  value: string,
  defaultValue?: string
) {
  window.history.replaceState(
    null,
    "",
    urlWithParameter(name, value, defaultValue)
  )
}

function filterAndSortRepositories(
  items: RankedRepository[],
  query: string,
  language: string,
  topic: string,
  sort: SortKey
) {
  const normalizedQuery = query.trim().toLowerCase()
  const filtered = items.filter((repository) => {
    const matchesQuery =
      !normalizedQuery ||
      repository.fullName.toLowerCase().includes(normalizedQuery) ||
      repository.description.toLowerCase().includes(normalizedQuery) ||
      repository.topics.some((item) => item.includes(normalizedQuery))
    const matchesLanguage =
      language === "all" || repository.language === language
    const matchesTopic = topic === "all" || repository.topics.includes(topic)
    return matchesQuery && matchesLanguage && matchesTopic
  })

  return filtered.toSorted((left, right) => {
    if (sort === "forks") return right.forkGain - left.forkGain
    if (sort === "momentum") return right.momentumScore - left.momentumScore
    return right.starGain - left.starGain
  })
}

function AppHeader({
  locale,
  onLocaleChange,
}: {
  locale: Locale
  onLocaleChange: (locale: Locale) => void
}) {
  const copy = COPY[locale]

  return (
    <header className="app-header">
      <div className="app-header-inner">
        <a className="brand-link" href="#explore">
          <RepoPulseLogo />
        </a>
        <nav className="desktop-nav" aria-label={copy.primaryNavigation}>
          {copy.navigation.map((item) => (
            <a
              data-active={item.active || undefined}
              href={item.href}
              key={item.label}
            >
              {item.label}
            </a>
          ))}
        </nav>
        <div className="header-actions">
          <Button
            className="language-switch"
            variant="ghost"
            size="sm"
            aria-label={copy.switchLanguageAria}
            onClick={() => onLocaleChange(locale === "en" ? "zh" : "en")}
          >
            <LanguagesIcon aria-hidden="true" data-icon="inline-start" />
            {copy.switchLanguage}
          </Button>
          <a
            className={cn(
              buttonVariants({ variant: "outline" }),
              "github-link"
            )}
            href="https://github.com/ddfriday/repo-pulse"
            target="_blank"
            rel="noreferrer"
          >
            <GitHubMark data-icon="inline-start" />
            GitHub
            <ExternalLinkIcon aria-hidden="true" data-icon="inline-end" />
          </a>
          <Sheet>
            <SheetTrigger
              render={
                <Button
                  className="mobile-menu-trigger"
                  variant="ghost"
                  size="icon-lg"
                  aria-label={copy.openNavigation}
                />
              }
            >
              <MenuIcon aria-hidden="true" />
            </SheetTrigger>
            <SheetContent className="mobile-navigation-sheet" side="right">
              <SheetHeader>
                <SheetTitle>{copy.mobileNavigationTitle}</SheetTitle>
                <SheetDescription>
                  {copy.mobileNavigationDescription}
                </SheetDescription>
              </SheetHeader>
              <nav className="mobile-nav" aria-label={copy.mobileNavigation}>
                {copy.navigation.map((item) => (
                  <SheetClose key={item.label} render={<a href={item.href} />}>
                    {item.label}
                  </SheetClose>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}

function Hero({
  locale,
  query,
  onQueryChange,
}: {
  locale: Locale
  query: string
  onQueryChange: (value: string) => void
}) {
  const copy = COPY[locale]

  return (
    <section className="hero" id="explore">
      <h1>{copy.heroTitle}</h1>
      <p>{copy.heroDescription}</p>
      <InputGroup className="search-group">
        <InputGroupInput
          aria-label={copy.searchAria}
          placeholder={copy.searchPlaceholder}
          type="search"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
        />
        <InputGroupAddon align="inline-start">
          <SearchIcon aria-hidden="true" />
        </InputGroupAddon>
      </InputGroup>
      <nav className="quick-links" aria-label={copy.primaryNavigation}>
        {copy.quickLinks.map((item, index) => {
          const isExternal = "external" in item && item.external
          const Icon =
            index === 0 ? CompassIcon : isExternal ? GitHubMark : BotIcon
          return (
            <a
              className="quick-link"
              href={item.href}
              key={item.label}
              rel={isExternal ? "noreferrer" : undefined}
              target={isExternal ? "_blank" : undefined}
            >
              <Icon aria-hidden="true" data-icon="inline-start" />
              {item.label}
              {isExternal ? (
                <ExternalLinkIcon aria-hidden="true" data-icon="inline-end" />
              ) : null}
            </a>
          )
        })}
      </nav>
    </section>
  )
}

function FilterSelect({
  ariaLabel,
  className,
  icon: Icon,
  items,
  onChange,
  value,
}: {
  ariaLabel: string
  className?: string
  icon: IconComponent
  items: SelectOption[]
  onChange: (value: string) => void
  value: string
}) {
  return (
    <Select
      items={items}
      value={value}
      onValueChange={(nextValue) => {
        if (nextValue) onChange(nextValue)
      }}
    >
      <SelectTrigger
        className={cn("filter-select", className)}
        aria-label={ariaLabel}
      >
        <Icon aria-hidden="true" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent alignItemWithTrigger={false} align="start">
        <SelectGroup>
          {items.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}

function MobileFilters({
  locale,
  language,
  languageItems,
  onLanguageChange,
  onTopicChange,
  topic,
  topicItems,
}: {
  locale: Locale
  language: string
  languageItems: SelectOption[]
  onLanguageChange: (value: string) => void
  onTopicChange: (value: string) => void
  topic: string
  topicItems: SelectOption[]
}) {
  const copy = COPY[locale]

  return (
    <Sheet>
      <SheetTrigger
        render={
          <Button
            className="mobile-filter-button"
            variant="outline"
            size="lg"
          />
        }
      >
        <SlidersHorizontalIcon aria-hidden="true" data-icon="inline-start" />
        {copy.filters}
      </SheetTrigger>
      <SheetContent className="filter-sheet" side="bottom">
        <SheetHeader>
          <SheetTitle>{copy.filterTitle}</SheetTitle>
          <SheetDescription>{copy.filterDescription}</SheetDescription>
        </SheetHeader>
        <div className="filter-sheet-controls">
          <FilterSelect
            ariaLabel={copy.languageFilter}
            className="full-width-select"
            icon={Code2Icon}
            items={languageItems}
            onChange={onLanguageChange}
            value={language}
          />
          <FilterSelect
            ariaLabel={copy.topicFilter}
            className="full-width-select"
            icon={TagIcon}
            items={topicItems}
            onChange={onTopicChange}
            value={topic}
          />
        </div>
        <SheetFooter>
          <SheetClose render={<Button size="lg" />}>{copy.done}</SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

function FilterBar({
  locale,
  language,
  languageItems,
  onLanguageChange,
  onSortChange,
  onTopicChange,
  sort,
  topic,
  topicItems,
}: {
  locale: Locale
  language: string
  languageItems: SelectOption[]
  onLanguageChange: (value: string) => void
  onSortChange: (value: SortKey) => void
  onTopicChange: (value: string) => void
  sort: SortKey
  topic: string
  topicItems: SelectOption[]
}) {
  const copy = COPY[locale]

  return (
    <div className="filter-bar">
      <div className="desktop-filters">
        <FilterSelect
          ariaLabel={copy.languageFilter}
          icon={Code2Icon}
          items={languageItems}
          onChange={onLanguageChange}
          value={language}
        />
        <FilterSelect
          ariaLabel={copy.topicFilter}
          icon={TagIcon}
          items={topicItems}
          onChange={onTopicChange}
          value={topic}
        />
      </div>
      <div className="mobile-filters">
        <MobileFilters
          locale={locale}
          language={language}
          languageItems={languageItems}
          onLanguageChange={onLanguageChange}
          onTopicChange={onTopicChange}
          topic={topic}
          topicItems={topicItems}
        />
      </div>
      <FilterSelect
        ariaLabel={copy.sortRepositories}
        className="sort-select"
        icon={ArrowUpDownIcon}
        items={[...copy.sortOptions]}
        onChange={(value) => onSortChange(value as SortKey)}
        value={sort}
      />
    </div>
  )
}

function RepositoryRow({
  locale,
  overflow,
  rank,
  repository,
  selected,
  onSelect,
}: {
  locale: Locale
  overflow: boolean
  rank: number
  repository: RankedRepository
  selected: boolean
  onSelect: () => void
}) {
  const copy = COPY[locale]

  return (
    <li data-overflow={overflow || undefined}>
      <button
        aria-pressed={selected}
        className="repository-row"
        data-selected={selected || undefined}
        onClick={onSelect}
        type="button"
      >
        <span className="repository-rank">{rank}</span>
        <span className="repository-identity">
          <span className="repository-glyph" aria-hidden="true">
            {repository.owner.slice(0, 2).toUpperCase()}
          </span>
          <span className="repository-copy">
            <strong>{repository.fullName}</strong>
            <span>{repository.description}</span>
            <span className="repository-meta">
              <Badge
                className="language-badge"
                data-language={repository.language.toLowerCase()}
                variant="secondary"
              >
                {repository.language}
              </Badge>
              <span>
                <StarIcon aria-hidden="true" />{" "}
                {compactNumber(repository.stars, locale)}
              </span>
            </span>
          </span>
        </span>
        <span className="growth-metric" data-label={copy.starsGained}>
          +{compactNumber(repository.starGain, locale)}
        </span>
        <span className="growth-metric" data-label={copy.forksGained}>
          +{compactNumber(repository.forkGain, locale)}
        </span>
        <Sparkline
          values={repository.trend}
          label={repository.fullName + " " + copy.growthTrend}
        />
      </button>
    </li>
  )
}

function projectInsightCorpus(repository: RankedRepository) {
  return [
    repository.fullName,
    repository.description,
    repository.language,
    ...repository.topics,
  ]
    .join(" ")
    .toLowerCase()
}

function classifyRepository(repository: RankedRepository): ProjectCategoryKey {
  const corpus = projectInsightCorpus(repository)
  const matchedRule = PROJECT_CATEGORY_RULES.find((rule) =>
    rule.terms.some((term) => corpus.includes(term))
  )

  return matchedRule?.key ?? "newProject"
}

function shortDate(value: string, locale: Locale) {
  return new Intl.DateTimeFormat(locale === "zh" ? "zh-CN" : "en", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  }).format(new Date(value))
}

function metadataSignals(
  locale: Locale,
  period: Period,
  repository: RankedRepository
) {
  const labels = PERIOD_LABELS[locale]
  const signals = [
    repository.language,
    repository.topics[0] ? "#" + repository.topics[0] : null,
    "+" +
      compactNumber(repository.starGain, locale) +
      " " +
      (locale === "zh" ? "Star" : "stars") +
      " / " +
      labels[period],
    repository.forkGain
      ? "+" +
        compactNumber(repository.forkGain, locale) +
        " " +
        (locale === "zh" ? "Fork" : "forks")
      : null,
    repository.homepage
      ? locale === "zh"
        ? "有主页链接"
        : "Homepage linked"
      : null,
  ]

  return signals.filter((item): item is string => Boolean(item)).slice(0, 5)
}

function projectInsight(
  locale: Locale,
  period: Period,
  repository: RankedRepository
) {
  const copy = COPY[locale]
  const categoryKey = classifyRepository(repository)
  const metadataCategory = copy.aiCategoryLabels[categoryKey]
  const localizedAi =
    locale === "zh"
      ? {
          audience: repository.aiAudienceZh,
          category: repository.aiCategoryZh,
          reason: repository.aiReasonZh,
          signals: repository.aiSignalsZh,
          summary: repository.aiSummaryZh,
        }
      : {
          audience: repository.aiAudience,
          category: repository.aiCategory,
          reason: repository.aiReason,
          signals: repository.aiSignals,
          summary: repository.aiSummary,
        }
  const modelSignals = localizedAi.signals.filter(Boolean).slice(0, 5)
  const source =
    localizedAi.summary || localizedAi.category || modelSignals.length
      ? "ai"
      : "metadata"
  const category = localizedAi.category ?? metadataCategory
  const summary =
    localizedAi.summary ??
    (locale === "zh"
      ? "根据仓库描述、语言和 Topic，当前更像是「" +
        metadataCategory +
        "」。原始描述：" +
        repository.description
      : repository.description +
        " Based on language, description, and topics, this looks like a " +
        metadataCategory.toLowerCase() +
        ".")
  const audience =
    localizedAi.audience ??
    (locale === "zh"
      ? "正在寻找新工具或新技术方向的开发者"
      : "Developers scanning for new tools or technical directions")
  const reason =
    localizedAi.reason ??
    (locale === "zh"
      ? "本周期新增 " +
        compactNumber(repository.starGain, locale) +
        " Star、" +
        compactNumber(repository.forkGain, locale) +
        " Fork，最近推送在 " +
        shortDate(repository.pushedAt, locale) +
        "。"
      : "This period added " +
        compactNumber(repository.starGain, locale) +
        " stars and " +
        compactNumber(repository.forkGain, locale) +
        " forks, with a recent push on " +
        shortDate(repository.pushedAt, locale) +
        ".")

  return {
    audience,
    category,
    reason,
    signals: modelSignals.length
      ? modelSignals
      : metadataSignals(locale, period, repository),
    source,
    summary,
  }
}

function ProjectInsightPanel({
  locale,
  period,
  repository,
}: {
  locale: Locale
  period: Period
  repository: RankedRepository
}) {
  const copy = COPY[locale]
  const insight = projectInsight(locale, period, repository)
  const providerName = repository.aiModel
    ? repository.aiModel.toLowerCase().includes("deepseek")
      ? "DeepSeek"
      : "SenseNova"
    : copy.aiInsightSourceMetadata
  const modelNote = repository.aiModel
    ? copy.aiModelName +
      ": " +
      repository.aiModel +
      (repository.aiEnrichedAt
        ? " · " +
          copy.aiUpdated +
          " " +
          shortDate(repository.aiEnrichedAt, locale)
        : "")
    : copy.aiModelPending

  return (
    <section
      className="insight-panel ai-insight-panel"
      data-source={insight.source}
      id="ai-insight"
    >
      <div className="ai-insight-kicker">
        <span>
          <BotIcon aria-hidden="true" />
          {copy.aiInsightEyebrow}
        </span>
        <Badge data-source={insight.source} variant="secondary">
          {insight.source === "ai"
            ? providerName
            : copy.aiInsightSourceMetadata}
        </Badge>
      </div>
      <h2>{copy.aiInsightTitle}</h2>
      <div className="ai-insight-lead">
        <span>
          <SparklesIcon aria-hidden="true" />
          {copy.aiSummaryLabel}
        </span>
        <p className="ai-insight-summary">{insight.summary}</p>
      </div>
      <dl className="ai-insight-facts">
        <div>
          <dt>
            <TagIcon aria-hidden="true" />
            {copy.aiCategory}
          </dt>
          <dd>{insight.category}</dd>
        </div>
        <div>
          <dt>
            <UsersIcon aria-hidden="true" />
            {copy.aiAudience}
          </dt>
          <dd>{insight.audience}</dd>
        </div>
      </dl>
      <div className="ai-signal-block">
        <span>{copy.aiSignals}</span>
        <div className="ai-signal-list">
          {insight.signals.map((signal) => (
            <span key={signal}>{signal}</span>
          ))}
        </div>
      </div>
      <div className="ai-reason">
        <strong>
          <SparklesIcon aria-hidden="true" />
          {copy.aiReason}
        </strong>
        <p>{insight.reason}</p>
      </div>
      <p className="ai-model-note">
        <CpuIcon aria-hidden="true" />
        <span>{modelNote}</span>
      </p>
    </section>
  )
}

function RepositoryLinks({
  locale,
  repository,
}: {
  locale: Locale
  repository: RankedRepository
}) {
  const copy = COPY[locale]

  return (
    <div className="repository-links">
      <a
        className={cn(buttonVariants({ variant: "outline" }), "repo-action")}
        href={repository.url}
        target="_blank"
        rel="noreferrer"
      >
        <GitHubMark data-icon="inline-start" />
        {copy.openRepository}
        <ExternalLinkIcon aria-hidden="true" data-icon="inline-end" />
      </a>
      {repository.homepage ? (
        <a
          className={cn(buttonVariants({ variant: "ghost" }), "repo-action")}
          href={repository.homepage}
          target="_blank"
          rel="noreferrer"
        >
          <LinkIcon aria-hidden="true" data-icon="inline-start" />
          {copy.openHomepage}
          <ExternalLinkIcon aria-hidden="true" data-icon="inline-end" />
        </a>
      ) : null}
    </div>
  )
}

function RankingWorkspace({
  bundle,
  items,
  locale,
  onReset,
  onSelect,
  period,
  selectedId,
}: {
  bundle: RankingBundle
  items: RankedRepository[]
  locale: Locale
  onReset: () => void
  onSelect: (id: number) => void
  period: Period
  selectedId: number | null
}) {
  const copy = COPY[locale]
  const [expanded, setExpanded] = useState(false)
  const selected = items.find((item) => item.id === selectedId) ?? items[0]

  return (
    <div className="workspace" id="rankings">
      <section
        className="ranking-panel"
        aria-labelledby={period + "-ranking-title"}
      >
        <div className="data-status">
          <p id={period + "-ranking-title"}>
            {bundle.mode === "sample" ? copy.sampleData : copy.liveSnapshot}
            <span aria-hidden="true"> / </span>
            {copy.updated} {formatUpdatedAt(bundle.updatedAt, locale)}
          </p>
          <span>
            {items.length}{" "}
            {items.length === 1 ? copy.repository : copy.repositories}
          </span>
        </div>
        {items.length ? (
          <div
            className="ranking-list-wrap"
            data-expanded={expanded || undefined}
          >
            <div className="ranking-header" aria-hidden="true">
              <span>{copy.rank}</span>
              <span>{copy.repositoryHeading}</span>
              <span>{copy.starsGained}</span>
              <span>{copy.forksGained}</span>
              <span>{copy.trend}</span>
            </div>
            <ol className="ranking-list">
              {items.map((repository, index) => (
                <RepositoryRow
                  key={repository.id}
                  locale={locale}
                  overflow={index >= 6}
                  rank={index + 1}
                  repository={repository}
                  selected={repository.id === selected?.id}
                  onSelect={() => onSelect(repository.id)}
                />
              ))}
            </ol>
            {items.length > 6 ? (
              <Button
                className="show-more-button"
                variant="ghost"
                onClick={() => setExpanded((current) => !current)}
              >
                {expanded ? copy.showLess : copy.showMore}
                {expanded ? (
                  <ChevronUpIcon aria-hidden="true" data-icon="inline-end" />
                ) : (
                  <ChevronDownIcon aria-hidden="true" data-icon="inline-end" />
                )}
              </Button>
            ) : null}
          </div>
        ) : (
          <Empty className="ranking-empty">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <SearchXIcon aria-hidden="true" />
              </EmptyMedia>
              <EmptyTitle>{copy.emptyTitle}</EmptyTitle>
              <EmptyDescription>{copy.emptyDescription}</EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button variant="outline" onClick={onReset}>
                {copy.resetFilters}
              </Button>
            </EmptyContent>
          </Empty>
        )}
      </section>
      {selected ? (
        <aside className="insight-rail" aria-label={copy.rankingDetails}>
          <section className="insight-panel momentum-panel">
            <h2>{copy.momentumOverview}</h2>
            <p>
              {selected.fullName} / {PERIOD_LABELS[locale][period]}{" "}
              {copy.growth}
            </p>
            <RepositoryLinks locale={locale} repository={selected} />
            <MomentumChart
              repository={selected}
              period={period}
              locale={locale}
            />
            <div className="chart-legend">
              <span aria-hidden="true" /> {copy.starsGained}
            </div>
          </section>
          <ProjectInsightPanel
            locale={locale}
            period={period}
            repository={selected}
          />
        </aside>
      ) : null}
    </div>
  )
}

function AppFooter({ locale }: { locale: Locale }) {
  const copy = COPY[locale]

  return (
    <footer className="app-footer">
      <div>
        <CompassIcon aria-hidden="true" />
        <span>{copy.footer}</span>
      </div>
    </footer>
  )
}

export function RepoPulseDashboard({
  initialFilters,
  rankings,
}: {
  initialFilters: InitialFilters
  rankings: RankingsByPeriod
}) {
  const router = useRouter()
  const [locale, setLocale] = useState(initialFilters.locale)
  const [period, setPeriod] = useState(initialFilters.period)
  const [query, setQuery] = useState(initialFilters.query)
  const [language, setLanguage] = useState(initialFilters.language)
  const [topic, setTopic] = useState(initialFilters.topic)
  const [sort, setSort] = useState(initialFilters.sort)
  const [selectedId, setSelectedId] = useState<number | null>(
    rankings[initialFilters.period].items[0]?.id ?? null
  )
  const deferredQuery = useDeferredValue(query)

  useEffect(() => {
    document.documentElement.lang = locale === "zh" ? "zh-CN" : "en"
    document.title = COPY[locale].documentTitle
  }, [locale])

  const languageItems = useMemo<SelectOption[]>(() => {
    const values = new Set<string>()
    PERIODS.forEach((item) =>
      rankings[item].items.forEach((repository) =>
        values.add(repository.language)
      )
    )
    return [
      { label: COPY[locale].allLanguages, value: "all" },
      ...Array.from(values)
        .toSorted()
        .map((value) => ({ label: value, value })),
    ]
  }, [locale, rankings])

  const topicItems = useMemo<SelectOption[]>(() => {
    const values = new Set<string>()
    PERIODS.forEach((item) =>
      rankings[item].items.forEach((repository) =>
        repository.topics.forEach((repositoryTopic) =>
          values.add(repositoryTopic)
        )
      )
    )
    return [
      { label: COPY[locale].allTopics, value: "all" },
      ...Array.from(values)
        .toSorted()
        .map((value) => ({ label: value, value })),
    ]
  }, [locale, rankings])

  function resetFilters() {
    setQuery("")
    setLanguage("all")
    setTopic("all")
    setSort("momentum")
    updateUrlParameter("q", "")
    updateUrlParameter("language", "")
    updateUrlParameter("topic", "")
    updateUrlParameter("sort", "")
  }

  return (
    <div className="repo-shell">
      <AppHeader
        locale={locale}
        onLocaleChange={(value) => {
          setLocale(value)
          router.replace(urlWithParameter("lang", value, "en"), {
            scroll: false,
          })
        }}
      />
      <main className="app-main">
        <Hero
          locale={locale}
          query={query}
          onQueryChange={(value) => {
            setQuery(value)
            updateUrlParameter("q", value)
          }}
        />
        <Tabs
          className="ranking-tabs"
          value={period}
          onValueChange={(value) => {
            if (!isPeriod(value)) return
            setPeriod(value)
            updateUrlParameter("period", value, "weekly")
          }}
        >
          <div className="controls-row">
            <TabsList className="period-tabs">
              {PERIODS.map((item) => (
                <TabsTrigger key={item} value={item}>
                  {PERIOD_LABELS[locale][item]}
                </TabsTrigger>
              ))}
            </TabsList>
            <FilterBar
              locale={locale}
              language={language}
              languageItems={languageItems}
              onLanguageChange={(value) => {
                setLanguage(value)
                updateUrlParameter("language", value, "all")
              }}
              onSortChange={(value) => {
                setSort(value)
                updateUrlParameter("sort", value, "momentum")
              }}
              onTopicChange={(value) => {
                setTopic(value)
                updateUrlParameter("topic", value, "all")
              }}
              sort={sort}
              topic={topic}
              topicItems={topicItems}
            />
          </div>
          {PERIODS.map((item) => {
            const filteredItems = filterAndSortRepositories(
              rankings[item].items,
              deferredQuery,
              language,
              topic,
              sort
            )
            return (
              <TabsContent key={item} value={item}>
                <RankingWorkspace
                  bundle={rankings[item]}
                  items={filteredItems}
                  locale={locale}
                  onReset={resetFilters}
                  onSelect={setSelectedId}
                  period={item}
                  selectedId={selectedId}
                />
              </TabsContent>
            )
          })}
        </Tabs>
      </main>
      <AppFooter locale={locale} />
    </div>
  )
}
