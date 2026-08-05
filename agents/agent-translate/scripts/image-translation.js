const fs = require('fs');
const os = require('os');
const path = require('path');
const cheerio = require('cheerio');
const sharp = require('sharp');
const { createWorker } = require('tesseract.js');

const DEFAULT_BASE_URL = 'https://api.openai.com/v1';
const DEFAULT_TEXT_MODEL = 'gpt-4o-mini';
const DEFAULT_IMAGE_MODEL = 'gpt-image-2';
const DEFAULT_TRANSLATION_RETRIES = 4;
const DEFAULT_TRANSLATION_RETRY_DELAY_MS = 5000;
const DEFAULT_IMAGE_EDIT_RETRIES = 2;
const DEFAULT_IMAGE_EDIT_RETRY_DELAY_MS = 3000;
const DEFAULT_IMAGE_EDIT_VALIDATION_RETRIES = 2;
const VALID_RENDERERS = new Set(['overlay', 'image-edit']);
const MIN_AUTO_REGIONS = 2;
const MIN_AVERAGE_CONFIDENCE = 55;
const MIN_TEXT_DENSITY = 0.0008;
const MAX_OVERFLOW_RATIO = 1.9;
const MAX_LEFTOVER_SOURCE_WORDS = 1;
const FONT_FAMILY = 'Arial, Helvetica, sans-serif';
const ELIGIBLE_IMAGE_TYPES = new Set(['diagram', 'table', 'chart', 'statistics', 'screenshot', 'labeled-illustration']);
const IMPORTANT_CONTEXT_KEYWORDS = /\b(?:process|framework|canvas|diagram|chart|table|map|model|matrix|flow|workflow|cycle|life cycle|lifecycle|phases?|stages?|steps?|timeline|mind map|strategic|design thinking)\b/i;
const IMAGE_CONTEXT_LABEL_PATTERN = /\b(?:includes?|shows?|with|areas? of|extending to|from|to|back to|such as)\b/i;

const FALLBACK_TRANSLATIONS = new Map(Object.entries({
  company: 'Công ty',
  customers: 'Khách hàng',
  customer: 'Khách hàng',
  clients: 'Khách hàng',
  suppliers: 'Nhà cung cấp',
  supplier: 'Nhà cung cấp',
  investors: 'Nhà đầu tư',
  investor: 'Nhà đầu tư',
  retailers: 'Nhà bán lẻ',
  retailer: 'Nhà bán lẻ',
  employees: 'Nhân viên',
  employee: 'Nhân viên',
  media: 'Truyền thông',
  government: 'Chính phủ',
  environment: 'Môi trường',
  community: 'Cộng đồng',
  competitors: 'Đối thủ cạnh tranh',
  competitor: 'Đối thủ cạnh tranh',
}));

function findProjectRoot(currentDir) {
  let dir = currentDir;
  for (let i = 0; i < 10; i += 1) {
    if (fs.existsSync(path.join(dir, 'package.json'))) return dir;
    dir = path.dirname(dir);
  }
  return process.cwd();
}

function stripCodeFence(text) {
  return String(text || '')
    .replace(/^```\w*\s*/i, '')
    .replace(/```$/i, '')
    .trim();
}

function stripUnexpectedHtmlTags(text) {
  return String(text || '').replace(/<[^>]+>/g, '').trim();
}

function parseJsonPayload(text) {
  const stripped = stripCodeFence(text);
  const start = stripped.indexOf('[');
  const end = stripped.lastIndexOf(']');
  if (start === -1 || end === -1 || end < start) return null;
  try {
    return JSON.parse(stripped.slice(start, end + 1));
  } catch {
    return null;
  }
}

