import chalk from 'chalk';
import { formatBookOutput } from '../lib/paths.mjs';
import { runScript } from '../lib/run-script.mjs';

export async function runCleanup({ book }) {
  await runScript('agents/agent-scrape/scripts/skill-cleanup.js', [book]);
  console.log(chalk.green(`Thư mục đầu ra: ${formatBookOutput(book)}`));
}

export function registerCleanupCommand(program) {
  program
    .command('cleanup')
    .description('Làm sạch HTML đã tải và tải tài nguyên cho một sách')
    .argument('<book>', 'tên thư mục đầu ra của sách')
    .action(async (book) => {
      await runCleanup({ book });
    });
}
