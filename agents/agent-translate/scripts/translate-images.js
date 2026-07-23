#!/usr/bin/env node

const path = require('path');
const dotenv = require('dotenv');
const {
  createTranslationOptions,
  createOcrWorker,
  findProjectRoot,
  processHtmlFile,
  resolveTargets,
} = require('./image-translation');

async function main() {
  const target = process.argv[2];
  const bookName = process.argv[3] || 'entrepreneurship';

  if (!target || target === '--help' || target === '-h') {
    console.log('Usage: node agents/agent-translate/scripts/translate-images.js <translated-html-file|chapter-number|all> [bookName]');
    console.log('Environment: OPENAI_API_KEY optional for production-quality label translation; built-in fallback covers common demo diagram labels.');
    process.exit(0);
  }

  const projectRoot = findProjectRoot(__dirname);
  dotenv.config({ path: path.join(projectRoot, '.env'), quiet: true });

  const files = resolveTargets(target, bookName, projectRoot);
  if (files.length === 0) {
    throw new Error(`No translated HTML files matched target "${target}" for book "${bookName}"`);
  }

  const totals = { auto: 0, skip: 0, review: 0, error: 0 };
  const translationOptions = createTranslationOptions();
  const worker = await createOcrWorker();
  const imageCache = new Map();
  console.log(`Translating images in ${files.length} HTML file(s).`);

  try {
    for (const file of files) {
      const result = await processHtmlFile(file, { translationOptions, worker, imageCache, bookName, projectRoot });
      for (const [key, value] of Object.entries(result.summary)) {
        totals[key] = (totals[key] || 0) + value;
      }
      console.log(`Image translation ${path.basename(file)}: auto=${result.summary.auto}, skip=${result.summary.skip}, review=${result.summary.review}, error=${result.summary.error}`);
    }
  } finally {
    await worker.terminate();
  }

  console.log(`Done. Images: auto=${totals.auto}, skip=${totals.skip}, review=${totals.review}, error=${totals.error}`);
}

main().catch(error => {
  console.error(`Image translation failed: ${error.message}`);
  process.exit(1);
});
