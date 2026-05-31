from bs4 import BeautifulSoup
import re

html_path = "data/entrepreneurship/chapter-3/05-translated/3-3-developing-a-workplace-culture-of-ethical-excellence-and-accountability.html"

with open(html_path, "r", encoding="utf-8") as f:
    soup = BeautifulSoup(f.read(), "html.parser")

vn_elements = soup.find_all(class_=lambda x: x and 'vn' in x and 'visible' in x)

print("--- INVESTIGATING PRONOUNS 'TÔI' and 'CHÚNG TÔI' IN 3-3 ---")
for el in vn_elements:
    text = el.get_text()
    if re.search(r"\b(tôi|chúng tôi)\b", text, re.IGNORECASE):
        # Find if it is inside a blockquote or has a specific id containing 'quote'
        parent = el
        is_quote = False
        while parent:
            if parent.name in ["blockquote", "q"] or (parent.get("id") and "quote" in parent.get("id")):
                is_quote = True
                break
            parent = parent.parent
        print(f"Tag: {el.name} | ID: {el.get('id')} | Is in Quote: {is_quote}")
        print(f"  Content: {text.strip()}")
        print("-" * 50)
