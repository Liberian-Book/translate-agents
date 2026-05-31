from bs4 import BeautifulSoup
import json

file_path = "/Users/anderson/Desktop/entrepreneurship/data/entrepreneurship/chapter-4/05-translated/4-3-developing-ideas-innovations-and-inventions.html"

with open(file_path, "r", encoding="utf-8") as f:
    soup = BeautifulSoup(f.read(), "html.parser")

untranslated = []
eng_blocks = soup.find_all(class_="eng hidden")

for block in eng_blocks:
    element_id = block.get("id", "")
    tag = block.name
    en_text = "".join(str(c) for c in block.contents).strip()
    
    vn_block = None
    if element_id:
        vn_block = soup.find(id=f"{element_id}-vn")
    if not vn_block:
        sibling = block.find_next_sibling()
        if sibling and "vn" in sibling.get("class", []):
            vn_block = sibling
            
    if vn_block:
        vn_text = "".join(str(c) for c in vn_block.contents).strip()
        if en_text == vn_text and len(en_text) > 5:
            untranslated.append({
                "tag": tag,
                "id": element_id,
                "en": en_text,
                "vn_id": vn_block.get("id", "") if vn_block else ""
            })

print(f"Total untranslated blocks: {len(untranslated)}")
for i, item in enumerate(untranslated):
    print(f"[{i+1}] Tag: {item['tag']}, ID: {item['id']}")
    print(f"EN: {item['en']}")
    print("-" * 50)
