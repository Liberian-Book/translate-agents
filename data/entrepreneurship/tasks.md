# Quan ly Tac vu: Entrepreneurship

Quy trinh xu ly bat buoc cho moi chuong:
`Plan -> Scrape -> Cleanup -> Analysis -> Translate -> Review -> Archive`

Nguyen tac van hanh tu `master-workflow.md`:
- Moi chuong tu Chapter 4 tro di phai di du tat ca phase, khong duoc bo phase nao.
- `agent-review` la QA gate bat buoc sau moi phase quan trong.
- Neu da ton tai file `translated/` duoc dung tam theo cach reconstruct tu web, van phai backfill lai cac phase truoc neu phase do chua duoc ghi nhan/chua dat.

## Tong quan trang thai
- [x] **chapter-1**: Da hoan thanh den het phase archive, da co ban song ngu va ban tieng Viet thuan trong `archive/`.
- [x] **chapter-2**: Da hoan thanh den het phase archive, da co ban song ngu va ban tieng Viet thuan trong `archive/`.
- [x] **chapter-3**: Da hoan thanh den het phase archive, da co ban song ngu va ban tieng Viet thuan trong `archive/`.
- [x] **chapter-4**: Da hoan thanh den het phase archive, da co ban song ngu va ban tieng Viet thuan trong `archive/`.
- [x] **chapter-5**: Da hoan thanh den het phase archive, da co ban song ngu va ban tieng Viet thuan trong `archive/`.
- [x] **chapter-6**: Da hoan thanh den het phase archive, da co ban song ngu va ban tieng Viet thuan trong `archive/`.
- [x] **chapter-7**: Da hoan thanh den het phase archive, da co ban song ngu va ban tieng Viet thuan trong `archive/`.
- [x] **chapter-8**: Da hoan thanh den het phase archive, da co ban song ngu va ban tieng Viet thuan trong `archive/`.
- [x] **chapter-9**: Da hoan thanh den het phase archive, da co ban song ngu va ban tieng Viet thuan trong `archive/`.
- [x] **chapter-10**: Da hoan thanh den het phase archive, da co ban song ngu va ban tieng Viet thuan trong `archive/`.
- [x] **chapter-11**: Da hoan thanh den het phase archive, da co ban song ngu va ban tieng Viet thuan trong `archive/`.
- [x] **chapter-12**: Da hoan thanh den het phase archive, da co ban song ngu va ban tieng Viet thuan trong `archive/`.
- [x] **chapter-13**: Da hoan thanh den het phase archive, da co ban song ngu va ban tieng Viet thuan trong `archive/`.
- [x] **chapter-14**: Da hoan thanh den het phase archive, da co ban song ngu va ban tieng Viet thuan trong `archive/`.

## Phase 0: Lien chuong / Dieu phoi
- [x] **agent-plan**: Xac nhan Chapter 1-3 da di dung workflow va chot lai cac bao cao review hien co.
- [ ] **agent-plan**: Lap ke hoach full-book cho Chapter 4-14, bao dam moi chuong co du `scrape -> cleanup -> analysis -> translate -> review -> archive`.
- [ ] **agent-review**: Duyet lai `tasks.md` sau moi lan cap nhat de dam bao khong chuong nao bi bo phase.

## Chapter 3
- [x] **agent-scrape**: Thu thập toàn bộ `chapter-3` vào `01-raw/` (10 files).
- [x] **agent-scrape**: Cleanup + asset cho `02-clean/`. ⚠️ File 3-2 và 3-3 ban đầu bị lỗi SVG loader.
- [x] **agent-scrape**: Re-scrape + cleanup 3-2 và 3-3 (2026-05-09). Clean data đã đầy đủ (293 + 276 dòng).
- [x] **agent-analyze**: Trích xuất thuật ngữ → `03-analyzed/chapter-3-new-glossary.csv` (142 thuật ngữ, 19 đã có trong glossary, 1 proposal CSR).
- [x] **agent-analyze**: 10 file analysis reports trong `03-analyzed/`.
- [x] **agent-translate**: Dịch nội dung thẻ vn visible của 10 file HTML trong `05-translated/`.
- [x] **agent-review**: Glossary check: 13/13 = 100%.
- [x] **agent-review**: Semantic review 3-1 (Round 1→2→3): 10 issues, tất cả đã sửa.
- [x] **agent-review**: Semantic review 3-2 (Round 1→2→3): img src CDN → local asset đã sửa.
- [x] **agent-review**: Semantic review 3-3 (Round 1→2→3): img src CDN + thuật ngữ `khởi nghiệp vi mô` đã sửa.
- [x] **agent-review**: Semantic review 7 file phụ (Round 1→2): tất cả hoàn thành.
- [x] **agent-review**: `chapter-3-review.md` — 6 issues, tất cả Chấp nhận.
- [x] **agent-archive**: Archive Chapter 3: `07-archive/bilingual/` (10 files), `07-archive/vn/` (10 files), `07-archive/assets/`.
- [x] **agent-review**: Kiểm layout/final: bilingual eng=vn cân bằng (83+82+82+...), VN-only 0 eng leak.

