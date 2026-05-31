# Skill: Export HTML → DOCX

## Mục đích

Xuất các file HTML song ngữ (Anh-Việt) trong thư mục `05-translated` sang file `.docx` để gửi cho đội ngũ biên tập.

## Quy tắc xử lý

1. **Chỉ giữ tiếng Việt**: Xóa toàn bộ phần tử có class `eng hidden`.
2. **Giữ nguyên cấu trúc**: Headings, tables, lists, figures, notes — tất cả đều được chuyển sang DOCX.
3. **Nhúng ảnh**: Ảnh từ thư mục `assets` được nhúng trực tiếp vào DOCX dưới dạng base64.
4. **Font**: Times New Roman 12pt — phù hợp cho biên tập sách.
5. **Thứ tự sections**: Introduction → Numbered sections → Summary → Key Terms → Review Questions → ...

## Lệnh chạy

```bash
# Cài dependency (lần đầu)
npm install html-to-docx

# Xuất 1 file
node agents/agent-export/scripts/export-docx.js data/entrepreneurship/chapter-7/05-translated/7-introduction.html

# Xuất 1 chapter (gộp thành 1 DOCX)
node agents/agent-export/scripts/export-docx.js 7

# Xuất toàn bộ sách
node agents/agent-export/scripts/export-docx.js all

# Chỉ định book khác
node agents/agent-export/scripts/export-docx.js 7 statistics
```

## Output

- Thư mục output: `data/<bookName>/docx/`
- Chapter: `chapter-7.docx` (gộp tất cả sections)
- File đơn: `7-introduction.docx`

## Lưu ý

- Script sử dụng CommonJS (`require`) để tương thích với các script khác trong repo.
- `html-to-docx` là package ESM-only nên được load bằng `await import()`.
- Ảnh `.webp` có thể không hiển thị đúng trong một số phiên bản Word cũ. Nếu gặp vấn đề, cần convert sang PNG trước.
