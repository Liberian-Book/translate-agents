# Báo cáo Kiểm tra Tính toàn vẹn Dịch thuật — Chương 4

**Thời gian:** 2026-05-31 10:30
**Sách:** entrepreneurship
**Trạng thái kiểm tra:** ❌ KHÔNG ĐẠT (Do lỗi nghiêm trọng tại phần 4.3)

Báo cáo này đối chiếu tính toàn vẹn giữa các file dịch song ngữ (`05-translated/`) và bản lưu trữ (`07-archive/`) với bản gốc sạch (`02-clean/`) theo các tiêu chuẩn M1-M4 trong quy trình kiểm tra tính toàn vẹn.

---

## 1. Bảng tổng quan (M1, M2, M3, M4)

| File | Size Gốc (02-clean) | Size Dịch (05-translated) | Tỉ lệ Size (M1) | Lỗi cấu trúc (M2, M3) | Tình trạng dịch nghĩa (M4) | Đánh giá |
|---|---|---|---|---|---|---|
| `4-1-tools-for-creativity-and-innovation.html` | 21.5 KB | 46.0 KB | 2.14× | Không | ✅ Đã dịch 100%, không bị trùng lặp hay rút gọn | ✅ ĐẠT |
| `4-2-creativity-innovation-and-invention-how-they-differ.html` | 54.5 KB | 107.9 KB | 1.98× | Không | ✅ Đã dịch 100%, không bị trùng lặp hay rút gọn | ✅ ĐẠT |
| `4-3-developing-ideas-innovations-and-inventions.html` | 45.5 KB | 87.8 KB | 1.93× | Không | ❌ **91.7% chưa dịch** (33/36 khối nội dung tiếng Việt trùng hoàn toàn với tiếng Anh gốc) | ❌ **THẤT BẠI** |
| `4-case-questions.html` | 3.9 KB | 7.6 KB | 1.94× | Không | ✅ Đã dịch 100% | ✅ ĐẠT |
| `4-discussion-questions.html` | 4.5 KB | 7.7 KB | 1.70× | Không | ✅ Đã dịch 100% (cảnh báo kích thước nhỏ do đặc thù câu hỏi ngắn) | ⚠️ CẢNH BÁO |
| `4-introduction.html` | 4.6 KB | 9.4 KB | 2.02× | Không | ✅ Đã dịch 100% | ✅ ĐẠT |
| `4-key-terms.html` | 4.3 KB | 10.4 KB | 2.42× | Không | ✅ Đã dịch 100% | ✅ ĐẠT |
| `4-review-questions.html` | 5.7 KB | 10.6 KB | 1.86× | Không | ✅ Đã dịch 100% | ✅ ĐẠT |
| `4-suggested-resources.html` | 4.0 KB | 7.5 KB | 1.90× | Không | ✅ Đã dịch 100% | ✅ ĐẠT |
| `4-summary.html` | 5.7 KB | 11.8 KB | 2.08× | Không | ✅ Đã dịch 100% | ✅ ĐẠT |

---

## 2. Chi tiết các phát hiện & Sai lệch nghiêm trọng

### 2.1. File `4-3-developing-ideas-innovations-and-inventions.html`
* **Vấn đề trong `05-translated/`:**
  * File dịch có cấu trúc đầy đủ và kích thước đạt chuẩn (1.93×), khiến công cụ kiểm tra tự động trước đó báo `✅ PASS`.
  * Tuy nhiên, khi kiểm tra sâu nội dung từng đoạn (M4), **33 trên 36 khối nội dung văn bản dài (đoạn văn, tiêu đề phụ, danh mục)** trong thẻ `<p class="vn visible">` bị để trùng lặp nguyên văn văn bản tiếng Anh của thẻ `<p class="eng hidden">`. Thực tế là phần này chưa hề được dịch.
  * Chỉ có 3 block ngắn (Learning Objectives, 5 stages list, và Link to learning) là có bản dịch tiếng Việt thực tế.
* **Vấn đề trong `07-archive/` (Bản lưu trữ cuối cùng):**
  * Bản lưu trữ song ngữ (`07-archive/bilingual/`) và bản tiếng Việt (`07-archive/vn/`) của phần này **bị rút gọn thô bạo (mất khoảng 50% nội dung học thuật)**.
  * Số dòng code giảm từ 187 dòng (ở bản clean gốc) xuống còn 102 dòng.
  * Các đoạn văn học thuật dài và chi tiết của OpenStax đã bị thay thế bằng các đoạn tóm tắt ngắn từ nguồn ngoài, vi phạm nghiêm trọng nguyên tắc **"Giữ 100% nội dung học thuật, không tóm tắt"**.

### 2.2. File `4-discussion-questions.html`
* Kích thước dịch đạt **1.70×** (dưới ngưỡng chuẩn 1.8×).
* **Nguyên nhân:** File chứa các câu hỏi thảo luận rất ngắn (tổng cộng 8 câu hỏi), do đó phần boilerplate cấu trúc HTML chiếm tỷ lệ cao trong file size. Qua đối chiếu, 100% các câu hỏi đều đã được dịch đầy đủ, không thiếu hụt nội dung, cấu trúc hoàn toàn khớp. Cảnh báo này có thể bỏ qua.

### 2.3. Về các Footnotes (Chú thích cuối trang)
* Một số file (như `4-3` và `4-introduction`) bị script đối chiếu cũ báo "Missing elements" do thiếu các thẻ footnote `<li>` (ví dụ: `fs-idm401843232`...).
* **Thực tế:** Các footnote này đã bị lược bỏ một cách nhất quán khỏi file sạch `02-clean/` trước đó trong giai đoạn chuẩn bị chuẩn hóa tài liệu (chỉ giữ lại liên kết footnote trong văn bản). Việc thiếu các thẻ này trong `05-translated/` là hoàn toàn khớp với bản gốc sạch `02-clean/` và nằm trong quy trình thiết kế.

---

## 3. Kiến nghị Hành động (Action Plan)

1. **Từ chối bản lưu trữ hiện tại của Chương 4** cho đến khi phần 4.3 được khắc phục.
2. **Thực hiện dịch lại phần 4.3 từ bản sạch 02-clean**:
   * Khôi phục file `05-translated/4-3-developing-ideas-innovations-and-inventions.html` về trạng thái song ngữ thô (đã tạo qua `prep_html.js`).
   * Sử dụng Agent dịch thuật dịch đầy đủ các đoạn văn học thuật mà không làm mất cấu trúc, đảm bảo văn bản tiếng Việt truyền tải chính xác 100% nội dung chi tiết của bản gốc.
3. **Đóng gói lại (Re-archive) Chương 4**:
   * Sau khi dịch hoàn chỉnh phần 4.3 và được duyệt qua QA kiểm tra thuật ngữ/tính toàn vẹn, chạy lại tiến trình lưu trữ để cập nhật thư mục `07-archive/` (bao gồm cả bản song ngữ và bản tiếng Việt).
