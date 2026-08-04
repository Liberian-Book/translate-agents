import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { checkbox, input, select } from '@inquirer/prompts';
import chalk from 'chalk';
import { deleteLocalBook, printLocalDeleteResult, printRemoteDeleteResult } from './commands/delete.mjs';
import { printUploadResult } from './commands/upload.mjs';
import { repoRoot } from './lib/paths.mjs';
import { searchOpenStaxBooks } from './lib/openstax-books.mjs';
import { deleteRemoteBook, uploadBookToR2 } from './lib/r2-storage.mjs';
import { runScript } from './lib/run-script.mjs';

const TRANSLATE_PROGRESS_PREFIX = '__CYBERK_TRANSLATE_PROGRESS__';

const ACTION_TRANSLATE_BOOK = 'Dịch sách';
const ACTION_RETRANSLATE_TEXT = 'Dịch lại chữ';
const ACTION_RETRANSLATE_IMAGES = 'Dịch lại hình ảnh';
const ACTION_TRANSLATED_LIST = 'Danh sách đã dịch';
const ACTION_UPLOAD_BOOK = 'Tải sách lên R2';
const ACTION_DELETE_BOOK = 'Xóa sách';
const ACTIONS = [ACTION_TRANSLATE_BOOK, ACTION_RETRANSLATE_TEXT, ACTION_RETRANSLATE_IMAGES, ACTION_TRANSLATED_LIST, ACTION_UPLOAD_BOOK, ACTION_DELETE_BOOK];

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
    case ACTION_DELETE_BOOK:
      await runDeleteBookFlow();
      return;
    default:
      throw new Error(`Không nhận diện được lựa chọn: ${action}`);
  }
}

