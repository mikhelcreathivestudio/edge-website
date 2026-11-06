/* EDGE site: renders every page from the .json content files (edited in /admin.html) */
(async function () {
  'use strict';

  /* ---------- helpers ---------- */
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const br = (s) => esc(s).replace(/\r?\n/g, '<br>');
  const rich = (s) => br(s).replace(/\[\[(.+?)\]\]/g, '<span class="grad">$1</span>');
  const link = (u) => { u = String(u || '').trim(); return /^(https?:\/\/|\/|[a-z0-9_\-./]+\.html)/i.test(u) ? u : ''; };
  const ext = (u) => { u = String(u || '').trim(); return /^https:\/\//i.test(u) ? u : ''; };
  const short = (s, n) => { s = String(s || ''); return s.length > n ? s.slice(0, n - 1).trimEnd() + '…' : s; };
  const q = (k) => new URLSearchParams(location.search).get(k);
  const skins = ['s1', 's2', 's3', 's4', 's5', 's6'];

  /* ---------- load content ---------- */
  let S, P, T;
  try {
    const get = (n) => fetch('/' + n + '.json?v=' + Date.now()).then((r) => { if (!r.ok) throw new Error(n); return r.json(); });
    const parts = await Promise.all(['contact', 'home', 'services', 'packages', 'about', 'projects', 'team'].map(get));
    S = Object.assign({}, parts[0], parts[1], parts[2], parts[3], parts[4]);
    P = parts[5]; T = parts[6];
  } catch (e) {
    $('#app').innerHTML = '<div class="ph">Could not load the site content. If you opened this file directly from your computer, run a local server first (see README).</div>';
    return;
  }
  const projects = (P.projects || []).filter((p) => p.published !== false);
  const team = (T.team || []).filter((p) => p.published !== false);
  const packages = S.packages || [];
  const page = document.body.dataset.page;

  /* ---------- shared pieces ---------- */
  const sec = (inner, cls) => `<section class="sec ${cls || ''}"><div class="wrap">${inner}</div></section>`;
  const head = (eye, title, sub) => `<div class="center sh rv"><span class="eyebrow">${esc(eye)}</span><h2 class="h2 mt">${rich(title)}</h2>${sub ? `<p class="lead">${esc(sub)}</p>` : ''}</div>`;

  function nav(active) {
    const L = [['services.html', 'Services', 'services'], ['projects.html', 'Projects', 'projects'], ['team.html', 'Team', 'team'], ['hire.html', 'Hire', 'hire'], ['about.html', 'About', 'about']];
    return `<header class="wrap nav rv"><a class="logo" href="index.html">${esc(S.brand)}<i></i></a><nav class="links">${L.map((l) => `<a class="${active === l[2] ? 'on' : ''}" href="${l[0]}">${l[1]}</a>`).join('')}</nav><a class="btn sm" href="book.html">Book a call</a></header>`;
  }

  function footer() {
    const contact = [S.email ? `<a href="mailto:${esc(S.email)}">${esc(S.email)}</a>` : '', S.phone ? `<a href="tel:${esc(S.phone)}">${esc(S.phone)}</a>` : ''].join('');
    return `<footer class="foot"><div class="wrap foot-in"><div><div class="logo">${esc(S.brand)}<i></i></div><p class="mt" style="max-width:320px">${esc(S.tagline)}</p></div><div class="fcols"><div><h4>Explore</h4><a href="services.html">Services</a><a href="projects.html">Projects</a><a href="team.html">Team</a><a href="about.html">About</a></div><div><h4>Work with us</h4><a href="projects.html">Order a project</a><a href="hire.html">Hire a developer</a><a href="book.html">Book a call</a></div><div><h4>Contact</h4>${contact}</div></div></div><div class="wrap copy">&copy; ${new Date().getFullYear()} ${esc(S.brand)}. All rights reserved.</div></footer>`;
  }

  const ctaBlock = (title, text, b1, b2) => `<section class="cta"><div class="wrap"><span class="eyebrow rv">Let's talk</span><h2 class="h1 rv" style="--d:100;font-size:clamp(32px,4.8vw,62px)">${rich(title)}</h2>${text ? `<p class="lead rv" style="--d:200">${esc(text)}</p>` : ''}<div class="row c rv" style="--d:300">${b1 || '<a class="btn" href="book.html">Book a free call</a>'}${b2 || '<a class="btn2" href="hire.html">Hire a developer</a>'}</div></div></section>`;

  const pageHero = (active, eye, title, sub, extra) => `<section class="hero page-hero">${nav(active)}<div class="wrap hero-in"><span class="eyebrow rv" style="--d:100">${esc(eye)}</span><h1 class="h1 rv" style="--d:200;font-size:clamp(36px,5.2vw,72px)">${rich(title)}</h1>${sub ? `<p class="lead rv" style="--d:350">${esc(sub)}</p>` : ''}${extra || ''}</div></section>`;

  const projMedia = (p, i) => p.image
    ? `<div class="shotw"><img class="pimg" loading="lazy" src="${esc(link(p.image))}" alt="${esc(p.name)}"></div>`
    : `<div class="shotw"><div class="shot ${skins[i % 6]}"><b></b><span>${esc(p.name).toUpperCase()}</span></div></div>`;

  const projCard = (p, i) => {
    const id = encodeURIComponent(p.id);
    return `<article class="card pad rv" style="--d:${(i % 3) * 120}">${projMedia(p, i)}<span class="tag">${esc(p.category)}</span><h3 class="h3"><a href="project.html?id=${id}">${esc(p.name)}</a></h3><p>${esc(short(p.description, 110))}</p>${p.price ? `<div class="kv"><span>Price</span><b>${esc(p.price)}</b></div>` : ''}<div class="row"><a class="btn sm" href="project.html?id=${id}#order">Order</a><a class="btn2 sm" href="project.html?id=${id}&mode=negotiate#order">Negotiate</a></div></article>`;
  };

  const avatar = (m, i) => `<div class="ava ${skins[i % 6]}">${m.photo ? `<img loading="lazy" src="${esc(link(m.photo))}" alt="${esc(m.name)}">` : `<b>${esc((m.name || '?').trim().charAt(0).toUpperCase())}</b>`}</div>`;

  const memberCard = (m, i) => `<article class="card pad rv" style="--d:${(i % 4) * 110}">${avatar(m, i)}<h3 class="h3"><a href="member.html?id=${encodeURIComponent(m.id)}">${esc(m.name)}</a></h3><span class="tag">${esc(m.role)}</span>${m.starting_rate ? `<div class="kv"><span>From</span><b>${esc(m.starting_rate)}</b></div>` : ''}<div class="row"><a class="btn sm" href="hire.html?dev=${encodeURIComponent(m.id)}#order">Hire</a><a class="btn2 sm" href="member.html?id=${encodeURIComponent(m.id)}">Profile</a></div></article>`;

  const pkgCard = (k, i) => {
    const pay = ext(k.stripe_link), pp = ext(k.paypal_link), hot = !!k.popular;
    return `<div class="card rv ${hot ? 'hot' : ''}" style="--d:${i * 130};padding:38px 34px;gap:18px">${hot ? '<span class="badge" style="align-self:flex-start">Most popular</span>' : ''}<h3 class="h3">${esc(k.name)}</h3><div class="price">${esc(k.price)}<small> / from</small></div><p>${esc(k.blurb)}</p><ul class="list">${(k.features || []).map((f) => `<li>${esc(f)}</li>`).join('')}</ul><a class="${hot ? 'btn' : 'btn2'}" href="hire.html?plan=${encodeURIComponent(k.name)}#order">Choose ${esc(k.name)}</a>${pay ? `<a class="btn2 sm" target="_blank" rel="noopener" href="${esc(pay)}">Pay ${esc(k.name)} with Stripe</a>` : ''}${pp ? `<a class="btn2 sm" target="_blank" rel="noopener" href="${esc(pp)}">Pay ${esc(k.name)} with PayPal</a>` : ''}</div>`;
  };

  const statsBlock = () => {
    const st = S.stats || [];
    if (!st.length) return '';
    return `<section class="sec alt" style="padding:70px 0"><div class="wrap"><div class="glass stats">${st.map((x) => `<div><span class="cnt" data-t="${esc(x.value)}" data-s="${esc(x.suffix || '')}">0</span><p>${esc(x.label)}</p></div>`).join('')}</div></div></section>`;
  };

  const processBlock = (alt) => sec(head('Process', 'From idea to launch in [[four steps]]', 'A clear process so you always know what happens next.') + `<div class="g4">${(S.process || []).map((s, i) => `<div class="card rv" style="--d:${i * 110}"><span class="num">0${i + 1}</span><h3 class="h3">${esc(s.title)}</h3><p>${esc(s.text)}</p></div>`).join('')}</div>`, alt ? 'alt' : '');

  /* ---------- forms ---------- */
  const F = {
    text: (l, n, ph, req, type) => `<div class="field"><label>${l}</label><input name="${n}" type="${type || 'text'}" placeholder="${esc(ph || '')}" ${req ? 'required' : ''}></div>`,
    area: (l, n, ph, req) => `<div class="field"><label>${l}</label><textarea name="${n}" placeholder="${esc(ph || '')}" ${req ? 'required' : ''}></textarea></div>`,
    sel: (l, n, opts, sel) => `<div class="field"><label>${l}</label><select name="${n}">${opts.map((o) => `<option ${o === sel ? 'selected' : ''}>${esc(o)}</option>`).join('')}</select></div>`
  };
  const honeypot = '<input type="text" name="_gotcha" tabindex="-1" autocomplete="off" aria-hidden="true" style="position:absolute;left:-9999px">';

  async function sendForm(form) {
    const data = {};
    new FormData(form).forEach((v, k) => { data[k] = v; });
    if (data._gotcha) return;
    const subject = form.dataset.subject || 'Website message';
    data._subject = '[' + S.brand + '] ' + subject;
    const btn = $('[type=submit]', form);
    const old = btn.textContent;
    btn.disabled = true; btn.textContent = 'Sending...';
    $$('.okmsg,.errmsg', form).forEach((n) => n.remove());
    const ep = ext(S.form_endpoint);
    try {
      if (ep) {
        const r = await fetch(ep, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(data) });
        if (!r.ok) throw new Error('failed');
        form.insertAdjacentHTML('beforeend', `<div class="okmsg">Thank you! Your message is in. We will reply within ${esc(S.reply_time || '24 hours')}.</div>`);
        form.classList.add('sent');
      } else {
        const lines = Object.keys(data).filter((k) => k[0] !== '_').map((k) => k + ': ' + data[k]).join('\n');
        location.href = 'mailto:' + S.email + '?subject=' + encodeURIComponent(data._subject) + '&body=' + encodeURIComponent(lines);
        form.insertAdjacentHTML('beforeend', '<div class="okmsg">Your email app should open with the message ready. Press send there to finish.</div>');
        btn.disabled = false; btn.textContent = old;
      }
    } catch (e) {
      btn.disabled = false; btn.textContent = old;
      form.insertAdjacentHTML('beforeend', `<div class="errmsg">Something went wrong. Please email us directly at <a href="mailto:${esc(S.email)}">${esc(S.email)}</a>.</div>`);
    }
  }
  function bindForms(root) {
    $$('form[data-subject]', root).forEach((f) => f.addEventListener('submit', (e) => { e.preventDefault(); sendForm(f); }));
  }

  /* ---------- page renderers ---------- */
  const R = {};

  R.home = () => {
    const h = S.hero || {};
    const chips = (h.chips || []).slice(0, 4).map((c, i) => `<span class="chip c${i + 1}"><i></i>${esc(c)}</span>`).join('');
    const m = (S.marquee || []).map((x) => `<span>${esc(x)}</span><span>&#10022;</span>`).join('');
    const feat = projects.slice(0, 3);
    return `<section class="hero">${chips}${nav('')}<div class="wrap hero-in"><span class="eyebrow rv" style="--d:100">${esc(h.eyebrow)}</span><h1 class="h1 rv" style="--d:200">${rich(h.title)}</h1><p class="lead rv" style="--d:350;font-size:19px">${esc(h.subtitle)}</p><div class="row c rv" style="--d:500"><a class="btn" href="book.html">${esc(h.primary_button || 'Book a free call')}</a><a class="btn2" href="projects.html">${esc(h.secondary_button || 'Explore projects')}</a></div></div></section>
    ${m ? `<div class="marq"><div class="track">${m}${m}</div></div>` : ''}
    ${sec(head('How it works', 'Three ways to work with [[' + esc(S.brand) + ']]', 'Whether you want it done, want a piece of it, or want a person, there is a path that fits.') + `<div class="g3">${(S.ways || []).map((w, i) => `<a class="card rv" href="${esc(link(w.link) || 'projects.html')}" style="--d:${i * 150};padding:36px 32px"><span class="num">0${i + 1}</span><h3 class="h3">${esc(w.title)}</h3><p>${esc(w.text)}</p></a>`).join('')}</div>`)}
    ${sec(head('Services', 'Everything your website needs, [[under one roof]]', 'Design, development and branding from one team, so nothing gets lost between tools.') + `<div class="g3">${(S.services || []).map((s, i) => `<a class="card rv" href="services.html" style="--d:${(i % 3) * 120}"><span class="num">0${i + 1}</span><h3 class="h3">${esc(s.title)}</h3><p>${esc(s.text)}</p></a>`).join('')}</div>`, 'alt')}
    ${feat.length ? sec(head('Completed projects', 'Pick a project. [[Make it yours.]]', 'Order a project exactly as shown, or negotiate for just the section, page or idea you loved.') + `<div class="g3">${feat.map(projCard).join('')}</div><div class="row c mt2"><a class="btn2" href="projects.html">View all projects</a></div>`) : ''}
    ${team.length ? sec(head('The team', 'Meet the people who [[build it]]', 'Every developer has a specialty. Choose the right one and hire them directly.') + `<div class="g4">${team.slice(0, 4).map(memberCard).join('')}</div><div class="row c mt2"><a class="btn2" href="team.html">See the full team</a></div>`, 'alt') : ''}
    ${packages.length ? sec(head('Hire a developer', 'Simple packages. [[No surprises.]]', 'Pick a tier, pick a developer. Not sure yet? Book a free consultation first.') + `<div class="g3">${packages.map(pkgCard).join('')}</div><div class="row c mt2"><a class="btn2" href="book.html">Book a consultation</a></div>`) : ''}
    ${statsBlock()}
    ${processBlock(!(S.stats || []).length)}
    ${(S.testimonials || []).length ? sec(head('Testimonials', 'Clients who got their [[EDGE]]') + `<div class="g3">${S.testimonials.map((t, i) => `<div class="card rv" style="--d:${i * 120}"><div style="color:#4D9BFF;letter-spacing:4px">&#9733;&#9733;&#9733;&#9733;&#9733;</div><p style="color:#DDE5F5;font-size:17px">&ldquo;${esc(t.quote)}&rdquo;</p><h4>${esc(t.name)}</h4><span class="tag">${esc(t.company)}</span></div>`).join('')}</div>`, 'alt') : ''}
    ${ctaBlock((S.cta || {}).title, (S.cta || {}).text)}`;
  };

  R.services = () => {
    const fs = S.fullstack || {};
    return pageHero('services', 'Services', 'One team. [[Every skill]]\nyour website needs.', 'From the first sketch in Figma to a live, animated site and the brand around it.') +
      sec(`<div class="g2">${(S.services || []).map((s, i) => `<div class="card rv" style="--d:${(i % 2) * 120};padding:38px"><span class="num">0${i + 1} · ${esc(String(s.tag || '').toUpperCase())}</span><h3 class="h3">${esc(s.title)}</h3><p>${esc(s.text)}</p><ul class="list mt">${(s.bullets || []).map((b) => `<li>${esc(b)}</li>`).join('')}</ul><div class="row mt"><a class="btn sm" href="book.html">Discuss this</a><a class="btn2 sm" href="projects.html">See projects</a></div></div>`).join('')}</div>`) +
      (fs.title ? sec(`<div class="split eq"><div class="rv"><span class="eyebrow">Full-stack</span><h2 class="h2 mt">${rich(fs.title)}</h2><p class="mt">${esc(fs.text)}</p><div class="row mt2"><a class="btn" href="book.html">Tell us your idea</a></div></div><div class="glass rv" style="padding:34px;display:flex;flex-direction:column;gap:16px">${(fs.rows || []).map((r, i) => (i ? '<div class="line"></div>' : '') + `<div class="kv"><span>${esc(r.k)}</span><b>${esc(r.v)}</b></div>`).join('')}</div></div>`, 'alt') : '') +
      processBlock(false) +
      ctaBlock('Not sure which service\nyou need? [[Just ask.]]', 'A free call is enough to point you in the right direction.', '<a class="btn" href="book.html">Book a free call</a>', '<a class="btn2" href="hire.html">See packages</a>');
  };

  R.projects = () => {
    const cats = ['All'].concat(Array.from(new Set(projects.map((p) => p.category).filter(Boolean))));
    return pageHero('projects', 'Completed projects', 'Find a design. [[Make it yours.]]', 'Order a project exactly as shown, or negotiate for just the page, section or idea you loved.', `<div class="row c rv" style="--d:480" id="chips">${cats.map((c, i) => `<button class="pill ${i ? '' : 'on'}" data-c="${esc(c)}">${esc(c)}</button>`).join('')}</div>`) +
      sec(`<div class="g3" id="grid"></div>${projects.length ? '' : '<p class="center">No projects yet. Add them in the dashboard.</p>'}`) +
      sec(`<div class="split eq"><div class="rv"><span class="eyebrow">Only want a part?</span><h2 class="h2 mt">Love one section? [[Negotiate it.]]</h2><p class="mt">If you only want a page, a section or the structure of a design for your own brand, pick the project and send a negotiation request. We reply with a fair price for exactly that.</p></div><div class="glass rv" style="padding:30px;display:flex;flex-direction:column;gap:14px"><div class="kv"><span>1</span><b>Open any project</b></div><div class="line"></div><div class="kv"><span>2</span><b>Tell us what you loved</b></div><div class="line"></div><div class="kv"><span>3</span><b>Get a custom quote</b></div></div></div>`, 'alt') +
      ctaBlock("Don't see what you want?\n[[We'll build it.]]", '');
  };
  R.projects.after = () => {
    const grid = $('#grid');
    const draw = (c) => {
      const list = projects.filter((p) => c === 'All' || p.category === c);
      grid.innerHTML = list.map(projCard).join('');
      observe();
    };
    draw('All');
    $$('#chips .pill').forEach((b) => b.addEventListener('click', () => { $$('#chips .pill').forEach((x) => x.classList.remove('on')); b.classList.add('on'); draw(b.dataset.c); }));
  };

  R.project = () => {
    const p = projects.find((x) => x.id === q('id')) || projects[0];
    if (!p) return pageHero('projects', 'Project', 'Project not found') + sec('<p class="center">This project does not exist. <a href="projects.html" class="tag">Back to all projects</a></p>');
    const idx = projects.indexOf(p);
    const mode = q('mode') === 'negotiate' ? 'nego' : 'order';
    const stripe = ext(p.stripe_link), paypal = ext(p.paypal_link);
    const gal = (p.gallery || []).filter((g) => g.image);
    const meta = [['Platform', p.platform], ['Pages', p.pages], ['Delivery', p.delivery], ['Category', p.category]].filter((m) => m[1]);
    const others = projects.filter((x) => x !== p).slice(0, 3);
    return `<section class="hero page-hero" style="padding-bottom:30px">${nav('projects')}<div class="wrap rv" style="--d:100;padding-top:30px"><a href="projects.html" class="tag">&larr; All projects</a></div></section>
    <section class="sec" style="padding-top:20px"><div class="wrap split">
      <div>
        <div class="card big pad rv" style="padding:18px">${projMedia(p, idx)}</div>
        ${gal.length ? `<div class="g3 mt" style="gap:16px">${gal.slice(0, 6).map((g) => `<div class="card pad" style="padding:10px"><div class="shotw"><img class="pimg" loading="lazy" src="${esc(link(g.image))}" alt="${esc(g.label || p.name)}"></div></div>`).join('')}</div>` : ''}
        <div class="mt2 rv"><span class="tag">About this project</span><h1 class="h2 mt" style="font-size:36px">${esc(p.name)}</h1><p class="mt">${br(p.description)}</p></div>
        ${meta.length ? `<div class="g2 mt2" style="gap:16px">${meta.map((m) => `<div class="glass" style="padding:22px"><span class="tag">${esc(m[0])}</span><h4 class="mt" style="font-size:19px">${esc(m[1])}</h4></div>`).join('')}</div>` : ''}
      </div>
      <aside class="sticky" id="order"><div class="card" style="padding:32px;gap:18px">
        <div class="row" style="justify-content:space-between"><button class="pill ${mode === 'order' ? 'on' : ''}" data-mode="order">Order project</button><button class="pill ${mode === 'nego' ? 'on' : ''}" data-mode="nego">Negotiate</button></div>
        <div data-pane="order" class="${mode === 'order' ? '' : 'hide'}" style="display:flex;flex-direction:column;gap:18px">
          <span class="badge" style="align-self:flex-start">Buy this exact project</span>
          <div class="price">${esc(p.price || 'Ask us')}</div>
          ${(p.includes || []).length ? `<ul class="list">${p.includes.map((i) => `<li>${esc(i)}</li>`).join('')}</ul>` : ''}
          <div class="line"></div>
          ${stripe ? `<a class="btn" target="_blank" rel="noopener" href="${esc(stripe)}" style="justify-content:center">Pay with Stripe</a>` : ''}
          ${paypal ? `<a class="btn2" target="_blank" rel="noopener" href="${esc(paypal)}" style="justify-content:center">Pay with PayPal</a>` : ''}
          ${stripe || paypal ? '<p style="font-size:13px">Secure checkout. After payment, we message you to start.</p>' : `<form data-subject="Order request: ${esc(p.name)}" style="display:flex;flex-direction:column;gap:14px"><input type="hidden" name="project" value="${esc(p.name)}">${F.text('Your name', 'name', 'Full name', true)}${F.text('Your email', 'email', 'you@email.com', true, 'email')}${F.area('Notes (optional)', 'message', 'Anything we should know?')}${honeypot}<button class="btn" type="submit" style="justify-content:center">Request this project</button></form>`}
        </div>
        <div data-pane="nego" class="${mode === 'nego' ? '' : 'hide'}">
          <form data-subject="Negotiation request: ${esc(p.name)}" style="display:flex;flex-direction:column;gap:16px"><span class="badge" style="align-self:flex-start">Want only a part? Let's talk price</span><input type="hidden" name="project" value="${esc(p.name)}">${F.sel('What do you want from this project?', 'wants', ['One section', 'One page', 'The design idea / style', 'The page structure for my brand'])}${F.area('Tell us more', 'message', "I saw this project and loved the pricing section. I'd like to use the structure for my brand...", true)}${F.text('Your budget (optional)', 'budget', 'e.g. $150')}${F.text('Your name', 'name', 'Full name', true)}${F.text('Your email', 'email', 'you@email.com', true, 'email')}${honeypot}<button class="btn" type="submit" style="justify-content:center">Send negotiation request</button><p style="font-size:13px">We reply with a custom quote, usually within ${esc(S.reply_time || '24 hours')}.</p></form>
        </div>
        <div class="line"></div><a class="btn2" href="book.html" style="justify-content:center">Or book a quick call</a>
      </div></aside>
    </div></section>
    ${others.length ? sec(head('More projects', 'You might also [[like]]') + `<div class="g3">${others.map(projCard).join('')}</div>`, 'alt') : ''}`;
  };
  R.project.after = () => {
    $$('[data-mode]').forEach((b) => b.addEventListener('click', () => {
      $$('[data-mode]').forEach((x) => x.classList.toggle('on', x === b));
      $$('[data-pane]').forEach((pn) => pn.classList.toggle('hide', pn.dataset.pane !== b.dataset.mode));
    }));
    const p = projects.find((x) => x.id === q('id')) || projects[0];
    if (p) document.title = p.name + ' | ' + S.brand;
  };

  R.team = () => {
    const groups = ['Everyone'].concat(Array.from(new Set(team.map((m) => m.group).filter(Boolean))));
    return pageHero('team', 'The team', 'Choose your [[developer.]]', 'Browse by specialty, view their work, then hire them directly or book a call first.', `<div class="row c rv" style="--d:480" id="chips">${groups.map((c, i) => `<button class="pill ${i ? '' : 'on'}" data-c="${esc(c)}">${esc(c)}</button>`).join('')}</div>`) +
      sec('<div class="g4" id="grid"></div>') +
      sec(`<div class="glass rv" style="padding:44px;display:flex;justify-content:space-between;align-items:center;gap:30px;flex-wrap:wrap"><div><h2 class="h2" style="font-size:34px">Not sure who fits your project?</h2><p class="mt">Tell us what you need and we will match you with the right developer.</p></div><a class="btn" href="book.html">Book a free call</a></div>`, 'alt');
  };
  R.team.after = () => {
    const grid = $('#grid');
    const draw = (c) => { grid.innerHTML = team.filter((m) => c === 'Everyone' || m.group === c).map(memberCard).join(''); observe(); };
    draw('Everyone');
    $$('#chips .pill').forEach((b) => b.addEventListener('click', () => { $$('#chips .pill').forEach((x) => x.classList.remove('on')); b.classList.add('on'); draw(b.dataset.c); }));
  };

  R.member = () => {
    const m = team.find((x) => x.id === q('id')) || team[0];
    if (!m) return pageHero('team', 'Team', 'Profile not found') + sec('<p class="center"><a href="team.html" class="tag">Back to the team</a></p>');
    const idx = team.indexOf(m);
    const work = (m.work || []).map((id) => projects.find((p) => p.id === id)).filter(Boolean);
    const facts = [['Years', m.years], ['Starting rate', m.starting_rate]].filter((f) => f[1]);
    return `<section class="hero page-hero" style="padding-bottom:30px">${nav('team')}<div class="wrap rv" style="--d:100;padding-top:30px"><a href="team.html" class="tag">&larr; Whole team</a></div></section>
    <section class="sec" style="padding-top:20px"><div class="wrap split">
      <div>
        <div class="split eq rv" style="gap:36px;align-items:center"><div class="ava ${skins[idx % 6]}" style="aspect-ratio:1">${m.photo ? `<img src="${esc(link(m.photo))}" alt="${esc(m.name)}">` : `<b>${esc(m.name.trim().charAt(0).toUpperCase())}</b>`}</div><div>${m.available !== false ? '<span class="badge">Available now</span>' : '<span class="badge">Fully booked</span>'}<h1 class="h1 mt" style="font-size:clamp(34px,4vw,52px)">${esc(m.name)}</h1><p class="mt">${esc(m.role)}</p><div class="row mt">${(m.skills || []).map((s) => `<span class="pill">${esc(s)}</span>`).join('')}</div></div></div>
        <div class="mt3 rv"><span class="tag">About</span><p class="mt" style="font-size:17px">${br(m.bio)}</p></div>
        ${facts.length ? `<div class="g3 mt3" style="gap:16px">${facts.map((f) => `<div class="glass" style="padding:22px"><span class="tag">${esc(f[0])}</span><h4 class="mt" style="font-size:19px">${esc(f[1])}</h4></div>`).join('')}</div>` : ''}
        ${work.length ? `<div class="mt3"><span class="tag">Recent work</span><div class="g2 mt">${work.map(projCard).join('')}</div></div>` : ''}
      </div>
      <aside class="sticky"><div class="card" style="padding:32px;gap:18px"><h3 class="h3">Hire ${esc(m.name.split(' ')[0])}</h3>
        <div class="row" style="gap:8px" id="tiers">${packages.map((k, i) => `<button class="pill ${k.popular || (!packages.some((x) => x.popular) && i === 0) ? 'on' : ''}" data-i="${i}">${esc(k.name)}</button>`).join('')}</div>
        <div id="plan"></div>
        <a class="btn" id="hireBtn" href="#" style="justify-content:center">Hire</a><a class="btn2" href="book.html?dev=${encodeURIComponent(m.id)}" style="justify-content:center">Book a call first</a>
      </div></aside>
    </div></section>`;
  };
  R.member.after = () => {
    const m = team.find((x) => x.id === q('id')) || team[0];
    if (!m) return;
    document.title = m.name + ' | ' + S.brand;
    const show = (i) => {
      const k = packages[i]; if (!k) return;
      $('#plan').innerHTML = `<div class="price">${esc(k.price)}<small> / from</small></div><p class="mt">${esc(k.blurb)}</p><ul class="list mt">${(k.features || []).map((f) => `<li>${esc(f)}</li>`).join('')}</ul>`;
      const b = $('#hireBtn'); b.textContent = 'Hire with ' + k.name; b.href = 'hire.html?dev=' + encodeURIComponent(m.id) + '&plan=' + encodeURIComponent(k.name) + '#order';
    };
    const start = Math.max(0, packages.findIndex((k) => k.popular));
    show(start);
    $$('#tiers .pill').forEach((b) => b.addEventListener('click', () => { $$('#tiers .pill').forEach((x) => x.classList.remove('on')); b.classList.add('on'); show(+b.dataset.i); }));
  };

  R.hire = () => {
    const devs = team.map((m) => m.name + ' · ' + m.role).concat(['Match me with the best fit']);
    const plan = q('plan'), dev = team.find((m) => m.id === q('dev'));
    const planOpts = packages.map((k) => k.name + ' · ' + k.price);
    const planSel = planOpts.find((o) => o.split(' · ')[0] === plan) || (packages.find((k) => k.popular) ? planOpts[packages.findIndex((k) => k.popular)] : planOpts[0]);
    const devSel = dev ? dev.name + ' · ' + dev.role : 'Match me with the best fit';
    return pageHero('hire', 'Hire a developer', 'Simple packages. [[No surprises.]]', 'Pick a tier, pick a developer, and get started. Or talk to us first.') +
      sec(`<div class="g3">${packages.map(pkgCard).join('')}</div><div class="row c mt2"><a class="btn2" href="book.html">Not sure? Book a consultation</a></div>`) +
      sec(`<div class="split"><div class="rv"><span class="eyebrow">Start your order</span><h2 class="h2 mt">Tell us about [[your project]]</h2><p class="mt">Choose your package and developer, add a few details, and we will confirm the next steps.</p><div class="mt2 tl"><div><h4>1. You send the request</h4><p>Pick a package and a developer.</p></div><div><h4>2. We confirm and quote</h4><p>Within ${esc(S.reply_time || '24 hours')}, with a clear scope.</p></div><div><h4>3. Pay and kick off</h4><p>Secure payment through Stripe or PayPal.</p></div></div></div>
      <form class="card rv" id="order" data-subject="Hire request" style="padding:34px;gap:18px">${F.sel('Package', 'package', planOpts, planSel)}${F.sel('Developer', 'developer', devs, devSel)}${F.text('Your name', 'name', 'Full name', true)}${F.text('Email', 'email', 'you@email.com', true, 'email')}${F.area('Project details', 'message', 'Tell us about your brand, pages needed and any examples you like...', true)}${honeypot}<button class="btn" type="submit" style="justify-content:center">Send hire request</button><a class="btn2" href="book.html" style="justify-content:center">Or book a call</a></form></div>`, 'alt') +
      ((S.faq || []).length ? sec(`<div style="max-width:860px;margin:0 auto">${head('FAQ', 'Questions [[answered]]')}<div style="display:flex;flex-direction:column;gap:14px">${S.faq.map((f, i) => `<div class="faq ${i ? '' : 'open'}"><button type="button">${esc(f.q)}</button><p class="${i ? 'hide' : ''}">${br(f.a)}</p></div>`).join('')}</div></div>`) : '');
  };
  R.hire.after = () => {
    $$('.faq button').forEach((b) => b.addEventListener('click', () => { const f = b.parentElement; f.classList.toggle('open'); $('p', f).classList.toggle('hide'); }));
  };

  R.about = () => {
    const a = S.about || {};
    const st = S.stats || [];
    return pageHero('about', 'About us', a.headline, a.intro) +
      sec(`<div class="split eq"><div class="rv"><span class="eyebrow">Our story</span><h2 class="h2 mt">Why [[${esc(S.brand)}]] exists</h2><p class="mt" style="font-size:17px">${br(a.story)}</p><p class="mt">${br(a.approach)}</p></div>${st.length ? `<div class="g2" style="gap:16px">${st.map((x) => `<div class="glass rv" style="padding:28px;text-align:center"><span class="cnt sm" data-t="${esc(x.value)}" data-s="${esc(x.suffix || '')}">0</span><p style="font-size:14px">${esc(x.label)}</p></div>`).join('')}</div>` : `<div class="glass rv" style="padding:34px;display:flex;flex-direction:column;gap:16px">${(S.services || []).slice(0, 4).map((s, i) => (i ? '<div class="line"></div>' : '') + `<div class="kv"><span>${esc(s.tag)}</span><b>${esc(s.title)}</b></div>`).join('')}</div>`}</div>`, '') +
      sec(head('Values', 'What we [[stand for]]') + `<div class="g3">${(a.values || []).map((v, i) => `<div class="card rv" style="--d:${i * 120};padding:34px"><span class="num">0${i + 1}</span><h3 class="h3">${esc(v.title)}</h3><p>${esc(v.text)}</p></div>`).join('')}</div>`, 'alt') +
      ((a.timeline || []).length ? sec(`<div class="split eq"><div class="tl">${a.timeline.map((t) => `<div><span class="tag">${esc(t.label)}</span><h4 class="mt">${esc(t.title)}</h4><p>${esc(t.text)}</p></div>`).join('')}</div><div class="rv"><span class="eyebrow">Our journey</span><h2 class="h2 mt">Built one [[project]] at a time</h2><div class="row mt2"><a class="btn" href="team.html">Meet the team</a></div></div></div>`) : '') +
      ctaBlock("Let's build something\n[[with an edge.]]", '', '<a class="btn" href="book.html">Book a free call</a>', '<a class="btn2" href="projects.html">See our work</a>');
  };

  R.book = () => {
    const dev = team.find((m) => m.id === q('dev'));
    const embed = ext(S.booking_url);
    const body = embed
      ? `<div class="card rv" style="padding:14px"><iframe class="embed" src="${esc(embed)}" title="Book a call" loading="lazy"></iframe></div>`
      : `<div class="split"><form class="card rv" data-subject="Call booking request" style="padding:36px;gap:22px"><div><span class="tag">1 · Pick a day</span><div class="days mt" id="days"></div></div><div><span class="tag">2 · Pick a time</span><div class="times mt" id="times">${(S.booking_slots || []).map((t, i) => `<button type="button" class="slot ${i === 1 ? 'on' : ''}" data-t="${esc(t)}">${esc(t)}</button>`).join('')}</div><p style="font-size:13px" class="mt">Times shown in ${esc(S.timezone_label || 'our local time')}.</p></div><div class="line"></div><span class="tag">3 · Your details</span><input type="hidden" name="day" id="fDay"><input type="hidden" name="time" id="fTime"><div class="g2" style="gap:14px">${F.text('Name', 'name', 'Full name', true)}${F.text('Email', 'email', 'you@email.com', true, 'email')}</div>${F.sel('What would you like to talk about?', 'topic', ['A new website', 'Order or negotiate a project', 'Hire a developer', 'Something else'])}${dev ? `<input type="hidden" name="developer" value="${esc(dev.name)}">` : ''}${F.area('Notes (optional)', 'message', 'Anything we should know before the call?')}${honeypot}<button class="btn" type="submit" style="justify-content:center">Request this time</button></form>
      <aside class="sticky"><div class="card" style="padding:32px;gap:18px"><span class="badge" style="align-self:flex-start">Your booking</span><div class="kv"><span>Date</span><b id="sDay">-</b></div><div class="line"></div><div class="kv"><span>Time</span><b id="sTime">-</b></div><div class="line"></div><div class="kv"><span>Length</span><b>20 minutes</b></div><div class="line"></div><div class="kv"><span>Where</span><b>Video call</b></div>${dev ? `<div class="line"></div><div class="kv"><span>With</span><b>${esc(dev.name)}</b></div>` : ''}</div><div class="glass mt" style="padding:28px"><h4>What to expect</h4><ul class="list mt"><li>We listen to your goals</li><li>We suggest the right approach</li><li>You get a clear next step</li></ul></div></aside></div>`;
    return pageHero('', 'Free consultation', 'Book a [[free call.]]', '20 minutes to talk about your project. No pressure, just a clear plan.') + sec(body);
  };
  R.book.after = () => {
    if (!$('#days')) return;
    const days = [];
    const d = new Date();
    while (days.length < 5) { d.setDate(d.getDate() + 1); if (d.getDay() !== 0 && d.getDay() !== 6) days.push(new Date(d)); }
    const fmt = (x) => x.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    $('#days').innerHTML = days.map((x, i) => `<button type="button" class="day ${i === 1 ? 'on' : ''}" data-i="${i}"><span>${x.toLocaleDateString('en-US', { weekday: 'short' })}</span><b>${x.getDate()}</b><span>${x.toLocaleDateString('en-US', { month: 'short' })}</span></button>`).join('');
    const sync = () => {
      const di = +($('#days .on') || { dataset: { i: 1 } }).dataset.i;
      const t = ($('#times .on') || { dataset: { t: '' } }).dataset.t;
      $('#sDay').textContent = fmt(days[di]); $('#sTime').textContent = t || '-';
      $('#fDay').value = days[di].toDateString(); $('#fTime').value = t;
    };
    $$('#days .day').forEach((b) => b.addEventListener('click', () => { $$('#days .day').forEach((x) => x.classList.remove('on')); b.classList.add('on'); sync(); }));
    $$('#times .slot').forEach((b) => b.addEventListener('click', () => { $$('#times .slot').forEach((x) => x.classList.remove('on')); b.classList.add('on'); sync(); }));
    sync();
  };

  /* ---------- motion ---------- */
  let io, cio;
  function observe() {
    if (!('IntersectionObserver' in window)) { $$('.rv').forEach((n) => n.classList.add('in')); $$('.cnt').forEach(countUp); return; }
    io = io || new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    cio = cio || new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { countUp(e.target); cio.unobserve(e.target); } }), { threshold: 0.4 });
    $$('.rv:not(.in)').forEach((n) => io.observe(n));
    $$('.cnt:not([data-done])').forEach((n) => cio.observe(n));
  }
  function countUp(el) {
    if (el.dataset.done) return;
    el.dataset.done = '1';
    const t = parseFloat(el.dataset.t) || 0, suf = el.dataset.s || '', dur = 1800, t0 = performance.now();
    const step = (now) => { const p = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - p, 3); el.textContent = Math.round(t * e) + suf; if (p < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }

  /* ---------- mount ---------- */
  const render = R[page] || R.home;
  const root = $('#app');
  root.innerHTML = render() + footer();
  if (!document.title || document.title === 'EDGE') document.title = S.brand;
  bindForms(root);
  if (render.after) render.after();
  observe();

  /* spotlight on cards + scroll bar */
  document.addEventListener('pointermove', (e) => {
    const c = e.target.closest && e.target.closest('.card');
    if (!c) return;
    const r = c.getBoundingClientRect();
    c.style.setProperty('--mx', (e.clientX - r.left) + 'px');
    c.style.setProperty('--my', (e.clientY - r.top) + 'px');
  });
  const bar = $('#bar');
  const onScroll = () => { const h = document.documentElement; const m = h.scrollHeight - h.clientHeight; if (bar) bar.style.width = (m > 0 ? (h.scrollTop / m) * 100 : 0) + '%'; };
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
})();
