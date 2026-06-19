const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Content-Type': 'application/json',
};

export default {
  async fetch(request) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS });
    }

    const { pathname, searchParams } = new URL(request.url);

    if (pathname !== '/resolve') {
      return new Response(JSON.stringify({ error: 'Not found' }), { status: 404, headers: CORS });
    }

    const target = searchParams.get('url');
    if (!target) {
      return new Response(JSON.stringify({ error: 'Missing url parameter' }), { status: 400, headers: CORS });
    }

    let current;
    try {
      current = new URL(target).href;
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid URL' }), { status: 400, headers: CORS });
    }

    const chain = [];
    const MAX_HOPS = 10;

    for (let i = 0; i < MAX_HOPS; i++) {
      chain.push(current);
      let res;
      try {
        res = await fetch(current, {
          method: 'HEAD',
          redirect: 'manual',
          headers: { 'User-Agent': 'Mozilla/5.0 (compatible; TrustCheck/1.0; +https://github.com/fortulio/trust-check)' },
        });
      } catch {
        break;
      }

      if (res.status >= 300 && res.status < 400) {
        const location = res.headers.get('location');
        if (!location) break;
        try {
          current = new URL(location, current).href;
        } catch {
          break;
        }
      } else {
        break;
      }
    }

    return new Response(JSON.stringify({ chain }), { headers: CORS });
  },
};
