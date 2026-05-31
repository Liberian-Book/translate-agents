import os
import glob
import re
from bs4 import BeautifulSoup

def search_more_variants():
    html_files = glob.glob('/Users/anderson/Desktop/entrepreneurship/data/entrepreneurship/chapter-*/05-translated/*.html')
    
    pattern = re.compile(r'doanh\s+nhân.*hành\s+động', re.IGNORECASE)
    
    print("Searching for variants of 'Doanh nhân ... hành động' in 05-translated files...")
    for filepath in sorted(html_files):
        chapter = os.path.basename(os.path.dirname(os.path.dirname(filepath)))
        filename = os.path.basename(filepath)
        
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            
        soup = BeautifulSoup(content, 'html.parser')
        
        # Check text in vn elements or general elements
        for tag in soup.find_all(class_='vn'):
            text = tag.get_text()
            if pattern.search(text):
                print(f"{chapter} | {filename} | class={tag.get('class')} | tag={tag.name}")
                print(f"  Text: {text.strip()}")
                print("-" * 40)

if __name__ == '__main__':
    search_more_variants()
