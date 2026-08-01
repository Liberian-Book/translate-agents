import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { checkbox, input, select } from '@inquirer/prompts';
import chalk from 'chalk';
import { runTranslateText } from './commands/translate.mjs';
import { printUploadResult } from './commands/upload.mjs';
import { repoRoot } from './lib/paths.mjs';
import { searchOpenStaxBooks } from './lib/openstax-books.mjs';
import { uploadBookToR2 } from './lib/r2-storage.mjs';
import { runScript } from './lib/run-script.mjs';

const ACTION_TRANSLATE_BOOK = 'Dịch sách';
const ACTION_RETRANSLATE_TEXT = 'Dịch lại chữ';
const ACTION_RETRANSLATE_IMAGES = 'Dịch lại hình ảnh';
const ACTION_TRANSLATED_LIST = 'Danh sách đã dịch';
const ACTION_UPLOAD_BOOK = 'Tải sách lên R2';
const ACTIONS = [ACTION_TRANSLATE_BOOK, ACTION_RETRANSLATE_TEXT, ACTION_RETRANSLATE_IMAGES, ACTION_TRANSLATED_LIST, ACTION_UPLOAD_BOOK];

export async function runInteractive() {
  try {
    console.log('Chào mừng đến với cyberkbooks');
    console.log();

    const action = await select({
      message: 'Bạn muốn làm gì?',
      choices: ACTIONS.map((value) => ({ value, name: value })),
    });

    await runSelectedAction({ action });
  } catch (error) {
    if (isPromptCancellation(error)) {
      console.log(chalk.dim('Đã hủy.'));
      return;
    }

    throw error;
  }
}

export async function runSelectedAction({ action }) {
  switch (action) {
    case ACTION_TRANSLATE_BOOK:
      await runBookSearchFlow();
      return;
    case ACTION_RETRANSLATE_TEXT:
      await runRetranslateTextFlow();
      return;
    case ACTION_RETRANSLATE_IMAGES:
      await runRetranslateImagesFlow();
      return;
    case ACTION_TRANSLATED_LIST:
      printTranslatedBooks();
      return;
    case ACTION_UPLOAD_BOOK:
      await runUploadLocalBookFlow();
      return;
    default:
      throw new Error(`Không nhận diện được lựa chọn: ${action}`);
  }
}

async function runRetranslateTextFlow() {
  const books = listLocalBookFolders();
  if (books.length === 0) {
    console.log('Không tìm thấy sách nào trong thư mục data.');
    return;
  }

  const selectedBook = await select({
    message: 'Chọn sách để dịch lại chữ:',
    choices: books.map((book) => ({ value: book, name: book })),
  });
  const target = await input({
    message: 'Nhập tệp HTML hoặc all:',
    default: 'all',
  });

  console.log(chalk.cyan(`Đang dịch lại chữ cho sách: ${selectedBook}`));
  await runTranslateText({ book: selectedBook, target, prep: true, force: true });
  console.log(chalk.green(`Hoàn tất dịch lại chữ: ${selectedBook}`));
}

async function runRetranslateImagesFlow() {
  const books = listLocalBookFolders();
  if (books.length === 0) {
    console.log('Không tìm thấy sách nào trong thư mục data.');
    return;
  }

  const selectedBook = await select({
    message: 'Chọn sách đã dịch để dịch lại hình ảnh:',
    choices: books.map((book) => ({ value: book, name: book })),
  });
  const target = await input({
    message: 'Nhập tệp HTML, số chương, hoặc all:',
    default: 'all',
  });

  console.log(chalk.cyan(`Đang dịch lại hình ảnh cho sách: ${selectedBook}`));
  await runScript('agents/agent-translate/scripts/translate-images.js', [target, selectedBook, '--retranslate', '--renderer', 'image-edit', '--strict']);
  console.log(chalk.green(`Hoàn tất dịch lại hình ảnh: ${selectedBook}`));
}

