document.addEventListener(
  "click",
  (event) => {
    if (event.defaultPrevented || event.button !== 0) return;
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;

    const anchor = event.target.closest && event.target.closest("a[href]");
    if (!anchor) return;

    let target;
    try {
      target = new URL(anchor.href, location.href);
    } catch {
      return;
    }
    if (target.protocol !== "http:" && target.protocol !== "https:") return;

    // Ignore #section jumps within the same page
    const here = new URL(location.href);
    here.hash = "";
    const there = new URL(target.href);
    there.hash = "";
    if (here.href === there.href) return;

    event.preventDefault();
    event.stopPropagation();
    chrome.runtime.sendMessage({ type: "SCAN_LINK", url: target.href });
  },
  true // capture phase: run before the page's own click handlers
);