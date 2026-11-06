import { SITE, esc, abs, breadcrumb, crumbs } from '../site.mjs';
import { HUBSTOCK as H } from '../projects.mjs';

const FEATURES = [
  ['Real-time inventory sync', 'Stock lives on one master store. Every connected store mirrors it automatically, so two storefronts never fight over the same number.'],
  ['Orders deduct master stock', 'An order on any connected store deducts stock on the master at the milestone you choose (paid or fulfilled). Cancellations restore it.'],
  ['Match by SKU, no duplicates', 'Already selling on the other store? HubStock matches products by SKU, handle or title and links them instead of creating copies. Uncertain matches wait for your review.'],
  ['Per-field product sync', 'Choose exactly what travels to each store: title, images, price, compare-at price, SKU, barcode, tags, vendor and more. Set global defaults, then override per store.'],
  ['Metafields & definitions', 'Product and category metafields sync along with their definitions, so structured data arrives intact.'],
  ['Location mapping', 'Map master locations to each destination store’s locations so stock lands in the right place.'],
  ['History, scan & repair', 'Every stock movement lands in a searchable History log, and Scan & Repair plus a Health view catch anything that has drifted.'],
  ['Low-stock alerts', 'Get notified when inventory drops below your own threshold.'],
];

const STEPS = [
  ['Import your catalog', 'Install HubStock on the store that owns your stock. It becomes the master.'],
  ['Connect a store', 'Install from the same browser and the stores link themselves, or hand a pairing code to whoever runs the other store. No API keys, no CSV files.'],
  ['Map & sync', 'Map locations, match existing products by SKU and pick which fields sync. From then on stock and orders flow automatically.'],
];

const FAQ = [
  ['Which store holds the stock?', 'The master store. Destination stores mirror its inventory and are locked to it, so stock is only ever edited in one place.'],
  ['Will HubStock duplicate products that already exist on my other store?', 'No. It matches products by SKU (then handle or title) and links them. Anything uncertain waits for your review, and you can link in bulk or one product at a time with variant control.'],
  ['What happens when an order is cancelled on a connected store?', 'The stock that was deducted from the master is restored automatically, and the movement is recorded in the History log.'],
  ['Do destination stores pay too?', 'No. Destination stores use the Free plan; they are covered by the master store’s plan.'],
  ['Is there a free trial?', 'Yes. Every paid plan includes a 15-day free trial.'],
];

