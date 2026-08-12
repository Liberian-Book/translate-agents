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
    '<!doctype html><html><head><title>Chapter E2E</title></head><body><h1 class="vn visible" id="intro-vn">Chapter E2E Loaded</h1><p class="vn visible" id="intro-body-vn">Nội dung tiếng Việt đã dịch.</p><p class="eng hidden" id="intro-body">English source should stay hidden.</p></body></html>'
  );
  fs.writeFileSync(
    path.join(chapterBookDir, 'chapter-1', '05-translated', '1-1-section.html'),
    '<!doctype html><html><head><title>Section E2E</title></head><body><h1 class="vn visible" id="section-vn">Section E2E Loaded</h1><p class="vn visible" id="section-body-vn">Trang mục lục thứ hai.</p><p class="eng hidden" id="section-body">Second English source should stay hidden.</p></body></html>'
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
  await expect(page.getByRole('heading', { name: 'Chapter E2e Book', exact: true })).toBeVisible();
  await expect(readLink).toHaveAttribute('href', '/e2e-book/');
  await expect(page.locator('a.btn-review')).toHaveCount(0);

  await readLink.click();
  await expect(page.getByRole('heading', { name: 'E2E Book Loaded' })).toBeVisible();
});

test('chapter-layout book redirects within copied book path', async ({ page }) => {
  await page.goto('/chapter-e2e-book/');

  await expect(page).toHaveURL(/\/chapter-e2e-book\/chapter-1\/1-introduction\.html$/);
  await expect(page.getByRole('heading', { name: 'Chapter E2E Loaded' })).toBeVisible();
});

test('generated reader uses two panels with translated-only content and TOC navigation', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/chapter-e2e-book/');

  await expect(page).toHaveURL(/\/chapter-e2e-book\/chapter-1\/1-introduction\.html$/);
  await expect(page.locator('#br-toc-sidebar')).toBeVisible();
  await expect(page.locator('#br-main-content')).toBeVisible();
  await expect(page.locator('#intro-body-vn')).toBeVisible();
  await expect(page.locator('#intro-body')).toBeHidden();
  await expect(page.locator('#br-right-panel')).toHaveCount(0);
  await expect(page.locator('#br-review-link')).toHaveAttribute('href', '../review/chapter-1/1-introduction.html');

  const secondPageLink = page.locator('#br-toc-sidebar a[href$="1-1-section.html"]');
  await expect(secondPageLink).toBeVisible();
  await secondPageLink.click();

  await expect(page).toHaveURL(/\/chapter-e2e-book\/chapter-1\/1-1-section\.html$/);
  await expect(page.getByRole('heading', { name: 'Section E2E Loaded' })).toBeVisible();
  await expect(page.locator('#br-toc-sidebar a[aria-current="page"][href$="1-1-section.html"]')).toBeVisible();
});

test('reader page review link opens reviewer for the current page', async ({ page }) => {
  await page.goto('/chapter-e2e-book/');

  await page.locator('#br-review-link').click();
  await expect(page).toHaveURL(/\/chapter-e2e-book\/review\/chapter-1\/1-introduction\.html$/);
  await expect(page.locator('#br-comment-section')).toBeVisible();
});

test('mobile reader exposes accessible TOC control without persistent third panel', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 780 });
  await page.goto('/chapter-e2e-book/');

  const tocToggle = page.locator('#br-toc-toggle');
  await expect(tocToggle).toBeVisible();
  await expect(tocToggle).toHaveAttribute('aria-controls', 'br-toc-sidebar');
  await expect(tocToggle).toHaveAttribute('aria-expanded', 'false');
  await expect(page.locator('#br-toc-sidebar')).toHaveAttribute('aria-hidden', 'true');
  await expect(page.locator('#br-toc-sidebar')).toHaveAttribute('inert', '');
  await expect(page.locator('#br-toc-sidebar a[href$="1-1-section.html"]')).toHaveAttribute('tabindex', '-1');
  await expect(page.locator('#br-right-panel')).toHaveCount(0);

  await tocToggle.click();
  await expect(tocToggle).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('#br-toc-sidebar')).toHaveAttribute('aria-hidden', 'false');
  await expect(page.locator('#br-toc-sidebar')).not.toHaveAttribute('inert', '');
  await expect(page.locator('#br-toc-sidebar a[href$="1-1-section.html"]')).not.toHaveAttribute('tabindex', '-1');

  await page.locator('#br-toc-sidebar a[href$="1-1-section.html"]').click();
  await expect(page).toHaveURL(/\/chapter-e2e-book\/chapter-1\/1-1-section\.html$/);
  await expect(page.locator('#br-toc-toggle')).toHaveAttribute('aria-expanded', 'false');
  await expect(page.locator('#br-toc-sidebar')).toHaveAttribute('aria-hidden', 'true');
  await expect(page.locator('#section-body-vn')).toBeVisible();
});

test('generated reviewer route preserves source panel and comment section', async ({ page }) => {
  await page.goto('/chapter-e2e-book/review/');

  await expect(page).toHaveURL(/\/chapter-e2e-book\/review\/chapter-1\/1-introduction\.html$/);
  await expect(page.locator('#br-toc-sidebar')).toBeVisible();
  await expect(page.locator('#br-main-content')).toBeVisible();
  await expect(page.locator('#br-right-panel')).toBeVisible();
  await expect(page.locator('#br-eng-section')).toBeVisible();
  await expect(page.locator('#br-comment-section')).toBeVisible();
  await expect(page.locator('#br-comment-form')).toBeVisible();
  await expect(page.locator('#br-comment-list')).toBeVisible();
  await expect(page.locator('#intro-body')).toBeHidden();

  await page.locator('#intro-body-vn').hover();
  await expect(page.locator('#br-eng-content #intro-body')).toBeVisible();
});

test('legacy page review URL redirects to canonical reviewer page', async ({ page }) => {
  await page.goto('/chapter-e2e-book/chapter-1/1-introduction/review/');

  await expect(page).toHaveURL(/\/chapter-e2e-book\/review\/chapter-1\/1-introduction\.html$/);
  await expect(page.locator('#br-right-panel')).toBeVisible();
  await expect(page.locator('#br-comment-section')).toBeVisible();
});

test('site build copies generated book folders to deploy root', async () => {
  expect(fs.existsSync(path.join(siteSnapshotDir, 'e2e-book', 'index.html'))).toBe(true);
  expect(fs.existsSync(path.join(siteSnapshotDir, 'chapter-e2e-book', 'index.html'))).toBe(true);
  expect(fs.existsSync(path.join(siteSnapshotDir, 'chapter-e2e-book', 'review', 'index.html'))).toBe(true);
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
