#!/usr/bin/env node

const path = require('path');
const dotenv = require('dotenv');
const {
  createTranslationOptions,
  createOcrWorker,
  findProjectRoot,
  processHtmlFile,
  retranslateImagesOnly,
  createRendererOptions,
  resolveTargets,
} = require('./image-translation');

function parseArgs(args) {
  const positional = [];
  let retranslate = false;
  let renderer;
  let strict = false;
  let force = false;

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (arg === '--retranslate') {
      retranslate = true;
      continue;
    }
    if (arg === '--strict') {
      strict = true;
      continue;
    }
    if (arg === '--force') {
      force = true;
      continue;
    }
    if (arg === '--renderer') {
      if (!args[i + 1] || args[i + 1].startsWith('--')) {
        throw new Error('Missing value for --renderer. Accepted values: overlay, image-edit.');
      }
      renderer = args[i + 1];
      i += 1;
      continue;
    }
    if (arg.startsWith('--renderer=')) {
      renderer = arg.slice('--renderer='.length);
      if (!renderer) {
        throw new Error('Missing value for --renderer. Accepted values: overlay, image-edit.');
      }
      continue;
    }
    positional.push(arg);
  }

  return { positional, retranslate, renderer, strict, force };
}

async function main() {
  const args = process.argv.slice(2);
  const { positional, retranslate, renderer, strict, force } = parseArgs(args);
  const target = positional[0];
  const bookName = positional[1] || 'entrepreneurship';

  if (!target || target === '--help' || target === '-h') {
    console.log('Usage: node agents/agent-translate/scripts/translate-images.js <translated-html-file|chapter-number|all> [bookName] [--retranslate] [--force] [--renderer overlay|image-edit] [--strict]');
    console.log('Environment: OPENAI_API_KEY optional; IMAGE_TRANSLATION_TEXT_MODEL overrides OPENAI_MODEL and defaults to gpt-4o-mini for OCR label translation. IMAGE_TRANSLATION_IMAGE_MODEL defaults to gpt-image-2 for --renderer image-edit.');
    console.log('Options: --retranslate forces image-only retranslation for already translated HTML files and reuses original source assets. --force ignores existing sidecars for original image references. --renderer selects overlay or image-edit; default is image-edit. --strict fails when any image is review/error.');
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
  const rendererOptions = createRendererOptions({ renderer });
  const worker = await createOcrWorker();
  const imageCache = new Map();
  console.log(`Translating images in ${files.length} HTML file(s) with renderer=${rendererOptions.renderer}.`);

  try {
    for (const file of files) {
      const processFile = retranslate ? retranslateImagesOnly : processHtmlFile;
      const result = await processFile(file, { translationOptions, rendererOptions, worker, imageCache, bookName, projectRoot, force });
      for (const [key, value] of Object.entries(result.summary)) {
        totals[key] = (totals[key] || 0) + value;
      }
      console.log(`Image translation ${path.basename(file)}: auto=${result.summary.auto}, skip=${result.summary.skip}, review=${result.summary.review}, error=${result.summary.error}`);
    }
  } finally {
    await worker.terminate();
  }

  console.log(`Done. Images: auto=${totals.auto}, skip=${totals.skip}, review=${totals.review}, error=${totals.error}`);
  if (strict && (totals.error > 0 || totals.review > 0)) {
    throw new Error(`Image translation finished with ${totals.error} error(s) and ${totals.review} review item(s). Fix them or rerun before building/uploading the book.`);
  }
  if (totals.error > 0 || totals.review > 0) {
    console.warn(`Image translation finished with ${totals.error} error(s) and ${totals.review} review item(s). Original image references were preserved for those items. Re-run with --strict to fail on review/error decisions.`);
  }
}

main().catch(error => {
  console.error(`Image translation failed: ${error.message}`);
  process.exit(1);
});
