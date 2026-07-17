import chalk from 'chalk';
import { formatBookOutput } from '../lib/paths.mjs';
import { runScript } from '../lib/run-script.mjs';

export async function runTerms({ book, chapter }) {
  await runScript('agents/agent-analyze/scripts/term-extract.js', [book, chapter]);
  console.log(chalk.green(`Book folder: ${formatBookOutput(book)}`));
}

export function registerTermsCommand(program) {
  program
    .command('terms')
    .description('Extract glossary candidates for a chapter or all chapters')
    .argument('<book>', 'book output directory name')
    .requiredOption('-c, --chapter <chapter>', 'chapter number or all')
    .action(async (book, options) => {
      await runTerms({ book, chapter: options.chapter });
    });
}
