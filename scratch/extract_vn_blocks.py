from bs4 import BeautifulSoup
import json

prep_file = "data/entrepreneurship/chapter-4/04-prep/4-3-developing-ideas-innovations-and-inventions.html"

with open(prep_file, "r", encoding="utf-8") as f:
    soup = BeautifulSoup(f.read(), "html.parser")

vn_elements = soup.find_all(class_=lambda x: x and 'vn' in x and 'visible' in x)

blocks = []
for el in vn_elements:
    # Find matching eng hidden
    orig_id = None
    if el.get("id"):
        id_val = el.get("id")
        if id_val.endswith("-vn"):
            orig_id = id_val[:-3]
            
    eng_el = None
    if orig_id:
        eng_el = soup.find(id=orig_id)
    if not eng_el:
        prev = el.find_previous_sibling()
        if prev and 'eng' in prev.get("class", []):
            eng_el = prev
            
    eng_text = eng_el.get_text(strip=True) if eng_el else "NOT FOUND"
    
    blocks.append({
        "tag": el.name,
        "id": el.get("id"),
        "eng": eng_text,
        "vn_placeholder": el.get_text(strip=True)
    })

print(f"Total blocks to translate: {len(blocks)}")
# Save to JSON for easier reading/writing
with open("scratch/blocks_to_translate.json", "w", encoding="utf-8") as f:
    json.dump(blocks, f, ensure_ascii=False, indent=2)

print("Saved to scratch/blocks_to_translate.json")
# Print the first 5 blocks as a sample
for idx, b in enumerate(blocks[:5]):
    print(f"Block #{idx+1} | Tag: {b['tag']} | ID: {b['id']}")
    print(f"  ENG: {b['eng']}")
    print("-" * 50)
