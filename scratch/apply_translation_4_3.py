from bs4 import BeautifulSoup
import json
import os

PREP_FILE = "data/entrepreneurship/chapter-4/04-prep/4-3-developing-ideas-innovations-and-inventions.html"
TRANSLATED_JSON = "scratch/translated_blocks.json"
OUTPUT_FILE = "data/entrepreneurship/chapter-4/05-translated/4-3-developing-ideas-innovations-and-inventions.html"

# Load translated blocks
with open(TRANSLATED_JSON, "r", encoding="utf-8") as f:
    translated_blocks = json.load(f)

# Load prep file
with open(PREP_FILE, "r", encoding="utf-8") as f:
    soup = BeautifulSoup(f.read(), "html.parser")

# Find all vn visible elements (elements that need translation)
vn_elements = soup.find_all(class_=lambda x: x and 'vn' in x and 'visible' in x)

print(f"Total vn elements found in prep HTML: {len(vn_elements)}")
print(f"Total blocks in translated_blocks.json: {len(translated_blocks)}")

if len(vn_elements) != len(translated_blocks):
    print("WARNING: The number of elements in HTML does not match translation database!")

matched_count = 0
for idx, el in enumerate(vn_elements):
    if idx >= len(translated_blocks):
        print(f"WARNING: No translation for HTML element index {idx}")
        break
    
    block_data = translated_blocks[idx]
    # Check if tags and IDs match
    el_tag = el.name
    el_id = el.get("id")
    
    db_tag = block_data.get("tag")
    db_id = block_data.get("id")
    
    if el_tag != db_tag:
        print(f"WARNING at index {idx}: HTML tag is <{el_tag}>, but DB tag is <{db_tag}>")
    if el_id != db_id:
        print(f"WARNING at index {idx}: HTML ID is '{el_id}', but DB ID is '{db_id}'")
        
    # Apply translation
    vn_translation = block_data["vn"]
    
    # Parse translated HTML content and replace
    trans_soup = BeautifulSoup(vn_translation, "html.parser")
    el.clear()
    for child in list(trans_soup.children):
        el.append(child)
    matched_count += 1

# Ensure the output directory exists
os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)

# Write output file
with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
    f.write(str(soup))

print(f"Successfully merged {matched_count} translations and wrote to {OUTPUT_FILE}")
