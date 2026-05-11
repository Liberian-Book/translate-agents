from bs4 import BeautifulSoup

html_path = 'data/entrepreneurship/chapter-11/05-translated/11-4-the-business-plan.html'
with open(html_path, 'r', encoding='utf-8') as f:
    soup = BeautifulSoup(f, 'html.parser')

leaks = []
for eng_el in soup.find_all(class_=lambda x: x and 'eng' in x.split() and 'hidden' in x.split()):
    # Check if any parent is vn visible
    for p in eng_el.parents:
        classes = p.get('class', [])
        if 'vn' in classes and 'visible' in classes:
            leaks.append((eng_el.name, str(eng_el)[:50]))
            break

for leak in leaks:
    print("ENG inside VN:", leak)

