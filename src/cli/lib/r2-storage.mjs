import fs from 'node:fs';
import path from 'node:path';
import { DeleteObjectsCommand, ListObjectsV2Command, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getDataBookPath } from './paths.mjs';
import { loadR2Config } from './r2-config.mjs';

const BOOKS_PREFIX = 'books/';
const SAFE_BOOK_NAME_PATTERN = /^[a-z0-9][a-z0-9._-]*$/;

export function createR2Client(config = loadR2Config()) {
  return new S3Client({
    region: 'auto',
    endpoint: config.endpoint,
    credentials: config.credentials,
  });
}

export function mapBookFileToR2Key(bookName, relativePath) {
  const safeBookName = validateBookName(bookName);
  const normalizedRelativePath = normalizeRelativeBookPath(relativePath);
  return `${BOOKS_PREFIX}${safeBookName}/${normalizedRelativePath}`;
}

export async function uploadBookToR2(bookName, options = {}) {
  const safeBookName = validateBookName(bookName);
  const config = options.config ?? loadR2Config();
  const client = options.client ?? createR2Client(config);
  const bookDir = options.bookDir ?? getDataBookPath(safeBookName);
  const files = await listRegularFiles(bookDir);
  const result = {
    bookName: safeBookName,
    prefix: `${BOOKS_PREFIX}${safeBookName}/`,
    attempted: files.length,
    uploaded: 0,
    failed: [],
  };

  for (const filePath of files) {
    const relativePath = path.relative(bookDir, filePath);
    const key = mapBookFileToR2Key(safeBookName, relativePath);

    try {
      await client.send(new PutObjectCommand({
        Bucket: config.bucket,
        Key: key,
        Body: fs.createReadStream(filePath),
      }));
      result.uploaded += 1;
    } catch (error) {
      result.failed.push({
        path: filePath,
        key,
        error: error.message,
      });
    }
  }

  return result;
}

export async function deleteRemoteBook(bookName, options = {}) {
  const safeBookName = validateBookName(bookName);
  const config = options.config ?? loadR2Config();
  const client = options.client ?? createR2Client(config);
  const prefix = `${BOOKS_PREFIX}${safeBookName}/`;
  const keys = await listObjectKeys(client, config.bucket, prefix);
  const result = {
    bookName: safeBookName,
    prefix,
    attempted: keys.length,
    deleted: 0,
    failed: [],
  };

  for (let index = 0; index < keys.length; index += 1000) {
    const batch = keys.slice(index, index + 1000);
    try {
      const response = await client.send(new DeleteObjectsCommand({
        Bucket: config.bucket,
        Delete: {
          Objects: batch.map((Key) => ({ Key })),
          Quiet: false,
        },
      }));
      result.deleted += response.Deleted?.length ?? 0;
      for (const failure of response.Errors ?? []) {
        result.failed.push({
          key: failure.Key,
          error: failure.Message || failure.Code || 'delete-failed',
        });
      }
    } catch (error) {
      for (const key of batch) {
        result.failed.push({ key, error: error.message });
      }
    }
  }

  return result;
}

export function validateBookName(bookName) {
  const value = String(bookName ?? '').trim();
  if (!SAFE_BOOK_NAME_PATTERN.test(value) || value.includes('..')) {
    throw new Error('Invalid book name. Use a single slug segment with lowercase letters, numbers, dots, underscores, or hyphens.');
  }

  return value;
}

export async function listRemoteBooks(options = {}) {
  const config = options.config ?? loadR2Config();
  const client = options.client ?? createR2Client(config);
  const books = [];
  let continuationToken;

  do {
    const response = await client.send(new ListObjectsV2Command({
      Bucket: config.bucket,
      Prefix: BOOKS_PREFIX,
      Delimiter: '/',
      ContinuationToken: continuationToken,
    }));

    for (const commonPrefix of response.CommonPrefixes ?? []) {
      const prefix = commonPrefix.Prefix;
      const name = prefix?.slice(BOOKS_PREFIX.length).replace(/\/$/, '');
      if (name) books.push({ name, prefix });
    }

    continuationToken = response.IsTruncated ? response.NextContinuationToken : undefined;
  } while (continuationToken);

  return books;
}

async function listObjectKeys(client, bucket, prefix) {
  const keys = [];
  let continuationToken;

  do {
    const response = await client.send(new ListObjectsV2Command({
      Bucket: bucket,
      Prefix: prefix,
      ContinuationToken: continuationToken,
    }));

    for (const object of response.Contents ?? []) {
      if (object.Key) keys.push(object.Key);
    }

    continuationToken = response.IsTruncated ? response.NextContinuationToken : undefined;
  } while (continuationToken);

  return keys;
}

async function listRegularFiles(rootDir) {
  const rootStat = await fs.promises.stat(rootDir).catch(() => null);
  if (!rootStat?.isDirectory()) {
    throw new Error(`Book data folder not found: ${rootDir}`);
  }

  const files = [];
  await walk(rootDir, files);
  return files;
}

function normalizeRelativeBookPath(relativePath) {
  const rawPath = String(relativePath ?? '');
  const normalized = rawPath.split(/[\\/]+/).filter(Boolean).join('/');
  if (!normalized || path.isAbsolute(rawPath) || normalized.split('/').includes('..')) {
    throw new Error(`Invalid relative book file path: ${relativePath}`);
  }

  return normalized;
}

async function walk(currentDir, files) {
  const entries = await fs.promises.readdir(currentDir, { withFileTypes: true });
  for (const entry of entries) {
    const entryPath = path.join(currentDir, entry.name);
    if (entry.isDirectory()) {
      await walk(entryPath, files);
      continue;
    }

    if (entry.isFile()) {
      files.push(entryPath);
    }
  }
}
