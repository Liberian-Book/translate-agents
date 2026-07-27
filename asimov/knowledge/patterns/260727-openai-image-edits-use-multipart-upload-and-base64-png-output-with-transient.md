---
labels: [image-edit, openai, multipart, retry, assets]
source: add-image-edit-renderer
summary: The image-edit renderer posts multipart FormData to /v1/images/edits, sends the source image as a Blob, reads data[0].b64_json, decodes it to PNG bytes, and only retries transient network/408/409/429/5xx failures. On non-transient failure it records fallback metadata and can fall back to overlay.
---
# OpenAI image edits use multipart upload and base64 PNG output with transient-only retries
**Date**: 2026-07-27

The image-edit renderer posts multipart FormData to /v1/images/edits, sends the source image as a Blob, reads data[0].b64_json, decodes it to PNG bytes, and only retries transient network/408/409/429/5xx failures. On non-transient failure it records fallback metadata and can fall back to overlay.
