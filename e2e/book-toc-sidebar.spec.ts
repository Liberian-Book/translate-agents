import { execFileSync, spawn, type ChildProcess } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { expect, test } from '@playwright/test';

const repoRoot = process.cwd();
const baseURL = 'http://127.0.0.1:4174';
const chapterTocBookDir = path.join(repoRoot, 'data', 'chapter-toc-e2e-book');
const chapterTocSiteBookDir = path.join(repoRoot, 'apps', 'web-site', 'books', 'chapter-toc-e2e-book');
const buildLockDir = path.join(repoRoot, 'test-results', '.build-site.lock');
const siteSnapshotDir = path.join(repoRoot, 'test-results', 'book-toc-site');
let server: ChildProcess | undefined;

test.beforeAll(async () => {
  fs.rmSync(chapterTocBookDir, { recursive: true, force: true });
  fs.rmSync(chapterTocSiteBookDir, { recursive: true, force: true });
  writeChapterTocFixture();
  execFileSync('npm', ['run', 'build:book', '--', chapterTocBookDir], { cwd: repoRoot, stdio: 'inherit' });
  await runSiteBuildSnapshot();

  server = spawn('python3', ['-m', 'http.server', '4174', '--directory', siteSnapshotDir], {
    cwd: repoRoot,
    stdio: 'ignore',
  });

  await waitForServer();
});

test.afterAll(async () => {
  server?.kill();
  await withBuildLock(() => {
    fs.rmSync(chapterTocBookDir, { recursive: true, force: true });
    fs.rmSync(chapterTocSiteBookDir, { recursive: true, force: true });
    fs.rmSync(siteSnapshotDir, { recursive: true, force: true });
  });
});

test('book page renders left TOC with current-page state and navigation', async ({ page }) => {
  await page.goto(`${baseURL}/entrepreneurship/1-introduction.html`);

  const toc = page.locator('#br-toc-sidebar');
  await expect(toc).toBeVisible();

  const pageCount = await page.evaluate(() => window.BOOK_PAGES.length);
  await expect(toc.locator('.br-toc-link')).toHaveCount(pageCount);
  await expect(toc.locator('.br-toc-chapter details').first()).toHaveAttribute('open', '');
  await expect(toc.locator('.br-toc-chapter summary').first()).toContainText('Chapter 1');

  const currentLink = toc.locator('.br-toc-link[aria-current="page"]');
  await expect(currentLink).toHaveAttribute('href', '1-introduction.html');
  await expect(currentLink).toContainText('1 Introduction');

  await toc.getByRole('link', { name: /1\.1 Entrepreneurship Today/ }).click();
  await expect(page).toHaveURL(`${baseURL}/entrepreneurship/1-1-entrepreneurship-today.html`);
});

test('book TOC remains reachable on mobile without hiding content', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 780 });
  await page.goto(`${baseURL}/entrepreneurship/1-introduction.html`);

  await expect(page.locator('#br-toc-sidebar')).toBeVisible();
  await expect(page.locator('#br-main-content')).toBeVisible();
  await expect(page.locator('#br-main-content h1.vn.visible, #br-main-content h2.vn.visible').first()).toBeVisible();
});

test('chapter-layout TOC links resolve from nested chapter pages', async ({ page }) => {
  await page.goto(`${baseURL}/chapter-toc-e2e-book/chapter-1/1-introduction.html`);

  const toc = page.locator('#br-toc-sidebar');
  await expect(toc).toBeVisible();
  await expect(toc.getByRole('link', { name: '1 Introduction' })).toHaveAttribute('href', '../chapter-1/1-introduction.html');
  await toc.locator('.br-toc-chapter summary').filter({ hasText: 'Chapter 2' }).click();
  await expect(toc.getByRole('link', { name: '2 Introduction' })).toHaveAttribute('href', '../chapter-2/2-introduction.html');

  await toc.getByRole('link', { name: '2 Introduction' }).click();
  await expect(page).toHaveURL(`${baseURL}/chapter-toc-e2e-book/chapter-2/2-introduction.html`);
  await expect(page.getByRole('heading', { name: 'Chapter 2 Loaded' })).toBeVisible();
});

test('book TOC chapter clicks keep one chapter open', async ({ page }) => {
  await page.goto(`${baseURL}/entrepreneurship/1-introduction.html`);

  const toc = page.locator('#br-toc-sidebar');
  const firstChapter = toc.locator('.br-toc-chapter details').first();
  const firstChapterSummary = firstChapter.locator('summary');
  const secondChapter = toc.locator('.br-toc-chapter details').nth(1);
  const secondChapterSummary = secondChapter.locator('summary');

  await expect(firstChapter).toHaveAttribute('open', '');
  await firstChapterSummary.click();
  await expect(firstChapter).toHaveAttribute('open', '');
  await secondChapterSummary.click();
  await expect(firstChapter).not.toHaveAttribute('open', '');
  await expect(secondChapter).toHaveAttribute('open', '');
  await secondChapterSummary.click();
  await expect(secondChapter).toHaveAttribute('open', '');
});

test('book TOC active item persists after changing chapters', async ({ page }) => {
  await page.route(`${baseURL}/entrepreneurship/1-introduction`, async (route) => {
    await route.fulfill({
      path: path.join(siteSnapshotDir, 'entrepreneurship', '1-introduction.html'),
      contentType: 'text/html; charset=utf-8',
    });
  });

  await page.goto(`${baseURL}/entrepreneurship/1-introduction`);

  const toc = page.locator('#br-toc-sidebar');
  await toc.locator('.br-toc-chapter summary').filter({ hasText: 'Chapter 2' }).click();
  await toc.getByRole('link', { name: '2 Introduction' }).click();

  await expect(page).toHaveURL(/\/entrepreneurship\/2-introduction(?:\.html)?$/);
  const chapter2 = toc.locator('.br-toc-chapter details').nth(1);
  await expect(chapter2).toHaveAttribute('open', '');
  const activeLink = toc.locator('.br-toc-link[aria-current="page"]');
  await expect(activeLink).toHaveAttribute('href', '2-introduction.html');
  await expect(activeLink).toContainText('2 Introduction');
});

async function waitForServer() {
  const deadline = Date.now() + 10_000;
  let lastError;

  while (Date.now() < deadline) {
    try {
      const response = await fetch(`${baseURL}/books.json`);
      if (response.ok) return;
    } catch (error) {
      lastError = error;
    }

    await new Promise((resolve) => setTimeout(resolve, 200));
  }

  throw lastError ?? new Error('Timed out waiting for local static server');
}

function writeChapterTocFixture() {
  const chapter1Dir = path.join(chapterTocBookDir, 'chapter-1', '05-translated');
  const chapter2Dir = path.join(chapterTocBookDir, 'chapter-2', '05-translated');
  fs.mkdirSync(chapter1Dir, { recursive: true });
  fs.mkdirSync(chapter2Dir, { recursive: true });
  fs.writeFileSync(
    path.join(chapter1Dir, '1-introduction.html'),
    '<!doctype html><html><head><title>Chapter 1</title></head><body><h1 class="vn visible">Chapter 1 Loaded</h1></body></html>'
  );
  fs.writeFileSync(
    path.join(chapter2Dir, '2-introduction.html'),
    '<!doctype html><html><head><title>Chapter 2</title></head><body><h1 class="vn visible">Chapter 2 Loaded</h1></body></html>'
  );
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
