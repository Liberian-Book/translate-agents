# Quản lý Tác vụ: Entrepreneurship

Quy trình xử lý: `Plan` ➜ `Scrape` ➜ `Cleanup` ➜ `Analysis` ➜ `Translate` ➜ `Review` ➜ `Archive`

## Phase 1: Lập kế hoạch (Plan)
- [x] **agent-plan**: Khởi tạo file `tasks.md` và thiết lập các tiêu chuẩn QA (`translation-standard.md`, `student-profile.md`).
- [x] **agent-review**: Đọc lại `tasks.md` để đảm bảo các task đã được phân công đủ và đúng cho các Agent.

## Phase 2: Thu thập Dữ liệu (Scrape)
- [x] **agent-scrape**: Tải toàn bộ HTML và hình ảnh gốc từ OpenStax, lưu vào thư mục `data/entrepreneurship/raw/`.
- [x] **agent-review**: Đếm số lượng file trong folder `raw` để đảm bảo đã kéo đủ các chương và không bị thiếu link ảnh.

## Phase 3: Làm sạch Dữ liệu (Cleanup)
- [x] **agent-scrape**: Chạy kỹ năng cleanup xóa thẻ rác (script, style, nav), cập nhật đường dẫn ảnh local, và lưu vào `clean/`.
- [x] **agent-review**: Mở ngẫu nhiên file trong `clean` kiểm tra để đảm bảo HTML chỉ còn nội dung lõi và sạch sẽ 100%.

## Phase 4: Phân tích Dịch thuật (Analysis)
- [x] **agent-analyze**: Đọc HTML sạch để trích xuất `glossary.json` và xuất báo cáo rủi ro `[chapter]-translate-analysis.md`.
- [x] **agent-review**: Kiểm tra `glossary.json` hợp lệ JSON và đọc `translate-analysis.md` xem đã cảnh báo đủ văn hóa, ngữ pháp chưa.

## Phase 5: Dịch thuật (Translate)
- [ ] **agent-translate**: Áp dụng `glossary.json` và `translate-analysis.md` để dịch nội dung file 1, lưu vào `translated/`.
- [ ] **agent-review**: Đối chiếu bản dịch file 1 với nguyên tác theo chuẩn MQM, đảm bảo độ chính xác và văn phong trôi chảy.
- [ ] **agent-translate**: Áp dụng `glossary.json` và `translate-analysis.md` để dịch nội dung file 2, lưu vào `translated/`.
- [ ] **agent-review**: Đối chiếu bản dịch file 2 với nguyên tác theo chuẩn MQM, đảm bảo độ chính xác và văn phong trôi chảy.

## Phase 6: Lưu trữ và Xuất bản (Archive)
- [ ] **agent-archive**: Gộp các bản dịch hoàn chỉnh từ folder `translated` thành định dạng xuất bản (Web/EPUB), lưu vào `archive/`.
- [ ] **agent-review**: Mở file EPUB/Web cuối cùng chạy test layout, font chữ, và hình ảnh trước khi phát hành.
