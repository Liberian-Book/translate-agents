import chalk from 'chalk';
import { formatBookOutput } from '../lib/paths.mjs';
import { runScript } from '../lib/run-script.mjs';

export async function runScrape({ book, startUrl }) {
  await runScript('agents/agent-scrape/scripts/skill-scrape.js', [book, startUrl]);
  console.log(chalk.green(`Thư mục đầu ra: ${formatBookOutput(book)}`));
}

export function registerScrapeCommand(program) {
  program
    .command('scrape')
    .description('Tải HTML gốc từ OpenStax cho một sách')
    .argument('<book>', 'tên thư mục đầu ra của sách')
    .argument('<startUrl>', 'đường dẫn bắt đầu trên OpenStax')
    .action(async (book, startUrl) => {
      await runScrape({ book, startUrl });
    });
}
