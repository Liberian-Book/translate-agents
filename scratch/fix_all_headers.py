import os
import glob
import re
from bs4 import BeautifulSoup

# Define keys, standard translations, and the variations we want to target
header_rules = {
    "Link to Learning": {
        "standard": "Liên kết học tập",
        "variants": ["Liên kết học tập", "Liên kết đến học tập", "Liên kết Học tập", "Link to Learning", "Liên kết để học thêm", "Liên Kết Học Tập"]
    },
    "Are You Ready?": {
        "standard": "Bạn đã sẵn sàng chưa?",
        "variants": ["Bạn đã sẵn sàng chưa?", "Bạn đã Sẵn sàng?", "Bạn Đã Sẵn Sàng?", "Are You Ready?"]
    },
    "Work It Out": {
        "standard": "Thực hành",
        "variants": ["Thực hành", "Thử làm", "Luyện tập", "Cùng giải quyết"]
    },
    "What Can You Do?": {
        "standard": "Bạn có thể làm gì?",
        "variants": ["Bạn có thể làm gì?", "Bạn Có Thể Làm Gì?", "Bạn Có thể Làm gì?"]
    },
    "Learning Objectives": {
        "standard": "Mục tiêu học tập",
        "variants": ["Mục tiêu học tập", "Mục tiêu Học tập", "Mục Tiêu Học Tập"]
    },
    "Suggested Resources": {
        "standard": "Tài nguyên gợi ý",
        "variants": ["Tài nguyên gợi ý", "Tài nguyên tham khảo", "Suggested Resources", "Tài liệu tham khảo gợi ý"]
    },
    "Key Terms": {
        "standard": "Thuật ngữ chính",
        "variants": ["Thuật ngữ chính", "Thuật ngữ Quan trọng"]
    },
    "Review Questions": {
        "standard": "Câu hỏi ôn tập",
        "variants": ["Câu hỏi ôn tập", "Câu hỏi Ôn tập"]
    },
    "Discussion Questions": {
        "standard": "Câu hỏi thảo luận",
        "variants": ["Câu hỏi thảo luận", "Câu hỏi Thảo luận"]
    },
    "Case Questions": {
        "standard": "Câu hỏi tình huống",
        "variants": ["Câu hỏi tình huống", "Câu hỏi Tình huống"]
    },
    "Chapter Outline": {
        "standard": "Dàn ý chương",
        "variants": ["Dàn ý chương", "Dàn ý Chương"]
    }
}

def fix_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
        
    soup = BeautifulSoup(content, 'html.parser')
    modified = False
    
    # 1. Look for paired elements where one has 'eng' / 'hidden' class
    # and the next sibling has 'vn' / 'visible' class.
    all_tags = soup.find_all()
    for tag in all_tags:
        classes = tag.get('class', [])
        if 'eng' in classes:
            sibling = tag.find_next_sibling()
            if sibling and 'vn' in sibling.get('class', []):
                # Found a bilingual pair
                eng_text = tag.get_text(strip=True)
                eng_text_clean = re.sub(r'\s+', ' ', eng_text)
                
                # Check if this English text matches any of our keys
                matched_key = None
                for key in header_rules:
                    if eng_text_clean.lower() == key.lower():
                        matched_key = key
                        break
                        
                if matched_key:
                    rule = header_rules[matched_key]
                    vn_text = sibling.get_text(strip=True)
                    vn_text_clean = re.sub(r'\s+', ' ', vn_text)
                    
                    # If the VN text matches any variant, or is not yet the standard translation
                    if vn_text_clean != rule["standard"]:
                        # Update the VN tag content
                        # Check if it has a child with class 'os-title-label' or 'os-subtitle-label' or 'os-caption'
                        title_labels = sibling.find_all(class_='os-title-label')
                        if title_labels:
                            title_labels[0].string = rule["standard"]
                        else:
                            sibling.string = rule["standard"]
                        
                        print(f"  Fixed key '{matched_key}': '{vn_text_clean}' -> '{rule['standard']}'")
                        modified = True
                        
        # 2. Also check if the tag itself is a class 'vn' / 'visible' and its parent has some structure
        # but the paired sibling search covers almost all cases.
        
    if modified:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(str(soup))
        return True
    return False

def fix_all_headers():
    html_files = glob.glob('/Users/anderson/Desktop/entrepreneurship/data/entrepreneurship/chapter-*/05-translated/*.html')
    html_files += glob.glob('/Users/anderson/Desktop/entrepreneurship/data/entrepreneurship/_book-level/05-translated/*.html')
    
    print(f"Scanning and fixing {len(html_files)} files...")
    
    fixed_files_count = 0
    for filepath in sorted(html_files):
        filename = os.path.basename(filepath)
        chapter = os.path.basename(os.path.dirname(os.path.dirname(filepath)))
        
        # Print filename context if modified
        print(f"Checking {chapter}/{filename}...")
        if fix_file(filepath):
            fixed_files_count += 1
            
    print(f"\nDone. Fixed {fixed_files_count} files in total.")

if __name__ == '__main__':
    fix_all_headers()
