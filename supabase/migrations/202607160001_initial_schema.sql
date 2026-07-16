create table public.repositories (
  id bigint primary key,
  node_id text not null unique,
  owner text not null,
  name text not null,
  full_name text not null unique,
  description text,
  html_url text not null,
  homepage text,
  language text,
  topics text[] not null default '{}',
  license_spdx text,
  stars_count bigint not null default 0 check (stars_count >= 0),
  forks_count bigint not null default 0 check (forks_count >= 0),
  open_issues_count bigint not null default 0 check (open_issues_count >= 0),
  is_fork boolean not null default false,
  is_archived boolean not null default false,
  github_created_at timestamptz not null,
  pushed_at timestamptz,
  github_updated_at timestamptz not null,
  collected_at timestamptz not null default now()
);

create table public.repository_snapshots (
  id bigint generated always as identity primary key,
  repository_id bigint not null references public.repositories(id) on delete cascade,
  captured_at timestamptz not null,
  stars_count bigint not null check (stars_count >= 0),
  forks_count bigint not null check (forks_count >= 0),
  open_issues_count bigint not null check (open_issues_count >= 0),
  unique (repository_id, captured_at)
);

create index repositories_language_active_idx
  on public.repositories (language, pushed_at desc)
  where is_archived = false and is_fork = false;

create index repositories_topics_idx
  on public.repositories using gin (topics);

create index repository_snapshots_repository_captured_idx
  on public.repository_snapshots (repository_id, captured_at desc)
  include (stars_count, forks_count, open_issues_count);

create index repository_snapshots_captured_at_idx
  on public.repository_snapshots (captured_at desc);

alter table public.repositories enable row level security;
alter table public.repository_snapshots enable row level security;

create policy repositories_public_read
  on public.repositories
  for select
  to anon, authenticated
  using (true);

create policy repository_snapshots_public_read
  on public.repository_snapshots
  for select
  to anon, authenticated
  using (true);

grant usage on schema public to anon, authenticated;
grant select on public.repositories, public.repository_snapshots to anon, authenticated;
revoke insert, update, delete on public.repositories, public.repository_snapshots from anon, authenticated;

create or replace function public.get_repository_rankings(
  p_window_hours integer default 168,
  p_result_limit integer default 100
)
returns table (
  repository_id bigint,
  full_name text,
  owner text,
  name text,
  description text,
  html_url text,
  homepage text,
  language text,
  topics text[],
  stars_count bigint,
  forks_count bigint,
  star_gain bigint,
  fork_gain bigint,
  momentum_score numeric,
  trend bigint[],
  pushed_at timestamptz,
  captured_at timestamptz
)
language sql
stable
security invoker
set search_path = ''
as $$
  with latest as (
    select distinct on (snapshot.repository_id)
      snapshot.repository_id,
      snapshot.captured_at,
      snapshot.stars_count,
      snapshot.forks_count
    from public.repository_snapshots as snapshot
    order by snapshot.repository_id, snapshot.captured_at desc
  )
  select
    repository.id as repository_id,
    repository.full_name,
    repository.owner,
    repository.name,
    repository.description,
    repository.html_url,
    repository.homepage,
    repository.language,
    repository.topics,
    latest.stars_count,
    latest.forks_count,
    greatest(latest.stars_count - coalesce(baseline.stars_count, latest.stars_count), 0)::bigint as star_gain,
    greatest(latest.forks_count - coalesce(baseline.forks_count, latest.forks_count), 0)::bigint as fork_gain,
    round((
      greatest(latest.stars_count - coalesce(baseline.stars_count, latest.stars_count), 0) * 0.55 +
      greatest(latest.forks_count - coalesce(baseline.forks_count, latest.forks_count), 0) * 1.8 +
      case when repository.pushed_at > now() - interval '7 days' then 25 else 0 end
    )::numeric, 2) as momentum_score,
    coalesce(trend.values, array[latest.stars_count]) as trend,
    repository.pushed_at,
    latest.captured_at
  from latest
  join public.repositories as repository on repository.id = latest.repository_id
  left join lateral (
    select snapshot.stars_count, snapshot.forks_count
    from public.repository_snapshots as snapshot
    where snapshot.repository_id = latest.repository_id
      and snapshot.captured_at <= latest.captured_at - (p_window_hours * interval '1 hour')
    order by snapshot.captured_at desc
    limit 1
  ) as baseline on true
  left join lateral (
    select array_agg(recent.stars_count order by recent.captured_at) as values
    from (
      select snapshot.stars_count, snapshot.captured_at
      from public.repository_snapshots as snapshot
      where snapshot.repository_id = latest.repository_id
      order by snapshot.captured_at desc
      limit 8
    ) as recent
  ) as trend on true
  where repository.is_archived = false
    and repository.is_fork = false
  order by
    greatest(latest.stars_count - coalesce(baseline.stars_count, latest.stars_count), 0) desc,
    greatest(latest.forks_count - coalesce(baseline.forks_count, latest.forks_count), 0) desc,
    repository.id
  limit least(greatest(p_result_limit, 1), 200);
$$;

revoke all on function public.get_repository_rankings(integer, integer) from public;
grant execute on function public.get_repository_rankings(integer, integer) to anon, authenticated;
