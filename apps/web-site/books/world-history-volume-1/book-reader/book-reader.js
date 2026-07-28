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

  const mainContent = document.createElement('div');
  mainContent.id = 'br-main-content';

  // Move all existing children of body into mainContent
  while (body.firstChild) {
    mainContent.appendChild(body.firstChild);
  }

  // Create Right Panel
  const rightPanel = document.createElement('div');
  rightPanel.id = 'br-right-panel';
  rightPanel.innerHTML = `
    <div id="br-panel-header" style="padding: 15px 20px; border-bottom: 1px solid #e1e4e8; background: #fff; display: flex; justify-content: space-between; align-items: center; gap: 10px;">
      <div style="display: flex; gap: 5px;">
        <button id="br-prev-btn" title="Trang trước" style="background: #e1e4e8; color: #333; border: none; padding: 6px 10px; border-radius: 4px; cursor: pointer; font-weight: bold;">&larr;</button>
        <button id="br-next-btn" title="Trang sau" style="background: #e1e4e8; color: #333; border: none; padding: 6px 10px; border-radius: 4px; cursor: pointer; font-weight: bold;">&rarr;</button>
      </div>
      <h3 style="margin: 0; font-size: 1.1rem; color: #333; flex-grow: 1; text-align: center;">Trình đọc sách</h3>
      <button id="br-swap-btn" style="background: #0366d6; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-weight: bold;">Đổi sang EN</button>
    </div>
    <div id="br-eng-section">
      <div id="br-eng-content">Di chuột lên văn bản để xem bản dịch tại đây.</div>
    </div>
    <div id="br-comment-section">
      <div class="br-comment-title">Bình luận</div>
      <div id="br-selected-line">Nhấp vào một dòng để bình luận.</div>
      <form id="br-comment-form">
        <label for="br-comment-name">Tên</label>
        <input id="br-comment-name" name="username" type="text" placeholder="Tên của bạn" maxlength="80" required>
        <label for="br-comment-text">Bình luận</label>
        <textarea id="br-comment-text" name="text" placeholder="Viết bình luận" maxlength="2000" rows="3" required></textarea>
        <button type="submit">Gửi bình luận</button>
      </form>
      <div id="br-comment-status" aria-live="polite"></div>
      <div id="br-comment-list"></div>
    </div>
  `;

  const siteFooter = document.createElement('footer');
  siteFooter.className = 'br-site-footer';
  siteFooter.innerHTML = `
    <div class="br-site-footer-inner">
      <p>&copy; 2026 Bột. Sách dịch phục vụ mục đích học tập phi thương mại.</p>
    </div>
  `;

  // Append back to body
  readerLayout.appendChild(mainContent);
  readerLayout.appendChild(rightPanel);
  body.appendChild(siteHeader);
  body.appendChild(readerLayout);
  body.appendChild(siteFooter);

  function getBookIdFromPath() {
    const parts = window.location.pathname.split('/').filter(Boolean);
    const booksIndex = parts.indexOf('books');
    if (booksIndex !== -1 && parts[booksIndex + 1]) return parts[booksIndex + 1];
    return parts[0] || 'book';
  }

  function formatBookTitle(slug) {
    return slug
      .split(/[-_\s]+/)
      .filter(Boolean)
      .map(word => `${word[0].toUpperCase()}${word.slice(1)}`)
      .join(' ');
  }

  // 2. Fetch and parse Glossary
  let glossaryData = [];
  const glossaryPath = '../glossary.csv';

  function parseCSV(text) {
    const lines = text.split('\n').filter(line => line.trim() !== '');
    if (lines.length === 0) return [];
    const headers = lines[0].split(',').map(h => h.trim());
    return lines.slice(1).map(line => {
      const values = [];
      let inQuotes = false;
      let currentValue = '';
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"' && line[i+1] === '"') {
          currentValue += '"';
          i++; 
        } else if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          values.push(currentValue.trim());
          currentValue = '';
        } else {
          currentValue += char;
        }
      }
      values.push(currentValue.trim());
      
      const obj = {};
      headers.forEach((header, index) => {
        obj[header] = values[index] || '';
      });
      return obj;
    });
  }

  fetch(glossaryPath)
    .then(response => {
      if (!response.ok) throw new Error("Network response was not ok");
      return response.text();
    })
    .then(csvText => {
      glossaryData = parseCSV(csvText);
    })
    .catch(err => console.error('Error fetching glossary:', err));

  // 3. Highlight Terms by default
  const termElements = mainContent.querySelectorAll('[data-type="term"]');
  termElements.forEach(el => {
    el.classList.add('br-highlight-term');
  });

  // 4. State for EN/VN mode
  let isEnMode = false;
  const swapBtn = document.getElementById('br-swap-btn');
  const readingTitle = document.getElementById('br-reading-title');
  const engContentPanel = document.getElementById('br-eng-content');
  const selectedLineContainer = document.getElementById('br-selected-line');
  const commentList = document.getElementById('br-comment-list');
  const commentForm = document.getElementById('br-comment-form');
  const commentNameInput = document.getElementById('br-comment-name');
  const commentTextInput = document.getElementById('br-comment-text');
  const commentStatus = document.getElementById('br-comment-status');
  const bookId = getBookId();
  const pageId = normalizePageId(window.location.pathname);
  let selectedCommentElement = null;
  let commentsByElement = {};

  mainContent.querySelectorAll('.vn.visible, .eng.hidden').forEach((el, index) => {
    el.dataset.brCommentId = el.id || `auto-${index}`;
    el.classList.add('br-commentable-line');
  });

  function getBookId() {
    const parts = window.location.pathname.split('/').filter(Boolean);
    const booksIndex = parts.indexOf('books');
    if (booksIndex !== -1 && parts[booksIndex + 1]) return parts[booksIndex + 1];
    return parts[0] || 'book';
  }

  function normalizePageId(pathname) {
    return pathname.replace(/\.html$/, '').replace(/\/index$/, '').replace(/\/$/, '') || '/';
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

  function renderComments() {
    if (!selectedCommentElement) {
      commentList.innerHTML = '<div class="br-comment-empty">Chưa chọn dòng nào.</div>';
      return;
    }

    const elementId = selectedCommentElement.dataset.brCommentId;
    const comments = commentsByElement[elementId] || [];
    if (comments.length === 0) {
      commentList.innerHTML = '<div class="br-comment-empty">Chưa có bình luận.</div>';
      return;
    }

    commentList.innerHTML = comments.map(comment => `
      <div class="br-comment-item">
        <div class="br-comment-meta">${escapeHtml(comment.username)} &middot; ${escapeHtml(comment.createdAt || '')}</div>
        <div class="br-comment-body">${escapeHtml(comment.text)}</div>
      </div>
    `).join('');
  }

  function selectCommentElement(el) {
    if (selectedCommentElement) selectedCommentElement.classList.remove('br-selected-line');
    selectedCommentElement = el;
    selectedCommentElement.classList.add('br-selected-line');
    selectedLineContainer.textContent = el.textContent.trim().slice(0, 180) || 'Dòng đã chọn';
    commentStatus.textContent = '';
    renderComments();
  }

  function loadComments() {
    fetch(`/api/comments?bookId=${encodeURIComponent(bookId)}&pageId=${encodeURIComponent(pageId)}`)
      .then(response => response.json())
      .then(data => {
        commentsByElement = data.comments || {};
        renderComments();
      })
      .catch(() => {
        commentStatus.textContent = 'Không thể tải bình luận.';
      });
  }

  commentForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!selectedCommentElement) {
      commentStatus.textContent = 'Hãy nhấp vào một dòng trước.';
      return;
    }

    const elementId = selectedCommentElement.dataset.brCommentId;
    const payload = {
      bookId,
      pageId,
      elementId,
      username: commentNameInput.value,
      text: commentTextInput.value
    };

    commentStatus.textContent = 'Đang lưu...';
    fetch('/api/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(response => {
        if (!response.ok) return response.json().then(data => Promise.reject(new Error(data.error || 'Không thể lưu bình luận.')));
        return response.json();
      })
      .then(comment => {
        if (!commentsByElement[elementId]) commentsByElement[elementId] = [];
        commentsByElement[elementId].unshift({
          username: comment.username,
          text: comment.text,
          createdAt: comment.createdAt
        });
        commentTextInput.value = '';
        commentStatus.textContent = 'Đã lưu.';
        renderComments();
      })
      .catch(err => {
        commentStatus.textContent = err.message;
      });
  });

  commentTextInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      commentForm.requestSubmit();
    }
  });

  loadComments();

  swapBtn.addEventListener('click', () => {
    isEnMode = !isEnMode;
    if (isEnMode) {
      document.body.classList.add('lang-swap');
      swapBtn.textContent = 'Đổi sang VN';
      if (readingTitle) readingTitle.textContent = 'Bản dịch tiếng Việt';
    } else {
      document.body.classList.remove('lang-swap');
      swapBtn.textContent = 'Đổi sang EN';
      if (readingTitle) readingTitle.textContent = 'Original English';
    }
    // Clear panels on swap
    engContentPanel.innerHTML = 'Di chuột lên văn bản để xem bản dịch tại đây.';
  });

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

  // 5. Event Delegation for Hovers
  mainContent.addEventListener('mouseover', (e) => {
    // Handle block hover for translation
    const blockEl = e.target.closest('.vn.visible, .eng.hidden');
    if (blockEl) {
        if (!isEnMode && blockEl.classList.contains('vn')) {
          const vnId = blockEl.getAttribute('id');
          if (vnId && vnId.endsWith('-vn')) {
            const engId = vnId.replace('-vn', '');
            const engEl = document.getElementById(engId);
            if (engEl) engContentPanel.innerHTML = engEl.outerHTML;
            else engContentPanel.innerHTML = "<em>English counterpart not found.</em>";
          } else {
            const prev = blockEl.previousElementSibling;
            if (prev && prev.classList.contains('eng')) engContentPanel.innerHTML = prev.outerHTML;
          }
        } else if (isEnMode && blockEl.classList.contains('eng')) {
          const engId = blockEl.getAttribute('id');
          if (engId && !engId.endsWith('-vn')) {
            const vnId = engId + '-vn';
            const vnEl = document.getElementById(vnId);
            if (vnEl) engContentPanel.innerHTML = vnEl.outerHTML;
            else {
                const next = blockEl.nextElementSibling;
                if (next && next.classList.contains('vn')) engContentPanel.innerHTML = next.outerHTML;
                else engContentPanel.innerHTML = "<em>Vietnamese counterpart not found.</em>";
            }
          } else {
            const next = blockEl.nextElementSibling;
            if (next && next.classList.contains('vn')) engContentPanel.innerHTML = next.outerHTML;
          }
        }
    }
  });

  mainContent.addEventListener('click', (e) => {
    const blockEl = e.target.closest('.vn.visible, .eng.hidden');
    if (blockEl) selectCommentElement(blockEl);
  });

});
