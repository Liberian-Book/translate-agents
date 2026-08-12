import os
import shutil
import glob
import re
import argparse
import json
from html import escape, unescape
from html.parser import HTMLParser

COVER_EXTENSIONS = [".svg", ".png", ".webp", ".jpg", ".jpeg"]
READER_ASSET_VERSION = "toc-accordion-1"
VIETNAMESE_BOOK_TITLES = {
    "business-ethics": "Đạo đức kinh doanh",
    "entrepreneurship": "Khởi nghiệp",
    "introduction-computer-science": "Nhập môn Khoa học máy tính",
    "introduction-philosophy": "Nhập môn Triết học",
    "principles-finance": "Nguyên lý Tài chính",
    "world-history-volume-1": "Lịch sử Thế giới, Tập 1: Đến năm 1500",
}

class ImageSrcParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.srcs = []

    def handle_starttag(self, tag, attrs):
        if tag.lower() != "img":
            return
        attrs_dict = dict(attrs)
        src = attrs_dict.get("src")
        if src:
            self.srcs.append(src)

def get_repo_root():
    return os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", ".."))

def get_book_title(book_dir):
    book_slug = os.path.basename(os.path.abspath(book_dir))
    metadata_path = os.path.join(book_dir, "book.json")
    if os.path.exists(metadata_path):
        try:
            with open(metadata_path, "r", encoding="utf-8") as f:
                metadata = json.load(f)
            for key in ("titleVi", "vietnameseTitle", "translatedTitle", "displayTitleVi"):
                title = metadata.get(key)
                if isinstance(title, str) and title.strip():
                    return title.strip()
        except (OSError, json.JSONDecodeError) as error:
            print(f"Warning: could not read book metadata title from {metadata_path}: {error}")

    return VIETNAMESE_BOOK_TITLES.get(book_slug, book_slug.replace("-", " ").title())

def cover_style(book_slug):
    styles = {
        "business-ethics": ("#1f2f63", "#00a884"),
        "entrepreneurship": ("#172b61", "#00a884"),
        "introduction-computer-science": ("#1f2f63", "#18b6d1"),
        "introduction-philosophy": ("#1f2f63", "#b388ff"),
        "principles-finance": ("#1d2f6f", "#18b6d1"),
        "world-history-volume-1": ("#1f2f63", "#f1c56b"),
    }
    if book_slug in styles:
        return styles[book_slug]

    fallback = [
        ("#1f2f63", "#00a884"),
        ("#172b61", "#ff7f40"),
        ("#1d2f6f", "#18b6d1"),
        ("#1f2f63", "#b388ff"),
        ("#6f2f2b", "#f1c56b"),
    ]
    return fallback[sum(ord(char) for char in book_slug) % len(fallback)]

def split_words_for_cover(text, max_chars=12, max_lines=3):
    words = text.split()
    lines = []
    current = ""
    for word in words:
        candidate = f"{current} {word}".strip()
        if current and len(candidate) > max_chars:
            lines.append(current)
            current = word
        else:
            current = candidate

    if current:
        lines.append(current)
    return lines[:max_lines]

def cover_title_parts(title):
    title = title.strip()
    volume = ""
    subtitle = ""
    if "," in title:
        title, rest = [part.strip() for part in title.split(",", 1)]
        if ":" in rest:
            volume, subtitle = [part.strip() for part in rest.split(":", 1)]
        else:
            volume = rest
    elif ":" in title:
        title, subtitle = [part.strip() for part in title.split(":", 1)]

    lower_title = title.lower()
    kicker = ""
    for prefix in ("nguyên lý", "nhập môn"):
        if lower_title.startswith(prefix):
            kicker = title[:len(prefix)].strip()
            title = title[len(prefix):].strip()
            break

    main_lines = split_words_for_cover(title or kicker, max_chars=11)
    return kicker, main_lines, volume, subtitle

def cover_font_size(title_lines):
    longest = max(len(line) for line in title_lines)
    if longest <= 7:
        return 104
    if longest <= 9:
        return 94
    if longest <= 12:
        return 82
    return 72