function cleanOcrTextForTranslation(text) {
  return String(text || '')
    .replace(/[©■□●○◆◇▪▫◼◻]/g, ' ')
    .replace(/\b(?:W|MM|WM|HM)\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractEnglishWords(text) {
  return String(text || '')
    .toLowerCase()
    .match(/[a-z][a-z'-]{3,}/g) || [];
}

function validateImageEditOutput(sourceRegions, outputRegions) {
  const sourceWords = new Set(sourceRegions.flatMap(region => extractEnglishWords(region.text)));
  const outputWords = new Set(outputRegions.flatMap(region => extractEnglishWords(region.text)));
  const leftoverSourceWords = [...sourceWords].filter(word => outputWords.has(word));

  if (leftoverSourceWords.length > MAX_LEFTOVER_SOURCE_WORDS) {
    return {
      ok: false,
      reason: 'image-edit-leftover-source-english',
      leftoverSourceWords: leftoverSourceWords.slice(0, 20),
    };
  }

  return { ok: true, leftoverSourceWords };
}

function isRemoteOrDataUrl(src) {
  return /^(https?:)?\/\//i.test(src) || /^data:/i.test(src);
}

function isTranslatedImageUrl(src) {
  return /(?:^|\/)translated\/[^?#]+\.vi\.png(?:[?#].*)?$/i.test(src);
}

function normalizeSelectedImageName(value) {
  return path.basename(String(value || '').split('#')[0].split('?')[0]).replace(/\.vi(?=\.png$)/i, '');
}

function matchesSelectedImage(src, imageNames = []) {
  if (!imageNames.length) return true;
  const srcName = normalizeSelectedImageName(src);
  return imageNames.some(name => normalizeSelectedImageName(name) === srcName);
}

function canonicalPath(filePath) {
  try {
    return fs.realpathSync(filePath);
  } catch {
    return path.resolve(filePath);
  }
}

function isWithinRoot(filePath, root) {
  const relative = path.relative(canonicalPath(root), canonicalPath(filePath));
  return relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative));
}

function resolveImagePath(htmlFile, src, allowedRoots = [path.dirname(htmlFile)]) {
  const cleanSrc = src.split('#')[0].split('?')[0];
  if (!cleanSrc || isRemoteOrDataUrl(cleanSrc)) return null;
  const resolved = path.isAbsolute(cleanSrc) ? cleanSrc : path.resolve(path.dirname(htmlFile), cleanSrc);
  if (!allowedRoots.some(root => isWithinRoot(resolved, root))) return null;
  return resolved;
}

function readJsonFile(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch {
    return null;
  }
}

function resolveOriginalImagePath(htmlFile, translatedSrc, allowedRoots = [path.dirname(htmlFile)]) {
  const translatedImage = resolveImagePath(htmlFile, translatedSrc, allowedRoots);
  if (!translatedImage) return null;

  const parsed = path.parse(translatedImage);
  if (parsed.dir.split(path.sep).at(-1) !== 'translated' || !parsed.name.endsWith('.vi')) return translatedImage;

  const sidecar = path.join(parsed.dir, `${parsed.name.replace(/\.vi$/, '')}.image-translation.json`);
  const payload = readJsonFile(sidecar);
  if (payload?.sourceImage && fs.existsSync(payload.sourceImage) && allowedRoots.some(root => isWithinRoot(payload.sourceImage, root))) {
    return payload.sourceImage;
  }

  const sourceDir = path.dirname(parsed.dir);
  const sourceBase = parsed.name.replace(/\.vi$/, '');
  const candidates = ['.png', '.jpg', '.jpeg', '.webp', '.gif'].map(ext => path.join(sourceDir, `${sourceBase}${ext}`));
  return candidates.find(candidate => fs.existsSync(candidate) && allowedRoots.some(root => isWithinRoot(candidate, root))) || null;
}

function toRelativeUrl(fromFile, targetFile) {
  let relative = path.relative(path.dirname(fromFile), targetFile).split(path.sep).join('/');
  if (!relative.startsWith('.')) relative = `./${relative}`;
  return relative;
}

function getTranslatedOutputPaths(sourceImage) {
  const parsed = path.parse(sourceImage);
  const assetIndex = sourceImage.split(path.sep).lastIndexOf('assets');
  const translatedDir = assetIndex === -1
    ? path.join(parsed.dir, 'translated')
    : path.join(sourceImage.split(path.sep).slice(0, assetIndex + 1).join(path.sep), 'translated');
  const outputImage = path.join(translatedDir, `${parsed.name}.vi.png`);
  const sidecar = path.join(translatedDir, `${parsed.name}.image-translation.json`);
  return { outputImage, sidecar };
}

function createDefaultClassification(type = 'unknown', eligible = false, reason = 'not-classified') {
  return { type, eligible, reason };
}

function createSkippedResult({ htmlFile, src, reason, rendererOptions }) {
  return {
    sourceImage: src || null,
    htmlFile,
    decision: 'skip',
    renderer: rendererOptions?.renderer || 'overlay',
    model: rendererOptions?.renderer === 'image-edit' ? rendererOptions.imageModel : null,
    classification: createDefaultClassification('unknown', false, reason),
    reason,
    outputImage: null,
    ocr: [],
    translations: [],
  };
}

function normalizeContextText(text) {
  return String(text || '')
    .replace(/\s+/g, ' ')
    .trim();
}

function collectImageContext($, img) {
  const parts = [];
  const $img = $(img);
  const alt = normalizeContextText($img.attr('alt'));
  if (alt) parts.push(`Image alt: ${alt}`);

  const mediaAlt = normalizeContextText($img.closest('[data-type="media"]').attr('data-alt'));
  if (mediaAlt && mediaAlt !== alt) parts.push(`Media alt: ${mediaAlt}`);

  const aria = normalizeContextText($img.closest('button').attr('aria-label'));
  if (aria && aria !== alt) parts.push(`Button label: ${aria}`);

  const caption = normalizeContextText($img.closest('figure').find('figcaption.eng').first().text());
  if (caption) parts.push(`English caption: ${caption}`);

  return parts.join('\n').slice(0, 4000);
}

function isImportantTextFigureContext(imageContext) {
  const context = normalizeContextText(imageContext);
  if (!context || !IMPORTANT_CONTEXT_KEYWORDS.test(context)) return false;

  const englishWords = extractEnglishWords(context);
  const uniqueWords = new Set(englishWords.filter(word => ![
    'image', 'media', 'button', 'label', 'click', 'enlarge', 'figure', 'caption',
    'copyright', 'rice', 'university', 'openstax', 'under', 'license', 'attribution',
  ].includes(word)));

  return uniqueWords.size >= 4 && IMAGE_CONTEXT_LABEL_PATTERN.test(context);
}

function normalizeBbox(raw) {
  const box = raw || {};
  if (Number.isFinite(box.x0) && Number.isFinite(box.y0) && Number.isFinite(box.x1) && Number.isFinite(box.y1)) {
    return {
      x: Math.max(0, Math.round(box.x0)),
      y: Math.max(0, Math.round(box.y0)),
      w: Math.max(1, Math.round(box.x1 - box.x0)),
      h: Math.max(1, Math.round(box.y1 - box.y0)),
    };
  }
  return {
    x: Math.max(0, Math.round(box.x || 0)),
    y: Math.max(0, Math.round(box.y || 0)),
    w: Math.max(1, Math.round(box.w || box.width || 1)),
    h: Math.max(1, Math.round(box.h || box.height || 1)),
  };
}

function collectOcrRegions(data, metadata = {}) {
  const lines = [];
  const sourceLines = data?.lines || data?.blocks?.flatMap(block => block.paragraphs?.flatMap(paragraph => paragraph.lines || []) || []) || [];

  for (const line of sourceLines) {
    const text = String(line.text || '').replace(/\s+/g, ' ').trim();
    if (!/[A-Za-z]{2}/.test(text)) continue;
    const confidence = Number.isFinite(line.confidence) ? line.confidence : Number(line.confidence || 0);
    const bbox = normalizeBbox(line.bbox);
    lines.push({ text, confidence, bbox });
  }

  if (lines.length > 0) return lines;

  const words = data?.words || [];
  const wordRegions = words
    .map(word => ({
      text: String(word.text || '').replace(/\s+/g, ' ').trim(),
      confidence: Number.isFinite(word.confidence) ? word.confidence : Number(word.confidence || 0),
      bbox: normalizeBbox(word.bbox),
    }))
    .filter(word => /[A-Za-z]{2}/.test(word.text));
  if (wordRegions.length > 0) return wordRegions;

  const textLines = String(data?.text || '')
    .split(/\r?\n/)
    .map(line => line.replace(/\s+/g, ' ').trim())
    .filter(line => /[A-Za-z]{2}/.test(line));
  const width = metadata.width || 800;
  const height = metadata.height || 600;
  return textLines.map((text, index) => ({
    text,
    confidence: Number.isFinite(data?.confidence) ? data.confidence : 75,
    bbox: {
      x: Math.round(width * 0.1),
      y: Math.round(height * 0.12) + (index * Math.round(height * 0.16)),
      w: Math.round(width * 0.8),
      h: Math.max(24, Math.round(height * 0.08)),
    },
  }));
}

async function createOcrWorker() {
  return createWorker('eng', 1, {
    cachePath: path.join(os.tmpdir(), 'translate-agents-tesseract-cache'),
    logger: () => {},
  });
}

function getAllowedRoots(htmlFile, bookName, projectRoot) {
  const roots = [path.dirname(htmlFile)];
  if (bookName && projectRoot) roots.push(path.join(projectRoot, 'data', bookName, 'assets'));
  return roots;
}

async function recognizeImage(worker, imagePath, metadata) {
  const result = await worker.recognize(imagePath);
  return collectOcrRegions(result.data, metadata);
}

function isPhotoLike(stats, textDensity) {
  if (!stats) return false;
  const entropy = Number(stats.entropy || 0);
  const sharpness = Number(stats.sharpness || 0);
  return entropy >= 4 && sharpness < 2 && textDensity < 0.04;
}

function estimateStructuredType({ regions, metadata, textDensity, stats }) {
  if (regions.length === 0) {
    return isPhotoLike(stats, textDensity)
      ? createDefaultClassification('natural', false, 'natural-image-without-ocr-text')
      : createDefaultClassification('unknown', false, 'no-ocr-text');
  }

  if (isPhotoLike(stats, textDensity)) {
    return createDefaultClassification('photo', false, 'photo-like-visuals-with-incidental-text');
  }

  const width = metadata.width || 1;
  const height = metadata.height || 1;
  const xs = regions.map(region => Math.round(region.bbox.x / Math.max(width, 1) * 10));
  const ys = regions.map(region => Math.round(region.bbox.y / Math.max(height, 1) * 10));
  const columns = new Set(xs).size;
  const rows = new Set(ys).size;
  const entropy = Number(stats?.entropy || 0);
  const sharpness = Number(stats?.sharpness || 0);
  const vectorLike = entropy > 0 && entropy < 2.5 && sharpness >= 2;
  const eligible = true;

  if (regions.length >= 6 && columns >= 2 && rows >= 2) {
    return { type: 'table', eligible, reason: 'multi-row-column-ocr-layout' };
  }
  if (regions.some(region => /%|\$|\b(total|sales|market|revenue|profit|growth|rate|year)\b/i.test(region.text))) {
    return { type: 'statistics', eligible, reason: 'statistical-labels-detected' };
  }
  if (regions.length >= 4 && textDensity >= MIN_TEXT_DENSITY * 4) {
    return { type: 'screenshot', eligible, reason: 'dense-structured-text-layout' };
  }
  if ((metadata.width || 0) > (metadata.height || 0) * 1.4 && regions.length >= 3) {
    return { type: 'chart', eligible, reason: 'wide-labeled-visual-layout' };
  }
  if (vectorLike && regions.length >= MIN_AUTO_REGIONS && textDensity >= MIN_TEXT_DENSITY * 4) {
    return { type: 'diagram', eligible, reason: 'vector-like-clustered-labels' };
  }

  return createDefaultClassification('unknown', false, 'no-positive-structural-classification');
}

function classifyImage({ regions, metadata, stats }) {
  const imageArea = Math.max(1, (metadata.width || 1) * (metadata.height || 1));
  const textArea = regions.reduce((sum, region) => sum + (region.bbox.w * region.bbox.h), 0);
  const textDensity = textArea / imageArea;
  const averageConfidence = regions.length === 0
    ? 0
    : regions.reduce((sum, region) => sum + region.confidence, 0) / regions.length;
  const classification = estimateStructuredType({ regions, metadata, textDensity, stats });

  if (regions.length === 0 || textDensity < MIN_TEXT_DENSITY) {
    return { decision: 'skip', reason: 'low-text-density', textDensity, averageConfidence, classification };
  }

  if (!ELIGIBLE_IMAGE_TYPES.has(classification.type) || !classification.eligible) {
    return { decision: 'skip', reason: classification.reason || 'ineligible-image-type', textDensity, averageConfidence, classification };
  }

  if (regions.length < MIN_AUTO_REGIONS || averageConfidence < MIN_AVERAGE_CONFIDENCE) {
    return { decision: 'auto', reason: 'low-confidence-or-too-few-regions', textDensity, averageConfidence, classification };
  }

  return { decision: 'auto', reason: 'text-bearing-image', textDensity, averageConfidence, classification };
}

function createTranslationOptions(env = process.env) {
  const model = env.IMAGE_TRANSLATION_TEXT_MODEL || env.OPENAI_MODEL || DEFAULT_TEXT_MODEL;
  if (/^gpt-image/i.test(model)) {
    throw new Error('IMAGE_TRANSLATION_TEXT_MODEL must be a chat/text model such as gpt-4o. gpt-image-* models require a separate image editing renderer, which this OCR overlay flow does not use yet.');
  }

  return {
    apiKey: env.OPENAI_API_KEY,
    baseUrl: (env.OPENAI_BASE_URL || DEFAULT_BASE_URL).replace(/\/$/, ''),
    model,
    retries: Number(env.IMAGE_TRANSLATION_RETRIES || DEFAULT_TRANSLATION_RETRIES),
    retryDelayMs: Number(env.IMAGE_TRANSLATION_RETRY_DELAY_MS || DEFAULT_TRANSLATION_RETRY_DELAY_MS),
  };
}

function createRendererOptions({ renderer, env = process.env } = {}) {
  const selectedRenderer = renderer || env.IMAGE_TRANSLATION_RENDERER || 'image-edit';
  if (!VALID_RENDERERS.has(selectedRenderer)) {
    throw new Error(`Invalid image translation renderer "${selectedRenderer}". Accepted values: overlay, image-edit.`);
  }

  return {
    renderer: selectedRenderer,
    imageModel: env.IMAGE_TRANSLATION_IMAGE_MODEL || DEFAULT_IMAGE_MODEL,
    apiKey: env.OPENAI_API_KEY,
    baseUrl: (env.OPENAI_BASE_URL || DEFAULT_BASE_URL).replace(/\/$/, ''),
    retries: Number(env.IMAGE_TRANSLATION_IMAGE_RETRIES || DEFAULT_IMAGE_EDIT_RETRIES),
    retryDelayMs: Number(env.IMAGE_TRANSLATION_IMAGE_RETRY_DELAY_MS || DEFAULT_IMAGE_EDIT_RETRY_DELAY_MS),
    validationRetries: Number(env.IMAGE_TRANSLATION_IMAGE_VALIDATION_RETRIES || DEFAULT_IMAGE_EDIT_VALIDATION_RETRIES),
  };
}

function fallbackTranslate(text) {
  const key = text.toLowerCase().replace(/[^a-z\s-]/g, '').trim();
  return FALLBACK_TRANSLATIONS.get(key) || null;
}

function normalizeKnownChartTranslation(source, target) {
  const key = cleanOcrTextForTranslation(source).toLowerCase().replace(/[^a-z\s/]/g, '').replace(/\s+/g, ' ').trim();
  if (key === 'often sometimes rarely never n/a' || key === 'often sometimes rarely never na') {
    return 'Thường xuyên; Thỉnh thoảng; Hiếm khi; Không bao giờ; N/A';
  }
  return target;
}

async function translateText(text, options) {
  const fallback = fallbackTranslate(cleanOcrTextForTranslation(text));
  if (fallback && !options.apiKey) return fallback;

  if (!options.apiKey) return null;

  const maxAttempts = Math.max(1, Number.isFinite(options.retries) ? options.retries + 1 : DEFAULT_TRANSLATION_RETRIES + 1);
  let response;
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    response = await fetch(`${options.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${options.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: options.model,
        messages: [
          {
            role: 'system',
            content: [
              'You are translating short textbook image labels from English to Vietnamese.',
              'Return only the Vietnamese translation. No markdown. No explanations.',
              'Keep concise label style suitable for diagrams and tables.',
            ].join(' '),
          },
          { role: 'user', content: text },
        ],
        temperature: 0.2,
      }),
    });

    if (response.ok) break;
    if (response.status !== 429 || attempt === maxAttempts - 1) {
      const body = await response.text();
      if (process.env.DEBUG_IMAGE_TRANSLATION === '1') {
        console.warn(`Translation API failed (${response.status}): ${body.slice(0, 2000)}`);
      }
      throw new Error(`translation-api-failed-status-${response.status}`);
    }
    await sleep(getRetryDelayMs(response, attempt, options));
  }

  const data = await response.json();
  const translated = data.choices?.[0]?.message?.content?.trim();
  return stripUnexpectedHtmlTags(stripCodeFence(translated));
}

async function translateRegionBatch(regions, options) {
  if (!options.apiKey) return null;

  const inputs = regions.map((region, index) => ({
    index,
    text: region.text,
    normalizedText: cleanOcrTextForTranslation(region.text),
  }));
  const maxAttempts = Math.max(1, Number.isFinite(options.retries) ? options.retries + 1 : DEFAULT_TRANSLATION_RETRIES + 1);
  let response;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    response = await fetch(`${options.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${options.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: options.model,
        messages: [
          {
            role: 'system',
            content: [
              'You translate all visible English text from one textbook image into Vietnamese.',
              'Use the full list as context: adjacent OCR lines may be parts of one title, legend, or source note.',
              'Return strict JSON array only. Each item must be {"index": number, "target": string}.',
              'Keep Vietnamese concise and natural for image labels. Do not include English except proper names, acronyms, or N/A when it is the original chart category.',
              'Ignore OCR artifacts that are only color markers or bullets, such as W, MM, WM, HM, ©, squares, or isolated symbols.',
            ].join(' '),
          },
          { role: 'user', content: JSON.stringify(inputs) },
        ],
        temperature: 0.1,
      }),
    });

    if (response.ok) break;
    if (response.status !== 429 || attempt === maxAttempts - 1) {
      const body = await response.text();
      if (process.env.DEBUG_IMAGE_TRANSLATION === '1') {
        console.warn(`Batch translation API failed (${response.status}): ${body.slice(0, 2000)}`);
      }
      throw new Error(`translation-api-failed-status-${response.status}`);
    }
    await sleep(getRetryDelayMs(response, attempt, options));
  }

  const data = await response.json();
  const parsed = parseJsonPayload(data.choices?.[0]?.message?.content || '');
  if (!Array.isArray(parsed)) return null;
  const byIndex = new Map(parsed.map(item => [Number(item.index), stripUnexpectedHtmlTags(String(item.target || ''))]));
  return inputs.map(item => byIndex.get(item.index) || null);
}

async function translateRegions(regions, options) {
  const batchTargets = await translateRegionBatch(regions, options);
  const translations = [];
  for (let index = 0; index < regions.length; index += 1) {
    const region = regions[index];
    const normalizedSource = cleanOcrTextForTranslation(region.text);
    const target = batchTargets?.[index] || await translateText(normalizedSource || region.text, options);
    if (!target) {
      translations.push({ source: region.text, normalizedSource, target: null, bbox: region.bbox, overflow: false, reason: 'missing-translation' });
      continue;
    }
    const normalizedTarget = normalizeKnownChartTranslation(normalizedSource || region.text, target);
    const overflow = normalizedTarget.length / Math.max((normalizedSource || region.text).length, 1) > MAX_OVERFLOW_RATIO;
    translations.push({ source: region.text, normalizedSource, target: normalizedTarget, bbox: region.bbox, overflow });
  }
  return translations;
}

function escapeXml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function wrapText(text, maxChars) {
  const words = String(text).split(/\s+/).filter(Boolean);
  const lines = [];
  let current = '';
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxChars && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }
  if (current) lines.push(current);
  return lines.slice(0, 3);
}

