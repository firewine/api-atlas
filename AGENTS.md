# API Atlas contributor contract

Read `README.md` and `docs/CONTENT_AUTHORING.md` before changing provider content or validation.

- Provider Markdown is the source for both HTML and JSON. Preserve existing facts and other contributors' edits.
- Each provider requires exactly one sourced fact for each key: `base-url`, `authentication`, `pricing`, `rate-limits`. Labels are editable display text. Extra facts may omit `key`.
- Every fact source must appear in `sourceUrls`, and every claim needs the date on which it was actually checked. Verify mutable facts against official sources; explicitly state unknown or conditional values rather than inventing numbers.
- Shared provenance rules live in `src/lib/provider-provenance.mjs`. The Astro schema and built catalog validator must use the same rules. Do not bypass failures or weaken tests to publish content.
- Practical cases use the existing Guides template and the shared `src/lib/case-study.mjs` contract. Follow `docs/CONTENT_AUTHORING.md`: dated source snapshots, one intent/3–5 related keyword candidates, editorial review, static SEO/link checks and post-deploy Search Console receipts. Never refresh review dates at build time or publish synthetic test fixtures as real cases.
- Run `npm run validate` on the complete pending change before committing. Group related provider additions into a validated commit instead of pushing each incomplete file separately.
- For workflow, URL or runtime changes, install Chromium with `npx playwright install chromium`, then run `npm run validate:ci` for both documented deployment modes.
- A cancelled Actions run may be superseded by a newer push; inspect the newest commit's result before calling it a failure or a success.
- Keep production hosting/security policy changes separate from application validation. A green build does not prove deployment or policy application.
