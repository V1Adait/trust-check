let workerUrl = '';

export function setWorkerUrl(url) {
  workerUrl = url.replace(/\/$/, '');
}

export async function resolveChain(url) {
  if (!workerUrl || workerUrl.includes('YOUR_WORKER')) {
    return { chain: [url], workerMissing: true };
  }
  try {
    const res = await fetch(`${workerUrl}/resolve?url=${encodeURIComponent(url)}`);
    if (!res.ok) throw new Error(`Worker returned ${res.status}`);
    return await res.json();
  } catch (e) {
    return { chain: [url], error: String(e) };
  }
}
