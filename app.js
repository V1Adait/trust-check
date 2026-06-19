import { splitEmailParts, parseEmailAuth, extractSenderDomain, extractUrls } from './modules/header-parser.js';
import { findAnchorMismatches } from './modules/anchor-parser.js';
import { resolveChain, setWorkerUrl } from './modules/chain-resolver.js';
import { generateVerdicts } from './modules/verdict.js';

// ── CONFIG ────────────────────────────────────────────────────────────────────
// After deploying the Cloudflare Worker, paste your worker URL here.
// e.g. 'https://trust-check-resolver.yourname.workers.dev'
const WORKER_URL = 'https://trust-check-resolver.security-b41.workers.dev';
setWorkerUrl(WORKER_URL);

// ── ELEMENTS ──────────────────────────────────────────────────────────────────
const tabs           = document.querySelectorAll('.tab');
const urlSection     = document.getElementById('url-section');
const emailSection   = document.getElementById('email-section');
const urlInput       = document.getElementById('url-input');
const emailInput     = document.getElementById('email-input');
const analyzeBtn     = document.getElementById('analyze-btn');
const resultsSection = document.getElementById('results');
const verdictList    = document.getElementById('verdict-list');
const chainWrap      = document.getElementById('chain-wrap');
const loadingEl      = document.getElementById('loading');

let currentMode = 'url';

// ── TABS ──────────────────────────────────────────────────────────────────────
tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    tabs.forEach(t => { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
    tab.classList.add('active');
    tab.setAttribute('aria-selected', 'true');
    currentMode = tab.dataset.mode;
    urlSection.hidden   = currentMode !== 'url';
    emailSection.hidden = currentMode !== 'email';
    clearResults();
  });
});

// ── ANALYSE ───────────────────────────────────────────────────────────────────
analyzeBtn.addEventListener('click', run);

[urlInput, emailInput].forEach(el => {
  el.addEventListener('keydown', e => { if (e.key === 'Enter' && e.ctrlKey) run(); });
});

async function run() {
  clearResults();
  setLoading(true);
  try {
    if (currentMode === 'url') await analyzeUrl(urlInput.value.trim());
    else                        await analyzeEmail(emailInput.value.trim());
  } catch (e) {
    renderError(e.message);
  } finally {
    setLoading(false);
  }
}

async function analyzeUrl(raw) {
  if (!raw) { renderError('Please enter a URL.'); return; }
  const url = /^https?:\/\//i.test(raw) ? raw : 'https://' + raw;

  const { chain, workerMissing, error } = await resolveChain(url);
  const chains = [chain];

  renderChains(chains);
  renderVerdicts(generateVerdicts({ chains, workerMissing: workerMissing || !!error }));
  resultsSection.hidden = false;
}

async function analyzeEmail(raw) {
  if (!raw) { renderError('Please paste your raw email.'); return; }

  const { headers, body } = splitEmailParts(raw);
  const auth              = parseEmailAuth(headers);
  const senderDomain      = extractSenderDomain(headers);
  const anchorMismatches  = findAnchorMismatches(body);
  const urls              = extractUrls(raw).slice(0, 6);

  let workerMissing = false;
  const chains = [];

  for (const url of urls) {
    const result = await resolveChain(url);
    if (result.workerMissing) { workerMissing = true; break; }
    if (result.chain && result.chain.length > 0) chains.push(result.chain);
  }

  const notableChains = chains.filter(c => c.length > 1);
  renderChains(notableChains);
  renderVerdicts(generateVerdicts({ chains: notableChains, anchorMismatches, auth, senderDomain, workerMissing }));
  resultsSection.hidden = false;
}

// ── RENDER ────────────────────────────────────────────────────────────────────
function renderChains(chains) {
  const notable = chains.filter(c => c.length > 1);
  if (!notable.length) return;

  chainWrap.innerHTML = notable.map(chain => {
    const hops = chain
      .filter(h => typeof h === 'string')
      .map((url, i) => {
        let hostname;
        try { hostname = new URL(url).hostname; } catch { hostname = url; }
        const last = i === chain.length - 1;
        // isFlaggedDomain imported inline via verdict; check via data attribute
        return `<span class="hop" data-url="${url}"${last ? ' data-final' : ''}>${hostname}</span>`;
      })
      .join('<span class="arrow">→</span>');
    return `<div class="chain">${hops}</div>`;
  }).join('');

  // Flag hops asynchronously after render (avoids re-importing domain-list here)
  import('./modules/domain-list.js').then(({ isFlaggedDomain }) => {
    chainWrap.querySelectorAll('.hop[data-url]').forEach(el => {
      try {
        const h = new URL(el.dataset.url).hostname;
        if (isFlaggedDomain(h)) el.classList.add('hop--flagged');
      } catch {}
      if (el.hasAttribute('data-final')) el.classList.add('hop--final');
    });
  });

  chainWrap.hidden = false;
}

function renderVerdicts(verdicts) {
  verdictList.innerHTML = verdicts.map(v => `
    <div class="verdict verdict--${v.level}">
      <div class="verdict-header">
        <span class="verdict-icon">${iconFor(v.level)}</span>
        <strong class="verdict-title">${v.title}</strong>
      </div>
      <p class="verdict-detail">${v.detail}</p>
    </div>
  `).join('');
}

function iconFor(level) {
  return { danger: '✕', warning: '⚠', pass: '✓', info: 'ℹ' }[level] ?? '•';
}

function renderError(msg) {
  verdictList.innerHTML = `
    <div class="verdict verdict--danger">
      <div class="verdict-header"><span class="verdict-icon">✕</span><strong class="verdict-title">Error</strong></div>
      <p class="verdict-detail">${msg}</p>
    </div>`;
  resultsSection.hidden = false;
}

function clearResults() {
  resultsSection.hidden = true;
  verdictList.innerHTML = '';
  chainWrap.innerHTML   = '';
  chainWrap.hidden      = true;
}

function setLoading(on) {
  loadingEl.hidden    = !on;
  analyzeBtn.disabled = on;
}
