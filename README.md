# Dự Án Bột

## 1. Giới thiệu
Đây là một dự án phi lợi nhuận mang tên **Bột**. Mục đích của dự án là dịch các tài liệu, sách giáo khoa từ OpenStax (nguồn tài nguyên học liệu mở, miễn phí và hợp pháp) sang tiếng Việt nhằm đảm bảo công bằng và mở rộng cơ hội giáo dục cho mọi người.

Cuốn sách khởi điểm của dự án: **[Entrepreneurship](https://openstax.org/books/entrepreneurship/pages/1-2-entrepreneurial-vision-and-goals)**

## 2. Nguyên tắc cốt lõi
- **Bảo toàn dữ liệu (Data Versioning)**: Mỗi một bước trong pipeline đều phải lưu lại kết quả ở một thư mục riêng biệt. Tuyệt đối không ghi đè dữ liệu của bước trước đó để có thể dễ dàng debug và tái sử dụng.

## 3. Kiến trúc Pipeline

```text
[ Scrape ] ---> [ Cleanup ] ---> [ Analysis ] ---> [ Translate ] ---> [ Review ] ---> [ Archive ]
```

Các giai đoạn chi tiết:

### Bước 1: Scrape (`skill-scrape`)
- **Nhiệm vụ**: Thu thập toàn bộ file HTML gốc (bao gồm mọi thẻ rác, JS, CSS) từ trang OpenStax.
- **Dữ liệu đầu ra**: Lưu tại `/data/raw/`

### Bước 2: Cleanup (`skill-cleanup`)
- **Nhiệm vụ**: Làm sạch file HTML khổng lồ, loại bỏ head, menu, footer, JS, CSS. Chỉ giữ lại phần lõi nội dung (văn bản sách, hình ảnh).
- **Dữ liệu đầu ra**: Lưu tại `/data/clean/`

### Bước 3: Analysis
- **Nhiệm vụ**: Phân tích HTML đã làm sạch, chia thành các đoạn nhỏ (chunks), lập chỉ mục (Mục lục - Table of Contents).
- **Dữ liệu đầu ra**: Lưu tại `/data/analyzed/` (JSON/Markdown metadata).

### Bước 4: Translate
- **Nhiệm vụ**: LLM dịch các chunk từ tiếng Anh sang tiếng Việt.
- **Dữ liệu đầu ra**: Lưu tại `/data/translated/`

### Bước 5: Review
- **Nhiệm vụ**: Hiệu đính, so sánh chéo bản dịch với bản gốc, đảm bảo thuật ngữ đồng nhất.
- **Dữ liệu đầu ra**: Lưu tại `/data/reviewed/`

### Bước 6: Archive
- **Nhiệm vụ**: Ghép các chunk lại thành file hoàn chỉnh (Markdown/HTML/PDF) và lưu trữ xuất bản.
- **Dữ liệu đầu ra**: Lưu tại `/data/archived/`

## 4. Cấu trúc thư mục hiện tại
- `/data/raw/`: Chứa các file HTML gốc từ web.
- `/data/clean/`: Chứa nội dung HTML đã được lọc sạch rác.
- `/data/analyzed/`: Chứa dữ liệu đã phân rã thành các đoạn.
- `/data/translated/`: Chứa bản dịch thô.
- `/data/reviewed/`: Chứa bản dịch đã hiệu đính.
- `/data/archived/`: Chứa sản phẩm cuối cùng.
- `/agents/`: Nơi chứa mã nguồn các Agent và các **Skills** (như `skill-scrape`, `skill-cleanup`).

---
*Dự án Bột - Vì một nền giáo dục mở và công bằng.*
