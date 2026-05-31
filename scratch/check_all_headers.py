import os
import glob
import re
from collections import defaultdict
from bs4 import BeautifulSoup

def analyze_all_headers():
    html_files = glob.glob('/Users/anderson/Desktop/entrepreneurship/data/entrepreneurship/chapter-*/05-translated/*.html')
    
    # Structure: eng_text -> dict of (vn_text -> list of (chapter, file))
    header_translations = defaultdict(lambda: defaultdict(list))
    
    print(f"Scanning {len(html_files)} translated files for repeating headers...")
    
    for filepath in sorted(html_files):
        chapter = os.path.basename(os.path.dirname(os.path.dirname(filepath)))
        filename = os.path.basename(filepath)
        
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            
        soup = BeautifulSoup(content, 'html.parser')
        
        # We look for all elements with class 'eng' or parent having class 'eng'
        # Or look for class 'os-title-label'
        # Let's check all elements that have an English hidden tag followed by a Vietnamese visible tag
        all_tags = soup.find_all()
        for tag in all_tags:
            classes = tag.get('class', [])
            if 'eng' in classes:
                # Get the next sibling
                sibling = tag.find_next_sibling()
                if sibling and 'vn' in sibling.get('class', []):
                    # We have a bilingual pair!
                    eng_text = tag.get_text(strip=True)
                    vn_text = sibling.get_text(strip=True)
                    
                    # Clean up spaces
                    eng_text = re.sub(r'\s+', ' ', eng_text)
                    vn_text = re.sub(r'\s+', ' ', vn_text)
                    
                    # Only keep short strings that look like titles/labels (e.g. less than 80 chars, or containing colon)
                    if len(eng_text) < 100:
                        header_translations[eng_text][vn_text].append((chapter, filename))
                        
            # Also check if it's a span with 'os-title-label' or similar
            if 'os-title-label' in classes:
                # Find if there is a vn sibling, or check its parent's vn sibling
                parent = tag.parent
                if parent and 'eng' in parent.get('class', []):
                    parent_sibling = parent.find_next_sibling()
                    if parent_sibling and 'vn' in parent_sibling.get('class', []):
                        # Find same class or tag inside parent_sibling
                        matching_spans = parent_sibling.find_all(class_='os-title-label')
                        if matching_spans:
                            eng_text = tag.get_text(strip=True)
                            vn_text = matching_spans[0].get_text(strip=True)
                            
                            eng_text = re.sub(r'\s+', ' ', eng_text)
                            vn_text = re.sub(r'\s+', ' ', vn_text)
                            
                            if len(eng_text) < 100:
                                header_translations[eng_text][vn_text].append((chapter, filename))

    # Write report
    report = []
    report.append("=================================================================")
    report.append("REPEATING HEADERS & LABELS TRANSLATION REPORT")
    report.append("=================================================================\n")
    
    # We only care about headers that appear more than once (repeating)
    repeating_headers = {}
    for eng, vn_dict in header_translations.items():
        total_occurrences = sum(len(locs) for locs in vn_dict.values())
        if total_occurrences > 1:
            repeating_headers[eng] = (total_occurrences, vn_dict)
            
    # Sort by total occurrences descending
    sorted_headers = sorted(repeating_headers.items(), key=lambda x: x[1][0], reverse=True)
    
    for eng, (total, vn_dict) in sorted_headers:
        report.append(f"ENGLISH HEADER: '{eng}' (Found {total} times)")
        
        is_consistent = len(vn_dict) == 1
        consistency_str = "CONSISTENT" if is_consistent else "⚠️ INCONSISTENT"
        report.append(f"Status: {consistency_str}")
        
        for vn, locs in vn_dict.items():
            report.append(f"  - Translated as: '{vn}' ({len(locs)} times)")
            # list first 3 locations
            loc_samples = ", ".join([f"{ch}/{f}" for ch, f in locs[:3]])
            if len(locs) > 3:
                loc_samples += f" ... and {len(locs)-3} more"
            report.append(f"    Locations: {loc_samples}")
            
        report.append("-" * 65 + "\n")
        
    with open('/Users/anderson/Desktop/entrepreneurship/scratch/all_headers_report.txt', 'w', encoding='utf-8') as rf:
        rf.write('\n'.join(report))
        
    print(f"Report written to /Users/anderson/Desktop/entrepreneurship/scratch/all_headers_report.txt")

if __name__ == '__main__':
    analyze_all_headers()
