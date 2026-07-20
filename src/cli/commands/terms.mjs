import chalk from 'chalk';
import { formatBookOutput } from '../lib/paths.mjs';
import { runScript } from '../lib/run-script.mjs';

export async function runTerms({ book, chapter }) {
  await runScript('agents/agent-analyze/scripts/term-extract.js', [book, chapter]);
  console.log(chalk.green(`Thư mục sách: ${formatBookOutput(book)}`));
}

export function registerTermsCommand(program) {
  program
    .command('terms')
    .description('Trích xuất thuật ngữ gợi ý cho một chương hoặc toàn bộ sách')
    .argument('<book>', 'tên thư mục đầu ra của sách')
    .requiredOption('-c, --chapter <chapter>', 'số chương hoặc all')
    .action(async (book, options) => {
      await runTerms({ book, chapter: options.chapter });
    });
}
