---
topic: openai-image-edits
created-by: Research for asimov change add-image-edit-renderer
date: 2026-07-27
libraries: [openai]
used-by: [add-image-edit-renderer]
---

# Research: openai-image-edits

## Answers

- **Source links**
  - OpenAI guide: https://platform.openai.com/api/docs/guides/image-generation
  - OpenAI API reference index: https://platform.openai.com/api/reference/resources/images/methods/edit
  - openai-node implementation: https://github.com/openai/openai-node/blob/main/src/resources/images.ts
  - openai-node example: https://github.com/openai/openai-node/blob/main/examples/picture.ts
  - openai-node tests: https://github.com/openai/openai-node/blob/main/tests/api-resources/images.test.ts

- **Multipart inputs**
  - `client.images.edit()` posts to `/images/edits` as multipart form data.
  - Use `toFile(fs.createReadStream(...), name, { type })` for Node streams; `image` and `mask` are `Uploadable`.
  - `image` can be a single file or array of files.

- **Model selection**
  - Current SDK types accept: `gpt-image-1`, `gpt-image-1-mini`, `gpt-image-1.5`, `gpt-image-2`, `gpt-image-2-2026-04-21`, `chatgpt-image-latest`, and `dall-e-2`.
  - The inline `edit()` doc comment in `src/resources/images.ts` still only names `gpt-image-1.5`, `gpt-image-1`, `gpt-image-1-mini`, `chatgpt-image-latest`, and `dall-e-2`.
  - The OpenAI image guide says `gpt-image-2` is the latest image model and supports editing.

- **Output handling**
  - GPT image models return `b64_json` in `response.data[0].b64_json`; decode it to bytes.
  - `url` output is for `dall-e-2`/`dall-e-3` only and is time-limited (~60 minutes).
  - `response_format` is documented as not supported for GPT image models; the SDK type/examples still show it in tests, so do not rely on URL output for `gpt-image-2`.
  - Streaming edit events are also base64 (`image_edit.partial_image` / `image_edit.completed`).

- **Retryable failures**
  - SDK default retries: 2.
  - Retries apply to 408, 409, 429, 5xx, network failures, `AbortError`; exponential backoff with jitter and `Retry-After*` headers are respected.
  - For image edits, retry the whole request (including multipart upload) on transient failures; do not retry validation/model errors.

- **Image constraints for text-in-image translation**
  - GPT image models: up to 16 input images, each PNG/WebP/JPG, <50 MB.
  - `dall-e-2`: one square PNG, <4 MB.
  - `mask`: PNG, <4 MB, same dimensions as the first input image; transparent pixels mark edit regions.
  - `gpt-image-2` / `gpt-image-2-2026-04-21`: no transparent backgrounds; use `opaque` or `auto`.
  - `gpt-image-2` supports arbitrary `WIDTHxHEIGHT` sizes if both dimensions are divisible by 16; max 3840x2160.
  - For translation workflows, mask only the text area and keep prompt explicit about preserving layout/style.

## Recommended Approach

- Use `client.images.edit()` with multipart uploads (`toFile` + streams) and `model: 'gpt-image-2'` unless a rollback to `dall-e-2` is required.
- Treat output as base64 for GPT image models; save `response.data[0].b64_json` to a file, and only use URL handling for legacy DALL·E models.
- Keep retries at the SDK default for now; increase only for transient network/rate-limit issues.

## Gotchas & Constraints

- `response_format: 'url'` appears in tests for edit params, but the typed docs say GPT image models always return base64.
- The SDK docs around `edit()` lag the type definitions for `gpt-image-2`.
- Transparent backgrounds are explicitly unsupported on `gpt-image-2`.

## Gaps

- I did not verify the live API response shape against a real OpenAI account in this session.
- The OpenAI reference page for `edit` is JS-heavy; the most reliable live guidance I could confirm came from the image guide plus the openai-node source/types/examples.

## Confidence

High — confirmed via OpenAI docs plus openai-node source, examples, tests, and SDK type comments.
