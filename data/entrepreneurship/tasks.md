# Quan ly Tac vu: Entrepreneurship

Quy trinh xu ly bat buoc cho moi chuong:
`Plan -> Scrape -> Cleanup -> Analysis -> Translate -> Review -> Archive`

Nguyen tac van hanh tu `master-workflow.md`:
- Moi chuong tu Chapter 4 tro di phai di du tat ca phase, khong duoc bo phase nao.
- `agent-review` la QA gate bat buoc sau moi phase quan trong.
- Neu da ton tai file `translated/` duoc dung tam theo cach reconstruct tu web, van phai backfill lai cac phase truoc neu phase do chua duoc ghi nhan/chua dat.

## Tong quan trang thai
- [x] **chapter-1**: Da hoan thanh den vong review va da dong bao cao review chuong.
- [x] **chapter-2**: Da hoan thanh den vong review va da dong bao cao review chuong.
- [x] **chapter-3**: Da hoan thanh den vong review va da dong bao cao review chuong.
- [ ] **chapter-4**: Da chay xong `scrape -> cleanup -> analysis -> translate -> review`; con `archive` chua thuc hien.
- [ ] **chapter-5**: Da co ban `translated/` reconstructed, nhung can chay lai day du workflow va QA theo dung quy trinh.
- [ ] **chapter-6**: Chua chay workflow day du.
- [ ] **chapter-7**: Chua chay workflow day du.
- [ ] **chapter-8**: Chua chay workflow day du.
- [ ] **chapter-9**: Chua chay workflow day du.
- [x] **chapter-10**: Da hoan thanh den het phase archive, da co ban song ngu va ban tieng Viet thuan trong `archive/`.
- [x] **chapter-11**: Da hoan thanh den het phase archive, da co ban song ngu va ban tieng Viet thuan trong `archive/`.
- [x] **chapter-12**: Da hoan thanh den het phase archive, da co ban song ngu va ban tieng Viet thuan trong `archive/`.
- [x] **chapter-13**: Da hoan thanh den het phase archive, da co ban song ngu va ban tieng Viet thuan trong `archive/`.
- [ ] **chapter-14**: Chua chay workflow day du.

## Phase 0: Lien chuong / Dieu phoi
- [x] **agent-plan**: Xac nhan Chapter 1-3 da di dung workflow va chot lai cac bao cao review hien co.
- [ ] **agent-plan**: Lap ke hoach full-book cho Chapter 4-14, bao dam moi chuong co du `scrape -> cleanup -> analysis -> translate -> review -> archive`.
- [ ] **agent-review**: Duyet lai `tasks.md` sau moi lan cap nhat de dam bao khong chuong nao bi bo phase.

## Chapter 4: Creativity, Innovation, and Invention
- [x] **agent-scrape**: Thu thap Chapter 4 tu OpenStax vao `data/entrepreneurship/raw/4*.html` bang entrypoint scrape hien hanh.
- [x] **agent-review**: Kiem file `raw/4*.html`, doi chieu TOC va xac nhan du cac page: `4-introduction`, `4-1`, `4-2`, `4-3`, `4-summary`, `4-key-terms`, `4-review-questions`, `4-discussion-questions`, `4-case-questions`, `4-suggested-resources`.
- [x] **agent-scrape**: Chay cleanup cho Chapter 4 vao `data/entrepreneurship/clean/4*.html`, tai day du asset lien quan.
- [x] **agent-review**: Mo ngau nhien file `clean/4*.html`, kiem tra noi dung sach da sach, khong con shell/loader, anh hien thi dung.
- [x] **agent-analyze**: Trich xuat/bo sung glossary cho thuat ngu Chapter 4 va tao cac file `analyzed/4-*-translate-analysis.md`.
- [x] **agent-review**: Doc `glossary.csv` + `4-*-translate-analysis.md`, chot xu ly thuat ngu, van phong, cac diem van hoa/ngu canh truoc khi dich.
- [x] **agent-translate**: Tao/cap nhat cau truc song ngu `eng hidden` / `vn visible` cho toan bo `4*.html` trong `translated/`.
- [x] **agent-translate**: Dich toan bo Chapter 4 sang tieng Viet, dong bo thuat ngu va van phong giao trinh.
- [x] **agent-review**: Chay QA dich thuat theo MQM, QA cau truc HTML song ngu, va tao/cap nhat `reviews/chapter-4-review.md`.
- [x] **agent-translate**: Xu ly tung loi trong `chapter-4-review.md` den khi bao cao dat trang thai da chot hoan tat.
- [ ] **agent-archive**: Gop va xuat ban chapter 4 vao `archive/`, tao bien the tieng Viet thuan neu can.
- [ ] **agent-review**: Kiem layout cuoi cung cua chapter 4 (web/html), anh, font, lien ket, va chot phase archive.

