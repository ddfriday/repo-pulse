# Ranking methodology

RepoPulse keeps exact growth metrics visible and uses momentum only as an optional discovery score.

## Exact metrics

- **Star growth:** latest star count minus the closest snapshot at or before the selected window.
- **Fork growth:** latest fork count minus the closest snapshot at or before the selected window.
- **Trend:** the eight most recent stored star snapshots, shown oldest to newest.

## MVP momentum score

```text
0.55 × star growth
+ 1.80 × fork growth
+ 25 when the repository was pushed within seven days
```

The formula is intentionally simple and explainable. It does not claim to measure code quality.

## Known biases

- Lifetime stars favor older projects.
- Percentage growth favors extremely small projects.
- External news can create short spikes.
- Fork-heavy templates and coursework can look unusually popular.
- GitHub Search provides a candidate pool, not complete global event coverage.

RepoPulse addresses these biases by showing separate exact rankings, excluding archived and forked repositories by default, labeling coverage, and preserving the underlying metric values next to the momentum score.