## Chapter 4
- [x] **agent-scrape**: Thu thập toàn bộ `chapter-4` vào `raw/`.
- [x] **agent-review**: Kiểm đủ page và tính toàn vẹn của `raw/`.
- [x] **agent-scrape**: Cleanup + asset cho `clean/`.
- [x] **agent-review**: Nghiệm thu data sạch của Chapter 4.
- [x] **agent-analyze**: Đọc HTML sạch để trích xuất thuật ngữ và xuất báo cáo rủi ro.
- [x] **agent-review**: Chốt glossary + report analysis Chapter 4.
- [x] **agent-translate**: Dịch nội dung thẻ vn visible của file `4-1-tools-for-creativity-and-innovation.html`.
- [x] **agent-review**: Đánh giá chất lượng bản dịch file `4-1-tools-for-creativity-and-innovation.html`.
- [x] **agent-translate**: Dịch nội dung thẻ vn visible của file `4-2-creativity-innovation-and-invention-how-they-differ.html`.
- [x] **agent-review**: Đánh giá chất lượng bản dịch file `4-2-creativity-innovation-and-invention-how-they-differ.html`.
- [x] **agent-translate**: Dịch nội dung thẻ vn visible của file `4-3-developing-ideas-innovations-and-inventions.html`.
- [x] **agent-review**: Đánh giá chất lượng bản dịch file `4-3-developing-ideas-innovations-and-inventions.html`.
- [x] **agent-translate**: Dịch nội dung thẻ vn visible của file `4-case-questions.html`.
- [x] **agent-review**: Đánh giá chất lượng bản dịch file `4-case-questions.html`.
- [x] **agent-translate**: Dịch nội dung thẻ vn visible của file `4-discussion-questions.html`.
- [x] **agent-review**: Đánh giá chất lượng bản dịch file `4-discussion-questions.html`.
- [x] **agent-translate**: Dịch nội dung thẻ vn visible của file `4-introduction.html`.
- [x] **agent-review**: Đánh giá chất lượng bản dịch file `4-introduction.html`.
- [x] **agent-translate**: Dịch nội dung thẻ vn visible của file `4-key-terms.html`.
- [x] **agent-review**: Đánh giá chất lượng bản dịch file `4-key-terms.html`.
- [x] **agent-translate**: Dịch nội dung thẻ vn visible của file `4-review-questions.html`.
- [x] **agent-review**: Đánh giá chất lượng bản dịch file `4-review-questions.html`.
- [x] **agent-translate**: Dịch nội dung thẻ vn visible của file `4-suggested-resources.html`.
- [x] **agent-review**: Đánh giá chất lượng bản dịch file `4-suggested-resources.html`.
- [x] **agent-translate**: Dịch nội dung thẻ vn visible của file `4-summary.html`.
- [x] **agent-review**: Đánh giá chất lượng bản dịch file `4-summary.html`.
- [ ] **agent-archive**: Archive Chapter 4.
- [ ] **agent-review**: Kiểm layout/final approval Chapter 4.

