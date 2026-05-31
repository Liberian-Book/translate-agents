from bs4 import BeautifulSoup

html_path = "data/entrepreneurship/chapter-3/05-translated/3-3-developing-a-workplace-culture-of-ethical-excellence-and-accountability.html"

with open(html_path, "r", encoding="utf-8") as f:
    soup = BeautifulSoup(f.read(), "html.parser")

vn_paras = soup.find_all("p", class_=lambda x: x and 'vn' in x and 'visible' in x)

print("--- FLUENCY SAMPLE CHECK FOR 3-3 (12 PARAGRAPHS) ---")
count = 0
for vn_p in vn_paras:
    id_val = vn_p.get("id")
    eng_p = None
    if id_val and id_val.endswith("-vn"):
        eng_p = soup.find("p", id=id_val[:-3])
    if not eng_p:
        prev = vn_p.find_previous_sibling("p")
        if prev and 'eng' in prev.get("class", []):
            eng_p = prev
            
    if eng_p:
        count += 1
        print(f"Sample #{count} | ID: {id_val}")
        print(f"  ENG: {eng_p.get_text(strip=True)}")
        print(f"  VN : {vn_p.get_text(strip=True)}")
        print("-" * 80)
    if count >= 12:
        break
