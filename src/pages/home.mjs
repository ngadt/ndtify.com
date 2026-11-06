import { SITE, esc, ctaBlock, HUB, hubIcon } from '../site.mjs';
import { PROJECTS, HUBSTOCK } from '../projects.mjs';
import { projectCard, hubstockCard } from './cards.mjs';

const SERVICES = [
  {
    id: 'websites',
    title: 'Websites',
    text: 'Custom WordPress themes and WooCommerce stores that load fast, rank well and are easy for your team to update.',
    icon: '<path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Zm0 4v10h16V8H4Zm2-3a1 1 0 1 0 0 2 1 1 0 0 0 0-2Zm3 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2Z"/>',
  },
  {
    id: 'web-apps',
    title: 'Web apps & tools',
    text: 'Calculators, lookups, booking flows and dashboards: the interactive pieces that turn visitors into leads.',
    icon: '<path d="M4 3h7v7H4V3Zm9 0h7v7h-7V3ZM4 14h7v7H4v-7Zm11 0h2v3h3v2h-3v3h-2v-3h-3v-2h3v-3Z"/>',
  },
  {
    id: 'wordpress-plugins',
    title: 'WordPress plugins',
    text: 'Custom plugins and WooCommerce extensions for the features your theme or off-the-shelf plugins can’t do.',
    icon: '<path d="M9 3a1 1 0 0 1 1 1v3h4V4a1 1 0 1 1 2 0v3h2a1 1 0 0 1 1 1v3a6 6 0 0 1-5 5.9V21a1 1 0 1 1-2 0v-4.1A6 6 0 0 1 5 11V8a1 1 0 0 1 1-1h2V4a1 1 0 0 1 1-1Z"/>',
  },
  {
    id: 'shopify-apps',
    title: 'Shopify apps',
    text: 'Public and custom Shopify apps built on the Admin API and webhooks. We ship and run our own, HubStock.',
    icon: '<path d="M6 2h12l2 5v1a3 3 0 0 1-3 3 3 3 0 0 1-3-3 3 3 0 0 1-3 3 3 3 0 0 1-3-3 3 3 0 0 1-3 3 3 3 0 0 1-3-3V7l2-5Zm-1 11.5a5 5 0 0 0 2-.6 5 5 0 0 0 5 0 5 5 0 0 0 5 0 5 5 0 0 0 2 .6V21a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-7.5ZM9 15v5h6v-5H9Z"/>',
  },
];

const FEATURES = [
  ['⚡', 'Fast by default', 'Hand-written themes instead of heavy page builders. lithaco.com and keb.com.vn score 95–100 on Google PageSpeed.'],
  ['🔍', 'Built to be found', 'Clean HTML, proper headings, schema markup, sitemaps and pages planned around what your customers actually search for.'],
  ['🧮', 'Tools, not just pages', 'Calculators, code lookups, filters and booking flows that answer a visitor’s question on the spot.'],
  ['🔌', 'Connects to what you use', 'Zalo, WhatsApp, Telegram, PayPal, Klaviyo, Shopify, Google Sheets, REST APIs. If it has an API, we can wire it up.'],
  ['🌏', 'Local and international', 'Clients in Vietnam, Singapore and South Korea, plus our own app on the Shopify App Store. We work in English and Vietnamese.'],
  ['💬', 'Talk to the developer', 'No account managers in between. The person you chat with is the person writing your code.'],
];

const STEPS = [
  ['01', 'Tell us what you need', 'Chat or email us your goal, examples you like and any deadline. A rough idea is enough to start.'],
  ['02', 'Scope & quote', 'We map out pages, features and integrations, then send a written quote and timeline before any work begins.'],
  ['03', 'Build & review', 'You get a private preview link early and see progress as we go, with real content and no lorem ipsum at launch.'],
  ['04', 'Launch & support', 'We handle hosting setup, redirects, analytics and Search Console, and stay on hand for fixes and new features.'],
];

