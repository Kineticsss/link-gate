const params = new URLSearchParams(location.search);
const target = params.get("url") || "";
document.getElementById("url").textContent = target;
document.getElementById("count").textContent = params.get("count") || "?";
document.getElementById("threshold").textContent = params.get("threshold") || "8";

document.getElementById("close").addEventListener("click", () => {
  chrome.tabs.getCurrent((tab) => {
    if (tab) chrome.tabs.remove(tab.id);
    else window.close();
  });
});

document.getElementById("continue").addEventListener("click", () => {
  try {
    const u = new URL(target);
    if (u.protocol === "http:" || u.protocol === "https:") location.href = u.href;
  } catch {}
});