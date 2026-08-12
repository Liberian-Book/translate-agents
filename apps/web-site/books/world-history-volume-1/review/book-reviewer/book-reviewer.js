document.addEventListener('DOMContentLoaded', () => {
  const body = document.body;
  const bookTitle = formatBookTitle(getBookId());

  const siteHeader = document.createElement('header');
  siteHeader.className = 'br-site-header';
  siteHeader.innerHTML = `
    <div class="br-site-header-inner">
      <a class="br-site-brand" href="/" aria-label="Về trang chủ Bột"><span class="br-site-logo">B</span><span>Bột</span></a>
      <div class="br-site-book-title">${escapeHtml(bookTitle)} · Reviewer</div>
      <nav class="br-site-nav" aria-label="Điều hướng trang sách"><a href="${escapeHtml(getReaderRootHref())}">Reader</a><a href="/">Thư viện</a></nav>
    </div>
  `;

  const reviewerLayout = document.createElement('div');
  reviewerLayout.id = 'br-reader-layout';

  const mainContent = document.createElement('div');
  mainContent.id = 'br-main-content';

  while (body.firstChild) {
    mainContent.appendChild(body.firstChild);
  }

  const tocSidebar = createBookToc(window.BOOK_PAGES || []);
  const rightPanel = document.createElement('div');
  rightPanel.id = 'br-right-panel';
  rightPanel.innerHTML = `
    <div id="br-panel-header">
      <div class="br-page-actions"><button id="br-prev-btn" type="button" title="Trang trước" aria-label="Trang trước">&larr;</button><button id="br-next-btn" type="button" title="Trang sau" aria-label="Trang sau">&rarr;</button></div>
      <h3>Reviewer</h3>
    </div>
    <div id="br-eng-section"><div id="br-eng-content">Di chuột lên văn bản tiếng Việt để xem bản gốc tại đây.</div></div>
    <div id="br-comment-section">
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

  reviewerLayout.appendChild(tocSidebar);
  reviewerLayout.appendChild(mainContent);
  reviewerLayout.appendChild(rightPanel);
  body.appendChild(siteHeader);
  body.appendChild(reviewerLayout);

  let selectedCommentElement = null;
  let commentsByElement = {};
  const commentList = document.getElementById('br-comment-list');
  const commentForm = document.getElementById('br-comment-form');
  const commentNameInput = document.getElementById('br-comment-name');
  const commentTextInput = document.getElementById('br-comment-text');
  const commentStatus = document.getElementById('br-comment-status');
  const engContentPanel = document.getElementById('br-eng-content');

  mainContent.querySelectorAll('.vn.visible, .eng.hidden').forEach((element, index) => {
    element.dataset.brCommentId = element.id || `auto-${index}`;
    element.classList.add('br-commentable-line');
  });

  mainContent.addEventListener('mouseover', event => {
    const block = event.target.closest('.vn.visible');
    if (!block) return;

    const vnId = block.getAttribute('id');
    const english = vnId && vnId.endsWith('-vn')
      ? document.getElementById(vnId.replace(/-vn$/, ''))
      : block.previousElementSibling?.classList.contains('eng') ? block.previousElementSibling : null;
    engContentPanel.innerHTML = english ? english.outerHTML : '<em>Không tìm thấy bản gốc tương ứng.</em>';
  });

  mainContent.addEventListener('click', event => {
    const block = event.target.closest('.vn.visible, .eng.hidden');
    if (block) selectCommentElement(block);
  });

  loadComments();

  commentForm.addEventListener('submit', event => {
    event.preventDefault();
    if (!selectedCommentElement) {
      commentStatus.textContent = 'Hãy nhấp vào một dòng trước.';
      return;
    }

    const elementId = selectedCommentElement.dataset.brCommentId;
    commentStatus.textContent = 'Đang lưu...';
    fetch('/api/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookId: getBookId(), pageId: getPageId(), elementId, username: commentNameInput.value, text: commentTextInput.value })
    })
      .then(response => response.ok ? response.json() : response.json().then(data => Promise.reject(new Error(data.error || 'Không thể lưu bình luận.'))))
      .then(comment => {
        commentsByElement[elementId] = commentsByElement[elementId] || [];
        commentsByElement[elementId].unshift({ username: comment.username, text: comment.text, createdAt: comment.createdAt });
        commentTextInput.value = '';
        commentStatus.textContent = 'Đã lưu.';
        renderComments();
      })
      .catch(error => {
        commentStatus.textContent = error.message;
      });
  });

  setupPageNavigation(window.BOOK_PAGES || []);

  function createBookToc(pages) {
    const nav = document.createElement('nav');
    nav.id = 'br-toc-sidebar';
    nav.setAttribute('aria-label', 'Mục lục sách');
    if (!Array.isArray(pages) || pages.length === 0) {
      nav.innerHTML = '<h2>Mục lục</h2><p class="br-toc-empty">Chưa có mục lục.</p>';
      return nav;
    }

    const current = normalizePath(getReviewRelativePath());
    const items = pages.map(page => {
      const href = getPageHref(page);
      const isCurrent = normalizePath(href) === current;
      return `<li><a class="br-toc-link${isCurrent ? ' is-current' : ''}" href="${escapeHtml(getDocumentRelativePageHref(href))}"${isCurrent ? ' aria-current="page"' : ''}>${escapeHtml(getPageLabel(page, href))}</a></li>`;
    }).join('');
    nav.innerHTML = `<h2>Mục lục</h2><ol class="br-toc-list">${items}</ol>`;
    return nav;
  }

  function setupPageNavigation(pages) {
    const prevBtn = document.getElementById('br-prev-btn');
    const nextBtn = document.getElementById('br-next-btn');
    const current = normalizePath(getReviewRelativePath());
    const index = pages.findIndex(page => normalizePath(getPageHref(page)) === current);
    prevBtn.disabled = index <= 0;
    nextBtn.disabled = index === -1 || index >= pages.length - 1;
    prevBtn.addEventListener('click', () => { if (index > 0) window.location.href = getDocumentRelativePageHref(getPageHref(pages[index - 1])); });
    nextBtn.addEventListener('click', () => { if (index > -1 && index < pages.length - 1) window.location.href = getDocumentRelativePageHref(getPageHref(pages[index + 1])); });
  }

  function selectCommentElement(element) {
    selectedCommentElement?.classList.remove('br-selected-line');
    selectedCommentElement = element;
    selectedCommentElement.classList.add('br-selected-line');
    commentStatus.textContent = '';
    renderComments();
  }

  function renderComments() {
    if (!selectedCommentElement) {
      commentList.innerHTML = '<div class="br-comment-empty">Chưa chọn dòng nào.</div>';
      return;
    }
    const comments = commentsByElement[selectedCommentElement.dataset.brCommentId] || [];
    commentList.innerHTML = comments.length === 0
      ? '<div class="br-comment-empty">Chưa có bình luận.</div>'
      : comments.map(comment => `<div class="br-comment-item"><div class="br-comment-meta">${escapeHtml(comment.username)} &middot; ${escapeHtml(comment.createdAt || '')}</div><div class="br-comment-body">${escapeHtml(comment.text)}</div></div>`).join('');
  }

  function loadComments() {
    fetch(`/api/comments?bookId=${encodeURIComponent(getBookId())}&pageId=${encodeURIComponent(getPageId())}`)
      .then(response => response.json())
      .then(data => {
        commentsByElement = data.comments || {};
        renderComments();
      })
      .catch(() => {
        commentStatus.textContent = 'Không thể tải bình luận.';
      });
  }

  function getBookId() {
    return window.location.pathname.split('/').filter(Boolean)[0] || 'book';
  }

  function getPageId() {
    return `/${getBookId()}/${getReviewRelativePath()}`.replace(/\.html$/, '').replace(/\/index$/, '').replace(/\/$/, '') || '/';
  }

  function getReaderRootHref() {
    const depth = getReviewRelativePath().split('/').length - 1;
    return `${'../'.repeat(depth + 1)}`;
  }

  function getReviewRelativePath() {
    const parts = window.location.pathname.split('/').filter(Boolean);
    const reviewIndex = parts.indexOf('review');
    return parts.slice(reviewIndex + 1).join('/') || 'index.html';
  }

  function getDocumentRelativePageHref(href) {
    const currentDepth = Math.max(getReviewRelativePath().split('/').length - 1, 0);
    return `${'../'.repeat(currentDepth)}${String(href || '').replace(/^\.\//, '')}`;
  }

  function getPageHref(page) {
    return typeof page === 'string' ? page : page?.url || page?.href || page?.file || '';
  }

  function getPageLabel(page, href) {
    if (page && typeof page === 'object' && page.title) return page.title;
    const fileName = String(href || '').split('/').pop().replace(/\.html$/, '');
    const numbered = fileName.match(/^(\d+)-(\d+)-(.+)$/);
    if (numbered) return `${numbered[1]}.${numbered[2]} ${formatBookTitle(numbered[3])}`;
    return formatBookTitle(fileName);
  }

  function normalizePath(value) {
    return String(value || '').split('#')[0].split('?')[0].replace(/^\.\//, '').replace(/^\//, '').replace(/\.html$/, '').replace(/\/$/, '');
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

    return String(slug || '').split(/[-_\s]+/).filter(Boolean).map(word => `${word[0].toUpperCase()}${word.slice(1)}`).join(' ');
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]);
  }
});
