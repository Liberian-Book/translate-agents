import fs from 'node:fs';
import path from 'node:path';
import chalk from 'chalk';
import { deleteRemoteBook, validateBookName } from '../lib/r2-storage.mjs';
import { getDataBookPath, repoRoot } from '../lib/paths.mjs';

export function registerDeleteCommand(program) {
  program
    .command('delete')
    .description('Xóa sách cục bộ và/hoặc trên Cloudflare R2')
    .argument('<book>', 'mã sách cần xóa')
    .option('--local', 'xóa dữ liệu local trong data/<book> và HTML tĩnh trong apps/web-site/books/<book>')
    .option('--remote', 'xóa dữ liệu remote trên R2 dưới books/<book>/')
    .option('-y, --yes', 'xác nhận xóa, bắt buộc để thực thi')
    .action(async (book, options, command) => {
      try {
        const safeBookName = validateBookName(book);
        if (!options.local && !options.remote) {
          command.error('chọn ít nhất một scope: --local hoặc --remote');
        }
        if (!options.yes) {
          command.error('xóa sách là thao tác phá hủy; chạy lại với --yes để xác nhận');
        }

        if (options.local) {
          const result = await deleteLocalBook(safeBookName);
          printLocalDeleteResult(result);
        }
        if (options.remote) {
          const result = await deleteRemoteBook(safeBookName);
          printRemoteDeleteResult(result);
          if (result.failed.length > 0) process.exitCode = 1;
        }
      } catch (error) {
        console.error(chalk.red(`Xóa sách thất bại: ${error.message}`));
        process.exitCode = 1;
      }
    });
}

export async function deleteLocalBook(bookName) {
  const dataDir = getDataBookPath(bookName);
  const siteDir = path.join(repoRoot, 'apps', 'web-site', 'books', bookName);
  const coverFiles = findCoverFiles(bookName);
  const targets = [dataDir, siteDir, ...coverFiles];
  const result = { bookName, deleted: [], missing: [] };

  for (const target of targets) {
    if (!fs.existsSync(target)) {
      result.missing.push(target);
      continue;
    }
    await fs.promises.rm(target, { recursive: true, force: true });
    result.deleted.push(target);
  }

  return result;
}

function findCoverFiles(bookName) {
  const assetsDir = path.join(repoRoot, 'apps', 'web-site', 'assets');
  if (!fs.existsSync(assetsDir)) return [];

  return fs.readdirSync(assetsDir)
    .filter((file) => file.startsWith(`${bookName}_cover.`))
    .map((file) => path.join(assetsDir, file));
}

export function printLocalDeleteResult(result) {
  console.log(chalk.green(`Đã xóa local: ${result.bookName}`));
  console.log(`Đã xóa: ${result.deleted.length}`);
  for (const target of result.deleted) {
    console.log(`- ${target}`);
  }
  if (result.deleted.length > 0) return;
  console.log(chalk.yellow('Không tìm thấy dữ liệu local để xóa.'));
}

export function printRemoteDeleteResult(result) {
  console.log(chalk.green(`R2 prefix: ${result.prefix}`));
  console.log(`Đã thử: ${result.attempted}`);
  console.log(`Đã xóa: ${result.deleted}`);
  console.log(`Thất bại: ${result.failed.length}`);

  if (result.failed.length === 0) return;

  console.log(chalk.red('Các object xóa thất bại:'));
  for (const failure of result.failed) {
    console.log(`- ${failure.key}: ${failure.error}`);
  }
}
