import os
import re

def parse_review(file_path):
    rows = []
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    in_table = False
    for line in lines:
        if line.strip().startswith('| ID |') or line.strip().startswith('|---|'):
            in_table = True
            continue
        if in_table and line.strip().startswith('|'):
            cols = [col.strip() for col in line.split('|')][1:-1]
            if len(cols) >= 9:
                suggestion_raw = cols[6]
                if '`' in suggestion_raw:
                    suggestion = suggestion_raw.split('`')[1]
                else:
                    suggestion = suggestion_raw.replace('Sửa thành:', '').strip()
                rows.append({
                    'id': cols[4].strip('`'),
                    'current': cols[3].strip('`'),
                    'suggestion': suggestion
                })
        elif in_table and not line.strip():
            in_table = False
    return rows

def fix_html(html_path, rows):
    with open(html_path, 'r', encoding='utf-8') as f:
        html = f.read()
    
    for row in rows:
        term_id = row['id']
        curr = row['current']
        sugg = row['suggestion']
        
        # We want to replace `<span ... id="term_id"...>curr</span>` with sugg
        # BUT only the second occurrence (the VN one), or we can use regex to find the one after vn visible.
        # Let's just find the exact span tag
        pattern = re.compile(rf'(<span[^>]*id="{term_id}"[^>]*group-by="[^"]*">)\s*{re.escape(curr)}\s*(</span>)')
        
        matches = list(pattern.finditer(html))
        if len(matches) == 2:
            # Replace the second one
            html = html[:matches[1].start()] + matches[1].group(1) + sugg + matches[1].group(2) + html[matches[1].end():]
        elif len(matches) == 1:
            # Maybe it's already in VN? Check if there's an eng tag.
            # Just replace it if it's safe (we can assume the only match is the one we want if it's already broken or if there's only 1)
            # Actually, to be safe, just replace the second match if there are two.
            pass
            
    with open(html_path, 'w', encoding='utf-8') as f:
        f.write(html)

reviews = [
    ("data/entrepreneurship/chapter-14/06-reviews/14-1-types-of-resources-glossary-review.md", "data/entrepreneurship/chapter-14/05-translated/14-1-types-of-resources.html"),
    ("data/entrepreneurship/chapter-14/06-reviews/14-2-using-the-pest-framework-to-assess-resource-needs-glossary-review.md", "data/entrepreneurship/chapter-14/05-translated/14-2-using-the-pest-framework-to-assess-resource-needs.html"),
    ("data/entrepreneurship/chapter-14/06-reviews/14-3-managing-resources-over-the-venture-life-cycle-glossary-review.md", "data/entrepreneurship/chapter-14/05-translated/14-3-managing-resources-over-the-venture-life-cycle.html")
]

for rev, html in reviews:
    rows = parse_review(rev)
    fix_html(html, rows)
    print(f"Fixed {html}")