async function runDeleteBookFlow() {
  const books = listLocalBookFolders();
  if (books.length === 0) {
    console.log('Không tìm thấy sách nào trong thư mục data. Dùng lệnh `cyberkbooks delete <book> --remote --yes` nếu chỉ muốn xóa trên R2.');
    return;
  }

  const selectedBook = await select({
    message: 'Chọn sách cần xóa:',
    choices: books.map((book) => ({ value: book, name: book })),
  });
  const scopes = await checkbox({
    message: 'Chọn nơi cần xóa:',
    required: true,
    choices: [
      { name: 'Local: data/<book> và HTML website', value: 'local', checked: true },
      { name: 'Remote: R2 books/<book>/', value: 'remote' },
    ],
  });
  const confirmation = await input({
    message: `Nhập "${selectedBook}" để xác nhận xóa:`,
  });

  if (confirmation !== selectedBook) {
    console.log(chalk.yellow('Không khớp mã sách; đã hủy xóa.'));
    return;
  }

  if (scopes.includes('local')) {
    const result = await deleteLocalBook(selectedBook);
    printLocalDeleteResult(result);
  }
  if (scopes.includes('remote')) {
    const result = await deleteRemoteBook(selectedBook);
    printRemoteDeleteResult(result);
    if (result.failed.length > 0) {
      throw new Error(`Xóa trên R2 thất bại với ${result.failed.length} object.`);
    }
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

  const bookDir = path.join(repoRoot, 'data', selectedBook);
  const cleanDir = path.join(bookDir, 'clean');
  const prepDir = path.join(bookDir, 'prep');
  const translatedDir = path.join(bookDir, 'translated');
  const selectedChapters = await selectChaptersForTranslation({
    cleanDir: translatedDir,
    emptyMessage: 'Không tìm thấy chương đã dịch; không có gì để dịch lại.',
  });
  if (selectedChapters === null) return;
  const files = listChapterHtmlFiles(cleanDir, selectedChapters);

  console.log(chalk.cyan(`Đang dịch lại chữ cho sách: ${selectedBook}`));
  if (selectedChapters !== 'all') {
    console.log(chalk.cyan(`Chỉ dịch lại chương: ${selectedChapters.join(', ')}`));
  }

  renderProgressBar({ label: 'Chuẩn bị tệp song ngữ', current: 0, total: 1 });
  await prepareCleanFiles({ cleanDir, prepDir, chapters: selectedChapters });
  renderProgressBar({ label: 'Hoàn tất: Chuẩn bị tệp song ngữ', current: 1, total: 1 });

  renderProgressBar({ label: 'Dịch lại nội dung', current: 0, total: 1 });
  const handleTranslateProgress = createTranslateProgressRenderer({ stepLabel: 'Dịch lại nội dung' });
  await runGuidedScript('agents/agent-translate/scripts/translate.js', [selectedBook, ...files], {
    env: { CYBERK_PROGRESS: '1', FORCE_TRANSLATE: '1' },
    onStdout: handleTranslateProgress,
  });

  renderProgressBar({ label: 'Tạo HTML tĩnh', current: 0, total: 1 });
  await runGuidedPythonScript('agents/agent-archive/scripts/build-preview.py', [bookDir]);
  renderProgressBar({ label: 'Hoàn tất: Tạo HTML tĩnh', current: 1, total: 1 });
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

  const bookDir = path.join(repoRoot, 'data', selectedBook);
  const translatedDir = path.join(bookDir, 'translated');
  const selectedChapters = await selectChaptersForTranslation({
    cleanDir: translatedDir,
    emptyMessage: 'Không tìm thấy chương đã dịch; không có hình ảnh để dịch lại.',
  });
  if (selectedChapters === null) return;

  const files = listChapterHtmlFiles(translatedDir, selectedChapters);
  const images = listImagesInHtmlFiles(files.map((file) => path.join(translatedDir, file)));
  let selectedImages = [];

  if (images.length > 0) {
    const imageScope = await select({
      message: 'Bạn muốn dịch lại hình ảnh nào?',
      choices: [
        { name: `Tất cả hình ảnh trong phạm vi đã chọn (${images.length})`, value: 'all' },
        { name: 'Chọn hình ảnh cụ thể', value: 'images' },
      ],
    });

    if (imageScope === 'images') {
      selectedImages = await checkbox({
        message: 'Chọn hình ảnh muốn dịch lại:',
        required: true,
        choices: images.map((image) => ({
          name: `${image.name} (${image.files.length} tệp HTML)`,
          value: image.name,
          description: image.files.join(', '),
        })),
      });
    } else {
      selectedImages = images.map((image) => image.name);
    }
  }

  console.log(chalk.cyan(`Đang dịch lại hình ảnh cho sách: ${selectedBook}`));
  if (selectedChapters !== 'all') {
    console.log(chalk.cyan(`Chỉ dịch lại hình ảnh chương: ${selectedChapters.join(', ')}`));
  }
  if (selectedImages.length > 0 && selectedImages.length < images.length) {
    console.log(chalk.cyan(`Chỉ dịch lại hình ảnh: ${selectedImages.join(', ')}`));
  }

  if (images.length === 0) {
    console.log(chalk.yellow('Không tìm thấy hình ảnh nào trong phạm vi đã chọn.'));
    return;
  }

  for (let index = 0; index < files.length; index += 1) {
    const file = files[index];
    renderProgressBar({
      label: `Dịch lại hình ảnh: ${index + 1}/${files.length} - ${file}`,
      current: index,
      total: files.length,
    });
    const args = [file, selectedBook, '--renderer', 'image-edit', '--images', selectedImages.join(',')];
    const result = await runGuidedScript('agents/agent-translate/scripts/translate-images.js', args);
    printImageTranslationSummary(result);
  }
  renderProgressBar({ label: 'Hoàn tất: Dịch lại hình ảnh', current: 1, total: 1 });
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
  const rawDir = path.join(bookDir, 'raw');
  const cleanDir = path.join(bookDir, 'clean');
  const prepDir = path.join(bookDir, 'prep');
  let selectedChapters = 'all';
  let skipScrape = false;
  let skipCleanup = false;
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

  if (hasHtmlFiles(rawDir)) {
    const scrapeChoice = await select({
      message: 'Đã có dữ liệu scrape cho sách này. Bạn muốn làm gì?',
      choices: [
        { name: 'Bỏ qua scrape, dùng dữ liệu hiện có', value: 'skip' },
        { name: 'Scrape lại từ OpenStax', value: 'rescrape' },
      ],
    });
    skipScrape = scrapeChoice === 'skip';
  }

  if (skipScrape) {
    console.log(chalk.yellow('Bỏ qua scrape; dùng dữ liệu raw hiện có.'));
  } else {
    renderProgressBar({ label: steps[0], current: 0, total: 1 });
    await runGuidedScript('agents/agent-scrape/scripts/skill-scrape.js', [bookName, startUrl], {
      progress: { label: steps[0], current: 0, total: 1 },
    });
    renderProgressBar({ label: `Hoàn tất: ${steps[0]}`, current: 1, total: 1 });
  }

  if (hasHtmlFiles(cleanDir)) {
    const cleanupChoice = await select({
      message: 'Đã có dữ liệu clean cho sách này. Bạn muốn làm gì?',
      choices: [
        { name: 'Bỏ qua cleanup, dùng dữ liệu hiện có', value: 'skip' },
        { name: 'Chạy cleanup lại', value: 'rerun' },
      ],
    });
    skipCleanup = cleanupChoice === 'skip';
  }

  if (skipCleanup) {
    console.log(chalk.yellow('Bỏ qua cleanup; dùng dữ liệu clean hiện có.'));
  } else {
    renderProgressBar({ label: steps[1], current: 0, total: 1 });
    await runGuidedScript('agents/agent-scrape/scripts/skill-cleanup.js', [bookName], {
      progress: { label: steps[1], current: 0, total: 1 },
    });
    renderProgressBar({ label: `Hoàn tất: ${steps[1]}`, current: 1, total: 1 });
  }

  selectedChapters = await selectChaptersForTranslation({ cleanDir });
  if (selectedChapters !== 'all') {
    console.log(chalk.cyan(`Chỉ dịch chương: ${selectedChapters.join(', ')}`));
  }

  renderProgressBar({ label: steps[2], current: 0, total: 1 });
  if (selectedChapters === 'all') {
    await runGuidedScript('agents/agent-analyze/scripts/term-extract.js', [bookName, 'all']);
  } else {
    for (const chapter of selectedChapters) {
      await runGuidedScript('agents/agent-analyze/scripts/term-extract.js', [bookName, chapter]);
    }
  }
  renderProgressBar({ label: `Hoàn tất: ${steps[2]}`, current: 1, total: 1 });

  renderProgressBar({ label: steps[3], current: 0, total: 1 });
  await prepareCleanFiles({
    cleanDir,
    prepDir,
    chapters: selectedChapters,
  });
  renderProgressBar({ label: `Hoàn tất: ${steps[3]}`, current: 1, total: 1 });

  renderProgressBar({ label: steps[4], current: 0, total: 1 });
  const handleTranslateProgress = createTranslateProgressRenderer({ stepLabel: steps[4] });
  if (selectedChapters === 'all') {
    await runGuidedScript('agents/agent-translate/scripts/translate.js', [bookName], {
      env: { CYBERK_PROGRESS: '1' },
      onStdout: handleTranslateProgress,
    });
  } else {
    await runGuidedScript('agents/agent-translate/scripts/translate.js', [
      bookName,
      ...listChapterHtmlFiles(cleanDir, selectedChapters),
    ], {
      env: { CYBERK_PROGRESS: '1' },
      onStdout: handleTranslateProgress,
    });
  }
  renderProgressBar({ label: steps[5], current: 0, total: 1 });
  await runImageTranslationForChapters({ bookName, cleanDir, chapters: selectedChapters });
  renderProgressBar({ label: `Hoàn tất: ${steps[5]}`, current: 1, total: 1 });

  renderProgressBar({ label: steps[6], current: 0, total: 1 });
  await runGuidedPythonScript('agents/agent-archive/scripts/build-preview.py', [bookDir]);
  renderProgressBar({ label: `Hoàn tất: ${steps[6]}`, current: 1, total: 1 });

  renderProgressBar({ label: steps[7], current: 0, total: 1 });
  const uploadResult = await uploadBookToR2(bookName);
  printUploadResult(uploadResult);
  if (uploadResult.failed.length > 0) {
    throw new Error(`Tải lên R2 thất bại với ${uploadResult.failed.length} tệp.`);
  }
  renderProgressBar({ label: `Hoàn tất: ${steps[7]}`, current: 1, total: 1 });

  console.log(chalk.green(`Đã dịch xong: ${book.title}`));
  console.log(chalk.green(`Dữ liệu dịch: ${path.join(bookDir, 'translated')}`));
  console.log(chalk.green(`HTML website: ${siteBookDir}`));
}

async function runGuidedScript(scriptPath, args = [], options = {}) {
  const stopHeartbeat = startProgressHeartbeat(options.progress);
  try {
    return await runScript(scriptPath, args, {
      stdio: 'pipe',
      env: options.env,
      onStdout: options.onStdout,
      onStderr: options.onStderr,
    });
  } catch (error) {
    printCapturedScriptOutput(error);
    throw error;
  } finally {
    stopHeartbeat();
  }
}

function runGuidedPythonScript(scriptPath, args = []) {
  const commandArgs = [path.join(repoRoot, scriptPath), ...args];

  return new Promise((resolve, reject) => {
    const child = spawn('python3', commandArgs, {
      cwd: repoRoot,
      env: process.env,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let stdout = '';
    let stderr = '';

    child.stdout?.on('data', (chunk) => {
      stdout += chunk.toString();
    });
    child.stderr?.on('data', (chunk) => {
      stderr += chunk.toString();
    });

    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) {
        resolve({ stdout, stderr });
        return;
      }

      const error = new Error(`Python script exited with code ${code}`);
      error.exitCode = code;
      error.stdout = stdout;
      error.stderr = stderr;
      printCapturedScriptOutput(error);
      reject(error);
    });
  });
}

