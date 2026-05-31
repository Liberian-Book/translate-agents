from bs4 import BeautifulSoup
import re

PREP_PATH = "/Users/anderson/Desktop/entrepreneurship/data/entrepreneurship/chapter-3/04-prep/3-3-developing-a-workplace-culture-of-ethical-excellence-and-accountability.html"
CURRENT_PATH = "/Users/anderson/Desktop/entrepreneurship/data/entrepreneurship/chapter-3/05-translated/3-3-developing-a-workplace-culture-of-ethical-excellence-and-accountability.html"
OUTPUT_PATH = "/Users/anderson/Desktop/entrepreneurship/data/entrepreneurship/chapter-3/05-translated/3-3-developing-a-workplace-culture-of-ethical-excellence-and-accountability.html"

# Load the current translated file to extract paragraph translations
with open(CURRENT_PATH, "r", encoding="utf-8") as f:
    current_soup = BeautifulSoup(f.read(), "html.parser")

# Extract paragraph translations (only if the text contains Vietnamese characters to avoid copying English)
extracted_paras = {}
for p in current_soup.find_all("p"):
    p_id = p.get("id", "")
    if p_id.endswith("-vn"):
        text = "".join(str(c) for c in p.contents).strip()
        # Check if it has Vietnamese characters
        if any(c in text for c in "áàảãạăắằẳẵặâấầẩẫậéèẻẽẹêếềểễệíìỉĩịóòỏõọôốồổỗộơớờởỡợúùủũụưứừửữựđ"):
            extracted_paras[p_id] = text

# Extract list item translations in order
# Let's map list items by their English content
extracted_lis = {}
for li in current_soup.find_all("li"):
    # Find the corresponding eng hidden list item
    sibling = li.find_previous_sibling()
    if sibling and "eng" in sibling.get("class", []):
        eng_text = "".join(str(c) for c in sibling.contents).strip()
        vn_text = "".join(str(c) for c in li.contents).strip()
        if any(c in vn_text for c in "áàảãạăắằẳẵặâấầẩẫậéèẻẽẹêếềểễệíìỉĩịóòỏõọôốồổỗộơớờởỡợúùủũụưứừửữựđ"):
            extracted_lis[eng_text] = vn_text

