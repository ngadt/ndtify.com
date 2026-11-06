// Shared layout: <head>, header, footer and helpers used by every page.

export const SITE = {
  name: 'NDTify',
  url: 'https://ndtify.com',
  email: 'support@ndtify.com',
  tagline: 'Websites, web apps, WordPress plugins & Shopify apps',
  shopifyPartner: 'https://apps.shopify.com/partners/ndtify',
  ogImage: '/images/og-image.jpg',
  assetVersion: '20261106',
};

export const NAV = [
  { href: '/services/', label: 'Services' },
  { href: '/work/', label: 'Work' },
  { href: '/apps/hubstock/', label: 'HubStock' },
  { href: '/#process', label: 'Process' },
  { href: '/#faq', label: 'FAQ' },
];

/** Escape text for HTML content and attributes. */
export const esc = (s = '') =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export const abs = (path) => SITE.url + path;

/** HubStock brand: icon + full app name, the same as the Shopify App Store listing. */
export const HUB = { name: 'HubStock - Multi-Store Sync', short: 'HubStock', icon: '/images/hubstock/icon.webp' };
export const hubIcon = (px = 24) =>
  `<img src="${HUB.icon}" width="${px}" height="${px}" alt="" class="app-icon" loading="lazy">`;

const LOGO_SVG = (id) => `<svg class="logo-mark" width="32" height="32" viewBox="0 0 32 32" aria-hidden="true">
          <rect width="32" height="32" rx="9" fill="url(#${id})"/>
          <path d="M9 22V10l6 8V10h3v12l-6-8v8H9z" fill="#fff"/>
          <defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#6366f1"/><stop offset="1" stop-color="#22d3ee"/></linearGradient></defs>
        </svg>`;

export const ORGANIZATION = {
  '@type': 'Organization',
  '@id': `${SITE.url}/#organization`,
  name: SITE.name,
  url: `${SITE.url}/`,
  logo: `${SITE.url}/images/logo.png`,
  email: SITE.email,
  description:
    'NDTify is a web and app development studio building custom websites, web apps, WordPress plugins, WooCommerce stores and Shopify apps.',
  sameAs: [SITE.shopifyPartner],
};

export function breadcrumb(items) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: abs(it.path),
    })),
  };
}

/** Visible breadcrumb trail (matches the BreadcrumbList schema). */
export function crumbs(items) {
  return `<nav class="crumbs" aria-label="Breadcrumb"><ol>${items
    .map((it, i) =>
      i === items.length - 1
        ? `<li aria-current="page">${esc(it.name)}</li>`
        : `<li><a href="${it.path}">${esc(it.name)}</a></li>`
    )
    .join('')}</ol></nav>`;
}

function header(path) {
  const links = NAV.map((n) => {
    const current = !n.href.includes('#') && path.startsWith(n.href) ? ' aria-current="page" class="is-active"' : '';
    return `<li><a href="${n.href}"${current}>${n.label}</a></li>`;
  }).join('\n          ');

  return `<header class="site-header" id="header">
    <div class="container header-inner">
      <a href="/" class="logo" aria-label="NDTify – Home">
        ${LOGO_SVG('logoGrad')}
        <span>NDTify</span>
      </a>

      <nav class="site-nav" id="nav" aria-label="Main navigation">
        <ul>
          ${links}
        </ul>
      </nav>

      <div class="header-actions">
        <a href="/contact/" class="btn btn-primary">Start a project</a>
        <button class="nav-toggle" id="navToggle" aria-expanded="false" aria-controls="nav" aria-label="Open menu">
          <span></span><span></span><span></span>
        </button>
      </div>
    </div>
  </header>`;
}

function footer(projects) {
  const work = projects
    .map((p) => `<li><a href="/work/${p.slug}/">${esc(p.name)}</a></li>`)
    .join('\n          ');

  return `<footer class="site-footer">
    <div class="container footer-grid">
      <div class="footer-brand">
        <a href="/" class="logo">
          ${LOGO_SVG('logoGradFoot')}
          <span>NDTify</span>
        </a>
        <p>Independent studio building websites, web apps, WordPress plugins and Shopify apps, plus the integrations that connect them.</p>
        <address>
          <a href="mailto:${SITE.email}">${SITE.email}</a><br>
          <a href="#" data-chat-open>Live chat</a>
        </address>
      </div>

      <nav aria-label="Services">
        <h3>Services</h3>
        <ul>
          <li><a href="/services/#websites">Websites</a></li>
          <li><a href="/services/#web-apps">Web apps &amp; tools</a></li>
          <li><a href="/services/#wordpress-plugins">WordPress plugins</a></li>
          <li><a href="/services/#shopify-apps">Shopify apps</a></li>
          <li><a href="/services/#integrations">Integrations</a></li>
        </ul>
      </nav>

      <nav aria-label="Work">
        <h3>Work</h3>
        <ul>
          ${work}
          <li><a href="/apps/hubstock/">HubStock for Shopify</a></li>
        </ul>
      </nav>

      <nav aria-label="Company">
        <h3>Company</h3>
        <ul>
          <li><a href="/work/">All projects</a></li>
          <li><a href="/#process">How we work</a></li>
          <li><a href="/#faq">FAQ</a></li>
          <li><a href="${SITE.shopifyPartner}" rel="noopener" target="_blank">Shopify App Store</a></li>
          <li><a href="/contact/">Start a project</a></li>
        </ul>
      </nav>
    </div>

    <div class="container footer-bottom">
      <p>© <span id="year">2026</span> NDTify. All rights reserved.</p>
      <p>Built by hand: plain HTML, CSS and a little JavaScript.</p>
    </div>
  </footer>`;
}

