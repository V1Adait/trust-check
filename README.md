# Trust Check — by Fortulio

> **[→ Try it live](https://fortulio.github.io/trust-check)** — paste a URL or raw email, get a plain English verdict. Nothing installed, nothing stored.

Detect **trust laundering** in URLs and emails. Free, open source.

---

## What it detects

| Signal | How |
|---|---|
| Anchor text vs href mismatch | Displayed URL doesn't match where the link actually goes |
| Known redirect intermediaries | Flags shorteners and trusted-service redirectors (bit.ly, share.google, aka.ms, t.co…) |
| Full redirect chain | Follows every hop and shows you the final destination |
| SPF / DKIM / DMARC | Parses raw email headers and explains results in plain English |

What it deliberately **doesn't** do: content analysis, sender reputation, blocklist lookups. Those are covered by every other tool. This one covers the redirect/auth layer that those tools miss.

---

## Deploy your own copy

### 1. Fork and enable GitHub Pages

Fork this repo, go to **Settings → Pages**, set source to `main` branch root. Done — the static site costs nothing.

### 2. Deploy the Cloudflare Worker

The Worker follows redirect chains server-side (browsers block cross-origin HEAD requests).

```bash
cd worker
npm install -g wrangler
wrangler login
wrangler deploy
```

Wrangler will print your Worker URL, something like:  
`https://trust-check-resolver.yourname.workers.dev`

Free tier covers 100,000 requests/day — more than enough.

### 3. Set your Worker URL

Open `app.js` and replace the placeholder on line 8:

```js
const WORKER_URL = 'https://trust-check-resolver.yourname.workers.dev';
```

Commit and push. The site on GitHub Pages picks it up immediately.

---

## Local development

ES modules don't work over `file://` — you need a local server:

```bash
npx serve .
```

Then open `http://localhost:3000`.

---

## Project structure

```
trust-check/
├── index.html          # UI
├── style.css           # Styles
├── app.js              # Main app logic
├── modules/
│   ├── domain-list.js  # Known intermediary domains
│   ├── header-parser.js# SPF/DKIM/DMARC + URL extraction
│   ├── anchor-parser.js# Anchor text vs href mismatch
│   ├── chain-resolver.js # Calls the Cloudflare Worker
│   └── verdict.js      # Plain English verdict generation
└── worker/
    ├── index.js        # Cloudflare Worker (redirect chain follower)
    └── wrangler.toml   # Worker config
```

---

Made by [Fortulio](https://fortulio.com) — shared free as a resource for the community.