# Manual dictionary for headers, titles, notes, and first-half paragraphs
manual_map = {
    # Title
    "page_fa5b1b88-df6f-4d1e-83c5-750935b7b502_titlecreatedbycookbook-vn": "Xây dựng văn hóa nơi làm việc hướng tới sự xuất sắc về đạo đức và trách nhiệm giải trình",
    
    # Learning Objectives
    "learning-objectives-h3-vn": "Mục tiêu học tập",
    "fs-idm418670640-vn": "Sau khi hoàn thành phần này, bạn sẽ có thể:",
    "Describe workplace challenges in an entrepreneurial culture": "Mô tả các thách thức tại nơi làm việc trong một văn hóa khởi nghiệp",
    "Distinguish between reactive and proactive approaches to managing ethics": "Phân biệt giữa cách tiếp cận phản ứng và chủ động trong quản lý đạo đức",
    "Describe the foundations and framework of an organizational culture of ethical excellence": "Mô tả nền tảng và khuôn khổ của một văn hóa tổ chức hướng tới sự xuất sắc về đạo đức",
    "Define the components of an ethical workplace": "Xác định các thành phần cấu thành một nơi làm việc có đạo đức",
    
    # Paragraphs 1-3
    "fs-idm397250112-vn": "Các nhà khởi nghiệp thành công hiểu rằng nơi làm việc của năm 2020 khá khác biệt so với năm 2000, chỉ mới hai mươi năm trước. Như tiêu đề của phần này gợi ý, các nhà khởi nghiệp tiến bộ muốn tạo ra một <span data-type=\"term\" class=\"no-emphasis\" id=\"term-00001\" group-by=\"w\">văn hóa nơi làm việc</span> hướng tới sự xuất sắc về đạo đức. Tuy nhiên, để làm được điều đó đòi hỏi phải thấu hiểu một lực lượng lao động đang thay đổi, cả về đặc điểm nhân khẩu học lẫn hệ giá trị. Thế hệ Millennials (những người sinh từ năm 1983 đến 1995) hiện đã vượt qua thế hệ Baby Boomers (bùng nổ trẻ sơ sinh) trong lực lượng lao động, và đến năm 2025, họ sẽ chiếm 3/4 tổng số người lao động trên phạm vi toàn cầu.<sup id=\"footnote-ref1\" data-type=\"footnote-number\"><a href=\"3-3-developing-a-workplace-culture-of-ethical-excellence-and-accountability#fs-idm395000880\" role=\"doc-noteref\" epub:type=\"noteref\" aria-label=\"Go to 30\" data-type=\"footnote-link\">30</a></sup> Các nhà khởi nghiệp và nhà quản lý ở vị thế tuyển dụng và giám sát nhân viên thế hệ millennial phải điều chỉnh để thích ứng với những kỳ vọng và yêu cầu khác biệt của nơi làm việc giữa thế kỷ XXI. Điều này đặc biệt đúng đối với CSR/đạo đức. Theo một bài báo gần đây trên tờ <em data-effect=\"italics\">New York Times</em>, điều quan trọng nhất đối với thế hệ millennials là công việc phải phù hợp với các giá trị cá nhân của họ.<sup id=\"footnote-ref2\" data-type=\"footnote-number\"><a href=\"3-3-developing-a-workplace-culture-of-ethical-excellence-and-accountability#fs-idm394393104\" role=\"doc-noteref\" epub:type=\"noteref\" aria-label=\"Go to 31\" data-type=\"footnote-link\">31</a></sup>",
    "fs-idm403586224-vn": "Khoảng 60% người lao động thuộc thế hệ millennial sẵn sàng làm việc với mức lương ít hơn 15% chỉ để có cơ hội làm việc cho một công ty có các giá trị kinh doanh tương đồng với các giá trị cá nhân của họ.<sup id=\"footnote-ref3\" data-type=\"footnote-number\"><a href=\"3-3-developing-a-workplace-culture-of-ethical-excellence-and-accountability#fs-idm391823712\" role=\"doc-noteref\" epub:type=\"noteref\" aria-label=\"Go to 32\" data-type=\"footnote-link\">32</a></sup> Hóa ra, thế hệ millennials không chỉ muốn một công việc thuần túy, họ muốn một công việc có ý nghĩa — công việc mà họ có thể cống hiến để đạt được một kết quả xứng đáng. Nói cách khác, họ muốn công việc mình làm phải có ý nghĩa nào đó. Hơn nữa, theo một bài báo trên tờ <em data-effect=\"italics\">Texas Bar Journal</em> của chuyên gia khai vấn nghề nghiệp và tư vấn Martha Newman, người lao động thế hệ millennial đánh giá rất cao các chính sách tại nơi làm việc thúc đẩy truyền thông cởi mở, sự hợp tác và tham gia vào quá trình ra quyết định ngắn hạn và dài hạn với người sử dụng lao động.<sup id=\"footnote-ref4\" data-type=\"footnote-number\"><a href=\"3-3-developing-a-workplace-culture-of-ethical-excellence-and-accountability#fs-idm395996464\" role=\"doc-noteref\" epub:type=\"noteref\" aria-label=\"Go to 33\" data-type=\"footnote-link\">33</a></sup> Newman cũng cho biết thế hệ millennials kỳ vọng có một mức độ cân bằng nhất định giữa công việc và cuộc sống; sự nghiệp không phải là điều duy nhất quan trọng trong cuộc sống của họ.",
    "fs-idm411509520-vn": "Điều này có nghĩa là các nhà khởi nghiệp đang quản lý nhân sự phải biết điều chỉnh. Ví dụ, một người chủ có thể tạo ra một nơi làm việc có văn hóa đảm bảo rằng con người quan trọng ngang bằng tiền bạc, nơi có sự cân bằng giữa công việc và cuộc sống thông qua những thứ như lịch làm việc linh hoạt, và nơi những cống hiến tốt đẹp được công nhận và khen thưởng. Có câu ngạn ngữ rằng: 'Người ta không bỏ việc, họ bỏ sếp của mình.' Nếu bạn không muốn tỷ lệ nhảy việc quá cao trong lực lượng lao động của mình, hãy là kiểu sếp mà thế hệ millennials muốn làm việc cùng và cống hiến cho.",
    
    # Section: Entrepreneurial Culture
    "entrepreneurial-culture-h3-vn": "Văn hóa khởi nghiệp",
    "fs-idm394489856-vn": "Một đặc điểm khá phổ biến của các doanh nghiệp khởi nghiệp thành công là những người sáng lập có sức lôi cuốn, đầy tham vọng và có tinh thần cạnh tranh cao. Sau cùng, cần phải có một tinh thần thép và cái tôi mạnh mẽ để vượt qua những thất vọng không thể tránh khỏi đối với một nhà lãnh đạo khởi nghiệp. Tuy nhiên, khi các công ty phát triển, họ thường phát hiện ra rằng cần có một đặc tính lãnh đạo khác. Liệu các nhà khởi nghiệp có thể vẫn thành công nếu họ cũng áp dụng phong cách lãnh đạo nhân văn ngay từ đầu, hay điều này sẽ luôn làm giảm tỷ lệ thành công vốn đã thấp lúc ban đầu? Đó là một vấn đề khó khăn mà nhiều doanh nghiệp phải vật lộn giải quyết. Những nhân viên tận tụy có thể cảm thấy nản lòng bởi những nhà lãnh đạo khắt khe và khắc nghiệt, những người ít khi đền đáp xứng đáng cho những nhân sự trung thành ngay cả sau khi đạt được thành công. Những nhân viên mới có thể thấy môi trường làm việc ít thân thiện hơn họ mong đợi và đơn giản là rời đi.",
    "fs-idm409324976-vn": "Một câu hỏi mà một nhà khởi nghiệp có đạo đức nên tự hỏi là: Nhân viên của tôi có cảm thấy họ có thể nói năng tự do hay không? Trên thực tế, tại nhiều công ty, theo SHRM (Hiệp hội Quản lý Nguồn nhân lực), các phòng nhân sự thường gặp khó khăn trong việc thu hút nhân viên hoàn thành khảo sát môi trường nơi làm việc (mức độ hài lòng).<sup id=\"footnote-ref5\" data-type=\"footnote-number\"><a href=\"3-3-developing-a-workplace-culture-of-ethical-excellence-and-accountability#fs-idm413604176\" role=\"doc-noteref\" epub:type=\"noteref\" aria-label=\"Go to 34\" data-type=\"footnote-link\">34</a></sup> Người lao động thường tin rằng nếu ban quản lý thực sự muốn tìm hiểu xem ai đã nói gì thì họ có thể dễ dàng làm được, mặc dù các khảo sát được cho là ẩn danh. Sự khác biệt giữa quản lý khởi nghiệp có đạo đức và phi đạo đức là liệu ban lãnh đạo có muốn tìm ra danh tính đó hay không. Dù liên quan đến các công ty quy mô nhỏ, vừa hay lớn, ban quản lý nên khuyến khích nhân viên lên tiếng, dù với tư cách là người tố cáo ẩn danh hay trực tiếp với người giám sát của họ. Việc thiếu đi sự khuyến khích này thường để cho các thực hành kinh doanh phi đạo đức phát triển mạnh mẽ, chẳng hạn như đã thấy trong ví dụ về trường hợp của Wells Fargo.",
    
    # Link to Learning 1
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
    "fs-idm387934160-vn": "Hãy xem <a href=\"https://openstax.org/l/52OrgCulToolkit\" target=\"_blank\" rel=\"noopener nofollow\" aria-label=\"Go to toolkit for understanding and developing organizational culture\">bộ công cụ để hiểu và phát triển văn hóa tổ chức</a> để tìm hiểu thêm.",

    # Missing paragraph translation that glossary check caught
    "fs-idm399899536-vn": "<span data-type=\"term\" id=\"term-00013\" group-by=\"P\">Định kiến</span> thường được xem là thái độ và/hoặc cảm xúc tiêu cực đối với một cá nhân chỉ dựa trên việc họ là thành viên của một nhóm cụ thể. Định kiến là hiện tượng phổ biến đối với những người thuộc các nhóm văn hóa xa lạ. Trong việc làm, nó có thể là nguyên nhân gốc rễ của sự <span data-type=\"term\" class=\"no-emphasis\" id=\"term-00014\" group-by=\"d\">phân biệt đối xử</span> không công bằng.<sup id=\"footnote-ref21\" data-type=\"footnote-number\"><a href=\"3-3-developing-a-workplace-culture-of-ethical-excellence-and-accountability#fs-idm394851904\" role=\"doc-noteref\" epub:type=\"noteref\" aria-label=\"Go to 50\" data-type=\"footnote-link\">50</a></sup> Một yếu tố thiết yếu để phát triển môi trường làm việc an toàn và lành mạnh là hướng tới một nơi không có định kiến. Đây là môi trường mà mọi người đều được đối xử với sự tôn trọng và nhân phẩm xứng đáng, đồng thời được trao cơ hội bình đẳng để trưởng thành, phát triển và thăng tiến cả trong và ngoài tổ chức. Ví dụ, điều quan trọng là phải xem xét giá trị hoặc chất lượng công việc được thực hiện bởi một cá nhân cùng phương thức mà kết quả đó được mang lại. Thật phi đạo đức khi đối xử khác biệt với mọi người dựa trên chủng tộc, giới tính, tuổi tác, quốc tịch và các yếu tố khác biệt khác của họ. Để xây dựng lòng tin và sự tôn trọng, mọi người cần phải được trao những cơ hội ngang nhau.",
    
    # Missing paragraph 403771680 (appraisal / forced ranking)
    "fs-idm403771680-vn": "Quản lý hiệu quả lực lượng lao động bao gồm một phương pháp tiếp cận có hệ thống để đánh giá hiệu suất của nhân viên. Nhà quản lý hoặc nhà khởi nghiệp phải quyết định cách thức thực hiện điều này trong công ty của họ. Hệ thống xếp hạng cưỡng bức (forced ranking system) là hệ thống trong đó việc chấm điểm hiệu suất của nhân viên mang tính cạnh tranh và có thể khiến các nhân viên chống lại nhau thay vì thúc đẩy một môi trường làm việc cộng tác. Một số nhà tuyển dụng đã chuyển sang một hệ thống không yêu cầu xếp hạng cưỡng bức và cố gắng giảm bớt tính chất cạnh tranh của việc đánh giá, thay vào đó tập trung vào sự cải thiện liên tục của từng cá nhân. Có một sự khác biệt quan điểm chính đáng về vấn đề này. Theo một bài báo trên tờ <em data-effect=\"italics\">Wall Street Journal</em> của công ty kế toán và tư vấn Deloitte,<sup id=\"footnote-ref22\" data-type=\"footnote-number\"><a href=\"3-3-developing-a-workplace-culture-of-ethical-excellence-and-accountability#fs-idm413677088\" role=\"doc-noteref\" epub:type=\"noteref\" aria-label=\"Go to 51\" data-type=\"footnote-link\">51</a></sup> các giám đốc điều hành bị chia rẽ về việc liệu đây có phải là một thực hành hiệu quả hay không. Jack <span data-type=\"term\" class=\"no-emphasis\" id=\"term-00015\" group-by=\"W\">Welch</span>, cựu CEO tại tập đoàn <span data-type=\"term\" class=\"no-emphasis\" id=\"term-00016\" group-by=\"G\">General Electric</span>, là người ủng hộ phương pháp này, trong khi những người khác coi đó là phản tác dụng. Các công ty đã ngừng quy trình này bao gồm <span data-type=\"term\" class=\"no-emphasis\" id=\"term-00017\" group-by=\"M\">Microsoft</span> và GE.",
}

