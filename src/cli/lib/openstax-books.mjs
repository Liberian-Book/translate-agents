const OPENSTAX_ORIGIN = 'https://openstax.org';
const PAGES_SEARCH_URL = `${OPENSTAX_ORIGIN}/apps/cms/api/v2/pages/`;
const BOOKS_CATALOG_URL = `${OPENSTAX_ORIGIN}/apps/cms/api/books/?format=json`;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 25;

export async function searchOpenStaxBooks(query, options = {}) {
  const normalizedQuery = normalizeQuery(query);
  const limit = clampLimit(options.limit);
  const fetchImpl = options.fetchImpl ?? globalThis.fetch;

  if (!fetchImpl) {
    throw new Error('Fetch is not available in this Node runtime.');
  }

  const primaryResults = await searchPages({ query: normalizedQuery, limit, fetchImpl });
  if (primaryResults.length > 0) {
    return primaryResults.slice(0, limit);
  }

  const catalogResults = await searchCatalog({ query: normalizedQuery, limit, fetchImpl });
  return catalogResults.slice(0, limit);
}

function normalizeQuery(query) {
  const normalized = String(query ?? '').trim();
  if (!normalized) {
    throw new Error('Search query is required.');
  }
  return normalized;
}

function clampLimit(limit) {
  const parsed = Number.parseInt(limit ?? DEFAULT_LIMIT, 10);
  if (!Number.isFinite(parsed) || parsed < 1) return DEFAULT_LIMIT;
  return Math.min(parsed, MAX_LIMIT);
}

async function searchPages({ query, limit, fetchImpl }) {
  const url = new URL(PAGES_SEARCH_URL);
  url.searchParams.set('type', 'books.Book');
  url.searchParams.set('search', query);
  url.searchParams.set('limit', String(limit));
  url.searchParams.set('offset', '0');

  try {
    const data = await fetchJson(fetchImpl, url);
    return (data.items ?? []).map(normalizePageBook).filter(Boolean);
  } catch {
    return [];
  }
}

async function searchCatalog({ query, fetchImpl }) {
  const data = await fetchJson(fetchImpl, BOOKS_CATALOG_URL);
  const needle = normalizeForMatch(query);

  return (data.books ?? [])
    .filter((book) => {
      const title = normalizeForMatch(book.title);
      const slug = normalizeForMatch(stripBooksPrefix(book.slug));
      return title.includes(needle) || slug.includes(needle);
    })
    .map(normalizeCatalogBook)
    .filter(Boolean);
}

async function fetchJson(fetchImpl, url) {
  const response = await fetchImpl(url.toString());
  if (!response.ok) {
    throw new Error(`OpenStax request failed with status ${response.status}`);
  }
  return response.json();
}

function normalizePageBook(item) {
  const title = item?.title?.trim();
  const slug = stripBooksPrefix(item?.meta?.slug);
  if (!title || !slug) return null;

  return {
    title,
    slug,
    url: normalizeUrl(item?.meta?.html_url) ?? buildBookUrl(slug),
    source: 'pages',
    locale: item?.meta?.locale ?? 'en',
  };
}

function normalizeCatalogBook(book) {
  const title = book?.title?.trim();
  const slug = stripBooksPrefix(book?.slug);
  if (!title || !slug) return null;

  return {
    title,
    slug,
    url: normalizeUrl(book.webview_rex_link) ?? buildBookUrl(slug),
    source: 'catalog',
    locale: book.locale ?? 'en',
  };
}

function stripBooksPrefix(slug) {
  return String(slug ?? '').replace(/^books\//, '').trim();
}

function normalizeUrl(url) {
  const value = String(url ?? '').trim();
  if (!value) return null;
  if (value.startsWith('http://') || value.startsWith('https://')) return value;
  return new URL(value, OPENSTAX_ORIGIN).toString();
}

function buildBookUrl(slug) {
  return `${OPENSTAX_ORIGIN}/books/${slug}`;
}

function normalizeForMatch(value) {
  return String(value ?? '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}
