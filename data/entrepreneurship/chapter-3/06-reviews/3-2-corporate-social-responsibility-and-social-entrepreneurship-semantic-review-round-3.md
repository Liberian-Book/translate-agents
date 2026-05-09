# Báo cáo Nghiệm thu: 3-2-corporate-social-responsibility-and-social-entrepreneurship.html (Round 3)

*(Kế thừa từ Round 2 — review sâu sau backfill clean data)*

**File kiểm tra:** `chapter-3/05-translated/3-2-corporate-social-responsibility-and-social-entrepreneurship.html`
**File clean mới:** `chapter-3/02-clean/3-2-corporate-social-responsibility-and-social-entrepreneurship.html` (293 dòng, re-scraped 2026-05-09)
**Glossary reference:** `glossary.csv` (487 entries)
**Thời gian:** 2026-05-09 18:xx

## Kiểm tra cấu trúc

- ✅ Cấu trúc song ngữ eng/vn đúng chuẩn: 82 cặp eng/vn trong archive bilingual
- ✅ Archive VN-only: không leak eng_hidden
- ✅ Glossary check: 100% (0 thuật ngữ emphasis trong file này — thuật ngữ chính ở file 3-1)

## Danh sách Vi phạm

| ID | Thẻ Gốc (eng) | Bản dịch hiện tại (vn) | Phản biện | Đề xuất sửa | Trạng thái |
|---|---|---|---|---|---|
| S-001 | `Fig 3.5 img src` (line 217) | `src` trỏ URL CDN OpenStax, không phải local assets | Hình ảnh dùng URL CDN trực tiếp thay vì local asset. Đây là lỗi kế thừa từ việc clean data bị hỏng — bản dịch không qua pipeline prep chuẩn. | Thay `src` bằng `../assets/img-3-2-1.webp` (file vừa tải từ re-scrape) | Mới |
| S-002 | N/A | Toàn file | Bản dịch có chất lượng tốt. Văn phong trôi chảy, nhất quán xưng hô Bạn/Chúng ta. Không phát hiện hallucination. Các tên riêng (TOMS, Bombas, Warby Parker, Enron, GM) giữ nguyên đúng. | N/A | Hoàn thành |

## Tổng kết

- **1 issue mới**: img src trỏ CDN (cần fix để đồng bộ với pipeline)
- **Chất lượng dịch**: Tốt, không cần sửa nội dung
