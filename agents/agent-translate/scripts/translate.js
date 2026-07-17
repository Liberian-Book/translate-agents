#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');
const dotenv = require('dotenv');

const DEFAULT_BASE_URL = 'https://api.openai.com/v1';
const DEFAULT_MODEL = 'gpt-4o-mini';
const TRANSLATABLE_SELECTOR = '.vn.visible';
const TRANSLATION_RETRIES = 2;

function findProjectRoot(currentDir) {
  let dir = currentDir;
  for (let i = 0; i < 10; i++) {
    if (fs.existsSync(path.join(dir, 'package.json'))) return dir;
    dir = path.dirname(dir);
  }
  return null;
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

function loadGlossary(bookDir) {
  const glossary = new Map();
  const paths = [
    path.join(bookDir, 'glossary.csv'),
    path.join(bookDir, '03-analyzed', `${path.basename(bookDir)}-glossary-candidates.csv`),
  ];

  for (const filePath of paths) {
    if (!fs.existsSync(filePath)) continue;

    let content = fs.readFileSync(filePath, 'utf-8');
    if (content.charCodeAt(0) === 0xFEFF) content = content.slice(1);

    const lines = content.split(/\r?\n/).filter(line => line.trim());
    if (lines.length < 2) continue;

    const headers = parseCsvLine(lines[0]).map(h => h.trim());
    const keyIndex = headers.indexOf('key');
    const translationIndex = headers.indexOf('translation');
    const statusIndex = headers.indexOf('status');

    if (keyIndex === -1 || translationIndex === -1) continue;

    for (const line of lines.slice(1)) {
      const row = parseCsvLine(line);
      const key = (row[keyIndex] || '').trim();
      const translation = (row[translationIndex] || '').trim();
      const status = (row[statusIndex] || '').trim().toLowerCase();

      if (!key || !translation) continue;
      if (status && status !== 'approved') continue;

      glossary.set(key.toLowerCase(), { key, translation });
    }
  }

  return glossary;
}

function relevantGlossary($, el, glossary) {
  const terms = new Map();
  $(el).find('[data-type="term"]').each((_index, termEl) => {
    const key = $(termEl).text().trim().toLowerCase();
    if (glossary.has(key)) {
      const entry = glossary.get(key);
      terms.set(entry.key, entry.translation);
    }
  });

  return Array.from(terms.entries()).map(([key, translation]) => `${key} => ${translation}`);
}

function countInlineTags(html) {
  const $ = cheerio.load(`<root>${html}</root>`, { xmlMode: false });
  return $('root *').length;
}

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function stripCodeFence(text) {
  return text
    .replace(/^```html\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```$/i, '')
    .trim();
}

function sanitizeTranslatedFragment(originalHtml, translatedHtml) {
  const cleaned = stripCodeFence(translatedHtml);
  const originalTagCount = countInlineTags(originalHtml);
  const translatedTagCount = countInlineTags(cleaned);

  if (originalTagCount === 0 && translatedTagCount > 0) {
    const $ = cheerio.load(`<root>${cleaned}</root>`, { decodeEntities: false });
    return escapeHtml($('root').text().trim());
  }

  if (translatedTagCount === originalTagCount + 1) {
    const $ = cheerio.load(`<root>${cleaned}</root>`, { decodeEntities: false });
    const rootChildren = $('root').children();
    if (rootChildren.length === 1) {
      const unwrapped = rootChildren.first().html();
      if (unwrapped && countInlineTags(unwrapped) === originalTagCount) {
        return unwrapped.trim();
      }
    }
  }

  return cleaned;
}

function tokenizeHtmlTags(html) {
  const tags = [];
  const tokenized = html.replace(/<[^>]+>/g, tag => {
    const token = `__HTML_TAG_${tags.length}__`;
    tags.push({ token, tag });
    return token;
  });

  return { tokenized, tags };
}

function restoreHtmlTags(text, tags) {
  let restored = text;
  for (const { token, tag } of tags) {
    restored = restored.replaceAll(token, tag);
  }
  return restored;
}

function stripUnexpectedHtmlTags(text) {
  return text.replace(/<[^>]+>/g, '');
}

function validatePlaceholders(text, tags) {
  for (const { token } of tags) {
    const matches = text.match(new RegExp(token, 'g')) || [];
    if (matches.length !== 1) {
      throw new Error(`Placeholder ${token} count changed (${matches.length})`);
    }
  }
}

function normalizeClassValue(value) {
  return (value || '').split(/\s+/).filter(Boolean).sort().join(' ');
}

function validateTranslatedFragment(originalHtml, translatedHtml) {
  const originalTags = countInlineTags(originalHtml);
  const translatedTags = countInlineTags(translatedHtml);
  if (originalTags !== translatedTags) {
    throw new Error(`Inline tag count changed (${originalTags} -> ${translatedTags})`);
  }

  const original = cheerio.load(`<root>${originalHtml}</root>`, { xmlMode: false });
  const translated = cheerio.load(`<root>${translatedHtml}</root>`, { xmlMode: false });
  const originalNodes = original('root *').toArray();
  const translatedNodes = translated('root *').toArray();

  for (let i = 0; i < originalNodes.length; i++) {
    const originalNode = originalNodes[i];
    const translatedNode = translatedNodes[i];
    if (originalNode.tagName !== translatedNode.tagName) {
      throw new Error(`Inline tag changed at index ${i} (${originalNode.tagName} -> ${translatedNode.tagName})`);
    }

    const originalAttrs = originalNode.attribs || {};
    const translatedAttrs = translatedNode.attribs || {};
    for (const [name, value] of Object.entries(originalAttrs)) {
      const translatedValue = translatedAttrs[name] || '';
      const expected = name === 'class' ? normalizeClassValue(value) : value;
      const actual = name === 'class' ? normalizeClassValue(translatedValue) : translatedValue;
      if (expected !== actual) {
        throw new Error(`Inline attribute changed: ${name}`);
      }
    }
  }
}

async function translateHtmlFragment(fragmentHtml, glossaryLines, options, previousError = null) {
  const { tokenized, tags } = tokenizeHtmlTags(fragmentHtml);
  const glossaryText = glossaryLines.length > 0 ? glossaryLines.join('\n') : 'No approved glossary terms for this fragment.';
  const messages = [
    {
      role: 'system',
      content: [
        'You are an academic textbook translator translating OpenStax content from English to Vietnamese.',
        'Translate naturally for Vietnamese students using "Bạn" for you and "Chúng ta" for we.',
        'Return only the translated INNER HTML fragment. No wrapper tags. No markdown. No explanations.',
        'HTML tags are replaced with placeholders like __HTML_TAG_0__. Preserve every placeholder exactly and in order.',
        'If the input has no HTML tags, return plain Vietnamese text only, with no <p>, <span>, or other tags.',
        'Only translate human-readable English text. Do not translate or alter placeholders.',
        'Use glossary translations exactly when a listed term appears.'
      ].join(' '),
    },
    {
      role: 'user',
      content: [
        `Glossary:\n${glossaryText}`,
        previousError ? `Previous output failed validation: ${previousError}. Try again and preserve the exact inline HTML structure.` : '',
        `HTML fragment to translate:\n${tokenized}`,
      ].filter(Boolean).join('\n\n'),
    },
  ];

  const response = await fetch(`${options.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${options.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: options.model,
      messages,
      temperature: 0.2,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Translation API failed (${response.status}): ${text}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content?.trim();
  if (!content) throw new Error('Translation API returned empty content');

  const cleaned = stripUnexpectedHtmlTags(stripCodeFence(content));
  validatePlaceholders(cleaned, tags);
  const restored = restoreHtmlTags(cleaned, tags);
  return sanitizeTranslatedFragment(fragmentHtml, restored);
}

async function translatePlainText(text, glossaryLines, options) {
  const glossaryText = glossaryLines.length > 0 ? glossaryLines.join('\n') : 'No approved glossary terms for this text.';
  const response = await fetch(`${options.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${options.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: options.model,
      messages: [
        {
          role: 'system',
          content: [
            'You are an academic textbook translator translating OpenStax content from English to Vietnamese.',
            'Return only Vietnamese text. No HTML. No markdown. No explanations.',
            'Use "Bạn" for you and "Chúng ta" for we.',
            'Use glossary translations exactly when a listed term appears.'
          ].join(' '),
        },
        {
          role: 'user',
          content: `Glossary:\n${glossaryText}\n\nText to translate:\n${text}`,
        },
      ],
      temperature: 0.2,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Translation API failed (${response.status}): ${body}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content?.trim();
  if (!content) throw new Error('Translation API returned empty content');
  return stripUnexpectedHtmlTags(stripCodeFence(content));
}

function collectTextNodes(node, textNodes = []) {
  if (!node) return textNodes;

  if (node.type === 'text') {
    textNodes.push(node);
    return textNodes;
  }

  for (const child of node.children || []) {
    collectTextNodes(child, textNodes);
  }

  return textNodes;
}

async function translateTextNodesFallback(el, glossaryLines, options) {
  const textNodes = collectTextNodes(el).filter(node => node.data && node.data.trim());

  for (const node of textNodes) {
    const original = node.data;
    const leading = original.match(/^\s*/)[0];
    const trailing = original.match(/\s*$/)[0];
    const translated = await translatePlainText(original.trim(), glossaryLines, options);
    node.data = `${leading}${translated}${trailing}`;
  }
}

async function translateWithValidation(originalInnerHtml, glossaryLines, options) {
  let lastError = null;

  for (let attempt = 1; attempt <= TRANSLATION_RETRIES + 1; attempt++) {
    const translated = await translateHtmlFragment(originalInnerHtml, glossaryLines, options, lastError?.message);
    try {
      validateTranslatedFragment(originalInnerHtml, translated);
      return translated;
    } catch (error) {
      lastError = error;
      if (attempt > TRANSLATION_RETRIES) throw error;
    }
  }

  throw lastError;
}

async function translateFile(inputPath, outputPath, glossary, options) {
  const html = fs.readFileSync(inputPath, 'utf-8');
  const $ = cheerio.load(html, { decodeEntities: false });
  const elements = $(TRANSLATABLE_SELECTOR).toArray();

  for (let i = 0; i < elements.length; i++) {
    const el = elements[i];
    const originalInnerHtml = $(el).html() || '';
    const text = $(el).text().trim();
    if (!text) continue;

    const glossaryLines = relevantGlossary($, el, glossary);
    try {
      const translated = await translateWithValidation(originalInnerHtml, glossaryLines, options);
      $(el).html(translated);
    } catch (error) {
      console.warn(`  ⚠️ Fragment translation failed in ${path.basename(inputPath)} block ${i + 1}/${elements.length}; falling back to text-node translation: ${error.message}`);
      try {
        await translateTextNodesFallback(el, glossaryLines, options);
      } catch (fallbackError) {
        const source = text.replace(/\s+/g, ' ').slice(0, 160);
        throw new Error(`${path.basename(inputPath)} block ${i + 1}/${elements.length}: ${fallbackError.message}; source="${source}"`);
      }
    }
  }

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, $.html(), 'utf-8');
  console.log(`Translated ${path.basename(inputPath)} (${elements.length} blocks)`);
}

async function main() {
  const bookName = process.argv[2];
  const singleFile = process.argv[3];

  if (!bookName || bookName === '--help' || bookName === '-h') {
    console.log('Usage: node translate.js <bookName> [fileName.html]');
    console.log('Environment: OPENAI_API_KEY required; OPENAI_MODEL and OPENAI_BASE_URL optional.');
    process.exit(0);
  }

  const projectRoot = findProjectRoot(__dirname);
  if (!projectRoot) throw new Error('Could not find project root containing package.json');

  dotenv.config({ path: path.join(projectRoot, '.env'), quiet: true });

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error('Missing OPENAI_API_KEY in .env. Add OPENAI_API_KEY=your-key to the repo root .env file.');
    process.exit(1);
  }

  const bookDir = path.join(projectRoot, 'data', bookName);
  const prepDir = path.join(bookDir, 'prep');
  const translatedDir = path.join(bookDir, 'translated');

  if (!fs.existsSync(prepDir)) {
    console.error(`Prep directory not found: ${prepDir}`);
    process.exit(1);
  }

  const files = singleFile
    ? [singleFile]
    : fs.readdirSync(prepDir).filter(file => file.endsWith('.html'));

  const glossary = loadGlossary(bookDir);
  const options = {
    apiKey,
    baseUrl: (process.env.OPENAI_BASE_URL || DEFAULT_BASE_URL).replace(/\/$/, ''),
    model: process.env.OPENAI_MODEL || DEFAULT_MODEL,
    force: process.env.FORCE_TRANSLATE === '1',
  };

  console.log(`Translating ${files.length} file(s) with ${options.model}. Loaded ${glossary.size} approved glossary terms.`);

  for (const file of files) {
    const inputPath = path.join(prepDir, file);
    const outputPath = path.join(translatedDir, file);
    if (!fs.existsSync(inputPath)) throw new Error(`Prep file not found: ${inputPath}`);
    if (!options.force && fs.existsSync(outputPath)) {
      console.log(`Skipping existing translation ${file}`);
      continue;
    }
    await translateFile(inputPath, outputPath, glossary, options);
  }

  console.log(`Done. Output: ${translatedDir}`);
}

main().catch(error => {
  console.error(`Translation failed: ${error.message}`);
  process.exit(1);
});
