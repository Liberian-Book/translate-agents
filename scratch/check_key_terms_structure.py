from bs4 import BeautifulSoup
import re

project_root = "/Users/anderson/Desktop/entrepreneurship"
translated_dir = f"{project_root}/data/entrepreneurship/chapter-3/05-translated"

# 1. Check 3-key-terms.html
print("--- 3-key-terms.html SAMPLE ---")
with open(f"{translated_dir}/3-key-terms.html", "r", encoding="utf-8") as f:
    soup = BeautifulSoup(f.read(), "html.parser")
vn_elements = soup.find_all(class_=lambda x: x and 'vn' in x and 'visible' in x)
print(f"Total vn visible elements: {len(vn_elements)}")
for idx, el in enumerate(vn_elements[:15]):
    print(f"  Tag: {el.name} | Class: {el.get('class')} | Text: {el.get_text(strip=True)[:100]}")

# 2. Check 'tôi' in 3-summary.html
print("\n--- 'tôi' IN 3-summary.html ---")
with open(f"{translated_dir}/3-summary.html", "r", encoding="utf-8") as f:
    soup = BeautifulSoup(f.read(), "html.parser")
vn_elements = soup.find_all(class_=lambda x: x and 'vn' in x and 'visible' in x)
for el in vn_elements:
    text = el.get_text()
    if re.search(r"\btôi\b", text, re.IGNORECASE):
        print(f"Tag: {el.name} | Text: {text.strip()}")

# 3. Check 'tôi' in 3-case-questions.html
print("\n--- 'tôi' IN 3-case-questions.html ---")
with open(f"{translated_dir}/3-case-questions.html", "r", encoding="utf-8") as f:
    soup = BeautifulSoup(f.read(), "html.parser")
vn_elements = soup.find_all(class_=lambda x: x and 'vn' in x and 'visible' in x)
for el in vn_elements:
    text = el.get_text()
    if re.search(r"\btôi\b", text, re.IGNORECASE):
        print(f"Tag: {el.name} | Text: {text.strip()}")
