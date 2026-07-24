import chalk from 'chalk';
import { uploadBookToR2 } from '../lib/r2-storage.mjs';

export function registerUploadCommand(program) {
  program
    .command('upload')
    .description('Tải dữ liệu sách cục bộ lên Cloudflare R2')
    .argument('<book>', 'mã sách trong thư mục data')
    .action(async (book) => {
      try {
        console.log(chalk.cyan(`Đang tải dữ liệu sách lên R2: ${book}`));
        const result = await uploadBookToR2(book);
        printUploadResult(result);

        if (result.failed.length > 0) {
          process.exitCode = 1;
        }
      } catch (error) {
        console.error(chalk.red(`Tải lên R2 thất bại: ${error.message}`));
        process.exitCode = 1;
      }
    });
}

export function printUploadResult(result) {
  console.log(chalk.green(`R2 prefix: ${result.prefix}`));
  console.log(`Đã thử: ${result.attempted}`);
  console.log(`Thành công: ${result.uploaded}`);
  console.log(`Thất bại: ${result.failed.length}`);

  if (result.failed.length === 0) return;

  console.log(chalk.red('Các tệp tải lên thất bại:'));
  for (const failure of result.failed) {
    console.log(`- ${failure.path} -> ${failure.key}: ${failure.error}`);
  }
}
