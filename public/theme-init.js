// Pre-paint theme resolution: reads ?query → localStorage → default(signal/dark),
// sets data-theme/data-mode on <html> before first paint to prevent FOUC.
// Loaded via next/script strategy="beforeInteractive" in app/layout.tsx.
(function () {
  try {
    var q = new URLSearchParams(location.search);
    var t = q.get("theme"), m = q.get("mode");
    var okT = /^(after-dark|signal|deep-space)$/, okM = /^(dark|light)$/;
    var th = null, md = null;
    try { th = localStorage.getItem("robin-theme"); md = localStorage.getItem("robin-mode"); } catch (e) {}
    var theme = okT.test(t) ? t : (okT.test(th) ? th : "signal");
    var mode = okM.test(m) ? m : (okM.test(md) ? md : "dark");
    document.documentElement.dataset.theme = theme;
    document.documentElement.dataset.mode = mode;
  } catch (e) {}
})();
