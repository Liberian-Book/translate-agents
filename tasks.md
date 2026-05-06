# Quản lý Tiến độ: Dịch thuật OpenStax Entrepreneurship

*Master Workflow được tuân thủ nghiêm ngặt với nguyên tắc Human-in-the-Loop (HITL).*

---

## 📘 Chương 1: Đã hoàn thành
- [x] **Phase 1 (Scrape & Clean):** Hoàn tất thu thập và làm sạch HTML.
- [x] **Phase 2 (Analyze):** Trích xuất thuật ngữ và thống nhất `glossary.csv` gốc.
- [x] **Phase 3 (Analyze):** Phân tích rủi ro văn hóa, ngữ cảnh.
- [x] **Phase 4 (Translate):** Dịch thuật song ngữ toàn bộ bài học.
- [x] **Phase 5 (Review):** Nghiệm thu và sửa lỗi.

---

## 📘 Chương 2: Đã hoàn thành (QA Passed)
- [x] **Phase 1 (Scrape & Clean):** Tự động xử lý HTML.
- [x] **Phase 2 (Analyze):** Trích xuất và cập nhật `chapter-2-new-glossary.csv`.
- [x] **Phase 3 (Analyze):** Viết báo cáo phân tích rủi ro (đặc biệt xử lý các case Cratejoy, Bootstrapping).
- [x] **Phase 4 (Translate):** Hoàn tất dịch thuật thô toàn bộ thư mục `05-translated`.
- [x] **Phase 5 (Review & QA):** 
  - [x] Chạy Glossary Check tự động.
  - [x] Chạy Semantic Check (Bắt lỗi "quản lý tiền mặt", "đối sánh chuẩn").
  - [x] Translate Agent đã patch (vá) thành công 100% lỗi.

---

## 📘 Chương 3: The Entrepreneurial Mindset (Đang thực hiện 🚀)
- [x] **Phase 1 (Scrape & Clean):** Đã tải và làm sạch HTML.
- [x] **Phase 2 (Analyze):** Đã quét `chapter-3-new-glossary.csv` (Đã xử lý chú thích desc_vi cho *TOMS, Airbnb, Tesla, Bumble...*).
- [x] **Phase 3 (Analyze):** Đã gen toàn bộ `*-translate-analysis.md` định hướng văn phong truyền cảm hứng.
- [x] **Phase 4 (Translate):** **[HOÀN THÀNH]**
  - [x] **agent-translate**: Chạy prep nhân bản thẻ HTML (`eng hidden` / `vn visible`).
  - [x] **agent-translate**: Dịch thuật các file trọng tâm (3.1 đến 3.4).
  - [x] **agent-translate**: Dịch thuật các file phụ trợ (Summary, Key Terms...).
- [x] **Phase 5 (Review & QA):**
  - [x] **agent-review**: Chạy Automated Glossary Check.
  - [x] **agent-review**: Thực hiện Semantic & Risk Check (đối chiếu file Analysis).

---

## 📦 Phase 6: Lưu trữ & Xuất bản (Archive)
- [ ] **agent-archive**: Dọn dẹp thẻ `eng hidden` để xuất bản Web/PDF thuần Việt.
- [ ] **agent-archive**: Build hệ thống Book Reader Navigation.
