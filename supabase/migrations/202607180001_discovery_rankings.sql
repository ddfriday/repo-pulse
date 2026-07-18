create index if not exists repositories_discovery_active_idx
  on public.repositories (github_created_at desc, pushed_at desc, stars_count)
  where is_archived = false and is_fork = false;

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
  ),
  ranked as (
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
      coalesce(trend.values, array[latest.stars_count]) as trend,
      repository.pushed_at,
      latest.captured_at,
      greatest(extract(epoch from (now() - repository.github_created_at)) / 86400, 1) as repository_age_days,
      greatest(
        extract(epoch from (now() - coalesce(repository.pushed_at, repository.github_updated_at))) / 86400,
        1
      ) as activity_age_days
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
  )
  select
    ranked.repository_id,
    ranked.full_name,
    ranked.owner,
    ranked.name,
    ranked.description,
    ranked.html_url,
    ranked.homepage,
    ranked.language,
    ranked.topics,
    ranked.stars_count,
    ranked.forks_count,
    ranked.star_gain,
    ranked.fork_gain,
    round(greatest((
      least(ranked.star_gain, 500) * 0.12 +
      least(ranked.fork_gain, 150) * 0.50 +
      least((ranked.star_gain::numeric / power(greatest(ranked.stars_count, 1)::numeric, 0.5)) * 45, 160) +
      least((ranked.fork_gain::numeric / power(greatest(ranked.forks_count, 1)::numeric, 0.5)) * 35, 100) +
      least(ln(greatest(ranked.stars_count, 0) + 1) * 12 + ln(greatest(ranked.forks_count, 0) + 1) * 8, 100) +
      case
        when ranked.repository_age_days <= 14 then 130
        when ranked.repository_age_days <= 30 then 105
        when ranked.repository_age_days <= 90 then 70
        when ranked.repository_age_days <= 180 then 40
        when ranked.repository_age_days <= 365 then 18
        else 0
      end +
      case
        when ranked.activity_age_days <= 3 then 60
        when ranked.activity_age_days <= 7 then 45
        when ranked.activity_age_days <= 30 then 25
        when ranked.activity_age_days <= 90 then 10
        else 0
      end -
      case
        when ranked.stars_count > 100000 then 240
        when ranked.stars_count > 50000 then 180
        when ranked.stars_count > 10000 then 95
        when ranked.stars_count > 5000 then 50
        when ranked.stars_count > 2000 then 25
        else 0
      end -
      case
        when ranked.activity_age_days > 90 then 50
        when ranked.activity_age_days > 30 then 20
        else 0
      end
    )::numeric, 0), 2) as momentum_score,
    ranked.trend,
    ranked.pushed_at,
    ranked.captured_at
  from ranked
  order by
    momentum_score desc,
    ranked.star_gain desc,
    ranked.repository_age_days asc,
    ranked.repository_id
  limit least(greatest(p_result_limit, 1), 200);
$$;

revoke all on function public.get_repository_rankings(integer, integer) from public;
grant execute on function public.get_repository_rankings(integer, integer) to anon, authenticated;
