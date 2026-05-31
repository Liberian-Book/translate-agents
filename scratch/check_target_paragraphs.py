from bs4 import BeautifulSoup

html_path = "data/entrepreneurship/chapter-3/05-translated/3-2-corporate-social-responsibility-and-social-entrepreneurship.html"

with open(html_path, "r", encoding="utf-8") as f:
    soup = BeautifulSoup(f.read(), "html.parser")

target_ids = ["fs-idm198811984-vn", "fs-idm296032672-vn", "fs-idm207903600-vn", "fs-idm197530448-vn"]

print("--- TARGET PARAGRAPHS RAW HTML ---")
for t_id in target_ids:
    el = soup.find(id=t_id)
    if el:
        print(f"ID: {t_id}")
        print(str(el))
        print("-" * 80)
