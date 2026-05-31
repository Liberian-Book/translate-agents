import csv

glossary_path = "data/entrepreneurship/glossary.csv"

with open(glossary_path, "r", encoding="utf-8") as f:
    reader = csv.reader(f)
    headers = next(reader)
    print(f"Headers: {headers}")
    
    chapter_counts = {}
    row_count = 0
    for row in reader:
        row_count += 1
        # chapter is usually at some index. Let's find index of 'chapter'
        try:
            chap_idx = headers.index("chapter")
            chap = row[chap_idx]
            chapter_counts[chap] = chapter_counts.get(chap, 0) + 1
        except Exception as e:
            pass

print(f"Total rows: {row_count}")
print("Chapter counts:")
for chap, count in sorted(chapter_counts.items()):
    print(f"  Chapter '{chap}': {count} entries")
