import re

# Paths
PREP_FILE = "/Users/anderson/Desktop/entrepreneurship/data/entrepreneurship/chapter-3/04-prep/3-3-developing-a-workplace-culture-of-ethical-excellence-and-accountability.html"
TRANSLATED_FILE = "/Users/anderson/Desktop/entrepreneurship/data/entrepreneurship/chapter-3/05-translated/3-3-developing-a-workplace-culture-of-ethical-excellence-and-accountability.html"
OUTPUT_FILE = "/Users/anderson/Desktop/entrepreneurship/data/entrepreneurship/chapter-3/05-translated/3-3-developing-a-workplace-culture-of-ethical-excellence-and-accountability.html"

# Manual translations for the first half of the document (matching ids in 04-prep)
manual_translations = {
    # Document title
    "page_fa5b1b88-df6f-4d1e-83c5-750935b7b502_titlecreatedbycookbook-vn": "Xây dựng văn hóa nơi làm việc hướng tới sự xuất sắc về đạo đức và trách nhiệm giải trình",
    
    # Learning Objectives
    "learning-objectives-h3-vn": "Mục tiêu học tập",
    "fs-idm418670640-vn": "Sau khi hoàn thành phần này, bạn sẽ có thể:",
    "li-fs-idm408233120-1-vn": "Mô tả các thách thức tại nơi làm việc trong một văn hóa khởi nghiệp",
    "li-fs-idm408233120-2-vn": "Phân biệt giữa cách tiếp cận phản ứng và chủ động trong quản lý đạo đức",
    "li-fs-idm408233120-3-vn": "Mô tả nền tảng và khuôn khổ của một văn hóa tổ chức hướng tới sự xuất sắc về đạo đức",
    "li-fs-idm408233120-4-vn": "Xác định các thành phần cấu thành một nơi làm việc có đạo đức",
    
    # Paragraphs 1-3
    "fs-idm397250112-vn": "Các nhà khởi nghiệp thành công hiểu rằng nơi làm việc của năm 2020 khá khác biệt so với năm 2000, chỉ mới hai mươi năm trước. Như tiêu đề của phần này gợi ý, các nhà khởi nghiệp tiến bộ muốn tạo ra một <span data-type=\"term\" class=\"no-emphasis\" id=\"term-00001\" group-by=\"w\">văn hóa nơi làm việc</span> hướng tới sự xuất sắc về đạo đức. Tuy nhiên, để làm được điều đó đòi hỏi phải thấu hiểu một lực lượng lao động đang thay đổi, cả về đặc điểm nhân khẩu học lẫn hệ giá trị. Thế hệ Millennials (những người sinh từ năm 1983 đến 1995) hiện đã vượt qua thế hệ Baby Boomers (bùng nổ trẻ sơ sinh) trong lực lượng lao động, và đến năm 2025, họ sẽ chiếm 3/4 tổng số người lao động trên phạm vi toàn cầu.<sup id=\"footnote-ref1\" data-type=\"footnote-number\"><a href=\"3-3-developing-a-workplace-culture-of-ethical-excellence-and-accountability#fs-idm395000880\" role=\"doc-noteref\" epub:type=\"noteref\" aria-label=\"Go to 30\" data-type=\"footnote-link\">30</a></sup> Các nhà khởi nghiệp và nhà quản lý ở vị thế tuyển dụng và giám sát nhân viên thế hệ millennial phải điều chỉnh để thích ứng với những kỳ vọng và yêu cầu khác biệt của nơi làm việc giữa thế kỷ XXI. Điều này đặc biệt đúng đối với CSR/đạo đức. Theo một bài báo gần đây trên tờ <em data-effect=\"italics\">New York Times</em>, điều quan trọng nhất đối với thế hệ millennials là công việc phải phù hợp với các giá trị cá nhân của họ.<sup id=\"footnote-ref2\" data-type=\"footnote-number\"><a href=\"3-3-developing-a-workplace-culture-of-ethical-excellence-and-accountability#fs-idm394393104\" role=\"doc-noteref\" epub:type=\"noteref\" aria-label=\"Go to 31\" data-type=\"footnote-link\">31</a></sup>",
    "fs-idm403586224-vn": "Khoảng 60% người lao động thuộc thế hệ millennial sẵn sàng làm việc với mức lương ít hơn 15% chỉ để có cơ hội làm việc cho một công ty có các giá trị kinh doanh tương đồng với các giá trị cá nhân của họ.<sup id=\"footnote-ref3\" data-type=\"footnote-number\"><a href=\"3-3-developing-a-workplace-culture-of-ethical-excellence-and-accountability#fs-idm391823712\" role=\"doc-noteref\" epub:type=\"noteref\" aria-label=\"Go to 32\" data-type=\"footnote-link\">32</a></sup> Hóa ra, thế hệ millennials không chỉ muốn một công việc thuần túy, họ muốn một công việc có ý nghĩa — công việc mà họ có thể cống hiến để đạt được một kết quả xứng đáng. Nói cách khác, họ muốn công việc mình làm phải có ý nghĩa nào đó. Hơn nữa, theo một bài báo trên tờ <em data-effect=\"italics\">Texas Bar Journal</em> của chuyên gia khai vấn nghề nghiệp và tư vấn Martha Newman, người lao động thế hệ millennial đánh giá rất cao các chính sách tại nơi làm việc thúc đẩy truyền thông cởi mở, sự hợp tác và tham gia vào quá trình ra quyết định ngắn hạn và dài hạn với người sử dụng lao động.<sup id=\"footnote-ref4\" data-type=\"footnote-number\"><a href=\"3-3-developing-a-workplace-culture-of-ethical-excellence-and-accountability#fs-idm395996464\" role=\"doc-noteref\" epub:type=\"noteref\" aria-label=\"Go to 33\" data-type=\"footnote-link\">33</a></sup> Newman cũng cho biết thế hệ millennials kỳ vọng có một mức độ cân bằng nhất định giữa công việc và cuộc sống; sự nghiệp không phải là điều duy nhất quan trọng trong cuộc sống của họ.",
    "fs-idm411509520-vn": "Điều này có nghĩa là các nhà khởi nghiệp đang quản lý nhân sự phải biết điều chỉnh. Ví dụ, một người chủ có thể tạo ra một nơi làm việc có văn hóa đảm bảo rằng con người quan trọng ngang bằng tiền bạc, nơi có sự cân bằng giữa công việc và cuộc sống thông qua những thứ như lịch làm việc linh hoạt, và nơi những cống hiến tốt đẹp được công nhận và khen thưởng. Có câu ngạn ngữ rằng: 'Người ta không bỏ việc, họ bỏ sếp của mình.' Nếu bạn không muốn tỷ lệ nhảy việc quá cao trong lực lượng lao động của mình, hãy là kiểu sếp mà thế hệ millennials muốn làm việc cùng và cống hiến cho.",
    
    # Section: Entrepreneurial Culture
    "entrepreneurial-culture-h3-vn": "Văn hóa khởi nghiệp",
    "fs-idm394489856-vn": "Một đặc điểm khá phổ biến của các doanh nghiệp khởi nghiệp thành công là những người sáng lập có sức lôi cuốn, đầy tham vọng và có tinh thần cạnh tranh cao. Sau cùng, cần phải có một tinh thần thép và cái tôi mạnh mẽ để vượt qua những thất vọng không thể tránh khỏi đối với một nhà lãnh đạo khởi nghiệp. Tuy nhiên, khi các công ty phát triển, họ thường phát hiện ra rằng cần có một đặc tính lãnh đạo khác. Liệu các nhà khởi nghiệp có thể vẫn thành công nếu họ cũng áp dụng phong cách lãnh đạo nhân văn ngay từ đầu, hay điều này sẽ luôn làm giảm tỷ lệ thành công vốn đã thấp lúc ban đầu? Đó là một vấn đề khó khăn mà nhiều doanh nghiệp phải vật lộn giải quyết. Những nhân viên tận tụy có thể cảm thấy nản lòng bởi những nhà lãnh đạo khắt khe và khắc nghiệt, những người ít khi đền đáp xứng đáng cho những nhân sự trung thành ngay cả sau khi đạt được thành công. Những nhân viên mới có thể thấy môi trường làm việc ít thân thiện hơn họ mong đợi và đơn giản là rời đi.",
    "fs-idm409324976-vn": "Một câu hỏi mà một nhà khởi nghiệp có đạo đức nên tự hỏi là: Nhân viên của tôi có cảm thấy họ có thể nói năng tự do hay không? Trên thực tế, tại nhiều công ty, theo SHRM (Hiệp hội Quản lý Nguồn nhân lực), các phòng nhân sự thường gặp khó khăn trong việc thu hút nhân viên hoàn thành khảo sát môi trường nơi làm việc (mức độ hài lòng).<sup id=\"footnote-ref5\" data-type=\"footnote-number\"><a href=\"3-3-developing-a-workplace-culture-of-ethical-excellence-and-accountability#fs-idm413604176\" role=\"doc-noteref\" epub:type=\"noteref\" aria-label=\"Go to 34\" data-type=\"footnote-link\">34</a></sup> Người lao động thường tin rằng nếu ban quản lý thực sự muốn tìm hiểu xem ai đã nói gì thì họ có thể dễ dàng làm được, mặc dù các khảo sát được cho là ẩn danh. Sự khác biệt giữa quản lý khởi nghiệp có đạo đức và phi đạo đức là liệu ban lãnh đạo có muốn tìm ra danh tính đó hay không. Dù liên quan đến các công ty quy mô nhỏ, vừa hay lớn, ban quản lý nên khuyến khích nhân viên lên tiếng, dù với tư cách là người tố cáo ẩn danh hay trực tiếp với người giám sát của họ. Việc thiếu đi sự khuyến khích này thường để cho các thực hành kinh doanh phi đạo đức phát triển mạnh mẽ, chẳng hạn như đã thấy trong ví dụ về trường hợp của Wells Fargo.",
    
    # Link to Learning 1
    "link-to-learning-title-1-vn": "Liên kết học tập",
    "fs-idm403418720-vn": "Mặc dù không có một tập hợp các đặc điểm đơn lẻ nào xác định một nhà lãnh đạo khởi nghiệp lý tưởng, nhưng tính khí khắt khe và tham vọng là một đặc điểm khá phổ biến. Hãy xem xét các hồ sơ ngắn gọn sau đây về các nhà doanh nghiệp: đầu tiên là một <a href=\"https://openstax.org/l/52WaltDisney\" target=\"_blank\" rel=\"noopener nofollow\" aria-label=\"Go to profile on Walt Disney\">hồ sơ về Walt Disney</a> và sau đó là <a href=\"https://openstax.org/l/52KerrieLaird\" target=\"_blank\" rel=\"noopener nofollow\" aria-label=\"Go to video showing a contrasting view from Kerrie Laird\">video cho thấy một góc nhìn tương phản từ Kerrie Laird</a> tại <span data-type=\"term\" class=\"no-emphasis\" id=\"term-00002\" group-by=\"V\">Vodafone</span>.",
    "fs-idm384299504-vn": "Sau khi xem các đoạn video, hãy cân nhắc thử nghiệm tư duy sau: Giả sử sự tôn sùng nhà lãnh đạo khởi nghiệp lôi cuốn — nhưng độc đoán — như Walt Disney hay Steve Jobs được thay thế bằng một người cam kết sâu sắc trong việc trao quyền cho nhân viên như tuyên bố của Kerrie Laird tại Vodafone? Điều này có thể làm thay đổi văn hóa tại các công ty khởi nghiệp không? Nếu có thể, bạn có tin rằng sự thay đổi đó là tốt hơn hay xấu đi?",
    
    # Paragraphs 8-14
    "fs-idm384752704-vn": "Những quan sát này xác định những điểm có thể là độc nhất đối với văn hóa khởi nghiệp. Đây là sự kết hợp giữa tính cách và phong cách quản lý thường được nhận thấy ở những nhà lãnh đạo doanh nghiệp tự mình vạch lối đi riêng, đưa một công ty khởi nghiệp vào cuộc sống và định hình các văn hóa cũng như thực hành kinh doanh ban đầu trong quá trình làm việc. Nếu doanh nghiệp thành công, các nguyên tắc và triết lý của người sáng lập sẽ được ghi khắc sâu đậm trong lịch sử truyền thống của công ty, để rồi rất lâu sau khi họ rời đi, các nhà lãnh đạo kế nhiệm vẫn thấy mình chịu ơn triết lý quản lý được nêu gương từ những ngày đầu của doanh nghiệp.<sup id=\"footnote-ref6\" data-type=\"footnote-number\"><a href=\"3-3-developing-a-workplace-culture-of-ethical-excellence-and-accountability#fs-idm383350720\" role=\"doc-noteref\" epub:type=\"noteref\" aria-label=\"Go to 35\" data-type=\"footnote-link\">35</a></sup> Khi <em data-effect=\"italics\">bạn</em> tìm kiếm phong cách lãnh đạo phù hợp để áp dụng vào các kế hoạch khởi nghiệp của mình, hãy bắt đầu bằng việc tự hỏi chính xác kiểu nhà lãnh đạo nào bạn muốn làm việc cùng nếu bạn không phải là sếp. Câu trả lời bạn đưa ra rất có thể sẽ là hình mẫu tốt nhất để làm theo khi bạn phát triển cá tính lãnh đạo của riêng mình.",
    "fs-idm383447888-vn": "Những nhân viên đầu tiên của một công ty khởi nghiệp nhận thức rõ những gì đang bị đe dọa khi công ty bắt đầu dấn thân vào các vùng nước khởi nghiệp mới mẻ. Người sáng lập có thể là sếp, nhưng các cộng sự của họ cảm nhận được một tinh thần cộng tác gắn kết họ trực tiếp với người sáng lập cũng như với nhau. Có thể có một tình bạn thân thiết thực sự giữa những người đã gắn bó với công ty từ ngày đầu tiên hoặc ngay sau đó. Các thành viên sáng lập của một doanh nghiệp khởi nghiệp cũng thường sẵn sàng trải qua những căng thẳng và khó khăn gắn liền với một công ty khởi nghiệp để đổi lấy cổ phần sở hữu trong công ty, cho phép họ kiếm được nguồn lợi nhuận lớn từ sự tăng trưởng và thành công sau này của nó.",
    "fs-idm397982656-vn": "Tuy nhiên, những nhân viên mới hơn có thể không chia sẻ tư duy này. Họ có thể chỉ đơn giản là tìm kiếm một vị trí an toàn tại một doanh nghiệp đang phát triển hơn là cơ hội tham gia ngay từ đầu vào một công ty khởi nghiệp đầy rủi ro. Họ sẽ không nhất thiết có đủ sự kiên nhẫn đối với những giờ làm việc căng thẳng, sự hỗn loạn và những tính cách cộc cằn có thể là đặc trưng cho những ngày đầu của một doanh nghiệp. Liệu các nhà sáng lập khởi nghiệp có thể định hình văn hóa công ty sao cho có thể dung nạp những nhân viên tài năng đang tìm kiếm một văn hóa doanh nghiệp hỗ trợ sự cân bằng nhất định giữa công việc và cuộc sống?",
    "fs-idm407132608-vn": "Hãy xem xét các thực hành đạo đức của nhà khởi nghiệp và kỳ vọng đạo đức của nhân viên. Giả sử một trong những đặc điểm nổi bật được đan cài vào cấu trúc của công ty khởi nghiệp là sự tôn trọng dành cho khách hàng hoặc đối tác. Một nhà khởi nghiệp thường hứa sẽ luôn coi trọng khách hàng ở mức cao nhất, không bao giờ lừa dối họ và phục vụ họ thật tốt. Hơn nữa, giả sử nhà khởi nghiệp này truyền đạt thành công đặc tính tương tự đó cho tất cả nhân viên ngay từ đầu. Sự tôn trọng đối với khách hàng được định sẵn để trở thành một đặc điểm nổi bật của doanh nghiệp; ngay cả khi điều đó gây ra tổn thất tài chính cho công ty, nhà khởi nghiệp này sẽ không gian lận với khách hàng cũng như không trình bày sai lệch về các dịch vụ của công ty. Cuối cùng, giả định rằng đặc tính này được nhúng sâu vào văn hóa của công ty trong khi công ty vẫn đang ở giai đoạn khởi nghiệp.",
    "fs-idm395286560-vn": "Bây giờ, hãy giả sử công ty trở nên thành công. Điều này có thể báo hiệu khoảng thời gian khó khăn nhất đối với nhà khởi nghiệp. Sự tăng trưởng thường đi kèm với thành công, và sự tăng trưởng cũng đồng nghĩa với việc có thêm nhiều nhân viên. Không phải tất cả những nhân sự mới được tuyển dụng này đều cam kết chịu trách nhiệm đối với khách hàng ở cùng một mức độ như cũ. Họ sẽ không nhất thiết cố tình gian lận khách hàng, nhưng họ có thể thiếu đi sự nhiệt huyết của người sáng lập trong việc đối xử danh dự nhất với khách hàng. Làm thế nào một nhà khởi nghiệp có thể đảm bảo rằng cam kết ban đầu được duy trì sang thế hệ lãnh đạo thứ hai? Họ không thể chỉ đơn giản ra lệnh cho điều đó xảy ra — bản tính con người thường không phản hồi dễ dàng như vậy. Vì vậy, các nhà khởi nghiệp phải nỗ lực hết mình để đảm bảo rằng phiên bản dịch vụ khách hàng của họ, một phiên bản ưu tiên sự tôn trọng đối tác, được truyền tải đến các nhân viên mới. Nó có thể đã ăn sâu vào những nhân viên phục vụ lâu năm nhất, nhưng nó cần phải được nuôi dưỡng đến mức có tầm quan trọng tương tự đối với những nhân sự mới tuyển dụng.",
    "fs-idm407265792-vn": "Với tư cách là một nhà lãnh đạo, bạn cần lập kế hoạch và theo sát để đảm bảo tổ chức của mình tuân thủ các giá trị và nguyên tắc đạo đức mà bạn ủng hộ. Quy trình lập kế hoạch này vượt lên trên việc thực hiện một vài hành động đơn giản như tuyển dụng đúng người, đưa ra chế tài hoặc đặt ra kỳ vọng. Nó vượt lên trên việc truyền đạt một vài lời lẽ tốt đẹp và khuyến khích các khẩu hiệu ngắn gọn như thiết lập lòng tin và làm việc với sự chính trực tuyệt đối. Nó cần nhiều hơn là việc áp dụng một vài khái niệm và khẩu hiệu phổ biến như CSR, chủ nghĩa tư bản tỉnh thức (conscious capitalism) hay lãnh đạo phục vụ (servant leadership). Nó cũng cần nhiều hơn là sự truyền thông hiệu quả về một vài tiêu chí thành công và kỳ vọng.",
    "fs-idm409751680-vn": "Có những kỹ thuật hiệu quả có thể hỗ trợ việc đưa các nguyên tắc đạo đức vào đời sống làm việc hằng ngày của nhân viên. Đôi khi được gọi là <span data-type=\"term\" id=\"term-00003\" group-by=\"a\">chiến lược neo (đạo đức)</span>, các giá trị đạo đức có thể trở thành một phần của văn hóa doanh nghiệp thông qua việc thực hiện đào tạo nhân viên và các chương trình khen thưởng/công nhận. Trang web của <span data-type=\"term\" class=\"no-emphasis\" id=\"term-00004\" group-by=\"S\">Hiệp hội Quản lý Nguồn nhân lực</span> (SHRM) có một bộ công cụ dành cho các nhà khởi nghiệp và nhà quản lý cung cấp các ý tưởng hữu ích về các chiến lược truyền dẫn và chiến lược neo này.",
    
    # Link to Learning 2
    "link-to-learning-title-2-vn": "Liên kết học tập",
    "fs-idm387934160-vn": "Hãy xem <a href=\"https://openstax.org/l/52OrgCulToolkit\" target=\"_blank\" rel=\"noopener nofollow\" aria-label=\"Go to toolkit for understanding and developing organizational culture\">bộ công cụ để hiểu và phát triển văn hóa tổ chức</a> để tìm hiểu thêm."
}

