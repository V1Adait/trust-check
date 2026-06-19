// Known URL shorteners and redirect intermediaries (LOTS project + common shorteners)
const INTERMEDIARY_DOMAINS = new Set([
  // Google
  'share.google', 'goo.gl', 'g.co', 'forms.gle',
  // Microsoft
  'aka.ms', 'go.microsoft.com',
  // LinkedIn
  'lnkd.in',
  // Twitter / X
  't.co',
  // Facebook / Instagram
  'fb.me', 'l.facebook.com', 'l.instagram.com',
  // Bitly
  'bit.ly', 'bitly.com',
  // Classic shorteners
  'tinyurl.com', 'ow.ly', 'buff.ly', 'is.gd', 'v.gd', 'rb.gy', 'cutt.ly',
  'short.io', 'shorte.st', 'adf.ly', 'mcaf.ee', 'smarturl.it', 'su.pr',
  'dlvr.it', 'soo.gd', 'clk.sh', 'shrtco.de', 'trib.al', 'rebrand.ly',
  'bl.ink', 'short.cm', 'gg.gg', 'x.co', 'snip.ly', 'po.st',
  // Email marketing redirect domains
  'list-manage.com', 'mailchi.mp', 'click.pstmrk.it',
  'links.iterable.com', 'link.edgepilot.com',
]);

const DOMAIN_LABELS = {
  'share.google': 'Google redirect service',
  'goo.gl': 'Google URL shortener (deprecated)',
  'g.co': 'Google short link',
  'forms.gle': 'Google Forms redirect',
  'aka.ms': 'Microsoft redirect service',
  'go.microsoft.com': 'Microsoft redirect service',
  'lnkd.in': 'LinkedIn redirect service',
  't.co': 'Twitter/X redirect service',
  'fb.me': 'Facebook URL shortener',
  'l.facebook.com': 'Facebook redirect service',
  'l.instagram.com': 'Instagram redirect service',
  'bit.ly': 'Bitly URL shortener',
  'bitly.com': 'Bitly URL shortener',
  'tinyurl.com': 'TinyURL shortener',
  'list-manage.com': 'Mailchimp email tracking',
  'mailchi.mp': 'Mailchimp redirect',
  'click.pstmrk.it': 'Postmark email tracking',
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
