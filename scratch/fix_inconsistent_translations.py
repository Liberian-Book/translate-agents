import os

files_to_fix = [
    # (chapter_dir, file_name, old_text, new_text)
    (
        "chapter-11", 
        "11-1-avoiding-the-field-of-dreams-approach.html", 
        '<h3 class="os-title vn visible" data-type="title"><span class="os-title-label">Doanh nhân hành động</span></h3>', 
        '<h3 class="os-title vn visible" data-type="title"><span class="os-title-label">Doanh nhân thực chiến</span></h3>'
    ),
    (
        "chapter-11", 
        "11-4-the-business-plan.html", 
        '<h3 class="os-title vn visible" data-type="title"><span class="os-title-label">Doanh nhân hành động</span></h3>', 
        '<h3 class="os-title vn visible" data-type="title"><span class="os-title-label">Doanh nhân thực chiến</span></h3>'
    ),
    (
        "chapter-4", 
        "4-2-creativity-innovation-and-invention-how-they-differ.html", 
        '<span class="os-title-label">Doanh nhân hành động</span>', 
        '<span class="os-title-label">Doanh nhân thực chiến</span>'
    ),
    (
        "chapter-6", 
        "6-2-creative-problem-solving-process.html", 
        '<span class="os-title-label">Doanh nhân hành động</span>', 
        '<span class="os-title-label">Doanh nhân thực chiến</span>'
    ),
    (
        "chapter-6", 
        "6-3-design-thinking.html", 
        '<span class="os-title-label">Doanh nhân hành động</span>', 
        '<span class="os-title-label">Doanh nhân thực chiến</span>'
    ),
    (
        "chapter-6", 
        "6-4-lean-processes.html", 
        '<span class="os-title-label">Doanh nhân hành động</span>', 
        '<span class="os-title-label">Doanh nhân thực chiến</span>'
    ),
    (
        "chapter-12", 
        "12-3-designing-a-startup-operational-plan.html", 
        'Doanh nhân đang hành động: Lập kế hoạch nghe có vẻ đơn giản', 
        'Doanh nhân thực chiến: Lập kế hoạch nghe có vẻ đơn giản'
    ),
    (
        "chapter-14", 
        "14-1-types-of-resources.html", 
        '<span class="os-title-label">Doanh nhân trong Hành động</span>', 
        '<span class="os-title-label">Doanh nhân thực chiến</span>'
    ),
]

def apply_fixes():
    print("Applying consistency fixes to translation HTML files...")
    
    for ch, fname, old, new in files_to_fix:
        filepath = f"/Users/anderson/Desktop/entrepreneurship/data/entrepreneurship/{ch}/05-translated/{fname}"
        if not os.path.exists(filepath):
            print(f"Skipping (not found): {filepath}")
            continue
            
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            
        if old in content:
            count = content.count(old)
            new_content = content.replace(old, new)
            
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(new_content)
                
            print(f"Fixed {ch}/{fname}: Replaced {count} occurrence(s) of '{old}' with '{new}'")
        else:
            # Let's double check if it's slightly different (e.g. whitespace)
            # We can do a normalized replace or report if not found.
            print(f"Old string not found in {ch}/{fname}. Checking if it's already fixed or needs inspection.")

if __name__ == '__main__':
    apply_fixes()
