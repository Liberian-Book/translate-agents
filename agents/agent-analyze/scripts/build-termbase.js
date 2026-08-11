#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function findProjectRoot(currentDir) {
  let dir = currentDir;
  for (let i = 0; i < 10; i++) {
    if (fs.existsSync(path.join(dir, 'package.json'))) return dir;
    dir = path.dirname(dir);
  }
  return null;
}

function resolveBookDir(projectRoot, bookName) {
  const candidates = [
    path.join(projectRoot, 'data', bookName),
    path.join(projectRoot, '..', bookName),
    path.join(projectRoot, '..', 'web-site', bookName),
  ];
  const existing = candidates.find(candidate => fs.existsSync(path.join(candidate, 'glossary.csv')));
  return existing || candidates[0];
}

function parseCsvLine(text) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === '"') {
      if (inQuotes && text[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current.trim());
  return result;
}

function parseGlossary(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  if (content.charCodeAt(0) === 0xFEFF) content = content.slice(1);
  const lines = content.split(/\r?\n/).filter(line => line.trim());
  if (lines.length < 2) return [];

  const headers = parseCsvLine(lines[0]).map(header => header.trim().toLowerCase());
  return lines.slice(1).map(line => {
    const values = parseCsvLine(line);
    return Object.fromEntries(headers.map((header, index) => [header, (values[index] || '').trim()]));
  });
}

function uniq(values) {
  return Array.from(new Set(values.filter(Boolean)));
}

function variantsFor(source) {
  const variants = [source.toLowerCase()];
  if (/^[a-z][a-z -]+$/i.test(source) && !source.toLowerCase().endsWith('s')) {
    variants.push(`${source}s`.toLowerCase());
  }
  return uniq(variants.filter(variant => variant !== source));
}

function splitOptions(value) {
  return uniq(value.split('/').map(part => part.trim()));
}

function classify(row) {
  const source = row.key || row.term || row.source || '';
  const target = row.translation || row.target || '';
  const notes = `${row.notes || ''} ${row.type || ''} ${row.termbase || ''}`.toLowerCase();
  if (notes.includes('allowlist')) return 'allowlist';
  if (notes.includes('protected') || (target && source.toLowerCase() === target.toLowerCase())) return 'protected';
  if (notes.includes('soft')) return 'soft';
  return 'hard';
}

function buildTermbase(bookName, bookDir) {
  const glossaryPath = path.join(bookDir, 'glossary.csv');
  if (!fs.existsSync(glossaryPath)) throw new Error(`Glossary not found: ${glossaryPath}`);

  const rows = parseGlossary(glossaryPath);
  const termbase = {
    bookName,
    sourceGlossary: glossaryPath,
    generatedAt: new Date().toISOString(),
    hardTerms: [],
    softPhrases: [],
    protectedTerms: [],
    allowlist: [],
  };

  const seen = new Set();
  for (const row of rows) {
    const source = (row.key || row.term || row.source || '').trim();
    const target = (row.translation || row.target || '').trim();
    const status = (row.status || '').trim().toLowerCase();
    if (!source || !target) continue;
    if (status && status !== 'approved') continue;
    const dedupeKey = source.toLowerCase();
    if (seen.has(dedupeKey)) continue;
    seen.add(dedupeKey);

    const type = classify(row);
    if (type === 'allowlist') {
      termbase.allowlist.push(source);
      continue;
    }
    if (type === 'protected') {
      termbase.protectedTerms.push(source);
      termbase.allowlist.push(source);
      continue;
    }

    const entry = {
      source,
      target,
      variants: variantsFor(source),
      acceptedTargets: splitOptions(row.options || target),
      caseSensitive: /[A-Z]/.test(source),
    };
    if (type === 'soft') termbase.softPhrases.push(entry);
    else termbase.hardTerms.push(entry);
  }

  termbase.protectedTerms = uniq(termbase.protectedTerms).sort((a, b) => a.localeCompare(b));
  termbase.allowlist = uniq(termbase.allowlist).sort((a, b) => a.localeCompare(b));
  termbase.hardTerms.sort((a, b) => b.source.length - a.source.length || a.source.localeCompare(b.source));
  termbase.softPhrases.sort((a, b) => b.source.length - a.source.length || a.source.localeCompare(b.source));
  return termbase;
}

function main() {
  const bookName = process.argv[2];
  if (!bookName || bookName === '--help' || bookName === '-h') {
    console.log('Usage: node agents/agent-analyze/scripts/build-termbase.js <bookName>');
    console.log('Reads glossary.csv from data/<book>, ../<book>, or ../web-site/<book>; writes termbase.json beside it.');
    process.exit(0);
  }

  const projectRoot = findProjectRoot(__dirname);
  if (!projectRoot) throw new Error('Could not find project root containing package.json');
  const bookDir = resolveBookDir(projectRoot, bookName);
  const termbase = buildTermbase(bookName, bookDir);
  const outputPath = path.join(bookDir, 'termbase.json');
  fs.writeFileSync(outputPath, `${JSON.stringify(termbase, null, 2)}\n`, 'utf8');
  console.log(`Wrote ${outputPath}`);
  console.log(`Hard terms: ${termbase.hardTerms.length}; soft phrases: ${termbase.softPhrases.length}; protected: ${termbase.protectedTerms.length}; allowlist: ${termbase.allowlist.length}`);
}

main();
