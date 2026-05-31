import re
from bs4 import BeautifulSoup

html_path = "data/entrepreneurship/chapter-3/05-translated/3-2-corporate-social-responsibility-and-social-entrepreneurship.html"

with open(html_path, "r", encoding="utf-8") as f:
    soup = BeautifulSoup(f.read(), "html.parser")

vn_elements = soup.find_all(class_=lambda x: x and 'vn' in x and 'visible' in x)

print("--- CHECKING PRONOUNS AND TONE ---")
pronoun_counts = {"tôi": 0, "chúng tôi": 0, "bạn": 0, "chúng ta": 0}
for el in vn_elements:
    text = el.get_text().lower()
    # Simple word boundary check
    for p in pronoun_counts:
        matches = re.findall(rf"\b{p}\b", text)
        pronoun_counts[p] += len(matches)

print("Pronoun counts in Vietnamese translation:")
for p, count in pronoun_counts.items():
    print(f"  '{p}': {count}")

print("\n--- CHECKING SPECIFIC PARAGRAPHS WITH IMPORTANT TERMS ---")
keywords = ["toms", "tesla", "airbnb", "new belgium", "mycoskie", "tuyên bố giá trị", "mô hình kinh doanh"]
for el in vn_elements:
    text = el.get_text()
    matched_kws = [kw for kw in keywords if kw in text.lower()]
    if matched_kws:
        # Find original English
        eng_el = None
        if el.get("id"):
            id_val = el.get("id")
            if id_val.endswith("-vn"):
                eng_el = soup.find(id=id_val[:-3])
        if not eng_el:
            prev = el.find_previous_sibling()
            if prev and 'eng' in prev.get("class", []):
                eng_el = prev
        
        print(f"Matched Keywords: {matched_kws} | Element: <{el.name} id='{el.get('id')}'>")
        print(f"  ENG: {eng_el.get_text(strip=True)[:150] if eng_el else 'NOT FOUND'}...")
        print(f"  VN : {text.strip()[:150]}...")
        print("-" * 60)
