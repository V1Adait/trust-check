// Redirect intermediaries: URL shorteners, trusted-service redirectors, and email tracking domains.
// Sources: LOTS Project (lots-project.com) + known shorteners + observed in the wild.

const INTERMEDIARY_DOMAINS = new Set([
  // ── Google ──────────────────────────────────────────────────────────────────
  'share.google', 'goo.gl', 'g.co', 'forms.gle', 'feedproxy.google.com',

  // ── Microsoft ────────────────────────────────────────────────────────────────
  'aka.ms', 'go.microsoft.com', '1drv.ms',

  // ── Social platforms ─────────────────────────────────────────────────────────
  'lnkd.in',                          // LinkedIn
  't.co',                             // Twitter / X
  'fb.me', 'l.facebook.com',          // Facebook
  'l.instagram.com',                  // Instagram

  // ── Classic URL shorteners ───────────────────────────────────────────────────
  'bit.ly', 'bitly.com',
  'tinyurl.com',
  'ow.ly',
  'buff.ly',
  'is.gd', 'v.gd',
  'rb.gy',
  'cutt.ly',
  'short.io',
  'shorte.st',
  'adf.ly',
  'mcaf.ee',
  'smarturl.it',
  'su.pr',
  'dlvr.it',
  'soo.gd',
  'clk.sh',
  'shrtco.de',
  'trib.al',
  'rebrand.ly',
  'bl.ink',
  'short.cm',
  'gg.gg',
  'x.co',
  'snip.ly',
  'po.st',
  's.id',
  'parg.co',
  '12ft.io',

  // ── Observed in the wild ─────────────────────────────────────────────────────
  'lihi1.me',
  'lihi2.me',
  'lihi3.me',

  // ── Email marketing / click-tracking redirectors ─────────────────────────────
  'list-manage.com',        // Mailchimp
  'mailchi.mp',             // Mailchimp
  'click.pstmrk.it',        // Postmark
  'links.iterable.com',
  'link.edgepilot.com',
  'ct.sendgrid.net',        // SendGrid
  'track.adform.net',
]);

const DOMAIN_LABELS = {
  'share.google':      'Google redirect service',
  'goo.gl':            'Google URL shortener (deprecated)',
  'g.co':              'Google short link',
  'forms.gle':         'Google Forms redirect',
  'feedproxy.google.com': 'Google FeedProxy redirect',
  'aka.ms':            'Microsoft redirect service',
  'go.microsoft.com':  'Microsoft redirect service',
  '1drv.ms':           'Microsoft OneDrive short link',
  'lnkd.in':           'LinkedIn redirect service',
  't.co':              'Twitter/X redirect service',
  'fb.me':             'Facebook URL shortener',
  'l.facebook.com':    'Facebook redirect service',
  'l.instagram.com':   'Instagram redirect service',
  'bit.ly':            'Bitly URL shortener',
  'bitly.com':         'Bitly URL shortener',
  'tinyurl.com':       'TinyURL shortener',
  'rebrand.ly':        'Rebrandly URL shortener',
  'rb.gy':             'Rb.gy URL shortener',
  'cutt.ly':           'Cutt.ly URL shortener',
  'list-manage.com':   'Mailchimp email tracking',
  'mailchi.mp':        'Mailchimp redirect',
  'ct.sendgrid.net':   'SendGrid click tracking',
  'lihi1.me':          'Lihi URL shortener',
  'lihi2.me':          'Lihi URL shortener',
  'lihi3.me':          'Lihi URL shortener',
  's.id':              'S.id URL shortener',
  'parg.co':           'Parg.co URL shortener',
};

export function isFlaggedDomain(hostname) {
  if (!hostname) return false;
  const h = hostname.toLowerCase().replace(/^www\./, '');
  return INTERMEDIARY_DOMAINS.has(h);
}

export function getDomainLabel(hostname) {
  const h = hostname.toLowerCase().replace(/^www\./, '');
  return DOMAIN_LABELS[h] || 'URL shortener / redirect service';
}
