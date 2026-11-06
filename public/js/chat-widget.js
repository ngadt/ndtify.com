/* =====================================================
   NDTify Live Chat widget – vanilla JS, no dependencies.
   Talks to chat/api.php; agents reply from Telegram.
   Public API: window.NDTChat.open() / .close() / .toggle()
   ===================================================== */
(function () {
  'use strict';
  if (window.NDTChat) return;

  var CFG = Object.assign({
    endpoint: '/chat/api.php',
    title: 'NDTify Support',
    subtitleOnline: 'Online · usually replies in a few minutes',
    subtitleOffline: 'We reply within a few hours on business days',
    greeting: 'Hi there 👋 How can I help you today?',
    offlineGreeting: 'We are away right now, but leave a message and we will get back to you as soon as possible.',
    emailPrompt: 'Leave your email so we can reply even if you close this tab.',
    teaserTitle: 'Hi there 👋 How can we help?',
    teaserText: 'Chat with our team — we reply right here.',
    teaserDelay: 2500,
    position: 'right',
    askEmail: true,
    sound: true,
    pollActive: 2500,
    pollIdle: 7000,
    pollHidden: 20000
  }, window.NDT_CHAT || {});

  var LS_KEY = 'ndt_chat_v1';
  var state = loadState();
  var dom = {};
  var pollTimer = null;
  var pollAbort = null;
  var pendingIds = {};
  var renderedIds = {};
  var lastGroup = null;
  var lastDay = '';
  var typingTimer = null;
  var typingShown = null;
  var previewTimer = null;
  var titleTimer = null;
  var baseTitle = document.title;
  var audioCtx = null;

  /* ---------- state ---------- */
  function loadState() {
    var s = { token: null, name: '', email: '', lastId: 0, open: false, unread: 0, started: false, emailAsked: false, status: 'open', teaserDismissed: false };
    try { Object.assign(s, JSON.parse(localStorage.getItem(LS_KEY) || '{}')); } catch (e) { /* ignore */ }
    return s;
  }
  function save() {
    try { localStorage.setItem(LS_KEY, JSON.stringify(state)); } catch (e) { /* ignore */ }
  }

  /* ---------- helpers ---------- */
  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function linkify(s) {
    return esc(s).replace(/\bhttps?:\/\/[^\s<>"')\]]+/g, function (u) {
      return '<a href="' + u + '" target="_blank" rel="noopener noreferrer">' + u + '</a>';
    });
  }
  function fmtTime(ts) {
    var d = new Date(ts * 1000);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  function dayLabel(ts) {
    var d = new Date(ts * 1000), now = new Date();
    var same = function (a, b) { return a.toDateString() === b.toDateString(); };
    if (same(d, now)) return 'Today';
    var y = new Date(now); y.setDate(now.getDate() - 1);
    if (same(d, y)) return 'Yesterday';
    return d.toLocaleDateString([], { day: 'numeric', month: 'short' });
  }
  function fmtSize(b) {
    if (!b) return '';
    if (b < 1024) return b + ' B';
    if (b < 1048576) return (b / 1024).toFixed(0) + ' KB';
    return (b / 1048576).toFixed(1) + ' MB';
  }
  function api(action, data) {
    var body = Object.assign({ action: action, token: state.token }, data || {});
    return fetch(CFG.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify(body)
    }).then(function (r) {
      return r.text().then(function (txt) {
        var j = null;
        try { j = JSON.parse(txt); } catch (e) { /* not JSON */ }
        if (!j) {
          var e1 = new Error('Chat server unavailable (HTTP ' + r.status + ')');
          e1.status = r.status; e1.unreachable = true;
          console.error('[NDT chat] ' + CFG.endpoint + ' did not return JSON. Is PHP running and the chat/ folder uploaded?', txt.slice(0, 200));
          throw e1;
        }
        if (!r.ok || !j.ok) { var e = new Error(j.error || ('HTTP ' + r.status)); e.reset = !!j.reset; e.status = r.status; throw e; }
        return j;
      });
    }, function (netErr) {
      var e2 = new Error('You appear to be offline'); e2.unreachable = true; throw e2;
    });
  }

  var ICONS = {
    chat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a8 8 0 0 1-8 8H7l-4 3V12a8 8 0 0 1 8-8h2a8 8 0 0 1 8 8z"/><path d="M8 11h.01M12 11h.01M16 11h.01"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    minimize: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6 15l6-6 6 6"/></svg>',
    send: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3.4 20.4l17.8-8.1a.5.5 0 0 0 0-.9L3.4 3.3a.5.5 0 0 0-.7.6L5 11l9 1-9 1-2.3 7.1a.5.5 0 0 0 .7.6z"/></svg>',
    agent: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></svg>',
    clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l5 5L20 7"/></svg>',
    alert: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16h.01"/></svg>',
    file: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/></svg>'
  };

  /* ---------- build DOM ---------- */
  function build() {
    var root = el('div', 'ndt-chat-root');
    root.setAttribute('data-position', CFG.position);
    root.innerHTML =
      '<div class="ndt-window" role="dialog" aria-label="' + esc(CFG.title) + '" aria-modal="false">' +
        '<div class="ndt-header">' +
          '<div class="ndt-avatar" aria-hidden="true">' + ICONS.agent + '</div>' +
          '<div class="ndt-header-text"><strong>' + esc(CFG.title) + '</strong><span class="ndt-status">' + esc(CFG.subtitleOffline) + '</span></div>' +
          '<button type="button" class="ndt-header-btn ndt-min" aria-label="Minimize chat">' + ICONS.minimize + '</button>' +
        '</div>' +
        '<div class="ndt-body" aria-live="polite" aria-relevant="additions"></div>' +
        '<div class="ndt-banner" hidden></div>' +
        '<form class="ndt-composer" hidden>' +
          '<label class="ndt-sr" for="ndt-input">Type your message</label>' +
          '<textarea id="ndt-input" rows="1" placeholder="Type your message…" maxlength="2000" autocomplete="off"></textarea>' +
          '<button type="submit" class="ndt-send" aria-label="Send message" disabled>' + ICONS.send + '</button>' +
        '</form>' +
        '<div class="ndt-footer">Live chat by <a href="/">' + esc(CFG.title.split(' ')[0]) + '</a></div>' +
      '</div>' +
      '<button type="button" class="ndt-launcher" aria-label="Open live chat" aria-expanded="false">' +
        '<span class="ndt-ic-chat">' + ICONS.chat + '</span><span class="ndt-ic-close">' + ICONS.close + '</span>' +
        '<span class="ndt-badge" hidden></span>' +
      '</button>';
    document.body.appendChild(root);

    dom.root = root;
    dom.window = root.querySelector('.ndt-window');
    dom.body = root.querySelector('.ndt-body');
    dom.banner = root.querySelector('.ndt-banner');
    dom.composer = root.querySelector('.ndt-composer');
    dom.input = root.querySelector('#ndt-input');
    dom.send = root.querySelector('.ndt-send');
    dom.launcher = root.querySelector('.ndt-launcher');
    dom.badge = root.querySelector('.ndt-badge');
    dom.status = root.querySelector('.ndt-status');

    dom.launcher.addEventListener('click', toggle);
    root.querySelector('.ndt-min').addEventListener('click', close);
    dom.composer.addEventListener('submit', function (e) { e.preventDefault(); submit(); });
    dom.input.addEventListener('input', onInput);
    dom.input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(); }
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && state.open) close(); });
    document.addEventListener('visibilitychange', function () {
      if (!document.hidden) { stopTitleFlash(); if (state.open) markRead(); }
      schedulePoll(0);
    });
    document.querySelectorAll('[data-chat-open],[data-crisp-open]').forEach(function (a) {
      a.addEventListener('click', function (e) { e.preventDefault(); open(); });
    });
  }

  /* ---------- open / close ---------- */
  function open() {
    state.open = true; save();
    dom.root.classList.add('is-open');
    dom.launcher.setAttribute('aria-expanded', 'true');
    dom.launcher.setAttribute('aria-label', 'Close live chat');
    if (window.matchMedia('(max-width: 520px)').matches) document.body.classList.add('ndt-chat-lock');
    hidePreview(); hideTeaser(false);
    markRead();
    setTimeout(function () {
      var f = dom.body.querySelector('input') || (dom.composer.hidden ? null : dom.input);
      if (f && !window.matchMedia('(max-width: 520px)').matches) f.focus();
      scrollBottom(true);
    }, 60);
    schedulePoll(0);
  }
  function close() {
    state.open = false; save();
    dom.root.classList.remove('is-open');
    dom.launcher.setAttribute('aria-expanded', 'false');
    dom.launcher.setAttribute('aria-label', 'Open live chat');
    document.body.classList.remove('ndt-chat-lock');
    schedulePoll(0);
  }
  function toggle() { state.open ? close() : open(); }

  /* ---------- unread ---------- */
  function markRead() {
    state.unread = 0; save();
    dom.badge.hidden = true;
  }
  function bumpUnread(msg) {
    state.unread++; save();
    dom.badge.textContent = state.unread > 9 ? '9+' : String(state.unread);
    dom.badge.hidden = false;
    showPreview(msg);
  }
  function showPreview(msg) {
    hidePreview();
    var text = msg.text || (msg.attachment ? (msg.attachment.type === 'image' ? '📷 Photo' : '📎 ' + msg.attachment.name) : '');
    var p = el('button', 'ndt-preview');
    p.type = 'button';
    p.innerHTML = '<div class="ndt-avatar" aria-hidden="true">' + ICONS.agent + '</div><div><strong>' + esc(msg.agent || CFG.title) + '</strong><span>' + esc(text) + '</span></div><span class="ndt-preview-x" aria-label="Dismiss">×</span>';
    p.addEventListener('click', function (e) {
      if (e.target.classList.contains('ndt-preview-x')) { e.stopPropagation(); hidePreview(); return; }
      open();
    });
    dom.root.appendChild(p);
    dom.preview = p;
    previewTimer = setTimeout(hidePreview, 9000);
  }
  function hidePreview() {
    clearTimeout(previewTimer);
    if (dom.preview) { dom.preview.remove(); dom.preview = null; }
  }

  /* ---------- teaser (first visit) ---------- */
  function showTeaser() {
    if (state.open || state.started || state.teaserDismissed || dom.teaser) return;
    var t = el('div', 'ndt-teaser');
    t.setAttribute('role', 'button'); t.tabIndex = 0;
    t.innerHTML = '<strong>' + esc(CFG.teaserTitle) + '</strong><span>' + esc(CFG.teaserText) + '</span>' +
      '<button type="button" class="ndt-teaser-x" aria-label="Dismiss">' + ICONS.close + '</button>';
    t.addEventListener('click', function (e) {
      if (e.target.closest('.ndt-teaser-x')) { e.stopPropagation(); hideTeaser(true); return; }
      open();
    });
    t.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });
    dom.root.appendChild(t); dom.teaser = t;
  }
  function hideTeaser(dismissed) {
    if (dismissed) { state.teaserDismissed = true; save(); }
    if (dom.teaser) { dom.teaser.remove(); dom.teaser = null; }
  }

  /* ---------- notifications ---------- */
  function ping() {
    if (!CFG.sound) return;
    try {
      audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
      if (audioCtx.state === 'suspended') return; // no user gesture yet
      var o = audioCtx.createOscillator(), g = audioCtx.createGain();
      o.type = 'sine'; o.frequency.setValueAtTime(880, audioCtx.currentTime);
      o.frequency.exponentialRampToValueAtTime(1320, audioCtx.currentTime + .12);
      g.gain.setValueAtTime(.0001, audioCtx.currentTime);
      g.gain.exponentialRampToValueAtTime(.12, audioCtx.currentTime + .02);
      g.gain.exponentialRampToValueAtTime(.0001, audioCtx.currentTime + .35);
      o.connect(g).connect(audioCtx.destination); o.start(); o.stop(audioCtx.currentTime + .4);
    } catch (e) { /* ignore */ }
  }
  function desktopNotify(msg) {
    if (!('Notification' in window) || Notification.permission !== 'granted' || !document.hidden) return;
    try {
      var n = new Notification(msg.agent || CFG.title, { body: msg.text || 'Sent you an attachment', tag: 'ndt-chat', icon: '/favicon.svg' });
      n.onclick = function () { window.focus(); open(); n.close(); };
    } catch (e) { /* ignore */ }
  }
  function startTitleFlash() {
    if (titleTimer || !document.hidden) return;
    var on = false;
    titleTimer = setInterval(function () {
      on = !on;
      document.title = on ? '💬 New message – ' + baseTitle : baseTitle;
    }, 1200);
  }
  function stopTitleFlash() {
    clearInterval(titleTimer); titleTimer = null; document.title = baseTitle;
  }

  /* ---------- rendering ---------- */
  function scrollBottom(force) {
    var b = dom.body;
    var nearBottom = b.scrollHeight - b.scrollTop - b.clientHeight < 120;
    if (force || nearBottom) b.scrollTop = b.scrollHeight;
  }
  function clearBody() {
    dom.body.innerHTML = ''; lastGroup = null; lastDay = ''; renderedIds = {};
  }
  function renderMessage(m, opts) {
    opts = opts || {};
    if (m.id && renderedIds[m.id]) { updateMessage(m); return; }
    hideTyping();
    var day = dayLabel(m.at);
    if (day !== lastDay) { dom.body.appendChild(el('div', 'ndt-day', esc(day))); lastDay = day; lastGroup = null; }

    var kind = m.sender;
    var sameGroup = lastGroup && lastGroup.kind === kind && kind !== 'system' && (m.at - lastGroup.at) < 300 && (kind !== 'agent' || lastGroup.agent === (m.agent || ''));
    var g;
    if (sameGroup) {
      g = lastGroup.node;
      var oldMeta = g.querySelector('.ndt-meta'); if (oldMeta) oldMeta.remove();
    } else {
      g = el('div', 'ndt-group is-' + kind);
      if (kind === 'agent') g.appendChild(el('div', 'ndt-sender', esc(m.agent || CFG.title)));
      dom.body.appendChild(g);
    }
    lastGroup = { kind: kind, at: m.at, agent: m.agent || '', node: g };

    var bubble = el('div', 'ndt-msg');
    if (m.id) { bubble.dataset.id = m.id; renderedIds[m.id] = bubble; }
    if (m.localId) bubble.dataset.local = m.localId;
    fillBubble(bubble, m);
    g.appendChild(bubble);
    if (kind !== 'system') g.appendChild(buildMeta(m));
    if (!opts.silent) scrollBottom(opts.force);
  }
  function fillBubble(bubble, m) {
    var html = '';
    if (m.attachment) {
      var a = m.attachment;
      if (a.type === 'image') {
        html += '<a href="' + esc(a.url) + '" target="_blank" rel="noopener"><img class="ndt-attach-img" src="' + esc(a.url) + '" alt="' + esc(a.name || 'image') + '" loading="lazy"></a>';
      } else {
        html += '<a class="ndt-attach-file" href="' + esc(a.url) + '" target="_blank" rel="noopener" download>' + ICONS.file + '<span><b>' + esc(a.name || 'file') + '</b><small>' + esc(fmtSize(a.size)) + '</small></span></a>';
      }
    }
    if (m.text) html += (m.attachment ? '<div style="padding:6px 10px 4px">' : '') + linkify(m.text) + (m.attachment ? '</div>' : '');
    bubble.innerHTML = html;
    bubble.classList.toggle('is-failed', m.status === 'failed');
    var img = bubble.querySelector('img');
    if (img) img.addEventListener('load', function () { scrollBottom(); });
  }
  function buildMeta(m) {
    var meta = el('div', 'ndt-meta');
    var icon = '';
    if (m.sender === 'visitor') {
      if (m.status === 'pending' || m.status === 'sending') icon = ICONS.clock;
      else if (m.status === 'failed') icon = ICONS.alert;
      else icon = ICONS.check;
    }
    meta.innerHTML = '<span>' + esc(fmtTime(m.at)) + '</span>' + icon;
    if (m.status === 'failed') {
      var r = el('button', 'ndt-retry', 'Retry'); r.type = 'button';
      r.addEventListener('click', function () { retry(m); });
      meta.appendChild(r);
    }
    return meta;
  }
  function updateMessage(m) {
    var bubble = (m.id && renderedIds[m.id]) || (m.localId && dom.body.querySelector('[data-local="' + m.localId + '"]'));
    if (!bubble) return;
    if (m.id) { bubble.dataset.id = m.id; renderedIds[m.id] = bubble; }
    fillBubble(bubble, m);
    var g = bubble.parentNode;
    var meta = g.querySelector('.ndt-meta');
    if (meta && g.lastElementChild === meta && meta.previousElementSibling === bubble) {
      g.replaceChild(buildMeta(m), meta);
    }
  }
  function renderSystem(text) {
    renderMessage({ sender: 'system', text: text, at: Math.floor(Date.now() / 1000) });
  }
  function showTyping() {
    if (typingShown) return;
    var g = el('div', 'ndt-group is-agent');
    g.innerHTML = '<div class="ndt-msg ndt-typing" aria-label="Agent is typing"><i></i><i></i><i></i></div>';
    dom.body.appendChild(g); typingShown = g; scrollBottom();
  }
  function hideTyping() {
    if (typingShown) { typingShown.remove(); typingShown = null; }
  }
  function setOnline(on) {
    dom.root.classList.toggle('is-online', !!on);
    dom.status.textContent = on ? CFG.subtitleOnline : CFG.subtitleOffline;
  }
  function showBanner(text, kind) {
    dom.banner.textContent = text;
    dom.banner.className = 'ndt-banner' + (kind === 'info' ? ' is-info' : '');
    dom.banner.hidden = false;
  }
  function setStatus(status) {
    state.status = status; save();
    if (status === 'closed') showBanner('This conversation was closed. Send a message to start a new one.', 'info');
    else dom.banner.hidden = true;
  }

  /* ---------- pre-chat ---------- */
  function renderPrechat(online) {
    clearBody();
    dom.composer.hidden = true;
    var box = el('div', 'ndt-prechat');
    box.innerHTML =
      '<div><h3>' + esc(online ? 'Hi there 👋' : 'Leave us a message') + '</h3><p>' + esc(online ? CFG.greeting : CFG.offlineGreeting) + '</p></div>' +
      '<form class="ndt-prechat-form" novalidate>' +
        '<div class="ndt-field"><label for="ndt-name">Your name</label><input id="ndt-name" name="name" type="text" required maxlength="80" placeholder="Jane Doe" autocomplete="name" value="' + esc(state.name) + '"></div>' +
        '<div class="ndt-field" style="margin-top:10px"><label for="ndt-email">Email <span style="font-weight:400;color:#94a3b8">(optional, so we can follow up)</span></label><input id="ndt-email" name="email" type="email" maxlength="120" placeholder="you@example.com" autocomplete="email" value="' + esc(state.email) + '"></div>' +
        '<button type="submit" class="ndt-btn" style="width:100%;margin-top:16px">Start chat</button>' +
        '<p class="ndt-fineprint" style="margin:10px 0 0">Your details are only used to reply to you.</p>' +
      '</form>';
    dom.body.appendChild(box);
    box.querySelector('form').addEventListener('submit', function (e) {
      e.preventDefault();
      var name = box.querySelector('#ndt-name'), email = box.querySelector('#ndt-email');
      if (!name.value.trim()) { name.reportValidity(); name.focus(); return; }
      if (email.value && !email.checkValidity()) { email.reportValidity(); email.focus(); return; }
      state.name = name.value.trim(); state.email = email.value.trim(); state.started = true; save();
      startConversation();
    });
  }
  function startConversation() {
    clearBody();
    dom.composer.hidden = false;
    renderMessage({ sender: 'agent', agent: CFG.title, text: (dom.root.classList.contains('is-online') ? CFG.greeting : CFG.offlineGreeting), at: Math.floor(Date.now() / 1000) }, { force: true });
    dom.input.focus();
    if (state.token) api('identify', { name: state.name, email: state.email }).catch(function () { /* will be sent with first message */ });
  }

  /* ---------- inline email card ---------- */
  function maybeAskEmail() {
    if (!CFG.askEmail || state.email || state.emailAsked) return;
    state.emailAsked = true; save();
    var card = el('div', 'ndt-card');
    card.innerHTML = '<p>' + esc(CFG.emailPrompt) + '</p><form novalidate><input type="email" placeholder="you@example.com" autocomplete="email" aria-label="Email"><button type="submit">Save</button></form><button type="button" class="ndt-skip">No thanks</button>';
    var form = card.querySelector('form'), input = card.querySelector('input');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!input.value || !input.checkValidity()) { input.reportValidity(); return; }
      state.email = input.value.trim(); save();
      api('identify', { email: state.email }).then(function () {
        card.remove(); renderSystem('Thanks! We will follow up at ' + state.email + ' if needed.');
      }).catch(function (err) { input.setCustomValidity(err.message); input.reportValidity(); input.setCustomValidity(''); });
    });
    card.querySelector('.ndt-skip').addEventListener('click', function () { card.remove(); });
    dom.body.appendChild(card); scrollBottom(true);
  }

  /* ---------- composer ---------- */
  function onInput() {
    dom.input.style.height = 'auto';
    dom.input.style.height = Math.min(dom.input.scrollHeight, 140) + 'px';
    dom.send.disabled = !dom.input.value.trim();
    if (state.token && dom.input.value.trim() && !typingTimer) {
      api('typing').catch(function () { /* ignore */ });
      typingTimer = setTimeout(function () { typingTimer = null; }, 4000);
    }
  }
  var localSeq = 0;
  var localMsgs = [];
  function adoptOrphan(m) {
    // A visitor message came back from the server that we don't know by id:
    // if we have a local bubble with the same text and no id (send looked
    // failed but was actually stored), attach it instead of drawing a copy.
    for (var i = localMsgs.length - 1; i >= 0; i--) {
      var l = localMsgs[i];
      if (!l.id && l.text === m.text) {
        l.id = m.id; l.status = m.status; l.at = m.at;
        updateMessage(l);
        if (l.status === 'pending') pendingIds[l.id] = true;
        return true;
      }
    }
    return false;
  }
  function submit() {
    var text = dom.input.value.trim();
    if (!text) return;
    dom.input.value = ''; onInput();
    if ('Notification' in window && Notification.permission === 'default') {
      try { Notification.requestPermission(); } catch (e) { /* ignore */ }
    }
    try { audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)(); audioCtx.resume && audioCtx.resume(); } catch (e) { /* ignore */ }

    var m = { sender: 'visitor', text: text, status: 'sending', at: Math.floor(Date.now() / 1000), localId: 'l' + (++localSeq) };
    localMsgs.push(m);
    renderMessage(m, { force: true });
    deliver(m);
  }
  function deliver(m) {
    var first = !hasVisitorMessages();
    var payload = { text: m.text };
    if (first || !state.identified) { payload.name = state.name; payload.email = state.email; }
    api('send', payload).then(function (r) {
      state.identified = true;
      m.id = r.message.id; m.status = r.message.status; m.at = r.message.at;
      updateMessage(m);
      if (m.status === 'pending') pendingIds[m.id] = true;
      // lastId is advanced by poll() only, so an agent reply stored just
      // before this message can never be skipped.
      save();
      setOnline(r.online); setStatus(r.status);
      if (first) setTimeout(maybeAskEmail, 1500);
      schedulePoll(1500);
    }).catch(function (err) {
      if (err.reset) { resetSession(); return; }
      m.status = 'failed'; updateMessage(m);
      if (err.status === 429) renderSystem(err.message);
      else if (err.unreachable) { schedulePoll(1200); }
    });
  }
  function retry(m) {
    if (m.id) { m.status = 'pending'; updateMessage(m); pendingIds[m.id] = true; schedulePoll(0); return; }
    m.status = 'sending'; updateMessage(m); deliver(m);
  }
  function hasVisitorMessages() {
    return !!dom.body.querySelector('.ndt-group.is-visitor .ndt-msg[data-id]');
  }

  /* ---------- session ---------- */
  function resetSession() {
    state.token = null; state.lastId = 0; state.identified = false; save();
    init();
  }
  function init() {
    api('init', { page: location.href, referrer: document.referrer, lang: navigator.language })
      .then(function (r) {
        state.token = r.token; save();
        dom.banner.hidden = true;
        setOnline(r.online);
        if (r.conv.name) state.name = r.conv.name;
        if (r.conv.email) state.email = r.conv.email;
        state.identified = !!r.conv.name;
        var hasHistory = r.messages && r.messages.length;
        if (hasHistory || state.started) {
          clearBody(); dom.composer.hidden = false;
          if (!hasHistory) {
            renderMessage({ sender: 'agent', agent: CFG.title, text: r.online ? CFG.greeting : CFG.offlineGreeting, at: r.now }, { silent: true });
          }
          (r.messages || []).forEach(function (m) {
            renderMessage(m, { silent: true });
            if (m.status === 'pending') pendingIds[m.id] = true;
            state.lastId = Math.max(state.lastId, m.id);
          });
          save();
          setStatus(r.conv.status);
          scrollBottom(true);
          state.started = true; save();
        } else {
          renderPrechat(r.online);
        }
        if (state.open) open();
        if (state.unread > 0) { dom.badge.textContent = state.unread > 9 ? '9+' : String(state.unread); dom.badge.hidden = false; }
        schedulePoll(0);
      })
      .catch(function (err) {
        // Backend unreachable: keep the pre-chat visible so the bubble still works later.
        setOnline(false);
        if (!dom.body.children.length) renderPrechat(false);
        showBanner('Live chat is temporarily unavailable. Email us at support@ndtify.com.', 'warn');
        setTimeout(init, 20000);
      });
  }

  /* ---------- polling ---------- */
  function pollDelay() {
    if (document.hidden) return CFG.pollHidden;
    return state.open ? CFG.pollActive : CFG.pollIdle;
  }
  function schedulePoll(delay) {
    clearTimeout(pollTimer);
    if (!state.token || !state.started) return;
    pollTimer = setTimeout(poll, delay == null ? pollDelay() : delay);
  }
  function poll() {
    if (!state.token) return;
    if (pollAbort) pollAbort.abort();
    pollAbort = ('AbortController' in window) ? new AbortController() : null;
    var body = { action: 'poll', token: state.token, since: state.lastId, pending: Object.keys(pendingIds).map(Number) };
    fetch(CFG.endpoint, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'same-origin',
      body: JSON.stringify(body), signal: pollAbort ? pollAbort.signal : undefined
    }).then(function (r) { return r.json(); }).then(function (r) {
      if (!r.ok) { if (r.reset) { resetSession(); } return; }
      setOnline(r.online);
      if (r.status !== state.status) setStatus(r.status);
      (r.resolved || []).forEach(function (m) {
        delete pendingIds[m.id]; updateMessage(m);
      });
      var fresh = 0;
      (r.messages || []).forEach(function (m) {
        if (m.id <= state.lastId) return;
        state.lastId = m.id;
        var isNew = !renderedIds[m.id];
        if (isNew && m.sender === 'visitor' && adoptOrphan(m)) return;
        renderMessage(m, { force: state.open });
        if (m.sender === 'agent' && isNew) {
          fresh++;
          if (!state.open || document.hidden) { bumpUnread(m); desktopNotify(m); startTitleFlash(); }
        }
      });
      if (fresh) { ping(); }
      save();
    }).catch(function () { /* network hiccup – next tick */ })
      .then(function () { schedulePoll(); });
  }

  /* ---------- boot ---------- */
  function boot() {
    build();
    init();
    if (CFG.teaserDelay > 0) setTimeout(showTeaser, CFG.teaserDelay);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();

  window.NDTChat = { open: open, close: close, toggle: toggle };
})();
