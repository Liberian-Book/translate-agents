import path from 'node:path';
import { fileURLToPath } from 'node:url';

const cliDir = path.dirname(fileURLToPath(import.meta.url));

export const repoRoot = path.resolve(cliDir, '../../..');

export function resolveFromRepo(...segments) {
  return path.join(repoRoot, ...segments);
}

export function getBookPath(book) {
  return path.resolve(repoRoot, '..', book);
}

export function getDataBookPath(book) {
  return path.join(repoRoot, 'data', book);
}

export function formatBookOutput(book) {
  return getBookPath(book);
}
