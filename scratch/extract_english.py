from bs4 import BeautifulSoup
import json

prep_file = "/Users/anderson/Desktop/entrepreneurship/data/entrepreneurship/chapter-3/04-prep/3-3-developing-a-workplace-culture-of-ethical-excellence-and-accountability.html"

with open(prep_file, "r", encoding="utf-8") as f:
    soup = BeautifulSoup(f.read(), "html.parser")

blocks = []
# Find all elements with class 'eng hidden'
eng_blocks = soup.find_all(class_="eng hidden")

for block in eng_blocks:
    tag_name = block.name
    element_id = block.get("id", "")
    text = "".join(str(c) for c in block.contents).strip()
    
    # Find matching vn visible block
    # It usually has id = element_id + "-vn" or is a sibling
    vn_block = None
    if element_id:
        vn_block = soup.find(id=f"{element_id}-vn")
    if not vn_block:
        # try to find the next sibling with class 'vn visible'
        sibling = block.find_next_sibling()
        if sibling and "vn" in sibling.get("class", []):
            vn_block = sibling
            
    vn_text = ""
    if vn_block:
        vn_text = "".join(str(c) for c in vn_block.contents).strip()
        
    blocks.append({
        "tag": tag_name,
        "id": element_id,
        "en": text,
        "vn_id": vn_block.get("id", "") if vn_block else ""
    })

output_file = "/Users/anderson/Desktop/entrepreneurship/scratch/extracted_blocks.json"
with open(output_file, "w", encoding="utf-8") as f:
    json.dump(blocks, f, ensure_ascii=False, indent=2)

print(f"Extracted {len(blocks)} blocks and saved to {output_file}")
