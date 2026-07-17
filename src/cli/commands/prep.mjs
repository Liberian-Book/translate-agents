import chalk from 'chalk';
import { formatBookOutput } from '../lib/paths.mjs';
import { runScript } from '../lib/run-script.mjs';

export async function runPrep({ book, input, output }) {
  await runScript('agents/agent-translate/scripts/prep_html.js', [input, output]);
  console.log(chalk.green(`Book folder: ${formatBookOutput(book)}`));
  console.log(chalk.green(`Output file: ${output}`));
}

export function registerPrepCommand(program) {
  program
    .command('prep')
    .description('Prepare one HTML file for bilingual translation')
    .argument('<book>', 'book output directory name')
    .requiredOption('-i, --input <file>', 'input HTML file')
    .requiredOption('-o, --output <file>', 'output HTML file')
    .action(async (book, options) => {
      await runPrep({ book, input: options.input, output: options.output });
    });
}