## Chapter 5
- [x] **agent-scrape**: Thu thập toàn bộ `chapter-5` vào `raw/`.
- [x] **agent-review**: Kiểm đủ page và tính toàn vẹn của `raw/`.
- [x] **agent-scrape**: Cleanup + asset cho `clean/`.
- [x] **agent-review**: Nghiệm thu data sạch của Chapter 5.
- [x] **agent-analyze**: Đọc HTML sạch để trích xuất thuật ngữ và xuất báo cáo rủi ro.
- [x] **agent-review**: Chốt glossary + report analysis Chapter 5.
- [x] **agent-translate**: Dịch nội dung thẻ vn visible của file `5-1-entrepreneurial-opportunity.html`.
- [x] **agent-review**: Đánh giá chất lượng bản dịch file `5-1-entrepreneurial-opportunity.html`.
- [x] **agent-translate**: Dịch nội dung thẻ vn visible của file `5-2-researching-potential-business-opportunities.html`.
- [x] **agent-review**: Đánh giá chất lượng bản dịch file `5-2-researching-potential-business-opportunities.html`.
- [x] **agent-translate**: Dịch nội dung thẻ vn visible của file `5-3-competitive-analysis.html`.
- [x] **agent-review**: Đánh giá chất lượng bản dịch file `5-3-competitive-analysis.html`.
- [x] **agent-translate**: Dịch nội dung thẻ vn visible của file `5-case-questions.html`.
- [x] **agent-review**: Đánh giá chất lượng bản dịch file `5-case-questions.html`.
- [x] **agent-translate**: Dịch nội dung thẻ vn visible của file `5-discussion-questions.html`.
- [x] **agent-review**: Đánh giá chất lượng bản dịch file `5-discussion-questions.html`.
- [x] **agent-translate**: Dịch nội dung thẻ vn visible của file `5-introduction.html`.
- [x] **agent-review**: Đánh giá chất lượng bản dịch file `5-introduction.html`.
- [x] **agent-translate**: Dịch nội dung thẻ vn visible của file `5-key-terms.html`.
- [x] **agent-review**: Đánh giá chất lượng bản dịch file `5-key-terms.html`.
- [x] **agent-translate**: Dịch nội dung thẻ vn visible của file `5-review-questions.html`.
- [x] **agent-review**: Đánh giá chất lượng bản dịch file `5-review-questions.html`.
- [x] **agent-translate**: Dịch nội dung thẻ vn visible của file `5-suggested-resources.html`.
- [x] **agent-review**: Đánh giá chất lượng bản dịch file `5-suggested-resources.html`.
- [x] **agent-translate**: Dịch nội dung thẻ vn visible của file `5-summary.html`.
- [x] **agent-review**: Đánh giá chất lượng bản dịch file `5-summary.html`.
- [ ] **agent-archive**: Archive Chapter 5.
- [ ] **agent-review**: Kiểm layout/final approval Chapter 5.

## Chapter 6
- [x] **agent-scrape**: Thu thập toàn bộ `chapter-6` vào `raw/`.
- [x] **agent-review**: Kiểm đủ page và tính toàn vẹn của `raw/`.
- [x] **agent-scrape**: Cleanup + asset cho `clean/`.
- [x] **agent-review**: Nghiệm thu data sạch của Chapter 6.
- [x] **agent-analyze**: Đọc HTML sạch để trích xuất thuật ngữ và xuất báo cáo rủi ro.
- [x] **agent-review**: Chốt glossary + report analysis Chapter 6.
- [x] **agent-translate**: Dịch nội dung thẻ vn visible của file `6-1-problem-solving-to-find-entrepreneurial-solutions.html`.
- [x] **agent-review**: Đánh giá chất lượng bản dịch file `6-1-problem-solving-to-find-entrepreneurial-solutions.html`.
- [x] **agent-translate**: Dịch nội dung thẻ vn visible của file `6-2-creative-problem-solving-process.html`.
- [x] **agent-review**: Đánh giá chất lượng bản dịch file `6-2-creative-problem-solving-process.html`.
- [x] **agent-translate**: Dịch nội dung thẻ vn visible của file `6-3-design-thinking.html`.
- [x] **agent-review**: Đánh giá chất lượng bản dịch file `6-3-design-thinking.html`.
- [x] **agent-translate**: Dịch nội dung thẻ vn visible của file `6-4-lean-processes.html`.
- [x] **agent-review**: Đánh giá chất lượng bản dịch file `6-4-lean-processes.html`.
- [x] **agent-translate**: Dịch nội dung thẻ vn visible của file `6-case-questions.html`.
- [x] **agent-review**: Đánh giá chất lượng bản dịch file `6-case-questions.html`.
- [x] **agent-translate**: Dịch nội dung thẻ vn visible của file `6-discussion-questions.html`.
- [x] **agent-review**: Đánh giá chất lượng bản dịch file `6-discussion-questions.html`.
- [x] **agent-translate**: Dịch nội dung thẻ vn visible của file `6-introduction.html`.
- [x] **agent-review**: Đánh giá chất lượng bản dịch file `6-introduction.html`.
- [x] **agent-translate**: Dịch nội dung thẻ vn visible của file `6-key-terms.html`.
- [x] **agent-review**: Đánh giá chất lượng bản dịch file `6-key-terms.html`.
- [x] **agent-translate**: Dịch nội dung thẻ vn visible của file `6-review-questions.html`.
- [x] **agent-review**: Đánh giá chất lượng bản dịch file `6-review-questions.html`.
- [x] **agent-translate**: Dịch nội dung thẻ vn visible của file `6-suggested-resources.html`.
- [x] **agent-review**: Đánh giá chất lượng bản dịch file `6-suggested-resources.html`.
- [x] **agent-translate**: Dịch nội dung thẻ vn visible của file `6-summary.html`.
- [x] **agent-review**: Đánh giá chất lượng bản dịch file `6-summary.html`.
- [ ] **agent-archive**: Archive Chapter 6.
- [ ] **agent-review**: Kiểm layout/final approval Chapter 6.

