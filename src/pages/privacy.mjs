import { SITE, esc, abs, breadcrumb, crumbs } from '../site.mjs';

const UPDATED = 'November 6, 2026';
const HUBSTOCK_PRIVACY = 'https://hubstock-multi-store-sync.gadget.app/privacy';

export function privacy() {
  const trail = [
    { name: 'Home', path: '/' },
    { name: 'Privacy policy', path: '/privacy/' },
  ];
  return {
    path: '/privacy/',
    title: 'Privacy Policy | NDTify',
    description: 'How ndtify.com handles the details you send through the contact form and live chat, what is stored, for how long, and how to ask for deletion.',
    schema: [breadcrumb(trail), { '@type': 'WebPage', '@id': abs('/privacy/'), url: abs('/privacy/'), name: 'NDTify privacy policy', dateModified: '2026-11-06' }],
    body: `
    <section class="page-hero">
      <div class="hero-bg" aria-hidden="true"></div>
      <div class="container">
        ${crumbs(trail)}
        <h1>Privacy policy</h1>
        <p class="lead">What ndtify.com collects, why, and how to ask for it to be deleted. Last updated ${UPDATED}.</p>
      </div>
    </section>

    <section class="section">
      <div class="container container--narrow prose legal">
        <p>NDTify (“we”, “us”) is an independent web development studio. This policy covers the website <strong>ndtify.com</strong>. It is written to be read, not skimmed: we collect very little, we never sell or share it for marketing, and you can ask us to delete it at any time.</p>

        <h2>What we collect</h2>
        <ul>
          <li><strong>Contact form.</strong> When you send a project request we receive the details you type: your name, email address, company or website (optional), the project type, budget and timeline you choose, and your message. We also record the page you sent it from, the time, and your IP address and browser type, which we use to block spam.</li>
          <li><strong>Live chat.</strong> Messages you send through the chat bubble, any name or email you choose to give, the page you are on and your browser type. The chat stores a random conversation token in your browser so the conversation can continue if you reload the page. It identifies the conversation, not you.</li>
          <li><strong>Email.</strong> If you email ${esc(SITE.email)}, we keep that correspondence like any other email.</li>
          <li><strong>Server logs.</strong> Our web host keeps standard access logs (IP address, requested page, time, browser type) for security and troubleshooting.</li>
        </ul>
        <p>We do not run advertising, tracking pixels or third-party analytics on this site. If that changes we will update this page first.</p>

        <h2>How we use it</h2>
        <p>Only to reply to you, to scope and deliver the project you asked about, and to keep the site secure. Nothing is used for profiling or marketing, and nothing is sold or rented to anyone.</p>

        <h2>Where it goes</h2>
        <ul>
          <li>Contact-form requests and chat messages are delivered to our team through <strong>Telegram</strong> and by <strong>email</strong>, and a copy is kept in a database on our web host so a request is never lost.</li>
          <li>Email is handled by our email provider.</li>
          <li>We do not share your details with anyone else unless the law requires it.</li>
        </ul>

        <h2>How long we keep it</h2>
        <p>Project requests and chat conversations are kept while we are talking to you and for as long as needed to deliver and support the work. If nothing comes of a request, we delete it within 12 months. Server logs are rotated by our host on a short cycle.</p>

        <h2>Your choices</h2>
        <p>Email ${esc(SITE.email)} to see what we hold about you, to correct it, or to have it deleted. We will confirm when it is done.</p>

        <h2>HubStock (our Shopify app)</h2>
        <p>Merchants who install <a href="/apps/hubstock/">HubStock ‑ Multi‑Store Sync</a> are covered by the app’s own policy, which describes exactly what store, catalog and order data the app processes, how Shopify privacy webhooks are handled and how data is deleted on uninstall: <a href="${HUBSTOCK_PRIVACY}" target="_blank" rel="noopener">HubStock privacy policy</a>.</p>

        <h2>Changes</h2>
        <p>If we change what this site collects, we will update this page and the date at the top before the change takes effect.</p>

        <h2>Contact</h2>
        <p>Questions about this policy or your data: <a href="mailto:${SITE.email}">${SITE.email}</a>.</p>
      </div>
    </section>`,
  };
}