function createOverlaySvg({ width, height, translations }) {
  const parts = [
    `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">`,
  ];

  for (const translation of translations) {
    if (!translation.target || translation.overflow) continue;
    const { x, y, w, h } = translation.bbox;
    const fontSize = Math.max(11, Math.min(24, Math.floor(h * 0.55)));
    const maxChars = Math.max(6, Math.floor(w / Math.max(fontSize * 0.48, 6)));
    const lines = wrapText(translation.target, maxChars);
    parts.push(`<rect x="${x - 2}" y="${y - 2}" width="${w + 4}" height="${h + 4}" fill="rgba(255,255,255,0.88)" rx="3"/>`);
    lines.forEach((line, index) => {
      const textY = y + Math.min(h - 2, fontSize + (index * (fontSize + 2)));
      parts.push(`<text x="${x + 2}" y="${textY}" font-family="${FONT_FAMILY}" font-size="${fontSize}" fill="#1f2933">${escapeXml(line)}</text>`);
    });
  }

  parts.push('</svg>');
  return Buffer.from(parts.join(''));
}

async function renderTranslatedImage(sourceImage, outputImage, metadata, translations) {
  const overlay = createOverlaySvg({
    width: metadata.width,
    height: metadata.height,
    translations,
  });
  fs.mkdirSync(path.dirname(outputImage), { recursive: true });
  await sharp(sourceImage).composite([{ input: overlay, top: 0, left: 0 }]).png().toFile(outputImage);
}

