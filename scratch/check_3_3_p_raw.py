from bs4 import BeautifulSoup

html_path = "data/entrepreneurship/chapter-3/05-translated/3-3-developing-a-workplace-culture-of-ethical-excellence-and-accountability.html"

with open(html_path, "r", encoding="utf-8") as f:
    soup = BeautifulSoup(f.read(), "html.parser")

p_vn = soup.find(id="fs-idm384752704-vn")
if p_vn:
    print(str(p_vn))
