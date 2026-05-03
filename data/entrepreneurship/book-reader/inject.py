import os
import glob

# Path to the translated html files
directory = '/Users/anderson/Desktop/the entreuper/data/entrepreneurship/chapter-1/05-translated/'

# Content to inject
css_link = '<link rel="stylesheet" href="../../book-reader/book-reader.css">\n'
js_link = '<script src="../../book-reader/book-reader.js"></script>\n'

html_files = glob.glob(os.path.join(directory, '*.html'))

for file_path in html_files:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Check if already injected
    if 'book-reader.js' in content:
        print(f"Skipping {os.path.basename(file_path)}, already injected.")
        continue

    # Inject right before </head>
    if '</head>' in content:
        content = content.replace('</head>', f'{css_link}{js_link}</head>')
        
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Injected into {os.path.basename(file_path)}")
    else:
        print(f"Warning: No </head> found in {os.path.basename(file_path)}")