function printCapturedScriptOutput(error) {
  const output = [error.stdout, error.stderr]
    .filter(Boolean)
    .join('\n')
    .split(/\r?\n/)
    .filter((line) => !line.startsWith(TRANSLATE_PROGRESS_PREFIX))
    .join('\n')
    .trim();
  if (!output) return;

  process.stdout.write('\r\x1b[2K');
  console.error(chalk.red('Chi tiết lỗi từ script:'));
  console.error(output);
}

function createTranslateProgressRenderer({ stepLabel }) {
  let buffer = '';
  let completedBlocks = 0;
  let totalBlocks = 0;
  let currentFile = '';

  return (chunk) => {
    buffer += chunk;
    const lines = buffer.split(/\r?\n/);
    buffer = lines.pop() ?? '';

    for (const line of lines) {
      if (!line.startsWith(TRANSLATE_PROGRESS_PREFIX)) continue;

      const event = parseTranslateProgressLine(line);
      if (!event) continue;

      if (event.type === 'start') {
        totalBlocks = event.totalBlocks || 0;
        completedBlocks = 0;
      } else if (event.type === 'fileStart') {
        currentFile = event.file || currentFile;
      } else if (event.type === 'block') {
        completedBlocks += 1;
        currentFile = event.file || currentFile;
      } else if (event.type === 'fileDone') {
        currentFile = event.file || currentFile;
        continue;
      }

      const blockLabel = totalBlocks > 0
        ? `${stepLabel}: ${completedBlocks}/${totalBlocks} block${currentFile ? ` - ${currentFile}` : ''}`
        : `${stepLabel}: không có block cần dịch`;

      renderProgressBar({
        label: blockLabel,
        current: totalBlocks > 0 ? completedBlocks : 1,
        total: totalBlocks > 0 ? totalBlocks : 1,
      });
    }
  };
}

