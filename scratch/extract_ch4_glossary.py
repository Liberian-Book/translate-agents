import csv

glossary_path = "data/entrepreneurship/glossary.csv"
ch4_terms = []

with open(glossary_path, "r", encoding="utf-8") as f:
    reader = csv.DictReader(f)
    for row in reader:
        chap = row.get("chapter", "")
        if "Chương 4" in chap or "chương 4" in chap:
            ch4_terms.append(row)

print(f"--- CHAPTER 4 GLOSSARY TERMS ({len(ch4_terms)} entries) ---")
for t in ch4_terms:
    print(f"Key: {t.get('key')} | Trans: {t.get('translation')} | Desc VN: {t.get('desc_vi')[:100] if t.get('desc_vi') else ''}")
