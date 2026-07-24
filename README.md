# Dự Án Bột

## 1. Giới thiệu

Đây là một dự án phi lợi nhuận mang tên **Bột**. Mục đích của dự án là dịch các tài liệu, sách giáo khoa từ OpenStax (nguồn tài nguyên học liệu mở, miễn phí và hợp pháp) sang tiếng Việt nhằm đảm bảo công bằng và mở rộng cơ hội giáo dục cho mọi người.

Cuốn sách khởi điểm của dự án: **[Entrepreneurship](https://openstax.org/books/entrepreneurship/pages/1-2-entrepreneurial-vision-and-goals)**

## 2. Nguyên tắc cốt lõi

- **Bảo toàn dữ liệu (Data Versioning)**: Mỗi một bước trong pipeline đều phải lưu lại kết quả ở một thư mục riêng biệt. Tuyệt đối không ghi đè dữ liệu của bước trước đó để có thể dễ dàng debug và tái sử dụng.

## 3. Kiến trúc Pipeline

```text
[ Scrape ] ---> [ Cleanup ] ---> [ Analysis ] ---> [ Translate ] ---> [ Review ] ---> [ Static HTML ] ---> [ Site Build ] ---> [ R2/Pages Deploy ]
```

Các giai đoạn chi tiết:

### Bước 1: Scrape (`skill-scrape`)

- **Nhiệm vụ**: Thu thập toàn bộ file HTML gốc (bao gồm mọi thẻ rác, JS, CSS) từ trang OpenStax.
- **Dữ liệu đầu ra**: Lưu tại `../{book}/chapter-{N}/01-raw/`

### Bước 2: Cleanup (`skill-cleanup`)

- **Nhiệm vụ**: Làm sạch file HTML khổng lồ, loại bỏ head, menu, footer, JS, CSS. Chỉ giữ lại phần lõi nội dung (văn bản sách, hình ảnh).
- **Dữ liệu đầu ra**: Lưu tại `../{book}/chapter-{N}/02-clean/`

### Bước 3: Analysis

- **Nhiệm vụ**: Phân tích HTML đã làm sạch, đánh giá rủi ro văn hóa, thuật ngữ, cấu trúc câu cho từng chương.
- **Dữ liệu đầu ra**: Lưu tại `../{book}/chapter-{N}/03-analyzed/` (Markdown báo cáo).

### Bước 4: Translate

- **Nhiệm vụ**: LLM dịch HTML song ngữ dựa trên `glossary.csv` và báo cáo Analysis.
- **Dữ liệu trung gian**: `../{book}/chapter-{N}/04-prep/` (HTML sau khi nhân đôi cấu trúc song ngữ, chờ dịch)
- **Dữ liệu đầu ra**: Lưu tại `../{book}/chapter-{N}/05-translated/`

### Bước 5: Review

- **Nhiệm vụ**: Hiệu đính, so sánh chéo bản dịch với bản gốc, đảm bảo thuật ngữ đồng nhất.
- **Dữ liệu đầu ra**: Lưu tại `../{book}/chapter-{N}/06-reviews/`

### Bước 6: Archive

- **Nhiệm vụ**: Ghép các chunk lại thành file hoàn chỉnh (HTML/PDF/EPUB) và lưu trữ xuất bản.
- **Dữ liệu đầu ra**: Lưu tại `../{book}/chapter-{N}/07-archive/`

### Bước 7: R2 Upload

- **Nhiệm vụ**: Tải thư mục dữ liệu sách cục bộ lên Cloudflare R2 để không phụ thuộc vào một máy local.
- **Mapping**: `data/{book}/...` được lưu thành object keys dưới `books/{book}/...` trên R2.
- **CLI thủ công**: `node bin/cyberkbooks.js upload <book>`
- **Xem sách trên R2**: `node bin/cyberkbooks.js books --remote`
- **Quyền R2 cần thiết**: Object read/write/list. Không cần delete permission cho luồng upload bình thường.

### Build static book và website

- **Book data source**: `data/{book}/` chứa dữ liệu nguồn và artifact dịch thuật từ scrape, cleanup, prep, translate, review, glossary và assets.
- **Website-ready book pages**: HTML tĩnh được build vào `apps/web-site/books/{book}/`. Chạy `npm run build:book` để build toàn bộ sách trong `data/`, hoặc `npm run build:book -- data/{book}` để build một sách. Đây là nội dung website generated có chủ đích trong source folder của website.
- **Homepage manifest**: `npm run build:site` generate `apps/web-site/books.json` bằng cách scan các thư mục sách generated dưới `apps/web-site/books/{book}/`; homepage đọc `/books.json` để lấy URL sách. D1/API catalog có thể thay thế manifest này sau.
- **Deploy artifact**: `npm run build:site` copy shell `apps/web-site/` vào `dist/site/`, copy mỗi `apps/web-site/books/{book}/` vào `dist/site/{book}/`, và chỉ loại trừ junk/dev/build như `node_modules`, `.wrangler`, `.git`, `dist`.
- **Cloudflare Pages**: `npm run deploy` build `dist/site` rồi publish chính thư mục `dist/site/`. `dist/site/` là artifact deploy dùng một lần, có thể xóa và build lại.
- **Legacy cleanup**: `data/{book}/.html/` là output generated cũ. Nếu cần dọn migration, chỉ xóa đúng thư mục `.html/` này, không xóa dữ liệu nguồn trong `data/{book}/`.

## R2 Environment

Thiết lập các biến môi trường sau trước khi upload hoặc list R2:

```bash
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET=...
R2_ACCOUNT_ID=...
```

Có thể dùng `CLOUDFLARE_ACCOUNT_ID` thay cho `R2_ACCOUNT_ID`. Endpoint R2 được suy ra tự động theo dạng `https://<account-id>.r2.cloudflarestorage.com`.

## 4. Cấu trúc thư mục

Thư mục dữ liệu sách nằm trong `data/{book}/` (ví dụ: `data/entrepreneurship` hoặc `data/statistics`):

```text
data/{book}/                       # vd: data/entrepreneurship
├── glossary.csv                   # 📌 Bảng thuật ngữ — single source of truth (toàn sách)
├── tasks.md                       # Quản lý tiến độ toàn sách
├── css/                           # 🎨 CSS dùng chung cho mọi chapter (single file)
│   └── style.css
├── _book-level/                   # Preface, Index, Appendix (không thuộc chapter nào)
│
└── chapter-{N}/                   # vd: chapter-1 ... chapter-13
    ├── 01-raw/                    # HTML gốc từ OpenStax
    ├── 02-clean/                  # HTML đã làm sạch (loại thẻ rác)
    ├── 03-analyzed/               # Báo cáo phân tích rủi ro dịch thuật
    ├── 04-prep/                   # HTML đã nhân đôi cấu trúc song ngữ (chờ dịch)
    ├── 05-translated/             # HTML song ngữ đã dịch (eng hidden / vn visible)
    ├── 06-reviews/                # Báo cáo QA / review
    ├── 07-archive/                # Sản phẩm cuối cùng
    │   ├── bilingual/             # Bản song ngữ
    │   └── vn-only/               # Bản tiếng Việt thuần
    └── assets/                    # Hình ảnh của chapter (webp)
```

Website và deploy output:

```text
apps/web-site/
├── index.html                     # Homepage đọc /books.json
├── books.json                     # Manifest generated từ apps/web-site/books/{book}/
├── assets/                        # Static assets chung của website
├── functions/                     # Cloudflare Pages Functions
└── books/
    └── {book}/                    # Website-ready generated book pages
        ├── index.html
        └── book-reader/

dist/site/                         # Disposable deploy artifact copied from apps/web-site/
├── index.html
├── books.json
└── {book}/
```

- `/agents/`: Nơi chứa mã nguồn các Agent và các **Skills** (như `skill-scrape`, `skill-cleanup`).
- `/tools/`: Các script tiện ích (build, convert...).

---
*Dự án Bột - Vì một nền giáo dục mở và công bằng.*