def render_openstax_style_cover(book_title, book_slug):
    background, accent = cover_style(book_slug)
    kicker, title_lines, volume, subtitle = cover_title_parts(book_title)
    title_size = cover_font_size(title_lines)
    line_gap = title_size * 0.82
    kicker_svg = f'<text x="60" y="126" fill="#fff" font-family="Arial, Helvetica, sans-serif" font-size="21" font-weight="400">{escape(kicker)}</text>' if kicker else ""
    first_y = 154 if kicker else 126
    title_svg = "".join(
        f'<text x="-10" y="{first_y + index * line_gap:.1f}" fill="{accent}" font-family="Arial, Helvetica, sans-serif" font-size="{title_size}" font-weight="800" letter-spacing="-6">{escape(line)}</text>'
        for index, line in enumerate(title_lines)
    )
    volume_svg = f'<text x="372" y="304" fill="#fff" font-family="Arial, Helvetica, sans-serif" font-size="56" font-weight="200" text-anchor="end">{escape(volume)}</text>' if volume else ""
    subtitle_svg = f'<text x="372" y="338" fill="#fff" font-family="Arial, Helvetica, sans-serif" font-size="23" font-weight="400" text-anchor="end">{escape(subtitle)}</text>' if subtitle else ""
    if subtitle and not volume:
        subtitle_svg = f'<text x="372" y="326" fill="#fff" font-family="Arial, Helvetica, sans-serif" font-size="24" font-weight="400" text-anchor="end">{escape(subtitle)}</text>'

    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 401.75 400" role="img" aria-labelledby="title">
  <title id="title">Bìa sách {escape(book_title)}</title>
  <rect width="401.75" height="400" fill="{background}"/>
  <g>
    {kicker_svg}
    {title_svg}
    {volume_svg}
    {subtitle_svg}
  </g>
