# Shared tool and blog statistics

Apply `migrations/0003_resource_statistics.sql` in the existing project's Supabase SQL editor. The app uses the existing `SUPABASE_PROJECT_URL` and server-side `SUPABASE_PUBLISHABLE_KEY` (or `SUPABASE_SECRET_KEY`). No public browser key or Storage bucket is needed.

After applying, open `/api/statistics`: it should return `stats` with real counts (initially zero), not 503. The homepage, `/tools`, and `/blogs` refresh these aggregates every 15 seconds while visible. Successful local actions also request an immediate refresh.

Definitions:
- Visitors: distinct random browser identifiers for that resource since tracking started. Not people, active users, or page views. Clearing localStorage or using another browser can count again.
- Tasks completed: existing successful tool-action hooks, including JSON formatting, minification, copying and downloading, image outputs, PDF conversion, and audio clip downloads. Repeat successful actions count separately.
- Blog visitors / article opens: clicks to registered external article links from this site. Medium reading time, read completion, and direct Medium traffic cannot be observed.

No historical localStorage counts or archived file rows are backfilled. No filenames, file contents, IP addresses, emails, or form contents are sent in statistics requests. Identifiers persist in browser localStorage; events persist in Supabase. Public readers can access only aggregates through an RPC. Direct reads and writes of the tables are denied to anonymous/authenticated roles. The write RPC validates registered resources and event types, deduplicates event UUIDs and tool visitor events, and limits each identifier to 1,000 events per day. This is approximate, client-reported usage, not fraud-proof analytics; a client can rotate identifiers.

When adding a live tool or blog, add its key to `statistic_resources` through a migration. The application registry is derived from the tools/blogs registries, but the database allowlist is deliberately explicit. Blog keys use the final path component of the article URL; preserve keys if moving an article to keep its history.

Verification:
1. Open a tool twice in one browser: visitors should increase only once.
2. Complete an action: tasks completed should increase once per successful action.
3. Open a blog twice: visitors increase once, article opens twice.
4. Use another browser: the same resource gains another visitor.
5. Block the API: counters show unavailable and tools still work.
6. Re-send the same event UUID: totals must not increase again.