## Chapter 7
- [x] **agent-scrape**: Thu thập toàn bộ `chapter-7` vào `raw/`.
- [x] **agent-review**: Kiểm đủ page và tính toàn vẹn của `raw/`.
- [x] **agent-scrape**: Cleanup + asset cho `clean/`.
- [x] **agent-review**: Nghiệm thu data sạch của Chapter 7.
- [x] **agent-analyze**: Đọc HTML sạch để trích xuất thuật ngữ và xuất báo cáo rủi ro.
- [x] **agent-review**: Chốt glossary + report analysis Chapter 7.
- [ ] **agent-translate**: Dịch nội dung thẻ vn visible của file `7-1-clarifying-your-vision-mission-and-goals.html`.
- [ ] **agent-review**: Đánh giá chất lượng bản dịch file `7-1-clarifying-your-vision-mission-and-goals.html`.
- [ ] **agent-translate**: Dịch nội dung thẻ vn visible của file `7-2-sharing-your-entrepreneurial-story.html`.
- [ ] **agent-review**: Đánh giá chất lượng bản dịch file `7-2-sharing-your-entrepreneurial-story.html`.
- [ ] **agent-translate**: Dịch nội dung thẻ vn visible của file `7-3-developing-pitches-for-various-audiences-and-goals.html`.
- [ ] **agent-review**: Đánh giá chất lượng bản dịch file `7-3-developing-pitches-for-various-audiences-and-goals.html`.
- [ ] **agent-translate**: Dịch nội dung thẻ vn visible của file `7-4-protecting-your-idea-and-polishing-the-pitch-through-feedback.html`.
- [ ] **agent-review**: Đánh giá chất lượng bản dịch file `7-4-protecting-your-idea-and-polishing-the-pitch-through-feedback.html`.
- [ ] **agent-translate**: Dịch nội dung thẻ vn visible của file `7-5-reality-check-contests-and-competitions.html`.
- [ ] **agent-review**: Đánh giá chất lượng bản dịch file `7-5-reality-check-contests-and-competitions.html`.
- [ ] **agent-translate**: Dịch nội dung thẻ vn visible của file `7-case-questions.html`.
- [ ] **agent-review**: Đánh giá chất lượng bản dịch file `7-case-questions.html`.
- [ ] **agent-translate**: Dịch nội dung thẻ vn visible của file `7-discussion-questions.html`.
- [ ] **agent-review**: Đánh giá chất lượng bản dịch file `7-discussion-questions.html`.
- [ ] **agent-translate**: Dịch nội dung thẻ vn visible của file `7-introduction.html`.
- [ ] **agent-review**: Đánh giá chất lượng bản dịch file `7-introduction.html`.
- [ ] **agent-translate**: Dịch nội dung thẻ vn visible của file `7-key-terms.html`.
- [ ] **agent-review**: Đánh giá chất lượng bản dịch file `7-key-terms.html`.
- [ ] **agent-translate**: Dịch nội dung thẻ vn visible của file `7-review-questions.html`.
- [ ] **agent-review**: Đánh giá chất lượng bản dịch file `7-review-questions.html`.
- [ ] **agent-translate**: Dịch nội dung thẻ vn visible của file `7-suggested-resources.html`.
- [ ] **agent-review**: Đánh giá chất lượng bản dịch file `7-suggested-resources.html`.
- [ ] **agent-translate**: Dịch nội dung thẻ vn visible của file `7-summary.html`.
- [ ] **agent-review**: Đánh giá chất lượng bản dịch file `7-summary.html`.
- [ ] **agent-archive**: Archive Chapter 7.
- [ ] **agent-review**: Kiểm layout/final approval Chapter 7.

