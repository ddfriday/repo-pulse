"use client"

import { type SVGProps, useDeferredValue, useMemo, useState } from "react"
import {
  ActivityIcon,
  ArrowUpDownIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  Clock3Icon,
  Code2Icon,
  ExternalLinkIcon,
  GitForkIcon,
  InfoIcon,
  MenuIcon,
  SearchIcon,
  SearchXIcon,
  SlidersHorizontalIcon,
  StarIcon,
  TagIcon,
  type LucideIcon,
} from "lucide-react"

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
import { Separator } from "@/components/ui/separator"
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
  type Period,
  type RankedRepository,
  type RankingBundle,
  type RankingsByPeriod,
  type SortKey,
} from "@/lib/types"

type SelectOption = { label: string; value: string }
type IconComponent = LucideIcon

function GitHubMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M12 .7a11.5 11.5 0 0 0-3.64 22.41c.58.11.79-.25.79-.56v-2.23c-3.22.7-3.9-1.37-3.9-1.37-.53-1.34-1.28-1.7-1.28-1.7-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.74-1.55-2.57-.29-5.27-1.29-5.27-5.73 0-1.27.45-2.3 1.19-3.11-.12-.29-.52-1.47.11-3.07 0 0 .97-.31 3.16 1.19a10.96 10.96 0 0 1 5.76 0c2.19-1.5 3.16-1.19 3.16-1.19.63 1.6.23 2.78.11 3.07.74.81 1.19 1.84 1.19 3.11 0 4.45-2.71 5.43-5.29 5.72.42.36.79 1.07.79 2.16v3.2c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .7Z" />
    </svg>
  )
}

const PERIOD_LABELS: Record<Period, string> = {
  daily: "Daily",
  weekly: "Weekly",
  monthly: "Monthly",
}

const SORT_OPTIONS: SelectOption[] = [
  { label: "Stars gained", value: "stars" },
  { label: "Forks gained", value: "forks" },
  { label: "Momentum", value: "momentum" },
]

const METHODOLOGY_ITEMS: Array<{
  title: string
  description: string
  icon: IconComponent
}> = [
  {
    title: "Star growth",
    description: "Recent increase in stars over the selected period.",
    icon: StarIcon,
  },
  {
    title: "Fork growth",
    description: "Recent increase in forks over the selected period.",
    icon: GitForkIcon,
  },
  {
    title: "Activity",
    description: "Recent pushes and release cadence signal maintained work.",
    icon: ActivityIcon,
  },
  {
    title: "Freshness",
    description: "Extra weight for repositories with recent activity.",
    icon: Clock3Icon,
  },
]

function compactNumber(value: number) {
  return Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value)
}

function formatUpdatedAt(value: string) {
  return new Intl.DateTimeFormat("en", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
    timeZoneName: "short",
  }).format(new Date(value))
}

