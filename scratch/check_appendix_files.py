import os
import re
from bs4 import BeautifulSoup

project_root = "/Users/anderson/Desktop/entrepreneurship"
translated_dir = os.path.join(project_root, "data/entrepreneurship/chapter-3/05-translated")

files = [
    "3-introduction.html",
    "3-summary.html",
    "3-key-terms.html",
    "3-review-questions.html",
    "3-discussion-questions.html",
    "3-case-questions.html",
    "3-suggested-resources.html"
]

print("--- SCANNING APPENDIX FILES ---")

for filename in files:
    file_path = os.path.join(translated_dir, filename)
    if not os.path.exists(file_path):
        print(f"File {filename} does not exist!")
        continue
        
    with open(file_path, "r", encoding="utf-8") as f:
        soup = BeautifulSoup(f.read(), "html.parser")
        
    vn_elements = soup.find_all(class_=lambda x: x and 'vn' in x and 'visible' in x)
    
    print(f"\n==================================================")
    print(f"FILE: {filename}")
    print(f"==================================================")
    
    # 1. Pronoun check
    pronoun_counts = {"tôi": 0, "chúng tôi": 0, "bạn": 0, "chúng ta": 0}
    for el in vn_elements:
        text = el.get_text().lower()
        for p in pronoun_counts:
            matches = re.findall(rf"\b{p}\b", text)
            pronoun_counts[p] += len(matches)
            
    print(f"Pronoun counts: {pronoun_counts}")
    
    # 2. Check for untranslated keywords
    untranslated_keywords = ["Link to Learning", "Work It Out", "Entrepreneur in Action", "Entrepreneurship in Action"]
    for el in vn_elements:
        text = el.get_text()
        for kw in untranslated_keywords:
            if kw in text:
                print(f"  WARNING: Untranslated keyword '{kw}' found in <{el.name} id='{el.get('id')}'>: {text.strip()[:100]}")
                
    # 3. Print samples
    print("\nFluency samples:")
    sample_count = 0
    # Try to find p, li, or h3 elements to sample
    for el in vn_elements:
        if el.name in ["p", "li", "h3", "h4"]:
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
            
            eng_text = eng_el.get_text(strip=True) if eng_el else ""
            vn_text = el.get_text(strip=True)
            print(f"  [{el.name}] ENG: {eng_text[:120]}...")
            print(f"  [{el.name}] VN : {vn_text[:120]}...")
            print("-" * 50)
            sample_count += 1
            if sample_count >= 3:
                break
