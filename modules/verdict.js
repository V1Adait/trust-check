import { isFlaggedDomain, getDomainLabel } from './domain-list.js';

function hostnameOf(url) {
  try { return new URL(url).hostname.replace(/^www\./, ''); } catch { return url; }
}

export function generateVerdicts({ chains = [], anchorMismatches = [], auth = null, senderDomain = null, workerMissing = false }) {
  const verdicts = [];

  // Redirect chains
  for (const chain of chains) {
    const hops = chain.filter(h => typeof h === 'string');
    if (hops.length <= 1) continue;

    const flagged = hops.filter(u => isFlaggedDomain(hostnameOf(u)));
    for (const hop of flagged) {
      const h = hostnameOf(hop);
      verdicts.push({
        level: 'warning',
        title: `Intermediary detected: ${h}`,
        detail: `${getDomainLabel(h)} found in the redirect chain. Its job is to obscure the next destination — you won't know where you're heading until you've already passed through it.`,
      });
    }

    const chainStr = hops.map(hostnameOf).join(' → ');
    const final = hostnameOf(hops[hops.length - 1]);
    verdicts.push({
      level: hops.length > 2 ? 'danger' : 'info',
      title: `Redirect chain: ${hops.length - 1} hop${hops.length > 2 ? 's' : ''}`,
      detail: `Full path: ${chainStr}. You would end up at ${final}.`,
    });
  }

  // Anchor mismatches
  for (const m of anchorMismatches) {
    verdicts.push({
      level: 'danger',
      title: 'Anchor text mismatch',
      detail: `The link displays "${m.displayText}" but clicking it goes to "${m.actualDomain}". The address shown is not where this link leads.`,
    });
  }

  // Email authentication
  if (auth) {
    const { spf, dkim, dmarc } = auth;

    if (spf === 'fail' || spf === 'softfail') {
      verdicts.push({
        level: 'danger',
        title: `SPF: ${spf.toUpperCase()}`,
        detail: senderDomain
          ? `This email was not sent from ${senderDomain}'s authorised servers. The From address can be forged — anyone can claim to be @${senderDomain} and produce this result.`
          : "This email was not sent from the claimed sender's authorised servers. The From address may be spoofed.",
      });
    } else if (spf === 'pass') {
      verdicts.push({
        level: 'pass',
        title: 'SPF: PASS',
        detail: `The email was sent from a server that ${senderDomain || 'the sender domain'} has authorised.`,
      });
    } else if (spf === 'neutral' || spf === 'none') {
      verdicts.push({
        level: 'warning',
        title: `SPF: ${(spf || 'none').toUpperCase()}`,
        detail: `The sender domain has no SPF record or has not restricted which servers may send on its behalf. This is a weak signal — not definitive, but suspicious for a major brand.`,
      });
    }

    if (dkim === 'fail') {
      verdicts.push({
        level: 'danger',
        title: 'DKIM: FAIL',
        detail: "The email's cryptographic signature is invalid. The content may have been modified in transit, or the signature is forged.",
      });
    } else if (dkim === 'pass') {
      verdicts.push({
        level: 'pass',
        title: 'DKIM: PASS',
        detail: "The email's content was signed by the sending server and has not been tampered with in transit.",
      });
    } else if (dkim === 'none') {
      verdicts.push({
        level: 'warning',
        title: 'DKIM: NONE',
        detail: 'No DKIM signature found. Legitimate senders almost always sign their emails. Absence of a signature is a weak indicator of a spoofed or misconfigured sender.',
      });
    }

    if (dmarc === 'fail') {
      verdicts.push({
        level: 'danger',
        title: 'DMARC: FAIL',
        detail: senderDomain
          ? `${senderDomain}'s own DMARC policy says this email should be rejected or quarantined. It reached your inbox anyway, meaning either the policy is set to monitoring-only or your mail server did not enforce it.`
          : "This email failed DMARC validation — it reached your inbox despite failing the sender's own authentication policy.",
      });
    } else if (dmarc === 'pass') {
      verdicts.push({
        level: 'pass',
        title: 'DMARC: PASS',
        detail: "The email passed the sender domain's own authentication policy.",
      });
    }
  }

  // Worker not configured
  if (workerMissing) {
    verdicts.push({
      level: 'info',
      title: 'Redirect chain resolution unavailable',
      detail: 'The Cloudflare Worker URL is not configured. Deploy the worker (see /worker/index.js) and set WORKER_URL in app.js to enable redirect chain analysis.',
    });
  }

  if (verdicts.length === 0) {
    verdicts.push({
      level: 'pass',
      title: 'No suspicious signals detected',
      detail: 'No anchor mismatches, intermediary domains, or authentication failures were found in what you provided.',
    });
  }

  return verdicts;
}