## Chapter 5: Identifying Entrepreneurial Opportunity
- [ ] **agent-scrape**: Thu thap Chapter 5 tu OpenStax vao `raw/5*.html`.
- [ ] **agent-review**: Kiem file `raw/5*.html`, xac nhan du cac page: `5-introduction`, `5-1`, `5-2`, `5-3`, `5-summary`, `5-key-terms`, `5-review-questions`, `5-discussion-questions`, `5-case-questions`, `5-suggested-resources`.
- [ ] **agent-scrape**: Chay cleanup cho Chapter 5 vao `clean/5*.html`, tai asset lien quan.
- [ ] **agent-review**: Nghiem thu `clean/5*.html` va asset.
- [ ] **agent-analyze**: Tao/cap nhat glossary + `analyzed/5-*-translate-analysis.md`.
- [ ] **agent-review**: Chot glossary/analysis truoc khi dich.
- [ ] **agent-translate**: Tao/cap nhat cau truc song ngu cho `5*.html`.
- [ ] **agent-translate**: Dich toan bo Chapter 5 vao `translated/5*.html`.
- [ ] **agent-review**: QA MQM + structure + tao/cap nhat `reviews/chapter-5-review.md`.
- [ ] **agent-translate**: Xu ly het loi trong `chapter-5-review.md` den khi dong review.
- [ ] **agent-archive**: Xuat chapter 5 vao `archive/`.
- [ ] **agent-review**: Kiem layout cuoi cung va chot phase archive cho chapter 5.

## Chapter 6
- [ ] **agent-scrape**: Thu thap toan bo `6*.html` vao `raw/`.
- [ ] **agent-review**: Kiem du page va tinh toan ven cua `raw/6*.html`.
- [ ] **agent-scrape**: Cleanup + asset cho `clean/6*.html`.
- [ ] **agent-review**: Nghiem thu data sach cua Chapter 6.
- [ ] **agent-analyze**: Glossary/analysis cho `6*.html`.
- [ ] **agent-review**: Chot glossary + report analysis Chapter 6.
- [ ] **agent-translate**: Prep song ngu cho `6*.html`.
- [ ] **agent-translate**: Dich toan bo Chapter 6.
- [ ] **agent-review**: QA + lap `reviews/chapter-6-review.md`.
- [ ] **agent-translate**: Xu ly vong review den khi dong chapter 6.
- [ ] **agent-archive**: Archive Chapter 6.
- [ ] **agent-review**: Kiem layout/final approval Chapter 6.

## Chapter 7
- [ ] **agent-scrape**: Thu thap toan bo `7*.html` vao `raw/`.
- [ ] **agent-review**: Kiem du page va tinh toan ven cua `raw/7*.html`.
- [ ] **agent-scrape**: Cleanup + asset cho `clean/7*.html`.
- [ ] **agent-review**: Nghiem thu data sach cua Chapter 7.
- [ ] **agent-analyze**: Glossary/analysis cho `7*.html`.
- [ ] **agent-review**: Chot glossary + report analysis Chapter 7.
- [ ] **agent-translate**: Prep song ngu cho `7*.html`.
- [ ] **agent-translate**: Dich toan bo Chapter 7.
- [ ] **agent-review**: QA + lap `reviews/chapter-7-review.md`.
- [ ] **agent-translate**: Xu ly vong review den khi dong chapter 7.
- [ ] **agent-archive**: Archive Chapter 7.
- [ ] **agent-review**: Kiem layout/final approval Chapter 7.

## Chapter 8
- [ ] **agent-scrape**: Thu thap toan bo `8*.html` vao `raw/`.
- [ ] **agent-review**: Kiem du page va tinh toan ven cua `raw/8*.html`.
- [ ] **agent-scrape**: Cleanup + asset cho `clean/8*.html`.
- [ ] **agent-review**: Nghiem thu data sach cua Chapter 8.
- [ ] **agent-analyze**: Glossary/analysis cho `8*.html`.
- [ ] **agent-review**: Chot glossary + report analysis Chapter 8.
- [ ] **agent-translate**: Prep song ngu cho `8*.html`.
- [ ] **agent-translate**: Dich toan bo Chapter 8.
- [ ] **agent-review**: QA + lap `reviews/chapter-8-review.md`.
- [ ] **agent-translate**: Xu ly vong review den khi dong chapter 8.
- [ ] **agent-archive**: Archive Chapter 8.
- [ ] **agent-review**: Kiem layout/final approval Chapter 8.

