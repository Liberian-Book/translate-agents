from bs4 import BeautifulSoup

html_path = "data/entrepreneurship/chapter-3/05-translated/3-2-corporate-social-responsibility-and-social-entrepreneurship.html"

with open(html_path, "r", encoding="utf-8") as f:
    content = f.read()

# Let's inspect some specific snippets in raw content
snippets = [
    "xem",
    "Michael",
    "Enron",
    "Sarbanes-Oxley",
    "Dodd-Frank",
    "General Motors",
    "Bảng 3.2",
    "Bảng 3.3"
]

print("--- RAW HTML SNIPPET CHECK ---")
soup = BeautifulSoup(content, "html.parser")
vn_paras = soup.find_all("p", class_=lambda x: x and 'vn' in x and 'visible' in x)

for vn_p in vn_paras:
    p_html = str(vn_p)
    found_snippets = [s for s in snippets if s in p_html]
    if found_snippets:
        print(f"ID: {vn_p.get('id')} | Matches: {found_snippets}")
        print(p_html)
        print("-" * 100)
