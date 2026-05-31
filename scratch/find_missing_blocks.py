import json

with open("scratch/translated_blocks.json", "r", encoding="utf-8") as f:
    blocks = json.load(f)

# Find blocks where 'vn' is equal to 'eng' (meaning not mapped and fallback)
missing = []
for idx, b in enumerate(blocks):
    if b["vn"] == b["eng"] and b["eng"] != "Learning Objectives": # "Learning Objectives" might be mapped or not
        # Let's verify if the key is not in our mapped translations
        missing.append((idx, b["eng"]))

print(f"Total missing: {len(missing)}")
for idx, eng in missing:
    print(f"Index: {idx}")
    print(f"ENG: {eng}")
    print("-" * 80)
