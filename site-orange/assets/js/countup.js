/* MBA count-up: animates stat numbers (handles commas, +, decimals) when scrolled into view */
(function () {
  function easeOutCubic(p) { return 1 - Math.pow(1 - p, 3); }

  function run(el) {
    var orig = (el.getAttribute('data-cu') || el.textContent).trim();
    el.setAttribute('data-cu', orig);
    var numStr = orig.replace(/[^\d.]/g, '');
    if (!numStr) return;
    var target = parseFloat(numStr);
    if (isNaN(target)) return;
    var commas = /,/.test(orig);
    var suffix = (orig.match(/[^\d.,\s]+\s*$/) || [''])[0];   // e.g. "+", "pts"
    var prefix = (orig.match(/^[^\d.,]+/) || [''])[0];         // e.g. "£"
    var decimals = (numStr.split('.')[1] || '').length;
    var dur = 1200, t0 = null;

    function step(now) {
      if (t0 === null) t0 = now;
      var p = Math.min(1, (now - t0) / dur);
      var v = target * easeOutCubic(p);
      var s = decimals ? v.toFixed(decimals) : Math.round(v).toString();
      if (commas) s = Number(s).toLocaleString('en-GB', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
      el.textContent = prefix + s + suffix;
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = orig; // snap to exact original formatting
    }
    requestAnimationFrame(step);
  }

  function init() {
    var sel = '.stat-number, .leader .ls, .trow strong, .match .sc, #count, [data-countup]';
    var els = Array.prototype.slice.call(document.querySelectorAll(sel));
    if (!els.length) return;
    if (!('IntersectionObserver' in window)) { els.forEach(run); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting && !e.target.__cuDone) {
          e.target.__cuDone = true;
          run(e.target);
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.45 });
    els.forEach(function (el) { io.observe(el); });
  }

  // run after inline data scripts have populated the DOM
  if (document.readyState === 'complete') init();
  else window.addEventListener('load', init);
})();
