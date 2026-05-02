# Quản lý Tiến độ: Dịch thuật Chương 1 (Entrepreneurship)

## Phase 1: Thu thập & Làm sạch dữ liệu (Data Preparation)
- [x] **agent-scrape**: Chạy lệnh thu thập toàn bộ HTML của Chương 1 từ website OpenStax và lưu vào `data/entrepreneurship/raw/`.
- [x] **agent-scrape**: Chạy `skill-cleanup` làm sạch HTML, tải ảnh offline và lưu vào `data/entrepreneurship/clean/`.
- [x] **agent-review**: (HITL) Đọc ngẫu nhiên HTML trong thư mục `clean` để nghiệm thu định dạng, kiểm tra CSS rác và hiển thị hình ảnh.

## Phase 2: Khởi tạo Hành trang Dịch (Term Extraction)
- [x] **agent-analyze**: Chạy `skill-term-extraction` để quét toàn bộ file HTML `clean` và tạo file `glossary.json`.
- [ ] **agent-review**: (HITL) Đọc file `glossary.json`, thống nhất phương án dịch tiếng Việt cho các từ khóa cốt lõi và chốt bảng thuật ngữ.

## Phase 3: Phân tích Rủi ro Văn hóa & Ngữ cảnh
- [x] **agent-analyze**: Đọc và viết báo cáo phân tích rủi ro dịch thuật `1-1-translate-analysis.md`.
- [ ] **agent-analyze**: Đọc và viết báo cáo phân tích rủi ro dịch thuật `1-2-translate-analysis.md`.
- [ ] **agent-analyze**: Đọc và viết báo cáo phân tích rủi ro dịch thuật `1-3-translate-analysis.md`.
- [ ] **agent-review**: (HITL) Ghi chú và phê duyệt các giải pháp xử lý văn hóa, giọng điệu trong các báo cáo Analysis để định hướng cho Translate Agent.

## Phase 4: Dịch thuật Song ngữ (Bilingual Translation)
- [x] **agent-translate**: Chạy `skill-prep-translation` nhân bản các thẻ HTML thành cấu trúc song ngữ (eng hidden / vn visible) vào thư mục `translated/`.
- [ ] **agent-translate**: Dựa trên `glossary.json` + `analysis`, dịch nội dung thẻ `vn visible` của file `1-1-entrepreneurship-today.html`.
- [ ] **agent-review**: (HITL) Đánh giá chất lượng bản dịch và cấu trúc thẻ của file `1-1-entrepreneurship-today.html`.
- [ ] **agent-translate**: Dựa trên `glossary.json` + `analysis`, dịch nội dung thẻ `vn visible` của file `1-2-entrepreneurial-vision-and-goals.html`.
- [ ] **agent-review**: (HITL) Đánh giá chất lượng bản dịch và cấu trúc thẻ của file `1-2-entrepreneurial-vision-and-goals.html`.
- [ ] **agent-translate**: Dựa trên `glossary.json` + `analysis`, dịch nội dung thẻ `vn visible` của file `1-3-the-entrepreneurial-mindset.html`.
- [ ] **agent-review**: (HITL) Đánh giá chất lượng bản dịch và cấu trúc thẻ của file `1-3-the-entrepreneurial-mindset.html`.
- [ ] **agent-translate**: Xử lý dịch hàng loạt các file phụ trợ (Summary, Key Terms, Review Questions...).
- [ ] **agent-review**: (HITL) Đánh giá chất lượng bản dịch các file phụ trợ.

## Phase 5: Nghiệm thu (Review & QA)
- [ ] **agent-review**: Chạy lệnh quét tự động (Automated QA) các file HTML đã dịch xem có vỡ cấu trúc thẻ HTML hay vi phạm thuật ngữ glossary không.
- [ ] **agent-review**: Áp dụng `review-template.md` để khởi tạo báo cáo nghiệm thu các lỗi dịch thuật (Critique).
- [ ] **agent-review**: (HITL) Mở trình duyệt Web (chạy bunx serve) đọc thử file hoàn chỉnh và chốt nghiệm thu cuối cùng.

## Phase 6: Lưu trữ & Xuất bản (Archive)
- [ ] **agent-archive**: Hợp nhất các file HTML của Chương 1 thành cấu trúc nối tiếp.
- [ ] **agent-archive**: Dọn dẹp thẻ `eng hidden` (để tạo bản tiếng Việt thuần) và lưu trữ vào `data/entrepreneurship/archive/`.
