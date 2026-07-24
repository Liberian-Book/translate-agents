import chalk from 'chalk';
import { formatBookOutput } from '../lib/paths.mjs';
import { runScript } from '../lib/run-script.mjs';

export async function runTranslateImages({ book, target }) {
  await runScript('agents/agent-translate/scripts/translate-images.js', [target, book]);
  console.log(chalk.green(`Thư mục sách: ${formatBookOutput(book)}`));
}

export function registerTranslateCommand(program) {
  const translate = program
    .command('translate')
    .description('Chạy các bước dịch cho một sách');

  translate
    .command('images')
    .description('Dịch chữ trong hình ảnh của HTML đã dịch')
    .argument('<book>', 'tên thư mục đầu ra của sách')
    .argument('<target>', 'tệp HTML đã dịch, số chương, hoặc all')
    .action(async (book, target) => {
      await runTranslateImages({ book, target });
    });
}