const CHAT = `<!-- ===== NDTify live chat (self-hosted, agents reply from Telegram) =====
       Backend lives in /chat (PHP + SQLite). Configure chat/config.php, then open
       /chat/setup.php?key=… once to register the Telegram webhook. -->
  <script>
    window.NDT_CHAT = {
      endpoint: '/chat/api.php',
      title: 'NDTify',
      greeting: 'Hi there 👋 Tell us a bit about your project (website, app, plugin or integration) and a developer will reply right here.',
      offlineGreeting: 'We are away right now, but leave a message with your project details and we will get back to you as soon as we are back.'
    };
  </script>
  <script src="/js/chat-widget.js?v=20261106" defer></script>`;

/**
 * Render a full HTML document.
 * @param {object} o
 * @param {string} o.path        URL path, e.g. "/work/lithaco/"
 * @param {string} o.title       <title>
 * @param {string} o.description meta description
 * @param {string} o.body        <main> inner HTML
 * @param {object[]} [o.schema]  extra JSON-LD nodes for @graph
 * @param {string} [o.ogImage]   path to OG image
 * @param {string} [o.ogType]
 * @param {string} [o.preload]   path to an image to preload (LCP)
 * @param {boolean} [o.noindex]
 * @param {object[]} o.projects  for the footer
 */
export function render(o) {
  const url = abs(o.path);
  const og = abs(o.ogImage || SITE.ogImage);
  const graph = [ORGANIZATION, ...(o.schema || [])];
  const v = SITE.assetVersion;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">

  <title>${esc(o.title)}</title>
  <meta name="description" content="${esc(o.description)}">
  <meta name="robots" content="${o.noindex ? 'noindex, follow' : 'index, follow, max-image-preview:large'}">
  ${o.noindex ? '' : `<link rel="canonical" href="${url}">`}
  <meta name="theme-color" content="#0b1020">

  <meta property="og:type" content="${o.ogType || 'website'}">
  <meta property="og:locale" content="en_US">
  <meta property="og:site_name" content="NDTify">
  <meta property="og:url" content="${url}">
  <meta property="og:title" content="${esc(o.title)}">
  <meta property="og:description" content="${esc(o.description)}">
  <meta property="og:image" content="${og}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${esc(o.title)}">
  <meta name="twitter:description" content="${esc(o.description)}">
  <meta name="twitter:image" content="${og}">

  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <link rel="apple-touch-icon" href="/apple-touch-icon.png">

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  ${o.preload ? `<link rel="preload" as="image" href="${o.preload}" fetchpriority="high">` : ''}
  <link rel="stylesheet" href="/css/style.css?v=${v}">
  <link rel="stylesheet" href="/css/chat-widget.css?v=20261106">

  <script type="application/ld+json">
${JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }, null, 2)}
  </script>
</head>

<body>
  <a class="skip-link" href="#main">Skip to content</a>

  ${header(o.path)}

  <main id="main">
${o.body}
  </main>

  ${footer(o.projects)}

  <script src="/js/main.js?v=${v}" defer></script>
  ${(o.scripts || []).map((s) => `<script src="${s}?v=${v}" defer></script>`).join('\n  ')}

  ${CHAT}
</body>
</html>
`;
}

/** Shared "start a project" call-to-action block. */
export function ctaBlock(heading = 'Have a project in mind?') {
  return `<section class="section cta" id="contact">
      <div class="container">
        <div class="cta-box reveal">
          <div>
            <h2>${heading}</h2>
            <p>Website, web app, plugin, Shopify app or an integration between systems you already use. Tell us what you need and you will hear back from the developer who will build it.</p>
          </div>
          <div class="cta-actions">
            <a href="/contact/" class="btn btn-light btn-lg">Start a project</a>
            <a href="#" class="btn btn-outline btn-lg" data-chat-open>Chat with us</a>
          </div>
        </div>
      </div>
    </section>`;
}