export const FAQ = [
  [
    'What kinds of projects do you take on?',
    'Business websites, WooCommerce stores, custom WordPress plugins, Shopify apps, and interactive web tools such as calculators, lookups and booking flows. We also connect systems together: chat apps, payment gateways, email marketing, inventory and other APIs.',
  ],
  [
    'Who will I be working with?',
    'One person: the developer who builds your project. NDTify is an independent studio, not an agency, so there are no account managers or hand-offs. You brief, review and launch with the same person throughout, and the same person supports the site afterwards.',
  ],
  [
    'How much does a project cost?',
    'Every project is quoted individually because scope varies a lot. Send us a short description and we will reply with questions, then a written fixed quote and timeline before anything starts.',
  ],
  [
    'Do you work with clients outside Vietnam?',
    'Yes. We have built for clients in Vietnam, Singapore and South Korea, including multi-market Shopify stores, and our own app HubStock is listed on the Shopify App Store. We work in English and Vietnamese, and everything happens online.',
  ],
  [
    'Can you take over or fix an existing website, plugin or app?',
    'Yes. We regularly pick up existing WordPress sites, WooCommerce stores and custom code: fixing bugs, speeding things up, adding features or rebuilding the parts that hold you back.',
  ],
  [
    'What happens after launch?',
    'We set up analytics and Google Search Console, hand over everything you need to manage content, and stay available for fixes, updates and new features as your business grows.',
  ],
];

export function faqSchema() {
  return {
    '@type': 'FAQPage',
    '@id': `${SITE.url}/#faq`,
    mainEntity: FAQ.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
  };
}

