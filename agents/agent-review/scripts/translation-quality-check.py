#!/usr/bin/env python3

import argparse
import json
import os
import re
import sys
from datetime import datetime, timezone
from html.parser import HTMLParser


def find_project_root(start_dir):
    current = os.path.abspath(start_dir)
    for _ in range(10):
        if os.path.exists(os.path.join(current, "package.json")):
            return current
        current = os.path.dirname(current)
    return None


def resolve_book_dir(project_root, book):
    candidates = [
        os.path.join(project_root, "data", book),
        os.path.join(project_root, "..", book),
        os.path.join(project_root, "..", "web-site", book),
    ]
    for candidate in candidates:
        if os.path.isdir(os.path.join(candidate, "translated")):
            return os.path.abspath(candidate)
    for candidate in candidates:
        if os.path.isdir(candidate) and any(name.startswith("chapter-") for name in os.listdir(candidate)):
            return os.path.abspath(candidate)
    for candidate in candidates:
        if os.path.exists(candidate):
            return os.path.abspath(candidate)
    return os.path.abspath(candidates[0])


def resolve_termbase_dir(project_root, book, content_dir):
    candidates = [
        content_dir,
        os.path.join(project_root, "data", book),
        os.path.join(project_root, "..", book),
        os.path.join(project_root, "..", "web-site", book),
    ]
    for candidate in candidates:
        if candidate and os.path.exists(os.path.join(candidate, "termbase.json")):
            return os.path.abspath(candidate)
    return content_dir


def infer_book_dir_from_file(file_path):
    current = os.path.abspath(os.path.dirname(file_path))
    for _ in range(8):
        if os.path.exists(os.path.join(current, "termbase.json")):
            return current
        current = os.path.dirname(current)
    return None


