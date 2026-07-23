const fs = require('fs');
const os = require('os');
const path = require('path');
const cheerio = require('cheerio');
const sharp = require('sharp');
const { createWorker } = require('tesseract.js');

const DEFAULT_BASE_URL = 'https://api.openai.com/v1';
const DEFAULT_MODEL = 'gpt-4o-mini';
const MIN_AUTO_REGIONS = 2;
const MIN_AVERAGE_CONFIDENCE = 55;
const MIN_TEXT_DENSITY = 0.0008;
const MAX_OVERFLOW_RATIO = 1.9;
const FONT_FAMILY = 'Arial, Helvetica, sans-serif';

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

function isRemoteOrDataUrl(src) {
  return /^(https?:)?\/\//i.test(src) || /^data:/i.test(src);
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

function createSkippedResult({ htmlFile, src, reason }) {
  return {
    sourceImage: src || null,
    htmlFile,
    decision: 'skip',
    reason,
    outputImage: null,
    ocr: [],
    translations: [],
  };
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

function classifyImage({ regions, metadata }) {
  const imageArea = Math.max(1, (metadata.width || 1) * (metadata.height || 1));
  const textArea = regions.reduce((sum, region) => sum + (region.bbox.w * region.bbox.h), 0);
  const textDensity = textArea / imageArea;
  const averageConfidence = regions.length === 0
    ? 0
    : regions.reduce((sum, region) => sum + region.confidence, 0) / regions.length;

  if (regions.length === 0 || textDensity < MIN_TEXT_DENSITY) {
    return { decision: 'skip', reason: 'low-text-density', textDensity, averageConfidence };
  }

  if (regions.length < MIN_AUTO_REGIONS || averageConfidence < MIN_AVERAGE_CONFIDENCE) {
    return { decision: 'review', reason: 'low-confidence-or-too-few-regions', textDensity, averageConfidence };
  }

  return { decision: 'auto', reason: 'text-bearing-image', textDensity, averageConfidence };
}

function createTranslationOptions(env = process.env) {
  return {
    apiKey: env.OPENAI_API_KEY,
    baseUrl: (env.OPENAI_BASE_URL || DEFAULT_BASE_URL).replace(/\/$/, ''),
    model: env.OPENAI_MODEL || DEFAULT_MODEL,
  };
}

function fallbackTranslate(text) {
  const key = text.toLowerCase().replace(/[^a-z\s-]/g, '').trim();
  return FALLBACK_TRANSLATIONS.get(key) || null;
}

async function translateText(text, options) {
  const fallback = fallbackTranslate(text);
  if (fallback && !options.apiKey) return fallback;

  if (!options.apiKey) return null;

  const response = await fetch(`${options.baseUrl}/chat/completions`, {
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

  if (!response.ok) {
    const body = await response.text();
    if (process.env.DEBUG_IMAGE_TRANSLATION === '1') {
      console.warn(`Translation API failed (${response.status}): ${body.slice(0, 2000)}`);
    }
    throw new Error(`translation-api-failed-status-${response.status}`);
  }

  const data = await response.json();
  const translated = data.choices?.[0]?.message?.content?.trim();
  return stripUnexpectedHtmlTags(stripCodeFence(translated));
}

async function translateRegions(regions, options) {
  const translations = [];
  for (const region of regions) {
    const target = await translateText(region.text, options);
    if (!target) {
      translations.push({ source: region.text, target: null, bbox: region.bbox, overflow: false, reason: 'missing-translation' });
      continue;
    }
    const overflow = target.length / Math.max(region.text.length, 1) > MAX_OVERFLOW_RATIO;
    translations.push({ source: region.text, target, bbox: region.bbox, overflow });
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

function writeSidecar(sidecar, payload) {
  fs.mkdirSync(path.dirname(sidecar), { recursive: true });
  fs.writeFileSync(sidecar, `${JSON.stringify(payload, null, 2)}\n`, 'utf-8');
}

async function processImage({ htmlFile, sourceImage, worker, translationOptions }) {
  const { outputImage, sidecar } = getTranslatedOutputPaths(sourceImage);
  const basePayload = {
    sourceImage,
    htmlFile,
    decision: 'error',
    reason: null,
    outputImage: null,
    ocr: [],
    translations: [],
  };

  try {
    if (!fs.existsSync(sourceImage)) {
      const payload = { ...basePayload, decision: 'error', reason: 'source-image-not-found' };
      writeSidecar(sidecar, payload);
      return payload;
    }

    const metadata = await sharp(sourceImage).metadata();
    const regions = await recognizeImage(worker, sourceImage, metadata);
    const classification = classifyImage({ regions, metadata });
    const payload = {
      ...basePayload,
      decision: classification.decision,
      reason: classification.reason,
      ocr: regions,
      metrics: {
        textDensity: classification.textDensity,
        averageConfidence: classification.averageConfidence,
      },
    };

    if (classification.decision !== 'auto') {
      writeSidecar(sidecar, payload);
      return payload;
    }

    const translations = await translateRegions(regions, translationOptions);
    payload.translations = translations;
    if (translations.some(item => !item.target)) {
      payload.decision = 'review';
      payload.reason = 'missing-translation';
      writeSidecar(sidecar, payload);
      return payload;
    }
    if (translations.some(item => item.overflow)) {
      payload.decision = 'review';
      payload.reason = 'translation-overflow';
      writeSidecar(sidecar, payload);
      return payload;
    }

    await renderTranslatedImage(sourceImage, outputImage, metadata, translations);
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
  const imageCache = options.imageCache || new Map();
  const allowedRoots = options.allowedRoots || getAllowedRoots(htmlFile, options.bookName, options.projectRoot);
  const processed = [];
  let changed = false;

  try {
    const images = $('img').toArray();
    for (const img of images) {
      const src = $(img).attr('src') || '';
      if (!src) {
        processed.push(createSkippedResult({ htmlFile, src, reason: 'empty-src' }));
        continue;
      }
      if (isRemoteOrDataUrl(src)) {
        processed.push(createSkippedResult({ htmlFile, src, reason: src.startsWith('data:') ? 'data-url' : 'remote-image' }));
        continue;
      }
      const sourceImage = resolveImagePath(htmlFile, src, allowedRoots);
      if (!sourceImage) {
        processed.push(createSkippedResult({ htmlFile, src, reason: 'outside-allowed-roots' }));
        continue;
      }
      const cacheKey = canonicalPath(sourceImage);
      const cached = imageCache.get(cacheKey);
      const result = cached
        ? { ...cached, htmlFile }
        : await processImage({ htmlFile, sourceImage, worker, translationOptions });
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

function summarize(processed) {
  return processed.reduce((counts, item) => {
    counts[item.decision] = (counts[item.decision] || 0) + 1;
    return counts;
  }, { auto: 0, skip: 0, review: 0, error: 0 });
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
  createOcrWorker,
  findProjectRoot,
  processHtmlFile,
  resolveTargets,
  summarize,
};