async function runUploadLocalBookFlow() {
  const books = listLocalBookFolders();
  if (books.length === 0) {
    console.log('Không tìm thấy sách nào trong thư mục data.');
    return;
  }

  const selectedBook = await select({
    message: 'Chọn sách trong data/ để tải lên R2:',
    choices: books.map((book) => ({ value: book, name: book })),
  });

  console.log(chalk.cyan(`Đang tải dữ liệu sách lên R2: ${selectedBook}`));
  const result = await uploadBookToR2(selectedBook);
  printUploadResult(result);

  if (result.failed.length > 0) {
    throw new Error(`Tải lên R2 thất bại với ${result.failed.length} tệp.`);
  }
}

async function runBookSearchFlow() {
  const query = await input({ message: 'Nhập tên sách OpenStax cần tìm:' });
  const results = await searchOpenStaxBooks(query);

  if (results.length === 0) {
    console.log('Không tìm thấy sách OpenStax phù hợp.');
    return;
  }

  const selectedBook = await select({
    message: 'Chọn sách muốn dịch:',
    choices: results.map((book) => ({
      name: `${book.title} (${book.slug})`,
      value: book,
      description: book.url,
    })),
  });

  console.log();
  console.log(`Đã chọn: ${selectedBook.title}`);
  console.log(`Đường dẫn: ${selectedBook.url}`);
  await runTranslationPipeline(selectedBook);
}

async function runTranslationPipeline(book) {
  const bookName = book.slug;
  const startUrl = await resolveBookStartUrl(book);
  const bookDir = path.join(repoRoot, 'data', bookName);
  const siteBookDir = path.join(repoRoot, 'apps', 'web-site', 'books', bookName);
  const cleanDir = path.join(bookDir, 'clean');
  const prepDir = path.join(bookDir, 'prep');
  let selectedChapters = 'all';
  const steps = [
    'Tải sách từ OpenStax',
    'Làm sạch HTML và tải tài nguyên',
    'Trích xuất thuật ngữ',
    'Chuẩn bị tệp song ngữ',
    'Dịch nội dung',
    'Dịch chữ trong hình ảnh',
    'Tạo HTML tĩnh',
    'Tải dữ liệu sách lên R2',
  ];

  console.log();
  console.log(chalk.cyan(`Bắt đầu dịch sách: ${book.title}`));
  console.log(chalk.dim(`URL bắt đầu: ${startUrl}`));
  console.log(chalk.dim(`Thư mục dữ liệu: ${bookDir}`));
  console.log(chalk.dim(`HTML website: ${siteBookDir}`));

  renderProgressBar({ label: steps[0], current: 0, total: steps.length });
  await runScript('agents/agent-scrape/scripts/skill-scrape.js', [bookName, startUrl]);
  renderProgressBar({ label: `Hoàn tất: ${steps[0]}`, current: 1, total: steps.length });

  renderProgressBar({ label: steps[1], current: 1, total: steps.length });
  await runScript('agents/agent-scrape/scripts/skill-cleanup.js', [bookName]);
  renderProgressBar({ label: `Hoàn tất: ${steps[1]}`, current: 2, total: steps.length });

  selectedChapters = await selectChaptersForTranslation({ cleanDir });
  if (selectedChapters !== 'all') {
    console.log(chalk.cyan(`Chỉ dịch chương: ${selectedChapters.join(', ')}`));
  }

  renderProgressBar({ label: steps[2], current: 2, total: steps.length });
  if (selectedChapters === 'all') {
    await runScript('agents/agent-analyze/scripts/term-extract.js', [bookName, 'all']);
  } else {
    for (const chapter of selectedChapters) {
      await runScript('agents/agent-analyze/scripts/term-extract.js', [bookName, chapter]);
    }
  }
  renderProgressBar({ label: `Hoàn tất: ${steps[2]}`, current: 3, total: steps.length });

  renderProgressBar({ label: steps[3], current: 3, total: steps.length });
  await prepareCleanFiles({ cleanDir, prepDir, chapters: selectedChapters });
  renderProgressBar({ label: `Hoàn tất: ${steps[3]}`, current: 4, total: steps.length });

  renderProgressBar({ label: steps[4], current: 4, total: steps.length });
  if (selectedChapters === 'all') {
    await runScript('agents/agent-translate/scripts/translate.js', [bookName]);
  } else {
    for (const file of listChapterHtmlFiles(cleanDir, selectedChapters)) {
      await runScript('agents/agent-translate/scripts/translate.js', [bookName, file]);
    }
  }
  renderProgressBar({ label: `Hoàn tất: ${steps[4]}`, current: 5, total: steps.length });

  renderProgressBar({ label: steps[5], current: 5, total: steps.length });
  if (selectedChapters === 'all') {
    await runScript('agents/agent-translate/scripts/translate-images.js', ['all', bookName, '--renderer', 'image-edit', '--strict']);
  } else {
    for (const chapter of selectedChapters) {
      await runScript('agents/agent-translate/scripts/translate-images.js', [chapter, bookName, '--renderer', 'image-edit', '--strict']);
    }
  }
  renderProgressBar({ label: `Hoàn tất: ${steps[5]}`, current: 6, total: steps.length });

  renderProgressBar({ label: steps[6], current: 6, total: steps.length });
  await runPythonScript('agents/agent-archive/scripts/build-preview.py', [bookDir]);
  renderProgressBar({ label: `Hoàn tất: ${steps[6]}`, current: 7, total: steps.length });

  renderProgressBar({ label: steps[7], current: 7, total: steps.length });
  const uploadResult = await uploadBookToR2(bookName);
  printUploadResult(uploadResult);
  if (uploadResult.failed.length > 0) {
    throw new Error(`Tải lên R2 thất bại với ${uploadResult.failed.length} tệp.`);
  }
  renderProgressBar({ label: `Hoàn tất: ${steps[7]}`, current: 8, total: steps.length });

  console.log(chalk.green(`Đã dịch xong: ${book.title}`));
  console.log(chalk.green(`Dữ liệu dịch: ${path.join(bookDir, 'translated')}`));
  console.log(chalk.green(`HTML website: ${siteBookDir}`));
}

