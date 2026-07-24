import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dataDir = path.join(repoRoot, 'data');
const siteDir = path.join(repoRoot, 'apps', 'web-site');
const booksDir = path.join(siteDir, 'books');
const assetsDir = path.join(siteDir, 'assets');
const distDir = path.join(repoRoot, 'dist', 'site');
const manifestPath = path.join(siteDir, 'books.json');
const coverExtensions = ['.svg', '.png', '.webp', '.jpg', '.jpeg'];

const junkEntries = new Set([
  '.DS_Store',
  '.git',
  '.wrangler',
  'dist',
  'node_modules',
]);

async function main() {
  const { books, orphanSlugs } = await findGeneratedBooks();
  await writeManifest(books);

  await fs.rm(distDir, { recursive: true, force: true });
  await fs.mkdir(distDir, { recursive: true });

  await copySite();
  await copyBooks(books);

  console.log(`Built site at ${path.relative(repoRoot, distDir)}`);
  console.log(`Copied ${books.length} book(s).`);
  if (orphanSlugs.size > 0) {
    console.log(`Skipped ${orphanSlugs.size} orphan generated book folder(s): ${[...orphanSlugs].join(', ')}`);
  }
}

async function findGeneratedBooks() {
  try {
    const entries = await fs.readdir(booksDir, { withFileTypes: true });
    const books = [];
    const orphanSlugs = new Set();

    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      if (junkEntries.has(entry.name)) continue;

      const slug = entry.name;
      const bookDir = path.join(booksDir, slug);
      const indexPath = path.join(bookDir, 'index.html');
      const pagesPath = path.join(bookDir, 'book-reader', 'book-pages.js');
      const sourceDataPath = path.join(dataDir, slug);

      if ((await pathExists(indexPath)) && (await pathExists(pagesPath))) {
        if (!(await pathExists(sourceDataPath))) {
          orphanSlugs.add(slug);
          continue;
        }

        books.push({
          slug,
          title: await findBookTitle(sourceDataPath, slug),
          url: `/${slug}/`,
          cover: await findCoverPath(slug),
        });
      }
    }

    return {
      books: books.sort((a, b) => a.slug.localeCompare(b.slug)),
      orphanSlugs,
    };
  } catch (error) {
    if (error.code === 'ENOENT') return { books: [], orphanSlugs: new Set() };
    throw error;
  }
}

async function copySite() {
  await fs.cp(siteDir, distDir, {
    recursive: true,
    filter: (source) => {
      const entryName = path.basename(source);
      if (junkEntries.has(entryName)) return false;
      if (source === booksDir) return false;
      return true;
    },
  });
}

async function copyBooks(books) {
  for (const book of books) {
    await fs.cp(path.join(booksDir, book.slug), path.join(distDir, book.slug), { recursive: true });
  }
}

async function writeManifest(books) {
  const manifest = books.map(({ slug, title, url, cover }) => {
    const book = { slug, title, url };
    if (cover) book.cover = cover;
    return book;
  });
  await fs.writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
}

async function findCoverPath(slug) {
  for (const extension of coverExtensions) {
    const fileName = `${slug}_cover${extension}`;
    if (await pathExists(path.join(assetsDir, fileName))) {
      return `/assets/${fileName}`;
    }
  }

  return null;
}

async function findBookTitle(sourceDataPath, slug) {
  const metadataPath = path.join(sourceDataPath, 'book.json');

  try {
    const metadata = JSON.parse(await fs.readFile(metadataPath, 'utf8'));
    if (typeof metadata.title === 'string' && metadata.title.trim()) {
      return metadata.title.trim();
    }
  } catch (error) {
    if (error.code !== 'ENOENT') {
      console.warn(`Skipped invalid book metadata for ${slug}: ${error.message}`);
    }
  }

  return formatTitle(slug);
}

async function pathExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

function formatTitle(slug) {
  return slug
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((word) => `${word[0].toUpperCase()}${word.slice(1)}`)
    .join(' ');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
