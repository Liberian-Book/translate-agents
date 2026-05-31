import os
import glob
import re
from bs4 import BeautifulSoup

def find_translations():
    pattern = re.compile(r'entrepreneur\s+in\s+action', re.IGNORECASE)
    html_files = glob.glob('/Users/anderson/Desktop/entrepreneurship/data/entrepreneurship/chapter-*/05-translated/*.html')
    
    output_lines = []
    output_lines.append("Entrepreneur in Action Translations Check\n")
    output_lines.append(f"Found {len(html_files)} translated files. Scanning...\n")
    output_lines.append(f"{'Chapter':<12} | {'File':<55} | {'Tag':<10} | {'ENG Text':<50} | {'VN Text':<50} | {'Status'}")
    output_lines.append("-" * 200)
    
    for filepath in sorted(html_files):
        chapter_dir = os.path.basename(os.path.dirname(os.path.dirname(filepath)))
        filename = os.path.basename(filepath)
        
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            
        soup = BeautifulSoup(content, 'html.parser')
        
        # We want to find occurrences of "Entrepreneur in Action"
        # We can look for text nodes or tags containing it
        all_tags = soup.find_all()
        for tag in all_tags:
            # We check tags that contain the phrase, but exclude their parent tags if a child matches
            tag_text = tag.get_text()
            if pattern.search(tag_text):
                has_child_match = False
                for child in tag.find_all():
                    if pattern.search(child.get_text()):
                        has_child_match = True
                        break
                if has_child_match:
                    continue
                
                # Check translation of this tag
                vn_text = "N/A"
                status = "Untranslated"
                
                # Check if tag itself or any of its parents has 'eng' / 'hidden'
                curr = tag
                eng_container = None
                for _ in range(4): # check up to 4 levels up
                    if curr and curr.get('class') and ('eng' in curr.get('class') or 'hidden' in curr.get('class')):
                        eng_container = curr
                        break
                    if curr:
                        curr = curr.parent
                        
                if eng_container:
                    # Let's find the corresponding vn/visible container.
                    # It's usually the next sibling of eng_container or of a parent of eng_container.
                    # Let's search for a sibling that has class 'vn' or 'visible'
                    sibling = eng_container.find_next_sibling()
                    if sibling and sibling.get('class') and ('vn' in sibling.get('class') or 'visible' in sibling.get('class')):
                        # Found it! Let's find the matching tag inside it.
                        # If tag itself is the eng_container, the translation is the sibling itself
                        if tag == eng_container:
                            vn_text = sibling.get_text(strip=True)
                            status = "Translated (bilingual block container)"
                        else:
                            # Let's find an element with same tag name and similar path or classes
                            # Let's just find the same tag name at same index or just get the text if there's only one such tag.
                            matching_tags = sibling.find_all(tag.name)
                            if len(matching_tags) == 1:
                                vn_text = matching_tags[0].get_text(strip=True)
                                status = "Translated (exact matching sibling tag)"
                            elif len(matching_tags) > 1:
                                # try to match by class or index
                                vn_text = " / ".join([m.get_text(strip=True) for m in matching_tags])
                                status = "Translated (multiple candidate tags)"
                            else:
                                vn_text = sibling.get_text(strip=True)
                                status = "Translated (fallback to sibling text)"
                else:
                    # No eng/hidden container found on tag or its ancestors.
                    # Let's check if the tag itself is translated or if it is just a plain English text node.
                    # Let's see if there's any VN text in the parent container
                    parent = tag.parent
                    if parent:
                        vn_elements = parent.find_all(class_='vn')
                        if vn_elements:
                            vn_text = " / ".join([v.get_text(strip=True) for v in vn_elements])
                            status = "Translated (VN elements in parent)"
                
                eng_text_cleaned = tag.get_text(strip=True).replace('\n', ' ')
                vn_text_cleaned = vn_text.replace('\n', ' ')
                
                # Truncate for table display
                if len(eng_text_cleaned) > 48:
                    eng_text_cleaned = eng_text_cleaned[:45] + "..."
                if len(vn_text_cleaned) > 48:
                    vn_text_cleaned = vn_text_cleaned[:45] + "..."
                
                output_lines.append(f"{chapter_dir:<12} | {filename:<55} | {tag.name:<10} | {eng_text_cleaned:<50} | {vn_text_cleaned:<50} | {status}")
                
    with open('/Users/anderson/Desktop/entrepreneurship/scratch/check_results.txt', 'w', encoding='utf-8') as out_f:
        out_f.write('\n'.join(output_lines))
    print("Done. Wrote results to /Users/anderson/Desktop/entrepreneurship/scratch/check_results.txt")

if __name__ == '__main__':
    find_translations()
