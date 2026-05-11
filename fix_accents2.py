from bs4 import BeautifulSoup

html_path = 'data/entrepreneurship/chapter-11/05-translated/11-4-the-business-plan.html'
with open(html_path, 'r', encoding='utf-8') as f:
    soup = BeautifulSoup(f, 'html.parser')

eng_elements = soup.find_all(class_=lambda x: x and 'eng' in x.split() and 'hidden' in x.split())
replacements = {
    'café': 'cafe',
}

changed = False
for el in eng_elements:
    for text_node in el.find_all(string=True):
        new_text = text_node
        for old, new in replacements.items():
            if old in new_text:
                new_text = new_text.replace(old, new)
        
        if new_text != text_node:
            text_node.replace_with(new_text)
            changed = True

if changed:
    with open(html_path, 'w', encoding='utf-8') as f:
        f.write(str(soup))
    print("Fixed more accents.")
else:
    print("No accents to fix.")

