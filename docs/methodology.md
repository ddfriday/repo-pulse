# Ranking methodology

RepoPulse keeps exact growth metrics visible and uses discovery score as the default ranking for finding new and rising repositories.

## Exact metrics

- **Star growth:** latest star count minus the closest snapshot at or before the selected window.
- **Fork growth:** latest fork count minus the closest snapshot at or before the selected window.
- **Trend:** the eight most recent stored star snapshots, shown oldest to newest.

## Discovery score

```text
capped absolute star and fork growth
+ relative growth normalized by repository size
+ early traction from total stars and forks
+ age boost for newly created repositories
+ activity boost for recent pushes
- size penalty for very large established repositories
- quiet penalty for stale repositories
```

The formula is intentionally explainable rather than authoritative. It is tuned to surface young projects with early momentum and recent activity, not to measure code quality.

## Known biases

- Lifetime stars favor older projects.
- Percentage growth favors extremely small projects.
- External news can create short spikes.
- Fork-heavy templates and coursework can look unusually popular.
- GitHub Search provides a candidate pool, not complete global event coverage.

RepoPulse addresses these biases by showing separate exact rankings, excluding archived and forked repositories by default, labeling coverage, preserving the underlying metric values next to the discovery score, and reducing the ranking advantage of old mega-repositories.
