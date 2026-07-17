import chalk from 'chalk';
import { formatBookOutput } from '../lib/paths.mjs';
import { runScript } from '../lib/run-script.mjs';

export async function runScrape({ book, startUrl }) {
  await runScript('agents/agent-scrape/scripts/skill-scrape.js', [book, startUrl]);
  console.log(chalk.green(`Output folder: ${formatBookOutput(book)}`));
}

export function registerScrapeCommand(program) {
  program
    .command('scrape')
    .description('Scrape raw OpenStax HTML for a book')
    .argument('<book>', 'book output directory name')
    .argument('<startUrl>', 'OpenStax start URL')
    .action(async (book, startUrl) => {
      await runScrape({ book, startUrl });
    });
}
