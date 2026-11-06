import { SITE, esc, abs, breadcrumb, crumbs, ctaBlock } from '../site.mjs';
import { PROJECTS } from '../projects.mjs';

const bySlug = Object.fromEntries(PROJECTS.map((p) => [p.slug, p]));

const SERVICES = [
  {
    id: 'websites',
    contactType: 'website',
    title: 'Websites & online stores',
    intro:
      'Custom WordPress themes and WooCommerce or Shopify stores designed around how your customers buy, not around a template’s demo content.',
    points: [
      'Hand-coded WordPress themes: fast, secure and easy for your team to edit',
      'WooCommerce stores with filters, payments, shipping rules and email marketing',
      'Shopify themes and multi-market stores with per-country language and shipping',
      'SEO built in: clean markup, schema, sitemaps and pages planned around search demand',
      'Migrations and rebuilds of existing sites without losing rankings',
    ],
    work: ['lithaco', 'ariseo', 'vuon-dau-tam-ba-phong', 'kim-hoe-tyres'],
  },
  {
    id: 'web-apps',
    contactType: 'web-app',
    title: 'Web apps & interactive tools',
    intro:
      'The interactive part of a site is often what wins the customer: a calculator that answers “how much?”, a lookup that finds the exact part, a booking flow that just works.',
    points: [
      'Calculators and quote estimators',
      'Product, part and error-code lookups over large catalogues',
      'Booking, order and request flows',
      'Internal dashboards and admin tools',
      'Fast, framework-free front ends that stay quick on mobile',
    ],
    work: ['lithaco', 'keb-vietnam', 'hitech-vina-drive-repair'],
  },
  {
    id: 'wordpress-plugins',
    contactType: 'wp-plugin',
    title: 'WordPress plugins & WooCommerce\u00a0extensions',
    intro:
      'When a theme or an off-the-shelf plugin can’t do what you need, we write a plugin that does exactly that and nothing more.',
    points: [
      'Custom post types, fields and admin screens for your data',
      'WooCommerce extensions: product filters, pricing rules, checkout tweaks',
      'Integrations with payment, shipping, CRM and marketing services',
      'Performance and security fixes for existing plugins',
      'Clean, documented code that you own',
    ],
    work: ['kim-hoe-tyres', 'keb-vietnam'],
  },
  {
    id: 'shopify-apps',
    contactType: 'shopify-app',
    title: 'Shopify apps',
    intro:
      'Public App Store apps and private custom apps on the Shopify Admin API, webhooks and app extensions. We build and run our own app, HubStock, so we know the whole path from first commit to App Store review.',
    points: [
      'Custom apps for a single store or a group of stores',
      'Public apps ready for Shopify App Store review, including billing',
      'Inventory, product and order sync between stores and external systems',
      'Theme app extensions and admin UI',
      'Support and updates after launch',
    ],
    work: ['ariseo'],
    extra: `<p class="svc-extra"><a href="/apps/hubstock/" class="link-arrow">See HubStock, our multi-store sync app →</a></p>`,
  },
  {
    id: 'integrations',
    contactType: 'integration',
    title: 'Integrations & automation',
    intro:
      'Most businesses already use a handful of tools that don’t talk to each other. We connect them so data moves on its own and people stop copying and pasting.',
    points: [
      'Chat: Zalo, WhatsApp, Telegram and live-chat widgets (this site’s chat replies come straight from Telegram)',
      'Payments: PayPal, Stripe and local gateways',
      'Marketing: Klaviyo, email platforms, Google Sheets, analytics',
      'Shopify and WooCommerce sync with other stores, ERPs and spreadsheets',
      'Any REST or webhook API: if it has an API, we can wire it up',
    ],
    work: ['kim-hoe-tyres', 'keb-vietnam'],
  },
];

export function services() {
  const trail = [
    { name: 'Home', path: '/' },
    { name: 'Services', path: '/services/' },
  ];
  return {
    path: '/services/',
    title: 'Web Development Services: WordPress, Shopify Apps, Web Apps & Integrations | NDTify',
    description:
      'Custom websites, WooCommerce and Shopify stores, web apps and calculators, WordPress plugins, Shopify apps and API integrations, built by NDTify for businesses in Vietnam, Singapore, Korea and beyond.',
    schema: [
      breadcrumb(trail),
      {
        '@type': 'ItemList',
        name: 'NDTify services',
        itemListElement: SERVICES.map((s, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          item: {
            '@type': 'Service',
            name: s.title,
            description: s.intro,
            url: abs(`/services/#${s.id}`),
            provider: { '@id': `${SITE.url}/#organization` },
          },
        })),
      },
    ],
    body: `
    <section class="page-hero">
      <div class="hero-bg" aria-hidden="true"></div>
      <div class="container">
        ${crumbs(trail)}
        <h1>Services</h1>
        <p class="lead">Websites, web apps, WordPress plugins, Shopify apps and the integrations in between. One small team, the whole stack.</p>
        <ul class="jump-links">
          ${SERVICES.map((s) => `<li><a href="#${s.id}">${esc(s.title)}</a></li>`).join('\n          ')}
        </ul>
      </div>
    </section>

    ${SERVICES.map(
      (s, i) => `<section class="section svc${i % 2 ? ' bg-soft' : ''}" id="${s.id}">
      <div class="container svc-grid">
        <div>
          <p class="kicker">0${i + 1}</p>
          <h2>${esc(s.title)}</h2>
          <p class="svc-intro">${esc(s.intro)}</p>
          <ul class="check-list">
            ${s.points.map((pt) => `<li>${esc(pt)}</li>`).join('\n            ')}
          </ul>
          ${s.extra || ''}
          <p class="svc-start"><a href="/contact/?type=${s.contactType}" class="btn btn-primary">Start a project like this</a></p>
        </div>
        <div class="svc-work">
          <h3>Related work</h3>
          <ul>
            ${s.work
              .map((slug) => bySlug[slug])
              .filter(Boolean)
              .map(
                (p) => `<li><a href="/work/${p.slug}/" class="svc-work-item">
              <img src="${p.image.sm}" width="720" height="450" loading="lazy" alt="">
              <span><strong>${esc(p.name)}</strong><small>${esc(p.industry)}</small></span>
            </a></li>`
              )
              .join('\n            ')}
          </ul>
        </div>
      </div>
    </section>`
    ).join('\n\n    ')}

    ${ctaBlock('Not sure which one you need?')}`,
  };
}
