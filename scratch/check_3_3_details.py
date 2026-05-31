import re
from bs4 import BeautifulSoup

html_path = "data/entrepreneurship/chapter-3/05-translated/3-3-developing-a-workplace-culture-of-ethical-excellence-and-accountability.html"

with open(html_path, "r", encoding="utf-8") as f:
    soup = BeautifulSoup(f.read(), "html.parser")

vn_elements = soup.find_all(class_=lambda x: x and 'vn' in x and 'visible' in x)

print("--- HEADINGS COMPARISON ---")
for vn_el in vn_elements:
    tag_name = vn_el.name
    if tag_name in ["h2", "h3", "h4", "h5", "h6"]:
        orig_id = None
        if vn_el.get("id"):
            id_val = vn_el.get("id")
            if id_val.endswith("-vn"):
                orig_id = id_val[:-3]
        
        eng_el = None
        if orig_id:
            eng_el = soup.find(id=orig_id)
        if not eng_el:
            prev = vn_el.find_previous_sibling()
            if prev and 'eng' in prev.get("class", []):
                eng_el = prev
        
        eng_text = eng_el.get_text(strip=True) if eng_el else "NOT FOUND"
        vn_text = vn_el.get_text(strip=True)
        print(f"Tag: {tag_name} | ID: {vn_el.get('id')}")
        print(f"  ENG: {eng_text}")
        print(f"  VN : {vn_text}")
        print("-" * 40)

print("\n--- PRONOUNS AND TONE CHECK ---")
pronoun_counts = {"tôi": 0, "chúng tôi": 0, "bạn": 0, "chúng ta": 0}
for el in vn_elements:
    text = el.get_text().lower()
    for p in pronoun_counts:
        matches = re.findall(rf"\b{p}\b", text)
        pronoun_counts[p] += len(matches)

print("Pronoun counts in Vietnamese translation:")
for p, count in pronoun_counts.items():
    print(f"  '{p}': {count}")

print("\n--- DETAILED CHECK FOR UNTRANSLATED LABELS ---")
untranslated_keywords = ["Link to Learning", "Work It Out", "Entrepreneur in Action", "Entrepreneurship in Action"]
for vn_el in vn_elements:
    text = vn_el.get_text()
    for kw in untranslated_keywords:
        if kw in text:
            print(f"WARNING: Untranslated keyword '{kw}' found in element <{vn_el.name} id='{vn_el.get('id')}'>:")
            print(f"  Content: {text.strip()}")
            print("-" * 40)
