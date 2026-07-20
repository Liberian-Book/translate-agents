import chalk from 'chalk';
import { formatBookOutput } from '../lib/paths.mjs';
import { runScript } from '../lib/run-script.mjs';

export async function runPrep({ book, input, output }) {
  await runScript('agents/agent-translate/scripts/prep_html.js', [input, output]);
  console.log(chalk.green(`Thư mục sách: ${formatBookOutput(book)}`));
  console.log(chalk.green(`Tệp đầu ra: ${output}`));
}

export function registerPrepCommand(program) {
  program
    .command('prep')
    .description('Chuẩn bị một tệp HTML cho bản dịch song ngữ')
    .argument('<book>', 'tên thư mục đầu ra của sách')
    .requiredOption('-i, --input <file>', 'tệp HTML đầu vào')
    .requiredOption('-o, --output <file>', 'tệp HTML đầu ra')
    .action(async (book, options) => {
      await runPrep({ book, input: options.input, output: options.output });
    });
}
