# Cloudflare Pages deployment

The application is a static Astro build. No server runtime, database, or API secret is required.

## Pages project settings

- Production branch: `main`
- Build command: `npm run validate`
- Build output directory: `dist`
- Node.js version: `24`
- Environment variable: `SITE_URL=https://<production-hostname>`

Connect `firewine/api-atlas` from **Workers & Pages → Create → Pages → Import an existing Git repository**. The first build should use the settings above. Do not add vendor API keys: every catalog page is generated from checked-in editorial data.

## Custom domain

Add the final hostname in the Pages project, then update `SITE_URL` to that exact HTTPS origin and rebuild. The variable drives canonical URLs, sitemap entries, `robots.txt`, and `llms.txt`.

## Post-deploy checks

Verify these return HTTP 200 with the production hostname in canonical/discovery output:

```text
/
/apis/
/api/catalog.json
/robots.txt
/sitemap.xml
/llms.txt
/pagefind/pagefind.js
```

Also check one provider HTML page and its matching JSON record, then confirm `_headers` supplied the security headers. Cloudflare analytics or bot controls must not be used to fabricate advertising impressions.
