from bs4 import BeautifulSoup
import re

html_path = 'data/entrepreneurship/chapter-11/05-translated/11-4-the-business-plan.html'
with open(html_path, 'r', encoding='utf-8') as f:
    soup = BeautifulSoup(f, 'html.parser')

leaks = 0
eng_elements = soup.find_all(class_=lambda x: x and 'eng' in x.split() and 'hidden' in x.split())
for el in eng_elements:
    text = el.get_text(strip=True)
    match = re.search(r'[àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]', text, re.IGNORECASE)
    if match:
        print(f"Leak found: {text[:50]}... MATCH: '{match.group()}'")
        leaks += 1
        
print("Total leaks:", leaks)

