import chalk from 'chalk';
import { searchOpenStaxBooks } from '../lib/openstax-books.mjs';

export function registerBooksCommand(program) {
  program
    .command('books')
    .description('Search OpenStax books by name')
    .argument('<query>', 'book title or partial name')
    .option('-l, --limit <limit>', 'maximum results to show')
    .action(async (query, options) => {
      try {
        const results = await searchOpenStaxBooks(query, { limit: options.limit });
        printBookResults(results);
      } catch (error) {
        console.error(chalk.red(`Book search failed: ${error.message}`));
        process.exitCode = 1;
      }
    });
}

export function printBookResults(results) {
  if (results.length === 0) {
    console.log('No OpenStax books found.');
    return;
  }

  results.forEach((book, index) => {
    console.log(`${index + 1}. ${book.title}`);
    console.log(`   slug: ${book.slug}`);
    console.log(`   url: ${book.url}`);
  });
}
