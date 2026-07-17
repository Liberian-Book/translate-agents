import chalk from 'chalk';
import { formatBookOutput } from '../lib/paths.mjs';
import { runScript } from '../lib/run-script.mjs';

export async function runCleanup({ book }) {
  await runScript('agents/agent-scrape/scripts/skill-cleanup.js', [book]);
  console.log(chalk.green(`Output folder: ${formatBookOutput(book)}`));
}

export function registerCleanupCommand(program) {
  program
    .command('cleanup')
    .description('Clean scraped HTML and download assets for a book')
    .argument('<book>', 'book output directory name')
    .action(async (book) => {
      await runCleanup({ book });
    });
}
