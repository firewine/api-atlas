---
name: "GitHub REST API"
provider: "GitHub"
category: "developer-platform"
status: "active"
officialDocs: "https://docs.github.com/en/rest"
homepage: "https://github.com/"
baseUrl: "https://api.github.com"
auth: "Bearer token recommended; selected public resources allow unauthenticated requests"
versioning: "Version selected with X-GitHub-Api-Version header"
resourceGroups: ["Repositories","Issues","Pull requests","Actions","Git data","Users","Organizations"]
pagination: "Link headers and per_page/page or endpoint-specific cursors"
errors: "HTTP status with JSON message and documentation_url"
webhooks: "Repository, organization and app webhooks are supported"
sdks: ["Octokit"]
summary: "GitHub's official REST surface for repositories, collaboration, Actions, Git data, and account resources."
pricing: "API access follows GitHub product and authentication context"
rateLimit: "Primary and secondary rate limits depend on authentication and operation"
formats: ["JSON"]
protocols: ["REST","Webhooks"]
bestFor: ["Repository automation","Pull-request and issue integrations"]
cautions: ["Use fine-grained permissions.","Respect secondary limits and conditional requests."]
verifiedAt: "2026-09-13"
sourceUrls: ["https://docs.github.com/en/rest","https://docs.github.com/en/rest/using-the-rest-api"]
mutableFacts:
  - label: "Base URL"
    value: "https://api.github.com"
    sourceUrl: "https://docs.github.com/en/rest"
    verifiedAt: "2026-09-13"
  - label: "Authentication"
    value: "Bearer token recommended; selected public resources allow unauthenticated requests"
    sourceUrl: "https://docs.github.com/en/rest/using-the-rest-api"
    verifiedAt: "2026-09-13"
  - label: "Pricing"
    value: "API access follows GitHub product and authentication context"
    sourceUrl: "https://docs.github.com/en/rest/using-the-rest-api"
    verifiedAt: "2026-09-13"
  - label: "Rate limits"
    value: "Primary and secondary rate limits depend on authentication and operation"
    sourceUrl: "https://docs.github.com/en/rest/using-the-rest-api"
    verifiedAt: "2026-09-13"
tags: ["repositories","issues","pull-requests","developer-platform"]
---

## What it covers

GitHub's official REST surface for repositories, collaboration, Actions, Git data, and account resources. The profile stays deliberately concise: use the linked official reference for endpoint schemas and current commercial terms.

## Integration notes

Authenticate exactly as the provider documents, keep credentials out of client bundles, and retain upstream request identifiers when available. Pagination, retries, caching, and webhook verification should be implemented per product rather than inferred from another API.

## Key endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /repos/{owner}/{repo}` | Repository details |
| `GET /repos/{owner}/{repo}/issues` | List issues |
| `POST /repos/{owner}/{repo}/issues` | Create issue |
| `GET /repos/{owner}/{repo}/pulls` | List pull requests |
| `GET /repos/{owner}/{repo}/contents/{path}` | File contents |
| `GET /users/{username}` | User profile |
| `GET /search/repositories` | Search repositories |
| `GET /rate_limit` | Rate limit status |

## Decision notes

Best suited to repository automation and pull-request and issue integrations. Before production, verify use fine-grained permissions. respect secondary limits and conditional requests. Mutable limits, prices, and versions were checked on 2026-09-13 and should be rechecked at purchase or deployment time.

## Python example: repo info and issues

```python
import httpx

TOKEN = "your_github_token"  # fine-grained PAT recommended
BASE = "https://api.github.com"
HEADERS = {
    "Authorization": f"Bearer {TOKEN}",
    "Accept": "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
}

def get_repo(owner: str, repo: str) -> dict:
    resp = httpx.get(f"{BASE}/repos/{owner}/{repo}", headers=HEADERS, timeout=30)
    if resp.status_code == 404:
        raise ValueError("Repo not found or no access")
    resp.raise_for_status()
    return resp.json()

def list_issues(owner: str, repo: str, state: str = "open", per_page: int = 30) -> list[dict]:
    """List issues. Paginate via the Link header for more pages."""
    resp = httpx.get(
        f"{BASE}/repos/{owner}/{repo}/issues",
        headers=HEADERS,
        params={"state": state, "per_page": per_page},
        timeout=30,
    )
    if resp.status_code == 403 and "rate limit" in resp.text.lower():
        reset = resp.headers.get("x-ratelimit-reset", "?")
        raise RuntimeError(f"Rate limited until epoch {reset}")
    resp.raise_for_status()
    return resp.json()

repo = get_repo("firewine", "api-atlas")
print(repo["full_name"], "stars:", repo["stargazers_count"])
```

**Notes:**
- Send `X-GitHub-Api-Version: 2022-11-28`; unauthenticated calls get 60 req/hour, authed 5000
- Watch `x-ratelimit-remaining` / `x-ratelimit-reset` headers; secondary limits can 403 bursts
- Pagination uses the `Link` header (`rel="next"`); don't guess page counts
- Prefer fine-grained PATs with minimal repo scopes over classic tokens