</svg>
'''

def write_homepage_cover(book_dir):
    book_slug = os.path.basename(os.path.abspath(book_dir))
    book_title = get_book_title(book_dir)
    assets_dir = os.path.join(get_repo_root(), "apps", "web-site", "assets")
    os.makedirs(assets_dir, exist_ok=True)

    cover_dst = os.path.join(assets_dir, f"{book_slug}_cover.svg")
    with open(cover_dst, "w", encoding="utf-8") as f:
        f.write(render_openstax_style_cover(book_title, book_slug))
    return cover_dst

def find_cover_file(book_dir):
    for extension in COVER_EXTENSIONS:
        cover_path = os.path.join(book_dir, f"cover{extension}")
        if os.path.exists(cover_path):
            return cover_path
    return None

def copy_homepage_cover(book_dir):
    cover_src = find_cover_file(book_dir)
    if not cover_src:
        return None

    book_slug = os.path.basename(os.path.abspath(book_dir))
    assets_dir = os.path.join(get_repo_root(), "apps", "web-site", "assets")
    os.makedirs(assets_dir, exist_ok=True)

    cover_dst = os.path.join(assets_dir, f"{book_slug}_cover{os.path.splitext(cover_src)[1]}")
    shutil.copy2(cover_src, cover_dst)
    return cover_dst

def is_external_image_src(src):
    return src.startswith(("http://", "https://", "//", "data:", "#"))

def strip_html_tags(html):
    text = re.sub(r'<[^>]+>', ' ', html)
    return re.sub(r'\s+', ' ', unescape(text)).strip()

def extract_vietnamese_page_title(content):
    patterns = [
        r'<h[1-6][^>]*data-type=["\']document-title["\'][^>]*class=["\'][^"\']*vn\s+visible[^"\']*["\'][^>]*>(.*?)</h[1-6]>',
        r'<h[1-6][^>]*class=["\'][^"\']*vn\s+visible[^"\']*["\'][^>]*data-type=["\']document-title["\'][^>]*>(.*?)</h[1-6]>',
    ]
    for pattern in patterns:
        match = re.search(pattern, content, flags=re.IGNORECASE | re.DOTALL)
        if match:
            title = strip_html_tags(match.group(1))
            if title:
                return title
    return ""

def make_page_entry(url, content):
    title = extract_vietnamese_page_title(content)
    if title:
        return {"url": url, "title": title}
    return url

def get_page_url(page):
    return page.get("url") if isinstance(page, dict) else page

def validate_local_image_refs(output_dir):
    missing = []
    html_paths = glob.glob(os.path.join(output_dir, "**", "*.html"), recursive=True)
    for html_path in html_paths:
        with open(html_path, "r", encoding="utf-8") as f:
            parser = ImageSrcParser()
            parser.feed(f.read())

        for src in parser.srcs:
            clean_src = src.split("#", 1)[0].split("?", 1)[0]
            if not clean_src or is_external_image_src(clean_src):
                continue
            image_path = os.path.normpath(os.path.join(os.path.dirname(html_path), clean_src))
            if not os.path.exists(image_path):
                missing.append((os.path.relpath(html_path, output_dir), src))

    if missing:
        sample = "\n".join(f"  - {html}: {src}" for html, src in missing[:20])
        extra = "" if len(missing) <= 20 else f"\n  ... and {len(missing) - 20} more"
        raise FileNotFoundError(
            f"Build produced {len(missing)} missing local image reference(s). Restore/download assets before upload:\n{sample}{extra}"
        )

def remove_reader_asset_tags(content):
    content = re.sub(r'<script\s+src="(?:\.\./)*book-reader/book-pages\.js(?:\?v=[^"]*)?"></script>\s*\n?', '', content)
    content = re.sub(r'<script\s+src="(?:\.\./)*book-reader/book-reader\.js(?:\?v=[^"]*)?"></script>\s*\n?', '', content)
    content = re.sub(r'<link\s+rel="stylesheet"\s+href="(?:\.\./)*book-reader/book-reader\.css(?:\?v=[^"]*)?">\s*\n?', '', content)
    content = re.sub(r'<link\s+href="(?:\.\./)*book-reader/book-reader\.css(?:\?v=[^"]*)?"\s+rel="stylesheet"/>\s*\n?', '', content)
    return content

def inject_reviewer_assets(content, html_path, review_dir):
    content = remove_reader_asset_tags(content)
    content = re.sub(r'<script\s+src="(?:\.\./)*book-reviewer/book-pages\.js(?:\?v=[^"]*)?"></script>\s*\n?', '', content)
    content = re.sub(r'<script\s+src="(?:\.\./)*book-reviewer/book-reviewer\.js(?:\?v=[^"]*)?"></script>\s*\n?', '', content)
    content = re.sub(r'<link\s+rel="stylesheet"\s+href="(?:\.\./)*book-reviewer/book-reviewer\.css(?:\?v=[^"]*)?">\s*\n?', '', content)

    rel_dir = os.path.relpath(os.path.dirname(html_path), review_dir)
    depth = 0 if rel_dir == "." else len(rel_dir.split(os.sep))
    prefix = "../" * depth
    pages_js = f'<script src="{prefix}book-reviewer/book-pages.js?v={READER_ASSET_VERSION}"></script>\n'
    css_link = f'<link rel="stylesheet" href="{prefix}book-reviewer/book-reviewer.css?v={READER_ASSET_VERSION}">\n'
    js_link = f'<script src="{prefix}book-reviewer/book-reviewer.js?v={READER_ASSET_VERSION}"></script>\n'
    if '</head>' in content:
        content = content.replace('</head>', f'{pages_js}{css_link}{js_link}</head>')
    return content

def build_review_output(output_dir, all_pages):
    review_dir = os.path.join(output_dir, "review")
    if os.path.exists(review_dir):
        shutil.rmtree(review_dir)
    os.makedirs(review_dir)

    for entry in os.listdir(output_dir):
        if entry in {"book-reader", "book-reviewer", "review", "index.html", "glossary.csv"}:
            continue

        src = os.path.join(output_dir, entry)
        dst = os.path.join(review_dir, entry)
        if os.path.isdir(src):
            shutil.copytree(src, dst)
        elif entry.endswith(".html"):
            shutil.copy2(src, dst)

    reviewer_src = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "book-reviewer")
    reviewer_dst = os.path.join(review_dir, "book-reviewer")
    if os.path.exists(reviewer_src):
        shutil.copytree(reviewer_src, reviewer_dst)

    for html_path in glob.glob(os.path.join(review_dir, "**", "*.html"), recursive=True):
        with open(html_path, "r", encoding="utf-8") as f:
            content = f.read()
        with open(html_path, "w", encoding="utf-8") as f:
            f.write(inject_reviewer_assets(content, html_path, review_dir))

    pages_js_path = os.path.join(reviewer_dst, "book-pages.js")
    with open(pages_js_path, "w", encoding="utf-8") as f:
        f.write(f"window.BOOK_PAGES = {json.dumps(all_pages, ensure_ascii=False)};")

    first_page = get_page_url(all_pages[0]) if all_pages else "chapter-1/1-introduction.html"
    with open(os.path.join(review_dir, "index.html"), "w", encoding="utf-8") as f:
        f.write(f'''<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="refresh" content="0; url={first_page}" />
    <title>Book Reviewer</title>
