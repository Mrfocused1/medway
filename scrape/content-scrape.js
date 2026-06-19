const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const START = 'https://www.medwaybasketball.co.uk';
const HOST = new URL(START).host.replace(/^www\./, '');
const MAX_PAGES = 120;

const norm = u => { try { const x = new URL(u, START); x.hash=''; return x.href.replace(/\/$/, ''); } catch { return null; } };

(async () => {
  const browser = await puppeteer.launch({ headless:'new', args:['--no-sandbox'] });
  const queue = [norm(START)];
  const seen = new Set(queue);
  const out = [];

  while (queue.length && out.length < MAX_PAGES) {
    const url = queue.shift();
    const page = await browser.newPage();
    await page.setViewport({ width: 1366, height: 900 });
    try {
      await page.goto(url, { waitUntil:'networkidle2', timeout: 45000 });
      await new Promise(r=>setTimeout(r,1500));
    } catch (e) { await page.close(); continue; }

    const data = await page.evaluate(() => {
      const clean = t => (t||'').replace(/\s+/g,' ').trim();
      const seenTxt = new Set();
      const blocks = [];
      const push = (type, text) => {
        text = clean(text);
        if (text.length < 2) return;
        const key = type+'|'+text.toLowerCase();
        if (seenTxt.has(key)) return; seenTxt.add(key);
        blocks.push({ type, text });
      };
      // walk meaningful content elements in document order
      const sel = 'h1,h2,h3,h4,h5,h6,p,li,blockquote,figcaption,button,a,td,th,span';
      document.querySelectorAll(sel).forEach(el => {
        // skip if it has element children of the same selectable types (avoid duplicate container text)
        const hasBlockChild = el.querySelector('h1,h2,h3,h4,h5,h6,p,li,blockquote');
        if (hasBlockChild) return;
        const tag = el.tagName.toLowerCase();
        const t = el.innerText || el.textContent;
        if (!t || !t.trim()) return;
        if (/^(a|button)$/.test(tag)) push(tag==='a'?'link':'button', t);
        else if (/^h[1-6]$/.test(tag)) push(tag, t);
        else push('text', t);
      });
      // collect internal links
      const links = [...document.querySelectorAll('a[href]')].map(a=>a.href);
      return { title: document.title, metaDesc: (document.querySelector('meta[name=description]')||{}).content||'', blocks, links };
    });

    out.push({ url, title: data.title, metaDesc: data.metaDesc, blocks: data.blocks });

    // enqueue internal links
    for (const l of data.links) {
      const n = norm(l);
      if (!n) continue;
      try { if (new URL(n).host.replace(/^www\./,'') !== HOST) continue; } catch { continue; }
      if (/\.(pdf|jpg|png|zip|mp4|webp|svg|docx?)($|\?)/i.test(n)) continue;
      if (!seen.has(n)) { seen.add(n); queue.push(n); }
    }
    await page.close();
  }
  await browser.close();
  fs.writeFileSync(path.join(__dirname,'mba-content.json'), JSON.stringify(out, null, 2));
  console.log('pages scraped:', out.length);
  out.forEach(p=>console.log(' -', p.url, '(', p.blocks.length, 'blocks )'));
})();
