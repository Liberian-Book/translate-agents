import chalk from 'chalk';
import { spawn } from 'node:child_process';
import path from 'node:path';
import { formatBookOutput, getDataBookPath, repoRoot, resolveFromRepo } from '../lib/paths.mjs';
import { runScript } from '../lib/run-script.mjs';

export async function runTranslateText({ book, target = 'all', prep = true, force = false, build = true }) {
  const bookDir = getDataBookPath(book);
  const normalizedTarget = normalizeHtmlTarget(target);

  if (prep) {
    if (normalizedTarget === 'all') {
      await runScript('agents/agent-translate/scripts/prep_html.js', [book]);
    } else {
      await runScript('agents/agent-translate/scripts/prep_html.js', [
        path.join(bookDir, 'clean', normalizedTarget),
        path.join(bookDir, 'prep', normalizedTarget),
      ]);
    }
  }

  const args = normalizedTarget === 'all' ? [book] : [book, normalizedTarget];
  await runScript('agents/agent-translate/scripts/translate.js', args, {
    env: force ? { FORCE_TRANSLATE: '1' } : {},
  });

  if (build) {
    await buildStaticBookSite(bookDir);
  }

  console.log(chalk.green(`Thư mục sách: ${formatBookOutput(book)}`));
  console.log(chalk.green(`HTML đã dịch: ${path.join(bookDir, 'translated')}`));
}

function runPythonScript(scriptPath, args = []) {
  const commandArgs = [resolveFromRepo(scriptPath), ...args];

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

function normalizeHtmlTarget(target) {
  const trimmed = String(target ?? '').trim();
  if (!trimmed || trimmed.toLowerCase() === 'all') return 'all';
  if (trimmed.toLowerCase().endsWith('.html')) return trimmed;
  return `${trimmed}.html`;
}

async function buildStaticBookSite(bookDir) {
  await runPythonScript('agents/agent-archive/scripts/build-preview.py', [bookDir]);
  await runScript('scripts/build-site.mjs');
}

export async function runTranslateImages({ book, target, retranslate = false, renderer, strict = false, build = true }) {
  const bookDir = getDataBookPath(book);
  const args = [target, book];
  if (retranslate) args.push('--retranslate');
  if (renderer) args.push('--renderer', renderer);
  if (strict) args.push('--strict');

  await runScript('agents/agent-translate/scripts/translate-images.js', args);
  if (build) {
    await buildStaticBookSite(bookDir);
  }
  console.log(chalk.green(`Thư mục sách: ${formatBookOutput(book)}`));
}

export function registerTranslateCommand(program) {
  const translate = program
    .command('translate')
    .description('Chạy các bước dịch cho một sách');

  translate
    .command('text')
    .description('Dịch nội dung chữ và tự cập nhật HTML tĩnh, bìa sách, manifest website')
    .argument('<book>', 'tên thư mục đầu ra của sách')
    .argument('[target]', 'tệp HTML trong clean/prep cần dịch, hoặc all', 'all')
    .option('--force', 'dịch lại kể cả khi tệp translated đã tồn tại')
    .option('--no-prep', 'không chạy lại bước chuẩn bị song ngữ trước khi dịch')
    .option('--no-build', 'không cập nhật HTML tĩnh/bìa sách/manifest website sau khi dịch')
    .action(async (book, target, options) => {
      await runTranslateText({ book, target, prep: options.prep, force: options.force, build: options.build });
    });

  translate
    .command('images')
    .description('Dịch chữ trong hình ảnh của HTML đã dịch')
    .argument('<book>', 'tên thư mục đầu ra của sách')
    .argument('<target>', 'tệp HTML đã dịch, số chương, hoặc all')
    .option('--retranslate', 'chỉ dịch lại hình ảnh trong sách đã dịch, không dịch lại nội dung chữ')
    .option('--renderer <renderer>', 'trình render dịch hình ảnh: overlay hoặc image-edit', 'image-edit')
    .option('--strict', 'thoát lỗi nếu có lỗi dịch hình ảnh')
    .option('--no-build', 'không cập nhật HTML tĩnh/bìa sách/manifest website sau khi dịch hình ảnh')
    .action(async (book, target, options) => {
      await runTranslateImages({ book, target, retranslate: options.retranslate, renderer: options.renderer, strict: options.strict, build: options.build });
    });
}