function parseTranslateProgressLine(line) {
  try {
    return JSON.parse(line.slice(TRANSLATE_PROGRESS_PREFIX.length));
  } catch {
    return null;
  }
}

function printImageTranslationSummary(result) {
  const output = [result?.stdout, result?.stderr].filter(Boolean).join('\n');
  const match = output.match(/Done\. Images: auto=(\d+), skip=(\d+), error=(\d+)/);
  if (!match) return;

  const error = Number(match[3]);
  if (error > 0) {
    process.stdout.write('\n');
    console.log(chalk.yellow(`Dịch hình ảnh có lỗi: error=${error}. Ảnh gốc được giữ cho các mục này.`));
  }
}

async function runImageTranslationForChapters({ bookName, cleanDir, chapters = 'all' }) {
  const targets = chapters === 'all'
    ? listCleanChapters(cleanDir).map((chapter) => chapter.chapter)
    : chapters;

  if (targets.length === 0) {
    const result = await runGuidedScript('agents/agent-translate/scripts/translate-images.js', ['all', bookName, '--renderer', 'image-edit']);
    printImageTranslationSummary(result);
    return;
  }

  for (let index = 0; index < targets.length; index += 1) {
    const chapter = targets[index];
    renderProgressBar({
      label: `Dịch hình ảnh chương ${chapter} (${index + 1}/${targets.length})`,
      current: index,
      total: targets.length,
    });
    const result = await runGuidedScript('agents/agent-translate/scripts/translate-images.js', [chapter, bookName, '--renderer', 'image-edit']);
    printImageTranslationSummary(result);
    renderProgressBar({
      label: `Hoàn tất hình ảnh chương ${chapter} (${index + 1}/${targets.length})`,
      current: index + 1,
      total: targets.length,
    });
  }
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
      label: `Chuẩn bị tệp song ngữ: ${index + 1}/${files.length} - ${file}`,
      current: index,
      total: files.length,
    });
    await runGuidedScript('agents/agent-translate/scripts/prep_html.js', [
      path.join(cleanDir, file),
      path.join(prepDir, file),
    ]);
  }
}