def extract_translations_from_existing():
    """Extracts existing translations from 05-translated using re."""
    with open(TRANSLATED_FILE, "r", encoding="utf-8") as f:
        content = f.read()
    
    translations = {}
    # We want to match all elements of class 'vn visible'
    # Pattern to match elements with class="vn visible" or class="... vn visible ..."
    # We can match <tag ... class="[^\"]*vn visible[^\"]*" ... id="[^\"]*-vn" ...>...</tag>
    # Note: we can match tags: p, li, h3, h4, span, figcaption, div, etc.
    pattern = re.compile(r'<(\w+)\s+[^>]*class="[^"]*vn visible[^"]*"[^>]*>(.*?)</\1>', re.DOTALL)
    matches = pattern.findall(content)
    for tag, inner_html in matches:
        # Try to find ID or other identifier in the tag-opening string
        # Let's search inside the whole element match to find id="[^\"]*"
        # To get the full tag match, let's write a more precise regex:
        pass

    # A simpler and more robust way is to find all tags with class "vn visible"
    # using a simple regex since they are usually single-line or simple block tags:
    # <p id="fs-idm398288208-vn" class="vn visible">...</p>
    p_pattern = re.compile(r'<p\s+id="([^"]+)-vn"\s+class="vn visible">(.*?)</p>', re.DOTALL)
    for p_id, text in p_pattern.findall(content):
        translations[f"{p_id}-vn"] = text.strip()

    # Match list items
    li_pattern = re.compile(r'<li\s+class="vn visible">(.*?)</li>', re.DOTALL)
    # List items in 05-translated are not id-based, but we can match them in order if we want,
    # or look at the ID of the parent ul. Let's see:
    # Actually, in 05-translated:
    # <li class="eng hidden">...</li><li class="vn visible">...</li>
    # Let's extract them by their english counter-parts or order.
    # But wait! For the second half, the prepped file has list items like:
    # <li class="eng hidden">Include short-term...</li><li class="vn visible">Include short-term...</li>
    # And in 05-translated, they are already translated. Let's write regex to match:
    # <li class="eng hidden">([^<]+)</li><li class="vn visible">([^<]+)</li>
    li_pair_pattern = re.compile(r'<li\s+class="eng hidden">(.*?)</li>\s*<li\s+class="vn visible">(.*?)</li>', re.DOTALL)
    for eng, vn in li_pair_pattern.findall(content):
        # We can key them by the English text
        translations[eng.strip()] = vn.strip()

    # Figure caption
    # <figcaption class="os-caption-container vn visible">...
    caption_pattern = re.compile(r'<figcaption\s+class="os-caption-container vn visible">(.*?)</figcaption>', re.DOTALL)
    captions = caption_pattern.findall(content)
    if captions:
        translations["figure-caption-vn"] = captions[0].strip()

    # Note headers or subtitles
    # <h4 data-type="title" class="os-subtitle vn visible">...
    sub_pattern = re.compile(r'<h[34]\s+[^>]*class="[^"]*vn visible[^"]*"[^>]*>(.*?)</h[34]>', re.DOTALL)
    for match in sub_pattern.findall(content):
        # Clean title text: e.g., <span class="os-title-label">Work It Out</span>
        # We can map by english title if we want
        pass

    return translations

