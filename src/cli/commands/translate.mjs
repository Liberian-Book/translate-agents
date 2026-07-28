import chalk from 'chalk';
import { formatBookOutput } from '../lib/paths.mjs';
import { runScript } from '../lib/run-script.mjs';

export async function runTranslateImages({ book, target, retranslate = false, renderer, strict = false }) {
  const args = [target, book];
  if (retranslate) args.push('--retranslate');
  if (renderer) args.push('--renderer', renderer);
  if (strict) args.push('--strict');

  await runScript('agents/agent-translate/scripts/translate-images.js', args);
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
    .option('--retranslate', 'chỉ dịch lại hình ảnh trong sách đã dịch, không dịch lại nội dung chữ')
    .option('--renderer <renderer>', 'trình render dịch hình ảnh: overlay hoặc image-edit', 'image-edit')
    .option('--strict', 'thoát lỗi nếu có hình ảnh cần review hoặc lỗi')
    .action(async (book, target, options) => {
      await runTranslateImages({ book, target, retranslate: options.retranslate, renderer: options.renderer, strict: options.strict });
    });
}
