---
title: "How to implement REST pagination"
summary: "Build one resilient iterator across page numbers, offsets, cursors, and next-link APIs without losing or duplicating records."
order: 4
updatedAt: "2026-09-13"
tags: ["rest", "pagination", "reliability"]
---

## Identify the contract

Common pagination patterns look similar but fail differently:

| Pattern | Request | Continue with |
| --- | --- | --- |
| Page number | `page=3&limit=100` | incremented page |
| Offset | `offset=200&limit=100` | returned or calculated offset |
| Cursor | `cursor=opaque-token` | exact returned token |
| Link | ordinary query | server-provided `next` URL or link header |

Never parse meaning from an opaque cursor. Store and send it exactly as returned.

## Prefer the server's continuation signal

Stop when `next` is absent or the API's documented `has_more` flag is false. A short page is not always the terminal signal, and a full page does not guarantee another exists. Follow the provider's contract.

```ts
async function* listAll(firstUrl: string) {
  let next: string | null = firstUrl;
  const seen = new Set<string>();

  while (next) {
    if (seen.has(next)) throw new Error('Pagination loop detected');
    seen.add(next);

    const response = await fetch(next);
    if (!response.ok) throw new Error(`Request failed: ${response.status}`);
    const page = await response.json();

    for (const item of page.data) yield item;
    next = page.next ?? null;
  }
}
```

Adapt the field names, authentication, origin checks, and retry policy to the documented API.

## Expect a moving dataset

Offset pagination can duplicate or skip records when rows are inserted during traversal. Prefer a stable sort plus cursor when available. If the API supports a snapshot time or `updated_before` boundary, freeze it at the start and reuse it for every page.

Deduplicate by a stable resource ID and define how updates to the same ID are applied. Do not use array position as identity.

## Make long traversals resumable

Checkpoint the continuation token only after the corresponding page is committed. Store the query parameters and snapshot boundary with it. On restart, continue from the checkpoint and make writes idempotent.

## Defend against bad pagination

Set maximum pages and records, detect repeated cursors or URLs, validate that continuation links remain on an allowed host, and surface a metric when a traversal ends unexpectedly. Test empty, one-page, exact-multiple, changing-dataset, repeated-token, throttle, and mid-page failure cases.
