import { SITE, esc, abs, breadcrumb, crumbs } from '../site.mjs';

// Keep these keys in sync with LEAD_TYPES / LEAD_BUDGETS / LEAD_TIMELINES in public/chat/contact.php
export const TYPES = [
  ['website', 'Website'],
  ['store', 'Online store'],
  ['web-app', 'Web app / tool'],
  ['wp-plugin', 'WordPress plugin'],
  ['shopify-app', 'Shopify app'],
  ['integration', 'Integration / automation'],
  ['fix', 'Fix or improve an existing site'],
];
const BUDGETS = [
  ['lt1k', 'Under $1,000'],
  ['1-3k', '$1,000 – $3,000'],
  ['3-10k', '$3,000 – $10,000'],
  ['gt10k', '$10,000+'],
  ['unsure', 'Not sure yet'],
];
const TIMELINES = [
  ['asap', 'As soon as possible'],
  ['1m', 'Within a month'],
  ['1-3m', '1 – 3 months'],
  ['flexible', 'Flexible'],
];

const chip = (type, name, [value, label], required = false) =>
  `<label class="chip"><input type="${type}" name="${name}" value="${value}"${required ? ' required' : ''}><span>${esc(label)}</span></label>`;

export function contact() {
  const trail = [
    { name: 'Home', path: '/' },
    { name: 'Start a project', path: '/contact/' },
  ];
  return {
    path: '/contact/',
    title: 'Start a Project: Get a Quote | NDTify',
    description:
      'Tell NDTify about your website, web app, WordPress plugin, Shopify app or integration. Send a short brief and get a reply from the developer who will build it.',
    schema: [
      breadcrumb(trail),
      {
        '@type': 'ContactPage',
        '@id': abs('/contact/'),
        url: abs('/contact/'),
        name: 'Start a project with NDTify',
        about: { '@id': `${SITE.url}/#organization` },
      },
    ],
    body: `
    <section class="page-hero">
      <div class="hero-bg" aria-hidden="true"></div>
      <div class="container">
        ${crumbs(trail)}
        <h1>Start a project</h1>
        <p class="lead">Tell us what you want to build. A rough idea is enough: we will reply with questions, then a written quote and timeline before any work starts.</p>
      </div>
    </section>

    <section class="section contact-section" id="form">
      <div class="container contact-grid">
        <div class="contact-card">
          <div class="form-status form-status--ok" id="formSuccess" hidden tabindex="-1">
            <span class="form-status-icon" aria-hidden="true">✓</span>
            <h2>Thanks, your request is in!</h2>
            <p>We have received your project details and will reply to the email you gave us. Want to add something? <a href="#" data-chat-open>Chat with us</a>.</p>
          </div>

          <form class="contact-form" id="contactForm" action="/chat/contact.php" method="post" novalidate>
            <p class="form-status form-status--error" id="formError" role="alert" hidden></p>

            <div class="field-row">
              <div class="field">
                <label for="cf-name">Your name <abbr title="required">*</abbr></label>
                <input id="cf-name" name="name" type="text" autocomplete="name" required maxlength="120">
                <p class="field-error" data-for="name"></p>
              </div>
              <div class="field">
                <label for="cf-email">Email <abbr title="required">*</abbr></label>
                <input id="cf-email" name="email" type="email" autocomplete="email" required maxlength="160">
                <p class="field-error" data-for="email"></p>
              </div>
            </div>

            <div class="field">
              <label for="cf-company">Company or current website <span class="optional">optional</span></label>
              <input id="cf-company" name="company" type="text" autocomplete="organization" maxlength="200" placeholder="e.g. Acme Ltd or acme.com">
            </div>

            <fieldset class="field">
              <legend>What do you need? <span class="optional">pick any</span></legend>
              <div class="chips">
                ${TYPES.map((t) => chip('checkbox', 'types[]', t)).join('\n                ')}
              </div>
            </fieldset>

            <div class="field-row">
              <fieldset class="field">
                <legend>Budget <span class="optional">USD, rough is fine</span></legend>
                <div class="chips">
                  ${BUDGETS.map((b) => chip('radio', 'budget', b)).join('\n                  ')}
                </div>
              </fieldset>
              <div class="field">
                <label for="cf-timeline">Timeline</label>
                <select id="cf-timeline" name="timeline">
                  <option value="">Choose…</option>
                  ${TIMELINES.map(([v, l]) => `<option value="${v}">${esc(l)}</option>`).join('\n                  ')}
                </select>
              </div>
            </div>

            <div class="field">
              <label for="cf-message">Tell us about the project <abbr title="required">*</abbr></label>
              <textarea id="cf-message" name="message" rows="6" required minlength="20" maxlength="5000"
                placeholder="What should it do, who is it for, any sites you like, systems it must connect to…"></textarea>
              <p class="field-error" data-for="message"></p>
            </div>

            <!-- Spam trap: humans never see or fill this -->
            <div class="hp" aria-hidden="true">
              <label for="cf-website-url">Leave this empty</label>
              <input id="cf-website-url" name="website_url" type="text" tabindex="-1" autocomplete="off">
            </div>
            <input type="hidden" name="t" value="">

            <div class="form-foot">
              <button type="submit" class="btn btn-primary btn-lg" id="cfSubmit">Send request</button>
              <p class="form-note">We only use your details to reply to this request. <a href="/privacy/">Privacy policy</a></p>
            </div>
          </form>
        </div>

        <aside class="contact-aside">
          <h2>After you hit send</h2>
          <ol class="next-steps">
            <li><strong>We read your brief</strong><span>A developer, not a salesperson, reads every request.</span></li>
            <li><strong>We reply with questions</strong><span>Usually a few short ones, by email or a quick call.</span></li>
            <li><strong>You get a written quote</strong><span>Scope, price and timeline, agreed before any work starts.</span></li>
          </ol>

          <div class="contact-alt">
            <h3>Prefer to talk first?</h3>
            <a href="#" class="btn btn-outline-dark btn-block" data-chat-open>Chat with us now</a>
            <a href="mailto:${SITE.email}" class="contact-mail">${SITE.email}</a>
          </div>
        </aside>
      </div>
    </section>`,
    scripts: ['/js/contact-form.js'],
  };
}
