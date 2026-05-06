import os
import sys
import re

def parse_markdown_table(file_path):
    # Trả về danh sách các hàng trong bảng
    rows = []
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
        
    in_table = False
    for i, line in enumerate(lines):
        if line.strip().startswith('| ID |') or line.strip().startswith('|---|'):
            in_table = True
            continue
        if in_table and line.strip().startswith('|'):
            # Parse row
            cols = [col.strip() for col in line.split('|')][1:-1] # Bỏ cột rỗng đầu cuối
            if len(cols) >= 7:
                rows.append({
                    'line_num': i,
                    'id': cols[0],
                    'original': cols[1].strip('`'),
                    'current': cols[2].strip('`'),
                    'critique': cols[3],
                    'suggestion': cols[4].strip('`'),
                    'response': cols[5],
                    'status': cols[6]
                })
        elif in_table and not line.strip():
            in_table = False
            
    return rows, lines

def apply_fixes(review_path, html_path):
    if not os.path.exists(review_path):
        print(f"❌ Không tìm thấy file review: {review_path}")
        return
    if not os.path.exists(html_path):
        print(f"❌ Không tìm thấy file HTML: {html_path}")
        return

    # 1. Parse review file
    rows, md_lines = parse_markdown_table(review_path)
    
    # 2. Read HTML
    with open(html_path, 'r', encoding='utf-8') as f:
        html_content = f.read()

    changes_made = 0
    # 3. Apply fixes
    for row in rows:
        if row['status'].lower() in ['mới', 'yêu cầu sửa lại']:
            current_text = row['current']
            suggestion_text = row['suggestion']
            
            # Chỉ thay thế nếu tìm thấy đoạn text current trong HTML
            if current_text in html_content and suggestion_text:
                html_content = html_content.replace(current_text, suggestion_text)
                
                # Cập nhật markdown line
                line_idx = row['line_num']
                old_line = md_lines[line_idx]
                
                # Cập nhật cột response và status
                parts = old_line.split('|')
                if len(parts) >= 8:
                    parts[-3] = ' Đồng ý, đã sửa theo đề xuất. ' # Response
                    parts[-2] = ' Đã sửa ' # Status
                    md_lines[line_idx] = '|'.join(parts)
                    changes_made += 1
            else:
                print(f"⚠️ Cảnh báo: Không tìm thấy đoạn text '{current_text}' của lỗi {row['id']} trong HTML, hoặc thiếu đề xuất.")

    if changes_made > 0:
        # Save HTML
        with open(html_path, 'w', encoding='utf-8') as f:
            f.write(html_content)
        
        # Save MD
        with open(review_path, 'w', encoding='utf-8') as f:
            f.writelines(md_lines)
            
        print(f"✅ Đã áp dụng {changes_made} bản vá vào {os.path.basename(html_path)}")
        print(f"✅ Đã cập nhật trạng thái trong {os.path.basename(review_path)}")
    else:
        print("ℹ️ Không có lỗi mới nào cần sửa hoặc không thể khớp text.")

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Sử dụng: python3 apply-review-fixes.py <đường-dẫn-file-review.md> <đường-dẫn-file-html>")
    else:
        apply_fixes(sys.argv[1], sys.argv[2])
