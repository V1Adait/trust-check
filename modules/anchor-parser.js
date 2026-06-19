export function findAnchorMismatches(htmlBody) {
  const mismatches = [];
  const anchorRe = /<a\s[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let match;

  while ((match = anchorRe.exec(htmlBody)) !== null) {
    const href = match[1].trim();
    const visibleText = match[2].replace(/<[^>]+>/g, '').trim();

    if (!visibleText || !/^https?:\/\//i.test(href)) continue;

    // Only flag when the visible text itself looks like a URL or domain
    if (!/^(https?:\/\/)?[\w.-]+\.[a-z]{2,}/i.test(visibleText)) continue;

    let hrefHostname;
    try {
      hrefHostname = new URL(href).hostname.toLowerCase().replace(/^www\./, '');
    } catch {
      continue;
    }

    const textDomain = visibleText
      .replace(/^https?:\/\//, '')
      .replace(/^www\./, '')
      .split(/[/?#]/)[0]
      .toLowerCase()
      .trim();

    if (hrefHostname !== textDomain) {
      mismatches.push({ displayText: visibleText, actualHref: href, displayDomain: textDomain, actualDomain: hrefHostname });
    }
  }

  return mismatches;
}
