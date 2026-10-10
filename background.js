const THRESHOLD = 8;       // block at this many links or more
const TIMEOUT_MS = 8000;

chrome.runtime.onMessage.addListener((msg, sender) => {
  if (msg && msg.type === "SCAN_LINK" && sender.tab) {
    scanAndRoute(msg.url, sender.tab.id);
  }
});

async function scanAndRoute(url, tabId) {
  let count = 0;
  try {
    count = await countLinks(url);
  } catch (err) {
    console.warn("[Link Gate] scan failed, allowing:", url, err);
  }
  console.log(`[Link Gate] ${url} -> ${count} unique links`);

  if (count >= THRESHOLD) {
    const warning =
      chrome.runtime.getURL("warning.html") +
      `?url=${encodeURIComponent(url)}&count=${count}&threshold=${THRESHOLD}`;
    chrome.tabs.update(tabId, { url: warning });
  } else {
    chrome.tabs.update(tabId, { url });
  }
}

async function countLinks(url) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  let res;
  try {
    res = await fetch(url, { credentials: "omit", signal: ctrl.signal });
  } finally {
    clearTimeout(timer);
  }

  const type = res.headers.get("content-type") || "";
  if (!type.includes("text/html")) return 0;

  const html = await res.text();
  const found = new Set();
  const re = /<a\b[^>]*?\shref\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/gi;
  let m;
  while ((m = re.exec(html))) {
    const raw = (m[1] ?? m[2] ?? m[3] ?? "").trim();
    try {
      const u = new URL(raw, res.url);
      if (u.protocol === "http:" || u.protocol === "https:") {
        u.hash = "";
        found.add(u.href);
      }
    } catch {}
  }
  return found.size;
}