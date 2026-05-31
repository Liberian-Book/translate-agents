import re
from bs4 import BeautifulSoup

html_path = "data/entrepreneurship/chapter-3/05-translated/3-2-corporate-social-responsibility-and-social-entrepreneurship.html"

with open(html_path, "r", encoding="utf-8") as f:
    soup = BeautifulSoup(f.read(), "html.parser")

print("--- HEADINGS COMPARISON ---")
# Find all elements that have a vn.visible class
vn_elements = soup.find_all(class_=lambda x: x and 'vn' in x and 'visible' in x)

for idx, vn_el in enumerate(vn_elements):
    # If the tag is a heading or has interesting role
    tag_name = vn_el.name
    if tag_name in ["h2", "h3", "h4", "h5", "h6"]:
        # Find corresponding eng.hidden (usually preceding sibling or same structure)
        # Let's find by id (since translated id is usually original_id + "-vn")
        orig_id = None
        if vn_el.get("id"):
            id_val = vn_el.get("id")
            if id_val.endswith("-vn"):
                orig_id = id_val[:-3]
        
        eng_el = None
        if orig_id:
            eng_el = soup.find(id=orig_id)
        
        if not eng_el:
            # Try previous sibling with class 'eng'
            prev = vn_el.find_previous_sibling()
            if prev and 'eng' in prev.get("class", []):
                eng_el = prev
        
        eng_text = eng_el.get_text(strip=True) if eng_el else "NOT FOUND"
        vn_text = vn_el.get_text(strip=True)
        print(f"Tag: {tag_name} | ID: {vn_el.get('id')}")
        print(f"  ENG: {eng_text}")
        print(f"  VN : {vn_text}")
        print("-" * 40)

print("\n--- GENERAL CHECK FOR UNTRANSLATED LABELS ---")
untranslated_keywords = ["Link to Learning", "Work It Out", "Entrepreneur in Action", "Entrepreneurship in Action"]
for vn_el in vn_elements:
    text = vn_el.get_text()
    for kw in untranslated_keywords:
        if kw in text:
            print(f"WARNING: Untranslated keyword '{kw}' found in element <{vn_el.name} id='{vn_el.get('id')}'>:")
            print(f"  Content: {text.strip()}")
            print("-" * 40)