## Chapter 8
- [x] **agent-scrape**: Thu thập toàn bộ `chapter-8` vào `raw/`.
- [x] **agent-review**: Kiểm đủ page và tính toàn vẹn của `raw/`.
- [x] **agent-scrape**: Cleanup + asset cho `clean/`.
- [x] **agent-review**: Nghiệm thu data sạch của Chapter 8.
- [x] **agent-analyze**: Đọc HTML sạch để trích xuất thuật ngữ và xuất báo cáo rủi ro.
- [x] **agent-review**: Chốt glossary + report analysis Chapter 8.
- [x] **agent-translate**: Dịch nội dung thẻ vn visible của file `8-1-entrepreneurial-marketing-and-the-marketing-mix.html`.
- [x] **agent-review**: Đánh giá chất lượng bản dịch file `8-1-entrepreneurial-marketing-and-the-marketing-mix.html`.
- [x] **agent-translate**: Dịch nội dung thẻ vn visible của file `8-2-market-research-market-opportunity-recognition-and-target-market.html`.
- [x] **agent-review**: Đánh giá chất lượng bản dịch file `8-2-market-research-market-opportunity-recognition-and-target-market.html`.
- [x] **agent-translate**: Dịch nội dung thẻ vn visible của file `8-3-marketing-techniques-and-tools-for-entrepreneurs.html`.
- [x] **agent-review**: Đánh giá chất lượng bản dịch file `8-3-marketing-techniques-and-tools-for-entrepreneurs.html`.
- [x] **agent-translate**: Dịch nội dung thẻ vn visible của file `8-4-entrepreneurial-branding.html`.
- [x] **agent-review**: Đánh giá chất lượng bản dịch file `8-4-entrepreneurial-branding.html`.
- [x] **agent-translate**: Dịch nội dung thẻ vn visible của file `8-5-marketing-strategy-and-the-marketing-plan.html`.
- [x] **agent-review**: Đánh giá chất lượng bản dịch file `8-5-marketing-strategy-and-the-marketing-plan.html`.
- [x] **agent-translate**: Dịch nội dung thẻ vn visible của file `8-6-sales-and-customer-service.html`.
- [x] **agent-review**: Đánh giá chất lượng bản dịch file `8-6-sales-and-customer-service.html`.
- [x] **agent-translate**: Dịch nội dung thẻ vn visible của file `8-case-questions.html`.
- [x] **agent-review**: Đánh giá chất lượng bản dịch file `8-case-questions.html`.
- [x] **agent-translate**: Dịch nội dung thẻ vn visible của file `8-discussion-questions.html`.
- [x] **agent-review**: Đánh giá chất lượng bản dịch file `8-discussion-questions.html`.
- [x] **agent-translate**: Dịch nội dung thẻ vn visible của file `8-introduction.html`.
- [x] **agent-review**: Đánh giá chất lượng bản dịch file `8-introduction.html`.
- [x] **agent-translate**: Dịch nội dung thẻ vn visible của file `8-key-terms.html`.
- [x] **agent-review**: Đánh giá chất lượng bản dịch file `8-key-terms.html`.
- [x] **agent-translate**: Dịch nội dung thẻ vn visible của file `8-review-questions.html`.
- [x] **agent-review**: Đánh giá chất lượng bản dịch file `8-review-questions.html`.
- [x] **agent-translate**: Dịch nội dung thẻ vn visible của file `8-suggested-resources.html`.
- [x] **agent-review**: Đánh giá chất lượng bản dịch file `8-suggested-resources.html`.
- [x] **agent-translate**: Dịch nội dung thẻ vn visible của file `8-summary.html`.
- [x] **agent-review**: Đánh giá chất lượng bản dịch file `8-summary.html`. (Round 1: 49%→81%, 19 issues fixed)
- [x] **agent-archive**: Archive Chapter 8. (13 bilingual + 13 VN-only, 0 eng leak)
- [x] **agent-review**: Kiểm layout/final approval Chapter 8.