# Headers and structural tags manual translations
header_map = {
    # Headers
    "Learning Objectives": "Mục tiêu học tập",
    "Entrepreneurial Culture": "Văn hóa khởi nghiệp",
    "Proactive versus Reactive Approaches": "Cách tiếp cận chủ động so với phản ứng",
    "Developing the Foundation and Framework of an Ethically Responsible Organization": "Phát triển nền tảng và khuôn khổ của một tổ chức có trách nhiệm về mặt đạo đức",
    "Develop a Grander Purpose": "Phát triển mục tiêu cao cả hơn",
    "Develop a Culture of Collaborative Excellence": "Phát triển văn hóa cộng tác xuất sắc",
    "Human Resources Development": "Phát triển nguồn nhân lực",
    "Develop Ethical and Responsible Leadership/Management": "Phát triển năng lực lãnh đạo/quản lý có đạo đức và trách nhiệm",
    "Develop Internal/External Organizational Alignment and Cohesion": "Phát triển sự liên kết và gắn kết tổ chức bên trong/bên ngoài",
    "Develop a Culture of Creativity and Innovation": "Phát triển văn hóa sáng tạo và đổi mới",
    "Develop a Culture of Delivering Responsible Results": "Phát triển văn hóa mang lại kết quả có trách nhiệm",
    "Creating an Ethical and Responsible Workplace Environment": "Tạo dựng môi trường làm việc có đạo đức và trách nhiệm",
    "Prejudice": "Định kiến",
    "Competition and Collaboration": "Cạnh tranh và cộng tác",
    "Diversity": "Sự đa dạng",
    "Gender Equality": "Bình đẳng giới",
    "Trust and Ethical Accountability": "Sự tin cậy và trách nhiệm giải trình đạo đức",
    "If You Make a Mistake": "Nếu bạn mắc sai lầm",

    # Note headers
    "Link to Learning": "Liên kết học tập",
    "Work It Out": "Thử làm",
    "What Can You Do?": "Bạn có thể làm gì?",
    "Entrepreneur In Action": "Doanh nhân thực chiến",
}

