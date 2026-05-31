from bs4 import BeautifulSoup
import re

html_path = "data/entrepreneurship/chapter-4/05-translated/4-3-developing-ideas-innovations-and-inventions.html"

with open(html_path, "r", encoding="utf-8") as f:
    soup = BeautifulSoup(f.read(), "html.parser")

vn_elements = soup.find_all(class_=lambda x: x and 'vn' in x and 'visible' in x)

count_ban = 0
count_chung_ta = 0
count_toi = 0
count_chung_toi = 0

print("--- PRONOUN LISTING IN 4-3 ---")
for el in vn_elements:
    text = el.get_text()
    
    # Count occurrences
    ban_matches = re.findall(r"\b(bạn)\b", text, re.IGNORECASE)
    count_ban += len(ban_matches)
    
    ct_matches = re.findall(r"\b(chúng ta)\b", text, re.IGNORECASE)
    count_chung_ta += len(ct_matches)
    
    toi_matches = re.findall(r"\b(tôi)\b", text, re.IGNORECASE)
    count_toi += len(toi_matches)
    
    ctoi_matches = re.findall(r"\b(chúng tôi)\b", text, re.IGNORECASE)
    count_chung_toi += len(ctoi_matches)
    
    if re.search(r"\b(tôi|chúng tôi)\b", text, re.IGNORECASE):
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

print(f"\nSummary of Pronouns:")
print(f"  'bạn': {count_ban} times")
print(f"  'chúng ta': {count_chung_ta} times")
print(f"  'tôi': {count_toi} times")
print(f"  'chúng tôi': {count_chung_toi} times")