## Chapter 9
- [x] **agent-scrape**: Thu thập toàn bộ `chapter-9` vào `raw/`.
- [x] **agent-review**: Kiểm đủ page và tính toàn vẹn của `raw/`.
- [x] **agent-scrape**: Cleanup + asset cho `clean/`.
- [x] **agent-review**: Nghiệm thu data sạch của Chapter 9.
- [x] **agent-analyze**: Đọc HTML sạch để trích xuất thuật ngữ và xuất báo cáo rủi ro.
- [x] **agent-review**: Chốt glossary + report analysis Chapter 9.
- [x] **agent-translate**: Dịch nội dung thẻ vn visible của file `9-1-overview-of-entrepreneurial-finance-and-accounting-strategies.html`.
- [x] **agent-review**: Đánh giá chất lượng bản dịch file `9-1-overview-of-entrepreneurial-finance-and-accounting-strategies.html`.
- [x] **agent-translate**: Dịch nội dung thẻ vn visible của file `9-2-special-funding-strategies.html`.
- [x] **agent-review**: Đánh giá chất lượng bản dịch file `9-2-special-funding-strategies.html`.
- [x] **agent-translate**: Dịch nội dung thẻ vn visible của file `9-3-accounting-basics-for-entrepreneurs.html`.
- [x] **agent-review**: Đánh giá chất lượng bản dịch file `9-3-accounting-basics-for-entrepreneurs.html`.
- [x] **agent-translate**: Dịch nội dung thẻ vn visible của file `9-4-developing-startup-financial-statements-and-projections.html`.
- [x] **agent-review**: Đánh giá chất lượng bản dịch file `9-4-developing-startup-financial-statements-and-projections.html`.
- [x] **agent-translate**: Dịch nội dung thẻ vn visible của file `9-case-questions.html`.
- [x] **agent-review**: Đánh giá chất lượng bản dịch file `9-case-questions.html`.
- [x] **agent-translate**: Dịch nội dung thẻ vn visible của file `9-discussion-questions.html`.
- [x] **agent-review**: Đánh giá chất lượng bản dịch file `9-discussion-questions.html`.
- [x] **agent-translate**: Dịch nội dung thẻ vn visible của file `9-introduction.html`.
- [x] **agent-review**: Đánh giá chất lượng bản dịch file `9-introduction.html`.
- [x] **agent-translate**: Dịch nội dung thẻ vn visible của file `9-key-terms.html`.
- [x] **agent-review**: Đánh giá chất lượng bản dịch file `9-key-terms.html`.
- [x] **agent-translate**: Dịch nội dung thẻ vn visible của file `9-review-questions.html`.
- [x] **agent-review**: Đánh giá chất lượng bản dịch file `9-review-questions.html`.
- [x] **agent-translate**: Dịch nội dung thẻ vn visible của file `9-suggested-resources.html`.
- [x] **agent-review**: Đánh giá chất lượng bản dịch file `9-suggested-resources.html`.
- [x] **agent-translate**: Dịch nội dung thẻ vn visible của file `9-summary.html`.
- [x] **agent-review**: Đánh giá chất lượng bản dịch file `9-summary.html`. (Round 1: 71%→100%, 14 issues fixed)
- [x] **agent-archive**: Archive Chapter 9. (11 bilingual + 11 VN-only, 0 eng leak)
- [x] **agent-review**: Kiểm layout/final approval Chapter 9.

## Chapter 10
- [x] **agent-scrape**: Thu thap toan bo `10*.html` vao `raw/`.
- [x] **agent-review**: Kiem du page va tinh toan ven cua `raw/10*.html`.
- [x] **agent-scrape**: Cleanup + asset cho `clean/10*.html`.
- [x] **agent-review**: Nghiem thu data sach cua Chapter 10.
- [x] **agent-analyze**: Glossary/analysis cho `10*.html`.
- [x] **agent-review**: Chot glossary + report analysis Chapter 10.
- [x] **agent-translate**: Prep song ngu cho `10*.html`.
- [x] **agent-translate**: Dich toan bo Chapter 10.
- [x] **agent-review**: QA + lap `reviews/chapter-10-review.md`.
- [x] **agent-translate**: Xu ly vong review den khi dong chapter 10.
- [x] **agent-archive**: Archive Chapter 10.
- [x] **agent-review**: Kiem layout/final approval Chapter 10.

