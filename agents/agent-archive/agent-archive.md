# Agent Archive

## Mô tả chức năng

**Agent-Archive** là agent đảm nhiệm Phase cuối cùng trong dự án dịch thuật sách (theo Master Workflow). Nhiệm vụ chính của agent này là:

1. **Lưu trữ tri thức (Knowledge Base):**
   - Tổng hợp các thuật ngữ mới phát sinh chưa có trong `glossary.csv`.
   - Ghi lại các quyết định về văn phong đặc biệt hoặc cách xử lý văn hóa phương Tây.
   - Ghi chép các pattern lỗi hay gặp để cập nhật vào Knowledge Items (KI).
2. **Đóng gói & Xuất bản (Build & Release):**
    - Tổng hợp và xuất bản ra Web Platform (Preview HTML), PDF, EPUB sau khi hoàn thành quy trình dịch và review.
    - Khởi tạo thư mục `apps/web-site/books/{book}/` self-contained với đầy đủ css, js (book-reader), hình ảnh (assets) và nội dung translated HTML để website có thể phục vụ sách tại `/{book}/`.

## Các Scripts

- `scripts/build-preview.py`: Script tự động đọc dữ liệu nguồn từ `data/{book}/` và copy toàn bộ các file cần thiết vào `apps/web-site/books/{book}/` theo mặc định. Khi chạy không truyền tham số, script build toàn bộ thư mục sách trong `data/`; khi truyền `data/{book}`, script chỉ build một sách. Cấu trúc output bảo toàn đường dẫn tương đối để các file HTML không bị lỗi resource. Mở `index.html` trong `apps/web-site/books/{book}/` sẽ tự động redirect tới bài đọc đầu tiên. Thư mục legacy `data/{book}/.html/` chỉ là output generated cũ, không phải source data.
