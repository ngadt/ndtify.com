import { esc } from '../site.mjs';

export function projectCard(p, { headingLevel = 3 } = {}) {
  const h = `h${headingLevel}`;
  return `          <article class="product work-card reveal">
            <a href="/work/${p.slug}/" class="product-media" tabindex="-1" aria-hidden="true">
              <img src="${p.image.sm}" width="720" height="450" loading="lazy" alt="">
              <span class="badge">${esc(p.category)}</span>
            </a>
            <div class="product-body">
              <p class="work-meta">${esc(p.industry)} · ${esc(p.location)}</p>
              <${h}><a href="/work/${p.slug}/">${esc(p.name)}</a></${h}>
              <p>${esc(p.summary)}</p>
              <div class="product-foot">
                <span class="work-domain">${esc(p.domain)}</span>
                <a href="/work/${p.slug}/" class="link-arrow" aria-label="Read the ${esc(p.name)} case study">Case study →</a>
              </div>
            </div>
          </article>`;
}

export function hubstockCard(h, { headingLevel = 3 } = {}) {
  const tag = `h${headingLevel}`;
  return `          <article class="product work-card work-card--app reveal">
            <a href="/apps/hubstock/" class="product-media" tabindex="-1" aria-hidden="true">
              <img src="${h.image.sm}" width="720" height="405" loading="lazy" alt="">
              <span class="badge">Shopify app</span>
            </a>
            <div class="product-body">
              <p class="work-meta">Our product · Shopify App Store</p>
              <${tag}><a href="/apps/hubstock/">${esc(h.name)}</a></${tag}>
              <p>${esc(h.summary)}</p>
              <div class="product-foot">
                <span class="work-domain">From $24/mo · 15-day trial</span>
                <a href="/apps/hubstock/" class="link-arrow">View app →</a>
              </div>
            </div>
          </article>`;
}
