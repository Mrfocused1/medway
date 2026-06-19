const fs = require('fs');
const ROOT = '/Users/paulbridges/Desktop/Medway Basketball Association/site-orange';
const s = fs.readFileSync(ROOT + '/scores.html', 'utf8');

// --- slice the scores scaffold: keep head + nav + menu, drop the scores content ---
const heroIdx = s.indexOf('class="s-hero');
const heroTagStart = s.lastIndexOf('<', heroIdx);
const prefix = s.slice(0, heroTagStart);

const footerStart = s.indexOf('<footer');
const footerEnd = s.indexOf('</footer>') + '</footer>'.length;
const footerHTML = s.slice(footerStart, footerEnd);

const toggleStart = s.indexOf("<script>(function(){var btn=document.querySelector('.nav-menu-btn')");
const tailFromToggle = s.slice(toggleStart); // toggle script + </body></html>

// --- contact content ---
const ICON = {
  pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 21s7-6.6 7-12a7 7 0 1 0-14 0c0 5.4 7 12 7 12Z"/><circle cx="12" cy="9" r="2.6"/></svg>',
  phone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2 4.2 2 2 0 0 1 4 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.2a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.8 2Z"/></svg>',
  mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>',
  clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>'
};
const ARROW = '<svg class="c-hero-arrow" viewBox="0 0 300 120" fill="none" aria-hidden="true"><path d="M6 66 C52 26 92 104 140 66 S232 40 268 70" stroke="#fff" stroke-width="11" stroke-linecap="round"/><path d="M244 48 L276 70 L242 94" stroke="#fff" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const CIRCLE = '<svg class="circle" viewBox="0 0 250 92" fill="none" aria-hidden="true"><ellipse cx="125" cy="46" rx="120" ry="40" stroke="#fff" stroke-width="3.5" transform="rotate(-3 125 46)"/></svg>';

