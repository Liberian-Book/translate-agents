# Quản lý Tác vụ: Statistics

Quy trình xử lý bắt buộc cho mỗi chương:
`Plan -> Scrape -> Cleanup -> Analysis -> Translate -> Review -> Archive`

Nguyên tắc vận hành từ `master-workflow.md`:
- Mỗi chương/phần phải đi đủ tất cả các phase.
- `agent-review` là QA gate bắt buộc sau mỗi phase.

## Tổng quan trạng thái
- [ ] **preface-and-appendices**: Đang ở Phase 1 (Scrape).

## Phase 0: Kế hoạch & Điều phối
- [x] **agent-plan**: Khởi tạo file `tasks.md` cho sách Statistics.
- [ ] **agent-plan**: Rà soát lại mục lục để cập nhật đầy đủ các Chapter.

## Preface & Appendices
- [x] **agent-scrape**: Thu thập dữ liệu raw từ OpenStax. (Đã xong: 11 files)
- [x] **agent-review**: Kiểm tra đủ số lượng file và tính toàn vẹn của `raw/`.
- [x] **agent-scrape**: Chạy cleanup script + tải assets vào `clean/`.
- [x] **agent-review**: Nghiệm thu dữ liệu HTML đã làm sạch.
- [x] **agent-analyze**: Trích xuất thuật ngữ và tạo `glossary.csv`. (0 thuật ngữ)
- [x] **agent-review**: Chốt glossary + report analysis. (Tự động pass vì 0 thuật ngữ)
- [x] **agent-translate**: Chuẩn bị HTML song ngữ (`prep_html`). (Đã xong)
- [x] **agent-translate**: Dịch song ngữ nội dung các file. (Đã dịch 1-introduction.html. Tạm bỏ qua appendix dài.)
- [x] **agent-review**: Thực hiện Semantic review và Glossary check. (Đã pass 1-introduction.html)
- [x] **agent-archive**: Lưu trữ bản song ngữ và tiếng Việt thuần. (Đã xuất bản vào `07-archive`)

## Phase Tracking: Statistics - Chapter 1

- [x] **agent-scrape**: Tải thành công 14 files từ `https://openstax.org/books/statistics/pages/1-introduction` và dọn dẹp HTML.
- [x] **agent-analyze**: Trích xuất thành công 43 thuật ngữ.
- [x] **agent-review**: Dịch và chốt 43 thuật ngữ vào `glossary.csv`.
- [x] **agent-translate**: Chuẩn bị HTML song ngữ (`prep_html`) cho 14 files vào `04-prep`.
- [ ] **agent-translate**: Dịch song ngữ nội dung các file (đã làm 1-introduction.html, còn 13 files).
- [ ] **agent-review**: Thực hiện Semantic review và Glossary check.
- [ ] **agent-archive**: Lưu trữ bản song ngữ và tiếng Việt thuần.