</head>
<body>
    <p>Redirecting to <a href="{first_page}">Start Reviewing</a></p>
</body>
</html>''')

    for page_entry in all_pages:
        page = get_page_url(page_entry)
        page_without_ext = re.sub(r'\.html$', '', page)
        redirect_dir = os.path.join(output_dir, page_without_ext, "review")
        os.makedirs(redirect_dir, exist_ok=True)
        depth = len(page_without_ext.split('/')) + 1
        target = f"{'../' * depth}review/{page}"
        with open(os.path.join(redirect_dir, "index.html"), "w", encoding="utf-8") as f:
            f.write(f'''<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="refresh" content="0; url={target}" />
    <title>Book Reviewer</title>
</head>
<body>
    <p>Redirecting to <a href="{target}">Review this page</a></p>
</body>
</html>''')

def sort_html_files(file_name):
    # Extract chapter and section numbers
    match = re.match(r'^(\d+)(?:-(\d+))?-', file_name)
    if match:
        chap_num = int(match.group(1))
        sec_num = int(match.group(2)) if match.group(2) else -1
        
        if sec_num == -1:
            if 'introduction' in file_name:
                return (chap_num, 0)
            elif 'key-terms' in file_name:
                return (chap_num, 100)
            elif 'summary' in file_name:
                return (chap_num, 101)
            elif 'review-questions' in file_name:
                return (chap_num, 102)
            elif 'discussion-questions' in file_name:
                return (chap_num, 103)
            elif 'case-questions' in file_name:
                return (chap_num, 104)
            elif 'suggested-resources' in file_name:
                return (chap_num, 105)
            else:
                return (chap_num, 99)
        else:
            return (chap_num, sec_num)
    return (999, 999)

def build_preview(book_dir, output_dir=None):
    if output_dir is None:
        book_slug = os.path.basename(os.path.abspath(book_dir))
        output_dir = os.path.join(get_repo_root(), "apps", "web-site", "books", book_slug)
    print(f"Building preview to {output_dir}...")

    homepage_cover = write_homepage_cover(book_dir)
    if homepage_cover:
        print(f"Generated homepage cover at {homepage_cover}")

    if os.path.exists(output_dir):
        shutil.rmtree(output_dir)
    os.makedirs(output_dir)

    # 1. Copy css
    css_src = os.path.join(book_dir, "css")
    css_dst = os.path.join(output_dir, "css")
    if os.path.exists(css_src):
        shutil.copytree(css_src, css_dst)

    # 2. Copy book-reader from agent-archive/book-reader
    br_src = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "book-reader")
    br_dst = os.path.join(output_dir, "book-reader")
    if os.path.exists(br_src):
        shutil.copytree(br_src, br_dst)

    # Find and sort chapters
    chapter_dirs = [d for d in os.listdir(book_dir) if d.startswith("chapter-") and os.path.isdir(os.path.join(book_dir, d))]
    chapter_dirs.sort(key=lambda x: int(x.split('-')[1]) if x.split('-')[1].isdigit() else 999)

    all_pages = []

    # Process current flat data layout: data/<book>/translated/*.html + assets/
    flat_trans_src = os.path.join(book_dir, "translated")
    if os.path.exists(flat_trans_src):
        html_files = [f for f in os.listdir(flat_trans_src) if f.endswith('.html')]
        html_files.sort(key=sort_html_files)

        for file_name in html_files:
            src_file = os.path.join(flat_trans_src, file_name)
            dst_file = os.path.join(output_dir, file_name)
            with open(src_file, 'r', encoding='utf-8') as f:
                content = f.read()

            all_pages.append(make_page_entry(file_name, content))

            pages_js = f'<script src="book-reader/book-pages.js?v={READER_ASSET_VERSION}"></script>\n'
            css_link = f'<link rel="stylesheet" href="book-reader/book-reader.css?v={READER_ASSET_VERSION}">\n'
            js_link = f'<script src="book-reader/book-reader.js?v={READER_ASSET_VERSION}"></script>\n'
            content = content.replace('../../../css/style.css', 'css/style.css').replace('../../css/style.css', 'css/style.css').replace('../css/style.css', 'css/style.css')
            content = content.replace('../assets/', 'assets/')
            content = content.replace('<script src="../../book-reader/book-pages.js"></script>\n', '')
            content = content.replace('<link rel="stylesheet" href="../../book-reader/book-reader.css">\n', '')
            content = content.replace('<script src="../../book-reader/book-reader.js"></script>\n', '')
            content = content.replace('<link href="../../book-reader/book-reader.css" rel="stylesheet"/>\n', '')
            content = content.replace('<script src="../book-reader/book-pages.js"></script>\n', '')
            content = content.replace('<link rel="stylesheet" href="../book-reader/book-reader.css">\n', '')
            content = content.replace('<script src="../book-reader/book-reader.js"></script>\n', '')
            content = content.replace('<link href="../book-reader/book-reader.css" rel="stylesheet"/>\n', '')
            content = content.replace('<script src="book-reader/book-pages.js"></script>\n', '')
            content = content.replace('<link rel="stylesheet" href="book-reader/book-reader.css">\n', '')
            content = content.replace('<script src="book-reader/book-reader.js"></script>\n', '')
            content = content.replace('<link href="book-reader/book-reader.css" rel="stylesheet"/>\n', '')

            if '</head>' in content and 'book-pages.js' not in content:
                content = content.replace('</head>', f'{pages_js}{css_link}{js_link}</head>')

            with open(dst_file, 'w', encoding='utf-8') as f:
                f.write(content)

        print("Copied and injected flat translated files.")

    flat_assets_src = os.path.join(book_dir, "assets")
    flat_assets_dst = os.path.join(output_dir, "assets")
    if os.path.exists(flat_assets_src):
        shutil.copytree(flat_assets_src, flat_assets_dst)

    # Process book-level front matter
    book_level_dir = "_book-level"
    book_level_src = os.path.join(book_dir, book_level_dir)
    book_level_dst = os.path.join(output_dir, book_level_dir)
    
    if os.path.exists(book_level_src):
        os.makedirs(book_level_dst, exist_ok=True)
        trans_src = os.path.join(book_level_src, "05-translated")
        trans_dst = book_level_dst
        if os.path.exists(trans_src):
            os.makedirs(trans_dst, exist_ok=True)
            for file_name in ['preface.html', 'index.html']:
                src_file = os.path.join(trans_src, file_name)
                dst_file = os.path.join(trans_dst, file_name)
                if os.path.exists(src_file):
                    with open(src_file, 'r', encoding='utf-8') as f:
                        content = f.read()
                    all_pages.append(make_page_entry(f"{book_level_dir}/{file_name}", content))
                    pages_js = f'<script src="../book-reader/book-pages.js?v={READER_ASSET_VERSION}"></script>\n'
                    css_link = f'<link rel="stylesheet" href="../book-reader/book-reader.css?v={READER_ASSET_VERSION}">\n'
                    js_link = f'<script src="../book-reader/book-reader.js?v={READER_ASSET_VERSION}"></script>\n'
                    content = content.replace('../../../css/style.css', '../css/style.css').replace('../../css/style.css', '../css/style.css').replace('../css/style.css', '../css/style.css')
                    content = content.replace('../assets/', 'assets/')
                    # Remove old injected relative scripts if they exist
                    content = content.replace('<script src="../../book-reader/book-pages.js"></script>\n', '')
                    content = content.replace('<link rel="stylesheet" href="../../book-reader/book-reader.css">\n', '')
                    content = content.replace('<script src="../../book-reader/book-reader.js"></script>\n', '')
                    content = content.replace('<link href="../../book-reader/book-reader.css" rel="stylesheet"/>\n', '')
                    content = content.replace('<script src="../book-reader/book-pages.js"></script>\n', '')
                    content = content.replace('<link rel="stylesheet" href="../book-reader/book-reader.css">\n', '')
                    content = content.replace('<script src="../book-reader/book-reader.js"></script>\n', '')
                    content = content.replace('<link href="../book-reader/book-reader.css" rel="stylesheet"/>\n', '')
                    if '</head>' in content and 'book-pages.js' not in content:
                        content = content.replace('</head>', f'{pages_js}{css_link}{js_link}</head>')
                    with open(dst_file, 'w', encoding='utf-8') as f:
                        f.write(content)
        
        # Copy book-level assets if any
        assets_src = os.path.join(book_level_src, "assets")
        assets_dst = os.path.join(book_level_dst, "assets")
        if os.path.exists(assets_src):
            shutil.copytree(assets_src, assets_dst)

    for chap in chapter_dirs:
        chap_src = os.path.join(book_dir, chap)
        chap_dst = os.path.join(output_dir, chap)
        os.makedirs(chap_dst, exist_ok=True)

        trans_src = os.path.join(chap_src, "05-translated")
        trans_dst = chap_dst
        
        if os.path.exists(trans_src):
            os.makedirs(trans_dst, exist_ok=True)
            
            # Sort files in this chapter
            html_files = [f for f in os.listdir(trans_src) if f.endswith('.html')]
            html_files.sort(key=sort_html_files)
            
            for file_name in html_files:
                src_file = os.path.join(trans_src, file_name)
                dst_file = os.path.join(trans_dst, file_name)
                with open(src_file, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                # Keep book-page paths relative so copied output works under /<book>/.
                all_pages.append(make_page_entry(f"{chap}/{file_name}", content))
                
                # Inject scripts
                pages_js = f'<script src="../book-reader/book-pages.js?v={READER_ASSET_VERSION}"></script>\n'
                css_link = f'<link rel="stylesheet" href="../book-reader/book-reader.css?v={READER_ASSET_VERSION}">\n'
                js_link = f'<script src="../book-reader/book-reader.js?v={READER_ASSET_VERSION}"></script>\n'
                content = content.replace('../../../css/style.css', '../css/style.css').replace('../../css/style.css', '../css/style.css').replace('../css/style.css', '../css/style.css')
                content = content.replace('../assets/', 'assets/')
                # Remove old injected relative scripts if they exist
                content = content.replace('<script src="../../book-reader/book-pages.js"></script>\n', '')
                content = content.replace('<link rel="stylesheet" href="../../book-reader/book-reader.css">\n', '')
                content = content.replace('<script src="../../book-reader/book-reader.js"></script>\n', '')
                content = content.replace('<link href="../../book-reader/book-reader.css" rel="stylesheet"/>\n', '')
                content = content.replace('<script src="../book-reader/book-pages.js"></script>\n', '')
                content = content.replace('<link rel="stylesheet" href="../book-reader/book-reader.css">\n', '')
                content = content.replace('<script src="../book-reader/book-reader.js"></script>\n', '')
                content = content.replace('<link href="../book-reader/book-reader.css" rel="stylesheet"/>\n', '')
                
                if '</head>' in content and 'book-pages.js' not in content:
                    content = content.replace('</head>', f'{pages_js}{css_link}{js_link}</head>')
                    
                with open(dst_file, 'w', encoding='utf-8') as f:
                    f.write(content)
            
            print(f"Copied and injected into {chap}/")

        # assets
        assets_src = os.path.join(chap_src, "assets")
        assets_dst = os.path.join(chap_dst, "assets")
        if os.path.exists(assets_src):
            shutil.copytree(assets_src, assets_dst)

    # Process book-level back matter
    book_level_trans_src = os.path.join(book_level_src, "05-translated")
    book_level_trans_dst = book_level_dst
    if os.path.exists(book_level_src) and os.path.exists(book_level_trans_src):
        for file_name in ['a-suggested-resources.html']:
            src_file = os.path.join(book_level_trans_src, file_name)
            dst_file = os.path.join(book_level_trans_dst, file_name)
            if os.path.exists(src_file):
                with open(src_file, 'r', encoding='utf-8') as f:
                    content = f.read()
                all_pages.append(make_page_entry(f"{book_level_dir}/{file_name}", content))
                pages_js = f'<script src="../book-reader/book-pages.js?v={READER_ASSET_VERSION}"></script>\n'
                css_link = f'<link rel="stylesheet" href="../book-reader/book-reader.css?v={READER_ASSET_VERSION}">\n'
                js_link = f'<script src="../book-reader/book-reader.js?v={READER_ASSET_VERSION}"></script>\n'
                content = content.replace('../../../css/style.css', '../css/style.css').replace('../../css/style.css', '../css/style.css').replace('../css/style.css', '../css/style.css')
                content = content.replace('../assets/', 'assets/')
                # Remove old injected relative scripts if they exist
                content = content.replace('<script src="../../book-reader/book-pages.js"></script>\n', '')
                content = content.replace('<link rel="stylesheet" href="../../book-reader/book-reader.css">\n', '')
                content = content.replace('<script src="../../book-reader/book-pages.js"></script>\n', '')
                content = content.replace('<link href="../../book-reader/book-reader.css" rel="stylesheet"/>\n', '')
                content = content.replace('<script src="../book-reader/book-pages.js"></script>\n', '')
                content = content.replace('<link rel="stylesheet" href="../book-reader/book-reader.css">\n', '')
                content = content.replace('<script src="../book-reader/book-reader.js"></script>\n', '')
                content = content.replace('<link href="../book-reader/book-reader.css" rel="stylesheet"/>\n', '')
                if '</head>' in content and 'book-pages.js' not in content:
                    content = content.replace('</head>', f'{pages_js}{css_link}{js_link}</head>')
                with open(dst_file, 'w', encoding='utf-8') as f:
                    f.write(content)

    # 3. Copy global glossary
    glossary_src = os.path.join(book_dir, "glossary.csv")
    glossary_dst = os.path.join(output_dir, "glossary.csv")
    if os.path.exists(glossary_src):
        shutil.copy2(glossary_src, glossary_dst)
        print("Copied global glossary.csv")

    # Create book-pages.js
    pages_js_path = os.path.join(br_dst, "book-pages.js")
    with open(pages_js_path, "w", encoding="utf-8") as f:
        f.write(f"window.BOOK_PAGES = {json.dumps(all_pages, ensure_ascii=False)};")
    print(f"Generated {len(all_pages)} pages into book-pages.js")

    build_review_output(output_dir, all_pages)
    print("Generated reviewer pages under review/.")

    # 4. Create an index.html at root that redirects to the first page
    index_html = os.path.join(output_dir, "index.html")
    first_page = get_page_url(all_pages[0]) if all_pages else "chapter-1/1-introduction.html"
    book_title = get_book_title(book_dir)
    with open(index_html, "w", encoding="utf-8") as f:
        f.write(f'''<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="refresh" content="0; url={first_page}" />
    <title>{book_title}</title>