const CONTENT = `<style id="mba-contact-css">
  .mba-contact{--cred:#ed1b2f;--cline:rgba(255,255,255,.16);background:#030303;color:#f5f5f5;}
  .mba-contact *{box-sizing:border-box;}
  .c-hero{position:relative;overflow:hidden;border-bottom:1px solid var(--cline);padding:130px 5vw 72px;min-height:58vh;display:flex;flex-direction:column;justify-content:center;}
  .c-hero-ball{position:absolute;right:-2vw;top:50%;transform:translateY(-50%);width:min(46vw,620px);z-index:1;pointer-events:none;}
  .c-hero-arrow{position:absolute;left:34%;bottom:13%;width:min(26vw,330px);height:auto;z-index:2;pointer-events:none;}
  .c-title{position:relative;z-index:3;margin:0;font-family:"Integral CF",Impact,sans-serif;font-weight:900;text-transform:uppercase;font-size:clamp(62px,11vw,148px);line-height:.84;letter-spacing:-.03em;}
  .c-title .red{display:block;color:var(--cred);}
  .c-title .white{display:block;color:#fff;background:var(--tex) center/cover;-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:rgba(255,255,255,.92);}
  .c-intro{position:relative;z-index:3;margin:22px 0 0;max-width:380px;font-family:var(--body,inherit);font-size:clamp(18px,2vw,23px);font-weight:700;line-height:1.25;}
  .c-body{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.15fr);border-bottom:1px solid var(--cline);}
  .c-col{padding:48px 5vw;}
  .c-col + .c-col{border-left:1px solid var(--cline);}
  .c-h2{margin:0 0 18px;color:var(--cred);font-family:"Integral CF",Impact,sans-serif;font-weight:900;text-transform:uppercase;font-size:clamp(26px,3vw,34px);letter-spacing:-.01em;}
  .c-text{margin:0 0 28px;font-size:18px;line-height:1.4;color:#e8e8e8;}
  .c-info{display:grid;}
  .c-info-item{display:grid;grid-template-columns:64px 1fr;gap:18px;padding:0 0 18px;margin-bottom:18px;border-bottom:1px solid rgba(255,255,255,.14);}
  .c-info-item:last-child{margin-bottom:0;border-bottom:0;padding-bottom:0;}
  .c-icon{width:54px;height:54px;border:1px solid rgba(255,255,255,.3);border-radius:6px;color:var(--cred);display:flex;align-items:center;justify-content:center;}
  .c-icon svg{width:26px;height:26px;}
  .c-label{font-weight:900;text-transform:uppercase;font-size:14px;letter-spacing:.04em;margin-bottom:5px;}
  .c-value{font-size:16px;line-height:1.4;color:#d8d8d8;}
  .c-form{display:grid;gap:12px;}
  .c-form-row{display:grid;grid-template-columns:1fr 1fr;gap:12px;}
  .c-form input,.c-form textarea{width:100%;background:#0a0a0a;border:1px solid rgba(255,255,255,.4);color:#fff;border-radius:6px;padding:0 16px;font-size:15px;font-family:inherit;outline:none;transition:border-color .2s;}
  .c-form input{height:58px;}
  .c-form textarea{min-height:150px;padding:16px;resize:vertical;}
  .c-form input:focus,.c-form textarea:focus{border-color:var(--cred);}
  .c-form ::placeholder{color:rgba(255,255,255,.6);}
  .c-agree{display:flex;align-items:flex-start;gap:12px;margin:6px 0;font-size:14px;line-height:1.4;color:#cfcfcf;}
  .c-agree input{appearance:none;-webkit-appearance:none;width:24px;height:24px;min-width:24px;border:1px solid rgba(255,255,255,.6);border-radius:4px;background:#0a0a0a;cursor:pointer;margin:0;}
  .c-agree input:checked{background:var(--cred);box-shadow:inset 0 0 0 4px #030303;}
  .c-agree a{color:var(--cred);text-decoration:none;}
  .c-submit{width:100%;height:62px;border:0;border-radius:6px;background:var(--cred);color:#fff;font-family:"Integral CF",Impact,sans-serif;font-weight:900;font-size:18px;text-transform:uppercase;letter-spacing:.02em;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:12px;transition:filter .2s;}
  .c-submit:hover{filter:brightness(1.12);}
  .c-aff{position:relative;overflow:hidden;padding:56px 5vw;display:grid;grid-template-columns:1.1fr 1fr auto;gap:34px;align-items:center;}
  .c-aff-ball{position:absolute;right:-60px;bottom:-90px;width:min(40vw,440px);opacity:.85;filter:grayscale(1) brightness(.32) contrast(1.25);z-index:1;pointer-events:none;}
  .c-aff-title{position:relative;z-index:2;margin:0;font-family:"Integral CF",Impact,sans-serif;font-weight:900;text-transform:uppercase;line-height:.9;letter-spacing:-.02em;}
  .c-aff-title .a1{display:block;color:#fff;font-size:clamp(24px,3.2vw,38px);}
  .c-aff-title .a2{display:block;color:var(--cred);font-size:clamp(32px,4.6vw,56px);}
  .c-aff-text{position:relative;z-index:2;font-size:18px;line-height:1.4;max-width:360px;margin:0;}
  .c-aff-btn{position:relative;z-index:2;display:inline-flex;align-items:center;justify-content:center;gap:10px;min-width:240px;height:76px;color:#fff;text-decoration:none;font-family:"Integral CF",Impact,sans-serif;font-weight:900;font-size:16px;text-transform:uppercase;justify-self:end;transition:transform .2s;}
  .c-aff-btn:hover{transform:scale(1.04);}
  .c-aff-btn .circle{position:absolute;inset:50% auto auto 50%;transform:translate(-50%,-50%);width:108%;height:auto;}
  .c-aff-btn .lbl{position:relative;z-index:2;}
  .c-aff-btn .arr{position:relative;z-index:2;color:var(--cred);}
  @media(max-width:900px){
    .c-body{grid-template-columns:1fr;}
    .c-col + .c-col{border-left:0;border-top:1px solid var(--cline);}
    .c-hero-ball{width:min(72vw,420px);right:-14vw;top:36%;}
    .c-hero-arrow{display:none;}
    .c-aff{grid-template-columns:1fr;}
    .c-aff-text{max-width:none;}
    .c-aff-btn{justify-self:start;}
  }
  @media(max-width:520px){
    .c-form-row{grid-template-columns:1fr;}
    .c-hero{padding:118px 7vw 48px;min-height:auto;}
  }
</style>
<section class="mba-contact">
  <section class="c-hero">
    <img class="c-hero-ball" src="assets/img/ticker-ball.webp" alt="">
    ${ARROW}
    <h1 class="c-title"><span class="red">Contact</span><span class="white">Us</span></h1>
    <p class="c-intro">We&rsquo;re here to help and we&rsquo;d love to hear from you.</p>
  </section>

  <div class="c-body">
    <div class="c-col">
      <h2 class="c-h2">Get In Touch</h2>
      <p class="c-text">Have a question, suggestion or just want to say hello? Use the form or reach out to us directly.</p>
      <div class="c-info">
        <div class="c-info-item"><div class="c-icon">${ICON.pin}</div><div><div class="c-label">Our Office</div><div class="c-value">Medway Basketball Association<br>Medway Park, Mill Road, Gillingham, ME7 1HF</div></div></div>
        <div class="c-info-item"><div class="c-icon">${ICON.phone}</div><div><div class="c-label">Phone</div><div class="c-value">01634 123 456</div></div></div>
        <div class="c-info-item"><div class="c-icon">${ICON.mail}</div><div><div class="c-label">Email</div><div class="c-value">info@medwaybasketball.co.uk</div></div></div>
        <div class="c-info-item"><div class="c-icon">${ICON.clock}</div><div><div class="c-label">Office Hours</div><div class="c-value">Monday &ndash; Friday: 9:00am &ndash; 5:00pm</div></div></div>
      </div>
    </div>
    <div class="c-col">
      <h2 class="c-h2">Send Us A Message</h2>
      <form class="c-form" onsubmit="this.querySelector('.c-submit').textContent='Thanks \\u2014 we\\u2019ll be in touch';return false;">
        <div class="c-form-row">
          <input type="text" name="name" placeholder="Your Name *" required>
          <input type="email" name="email" placeholder="Email Address *" required>
        </div>
        <input type="text" name="subject" placeholder="Subject *" required>
        <textarea name="message" placeholder="Your Message *" required></textarea>
        <label class="c-agree"><input type="checkbox" required><span>I agree to the <a href="#">Privacy Policy</a> and <a href="#">Terms &amp; Conditions</a>.</span></label>
        <button class="c-submit" type="submit">Send Message <span>&rarr;</span></button>
      </form>
    </div>
  </div>

  <section class="c-aff">
    <img class="c-aff-ball" src="assets/img/ticker-ball.webp" alt="">
    <h2 class="c-aff-title"><span class="a1">Want To Get Your Club</span><span class="a2">Affiliated?</span></h2>
    <p class="c-aff-text">Join the Medway Basketball Association and be part of our growing basketball community across Medway &amp; Kent.</p>
    <a class="c-aff-btn" href="#">${CIRCLE}<span class="lbl">Find Out More</span> <span class="arr">&rarr;</span></a>
  </section>
</section>
`;

let out = prefix + CONTENT + '\n' + footerHTML + '\n' + tailFromToggle;
// fix the <title>
out = out.replace(/<title>[^<]*<\/title>/, '<title>Contact — Medway Basketball Association</title>');
fs.writeFileSync(ROOT + '/contact.html', out);
console.log('contact.html written:', out.length, 'bytes; has hero:', out.includes('c-hero'), '; has form:', out.includes('c-form'), '; title ok:', /Contact — Medway/.test(out));
