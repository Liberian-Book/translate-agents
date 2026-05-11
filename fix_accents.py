from bs4 import BeautifulSoup

html_path = 'data/entrepreneurship/chapter-11/05-translated/11-4-the-business-plan.html'
with open(html_path, 'r', encoding='utf-8') as f:
    content = f.read()

# We only want to replace specific known words in the english hidden text.
# Actually, it's safe to just replace 'González' -> 'Gonzalez', 'José Andrés' -> 'Jose Andres', 'cafés' -> 'cafes', 'entrée' -> 'entree'
# But ONLY in class="eng hidden" tags or just globally? It's better to just string replace globally because it's English text anyway? No! If we replace globally, it will break the Vietnamese text if they happen to use the word "cafés" or "González"? Well, Vietnamese uses "Gonzalez" (sometimes without accents) or keeps "González".
# Wait, replacing them in the whole document might alter Vietnamese text, but those are proper nouns.
# Let's do it safely using bs4, modifying ONLY `eng hidden` elements.

with open(html_path, 'r', encoding='utf-8') as f:
    soup = BeautifulSoup(f, 'html.parser')

eng_elements = soup.find_all(class_=lambda x: x and 'eng' in x.split() and 'hidden' in x.split())
replacements = {
    'González': 'Gonzalez',
    'José Andrés': 'Jose Andres',
    'cafés': 'cafes',
    'entrée': 'entree'
}

changed = False
for el in eng_elements:
    for text_node in el.find_all(string=True):
        new_text = text_node
        for old, new in replacements.items():
            if old in new_text:
                new_text = new_text.replace(old, new)
        
        if new_text != text_node:
            text_node.replace_with(new_text)
            changed = True

if changed:
    with open(html_path, 'w', encoding='utf-8') as f:
        f.write(str(soup))
    print("Fixed accents.")
else:
    print("No accents to fix.")