export function home() {
  return {
    path: '/',
    title: 'NDTify: Websites, Web Apps, WordPress & Shopify Apps',
    description:
      'NDTify builds custom websites, web apps, WordPress plugins, WooCommerce stores and Shopify apps, and connects them to the tools you already use.',
    preload: '/images/hero-mockup.webp',
    schema: [
      {
        '@type': 'WebSite',
        '@id': `${SITE.url}/#website`,
        url: `${SITE.url}/`,
        name: 'NDTify',
        inLanguage: 'en',
        publisher: { '@id': `${SITE.url}/#organization` },
      },
      faqSchema(),
    ],
    body: `
    <!-- ================= HERO ================= -->
    <section class="hero" id="top">
      <div class="hero-bg" aria-hidden="true"></div>
      <div class="container hero-inner">
        <div class="hero-content">
          <p class="eyebrow"><span class="dot"></span> Independent web &amp; app studio</p>
          <h1>Websites, apps &amp; plugins that <span class="grad-text">do real work</span></h1>
          <p class="lead">
            We design and build custom websites, web apps, WordPress plugins and Shopify apps,
            then connect them to everything else you use. If it runs in a browser or talks to an API, we can build it.
          </p>
          <div class="hero-cta">
            <a href="/contact/" class="btn btn-primary btn-lg">Start a project</a>
            <a href="/work/" class="btn btn-outline btn-lg">See our work</a>
          </div>
          <ul class="hero-trust" aria-label="Highlights">
            <li>✓ Building for the web since 2014</li>
            <li>✓ Our own app on the Shopify App Store</li>
            <li>✓ Vietnam · Singapore · Korea</li>
          </ul>
        </div>

        <figure class="hero-visual">
          <a href="/work/" aria-label="See our work">
            <img src="/images/hero-mockup.webp" width="1200" height="900" fetchpriority="high"
                 alt="Illustration of a custom website on a laptop and an online store on a phone">
          </a>
          <figcaption class="float-card float-1 float-card--app">
            <span class="score-ring" aria-hidden="true"><svg viewBox="0 0 36 36"><circle cx="18" cy="18" r="15.5"/><circle cx="18" cy="18" r="15.5" class="score-ring-val"/></svg><b>95+</b></span>
            <span class="float-card-text"><strong>Google PageSpeed 95–100</strong><span>Measured on lithaco.com &amp; keb.com.vn</span></span>
          </figcaption>
          <a href="/apps/hubstock/" class="float-card float-2 float-card--app">
            ${hubIcon(40)}
            <span class="float-card-text"><strong>${HUB.name}</strong><span>Live on the Shopify App Store</span></span>
          </a>
        </figure>
      </div>
    </section>

    <!-- ================= TECH BAR ================= -->
    <section class="tech-bar" aria-label="Technologies we work with">
      <div class="container">
        <p>What we build with</p>
        <ul>
          <li>WordPress</li><li>WooCommerce</li><li>Shopify</li><li>PHP</li><li>JavaScript</li><li>REST APIs</li>
        </ul>
      </div>
    </section>

    <!-- ================= SERVICES ================= -->
    <section class="section categories" id="services">
      <div class="container">
        <header class="section-head section-head--wide">
          <p class="kicker">Services</p>
          <h2>From a landing page to a Shopify&nbsp;app</h2>
          <p>Pick one, or let us handle the whole stack. Most projects end up mixing a site, a tool and an integration or two.</p>
        </header>

        <div class="grid grid-4">
          ${SERVICES.map(
            (s) => `<a href="/services/#${s.id}" class="cat-card reveal">
            <span class="cat-icon" aria-hidden="true"><svg viewBox="0 0 24 24">${s.icon}</svg></span>
            <h3>${esc(s.title)}</h3>
            <p>${esc(s.text)}</p>
            <span class="link-arrow">Learn more →</span>
          </a>`
          ).join('\n          ')}
        </div>
        <p class="section-foot">Need two systems to talk to each other? <a href="/services/#integrations">See integrations &amp; automation →</a></p>
      </div>
    </section>

    <!-- ================= WORK ================= -->
    <section class="section products bg-soft" id="work">
      <div class="container">
        <header class="section-head section-head--row">
          <div>
            <p class="kicker">Selected work</p>
            <h2>Live projects, real businesses</h2>
          </div>
          <a href="/work/" class="btn btn-outline-dark">All case studies →</a>
        </header>

        <div class="grid grid-3">
          ${PROJECTS.slice(0, 5).map((p) => projectCard(p)).join('\n')}
          ${hubstockCard(HUBSTOCK)}
        </div>
      </div>
    </section>

    <!-- ================= FEATURES ================= -->
    <section class="section features" id="why">
      <div class="container">
        <header class="section-head">
          <p class="kicker">Why NDTify</p>
          <h2>Not just pretty. <span class="grad-text">Built to perform.</span></h2>
          <p>A good website earns its keep. It gets found, answers questions and turns visitors into customers.</p>
        </header>
        <div class="grid grid-3">
          ${FEATURES.map(
            ([i, t, d]) => `<div class="feature reveal">
            <span class="feature-icon" aria-hidden="true">${i}</span>
            <h3>${t}</h3>
            <p>${d}</p>
          </div>`
          ).join('\n          ')}
        </div>
      </div>
    </section>

    <!-- ================= ABOUT ================= -->
    <section class="section about bg-soft" id="about">
      <div class="container about-grid">
        <div>
          <p class="kicker">About NDTify</p>
          <h2>One developer, the whole stack</h2>
          <p class="about-lead">NDTify is the studio name of one independent developer who has been building for the web since 2014: WordPress themes and plugins, WooCommerce and Shopify stores, custom web tools and, most recently, Shopify apps.</p>
          <p>There are no account managers and no hand-offs. The person you brief is the person who designs, codes, launches and supports your project, which is why clients in Vietnam, Singapore and South Korea keep coming back with the next one.</p>
          <div class="hero-cta">
            <a href="/contact/" class="btn btn-primary">Start a project</a>
            <a href="/work/" class="btn btn-outline-dark">See the work</a>
          </div>
        </div>
        <ul class="about-stats" aria-label="NDTify at a glance">
          <li><strong>2014</strong><span>Building for the web since</span></li>
          <li><strong>${PROJECTS.length}</strong><span>Live client projects in 3 countries</span></li>
          <li><strong>1</strong><span>Shopify app on the App Store</span></li>
          <li><strong>95–100</strong><span>Google PageSpeed on lithaco.com &amp; keb.com.vn</span></li>
        </ul>
      </div>
    </section>

    <!-- ================= PROCESS ================= -->
    <section class="section steps bg-dark" id="process">
      <div class="container">
        <header class="section-head section-head--light">
          <p class="kicker">How we work</p>
          <h2>Four steps from idea to launch</h2>
        </header>
        <ol class="steps-list steps-list--4">
          ${STEPS.map(
            ([n, t, d]) => `<li class="step reveal">
            <span class="step-num">${n}</span>
            <h3>${t}</h3>
            <p>${d}</p>
          </li>`
          ).join('\n          ')}
        </ol>
      </div>
    </section>

    <!-- ================= FAQ ================= -->
    <section class="section faq" id="faq">
      <div class="container container--narrow">
        <header class="section-head">
          <p class="kicker">FAQ</p>
          <h2>Frequently asked questions</h2>
        </header>
        <div class="faq-list">
          ${FAQ.map(
            ([q, a], i) => `<details class="faq-item"${i === 0 ? ' open' : ''}>
            <summary>${esc(q)}</summary>
            <p>${esc(a)}</p>
          </details>`
          ).join('\n          ')}
        </div>
        <p class="faq-more">Still have questions? <a href="#" data-chat-open>Chat with us</a>. A developer will reply.</p>
      </div>
    </section>

    ${ctaBlock()}`,
  };
}