function getImageMimeType(sourceImage) {
  const ext = path.extname(sourceImage).toLowerCase();
  if (ext === '.jpg' || ext === '.jpeg') return 'image/jpeg';
  if (ext === '.webp') return 'image/webp';
  return 'image/png';
}

function isTransientImageEditFailure(error) {
  const status = Number(error?.status || 0);
  return error?.transient === true || status === 408 || status === 409 || status === 429 || status >= 500;
}

function createImageEditPrompt({ classification, translations, imageContext = null, validationFailure = null }) {
  const translatedLabels = translations
    .filter(item => item.source && item.target && !item.overflow)
    .map(item => {
      const source = item.normalizedSource && item.normalizedSource !== item.source
        ? `${item.source} (cleaned OCR: ${item.normalizedSource})`
        : item.source;
      return `- ${source} => ${item.target}`;
    })
    .join('\n');
  const validationNote = validationFailure?.leftoverSourceWords?.length
    ? `Previous output was rejected because these English source words were still visible: ${validationFailure.leftoverSourceWords.join(', ')}. Remove or translate every one of them in the next output.`
    : null;

  return [
    'Translate the visible English text in this textbook image to Vietnamese.',
    `Image type: ${classification?.type || 'diagram'}.`,
    imageContext ? `Use this HTML alt/caption context to understand blurred or low-confidence image text, but edit only text that is visibly present in the image:\n${imageContext}` : null,
    'Preserve all non-text visual content, layout, dimensions, colors, icons, grid lines, arrows, chart geometry, and overall style.',
    'Do not add new visual elements. Do not remove non-text content. Do not alter numbers unless they are part of translated labels.',
    'Every visible English word from the original image must be replaced with Vietnamese. Do not leave English words such as Often, Sometimes, Rarely, Never, Source, Percent, Adults, News, Social, or Media.',
    'Ignore OCR artifacts that are only legend color markers, bullets, or isolated symbols; translate the real label text next to them.',
    'Use these translations exactly when the matching source text appears:',
    translatedLabels || '- Translate all visible English labels concisely to Vietnamese.',
    validationNote,
    'Return a complete edited PNG image.',
  ].filter(Boolean).join('\n');
}

