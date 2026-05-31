import os
import re
from bs4 import BeautifulSoup

inconsistent_files = [
    ('chapter-11', '11-1-avoiding-the-field-of-dreams-approach.html'),
    ('chapter-11', '11-4-the-business-plan.html'),
    ('chapter-4', '4-2-creativity-innovation-and-invention-how-they-differ.html'),
    ('chapter-6', '6-2-creative-problem-solving-process.html'),
    ('chapter-6', '6-3-design-thinking.html'),
    ('chapter-6', '6-4-lean-processes.html'),
    ('chapter-12', '12-3-designing-a-startup-operational-plan.html'),
    ('chapter-14', '14-1-types-of-resources.html')
]

for ch, f in inconsistent_files:
    filepath = f"/Users/anderson/Desktop/entrepreneurship/data/entrepreneurship/{ch}/05-translated/{f}"
    if not os.path.exists(filepath):
        print(f"File not found: {filepath}")
        continue
        
    with open(filepath, 'r', encoding='utf-8') as file_obj:
        content = file_obj.read()
        
    soup = BeautifulSoup(content, 'html.parser')
    pattern = re.compile(r'entrepreneur\s+in\s+action', re.IGNORECASE)
    
    print(f"=== {ch} / {f} ===")
    
    # Let's find tags containing the pattern
    for tag in soup.find_all():
        if pattern.search(tag.get_text()):
            # only leaf tags
            has_child = False
            for c in tag.find_all():
                if pattern.search(c.get_text()):
                    has_child = True
                    break
            if not has_child:
                print(f"ENG element: {tag}")
                # check siblings/parents for VN translation
                curr = tag
                eng_container = None
                for _ in range(4):
                    if curr and curr.get('class') and ('eng' in curr.get('class') or 'hidden' in curr.get('class')):
                        eng_container = curr
                        break
                    if curr:
                        curr = curr.parent
                if eng_container:
                    sibling = eng_container.find_next_sibling()
                    if sibling:
                        print(f"VN element: {sibling}")
                else:
                    # check vn visible in parent
                    parent = tag.parent
                    if parent:
                        vn_siblings = parent.find_all(class_='vn')
                        print(f"VN siblings: {vn_siblings}")
    print()