function updateUrlParameter(
  name: string,
  value: string,
  defaultValue?: string
) {
  const url = new URL(window.location.href)

  if (!value || value === defaultValue) {
    url.searchParams.delete(name)
  } else {
    url.searchParams.set(name, value)
  }

  window.history.replaceState(null, "", url.pathname + url.search + url.hash)
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

function AppHeader() {
  const navigation = [
    { label: "Explore", href: "#explore", active: true },
    { label: "Rankings", href: "#rankings" },
    { label: "New & Rising", href: "#rankings" },
    { label: "Methodology", href: "#methodology" },
  ]

  return (
    <header className="app-header">
      <div className="app-header-inner">
        <a className="brand-link" href="#explore">
          <RepoPulseLogo />
        </a>
        <nav className="desktop-nav" aria-label="Primary navigation">
          {navigation.map((item) => (
            <a
              data-active={item.active || undefined}
              href={item.href}
              key={item.label}
            >
              {item.label}
            </a>
          ))}
        </nav>
        <a
          className={cn(buttonVariants({ variant: "outline" }), "github-link")}
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
                aria-label="Open navigation"
              />
            }
          >
            <MenuIcon aria-hidden="true" />
          </SheetTrigger>
          <SheetContent className="mobile-navigation-sheet" side="right">
            <SheetHeader>
              <SheetTitle>RepoPulse navigation</SheetTitle>
              <SheetDescription>
                Jump to rankings and methodology.
              </SheetDescription>
            </SheetHeader>
            <nav className="mobile-nav" aria-label="Mobile navigation">
              {navigation.map((item) => (
                <SheetClose key={item.label} render={<a href={item.href} />}>
                  {item.label}
                </SheetClose>
              ))}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}

function Hero({
  query,
  onQueryChange,
}: {
  query: string
  onQueryChange: (value: string) => void
}) {
  return (
    <section className="hero" id="explore">
      <h1>Discover what&apos;s rising on GitHub</h1>
      <p>
        Track repository momentum across stars, forks, releases, and activity.
      </p>
      <InputGroup className="search-group">
        <InputGroupInput
          aria-label="Search repositories"
          placeholder="Search repositories..."
          type="search"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
        />
        <InputGroupAddon align="inline-start">
          <SearchIcon aria-hidden="true" />
        </InputGroupAddon>
      </InputGroup>
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
  language,
  languageItems,
  onLanguageChange,
  onTopicChange,
  topic,
  topicItems,
}: {
  language: string
  languageItems: SelectOption[]
  onLanguageChange: (value: string) => void
  onTopicChange: (value: string) => void
  topic: string
  topicItems: SelectOption[]
}) {
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
        Filters
      </SheetTrigger>
      <SheetContent className="filter-sheet" side="bottom">
        <SheetHeader>
          <SheetTitle>Filter repositories</SheetTitle>
          <SheetDescription>
            Narrow the ranking by language and topic.
          </SheetDescription>
        </SheetHeader>
        <div className="filter-sheet-controls">
          <FilterSelect
            ariaLabel="Filter by language"
            className="full-width-select"
            icon={Code2Icon}
            items={languageItems}
            onChange={onLanguageChange}
            value={language}
          />
          <FilterSelect
            ariaLabel="Filter by topic"
            className="full-width-select"
            icon={TagIcon}
            items={topicItems}
            onChange={onTopicChange}
            value={topic}
          />
        </div>
        <SheetFooter>
          <SheetClose render={<Button size="lg" />}>Done</SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

function FilterBar({
  language,
  languageItems,
  onLanguageChange,
  onSortChange,
  onTopicChange,
  sort,
  topic,
  topicItems,
}: {
  language: string
  languageItems: SelectOption[]
  onLanguageChange: (value: string) => void
  onSortChange: (value: SortKey) => void
  onTopicChange: (value: string) => void
  sort: SortKey
  topic: string
  topicItems: SelectOption[]
}) {
  return (
    <div className="filter-bar">
      <div className="desktop-filters">
        <FilterSelect
          ariaLabel="Filter by language"
          icon={Code2Icon}
          items={languageItems}
          onChange={onLanguageChange}
          value={language}
        />
        <FilterSelect
          ariaLabel="Filter by topic"
          icon={TagIcon}
          items={topicItems}
          onChange={onTopicChange}
          value={topic}
        />
      </div>
      <div className="mobile-filters">
        <MobileFilters
          language={language}
          languageItems={languageItems}
          onLanguageChange={onLanguageChange}
          onTopicChange={onTopicChange}
          topic={topic}
          topicItems={topicItems}
        />
      </div>
      <FilterSelect
        ariaLabel="Sort repositories"
        className="sort-select"
        icon={ArrowUpDownIcon}
        items={SORT_OPTIONS}
        onChange={(value) => onSortChange(value as SortKey)}
        value={sort}
      />
    </div>
  )
}

function RepositoryRow({
  overflow,
  rank,
  repository,
  selected,
  onSelect,
}: {
  overflow: boolean
  rank: number
  repository: RankedRepository
  selected: boolean
  onSelect: () => void
}) {
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
                {compactNumber(repository.stars)}
              </span>
            </span>
          </span>
        </span>
        <span className="growth-metric" data-label="Stars gained">
          +{compactNumber(repository.starGain)}
        </span>
        <span className="growth-metric" data-label="Forks gained">
          +{compactNumber(repository.forkGain)}
        </span>
        <Sparkline
          values={repository.trend}
          label={repository.fullName + " growth trend"}
        />
      </button>
    </li>
  )
}

function MethodologyPanel() {
  return (
    <section className="insight-panel methodology-panel" id="methodology">
      <h2>How ranking works</h2>
      <div className="methodology-list">
        {METHODOLOGY_ITEMS.map((item) => {
          const Icon = item.icon
          return (
            <div className="methodology-item" key={item.title}>
              <Icon aria-hidden="true" />
              <div>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </div>
            </div>
          )
        })}
      </div>
      <Separator />
      <p className="methodology-note">
        Scores normalize growth and freshness. Exact metric rankings remain
        visible so the result is explainable.
      </p>
    </section>
  )
}

function RankingWorkspace({
  bundle,
  items,
  onReset,
  onSelect,
  period,
  selectedId,
}: {
  bundle: RankingBundle
  items: RankedRepository[]
  onReset: () => void
  onSelect: (id: number) => void
  period: Period
  selectedId: number | null
}) {
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
            {bundle.mode === "sample" ? "Sample data" : "Live snapshot"}
            <span aria-hidden="true"> / </span>
            Updated {formatUpdatedAt(bundle.updatedAt)}
          </p>
          <span>
            {items.length} {items.length === 1 ? "repository" : "repositories"}
          </span>
        </div>
        {items.length ? (
          <div
            className="ranking-list-wrap"
            data-expanded={expanded || undefined}
          >
            <div className="ranking-header" aria-hidden="true">
              <span>Rank</span>
              <span>Repository</span>
              <span>Stars gained</span>
              <span>Forks gained</span>
              <span>Trend</span>
            </div>
            <ol className="ranking-list">
              {items.map((repository, index) => (
                <RepositoryRow
                  key={repository.id}
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
                {expanded ? "Show less" : "Show more"}
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
              <EmptyTitle>No repositories found</EmptyTitle>
              <EmptyDescription>
                Try a broader search or reset the language and topic filters.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button variant="outline" onClick={onReset}>
                Reset filters
              </Button>
            </EmptyContent>
          </Empty>
        )}
      </section>
      {selected ? (
        <aside className="insight-rail" aria-label="Ranking details">
          <section className="insight-panel momentum-panel">
            <h2>Momentum overview</h2>
            <p>
              {selected.fullName} / {PERIOD_LABELS[period].toLowerCase()} growth
            </p>
            <MomentumChart repository={selected} period={period} />
            <div className="chart-legend">
              <span aria-hidden="true" /> Stars gained
            </div>
          </section>
          <MethodologyPanel />
        </aside>
      ) : null}
    </div>
  )
}

function AppFooter() {
  return (
    <footer className="app-footer">
      <div>
        <InfoIcon aria-hidden="true" />
        <span>
          Tracking public repositories. Historical coverage grows over time.
        </span>
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
  const [period, setPeriod] = useState(initialFilters.period)
  const [query, setQuery] = useState(initialFilters.query)
  const [language, setLanguage] = useState(initialFilters.language)
  const [topic, setTopic] = useState(initialFilters.topic)
  const [sort, setSort] = useState(initialFilters.sort)
  const [selectedId, setSelectedId] = useState<number | null>(
    rankings[initialFilters.period].items[0]?.id ?? null
  )
  const deferredQuery = useDeferredValue(query)

  const languageItems = useMemo<SelectOption[]>(() => {
    const values = new Set<string>()
    PERIODS.forEach((item) =>
      rankings[item].items.forEach((repository) =>
        values.add(repository.language)
      )
    )
    return [
      { label: "All languages", value: "all" },
      ...Array.from(values)
        .toSorted()
        .map((value) => ({ label: value, value })),
    ]
  }, [rankings])

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
      { label: "All topics", value: "all" },
      ...Array.from(values)
        .toSorted()
        .map((value) => ({ label: value, value })),
    ]
  }, [rankings])

  function resetFilters() {
    setQuery("")
    setLanguage("all")
    setTopic("all")
    setSort("stars")
    updateUrlParameter("q", "")
    updateUrlParameter("language", "")
    updateUrlParameter("topic", "")
    updateUrlParameter("sort", "")
  }

  return (
    <div className="repo-shell">
      <AppHeader />
      <main className="app-main">
        <Hero
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
                  {PERIOD_LABELS[item]}
                </TabsTrigger>
              ))}
            </TabsList>
            <FilterBar
              language={language}
              languageItems={languageItems}
              onLanguageChange={(value) => {
                setLanguage(value)
                updateUrlParameter("language", value, "all")
              }}
              onSortChange={(value) => {
                setSort(value)
                updateUrlParameter("sort", value, "stars")
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
      <AppFooter />
    </div>
  )
}
