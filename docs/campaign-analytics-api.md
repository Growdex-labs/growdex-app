# Campaign analytics API

This frontend repository has no database, server routes, platform clients, or
background workers. The advertising backend (`backend-main`) persists provider
insights and exposes the authenticated endpoints below; the client must not
query Meta or TikTok directly.

This document describes the API **as implemented** by
`backend-main@feat/campaign-analytics-framework` (PR #121) and consumed by the
panel UI (PR #107). It replaces an earlier contract for a
`GET /campaigns/:id/analytics` record endpoint that was never implemented; its
stricter ideas that are still worth building are listed under [v2](#v2-follow-ups).

## Endpoints

### `GET /campaigns/metrics/:campaignId?strategyId=`

Per-campaign performance. `strategyId` narrows to one audience strategy
(ad set) via a live platform read on multi-strategy campaigns.

- `currency`, `objective` — reporting currency and campaign goal
- `byPlatform[]` — per-platform metric rows (spend, impressions, clicks,
  conversions, reach, ctr, cpc, cpa, cpm, roas, frequency, conversion rate,
  revenue, video views/quartiles/watch time, engagement split, leads/form
  opens, landing page views/outbound clicks, funnel events, and the derived
  cost/rate metrics)
- `totals` — platform-blended totals with derived rates; reach-relative
  metrics (frequency) derive from totals, never by averaging daily values
- `trend[]` — up to 28 daily points (spend, impressions, clicks, ctr, plus
  the per-event counts), oldest first
- `comparison` — the last 14 days vs the equal window before it, with
  percentage `change` per metric (money metrics are single-currency per
  campaign, which publishing guarantees)
- `pacing` — spend vs allocation, flight days, projection, and a status of
  `not_started | on_track | overspending | underspending | completed`
- `signals[]` — health/optimisation signals: `fatigue`, `anomaly`, `pacing`,
  `rejection`, `learning`; every signal carries its `evidence`
- `freshness` — `lastSyncedAt`, `dataThrough`, `status: "delayed"` (the sync
  is nightly, so reporting is never real-time), and the per-platform
  attribution windows (Meta 7-day click / 1-day view)
- `conversionContext[]` — the platform event each platform's `conversions`
  counts for this campaign goal

### `GET /campaigns/metrics/:campaignId/ads?strategyId=`

Ad-level rows (creative comparison view), read live from the platforms and
cached ~10 minutes. Sorted by spend.

### `GET /campaigns/metrics/:campaignId/breakdowns?dimension=age|gender|placement|device&strategyId=`

Platform-native breakdowns. TikTok only reports `age` and `gender` (via its
AUDIENCE report type); the other dimensions return Meta rows only.

### `GET /campaigns/metrics/definitions`

The Growdex metric dictionary: label, description, `source`
(`platform`-reported vs `growdex`-calculated), unit, formula for derived
metrics, applicable objectives, and per-platform notes — plus the attribution
context and data-status description.

### `GET /campaigns/metrics/dashboard`

Account aggregates: per-currency money metrics, per-platform counts,
`dailySpend`, `dailyTrend` (account-wide daily CTR), and `trendSummary` (last
full 14-day window vs the previous one).

## Client conventions

- Unavailable data renders as an em dash, never as zero.
- Money is never summed across currencies; rates are computed within one
  currency bucket.
- The UI mirrors the dictionary in `lib/metric-definitions.ts` for
  zero-latency tooltips. `/campaigns/metrics/definitions` (backend) is the
  source of truth — keep the mirror in sync when metrics change.

## v2 follow-ups

Ideas from the earlier contract worth building on top of the implemented API:

- **Per-record provenance**: carry `sourceMetricName` and per-record
  `dataStatus` (`final | estimated | delayed | partial`) alongside each value,
  and expose `syncStatus` (`syncing | ready | partial | failed`) on snapshots,
  so partial sync failures are visible per metric rather than per campaign.
- **Server-side ranges**: `from`/`to` parameters (the UI currently slices the
  28-day trend client-side) and `compare=previous` for arbitrary windows.
- **Creative level**: `level=creative` grouping of ad-level rows by creative
  id, with per-creative `attribution` context.
