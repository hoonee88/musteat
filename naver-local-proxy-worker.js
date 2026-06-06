// Cloudflare Worker proxy for Naver Local Search API.
// Set secrets before deploy:
//   wrangler secret put NAVER_CLIENT_ID
//   wrangler secret put NAVER_CLIENT_SECRET
// After deploy, put Worker URL into the app's "네이버 지역검색 프록시 URL" setting.
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const query = url.searchParams.get('query') || '';
    if (!query.trim()) return json({ items: [] });

    const naverUrl = new URL('https://openapi.naver.com/v1/search/local.json');
    naverUrl.searchParams.set('query', query);
    naverUrl.searchParams.set('display', '5');
    naverUrl.searchParams.set('sort', 'random');

    const res = await fetch(naverUrl, {
      headers: {
        'X-Naver-Client-Id': env.NAVER_CLIENT_ID,
        'X-Naver-Client-Secret': env.NAVER_CLIENT_SECRET,
      },
    });
    const data = await res.json();
    return json(data, res.status);
  },
};
function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
