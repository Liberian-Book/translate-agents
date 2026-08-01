import { execFileSync, spawn, type ChildProcess } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { expect, test } from '@playwright/test';

const repoRoot = process.cwd();
const fixtureBookDir = path.join(repoRoot, 'data', 'e2e-book');
const chapterBookDir = path.join(repoRoot, 'data', 'chapter-e2e-book');
const fixtureSiteBookDir = path.join(repoRoot, 'apps', 'web-site', 'books', 'e2e-book');
const chapterSiteBookDir = path.join(repoRoot, 'apps', 'web-site', 'books', 'chapter-e2e-book');
const buildLockDir = path.join(repoRoot, 'test-results', '.build-site.lock');
const siteSnapshotDir = path.join(repoRoot, 'test-results', 'site-books-site');
let server: ChildProcess | undefined;

test.beforeAll(async () => {
  fs.rmSync(fixtureBookDir, { recursive: true, force: true });
  fs.rmSync(chapterBookDir, { recursive: true, force: true });
  fs.rmSync(fixtureSiteBookDir, { recursive: true, force: true });
  fs.rmSync(chapterSiteBookDir, { recursive: true, force: true });

  fs.mkdirSync(fixtureBookDir, { recursive: true });
  fs.mkdirSync(path.join(fixtureSiteBookDir, 'book-reader'), { recursive: true });
  fs.writeFileSync(
    path.join(fixtureSiteBookDir, 'index.html'),
    '<!doctype html><html><head><title>E2E Book</title></head><body><h1>E2E Book Loaded</h1></body></html>'
  );
  fs.writeFileSync(path.join(fixtureSiteBookDir, 'book-reader', 'book-pages.js'), 'window.BOOK_PAGES = [];');

  fs.mkdirSync(path.join(chapterBookDir, 'chapter-1', '05-translated'), { recursive: true });
  fs.writeFileSync(
    path.join(chapterBookDir, 'chapter-1', '05-translated', '1-introduction.html'),
    '<!doctype html><html><head><title>Chapter E2E</title></head><body><h1>Chapter E2E Loaded</h1></body></html>'
  );
  execFileSync('npm', ['run', 'build:book', '--', chapterBookDir], { cwd: repoRoot, stdio: 'inherit' });

  await runSiteBuildSnapshot();

  server = spawn('python3', ['-m', 'http.server', '4173', '--directory', siteSnapshotDir], {
    cwd: repoRoot,
    stdio: 'ignore',
  });

  await waitForServer();
});

test.afterAll(async () => {
  server?.kill();
  await withBuildLock(() => {
    fs.rmSync(fixtureBookDir, { recursive: true, force: true });
    fs.rmSync(chapterBookDir, { recursive: true, force: true });
    fs.rmSync(fixtureSiteBookDir, { recursive: true, force: true });
    fs.rmSync(chapterSiteBookDir, { recursive: true, force: true });
    fs.rmSync(siteSnapshotDir, { recursive: true, force: true });
  });
});

test('homepage renders manifest book link and copied book page loads', async ({ page }) => {
  await page.goto('/');

  const readLink = page.locator('a.btn-read[href="/e2e-book/"]');
  await expect(page.getByRole('heading', { name: 'E2e Book', exact: true })).toBeVisible();
  await expect(readLink).toHaveAttribute('href', '/e2e-book/');

  await readLink.click();
  await expect(page.getByRole('heading', { name: 'E2E Book Loaded' })).toBeVisible();
});

test('chapter-layout book redirects within copied book path', async ({ page }) => {
  await page.goto('/chapter-e2e-book/');

  await expect(page).toHaveURL(/\/chapter-e2e-book\/chapter-1\/1-introduction\.html$/);
  await expect(page.getByRole('heading', { name: 'Chapter E2E Loaded' })).toBeVisible();
});

test('site build copies generated book folders to deploy root', async () => {
  expect(fs.existsSync(path.join(siteSnapshotDir, 'e2e-book', 'index.html'))).toBe(true);
  expect(fs.existsSync(path.join(siteSnapshotDir, 'chapter-e2e-book', 'index.html'))).toBe(true);
});

async function waitForServer() {
  const deadline = Date.now() + 10_000;
  let lastError;

  while (Date.now() < deadline) {
    try {
      const response = await fetch('http://127.0.0.1:4173/books.json');
      if (response.ok) return;
    } catch (error) {
      lastError = error;
    }

    await new Promise((resolve) => setTimeout(resolve, 200));
  }

  throw lastError ?? new Error('Timed out waiting for local static server');
}

async function runSiteBuildSnapshot() {
  await withBuildLock(() => {
    execFileSync('npm', ['run', 'build:site'], { cwd: repoRoot, stdio: 'inherit' });
    fs.rmSync(siteSnapshotDir, { recursive: true, force: true });
    fs.cpSync(path.join(repoRoot, 'dist', 'site'), siteSnapshotDir, { recursive: true });
  });
}

async function withBuildLock(fn: () => void) {
  fs.mkdirSync(path.dirname(buildLockDir), { recursive: true });
  const deadline = Date.now() + 30_000;

  while (true) {
    try {
      fs.mkdirSync(buildLockDir);
      break;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'EEXIST' || Date.now() > deadline) throw error;
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  try {
    fn();
  } finally {
    fs.rmSync(buildLockDir, { recursive: true, force: true });
  }
}