export function hubstock() {
  const trail = [
    { name: 'Home', path: '/' },
    { name: 'HubStock', path: '/apps/hubstock/' },
  ];
  const paid = H.plans.filter((p) => p.price !== '0');
  return {
    path: '/apps/hubstock/',
    title: 'HubStock: Multi-Store Inventory & Order Sync for Shopify | NDTify',
    description:
      'HubStock syncs inventory, products and orders across multiple Shopify stores in real time from one master store. Match by SKU, per-field sync, location mapping and History log. 15-day free trial.',
    ogImage: H.image.src,
    preload: H.image.src,
    schema: [
      breadcrumb(trail),
      {
        '@type': 'SoftwareApplication',
        '@id': abs('/apps/hubstock/#app'),
        name: 'HubStock ‑ Multi‑Store Sync',
        applicationCategory: 'BusinessApplication',
        applicationSubCategory: 'Shopify app: inventory sync',
        operatingSystem: 'Shopify',
        url: abs('/apps/hubstock/'),
        installUrl: H.appStoreUrl,
        image: abs(H.image.src),
        screenshot: [1, 2, 3].map((n) => abs(`/images/hubstock/shot-${n}.webp`)),
        description: H.summary,
        featureList: FEATURES.map(([t]) => t),
        publisher: { '@id': `${SITE.url}/#organization` },
        offers: {
          '@type': 'AggregateOffer',
          priceCurrency: 'USD',
          lowPrice: '0',
          highPrice: paid[paid.length - 1].price,
          offerCount: H.plans.length,
        },
      },
      {
        '@type': 'FAQPage',
        mainEntity: FAQ.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
      },
    ],
    body: `
    <section class="hero hero--app">
      <div class="hero-bg" aria-hidden="true"></div>
      <div class="container">
        ${crumbs(trail)}
      </div>
      <div class="container hero-inner">
        <div class="hero-content">
          <p class="eyebrow"><img src="/images/hubstock/icon.webp" width="24" height="24" alt="" class="eyebrow-icon"> Shopify app by NDTify</p>
          <h1>One master store.<br><span class="grad-text">Every store in&nbsp;sync.</span></h1>
          <p class="lead">HubStock keeps inventory, products and orders in sync across all your Shopify stores in real time. Stock lives on the master only, so two storefronts never fight over the same number.</p>
          <div class="hero-cta">
            <a href="${H.appStoreUrl}" class="btn btn-primary btn-lg" target="_blank" rel="noopener">Install on Shopify ↗</a>
            <a href="#pricing" class="btn btn-outline btn-lg">See pricing</a>
          </div>
          <ul class="hero-trust">
            <li>✓ Free plan for destination stores</li>
            <li>✓ 15-day free trial</li>
            <li>✓ Email &amp; live chat support</li>
          </ul>
        </div>
        <figure class="hero-visual">
          <img src="${H.image.src}" width="1600" height="900" alt="${esc(H.image.alt)}" fetchpriority="high">
        </figure>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <header class="section-head">
          <p class="kicker">How it works</p>
          <h2>Add a second store in about a minute</h2>
        </header>
        <ol class="steps-list steps-list--light">
          ${STEPS.map(
            ([t, d], i) => `<li class="step reveal">
            <span class="step-num">0${i + 1}</span>
            <h3>${esc(t)}</h3>
            <p>${esc(d)}</p>
          </li>`
          ).join('\n          ')}
        </ol>
      </div>
    </section>

    <section class="section bg-soft">
      <div class="container">
        <header class="section-head">
          <p class="kicker">Features</p>
          <h2>Everything multi-store sellers need to stop overselling</h2>
        </header>
        <div class="grid grid-4">
          ${FEATURES.map(
            ([t, d]) => `<div class="feature feature--card reveal">
            <h3>${esc(t)}</h3>
            <p>${esc(d)}</p>
          </div>`
          ).join('\n          ')}
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <header class="section-head">
          <p class="kicker">Screenshots</p>
          <h2>See it in action</h2>
        </header>
        <div class="app-shots">
          <figure><img src="/images/hubstock/shot-1.webp" width="1600" height="900" loading="lazy" alt="HubStock review matches screen linking existing products by SKU instead of duplicating them"><figcaption>Link what the other store already has, with no duplicates</figcaption></figure>
          <figure><img src="/images/hubstock/shot-2.webp" width="1600" height="900" loading="lazy" alt="HubStock settings for per-field product sync, order sync and low-stock alerts"><figcaption>Decide exactly what syncs to each store</figcaption></figure>
          <figure><img src="/images/hubstock/shot-3.webp" width="1600" height="900" loading="lazy" alt="HubStock store pairing setup with a pairing code and connected stores list"><figcaption>Pair a new store with a one-time code</figcaption></figure>
        </div>
      </div>
    </section>

    <section class="section pricing bg-soft" id="pricing">
      <div class="container">
        <header class="section-head">
          <p class="kicker">Pricing</p>
          <h2>Pay on the master store only</h2>
          <p>Destination stores are free. All paid plans include real-time inventory &amp; order sync, SKU matching, metafield sync and email &amp; live chat support.</p>
        </header>
        <div class="grid grid-4 pricing-grid">
          ${H.plans
            .map(
              (p) => `<div class="plan${p.featured ? ' plan--featured' : ''} reveal">
            ${p.featured ? '<span class="plan-tag">Most popular</span>' : ''}
            <h3>${esc(p.name)}</h3>
            <p class="plan-price">$${p.price} <small>/ month</small></p>
            <p class="plan-desc">${p.note ? esc(p.note) : '15-day free trial'}</p>
            <ul class="plan-features">
              ${p.features.map((f) => `<li>${esc(f)}</li>`).join('\n              ')}
            </ul>
            <a href="${H.appStoreUrl}" class="btn ${p.featured ? 'btn-primary' : 'btn-outline-dark'} btn-block" target="_blank" rel="noopener">Install</a>
          </div>`
            )
            .join('\n          ')}
        </div>
        <p class="pricing-note">Prices in USD, billed by Shopify every 30 days. Need more than 25 stores? <a href="#" data-chat-open>Contact us</a>.</p>
      </div>
    </section>

    <section class="section faq">
      <div class="container container--narrow">
        <header class="section-head">
          <p class="kicker">FAQ</p>
          <h2>HubStock questions</h2>
        </header>
        <div class="faq-list">
          ${FAQ.map(
            ([q, a], i) => `<details class="faq-item"${i === 0 ? ' open' : ''}>
            <summary>${esc(q)}</summary>
            <p>${esc(a)}</p>
          </details>`
          ).join('\n          ')}
        </div>
      </div>
    </section>

    <section class="section cta" id="contact">
      <div class="container">
        <div class="cta-box reveal">
          <div>
            <h2>Ready to sync your stores?</h2>
            <p>Install HubStock from the Shopify App Store and start your 15-day free trial. Questions first? Chat with the developers who built it.</p>
          </div>
          <div class="cta-actions">
            <a href="${H.appStoreUrl}" class="btn btn-light btn-lg" target="_blank" rel="noopener">Install on Shopify ↗</a>
            <a href="#" class="btn btn-outline btn-lg" data-chat-open>Ask a question</a>
          </div>
        </div>
      </div>
    </section>`,
  };
}