function runPythonScript(scriptPath, args = []) {
  const commandArgs = [path.join(repoRoot, scriptPath), ...args];

  return new Promise((resolve, reject) => {
    const child = spawn('python3', commandArgs, {
      cwd: repoRoot,
      env: process.env,
      stdio: 'inherit',
    });

    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      const error = new Error(`Python script exited with code ${code}`);
      error.exitCode = code;
      reject(error);
    });
  });
}

async function prepareCleanFiles({ cleanDir, prepDir, chapters = 'all' }) {
  if (!fs.existsSync(cleanDir)) {
    throw new Error(`Không tìm thấy thư mục clean: ${cleanDir}`);
  }

  fs.mkdirSync(prepDir, { recursive: true });
  const files = listChapterHtmlFiles(cleanDir, chapters);
  if (files.length === 0) {
    throw new Error(`Không có tệp HTML nào trong thư mục clean: ${cleanDir}`);
  }

  for (let index = 0; index < files.length; index += 1) {
    const file = files[index];
    renderProgressBar({
      label: `Chuẩn bị tệp ${index + 1}/${files.length}: ${file}`,
      current: index,
      total: files.length,
    });
    await runScript('agents/agent-translate/scripts/prep_html.js', [
      path.join(cleanDir, file),
      path.join(prepDir, file),
    ]);
  }
}

async function selectChaptersForTranslation({ cleanDir }) {
  const chapters = listCleanChapters(cleanDir);
  if (chapters.length === 0) {
    console.log(chalk.yellow('Không nhận diện được chương theo tên file; sẽ dịch toàn bộ sách.'));
    return 'all';
  }

  const allValue = '__all__';
  const selected = await checkbox({
    message: 'Chọn chương muốn dịch:',
    required: true,
    choices: [
      { name: 'Tất cả chương', value: allValue, checked: true },
      ...chapters.map((chapter) => ({
        name: `Chương ${chapter.chapter} (${chapter.files.length} tệp)`,
        value: chapter.chapter,
      })),
    ],
  });

  if (selected.includes(allValue)) return 'all';
  return selected.sort((a, b) => Number(a) - Number(b));
}