class BilingualParser(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.stack = []
        self.blocks = []

    def handle_starttag(self, tag, attrs):
        attr_map = dict(attrs)
        classes = set((attr_map.get("class") or "").split())
        lang = None
        if "eng" in classes and "hidden" in classes:
            lang = "eng"
        elif "vn" in classes and "visible" in classes:
            lang = "vn"
        if lang:
            self.stack.append({
                "tag": tag,
                "lang": lang,
                "id": attr_map.get("id") or "",
                "text": [],
                "depth": 1,
            })
        elif self.stack:
            self.stack[-1]["depth"] += 1

    def handle_endtag(self, tag):
        if not self.stack:
            return
        self.stack[-1]["depth"] -= 1
        if self.stack[-1]["depth"] <= 0:
            block = self.stack.pop()
            block["text"] = normalize_space("".join(block["text"]))
            self.blocks.append(block)

    def handle_data(self, data):
        if self.stack:
            self.stack[-1]["text"].append(data)


def normalize_space(text):
    return re.sub(r"\s+", " ", text).strip()


def normalize_for_match(text):
    return normalize_space(text).casefold()


def strip_noise(text):
    text = re.sub(r"https?://\S+|www\.\S+", " ", text)
    text = re.sub(r"\b\S+@\S+\.\S+\b", " ", text)
    text = re.sub(r"__HTML_TAG_\d+__", " ", text)
    return text


META_RESPONSE_PATTERNS = [
    re.compile(r"xin lỗi[,\s]+nhưng", re.IGNORECASE),
    re.compile(r"không thể (?:truy cập|dịch|giúp|thực hiện)", re.IGNORECASE),
    re.compile(r"(?:văn bản|nội dung).{0,80}(?:không đầy đủ|không đủ|cần dịch)", re.IGNORECASE),
]


def term_candidates(term):
    values = [term.get("source", "")]
    values.extend(term.get("variants") or [])
    return [value for value in values if value]


def contains_phrase(text, phrase, case_sensitive=False):
    if not phrase:
        return False
    flags = 0 if case_sensitive else re.IGNORECASE
    escaped = re.escape(phrase)
    return re.search(rf"(^|[^A-Za-z]){escaped}(?=$|[^A-Za-z])", text, flags) is not None


def accepted_targets(term):
    values = [term.get("target", "")]
    values.extend(term.get("acceptedTargets") or [])
    result = []
    source = term.get("source", "")
    for value in values:
        for part in value.split("/"):
            target = part.strip()
            if not target:
                continue
            result.append(target)
            if source:
                without_source_parenthetical = re.sub(rf"\s*\({re.escape(source)}\)", "", target, flags=re.IGNORECASE).strip()
                if without_source_parenthetical and without_source_parenthetical != target:
                    result.append(without_source_parenthetical)
    return list(dict.fromkeys(result))


def target_present(vn_text, term):
    normalized = normalize_for_match(vn_text)
    return any(normalize_for_match(target) in normalized for target in accepted_targets(term))


def source_present(text, term):
    return any(contains_phrase(text, candidate, term.get("caseSensitive", False)) for candidate in term_candidates(term))


def hard_source_remains(text, term):
    for candidate in term_candidates(term):
        flags = 0 if term.get("caseSensitive", False) else re.IGNORECASE
        pattern = re.compile(rf"(^|[^A-Za-z])({re.escape(candidate)})(?=$|[^A-Za-z])", flags)
        for match in pattern.finditer(text):
            value = match.group(2)
            if value != value.lower():
                continue
            return True
    return False


def remove_accepted_targets(text, term):
    result = text
    for target in accepted_targets(term):
        result = re.sub(re.escape(target), " ", result, flags=re.IGNORECASE)
    return result


def remove_allowed_english(text, allowlist):
    cleaned = strip_noise(text)
    for value in allowlist:
        if not value:
            continue
        cleaned = re.sub(re.escape(value), " ", cleaned, flags=re.IGNORECASE)
    return cleaned


def source_english_phrases(source_text):
    words = re.findall(r"[A-Za-z][A-Za-z'-]*", strip_noise(source_text))
    phrases = set()
    for size in range(5, 1, -1):
        for index in range(0, len(words) - size + 1):
            phrase = " ".join(words[index:index + size])
            if len(phrase) >= 8:
                phrases.add(phrase.casefold())
    return phrases


def find_english_leaks(source_text, vn_text, allowlist):
    cleaned = remove_allowed_english(vn_text, allowlist)
    leaks = []
    source_phrases = source_english_phrases(source_text)
    for match in re.finditer(r"\b[A-Za-z][A-Za-z'-]*(?:\s+[A-Za-z][A-Za-z'-]*)+\b", cleaned):
        phrase = normalize_space(match.group(0))
        if any(word != word.lower() for word in phrase.split()):
            continue
        if phrase.casefold() in source_phrases:
            leaks.append(phrase)
    return leaks


def parse_blocks(file_path):
    parser = BilingualParser()
    with open(file_path, "r", encoding="utf-8") as handle:
        parser.feed(handle.read())
    return parser.blocks


def pair_blocks(blocks):
    eng_by_id = {}
    eng_order = []
    pairs = []
    for block in blocks:
        if block["lang"] == "eng":
            base_id = block["id"]
            if base_id:
                eng_by_id[base_id] = block
            eng_order.append(block)
        elif block["lang"] == "vn":
            base_id = re.sub(r"-vn$", "", block["id"])
            eng = eng_by_id.get(base_id) if base_id else None
            if not eng and eng_order:
                eng = eng_order[min(len(pairs), len(eng_order) - 1)]
            if eng:
                pairs.append((eng, block))
    return pairs


def check_pair(file_path, eng, vn, termbase):
    issues = []
    source_text = eng["text"]
    vn_text = vn["text"]
    allowlist = (termbase.get("allowlist") or []) + (termbase.get("protectedTerms") or [])

    for term in termbase.get("hardTerms") or []:
        if not source_present(source_text, term):
            continue
        has_target = target_present(vn_text, term)
        has_source = hard_source_remains(strip_noise(remove_accepted_targets(vn_text, term)), term)
        if has_source and has_target:
            issues.append(make_issue(file_path, vn, "mixed-bilingual", term, vn_text, "Source term and Vietnamese target both appear in one segment."))
        elif has_source:
            issues.append(make_issue(file_path, vn, "source-echo", term, vn_text, "Source term remains in Vietnamese segment."))
        elif not has_target:
            issues.append(make_issue(file_path, vn, "missing-term", term, vn_text, "Required target term is missing."))

    for leak in find_english_leaks(source_text, vn_text, allowlist):
        issues.append({
            "file": file_path,
            "blockId": vn.get("id") or "",
            "severity": "error",
            "type": "english-leak",
            "source": leak,
            "expected": "",
            "actual": vn_text,
            "message": f"Unexpected English phrase remains: {leak}",
        })

    for pattern in META_RESPONSE_PATTERNS:
        if pattern.search(vn_text):
            issues.append({
                "file": file_path,
                "blockId": vn.get("id") or "",
                "severity": "error",
                "type": "model-chatter",
                "source": "",
                "expected": "translated content only",
                "actual": vn_text,
                "message": "Assistant meta-response appears in translated segment.",
            })
            break

    return issues


def make_issue(file_path, vn, issue_type, term, actual, message):
    return {
        "file": file_path,
        "blockId": vn.get("id") or "",
        "severity": "error",
        "type": issue_type,
        "source": term.get("source", ""),
        "expected": "/".join(accepted_targets(term)),
        "actual": actual,
        "message": message,
    }


def target_files(book_dir, target):
    flat_translated_dir = os.path.join(book_dir, "translated")
    if target.endswith(".html"):
        if os.path.exists(target):
            return [os.path.abspath(target)]
        flat_candidate = os.path.join(flat_translated_dir, target)
        if os.path.exists(flat_candidate):
            return [os.path.abspath(flat_candidate)]
        for root, _dirs, names in os.walk(book_dir):
            if os.path.basename(root) == "05-translated" and target in names:
                return [os.path.abspath(os.path.join(root, target))]
        return [os.path.abspath(target)]
    if target == "all":
        if os.path.isdir(flat_translated_dir):
            return sorted(os.path.join(flat_translated_dir, name) for name in os.listdir(flat_translated_dir) if name.endswith(".html"))
        files = []
        for root, _dirs, names in os.walk(book_dir):
            if os.path.basename(root) != "05-translated":
                continue
            files.extend(os.path.join(root, name) for name in names if name.endswith(".html"))
        return sorted(files)
    if target.isdigit():
        translated_dir = os.path.join(book_dir, f"chapter-{target}", "05-translated")
        if os.path.isdir(translated_dir):
            return sorted(os.path.join(translated_dir, name) for name in os.listdir(translated_dir) if name.endswith(".html"))
        if os.path.isdir(flat_translated_dir):
            prefix = f"{target}-"
            return sorted(os.path.join(flat_translated_dir, name) for name in os.listdir(flat_translated_dir) if name.endswith(".html") and name.startswith(prefix))
        return []
    candidate = os.path.join(book_dir, target)
    return [candidate] if os.path.exists(candidate) else []


def report_path(files, book_dir, target):
    if len(files) == 1:
        review_dir = os.path.dirname(files[0]).replace("05-translated", "06-reviews").replace("translated", "06-reviews")
        os.makedirs(review_dir, exist_ok=True)
        name = os.path.basename(files[0]).replace(".html", "-translation-quality-report.md")
        return os.path.join(review_dir, name)
    if target.isdigit() and not os.path.isdir(os.path.join(book_dir, "translated")):
        review_dir = os.path.join(book_dir, f"chapter-{target}", "06-reviews")
    else:
        review_dir = os.path.join(book_dir, "06-reviews")
    os.makedirs(review_dir, exist_ok=True)
    return os.path.join(review_dir, f"translation-quality-{target}-summary.md")


def write_report(output_path, issues, files, waiver):
    status = "WAIVED" if waiver else ("FAIL" if issues else "PASS")
    lines = [
        f"# Translation Quality Report",
        "",
        f"**Status:** {status}",
        f"**Generated:** {datetime.now(timezone.utc).isoformat()}",
        f"**Files checked:** {len(files)}",
        f"**Blocking issues:** {len(issues)}",
    ]
    if waiver:
        lines.extend(["", f"**Waiver:** {waiver}"])
    lines.extend(["", "## Issues", ""])
    if not issues:
        lines.append("No blocking translation-quality issues found.")
    else:
        lines.append("| ID | Type | File | Block | Source | Expected | Actual | Message |")
        lines.append("|---|---|---|---|---|---|---|---|")
        for index, issue in enumerate(issues, 1):
            lines.append("| {} | {} | `{}` | `{}` | `{}` | `{}` | `{}` | {} |".format(
                f"Q-{index:03d}",
                issue["type"],
                os.path.relpath(issue["file"]),
                issue["blockId"],
                escape_md(issue["source"]),
                escape_md(issue["expected"]),
                escape_md(issue["actual"][:220]),
                escape_md(issue["message"]),
            ))
    with open(output_path, "w", encoding="utf-8") as handle:
        handle.write("\n".join(lines) + "\n")


def escape_md(text):
    return (text or "").replace("`", "'").replace("|", "\\|")


def parse_args():
    parser = argparse.ArgumentParser(description="Check translated bilingual HTML for termbase and English-leak QA issues.")
    parser.add_argument("book", nargs="?", default="entrepreneurship", help="Book name. Defaults to entrepreneurship.")
    parser.add_argument("target", nargs="?", default="all", help="Chapter number, all, or translated HTML path.")
    parser.add_argument("--waive", default="", help="Record an explicit waiver and exit 0 even when issues are found.")
    parser.add_argument("--dry", action="store_true", help="Print summary without writing a report file.")
    args = parser.parse_args()
    if args.book.endswith(".html"):
        args.target = args.book
        args.book = None
    elif args.book in {"all"} or args.book.isdigit():
        args.target = args.book
        args.book = "entrepreneurship"
    return args


def main():
    args = parse_args()
    project_root = find_project_root(os.path.dirname(__file__))
    if not project_root:
        print("Could not find project root containing package.json", file=sys.stderr)
        return 2
    book_dir = infer_book_dir_from_file(args.target) if args.book is None and args.target.endswith(".html") else None
    if book_dir is None:
        book_dir = resolve_book_dir(project_root, args.book or "entrepreneurship")
    termbase_dir = resolve_termbase_dir(project_root, args.book or "entrepreneurship", book_dir)
    termbase_path = os.path.join(termbase_dir, "termbase.json")
    if not os.path.exists(termbase_path):
        print(f"Termbase not found: {termbase_path}", file=sys.stderr)
        return 2
    with open(termbase_path, "r", encoding="utf-8") as handle:
        termbase = json.load(handle)

    files = target_files(book_dir, args.target)
    if not files:
        print(f"No translated HTML files found for target: {args.target}", file=sys.stderr)
        return 2

    issues = []
    for file_path in files:
        for eng, vn in pair_blocks(parse_blocks(file_path)):
            issues.extend(check_pair(file_path, eng, vn, termbase))

    output_path = report_path(files, book_dir, args.target)
    if not args.dry:
        write_report(output_path, issues, files, args.waive)
        print(f"Report: {output_path}")
    print(f"Checked {len(files)} file(s); blocking issues: {len(issues)}")
    if issues and not args.waive:
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