</head>
<body>
    <p>Redirecting to <a href="{first_page}">Start Reading</a></p>
</body>
</html>''')

    validate_local_image_refs(output_dir)

    print(f"\\nBuild completed successfully! You can now host the '{output_dir}' directory.")

def build_all_books():
    data_dir = os.path.join(get_repo_root(), "data")
    if not os.path.isdir(data_dir):
        raise FileNotFoundError(f"Book data directory not found: {data_dir}")

    book_dirs = []
    for entry in sorted(os.listdir(data_dir)):
        if entry.startswith('.'):
            continue

        book_dir = os.path.join(data_dir, entry)
        if os.path.isdir(book_dir):
            book_dirs.append(book_dir)

    if not book_dirs:
        print(f"No book directories found under {data_dir}.")
        return

    print(f"Building {len(book_dirs)} book(s) from {data_dir}...")
    for book_dir in book_dirs:
        build_preview(book_dir)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Build website-ready static book HTML into apps/web-site/books/<book>. With no arguments, builds every book under data/."
    )
    parser.add_argument("book_dir", nargs="?", help="Optional path to one local book data directory, e.g. data/entrepreneurship")
    parser.add_argument("output_dir", nargs="?", help="Optional output directory. Defaults to apps/web-site/books/<book>")
    args = parser.parse_args()

    if args.book_dir is None:
        build_all_books()
    else:
        build_preview(args.book_dir, args.output_dir)
