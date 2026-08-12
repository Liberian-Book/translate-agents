document.addEventListener('DOMContentLoaded', () => {
  // 1. Restructure DOM
  const body = document.body;
  const bookTitle = formatBookTitle(getBookIdFromPath());

  const siteHeader = document.createElement('header');
  siteHeader.className = 'br-site-header';
  siteHeader.innerHTML = `
    <div class="br-site-header-inner">
      <a class="br-site-brand" href="/" aria-label="Về trang chủ Bột">
        <span class="br-site-logo">B</span>
        <span>Bột</span>
      </a>
      <div class="br-site-book-title">${escapeHtml(bookTitle)}</div>
      <nav class="br-site-nav" aria-label="Điều hướng trang sách">
        <a href="/">Thư viện</a>
        <a href="https://openstax.org" target="_blank" rel="noopener">OpenStax</a>
      </nav>
    </div>
  `;

  const readerLayout = document.createElement('div');
  readerLayout.id = 'br-reader-layout';

  const tocToggle = document.createElement('button');
  tocToggle.id = 'br-toc-toggle';
  tocToggle.type = 'button';
  tocToggle.setAttribute('aria-controls', 'br-toc-sidebar');
  tocToggle.setAttribute('aria-expanded', 'false');
  tocToggle.textContent = 'Mở mục lục';

  const mainContent = document.createElement('main');
  mainContent.id = 'br-main-content';
  mainContent.setAttribute('aria-label', 'Nội dung sách đã dịch');

  const readerToolbar = document.createElement('div');
  readerToolbar.id = 'br-reader-toolbar';
  readerToolbar.innerHTML = `
    <div class="br-reader-toolbar-title">Trình đọc sách</div>
    <div class="br-reader-toolbar-actions" aria-label="Điều hướng trang">
      <a id="br-review-link" class="br-review-link" href="${escapeHtml(getCurrentReviewHref())}">Review</a>
      <button id="br-prev-btn" type="button" title="Trang trước" aria-label="Trang trước">&larr;</button>
      <button id="br-next-btn" type="button" title="Trang sau" aria-label="Trang sau">&rarr;</button>
    </div>
  `;

  const articleContent = document.createElement('article');
  articleContent.id = 'br-article-content';

  // Move the translated page body into the reader content pane.
  while (body.firstChild) {
    articleContent.appendChild(body.firstChild);
  }
  mainContent.appendChild(readerToolbar);
  mainContent.appendChild(articleContent);

  const tocSidebar = createBookToc(window.BOOK_PAGES || []);

  // Append back to body
  readerLayout.appendChild(tocSidebar);
  readerLayout.appendChild(mainContent);
  body.appendChild(siteHeader);
  body.appendChild(tocToggle);
  body.appendChild(readerLayout);

  const mobileTocQuery = window.matchMedia('(max-width: 800px)');

  tocToggle.addEventListener('click', () => {
    setMobileTocOpen(!body.classList.contains('br-toc-open'));
  });
  mobileTocQuery.addEventListener('change', () => updateTocAccessibility());
  updateTocAccessibility();

  function setMobileTocOpen(isOpen) {
    body.classList.toggle('br-toc-open', isOpen);
    tocToggle.setAttribute('aria-expanded', String(isOpen));
    tocToggle.textContent = isOpen ? 'Đóng mục lục' : 'Mở mục lục';
    updateTocAccessibility();
  }

  function updateTocAccessibility() {
    const shouldHideToc = mobileTocQuery.matches && !body.classList.contains('br-toc-open');
    tocSidebar.toggleAttribute('inert', shouldHideToc);
    tocSidebar.setAttribute('aria-hidden', String(shouldHideToc));
    tocSidebar.querySelectorAll('a, button, summary, [tabindex]').forEach(element => {
      if (shouldHideToc) {
        if (element.hasAttribute('tabindex')) element.dataset.brPreviousTabindex = element.getAttribute('tabindex') || '';
        element.setAttribute('tabindex', '-1');
      } else if (element.dataset.brPreviousTabindex !== undefined) {
        element.setAttribute('tabindex', element.dataset.brPreviousTabindex);
        delete element.dataset.brPreviousTabindex;
      } else {
        element.removeAttribute('tabindex');
      }
    });
  }

  function getBookIdFromPath() {
    const parts = window.location.pathname.split('/').filter(Boolean);
    const booksIndex = parts.indexOf('books');
    if (booksIndex !== -1 && parts[booksIndex + 1]) return parts[booksIndex + 1];
    return parts[0] || 'book';
  }

  function formatBookTitle(slug) {
    const vietnameseBookTitles = {
      'business-ethics': 'Đạo đức kinh doanh',
      entrepreneurship: 'Khởi nghiệp',
      'introduction-computer-science': 'Nhập môn Khoa học máy tính',
      'introduction-philosophy': 'Nhập môn Triết học',
      'principles-finance': 'Nguyên lý Tài chính',
      'world-history-volume-1': 'Lịch sử Thế giới, Tập 1: Đến năm 1500',
    };
    if (vietnameseBookTitles[slug]) return vietnameseBookTitles[slug];

    return slug
      .split(/[-_\s]+/)
      .filter(Boolean)
      .map(word => `${word[0].toUpperCase()}${word.slice(1)}`)
      .join(' ');
  }

  function createBookToc(pages) {
    const nav = document.createElement('nav');
    nav.id = 'br-toc-sidebar';
    nav.setAttribute('aria-label', 'Mục lục sách');

    if (!Array.isArray(pages) || pages.length === 0) {
      nav.innerHTML = '<h2>Mục lục</h2><p class="br-toc-empty">Chưa có mục lục.</p>';
      return nav;
    }

    const currentFile = getCurrentFileName();
    const currentBookPath = getCurrentBookRelativePath();
    const tocItems = buildTocItems(pages, currentBookPath, currentFile).map(item => {
      if (item.type === 'chapter') {
        const links = item.pages.map(page => renderTocLink(page)).join('');
        return `
          <li class="br-toc-chapter">
            <details${item.isCurrent ? ' open' : ''}>
              <summary><span class="br-toc-chapter-number">${escapeHtml(item.chapter)}</span><span>${escapeHtml(item.title)}</span></summary>
              <ol class="br-toc-sublist">${links}</ol>
            </details>
          </li>
        `;
      }

      return renderTocLink(item.page);
    }).join('');

    nav.innerHTML = `
      <h2>Mục lục</h2>
      <ol class="br-toc-list">${tocItems}</ol>
    `;
    persistTocNavigation(nav);
    enableTocAccordion(nav);
    restoreActiveTocItem(nav, currentBookPath);
    return nav;
  }

  function persistTocNavigation(nav) {
    nav.querySelectorAll('.br-toc-link[data-toc-path]').forEach(link => {
      link.addEventListener('click', () => {
        try {
          window.localStorage.setItem('br-active-toc-path', link.dataset.tocPath || '');
        } catch (_error) {
          // Local storage can be unavailable in strict browser modes; navigation still works.
        }

        closeMobileToc();
      });
    });
  }

  function closeMobileToc() {
    setMobileTocOpen(false);
  }

  function restoreActiveTocItem(nav, currentBookPath) {
    const storedPath = getStoredActiveTocPath();
    const activePath = storedPath === currentBookPath ? storedPath : currentBookPath;
    const activeLink = nav.querySelector(`.br-toc-link[data-toc-path="${cssEscape(activePath)}"]`) || nav.querySelector('.br-toc-link[aria-current="page"]');
    if (!activeLink) return;

    nav.querySelectorAll('.br-toc-link.is-current').forEach(link => {
      link.classList.remove('is-current');
      link.removeAttribute('aria-current');
    });

    activeLink.classList.add('is-current');
    activeLink.setAttribute('aria-current', 'page');
    activeLink.closest('details')?.setAttribute('open', '');
    requestAnimationFrame(() => activeLink.scrollIntoView({ block: 'nearest' }));
  }

  function getStoredActiveTocPath() {
    try {
      const stored = window.localStorage.getItem('br-active-toc-path');
      return stored ? normalizePath(stored) : '';
    } catch (_error) {
      return '';
    }
  }

  function enableTocAccordion(nav) {
    nav.querySelectorAll('.br-toc-chapter summary').forEach(summary => {
      summary.addEventListener('click', event => {
        event.preventDefault();
        const details = summary.closest('details');
        if (!details || details.open) return;

        nav.querySelectorAll('.br-toc-chapter details[open]').forEach(openDetails => {
          openDetails.removeAttribute('open');
        });
        details.setAttribute('open', '');
      });
    });
  }

  function buildTocItems(pages, currentBookPath, currentFile) {
    const items = [];
    const chapterItems = new Map();

    for (const page of pages) {
      const tocPage = getTocPage(page, currentBookPath, currentFile);
      const chapter = getPageChapter(tocPage.manifestHref);

      if (!chapter) {
        items.push({ type: 'page', page: tocPage });
        continue;
      }

      if (!chapterItems.has(chapter)) {
        const chapterItem = {
          type: 'chapter',
          chapter,
          title: `Chương ${chapter}`,
          pages: [],
          isCurrent: false,
        };
        chapterItems.set(chapter, chapterItem);
        items.push(chapterItem);
      }

      const chapterItem = chapterItems.get(chapter);
      chapterItem.pages.push(tocPage);
      chapterItem.isCurrent = chapterItem.isCurrent || tocPage.isCurrent;
    }

    return items;
  }

  function getTocPage(page, currentBookPath, currentFile) {
    const manifestHref = getPageHref(page);
    const fileName = getFileNameFromPath(manifestHref);
    return {
      href: getDocumentRelativePageHref(manifestHref),
      label: getPageLabel(page, manifestHref),
      isCurrent: normalizePath(manifestHref) === currentBookPath || normalizePath(fileName) === normalizePath(currentFile),
      manifestHref,
    };
  }

  function renderTocLink(page) {
    return `
      <li>
        <a class="br-toc-link${page.isCurrent ? ' is-current' : ''}" href="${escapeHtml(page.href)}" data-toc-path="${escapeHtml(normalizePath(page.manifestHref))}"${page.isCurrent ? ' aria-current="page"' : ''}>
          ${escapeHtml(page.label)}
        </a>
      </li>
    `;
  }

  function getPageHref(page) {
    if (typeof page === 'string') return page;
    return page?.url || page?.href || page?.file || '';
  }

  function getPageLabel(page, href) {
    if (page && typeof page === 'object' && page.title) return page.title;
    const fileName = getFileNameFromPath(href).replace(/\.html$/, '');
    const numbered = fileName.match(/^(\d+)-(\d+)-(.+)$/);
    if (numbered) return `${numbered[1]}.${numbered[2]} ${formatBookTitle(numbered[3])}`;
    return formatBookTitle(fileName);
  }

  function getPageChapter(href) {
    const fileName = getFileNameFromPath(href);
    return fileName.match(/^(\d+)(?:-|$)/)?.[1] || null;
  }

  function getCurrentFileName() {
    const pathname = window.location.pathname.replace(/\/$/, '/index.html');
    return getFileNameFromPath(pathname);
  }

  function getCurrentBookRelativePath() {
    const parts = window.location.pathname.split('/').filter(Boolean);
    const booksIndex = parts.indexOf('books');
    const bookIndex = booksIndex !== -1 ? booksIndex + 1 : 0;
    return normalizePath(parts.slice(bookIndex + 1).join('/') || 'index.html');
  }

  function getCurrentBookPagePath() {
    const parts = window.location.pathname.split('/').filter(Boolean);
    const booksIndex = parts.indexOf('books');
    const bookIndex = booksIndex !== -1 ? booksIndex + 1 : 0;
    const pagePath = parts.slice(bookIndex + 1).join('/') || getPageHref(window.BOOK_PAGES?.[0]) || 'index.html';
    return /\.html$/i.test(pagePath) ? pagePath : `${pagePath}.html`;
  }

  function getCurrentReviewHref() {
    const pagePath = getCurrentBookPagePath();
    const currentDirDepth = Math.max(pagePath.split('/').length - 1, 0);
    return `${'../'.repeat(currentDirDepth)}review/${pagePath}`;
  }

  function getDocumentRelativePageHref(href) {
    const cleanHref = String(href || '');
    if (!cleanHref || /^[a-z][a-z0-9+.-]*:/i.test(cleanHref) || cleanHref.startsWith('#') || cleanHref.startsWith('/')) {
      return cleanHref;
    }

    const currentPath = getCurrentBookRelativePath();
    const currentDirDepth = Math.max(currentPath.split('/').length - 1, 0);
    return `${'../'.repeat(currentDirDepth)}${cleanHref.replace(/^\.\//, '')}`;
  }

  function normalizePath(value) {
    return String(value || '')
      .split('#')[0]
      .split('?')[0]
      .replace(/^\.\//, '')
      .replace(/^\//, '')
      .replace(/\/index\.html$/, '')
      .replace(/\.html$/, '')
      .replace(/\/$/, '');
  }

  function cssEscape(value) {
    if (window.CSS && typeof window.CSS.escape === 'function') return window.CSS.escape(value);
    return String(value).replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  }

  function getFileNameFromPath(value) {
    const clean = String(value || '').split('#')[0].split('?')[0];
    return clean.split('/').filter(Boolean).pop() || 'index.html';
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>'"]/g, char => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    })[char]);
  }

  // 4.5 Navigation Logic
  let chapterFiles = [];
  let currentIndex = -1;
  
  if (window.BOOK_PAGES && window.BOOK_PAGES.length > 0) {
    chapterFiles = window.BOOK_PAGES;
    const currentPath = window.location.pathname;
    currentIndex = chapterFiles.findIndex(page => {
        let cleanPage = page.replace('.html', '');
        // For Cloudflare index files, /index is stripped from the URL
        if (cleanPage.endsWith('/index')) {
            cleanPage = cleanPage.substring(0, cleanPage.length - 6);
        }
        let currentPathWithoutHtml = currentPath.replace('.html', '').replace(/\/$/, "");
        if (currentPathWithoutHtml.endsWith('/index')) {
            currentPathWithoutHtml = currentPathWithoutHtml.substring(0, currentPathWithoutHtml.length - 6);
        }
        return currentPathWithoutHtml === cleanPage || currentPathWithoutHtml.endsWith(cleanPage);
    });
  } else {
    // Fallback if BOOK_PAGES is somehow missing
    chapterFiles = [];
    currentIndex = -1;
  }
  
  const prevBtn = document.getElementById('br-prev-btn');
  const nextBtn = document.getElementById('br-next-btn');
  
  if (currentIndex <= 0) prevBtn.disabled = true;
  if (currentIndex === -1 || currentIndex >= chapterFiles.length - 1) nextBtn.disabled = true;
  if (prevBtn.disabled) prevBtn.style.opacity = '0.5';
  if (nextBtn.disabled) nextBtn.style.opacity = '0.5';

  function navigateTo(url) {
    document.body.classList.add('br-fade-out');
    setTimeout(() => {
      let targetUrl = url;
      if (targetUrl.startsWith('/')) {
        targetUrl = '..' + targetUrl;
      }
      window.location.href = targetUrl;
    }, 150);
  }

  prevBtn.addEventListener('click', () => {
    if (currentIndex > 0) navigateTo(chapterFiles[currentIndex - 1]);
  });
  nextBtn.addEventListener('click', () => {
    if (currentIndex > -1 && currentIndex < chapterFiles.length - 1) navigateTo(chapterFiles[currentIndex + 1]);
  });

  // Keyboard Navigation
  document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    if (e.key === 'ArrowLeft') {
      if (currentIndex > 0) navigateTo(chapterFiles[currentIndex - 1]);
    } else if (e.key === 'ArrowRight') {
      if (currentIndex > -1 && currentIndex < chapterFiles.length - 1) navigateTo(chapterFiles[currentIndex + 1]);
    }
  });

});