def merge():
    with open(PREP_FILE, "r", encoding="utf-8") as f:
        prep_lines = f.readlines()

    existing_trans = extract_translations_from_existing()
    print(f"Extracted {len(existing_trans)} translations from existing file.")

    output_lines = []
    
    # We will track list item indices to translate them sequentially for sections we didn't manual-key
    in_manual_section = True
    
    # Simple line-by-line processor for prep template:
    for idx, line in enumerate(prep_lines):
        line_num = idx + 1
        
        # Determine if we are past the manual section (line 56)
        if line_num > 56:
            in_manual_section = False
            
        if in_manual_section:
            # We handle replacements based on manual translations
            if 'id="page_fa5b1b88-df6f-4d1e-83c5-750935b7b502_titlecreatedbycookbook-vn"' in line:
                # Replace title
                line = re.sub(r'(<span data-type="" itemprop="" class="os-text">)(.*?)(</span>)', 
                              rf'\1{manual_translations["page_fa5b1b88-df6f-4d1e-83c5-750935b7b502_titlecreatedbycookbook-vn"]}\3', line)
            elif 'id="fs-idm396110960"' in line:
                # Section 1 header (Learning Objectives)
                line = line.replace('<h3 data-type="title" class="vn visible">Learning Objectives</h3>',
                                    f'<h3 data-type="title" class="vn visible">{manual_translations["learning-objectives-h3-vn"]}</h3>')
            elif 'id="fs-idm418670640-vn"' in line:
                line = re.sub(r'(<p id="fs-idm418670640-vn" class="vn visible">)(.*?)(</p>)',
                              rf'\1{manual_translations["fs-idm418670640-vn"]}\3', line)
            elif 'id="fs-idm408233120"' in line:
                # This line has the ul start. The next lines are lis:
                pass
            elif line.strip().startswith('<li class="eng hidden">Describe workplace challenges') and 'class="vn visible"' in line:
                # Line 17
                line = line.replace('<li class="vn visible">Describe workplace challenges in an entrepreneurial culture</li>',
                                    f'<li class="vn visible">{manual_translations["li-fs-idm408233120-1-vn"]}</li>')
            elif line.strip().startswith('<li class="eng hidden">Distinguish between reactive') and 'class="vn visible"' in line:
                # Line 18
                line = line.replace('<li class="vn visible">Distinguish between reactive and proactive approaches to managing ethics</li>',
                                    f'<li class="vn visible">{manual_translations["li-fs-idm408233120-2-vn"]}</li>')
            elif line.strip().startswith('<li class="eng hidden">Describe the foundations') and 'class="vn visible"' in line:
                # Line 19
                line = line.replace('<li class="vn visible">Describe the foundations and framework of an organizational culture of ethical excellence</li>',
                                    f'<li class="vn visible">{manual_translations["li-fs-idm408233120-3-vn"]}</li>')
            elif line.strip().startswith('<li class="eng hidden">Define the components') and 'class="vn visible"' in line:
                # Line 20
                line = line.replace('<li class="vn visible">Define the components of an ethical workplace</li>',
                                    f'<li class="vn visible">{manual_translations["li-fs-idm408233120-4-vn"]}</li>')
            elif 'id="fs-idm397250112-vn"' in line:
                line = re.sub(r'(<p id="fs-idm397250112-vn" class="vn visible">)(.*?)(</p>)',
                              rf'\1{manual_translations["fs-idm397250112-vn"]}\3', line)
            elif 'id="fs-idm403586224-vn"' in line:
                line = re.sub(r'(<p id="fs-idm403586224-vn" class="vn visible">)(.*?)(</p>)',
                              rf'\1{manual_translations["fs-idm403586224-vn"]}\3', line)
            elif 'id="fs-idm411509520-vn"' in line:
                line = re.sub(r'(<p id="fs-idm411509520-vn" class="vn visible">)(.*?)(</p>)',
                              rf'\1{manual_translations["fs-idm411509520-vn"]}\3', line)
            elif 'id="fs-idm402578080"' in line:
                line = line.replace('<h3 data-type="title" class="vn visible">Entrepreneurial Culture</h3>',
                                    f'<h3 data-type="title" class="vn visible">{manual_translations["entrepreneurial-culture-h3-vn"]}</h3>')
            elif 'id="fs-idm394489856-vn"' in line:
                line = re.sub(r'(<p id="fs-idm394489856-vn" class="vn visible">)(.*?)(</p>)',
                              rf'\1{manual_translations["fs-idm394489856-vn"]}\3', line)
            elif 'id="fs-idm409324976-vn"' in line:
                line = re.sub(r'(<p id="fs-idm409324976-vn" class="vn visible">)(.*?)(</p>)',
                              rf'\1{manual_translations["fs-idm409324976-vn"]}\3', line)
            elif 'id="fs-idm409258976"' in line:
                # Link to Learning 1 title
                line = line.replace('<h3 class="os-title vn visible" data-type="title">\n  <span class="os-title-label">Link to Learning</span>\n</h3>',
                                    f'<h3 class="os-title vn visible" data-type="title">\n  <span class="os-title-label">{manual_translations["link-to-learning-title-1-vn"]}</span>\n</h3>')
            elif 'id="fs-idm403418720-vn"' in line:
                line = re.sub(r'(<p id="fs-idm403418720-vn" class="vn visible">)(.*?)(</p>)',
                              rf'\1{manual_translations["fs-idm403418720-vn"]}\3', line)
            elif 'id="fs-idm384299504-vn"' in line:
                line = re.sub(r'(<p id="fs-idm384299504-vn" class="vn visible">)(.*?)(</p>)',
                              rf'\1{manual_translations["fs-idm384299504-vn"]}\3', line)
            elif 'id="fs-idm384752704-vn"' in line:
                line = re.sub(r'(<p id="fs-idm384752704-vn" class="vn visible">)(.*?)(</p>)',
                              rf'\1{manual_translations["fs-idm384752704-vn"]}\3', line)
            elif 'id="fs-idm383447888-vn"' in line:
                line = re.sub(r'(<p id="fs-idm383447888-vn" class="vn visible">)(.*?)(</p>)',
                              rf'\1{manual_translations["fs-idm383447888-vn"]}\3', line)
            elif 'id="fs-idm397982656-vn"' in line:
                line = re.sub(r'(<p id="fs-idm397982656-vn" class="vn visible">)(.*?)(</p>)',
                              rf'\1{manual_translations["fs-idm397982656-vn"]}\3', line)
            elif 'id="fs-idm407132608-vn"' in line:
                line = re.sub(r'(<p id="fs-idm407132608-vn" class="vn visible">)(.*?)(</p>)',
                              rf'\1{manual_translations["fs-idm407132608-vn"]}\3', line)
            elif 'id="fs-idm395286560-vn"' in line:
                line = re.sub(r'(<p id="fs-idm395286560-vn" class="vn visible">)(.*?)(</p>)',
                              rf'\1{manual_translations["fs-idm395286560-vn"]}\3', line)
            elif 'id="fs-idm407265792-vn"' in line:
                line = re.sub(r'(<p id="fs-idm407265792-vn" class="vn visible">)(.*?)(</p>)',
                              rf'\1{manual_translations["fs-idm407265792-vn"]}\3', line)
            elif 'id="fs-idm409751680-vn"' in line:
                line = re.sub(r'(<p id="fs-idm409751680-vn" class="vn visible">)(.*?)(</p>)',
                              rf'\1{manual_translations["fs-idm409751680-vn"]}\3', line)
            elif 'id="fs-idm409330192"' in line:
                line = line.replace('<h3 class="os-title vn visible" data-type="title">\n  <span class="os-title-label">Link to Learning</span>\n</h3>',
                                    f'<h3 class="os-title vn visible" data-type="title">\n  <span class="os-title-label">{manual_translations["link-to-learning-title-2-vn"]}</span>\n</h3>')
            elif 'id="fs-idm387934160-vn"' in line:
                line = re.sub(r'(<p id="fs-idm387934160-vn" class="vn visible">)(.*?)(</p>)',
                              rf'\1{manual_translations["fs-idm387934160-vn"]}\3', line)

        else:
            # We process replacements based on extracted translations from 05-translated
            # 1. Check for paragraph translations
            p_vn_match = re.search(r'id="([^"]+)-vn"\s+class="vn visible"', line)
            if p_vn_match:
                p_id = f"{p_vn_match.group(1)}-vn"
                if p_id in existing_trans:
                    line = re.sub(r'(<p\s+id="[^"]+-vn"\s+class="vn visible">)(.*?)(</p>)',
                                  rf'\1{existing_trans[p_id]}\3', line)
            
            # 2. Check for figure title/caption
            # <figcaption class="os-caption-container vn visible">
            if 'class="os-caption-container vn visible"' in line:
                # Figure caption is line-wrapped or inline. Let's see:
                # 80: </figcaption><figcaption class="os-caption-container vn visible">
                # 81:   <span class="os-title-label">Figure </span>
                # 82: <span class="os-number">3.6</span>
                # ...
                # 86:   <span class="os-divider"> </span>
                # 87:   <span class="os-caption">Ethical entrepreneurs/managers have these foundational qualities...
                # Actually, the figures in prep have identical English content. In 05-translated, they were translated.
                # Let's do replacements for figure captions:
                pass
            
            # Since figures are few, let's map them specifically:
            # Figure 3.6:
            if line_num in [80, 81, 82, 83, 84, 85, 86, 87, 88]:
                # In prep, lines 80-88:
                # 80: </figcaption><figcaption class="os-caption-container vn visible">
                # 81:   <span class="os-title-label">Figure </span>
                # 82: <span class="os-number">3.6</span>
                # 86:   <span class="os-divider"> </span>
                # 87:   <span class="os-caption">Ethical entrepreneurs/managers have these foundational qualities. (attribution: Copyright Rice University, OpenStax, under CC BY NC-SA 4.0 license)</span>
                # 88: </figcaption>
                # Let's translate: "Figure" -> "Hình", caption -> "Các nhà khởi nghiệp/nhà quản lý có đạo đức sở hữu những phẩm chất nền tảng này. (Nguồn: Bản quyền thuộc Đại học Rice, OpenStax, theo giấy phép CC BY NC-SA 4.0)"
                if '<span class="os-title-label">Figure </span>' in line:
                    line = line.replace('Figure ', 'Hình ')
                elif 'Ethical entrepreneurs/managers have these' in line:
                    line = re.sub(r'(<span class="os-caption">)(.*?)(</span>)',
                                  r'\1Các nhà khởi nghiệp/nhà quản lý có đạo đức sở hữu những phẩm chất nền tảng này. (Nguồn: Bản quyền thuộc Đại học Rice, OpenStax, theo giấy phép CC BY NC-SA 4.0)\3', line)
            
            # Figure 3.7:
            # Prep lines 191-199:
            # 191: </figcaption><figcaption class="os-caption-container vn visible">
            # 192:   <span class="os-title-label">Figure </span>
            # 193: <span class="os-number">3.7</span>
            # 197:   <span class="os-divider"> </span>
            # 198:   <span class="os-caption">Delivering responsible results involves multiple considerations. (attribution: Copyright Rice University, OpenStax, under CC BY NC-SA 4.0 license)</span>
            # 199: </figcaption>
            if line_num in [191, 192, 193, 194, 195, 196, 197, 198, 199]:
                if '<span class="os-title-label">Figure </span>' in line:
                    line = line.replace('Figure ', 'Hình ')
                elif 'Delivering responsible results' in line:
                    line = re.sub(r'(<span class="os-caption">)(.*?)(</span>)',
                                  r'\1Việc mang lại kết quả có trách nhiệm liên quan đến nhiều yếu tố cân nhắc. (Nguồn: Bản quyền thuộc Đại học Rice, OpenStax, theo giấy phép CC BY NC-SA 4.0)\3', line)

            # 3. Check for list items
            # <li class="eng hidden">...</li><li class="vn visible">...</li>
            # If we find a list item, we can extract its English text and see if we have a translation in existing_trans
            li_vn_match = re.search(r'<li class="vn visible">(.*?)</li>', line)
            if li_vn_match:
                vn_text = li_vn_match.group(1).strip()
                # Check if this English text has an existing translation:
                if vn_text in existing_trans:
                    line = line.replace(f'<li class="vn visible">{vn_text}</li>',
                                        f'<li class="vn visible">{existing_trans[vn_text]}</li>')
            
            # 4. Check for headers/subtitles
            # <h3 data-type="title" class="vn visible">Develop a Grander Purpose</h3>
            if '<h3 data-type="title" class="vn visible">Develop a Grander Purpose</h3>' in line:
                line = line.replace('Develop a Grander Purpose', 'Phát triển một mục tiêu cao cả hơn')
            elif '<h3 data-type="title" class="vn visible">Develop a Culture of Collaborative Excellence</h3>' in line:
                line = line.replace('Develop a Culture of Collaborative Excellence', 'Phát triển văn hóa cộng tác xuất sắc')
            elif '<h3 data-type="title" class="vn visible">Human Resources Development</h3>' in line:
                line = line.replace('Human Resources Development', 'Phát triển nguồn nhân lực')
            elif '<h3 data-type="title" class="vn visible">Develop Ethical and Responsible Leadership/Management</h3>' in line:
                line = line.replace('Develop Ethical and Responsible Leadership/Management', 'Phát triển năng lực lãnh đạo/quản lý có đạo đức và trách nhiệm')
            elif '<h3 data-type="title" class="vn visible">Develop Internal/External Organizational Alignment and Cohesion</h3>' in line:
                line = line.replace('Develop Internal/External Organizational Alignment and Cohesion', 'Phát triển sự liên kết và gắn kết tổ chức bên trong/bên ngoài')
            elif '<h3 data-type="title" class="vn visible">Develop a Culture of Creativity and Innovation</h3>' in line:
                line = line.replace('Develop a Culture of Creativity and Innovation', 'Phát triển văn hóa sáng tạo và đổi mới')
            elif '<h3 data-type="title" class="vn visible">Develop a Culture of Delivering Responsible Results</h3>' in line:
                line = line.replace('Develop a Culture of Delivering Responsible Results', 'Phát triển văn hóa mang lại kết quả có trách nhiệm')
            elif '<h3 data-type="title" class="vn visible">Creating an Ethical and Responsible Workplace Environment</h3>' in line:
                line = line.replace('Creating an Ethical and Responsible Workplace Environment', 'Tạo dựng môi trường làm việc có đạo đức và trách nhiệm')
            
            # Subheaders (h4)
            elif '<h4 data-type="title" class="vn visible">Proactive versus Reactive Approaches</h4>' in line:
                line = line.replace('Proactive versus Reactive Approaches', 'Cách tiếp cận chủ động so với phản ứng')
            elif '<h4 data-type="title" class="vn visible">Develop a Grander Purpose</h4>' in line:
                line = line.replace('Develop a Grander Purpose', 'Phát triển mục tiêu cao cả hơn')
            elif '<h4 data-type="title" class="vn visible">Human Resources Development</h4>' in line:
                line = line.replace('Human Resources Development', 'Phát triển nguồn nhân lực')
            elif '<h4 data-type="title" class="vn visible">Prejudice</h4>' in line:
                line = line.replace('Prejudice', 'Định kiến')
            
            # Note titles
            # Work It Out -> Thử làm
            elif 'class="os-title vn visible"' in line and 'Work It Out' in line:
                line = line.replace('Work It Out', 'Thử làm')
            # What Can You Do? -> Bạn có thể làm gì?
            elif 'class="os-title vn visible"' in line and 'What Can You Do?' in line:
                line = line.replace('What Can You Do?', 'Bạn có thể làm gì?')
            # Entrepreneur In Action -> Doanh nhân thực chiến
            elif 'class="os-title vn visible"' in line and 'Entrepreneur In Action' in line:
                line = line.replace('Entrepreneur In Action', 'Doanh nhân thực chiến')
            # Subtitle of Work It Out:
            # <span class="os-subtitle-label">Growing Collaboration and Creativity</span>
            elif '<span class="os-subtitle-label">Growing Collaboration and Creativity</span>' in line and 'class="os-subtitle vn visible"' in prep_lines[line_num - 2]:
                line = line.replace('Growing Collaboration and Creativity', 'Thúc đẩy sự hợp tác và sáng tạo')
            # Subtitle of What Can You Do?:
            # <span class="os-subtitle-label">Entrepreneurs Must Not Just Talk the Talk but Walk the Walk</span>
            elif '<span class="os-subtitle-label">Entrepreneurs Must Not Just Talk the Talk but Walk the Walk</span>' in line and 'class="os-subtitle vn visible"' in prep_lines[line_num - 2]:
                line = line.replace('Entrepreneurs Must Not Just Talk the Talk but Walk the Walk', 'Doanh nhân không chỉ nói suông mà phải hành động đi đôi với lời nói')
            # Subtitle of Entrepreneur in Action:
            # <span class="os-subtitle-label">Unilever “Enhancing Livelihoods” through Project Shakti</span>
            elif '<span class="os-subtitle-label">Unilever “Enhancing Livelihoods” through Project Shakti</span>' in line and 'class="os-subtitle vn visible"' in prep_lines[line_num - 2]:
                line = line.replace('Unilever “Enhancing Livelihoods” through Project Shakti', 'Unilever “Cải thiện kế sinh nhai” thông qua Dự án Shakti')
            # Subtitle of Entrepreneur in Action 2:
            # <span class="os-subtitle-label">Taking the Ethical High Road</span>
            elif '<span class="os-subtitle-label">Taking the Ethical High Road</span>' in line and 'class="os-subtitle vn visible"' in prep_lines[line_num - 2]:
                line = line.replace('Taking the Ethical High Road', 'Lựa chọn con đường đạo đức cao thượng')
            
        output_lines.append(line)

    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        f.writelines(output_lines)
    print(f"Successfully wrote merged file to {OUTPUT_FILE}")

if __name__ == "__main__":
    merge()