## Chapter 11
- [x] **agent-scrape**: Thu thap toan bo `11*.html` vao `raw/`.
- [x] **agent-review**: Kiem du page va tinh toan ven cua `raw/11*.html`.
- [x] **agent-scrape**: Cleanup + asset cho `clean/11*.html`.
- [x] **agent-review**: Nghiem thu data sach cua Chapter 11.
- [x] **agent-analyze**: Glossary/analysis cho `11*.html`.
- [x] **agent-review**: Chot glossary + report analysis Chapter 11.
- [x] **agent-translate**: Prep song ngu cho `11*.html`.
- [x] **agent-translate**: Dich toan bo Chapter 11.
- [x] **agent-review**: QA + lap `reviews/chapter-11-review.md`.
- [x] **agent-translate**: Xu ly vong review den khi dong chapter 11.
- [x] **agent-archive**: Archive Chapter 11. (11 bilingual + 11 VN-only, 0 eng leak)
- [x] **agent-review**: Kiem layout/final approval Chapter 11.

## Chapter 12
- [x] **agent-scrape**: Thu thap toan bo `12*.html` vao `raw/`.
- [x] **agent-review**: Kiem du page va tinh toan ven cua `raw/12*.html`.
- [x] **agent-scrape**: Cleanup + asset cho `clean/12*.html`.
- [x] **agent-review**: Nghiem thu data sach cua Chapter 12.
- [x] **agent-analyze**: Glossary/analysis cho `12*.html`.
- [x] **agent-review**: Chot glossary + report analysis Chapter 12.
- [x] **agent-translate**: Prep song ngu cho `12*.html`.
- [x] **agent-translate**: Dich toan bo Chapter 12.
- [x] **agent-review**: QA + lap `reviews/chapter-12-review.md`.
- [x] **agent-translate**: Xu ly vong review den khi dong chapter 12.
- [x] **agent-archive**: Archive Chapter 12.
- [x] **agent-review**: Kiem layout/final approval Chapter 12.

## Chapter 13
- [x] **agent-scrape**: Thu thap toan bo `13*.html` vao `raw/`.
- [x] **agent-review**: Kiem du page va tinh toan ven cua `raw/13*.html`.
- [x] **agent-scrape**: Cleanup + asset cho `clean/13*.html`.
- [x] **agent-review**: Nghiem thu data sach cua Chapter 13.
- [x] **agent-analyze**: Glossary/analysis cho `13*.html`.
- [x] **agent-review**: Chot glossary + report analysis Chapter 13.
- [x] **agent-translate**: Prep song ngu cho `13*.html`.
- [x] **agent-translate**: Dich toan bo Chapter 13.
- [x] **agent-review**: QA + lap `reviews/chapter-13-review.md`.
- [x] **agent-translate**: Xu ly vong review den khi dong chapter 13.
- [x] **agent-archive**: Archive Chapter 13.
- [x] **agent-review**: Kiem layout/final approval Chapter 13.

## Chapter 14
- [x] **agent-scrape**: Thu thập toàn bộ `chapter-14` vào `raw/`.
- [x] **agent-review**: Kiểm đủ page và tính toàn vẹn của `raw/`.
- [x] **agent-scrape**: Cleanup + asset cho `clean/`.
- [x] **agent-review**: Nghiệm thu data sạch của Chapter 14.
- [x] **agent-analyze**: Đọc HTML sạch để trích xuất thuật ngữ và xuất báo cáo rủi ro.
- [x] **agent-review**: Chốt glossary + report analysis Chapter 14.
- [x] **agent-translate**: Dịch nội dung thẻ vn visible của các file HTML trong `chapter-14/05-translated/`.
- [x] **agent-review**: Đánh giá chất lượng bản dịch (Semantic Check + Glossary Check) của tất cả các file trong Chapter 14.
- [x] **agent-archive**: Archive Chapter 14. Tạo `07-archive/bilingual/` (10 files), `07-archive/vn/` (10 files), `07-archive/assets/` (16 files).
- [x] **agent-review**: Kiểm layout/final approval Chapter 14. VN-only: 0 eng_hidden, 0 vn_visible. Bilingual: eng/vn pairs cân bằng.
