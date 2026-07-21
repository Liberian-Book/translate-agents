import chalk from 'chalk';
import { searchOpenStaxBooks } from '../lib/openstax-books.mjs';
import { listRemoteBooks } from '../lib/r2-storage.mjs';

export function registerBooksCommand(program) {
  program
    .command('books')
    .description('Tìm sách OpenStax theo tên hoặc liệt kê sách trên R2')
    .argument('[query]', 'tên sách hoặc một phần tên sách')
    .option('-l, --limit <limit>', 'số kết quả tối đa cần hiển thị')
    .option('--remote', 'liệt kê sách đã lưu trên Cloudflare R2')
    .action(async (query, options, command) => {
      try {
        if (options.remote) {
          const books = await listRemoteBooks();
          printRemoteBooks(books);
          return;
        }

        if (!query) {
          command.error('thiếu đối số bắt buộc: query hoặc dùng --remote');
        }

        const results = await searchOpenStaxBooks(query, { limit: options.limit });
        printBookResults(results);
      } catch (error) {
        console.error(chalk.red(`Tìm sách thất bại: ${error.message}`));
        process.exitCode = 1;
      }
    });
}

export function printRemoteBooks(books) {
  if (books.length === 0) {
    console.log('Chưa có sách nào trên R2.');
    return;
  }

  books.forEach((book, index) => {
    console.log(`${index + 1}. ${book.name}`);
    console.log(`   R2 prefix: ${book.prefix}`);
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