function listCleanChapters(cleanDir) {
  if (!fs.existsSync(cleanDir)) return [];

  const chapters = new Map();
  for (const file of fs.readdirSync(cleanDir).filter((entry) => entry.endsWith('.html'))) {
    const chapter = getChapterFromHtmlFile(file);
    if (!chapter) continue;
    if (!chapters.has(chapter)) chapters.set(chapter, []);
    chapters.get(chapter).push(file);
  }

  return [...chapters.entries()]
    .map(([chapter, files]) => ({
      chapter,
      files: files.sort(sortHtmlFiles),
    }))
    .sort((a, b) => Number(a.chapter) - Number(b.chapter));
}

function listChapterHtmlFiles(cleanDir, chapters = 'all') {
  const files = fs.readdirSync(cleanDir)
    .filter((file) => file.endsWith('.html'))
    .sort(sortHtmlFiles);

  if (chapters === 'all') return files;

  const chapterSet = new Set(chapters.map(String));
  return files.filter((file) => chapterSet.has(getChapterFromHtmlFile(file)));
}

function getChapterFromHtmlFile(file) {
  return file.match(/^(\d+)(?:-|$)/)?.[1] || null;
}

function sortHtmlFiles(a, b) {
  const aParts = a.match(/^(\d+)(?:-(\d+))?/) || [];
  const bParts = b.match(/^(\d+)(?:-(\d+))?/) || [];
  const aChapter = Number(aParts[1] || Number.MAX_SAFE_INTEGER);
  const bChapter = Number(bParts[1] || Number.MAX_SAFE_INTEGER);
  if (aChapter !== bChapter) return aChapter - bChapter;

  const aSection = Number(aParts[2] || 0);
  const bSection = Number(bParts[2] || 0);
  if (aSection !== bSection) return aSection - bSection;

  return a.localeCompare(b);
}

function renderProgressBar({ label, current, total }) {
  const width = 24;
  const safeTotal = Math.max(total, 1);
  const filled = Math.round((current / safeTotal) * width);
  const empty = width - filled;
  const percent = Math.round((current / safeTotal) * 100);
  process.stdout.write(`\r\x1b[2K[${'#'.repeat(filled)}${'-'.repeat(empty)}] ${percent}% ${label}\n`);
}

async function resolveBookStartUrl(book) {
  try {
    const response = await fetch('https://openstax.org/apps/cms/api/books/?format=json');
    if (!response.ok) return book.url;
    const data = await response.json();
    const match = (data.books ?? []).find((entry) => normalizeBookSlug(entry.slug) === book.slug);
    return match?.webview_rex_link || book.url;
  } catch {
    return book.url;
  }
}

function normalizeBookSlug(slug) {
  return String(slug ?? '').replace(/^books\//, '').trim();
}

function printTranslatedBooks() {
  const dataDir = path.join(repoRoot, 'data');
  if (!fs.existsSync(dataDir)) {
    console.log('Chưa có sách đã dịch.');
    return;
  }

  const translatedBooks = fs.readdirSync(dataDir)
    .map((book) => ({ book, translatedDir: path.join(dataDir, book, 'translated') }))
    .filter(({ translatedDir }) => fs.existsSync(translatedDir))
    .map(({ book, translatedDir }) => ({
      book,
      files: fs.readdirSync(translatedDir).filter((file) => file.endsWith('.html')),
    }))
    .filter(({ files }) => files.length > 0);

  if (translatedBooks.length === 0) {
    console.log('Chưa có sách đã dịch.');
    return;
  }

  translatedBooks.forEach(({ book, files }) => {
    const chapterCount = countTranslatedChapters(files);
    console.log(`- ${formatBookName(book)}: ${chapterCount} chương, ${files.length} trang`);
  });
}

function listLocalBookFolders() {
  const dataDir = path.join(repoRoot, 'data');
  if (!fs.existsSync(dataDir)) return [];

  return fs.readdirSync(dataDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b));
}

function countTranslatedChapters(files) {
  return new Set(
    files
      .map((file) => file.match(/^(\d+)-/)?.[1])
      .filter(Boolean)
  ).size;
}

function formatBookName(book) {
  return book
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((word) => `${word[0].toUpperCase()}${word.slice(1)}`)
    .join(' ');
}

function isPromptCancellation(error) {
  return error?.name === 'ExitPromptError' || error?.message?.includes('User force closed the prompt');
}
