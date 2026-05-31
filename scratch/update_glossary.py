import csv

new_terms = [
    # (key, translation, options, desc_en, desc_vi, chapter, status, notes)
    ("link to learning", "liên kết học tập", "liên kết học tập/mục chuyên đề liên kết học tập", "feature box title", "", "Chung", "approved", "Source: Bổ sung nhất quán tiêu đề"),
    ("are you ready?", "bạn đã sẵn sàng chưa?", "bạn đã sẵn sàng chưa?/mục chuyên đề bạn đã sẵn sàng chưa?", "feature box title", "", "Chung", "approved", "Source: Bổ sung nhất quán tiêu đề"),
    ("work it out", "thực hành", "thực hành/mục chuyên đề thực hành", "feature box title", "", "Chung", "approved", "Source: Bổ sung nhất quán tiêu đề"),
    ("what can you do?", "bạn có thể làm gì?", "bạn có thể làm gì?/mục chuyên đề bạn có thể làm gì?", "feature box title", "", "Chung", "approved", "Source: Bổ sung nhất quán tiêu đề"),
    ("learning objectives", "mục tiêu học tập", "mục tiêu học tập", "header", "", "Chung", "approved", "Source: Bổ sung nhất quán tiêu đề"),
    ("suggested resources", "tài nguyên gợi ý", "tài nguyên gợi ý", "header", "", "Chung", "approved", "Source: Bổ sung nhất quán tiêu đề"),
    ("key terms", "thuật ngữ chính", "thuật ngữ chính", "header", "", "Chung", "approved", "Source: Bổ sung nhất quán tiêu đề"),
    ("review questions", "câu hỏi ôn tập", "câu hỏi ôn tập", "header", "", "Chung", "approved", "Source: Bổ sung nhất quán tiêu đề"),
    ("discussion questions", "câu hỏi thảo luận", "câu hỏi thảo luận", "header", "", "Chung", "approved", "Source: Bổ sung nhất quán tiêu đề"),
    ("case questions", "câu hỏi tình huống", "câu hỏi tình huống", "header", "", "Chung", "approved", "Source: Bổ sung nhất quán tiêu đề"),
    ("chapter outline", "dàn ý chương", "dàn ý chương", "header", "", "Chung", "approved", "Source: Bổ sung nhất quán tiêu đề")
]

def update_glossary():
    csv_path = '/Users/anderson/Desktop/entrepreneurship/data/entrepreneurship/glossary.csv'
    
    # Read existing keys to avoid duplicates
    existing_keys = set()
    try:
        with open(csv_path, 'r', encoding='utf-8') as f:
            reader = csv.reader(f)
            headers = next(reader)
            for row in reader:
                if row:
                    existing_keys.add(row[0].strip().lower())
    except FileNotFoundError:
        print(f"Glossary file not found at {csv_path}")
        return

    added_count = 0
    # Open in append mode
    with open(csv_path, 'a', encoding='utf-8', newline='') as f:
        writer = csv.writer(f)
        for term in new_terms:
            key = term[0]
            if key.lower() not in existing_keys:
                writer.writerow(term)
                print(f"Added term to glossary: {key} -> {term[1]}")
                added_count += 1
            else:
                print(f"Term already exists in glossary: {key}")
                
    print(f"Glossary update complete. Added {added_count} new term(s).")

if __name__ == '__main__':
    update_glossary()
