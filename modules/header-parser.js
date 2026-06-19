export function splitEmailParts(rawEmail) {
  // Headers and body are separated by the first blank line
  const match = rawEmail.match(/^([\s\S]*?)\r?\n\r?\n([\s\S]*)$/);
  if (!match) return { headers: rawEmail, body: '' };
  return { headers: match[1], body: match[2] };
}

export function parseEmailAuth(headers) {
  const result = { spf: null, dkim: null, dmarc: null };

  // Unfold multi-line headers (RFC 5322: continuation lines start with whitespace)
  const unfolded = headers.replace(/\r?\n[ \t]+/g, ' ');

  // Authentication-Results can appear multiple times (one per MTA hop)
  const authLines = [...unfolded.matchAll(/^Authentication-Results:[^\n]*/gim)];

  for (const m of authLines) {
    const line = m[0].toLowerCase();
    if (!result.spf) {
      const spf = line.match(/spf=(pass|fail|softfail|neutral|none|permerror|temperror)/);
      if (spf) result.spf = spf[1];
    }
    if (!result.dkim) {
      const dkim = line.match(/dkim=(pass|fail|none|permerror|temperror)/);
      if (dkim) result.dkim = dkim[1];
    }
    if (!result.dmarc) {
      const dmarc = line.match(/dmarc=(pass|fail|none|permerror|temperror)/);
      if (dmarc) result.dmarc = dmarc[1];
    }
  }

  // Fallback: Received-SPF header
  if (!result.spf) {
    const receivedSpf = unfolded.match(/^Received-SPF:\s*(\w+)/im);
    if (receivedSpf) result.spf = receivedSpf[1].toLowerCase();
  }

  return result;
}

export function extractSenderDomain(headers) {
  const unfolded = headers.replace(/\r?\n[ \t]+/g, ' ');
  const from = unfolded.match(/^From:[^\n]*@([\w.-]+)/im);
  return from ? from[1].toLowerCase() : null;
}

export function extractUrls(text) {
  const matches = text.match(/https?:\/\/[^\s<>"'\]]+/gi) || [];
  return [...new Set(matches.map(u => u.replace(/[.,;:!?)]+$/, '')))];
}
