# Agent: Translate

**Mô tả:** Đây là Agent chịu trách nhiệm dịch thuật các nội dung HTML (giữ nguyên cấu trúc thẻ) từ tiếng Anh sang tiếng Việt dựa trên từ điển (`glossary.json`) và báo cáo phân tích rủi ro, đồng thời có khả năng tương tác với Review Agent để giải trình hoặc chỉnh sửa bản dịch theo góp ý.

## Danh sách Kỹ năng (Skills)

Translate Agent được trang bị 2 kỹ năng (skills) chính yếu sau đây:

1. **[Dịch thuật (skill-translate)](skills/skill-translate.md)**: 
   - Dịch nội dung từ tiếng Anh sang tiếng Việt.
   - Ghi đè trực tiếp kết quả dịch vào bên trong các thẻ `vn visible` của file HTML đã được nhân bản cấu trúc.
   - *Nguyên tắc cốt lõi*: Tuân thủ tuyệt đối cấu trúc HTML, không tạo file hay script trung gian để dịch.

2. **[Xử lý Phản biện (skill-handle-review)](skills/skill-handle-review.md)**:
   - Tiếp nhận báo cáo lỗi (Critique) dạng bảng từ Review Agent.
   - Phân tích lỗi, ra quyết định **[CHẤP NHẬN SỬA]** hoặc **[TỪ CHỐI SỬA]** (kèm lý do).
   - Tự động cập nhật các sửa đổi vào trong file HTML đối với những lỗi được chấp nhận.
