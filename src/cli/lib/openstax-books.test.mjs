import assert from 'node:assert/strict';
import { test } from 'node:test';
import { searchOpenStaxBooks } from './openstax-books.mjs';

test('rejects empty queries before fetching', async () => {
  let fetchCalls = 0;

  await assert.rejects(
    () => searchOpenStaxBooks('   ', {
      fetchImpl: async () => {
        fetchCalls += 1;
        return jsonResponse({});
      },
    }),
    /Cần nhập từ khóa tìm kiếm/
  );

  assert.equal(fetchCalls, 0);
});

test('clamps requested limits at 25 for the primary search request', async () => {
  const urls = [];

  await searchOpenStaxBooks('biology', {
    limit: 99,
    fetchImpl: async (url) => {
      urls.push(url);
      return jsonResponse({ items: [] });
    },
  });

  const primaryUrl = new URL(urls[0]);
  assert.equal(primaryUrl.searchParams.get('limit'), '25');
});

test('normalizes pages API results', async () => {
  const results = await searchOpenStaxBooks('biology', {
    fetchImpl: async () => jsonResponse({
      items: [
        {
          title: 'Biology 2e',
          meta: {
            slug: 'biology-2e',
            html_url: 'https://openstax.org/books/biology-2e/pages/1-introduction',
            locale: 'en',
          },
        },
      ],
    }),
  });

  assert.deepEqual(results, [
    {
      title: 'Biology 2e',
      slug: 'biology-2e',
      url: 'https://openstax.org/books/biology-2e/pages/1-introduction',
      source: 'pages',
      locale: 'en',
    },
  ]);
});

test('falls back to catalog filtering when primary search has no results', async () => {
  const urls = [];

  const results = await searchOpenStaxBooks('entrepreneurship', {
    fetchImpl: async (url) => {
      urls.push(url);
      if (urls.length === 1) return jsonResponse({ items: [] });
      return jsonResponse({
        books: [
          {
            title: 'Entrepreneurship',
            slug: 'books/entrepreneurship',
            webview_rex_link: 'https://openstax.org/books/entrepreneurship/pages/1-introduction',
          },
          {
            title: 'Business Ethics',
            slug: 'books/business-ethics',
            webview_rex_link: 'https://openstax.org/books/business-ethics/pages/1-introduction',
          },
        ],
      });
    },
  });

  assert.equal(urls.length, 2);
  assert.deepEqual(results, [
    {
      title: 'Entrepreneurship',
      slug: 'entrepreneurship',
      url: 'https://openstax.org/books/entrepreneurship/pages/1-introduction',
      source: 'catalog',
      locale: 'en',
    },
  ]);
});

function jsonResponse(body, ok = true) {
  return {
    ok,
    status: ok ? 200 : 500,
    async json() {
      return body;
    },
  };
}
