const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://openstax.org';
const MAX_DISCOVERY_PASSES = 8;
const STABLE_DISCOVERY_PASSES = 2;
const DOWNLOAD_RETRIES = 1;

const bookName = process.argv[2];
const startUrl = process.argv[3];

if (!bookName || !startUrl) {
  console.error("Vui lòng cung cấp tên sách và URL bắt đầu! Ví dụ: node skills/skill-scrape.js entrepreneurship https://openstax.org/books/entrepreneurship/pages/1-introduction");
  process.exit(1);
}

const BOOK_URL = startUrl;
const BOOK_DIR = path.join(__dirname, '../../../data', bookName);
const RAW_DIR = path.join(BOOK_DIR, 'raw');
const PLAN_PATH = path.join(BOOK_DIR, 'scrape-plan.json');
const STATE_PATH = path.join(BOOK_DIR, 'scrape-state.json');

fs.mkdirSync(RAW_DIR, { recursive: true });

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function normalizeBookUrl(href) {
  if (!href) return null;

  try {
    const url = new URL(href, BASE_URL);
    url.hash = '';
    url.search = '';

    const expectedPrefix = `/books/${bookName}/pages/`;
    if (url.origin !== BASE_URL || !url.pathname.startsWith(expectedPrefix)) {
      return null;
    }

    const slug = url.pathname.split('/').pop();
    if (!slug) return null;

    return {
      url: url.toString(),
      fileName: `${slug}.html`,
    };
  } catch (_error) {
    return null;
  }
}

function buildPlan(entries) {
  const seen = new Set();
  const pages = [];

  for (const entry of entries) {
    const normalized = normalizeBookUrl(entry.href);
    if (!normalized || seen.has(normalized.url)) continue;
    seen.add(normalized.url);
    pages.push(normalized);
  }

  return {
    bookName,
    startUrl: BOOK_URL,
    generatedAt: new Date().toISOString(),
    totalPages: pages.length,
    pages,
  };
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

async function collectBookLinks(page) {
  return page.evaluate(() => {
    const anchors = Array.from(document.querySelectorAll('a'));
    return anchors.map(anchor => ({
      href: anchor.href || anchor.getAttribute('href') || '',
      rawHref: anchor.getAttribute('href') || '',
      text: (anchor.textContent || '').trim(),
    }));
  });
}

async function expandTocOnce(page) {
  return page.evaluate(() => {
    const controls = Array.from(document.querySelectorAll('button, summary, [role="button"], [aria-expanded="false"]'));
    let clicked = 0;

    for (const control of controls) {
      const ariaExpanded = control.getAttribute('aria-expanded');
      const label = [
        control.getAttribute('aria-label'),
        control.getAttribute('title'),
        control.textContent,
      ].filter(Boolean).join(' ').toLowerCase();
      const looksExpandable = ariaExpanded === 'false' || /contents|chapter|expand|mục lục|table of contents/.test(label);

      if (!looksExpandable) continue;

      const rect = control.getBoundingClientRect();
      if (rect.width === 0 && rect.height === 0) continue;

      try {
        control.click();
        clicked += 1;
      } catch (_error) {
        // Ignore controls that cannot be clicked from the page context.
      }
    }

    return clicked;
  });
}

async function discoverBookPlan(page) {
  console.log('Đang mở rộng mục lục và trích xuất liên kết toàn bộ sách...');

  const entries = [];
  const seenHrefs = new Set();
  let lastCount = 0;
  let stablePasses = 0;

  for (let pass = 1; pass <= MAX_DISCOVERY_PASSES; pass++) {
    const clicked = await expandTocOnce(page);
    await wait(1000);

    const links = await collectBookLinks(page);
    for (const link of links) {
      if (!link.href || seenHrefs.has(link.href)) continue;
      seenHrefs.add(link.href);
      entries.push(link);
    }

    const plan = buildPlan(entries);
    console.log(`  - Lượt ${pass}: ${plan.totalPages} liên kết hợp lệ, đã click ${clicked} mục mở rộng.`);

    if (plan.totalPages === lastCount) {
      stablePasses += 1;
    } else {
      stablePasses = 0;
      lastCount = plan.totalPages;
    }

    if (stablePasses >= STABLE_DISCOVERY_PASSES) {
      return plan;
    }
  }

  return buildPlan(entries);
}

async function downloadPage(page, entry) {
  for (let attempt = 1; attempt <= DOWNLOAD_RETRIES + 1; attempt++) {
    try {
      await page.goto(entry.url, { waitUntil: 'networkidle2' });
      return await page.content();
    } catch (error) {
      if (attempt > DOWNLOAD_RETRIES) throw error;
      console.warn(`  ⚠️ Tải lỗi, thử lại (${attempt}/${DOWNLOAD_RETRIES}): ${entry.fileName}`);
      await wait(1000);
    }
  }
}

async function scrapeBook() {
  console.log('Khởi động trình duyệt...');
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  const state = {
    bookName,
    status: 'running',
    startedAt: new Date().toISOString(),
    finishedAt: null,
    totalPages: 0,
    downloaded: 0,
    skipped: 0,
    failed: 0,
    failures: [],
  };
  
  try {
    console.log(`Đang truy cập ${BOOK_URL}...`);
    await page.goto(BOOK_URL, { waitUntil: 'networkidle2' });

    const plan = await discoverBookPlan(page);
    writeJson(PLAN_PATH, plan);
    state.totalPages = plan.totalPages;

    console.log(`Tìm thấy ${plan.totalPages} trang/chương hợp lệ.`);
    console.log(`Đã ghi kế hoạch scrape: ${PLAN_PATH}`);

    for (let i = 0; i < plan.pages.length; i++) {
      const entry = plan.pages[i];
      const fileName = entry.fileName;
      const filePath = path.join(RAW_DIR, fileName);

      console.log(`[${i + 1}/${plan.totalPages}] Đang tải (raw): ${fileName}`);

      try {
        const html = await downloadPage(page, entry);
        fs.writeFileSync(filePath, html, 'utf8');
        state.downloaded += 1;
      } catch (error) {
        state.failed += 1;
        state.failures.push({
          url: entry.url,
          fileName,
          error: error.message,
        });
        console.error(`  ❌ Không tải được ${fileName}: ${error.message}`);
      }

      await new Promise(r => setTimeout(r, 1000));
    }

    state.status = state.failed > 0 ? 'completed_with_failures' : 'completed';
    console.log('✅ Hoàn tất quá trình tải sách gốc!');

  } catch (error) {
    state.status = 'failed';
    state.failures.push({
      url: BOOK_URL,
      fileName: null,
      error: error.message,
    });
    console.error('❌ Lỗi trong quá trình thu thập:', error);
  } finally {
    state.finishedAt = new Date().toISOString();
    writeJson(STATE_PATH, state);
    console.log(`Đã ghi trạng thái scrape: ${STATE_PATH}`);
    await browser.close();
  }
}

scrapeBook();