## Chapter 9
- [ ] **agent-scrape**: Thu thap toan bo `9*.html` vao `raw/`.
- [ ] **agent-review**: Kiem du page va tinh toan ven cua `raw/9*.html`.
- [ ] **agent-scrape**: Cleanup + asset cho `clean/9*.html`.
- [ ] **agent-review**: Nghiem thu data sach cua Chapter 9.
- [ ] **agent-analyze**: Glossary/analysis cho `9*.html`.
- [ ] **agent-review**: Chot glossary + report analysis Chapter 9.
- [ ] **agent-translate**: Prep song ngu cho `9*.html`.
- [ ] **agent-translate**: Dich toan bo Chapter 9.
- [ ] **agent-review**: QA + lap `reviews/chapter-9-review.md`.
- [ ] **agent-translate**: Xu ly vong review den khi dong chapter 9.
- [ ] **agent-archive**: Archive Chapter 9.
- [ ] **agent-review**: Kiem layout/final approval Chapter 9.

## Chapter 10
- [ ] **agent-scrape**: Thu thap toan bo `10*.html` vao `raw/`.
- [ ] **agent-review**: Kiem du page va tinh toan ven cua `raw/10*.html`.
- [ ] **agent-scrape**: Cleanup + asset cho `clean/10*.html`.
- [ ] **agent-review**: Nghiem thu data sach cua Chapter 10.
- [ ] **agent-analyze**: Glossary/analysis cho `10*.html`.
- [ ] **agent-review**: Chot glossary + report analysis Chapter 10.
- [x] **agent-translate**: Prep song ngu cho `10*.html`.
- [x] **agent-translate**: Dich toan bo Chapter 10.
- [x] **agent-review**: QA + lap `reviews/chapter-10-review.md`.
- [x] **agent-translate**: Xu ly vong review den khi dong chapter 10.
- [x] **agent-archive**: Archive Chapter 10.
- [x] **agent-review**: Kiem layout/final approval Chapter 10.

## Chapter 11
- [ ] **agent-scrape**: Thu thap toan bo `11*.html` vao `raw/`.
- [ ] **agent-review**: Kiem du page va tinh toan ven cua `raw/11*.html`.
- [ ] **agent-scrape**: Cleanup + asset cho `clean/11*.html`.
- [ ] **agent-review**: Nghiem thu data sach cua Chapter 11.
- [ ] **agent-analyze**: Glossary/analysis cho `11*.html`.
- [ ] **agent-review**: Chot glossary + report analysis Chapter 11.
- [x] **agent-translate**: Prep song ngu cho `11*.html`.
- [x] **agent-translate**: Dich toan bo Chapter 11.
- [x] **agent-review**: QA + lap `reviews/chapter-11-review.md`.
- [x] **agent-translate**: Xu ly vong review den khi dong chapter 11.
- [x] **agent-archive**: Archive Chapter 11.
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
- [ ] **agent-scrape**: Thu thap toan bo `14*.html` vao `raw/`.
- [ ] **agent-review**: Kiem du page va tinh toan ven cua `raw/14*.html`.
- [ ] **agent-scrape**: Cleanup + asset cho `clean/14*.html`.
- [ ] **agent-review**: Nghiem thu data sach cua Chapter 14.
- [ ] **agent-analyze**: Glossary/analysis cho `14*.html`.
- [ ] **agent-review**: Chot glossary + report analysis Chapter 14.
- [ ] **agent-translate**: Prep song ngu cho `14*.html`.
- [ ] **agent-translate**: Dich toan bo Chapter 14.
- [ ] **agent-review**: QA + lap `reviews/chapter-14-review.md`.
- [ ] **agent-translate**: Xu ly vong review den khi dong chapter 14.
- [ ] **agent-archive**: Archive Chapter 14.
- [ ] **agent-review**: Kiem layout/final approval Chapter 14.

## Phase cuoi sach: Tong hop va xuat ban
- [ ] **agent-archive**: Tong hop cac chapter da hoan tat thanh ban web day du cua cuon sach.
- [ ] **agent-archive**: Tao bien the tieng Viet thuan (loai `eng hidden`) cho toan bo sach.
- [ ] **agent-archive**: Chuan bi output `archive/` cho Web/PDF/EPUB neu script ho tro.
- [ ] **agent-review**: Mo va kiem tra layout tong the toan sach, lien ket chapter, hinh anh, CSS, va kha nang doc lien mach truoc khi phat hanh.