async function selectChaptersForTranslation({ cleanDir, emptyMessage = 'Không nhận diện được chương theo tên file; sẽ dịch toàn bộ sách.' }) {
  const chapters = listCleanChapters(cleanDir);
  if (chapters.length === 0) {
    console.log(chalk.yellow(emptyMessage));
    return emptyMessage.includes('không có gì') ? null : 'all';
  }

  const scope = await select({
    message: 'Bạn muốn dịch phạm vi nào?',
    choices: [
      { name: 'Toàn bộ sách', value: 'all' },
      { name: 'Chọn chương cụ thể', value: 'chapters' },
    ],
  });

  if (scope === 'all') return 'all';

  const selected = await checkbox({
    message: 'Chọn chương muốn dịch:',
    required: true,
    choices: [
      ...chapters.map((chapter) => ({
        name: `Chương ${chapter.chapter} (${chapter.files.length} tệp)`,
        value: chapter.chapter,
      })),
    ],
  });

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

function listImagesInHtmlFiles(files) {
  const images = new Map();

  for (const filePath of files) {
    if (!fs.existsSync(filePath)) continue;
    const html = fs.readFileSync(filePath, 'utf-8');
    for (const match of html.matchAll(/<img\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi)) {
      const src = match[1] || '';
      if (/^(https?:)?\/\//i.test(src) || /^data:/i.test(src)) continue;
      const name = normalizeImageChoiceName(src);
      if (!name) continue;
      if (!images.has(name)) images.set(name, { name, files: new Set() });
      images.get(name).files.add(path.basename(filePath));
    }
  }

  return [...images.values()]
    .map((image) => ({ name: image.name, files: [...image.files].sort(sortHtmlFiles) }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

function normalizeImageChoiceName(src) {
  return path.basename(String(src).split('#')[0].split('?')[0]).replace(/\.vi(?=\.png$)/i, '');
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

function hasHtmlFiles(dir) {
  if (!fs.existsSync(dir)) return false;
  return fs.readdirSync(dir).some((entry) => entry.endsWith('.html'));
}

function renderProgressBar({ label, current, total }) {
  const width = 24;
  const safeTotal = Math.max(total, 1);
  const filled = Math.round((current / safeTotal) * width);
  const empty = width - filled;
  const percent = Math.round((current / safeTotal) * 100);
  const suffix = current >= total ? '\n' : '';
  process.stdout.write(`\r\x1b[2K[${'#'.repeat(filled)}${'-'.repeat(empty)}] ${percent}% ${label}${suffix}`);
}

function startProgressHeartbeat(progress) {
  if (!progress) return () => {};

  const startedAt = Date.now();
  const render = () => {
    const elapsed = Date.now() - startedAt;
    renderProgressBar({
      ...progress,
      current: getSoftProgressCurrent({ current: progress.current, elapsed }),
      label: `${progress.label} (${formatElapsed(elapsed)})`,
    });
  };

  render();
  const timer = setInterval(render, 1000);
  return () => clearInterval(timer);
}

function getSoftProgressCurrent({ current, elapsed }) {
  const elapsedSeconds = elapsed / 1000;
  const stepFill = Math.min(0.9, elapsedSeconds / 120);
  return current + stepFill;
}

function formatElapsed(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
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
