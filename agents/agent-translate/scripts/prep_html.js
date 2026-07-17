const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

function prepFile(inFile, outFile) {
    const html = fs.readFileSync(inFile, 'utf-8');
    const $ = cheerio.load(html);

    // Add style if not exists
    if ($('head style').length === 0) {
        $('head').append('\n<style>\n.eng.hidden { display: none; }\n.vn.visible { color: #000; }\n</style>\n');
    }

    const tagsToDuplicate = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'li', 'caption', 'figcaption', 'th', 'td'];

    tagsToDuplicate.forEach(tagName => {
        $(tagName).each(function() {
            const el = $(this);
            
            // Check if it contains another duplicatable tag
            let containsBlock = false;
            for (const childTag of tagsToDuplicate) {
                if (el.find(childTag).length > 0) {
                    containsBlock = true;
                    break;
                }
            }
            
            if (containsBlock) return;
            
            // Skip if already prepped
            if (el.hasClass('eng') && el.hasClass('hidden')) return;
            if (el.hasClass('vn') && el.hasClass('visible')) return;

            const clone = el.clone();

            // Modify original
            el.addClass('eng hidden');

            // Modify clone
            clone.removeClass('eng hidden');
            clone.addClass('vn visible');
            
            if (clone.attr('id')) {
                clone.attr('id', clone.attr('id') + '-vn');
            }

            el.after(clone);
        });
    });

    fs.mkdirSync(path.dirname(outFile), { recursive: true });
    fs.writeFileSync(outFile, $.html());
    console.log(`Prepped ${outFile}`);
}

function findProjectRoot(currentDir) {
    let dir = currentDir;
    for (let i = 0; i < 10; i++) {
        if (fs.existsSync(path.join(dir, 'package.json'))) {
            return dir;
        }
        dir = path.dirname(dir);
    }
    return null;
}

function prepBook(bookName) {
    const projectRoot = findProjectRoot(__dirname);
    if (!projectRoot) {
        console.error('Could not find project root containing package.json.');
        process.exit(1);
    }

    const bookDir = path.join(projectRoot, 'data', bookName);
    const cleanDir = path.join(bookDir, 'clean');
    const prepDir = path.join(bookDir, 'prep');

    if (!fs.existsSync(cleanDir)) {
        console.error(`Clean directory not found: ${cleanDir}`);
        process.exit(1);
    }

    const htmlFiles = fs.readdirSync(cleanDir).filter(file => file.endsWith('.html'));
    if (htmlFiles.length === 0) {
        console.error(`No HTML files found in: ${cleanDir}`);
        process.exit(1);
    }

    fs.mkdirSync(prepDir, { recursive: true });
    console.log(`Preparing ${htmlFiles.length} files from ${cleanDir}`);

    for (const file of htmlFiles) {
        prepFile(path.join(cleanDir, file), path.join(prepDir, file));
    }

    console.log(`Prepared ${htmlFiles.length} files into ${prepDir}`);
}

const inFile = process.argv[2];
const outFile = process.argv[3];
if (inFile && outFile) {
    prepFile(inFile, outFile);
} else if (inFile) {
    prepBook(inFile);
} else {
    console.log('Usage:');
    console.log('  node prep_html.js <bookName>');
    console.log('  node prep_html.js <inFile> <outFile>');
}
