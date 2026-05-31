#!/usr/bin/env node

/**
 * export-docx.js — Xuất file HTML song ngữ sang DOCX (chỉ giữ tiếng Việt)
 *
 * Usage:
 *   node agents/agent-export/scripts/export-docx.js <file|chapter-number|all> [bookName]
 *
 * Examples:
 *   # Xuất 1 file cụ thể
 *   node agents/agent-export/scripts/export-docx.js data/entrepreneurship/chapter-7/05-translated/7-introduction.html
 *
 *   # Xuất 1 chapter (gộp tất cả sections vào 1 docx)
 *   node agents/agent-export/scripts/export-docx.js 7
 *
 *   # Xuất toàn bộ sách
 *   node agents/agent-export/scripts/export-docx.js all
 *
 *   # Chỉ định bookName (mặc định: entrepreneurship)
 *   node agents/agent-export/scripts/export-docx.js 7 entrepreneurship
 */

const fs = require("fs");
const path = require("path");
const cheerio = require("cheerio");

// ──────────────────────────────────────────────
// Config
// ──────────────────────────────────────────────

const ROOT = path.resolve(__dirname, "..", "..", "..");
const DEFAULT_BOOK = "entrepreneurship";

// DOCX generation options
const DOCX_OPTIONS = {
  margin: {
    top: 1440,    // 1 inch = 1440 twips
    right: 1440,
    bottom: 1440,
    left: 1440,
  },
  font: "Times New Roman",
  fontSize: 24, // half-points, 24 = 12pt
  title: "",
  table: { row: { cantSplit: true } },
};

// ──────────────────────────────────────────────
// HTML Processing
// ──────────────────────────────────────────────

/**
 * Đọc HTML, loại bỏ phần tiếng Anh, giữ tiếng Việt,
 * nhúng ảnh dưới dạng base64.
 */
function processHtml(htmlPath) {
  const html = fs.readFileSync(htmlPath, "utf-8");
  const $ = cheerio.load(html);

  // 1. Xóa tất cả phần tử eng hidden
  $(".eng.hidden").remove();

  // 2. Xóa class 'vn visible' trên phần tử Việt (giữ nội dung)
  $(".vn.visible").removeClass("vn visible");

  // 3. Xóa <style> và <link> tags (không cần trong DOCX)
  $("style").remove();
  $("link[rel='stylesheet']").remove();

  // 4. Nhúng ảnh base64
  const htmlDir = path.dirname(htmlPath);
  $("img").each((_, el) => {
    const src = $(el).attr("src");
    if (!src || src.startsWith("data:") || src.startsWith("http")) return;

    const imgPath = path.resolve(htmlDir, src);
    if (!fs.existsSync(imgPath)) {
      console.warn(`  ⚠ Ảnh không tồn tại: ${imgPath}`);
      return;
    }

    const imgBuf = fs.readFileSync(imgPath);
    const ext = path.extname(imgPath).slice(1).toLowerCase();
    const mimeMap = {
      webp: "image/webp",
      png: "image/png",
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      gif: "image/gif",
      svg: "image/svg+xml",
    };
    const mime = mimeMap[ext] || `image/${ext}`;
    const b64 = imgBuf.toString("base64");
    $(el).attr("src", `data:${mime};base64,${b64}`);
  });

  // 5. Unwrap <button> wrappers quanh ảnh (chỉ giữ <img>)
  $("button.image-button-wrapper").each((_, el) => {
    $(el).replaceWith($(el).html());
  });

  // 6. Lấy body content
  const bodyContent = $("body").html() || $.html();

  return bodyContent;
}

/**
 * Tạo styled HTML wrapper cho DOCX
 */
