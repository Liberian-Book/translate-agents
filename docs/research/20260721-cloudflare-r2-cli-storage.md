---
topic: cloudflare-r2-cli-storage
created-by: research for change-id add-r2-book-upload (Cloudflare R2 S3-compatible storage patterns for a Node CLI)
date: 2026-07-21
libraries: ["@aws-sdk/client-s3", "@aws-sdk/lib-storage", "@aws-sdk/s3-request-presigner"]
used-by: ["add-r2-book-upload"]
---

# Research: cloudflare-r2-cli-storage

## Answers

- Recommended npm package: `@aws-sdk/client-s3` for all S3-compatible upload/download/list operations; add `@aws-sdk/lib-storage` for multipart uploads; add `@aws-sdk/s3-request-presigner` if the CLI needs presigned upload/download URLs.
- Env vars: use `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, and `R2_BUCKET` in the CLI; Cloudflare docs also support the generic `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` naming.
- Endpoint format: `https://<ACCOUNT_ID>.r2.cloudflarestorage.com` (jurisdictional buckets use `.eu` or `.fedramp` suffixes). Official JS examples set `region: "auto"`.
- Permissions: create an R2 API token scoped to the target bucket with `Object Read & Write` for upload + download + list; use `Object Read` or `Object Write` only if the CLI is split into narrower roles.
- Key-prefix layout: treat prefixes as namespaces, not folders. Recommended shape for book assets: `books/<bookId>/chapters/<chapterId>/assets/<kind>/<filename>`. Keep prefix segments stable, lowercase, and slash-delimited.
- Large vs small files: single `PutObjectCommand` is fine up to 5 GiB; use multipart (`Upload` or manual multipart commands) for >5 GiB or when resumability/parallelism matters. Multipart parts must be 5 MiB–5 GiB; max multipart object size is 5 TiB.
- Overwrite vs delete: `put` to an existing key overwrites by default. `delete` removes the object; it does not version or protect older content. For safer replace semantics, write a new key, verify it, then delete the old key.
- Verification approach: after upload, verify with `HeadObjectCommand` (size/content-type/ETag presence) and/or `GetObjectCommand` for a byte-for-byte readback on critical files; use `ListObjectsV2Command` with the expected prefix to confirm discoverability. For external sanity checks, `aws s3 ls/cp` against the R2 endpoint or `wrangler r2 object get/put` also work.

## Recommended Approach

- Use AWS SDK v3 against the R2 endpoint with `region: "auto"` and bucket-scoped R2 API credentials.
- For small book artifacts, do straightforward `PutObjectCommand`; for larger or unreliable transfers, switch to multipart via `@aws-sdk/lib-storage`.
- Store objects under a deterministic prefix tree per book/chapter so listing, cleanup, and selective re-runs stay simple.

## Installation

```bash
npm i @aws-sdk/client-s3 @aws-sdk/lib-storage @aws-sdk/s3-request-presigner
```

## Core API

- `S3Client({ region: "auto", endpoint: "https://<ACCOUNT_ID>.r2.cloudflarestorage.com", credentials: { accessKeyId, secretAccessKey } })`
- Common commands: `PutObjectCommand`, `GetObjectCommand`, `HeadObjectCommand`, `ListObjectsV2Command`, `DeleteObjectCommand`
- Multipart helper: `Upload` from `@aws-sdk/lib-storage`

## Platform-Specific Setup

- R2 API tokens are bucket-scopeable; prefer the narrowest bucket scope that still covers the CLI’s lifecycle.
- Presigned URLs are bearer tokens and should be short-lived.
- Official docs do not explicitly require `forcePathStyle` for the JS SDK examples; the documented endpoint is used directly.

## Usage Examples

- `mastra-ai/mastra`: uses `endpoint: 'https://{accountId}.r2.cloudflarestorage.com'`, `region: 'auto'`, and R2 access/secret env vars.
- `civitai/civitai`: tests both bucket-subdomain and path-style R2 URL parsing, showing real-world reliance on R2-hosted object URLs.

## Gotchas & Constraints

- Cloudflare docs cover the S3-compatible API and Wrangler commands separately; Wrangler auth is Cloudflare-account auth, not S3 API auth.
- Presigned R2 URLs work on the R2 API domain, not custom domains.
- Single-object uploads are limited to 5 GiB; above that, multipart is required.
- Prefix rules are a convention you define; Cloudflare uses them for listing/lifecycle/bucket-lock scoping, but does not prescribe a canonical layout.

## Gaps

- Official docs do not spell out a required `forcePathStyle` setting for the Node SDK.
- The docs do not define a canonical key hierarchy for book content; the prefix layout above is a recommendation.
- I did not verify checksum/ETag behavior for multipart uploads against Cloudflare-specific docs.
