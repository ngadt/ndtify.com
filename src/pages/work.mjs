import { SITE, esc, abs, breadcrumb, crumbs, ctaBlock } from '../site.mjs';
import { PROJECTS, HUBSTOCK } from '../projects.mjs';
import { projectCard, hubstockCard } from './cards.mjs';

export function workIndex() {
  const trail = [
    { name: 'Home', path: '/' },
    { name: 'Work', path: '/work/' },
  ];
  return {
    path: '/work/',
    title: 'Our Work: Website, Shopify & Web App Case Studies | NDTify',
    description:
      'Case studies from NDTify: custom WordPress and WooCommerce sites, multi-market Shopify stores, interactive web tools and our own Shopify app, built for businesses in Vietnam, Singapore and South Korea.',
    schema: [
      breadcrumb(trail),
      {
        '@type': 'CollectionPage',
        '@id': abs('/work/'),
        name: 'NDTify case studies',
        url: abs('/work/'),
        hasPart: PROJECTS.map((p) => ({ '@type': 'CreativeWork', name: p.name, url: abs(`/work/${p.slug}/`) })),
      },
    ],
    body: `
    <section class="page-hero">
      <div class="hero-bg" aria-hidden="true"></div>
      <div class="container">
        ${crumbs(trail)}
        <h1>Our work</h1>
        <p class="lead">Live projects for real businesses: solar installers, industrial repair workshops, a fashion brand in two countries, an organic farm and a 50-year-old tyre shop. Each one is built around what its customers need to do.</p>
      </div>
    </section>

    <section class="section products bg-soft">
      <div class="container">
        <h2 class="visually-hidden">Client projects</h2>
        <div class="grid grid-3">
${PROJECTS.map((p) => projectCard(p, { headingLevel: 3 })).join('\n')}
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <header class="section-head">
          <p class="kicker">Our own product</p>
          <h2>We build Shopify apps for ourselves too</h2>
          <p>HubStock keeps inventory, products and orders in sync across multiple Shopify stores. It is designed, built and supported by NDTify.</p>
        </header>
        <div class="grid grid-3 grid-center">
${hubstockCard(HUBSTOCK)}
        </div>
      </div>
    </section>

    ${ctaBlock('Want something like this?')}`,
  };
}

export function caseStudy(p) {
  const i = PROJECTS.indexOf(p);
  const next = PROJECTS[(i + 1) % PROJECTS.length];
  const trail = [
    { name: 'Home', path: '/' },
    { name: 'Work', path: '/work/' },
    { name: p.name, path: `/work/${p.slug}/` },
  ];
  const links = p.links || [{ label: p.domain, url: p.url }];

  return {
    path: `/work/${p.slug}/`,
    title: `${p.seoTitle} | NDTify`,
    description: p.metaDescription,
    ogType: 'article',
    ogImage: p.image.src,
    preload: p.image.src,
    schema: [
      breadcrumb(trail),
      {
        '@type': 'CreativeWork',
        '@id': abs(`/work/${p.slug}/`),
        name: p.seoTitle,
        headline: p.seoTitle,
        description: p.metaDescription,
        url: abs(`/work/${p.slug}/`),
        image: abs(p.image.src),
        inLanguage: 'en',
        creator: { '@id': `${SITE.url}/#organization` },
        about: { '@type': 'Organization', name: p.name, url: p.url },
        keywords: [...p.services, p.industry].join(', '),
      },
    ],
    body: `
    <article>
      <section class="page-hero">
        <div class="hero-bg" aria-hidden="true"></div>
        <div class="container">
          ${crumbs(trail)}
          <p class="kicker kicker--light">Case study · ${esc(p.category)}</p>
          <h1>${esc(p.name)}</h1>
          <p class="lead">${esc(p.summary)}</p>
          <div class="hero-cta">
            ${links
              .map(
                (l, k) =>
                  `<a href="${l.url}" class="btn ${k === 0 ? 'btn-primary' : 'btn-outline'}" target="_blank" rel="noopener">Visit ${esc(l.label)} ↗</a>`
              )
              .join('\n            ')}
          </div>
        </div>
      </section>

      <div class="container cs-shot-wrap">
        <figure class="cs-shot">
          <div class="browser-bar" aria-hidden="true"><span></span><span></span><span></span><em>${esc(p.image.domain || links[0].url.replace(/^https?:\/\//, '').replace(/\/$/, ''))}</em></div>
          <img src="${p.image.src}" width="${p.image.w || 1440}" height="${p.image.h || 900}" alt="${esc(p.image.alt)}" fetchpriority="high">
        </figure>
      </div>

      <section class="section cs-body">
        <div class="container cs-grid">
          <aside class="cs-facts" aria-label="Project facts">
            <dl>
              <dt>Client</dt><dd>${esc(p.name)}</dd>
              <dt>Industry</dt><dd>${esc(p.industry)}</dd>
              <dt>Location</dt><dd>${esc(p.location)}</dd>
              <dt>What we did</dt><dd><ul class="tag-list">${p.services.map((s) => `<li>${esc(s)}</li>`).join('')}</ul></dd>
              <dt>Stack</dt><dd><ul class="tag-list tag-list--muted">${p.stack.map((s) => `<li>${esc(s)}</li>`).join('')}</ul></dd>
              <dt>Live site</dt><dd>${links.map((l) => `<a href="${l.url}" target="_blank" rel="noopener">${esc(l.label)}</a>`).join('<br>')}</dd>
            </dl>
          </aside>

          <div class="prose">
            <h2>The client</h2>
            ${p.overview.map((t) => `<p>${t}</p>`).join('\n            ')}

            <h2>What we built</h2>
            <div class="cs-highlights">
              ${p.highlights
                .map(
                  (h, k) => `<section class="cs-highlight">
                <span class="cs-num" aria-hidden="true">${String(k + 1).padStart(2, '0')}</span>
                <div>
                  <h3>${esc(h.title)}</h3>
                  <p>${h.text}</p>
                </div>
              </section>`
                )
                .join('\n              ')}
            </div>
            ${
              p.gallery
                ? p.gallery
                    .map(
                      (g) => `<figure class="cs-shot cs-shot--inline">
              <img src="${g.src}" width="1440" height="900" loading="lazy" alt="${esc(g.alt)}">
              <figcaption>${esc(g.alt)}</figcaption>
            </figure>`
                    )
                    .join('\n')
                : ''
            }
          </div>
        </div>
      </section>

      <nav class="section bg-soft cs-next" aria-label="Next case study">
        <div class="container">
          <a href="/work/${next.slug}/" class="cs-next-link">
            <img src="${next.image.sm}" width="720" height="450" loading="lazy" alt="">
            <span>
              <small>Next case study</small>
              <strong>${esc(next.name)}</strong>
              <span>${esc(next.industry)} · ${esc(next.location)}</span>
            </span>
            <span class="link-arrow" aria-hidden="true">→</span>
          </a>
        </div>
      </nav>
    </article>

    ${ctaBlock('Want something like this?')}`,
  };
}
