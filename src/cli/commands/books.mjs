import chalk from 'chalk';
import { searchOpenStaxBooks } from '../lib/openstax-books.mjs';

export function registerBooksCommand(program) {
  program
    .command('books')
    .description('Tìm sách OpenStax theo tên')
    .argument('<query>', 'tên sách hoặc một phần tên sách')
    .option('-l, --limit <limit>', 'số kết quả tối đa cần hiển thị')
    .action(async (query, options) => {
      try {
        const results = await searchOpenStaxBooks(query, { limit: options.limit });
        printBookResults(results);
      } catch (error) {
        console.error(chalk.red(`Tìm sách thất bại: ${error.message}`));
        process.exitCode = 1;
      }
    });
}

export function printBookResults(results) {
  if (results.length === 0) {
    console.log('Không tìm thấy sách OpenStax phù hợp.');
    return;
  }

  results.forEach((book, index) => {
    console.log(`${index + 1}. ${book.title}`);
    console.log(`   mã sách: ${book.slug}`);
    console.log(`   đường dẫn: ${book.url}`);
  });
}