async function callImageEditApi(sourceImage, prompt, rendererOptions) {
  if (!rendererOptions.apiKey) {
    const error = new Error('missing-openai-api-key');
    error.status = 401;
    throw error;
  }

  const maxAttempts = Math.max(1, Number.isFinite(rendererOptions.retries) ? rendererOptions.retries + 1 : DEFAULT_IMAGE_EDIT_RETRIES + 1);
  const retrySummary = { attempts: 0, transientFailures: 0 };
  let lastError;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    retrySummary.attempts = attempt + 1;
    try {
      const form = new FormData();
      const imageBuffer = await sharp(sourceImage).png().toBuffer();
      const imageName = `${path.parse(sourceImage).name}.png`;
      form.append('model', rendererOptions.imageModel);
      form.append('prompt', prompt);
      form.append('image', new Blob([imageBuffer], { type: getImageMimeType(imageName) }), imageName);

      const response = await fetch(`${rendererOptions.baseUrl}/images/edits`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${rendererOptions.apiKey}` },
        body: form,
      });

      if (!response.ok) {
        const body = await response.text();
        const error = new Error(`image-edit-api-failed-status-${response.status}: ${body.slice(0, 500)}`);
        error.status = response.status;
        error.response = response;
        throw error;
      }

      const data = await response.json();
      const b64 = data?.data?.[0]?.b64_json;
      if (!b64) throw new Error('image-edit-missing-b64-json');
      return { imageBuffer: Buffer.from(b64, 'base64'), retrySummary };
    } catch (error) {
      lastError = error;
      if (!isTransientImageEditFailure(error) || attempt === maxAttempts - 1) break;
      retrySummary.transientFailures += 1;
      const response = error.response;
      const delayMs = response ? getRetryDelayMs(response, attempt, rendererOptions) : rendererOptions.retryDelayMs * Math.max(1, attempt + 1);
      await sleep(delayMs);
    }
  }

  lastError.retrySummary = retrySummary;
  throw lastError;
}

async function renderImageEditImage(sourceImage, outputImage, classification, translations, rendererOptions, validationFailure = null, imageContext = null) {
  const prompt = createImageEditPrompt({ classification, translations, imageContext, validationFailure });
  const { imageBuffer, retrySummary } = await callImageEditApi(sourceImage, prompt, rendererOptions);
  fs.mkdirSync(path.dirname(outputImage), { recursive: true });
  await sharp(imageBuffer).png().toFile(outputImage);
  return { prompt, retrySummary };
}

function writeSidecar(sidecar, payload) {
  fs.mkdirSync(path.dirname(sidecar), { recursive: true });
  fs.writeFileSync(sidecar, `${JSON.stringify(payload, null, 2)}\n`, 'utf-8');
}

function readReusableSidecar(sidecar, rendererOptions, imageContext = null) {
  if (!fs.existsSync(sidecar)) return null;
  const payload = readJsonFile(sidecar);
  if (!payload) return null;
  if (!payload.renderer || !payload.classification) return null;
  if (rendererOptions?.renderer && payload.renderer !== rendererOptions.renderer) return null;
  if (payload.decision === 'skip' && rendererOptions?.renderer === 'image-edit' && isImportantTextFigureContext(imageContext)) return null;
  if (payload.decision === 'auto' && payload.outputImage && fs.existsSync(payload.outputImage)) {
    return payload;
  }
  if (payload.decision === 'skip') return payload;
  return null;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getRetryDelayMs(response, attempt, options) {
  const retryAfter = Number(response.headers.get('retry-after'));
  if (Number.isFinite(retryAfter) && retryAfter > 0) return retryAfter * 1000;
  return options.retryDelayMs * Math.max(1, attempt + 1);
}

async function processImage({ htmlFile, sourceImage, worker, translationOptions, rendererOptions, force = false, imageContext = null }) {
  const { outputImage, sidecar } = getTranslatedOutputPaths(sourceImage);
  const selectedRenderer = rendererOptions?.renderer || 'overlay';
  const selectedImageModel = rendererOptions?.imageModel || DEFAULT_IMAGE_MODEL;
  const reusable = force ? null : readReusableSidecar(sidecar, { renderer: selectedRenderer }, imageContext);
  if (reusable) return reusable;

  const basePayload = {
    sourceImage,
    htmlFile,
    decision: 'error',
    renderer: selectedRenderer,
    model: selectedRenderer === 'image-edit' ? selectedImageModel : null,
    classification: createDefaultClassification(),
    reason: null,
    outputImage: null,
    ocr: [],
    translations: [],
    imageContext: imageContext || null,
  };

  try {
    if (!fs.existsSync(sourceImage)) {
      const payload = { ...basePayload, decision: 'error', reason: 'source-image-not-found', classification: createDefaultClassification('unknown', false, 'source-image-not-found') };
      writeSidecar(sidecar, payload);
      return payload;
    }

    const metadata = await sharp(sourceImage).metadata();
    const stats = await sharp(sourceImage).stats();
    const regions = await recognizeImage(worker, sourceImage, metadata);
    const classification = classifyImage({ regions, metadata, stats });
    const contextForcedImageEdit = selectedRenderer === 'image-edit'
      && classification.decision === 'skip'
      && isImportantTextFigureContext(imageContext)
      && classification.classification?.type !== 'photo'
      && classification.classification?.type !== 'natural';
    if (contextForcedImageEdit) {
      classification.decision = 'auto';
      classification.reason = 'html-context-important-text-figure';
      classification.classification = createDefaultClassification('diagram', true, 'html-context-important-text-figure');
    }
    const payload = {
      ...basePayload,
      decision: classification.decision,
      reason: classification.reason,
      classification: classification.classification,
      ocr: regions,
      metrics: {
        textDensity: classification.textDensity,
        averageConfidence: classification.averageConfidence,
        entropy: stats.entropy,
        sharpness: stats.sharpness,
      },
    };

    const canAttemptLowConfidenceImageEdit = selectedRenderer === 'image-edit'
      && classification.decision === 'auto'
      && classification.reason === 'low-confidence-or-too-few-regions'
      && classification.classification?.eligible
      && regions.length >= MIN_AUTO_REGIONS;

    if (classification.decision !== 'auto' && !canAttemptLowConfidenceImageEdit && !contextForcedImageEdit) {
      writeSidecar(sidecar, payload);
      return payload;
    }

    if (canAttemptLowConfidenceImageEdit) {
      payload.decision = 'auto';
      payload.reason = 'low-confidence-image-edit-attempt';
    }

    let translations = canAttemptLowConfidenceImageEdit || contextForcedImageEdit ? [] : await translateRegions(regions, translationOptions);
    payload.translations = translations;
    if (translations.some(item => !item.target)) {
      payload.decision = 'auto';
      payload.reason = 'missing-translation';
      translations = translations.map(item => item.target ? item : { ...item, target: item.source });
      payload.translations = translations;
    }
    if (payload.translations.some(item => item.overflow)) {
      payload.decision = 'auto';
      payload.reason = 'translation-overflow';
    }

    if (selectedRenderer === 'image-edit') {
      try {
        let validationFailure = null;
        const validationAttempts = Math.max(1, Number.isFinite(rendererOptions.validationRetries) ? rendererOptions.validationRetries + 1 : DEFAULT_IMAGE_EDIT_VALIDATION_RETRIES + 1);

        for (let attempt = 0; attempt < validationAttempts; attempt += 1) {
          const imageEdit = await renderImageEditImage(sourceImage, outputImage, payload.classification, translations, {
            ...rendererOptions,
            imageModel: selectedImageModel,
          }, validationFailure, imageContext);
          const outputMetadata = await sharp(outputImage).metadata();
          const outputRegions = await recognizeImage(worker, outputImage, outputMetadata);
          const validationSourceRegions = (canAttemptLowConfidenceImageEdit || contextForcedImageEdit) && imageContext
            ? [{ text: imageContext }]
            : regions;
          const validation = validateImageEditOutput(validationSourceRegions, outputRegions);
          payload.imageEdit = {
            prompt: imageEdit.prompt,
            outputOcr: outputRegions,
            validation,
            validationAttempt: attempt + 1,
          };
          if (validation.ok) {
            payload.renderer = 'image-edit';
            payload.model = selectedImageModel;
            payload.retries = imageEdit.retrySummary;
            payload.outputImage = outputImage;
            writeSidecar(sidecar, payload);
            return payload;
          }

          validationFailure = validation;
          if (attempt < validationAttempts - 1) {
            try {
              fs.unlinkSync(outputImage);
            } catch {}
          }
        }

        payload.decision = fs.existsSync(outputImage) ? 'auto' : 'error';
        payload.reason = fs.existsSync(outputImage)
          ? `accepted-image-edit-validation-warning:${validationFailure?.reason || 'image-edit-validation-failed'}`
          : validationFailure?.reason || 'image-edit-validation-failed';
        payload.model = selectedImageModel;
        payload.outputImage = fs.existsSync(outputImage) ? outputImage : null;
        writeSidecar(sidecar, payload);
        return payload;
      } catch (error) {
        payload.fallback = {
          from: 'image-edit',
          to: 'overlay',
          reason: String(error.message || 'image-edit-error').slice(0, 160),
          model: selectedImageModel,
          retries: error.retrySummary || { attempts: 0, transientFailures: 0 },
        };
      }
    }

    await renderTranslatedImage(sourceImage, outputImage, metadata, translations);
    payload.renderer = 'overlay';
    payload.model = null;
    payload.outputImage = outputImage;
    writeSidecar(sidecar, payload);
    return payload;
  } catch (error) {
    const payload = { ...basePayload, decision: 'error', reason: String(error.message || 'image-translation-error').slice(0, 160) };
    writeSidecar(sidecar, payload);
    return payload;
  }
}

async function processHtmlFile(htmlFile, options = {}) {
  const html = fs.readFileSync(htmlFile, 'utf-8');
  const $ = cheerio.load(html, { decodeEntities: false });
  const worker = options.worker || await createOcrWorker();
  const translationOptions = options.translationOptions || createTranslationOptions();
  const rendererOptions = options.rendererOptions || createRendererOptions();
  const imageCache = options.imageCache || new Map();
  const allowedRoots = options.allowedRoots || getAllowedRoots(htmlFile, options.bookName, options.projectRoot);
  const imageNames = Array.isArray(options.imageNames) ? options.imageNames : [];
  const processed = [];
  let changed = false;

  try {
    const images = $('img').toArray();
    for (const img of images) {
      const src = $(img).attr('src') || '';
      if (!src) {
        processed.push(createSkippedResult({ htmlFile, src, reason: 'empty-src', rendererOptions }));
        continue;
      }
      if (isRemoteOrDataUrl(src)) {
        processed.push(createSkippedResult({ htmlFile, src, reason: src.startsWith('data:') ? 'data-url' : 'remote-image', rendererOptions }));
        continue;
      }
      if (!matchesSelectedImage(src, imageNames)) {
        processed.push(createSkippedResult({ htmlFile, src, reason: 'not-selected-image', rendererOptions }));
        continue;
      }
      const translatedImageUrl = isTranslatedImageUrl(src);
      if (options.retranslateSelectedImages) {
        const sourceImage = translatedImageUrl
          ? resolveOriginalImagePath(htmlFile, src, allowedRoots)
          : resolveImagePath(htmlFile, src, allowedRoots);
        if (!sourceImage) {
          processed.push(createSkippedResult({
            htmlFile,
            src,
            reason: translatedImageUrl ? 'original-source-image-not-found' : 'outside-allowed-roots',
            rendererOptions,
          }));
          continue;
        }
        const cacheKey = canonicalPath(sourceImage);
        const cached = imageCache.get(cacheKey);
        const result = cached
          ? { ...cached, htmlFile }
          : await processImage({
            htmlFile,
            sourceImage,
            worker,
            translationOptions,
            rendererOptions,
            force: true,
            imageContext: collectImageContext($, img),
          });
        if (!cached) imageCache.set(cacheKey, result);
        processed.push(result);
        if (result.decision === 'auto' && result.outputImage) {
          $(img).attr('src', toRelativeUrl(htmlFile, result.outputImage));
          changed = true;
        }
        continue;
      }
      if (translatedImageUrl && !options.retranslateTranslatedImages) {
        processed.push(createSkippedResult({ htmlFile, src, reason: 'already-translated', rendererOptions }));
        continue;
      }
      if (options.retranslateTranslatedImages && !translatedImageUrl) {
        processed.push(createSkippedResult({ htmlFile, src, reason: 'not-translated-image', rendererOptions }));
        continue;
      }
      const sourceImage = options.retranslateTranslatedImages
        ? resolveOriginalImagePath(htmlFile, src, allowedRoots)
        : resolveImagePath(htmlFile, src, allowedRoots);
      if (!sourceImage) {
        processed.push(createSkippedResult({
          htmlFile,
          src,
          reason: options.retranslateTranslatedImages ? 'original-source-image-not-found' : 'outside-allowed-roots',
          rendererOptions,
        }));
        continue;
      }
      const cacheKey = canonicalPath(sourceImage);
      const cached = imageCache.get(cacheKey);
      const result = cached
        ? { ...cached, htmlFile }
        : await processImage({
          htmlFile,
          sourceImage,
          worker,
          translationOptions,
          rendererOptions,
          force: options.force,
          imageContext: collectImageContext($, img),
        });
      if (!cached) imageCache.set(cacheKey, result);
      processed.push(result);
      if (result.decision === 'auto' && result.outputImage) {
        $(img).attr('src', toRelativeUrl(htmlFile, result.outputImage));
        changed = true;
      }
    }
  } finally {
    if (!options.worker && worker?.terminate) await worker.terminate();
  }

  if (changed) fs.writeFileSync(htmlFile, $.html(), 'utf-8');

  return {
    htmlFile,
    changed,
    processed,
    summary: summarize(processed),
  };
}

async function retranslateImagesOnly(htmlFile, options = {}) {
  return processHtmlFile(htmlFile, {
    ...options,
    force: true,
    retranslateTranslatedImages: true,
  });
}

function summarize(processed) {
  return processed.reduce((counts, item) => {
    counts[item.decision] = (counts[item.decision] || 0) + 1;
    return counts;
  }, { auto: 0, skip: 0, error: 0 });
}

function resolveTargets(target, bookName = 'entrepreneurship', projectRoot = findProjectRoot(__dirname)) {
  if (!target || target === '--help' || target === '-h') return [];
  const directPath = path.resolve(process.cwd(), target);
  if (fs.existsSync(directPath) && directPath.endsWith('.html')) return [directPath];

  const bookDir = path.join(projectRoot, 'data', bookName);
  const translatedDir = path.join(bookDir, 'translated');
  if (target === 'all') {
    if (!fs.existsSync(translatedDir)) return [];
    return fs.readdirSync(translatedDir)
      .filter(file => file.endsWith('.html'))
      .map(file => path.join(translatedDir, file));
  }

  if (/^\d+$/.test(String(target))) {
    if (!fs.existsSync(translatedDir)) return [];
    const flatPrefix = `${target}-`;
    const legacyPrefix = `chapter-${target}-`;
    return fs.readdirSync(translatedDir)
      .filter(file => file.endsWith('.html') && (file === `${target}.html` || file.startsWith(flatPrefix) || file.startsWith(legacyPrefix)))
      .map(file => path.join(translatedDir, file));
  }

  const namedFile = path.join(translatedDir, target);
  if (fs.existsSync(namedFile) && namedFile.endsWith('.html')) return [namedFile];
  return [];
}

module.exports = {
  createTranslationOptions,
  createRendererOptions,
  createOcrWorker,
  findProjectRoot,
  isImportantTextFigureContext,
  processHtmlFile,
  retranslateImagesOnly,
  resolveOriginalImagePath,
  resolveTargets,
  summarize,
};