function wrapForDocx(bodyContent, title) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {
      font-family: 'Times New Roman', serif;
      font-size: 12pt;
      line-height: 1.6;
      color: #000;
    }
    h1 { font-size: 20pt; margin-top: 24pt; margin-bottom: 12pt; }
    h2 { font-size: 16pt; margin-top: 20pt; margin-bottom: 10pt; }
    h3 { font-size: 14pt; margin-top: 16pt; margin-bottom: 8pt; }
    h4 { font-size: 12pt; margin-top: 12pt; margin-bottom: 6pt; font-style: italic; }
    p { margin-bottom: 6pt; text-align: justify; }
    ul, ol { margin-bottom: 6pt; }
    li { margin-bottom: 3pt; }
    table { border-collapse: collapse; width: 100%; margin: 12pt 0; }
    th, td { border: 1px solid #000; padding: 6pt 8pt; text-align: left; vertical-align: top; }
    th { background-color: #f0f0f0; font-weight: bold; }
    dt { font-weight: bold; margin-top: 6pt; }
    dd { margin-left: 20pt; margin-bottom: 6pt; }
    img { max-width: 100%; height: auto; }
    figure { margin: 12pt 0; text-align: center; }
    figcaption { font-size: 10pt; color: #555; margin-top: 4pt; }
    .os-note-body {
      border-left: 3px solid #0056b3;
      padding-left: 12pt;
      margin: 12pt 0;
      background: #f8f9fa;
    }
    .learning-objectives {
      border-left: 3px solid #0056b3;
      padding: 12pt;
      margin: 12pt 0;
      background: #eef7ff;
    }
    hr { border: none; border-top: 2px solid #ccc; margin: 24pt 0; }
  </style>
</head>
<body>
${title ? `<h1>${title}</h1>` : ""}
${bodyContent}
</body>
</html>`;
}

// ──────────────────────────────────────────────
// File sorting
// ──────────────────────────────────────────────

function sortSectionFiles(files) {
  return files.sort((a, b) => {
    const nameA = path.basename(a, ".html");
    const nameB = path.basename(b, ".html");

    const orderA = getSortOrder(nameA);
    const orderB = getSortOrder(nameB);

    if (orderA !== orderB) return orderA - orderB;
    return nameA.localeCompare(nameB, "en", { numeric: true });
  });
}

function getSortOrder(name) {
  if (name.includes("introduction")) return 0;

  // Numbered sections like 7-1-..., 7-2-... = 1
  const match = name.match(/^\d+-(\d+)-/);
  if (match) return 1;

  // End-of-chapter sections
  if (name.includes("summary")) return 10;
  if (name.includes("key-terms")) return 11;
  if (name.includes("review-questions")) return 12;
  if (name.includes("discussion-questions")) return 13;
  if (name.includes("case-questions")) return 14;
  if (name.includes("suggested-resources")) return 15;

  return 5; // unknown
}

// ──────────────────────────────────────────────
// Export functions
// ──────────────────────────────────────────────

/**
 * Xuất 1 file HTML → DOCX
 */
async function exportSingleFile(htmlPath, outputDir, HTMLtoDOCX) {
  const name = path.basename(htmlPath, ".html");
  console.log(`  📄 Processing: ${name}`);

  const bodyContent = processHtml(htmlPath);
  const fullHtml = wrapForDocx(bodyContent);

  const docxBuf = await HTMLtoDOCX(fullHtml, null, DOCX_OPTIONS);

  const outputPath = path.join(outputDir, `${name}.docx`);
  fs.writeFileSync(outputPath, docxBuf);
  console.log(`  ✅ Saved: ${outputPath}`);
  return outputPath;
}

/**
 * Xuất 1 chapter (gộp tất cả sections thành 1 DOCX)
 */
async function exportChapter(chapterNum, bookDir, outputDir, HTMLtoDOCX) {
  const chapterDir = path.join(bookDir, `chapter-${chapterNum}`, "05-translated");

  if (!fs.existsSync(chapterDir)) {
    console.error(`❌ Không tìm thấy thư mục: ${chapterDir}`);
    process.exit(1);
  }

  const htmlFiles = fs.readdirSync(chapterDir)
    .filter((f) => f.endsWith(".html"))
    .map((f) => path.join(chapterDir, f));

  if (htmlFiles.length === 0) {
    console.error(`❌ Không có file HTML nào trong: ${chapterDir}`);
    process.exit(1);
  }

  const sorted = sortSectionFiles(htmlFiles);

  console.log(`\n📖 Xuất Chapter ${chapterNum} (${sorted.length} files):`);

  // Gộp tất cả sections
  const allContent = [];
  for (const file of sorted) {
    const name = path.basename(file, ".html");
    console.log(`  📄 Processing: ${name}`);
    const content = processHtml(file);
    allContent.push(content);
  }

  const combined = allContent.join('\n<hr style="page-break-after: always;">\n');
  const fullHtml = wrapForDocx(combined, `Chương ${chapterNum}`);

  const docxBuf = await HTMLtoDOCX(fullHtml, null, DOCX_OPTIONS);

  const outputPath = path.join(outputDir, `chapter-${chapterNum}.docx`);
  fs.writeFileSync(outputPath, docxBuf);
  console.log(`\n✅ Chapter ${chapterNum} saved: ${outputPath}`);
  return outputPath;
}

/**
 * Xuất toàn bộ sách (mỗi chapter thành 1 DOCX)
 */
async function exportAll(bookDir, outputDir, HTMLtoDOCX) {
  const chapters = fs.readdirSync(bookDir)
    .filter((d) => d.startsWith("chapter-"))
    .sort((a, b) => {
      const numA = parseInt(a.replace("chapter-", ""));
      const numB = parseInt(b.replace("chapter-", ""));
      return numA - numB;
    });

  console.log(`\n📚 Xuất toàn bộ sách (${chapters.length} chapters)\n`);

  const results = [];
  for (const chapter of chapters) {
    const num = chapter.replace("chapter-", "");
    const chapterTransDir = path.join(bookDir, chapter, "05-translated");
    if (!fs.existsSync(chapterTransDir)) {
      console.warn(`  ⚠ Bỏ qua ${chapter} (không có 05-translated)`);
      continue;
    }
    const htmlFiles = fs.readdirSync(chapterTransDir).filter((f) => f.endsWith(".html"));
    if (htmlFiles.length === 0) {
      console.warn(`  ⚠ Bỏ qua ${chapter} (không có file HTML)`);
      continue;
    }
    try {
      const out = await exportChapter(num, bookDir, outputDir, HTMLtoDOCX);
      results.push(out);
    } catch (err) {
      console.error(`  ❌ Lỗi khi xuất ${chapter}: ${err.message}`);
    }
  }

  console.log(`\n📚 Hoàn tất: ${results.length}/${chapters.length} chapters`);
  return results;
}

// ──────────────────────────────────────────────
// Main
// ──────────────────────────────────────────────

async function main() {
  // Dynamic import for ESM-only package
  const { default: HTMLtoDOCX } = await import("html-to-docx");

  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log(`
Usage: node export-docx.js <file|chapter-number|all> [bookName]

  file            Path to a single HTML file
  chapter-number  Export a whole chapter (e.g. 7)
  all             Export all chapters

  bookName        Book name under data/ (default: entrepreneurship)

Output: data/<bookName>/docx/
`);
    process.exit(0);
  }

  const target = args[0];
  const bookName = args[1] || DEFAULT_BOOK;
  const bookDir = path.join(ROOT, "data", bookName);
  const outputDir = path.join(bookDir, "docx");

  if (!fs.existsSync(bookDir)) {
    console.error(`❌ Không tìm thấy thư mục sách: ${bookDir}`);
    process.exit(1);
  }

  // Tạo output dir
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log(`📦 Output directory: ${outputDir}`);

  if (target === "all") {
    await exportAll(bookDir, outputDir, HTMLtoDOCX);
  } else if (/^\d+$/.test(target)) {
    await exportChapter(target, bookDir, outputDir, HTMLtoDOCX);
  } else {
    const htmlPath = path.resolve(target);
    if (!fs.existsSync(htmlPath)) {
      console.error(`❌ File không tồn tại: ${htmlPath}`);
      process.exit(1);
    }
    await exportSingleFile(htmlPath, outputDir, HTMLtoDOCX);
  }
}

main().catch((err) => {
  console.error("❌ Fatal error:", err);
  process.exit(1);
});