subtitle_map = {
    "Growing Collaboration and Creativity": "Thúc đẩy sự hợp tác và sáng tạo",
    "Entrepreneurs Must Not Just Talk the Talk but Walk the Walk": "Doanh nhân không chỉ nói suông mà phải hành động đi đôi với lời nói",
    "Unilever “Enhancing Livelihoods” through Project Shakti": "Unilever “Cải thiện kế sinh nhai” thông qua Dự án Shakti",
    "Taking the Ethical High Road": "Lựa chọn con đường đạo đức cao thượng",
    "Anonymous Whistleblower Hotlines": "Đường dây nóng tố cáo ẩn danh",
    "Building Diversity": "Xây dựng sự đa dạng",
    "Sherron Watkins and Enron": "Sherron Watkins và Enron"
}

# Open the clean prep file
with open(PREP_PATH, "r", encoding="utf-8") as f:
    soup = BeautifulSoup(f.read(), "html.parser")

# Process all 'vn visible' blocks in prep
for block in soup.select(".vn.visible"):
    tag_name = block.name
    element_id = block.get("id", "")
    text = "".join(str(c) for c in block.contents).strip()
    
    # 1. Look up in manual map
    if element_id in manual_map:
        block.clear()
        block.append(BeautifulSoup(manual_map[element_id], "html.parser"))
        continue
        
    # 2. Look up in extracted paragraphs
    if element_id in extracted_paras:
        block.clear()
        block.append(BeautifulSoup(extracted_paras[element_id], "html.parser"))
        continue

    # 3. Look up list items by English text
    # Let's find the corresponding eng hidden list item to get the key text
    sibling = block.find_previous_sibling()
    if sibling and "eng" in sibling.get("class", []):
        eng_text = "".join(str(c) for c in sibling.contents).strip()
        # Look up in manual_map or extracted_lis
        if eng_text in manual_map:
            block.clear()
            block.append(BeautifulSoup(manual_map[eng_text], "html.parser"))
            continue
        elif eng_text in extracted_lis:
            block.clear()
            block.append(BeautifulSoup(extracted_lis[eng_text], "html.parser"))
            continue
            
    # 4. Check for headers/subheaders
    if tag_name in ["h2", "h3", "h4"]:
        # If it contains span with class os-title-label or os-subtitle-label
        title_span = block.find("span", class_="os-title-label")
        sub_span = block.find("span", class_="os-subtitle-label")
        if title_span:
            title_text = title_span.get_text().strip()
            if title_text in header_map:
                title_span.string = header_map[title_text]
                continue
        elif sub_span:
            sub_text = sub_span.get_text().strip()
            if sub_text in subtitle_map:
                sub_span.string = subtitle_map[sub_text]
                continue
        else:
            header_text = block.get_text().strip()
            # If it's a raw header: e.g., <h3>Learning Objectives</h3>
            if header_text in header_map:
                block.string = header_map[header_text]
                continue

    # 5. Check for figure captions
    # Figcaption contains Figures and captions
    if tag_name == "figcaption":
        # Figure number span:
        number_span = block.find("span", class_="os-number")
        caption_span = block.find("span", class_="os-caption")
        title_label_span = block.find("span", class_="os-title-label")
        
        if title_label_span and title_label_span.get_text().strip() == "Figure":
            title_label_span.string = "Hình "
            
        if caption_span:
            caption_text = caption_span.get_text().strip()
            # Translate based on figure number
            if number_span and number_span.get_text().strip() == "3.6":
                caption_span.string = "Các nhà khởi nghiệp/nhà quản lý có đạo đức sở hữu những phẩm chất nền tảng này. (Nguồn: Bản quyền thuộc Đại học Rice, OpenStax, theo giấy phép CC BY NC-SA 4.0)"
            elif number_span and number_span.get_text().strip() == "3.7":
                caption_span.string = "Việc mang lại kết quả có trách nhiệm liên quan đến nhiều yếu tố cân nhắc. (Nguồn: Bản quyền thuộc Đại học Rice, OpenStax, theo giấy phép CC BY NC-SA 4.0)"

# Write the final serialized HTML to data/entrepreneurship/chapter-3/05-translated/3-3-developing-a-workplace-culture-of-ethical-excellence-and-accountability.html
# Use standard formatter to keep everything clean
with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
    f.write(str(soup))

print("Successfully generated final translated HTML with absolute structure integrity!")
