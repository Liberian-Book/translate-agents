import os
import sys
import glob


def quality_gate_status(file_path):
    filename = os.path.basename(file_path).replace('.html', '')
    review_dir = os.path.dirname(file_path).replace('05-translated', '06-reviews')
    candidates = [
        os.path.join(review_dir, f"{filename}-translation-quality-report.md"),
        os.path.join(review_dir, "translation-quality-summary.md"),
        *glob.glob(os.path.join(review_dir, "translation-quality-*-summary.md")),
    ]

    for candidate in candidates:
        if not os.path.exists(candidate):
            continue
        with open(candidate, 'r', encoding='utf-8') as f:
            content = f.read(500)
        if '**Status:** PASS' in content or '**Status:** WAIVED' in content:
            return 'ok', candidate
        return 'fail', candidate
    return 'missing', None


def start_review(file_path):
    status, report = quality_gate_status(file_path)
    if status == 'missing':
        print("⚠️ Chưa tìm thấy translation-quality report PASS/WAIVED. Hãy chạy: python3 agents/agent-review/scripts/translation-quality-check.py <book> <file.html>")
    elif status == 'fail':
        print(f"⚠️ Translation-quality report chưa PASS/WAIVED: {report}")

    filename = os.path.basename(file_path).replace('.html', '')
    review_dir = os.path.dirname(file_path).replace('05-translated', '06-reviews')
    os.makedirs(review_dir, exist_ok=True)
    
    existing_rounds = glob.glob(os.path.join(review_dir, f"{filename}-semantic-review-round-*.md"))
    next_round = len(existing_rounds) + 1
    
    new_review_file = os.path.join(review_dir, f"{filename}-semantic-review-round-{next_round}.md")
    
    if next_round == 1:
        content = f"# Báo cáo Nghiệm thu: {filename}.html (Round 1)\n\n| ID | Thẻ Gốc | Bản dịch hiện tại | Phản biện | Đề xuất sửa | Phản hồi Translate Agent | Trạng thái |\n|---|---|---|---|---|---|---|\n"
    else:
        # Read the previous round to copy unresolved issues
        prev_round_file = os.path.join(review_dir, f"{filename}-semantic-review-round-{next_round-1}.md")
        with open(prev_round_file, 'r', encoding='utf-8') as f:
            prev_content = f.read()
        content = f"# Báo cáo Nghiệm thu: {filename}.html (Round {next_round})\n\n*(Kế thừa từ Round {next_round-1} và thêm lỗi mới)*\n\n{prev_content}"

    with open(new_review_file, 'w', encoding='utf-8') as f:
        f.write(content)
        
    print(f"Đã tạo file review mới: {new_review_file}")

if __name__ == "__main__":
    if len(sys.argv) < 2 or sys.argv[1] in {'--help', '-h'}:
        print("Sử dụng: python3 start-review-round.py <đường dẫn file HTML>")
    else:
        start_review(sys.argv[1])
