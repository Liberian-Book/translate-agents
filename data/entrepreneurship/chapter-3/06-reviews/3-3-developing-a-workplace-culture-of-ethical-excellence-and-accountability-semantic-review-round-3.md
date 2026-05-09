# Báo cáo Nghiệm thu: 3-3-developing-a-workplace-culture-of-ethical-excellence-and-accountability.html (Round 3)

*(Kế thừa từ Round 2 — review sâu sau backfill clean data)*

**File kiểm tra:** `chapter-3/05-translated/3-3-developing-a-workplace-culture-of-ethical-excellence-and-accountability.html`
**File clean mới:** `chapter-3/02-clean/3-3-developing-a-workplace-culture-of-ethical-excellence-and-accountability.html` (276 dòng, re-scraped 2026-05-09)
**Glossary reference:** `glossary.csv` (487 entries)
**Thời gian:** 2026-05-09 18:xx

## Kiểm tra cấu trúc

- ✅ Cấu trúc song ngữ eng/vn đúng chuẩn: 82 cặp eng/vn trong archive bilingual
- ✅ Archive VN-only: không leak eng_hidden
- ✅ Glossary check: 100%

## Danh sách Vi phạm

| ID | Thẻ Gốc (eng) | Bản dịch hiện tại (vn) | Phản biện | Đề xuất sửa | Trạng thái |
|---|---|---|---|---|---|
| S-001 | `Fig 3.6 & Fig 3.7 img src` (line 76, 166) | `src` trỏ URL CDN OpenStax | Tương tự 3-2: hình ảnh dùng URL CDN trực tiếp thay vì local asset. Bản dịch không qua pipeline prep chuẩn. | Thay `src` bằng `../assets/img-3-3-1.webp` và `../assets/img-3-3-2.webp` | Mới |
| S-002 | Line 145: `vi mô khởi nghiệp` | `micro-entrepreneurship` → `vi mô khởi nghiệp` | Cách dịch chưa tự nhiên. "Vi mô khởi nghiệp" không phải cụm từ quen thuộc trong tiếng Việt. | Đề xuất: `khởi nghiệp vi mô` (đảo trật tự cho tự nhiên hơn) | Mới |
| S-003 | N/A | Toàn file | Bản dịch chất lượng tốt. Văn phong trôi chảy, xưng hô nhất quán. Xử lý thành ngữ OK (thick skin → bản lĩnh chịu va chạm, walk the walk → làm, không chỉ nói). Tên riêng đúng. | N/A | Hoàn thành |

## Tổng kết

- **2 issues mới**: img src CDN + thuật ngữ `vi mô khởi nghiệp` nên đảo thành `khởi nghiệp vi mô`
- **Chất lượng dịch**: Tốt, chỉ cần chỉnh nhỏ
