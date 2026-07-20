import { Command } from 'commander';
import { registerBooksCommand } from './commands/books.mjs';
import { registerCleanupCommand } from './commands/cleanup.mjs';
import { registerPrepCommand } from './commands/prep.mjs';
import { registerScrapeCommand } from './commands/scrape.mjs';
import { registerTermsCommand } from './commands/terms.mjs';
import { runInteractive } from './interactive.mjs';

export const program = new Command();

program
  .name('trxng')
  .description('Bảng điều khiển cho quy trình dịch sách')
  .version('0.1.0', '-V, --version', 'hiển thị phiên bản')
  .helpOption('-h, --help', 'hiển thị trợ giúp')
  .addHelpCommand('help [command]', 'hiển thị trợ giúp cho lệnh');

registerScrapeCommand(program);
registerCleanupCommand(program);
registerTermsCommand(program);
registerPrepCommand(program);
registerBooksCommand(program);

if (process.argv.length <= 2) {
  await runInteractive();
  process.exit(0);
}

await program.parseAsync(process.argv);
