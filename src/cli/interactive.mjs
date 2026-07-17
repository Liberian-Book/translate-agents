import { confirm, input, select } from '@inquirer/prompts';
import chalk from 'chalk';
import { runCleanup } from './commands/cleanup.mjs';
import { runPrep } from './commands/prep.mjs';
import { runScrape } from './commands/scrape.mjs';
import { runTerms } from './commands/terms.mjs';

const NOT_IMPLEMENTED = 'This action is not implemented in the MVP yet.';

const ACTIONS = [
  'Scrape book',
  'Cleanup book',
  'Extract terms',
  'Prepare translation',
  'Translate',
  'Review',
  'Build preview',
  'Deploy',
];

export async function runInteractive() {
  try {
    console.log('Welcome to trxng');
    console.log();

    const book = await input({
      message: 'Book name:',
      default: 'entrepreneurship',
    });

    const action = await select({
      message: 'What do you want to do?',
      choices: ACTIONS.map((value) => ({ value, name: value })),
    });

    await runSelectedAction({ book, action });
  } catch (error) {
    if (isPromptCancellation(error)) {
      console.log(chalk.dim('Cancelled.'));
      return;
    }

    throw error;
  }
}

export async function runSelectedAction({ book, action }) {
  switch (action) {
    case 'Scrape book': {
      const startUrl = await input({ message: 'Start URL:' });
      await runScrape({ book, startUrl });
      return;
    }
    case 'Cleanup book': {
      const shouldCleanup = await confirm({
        message: 'Cleanup can delete and re-download shared book assets. Continue?',
        default: false,
      });

      if (!shouldCleanup) {
        console.log('Cleanup cancelled.');
        return;
      }

      await runCleanup({ book });
      return;
    }
    case 'Extract terms': {
      const chapter = await input({ message: 'Chapter number or all:', default: 'all' });
      await runTerms({ book, chapter });
      return;
    }
    case 'Prepare translation': {
      const prepInput = await input({ message: 'Input HTML file:' });
      const output = await input({ message: 'Output HTML file:' });
      await runPrep({ book, input: prepInput, output });
      return;
    }
    case 'Translate':
    case 'Review':
    case 'Build preview':
    case 'Deploy':
      console.log(NOT_IMPLEMENTED);
      return;
    default:
      throw new Error(`Unknown action: ${action}`);
  }
}

function isPromptCancellation(error) {
  return error?.name === 'ExitPromptError' || error?.message?.includes('User force closed the prompt');
}
