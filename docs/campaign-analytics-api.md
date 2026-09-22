# Campaign analytics API contract

This frontend repository has no database, server routes, platform clients, or background workers. The advertising backend must persist provider insights before exposing the following authenticated endpoint; the client must not query Meta or TikTok directly.

`GET /campaigns/:campaignId/analytics?from=YYYY-MM-DD&to=YYYY-MM-DD&level=campaign|ad_set|ad_group|ad|creative&compare=previous`

Return records rather than pre-aggregated cross-currency totals. Each record requires `name`, `value` (or `null` when unavailable), `platform`, `campaignId`, `objective`, `entityLevel`, `timestamp`, `sourceMetricName`, and `dataStatus`. Include `currency` for money metrics; include provider IDs and conversion `attribution` when known.

The backend must retain original provider metric names and definitions, normalize only explicit Meta/TikTok mappings, keep ad-set/ad-group terminology in the source data, and never replace unavailable data with zero. It should expose `lastUpdatedAt`, `syncStatus` (`syncing`, `ready`, `partial`, `failed`), and errors separately from metrics.

## Persistence and sync requirements

Store immutable provider-insight observations keyed by workspace, platform/ad account, campaign, entity level/entity ID, reporting timestamp, source metric, currency, and attribution context. Use the existing platform-token and workspace ownership model for authorization. Incrementally upsert provider data in the existing integration sync job, backfill supported historical windows, and record failed/partial sync runs. Do not combine money across currencies without a separately identified conversion service.
