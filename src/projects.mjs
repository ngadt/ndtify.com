// Portfolio data. Each project becomes /work/<slug>/ and a card on the home and /work/ pages.
// Everything here describes features that are live on the client's site. Keep it that way:
// no invented numbers or quotes.

export const PROJECTS = [
  {
    slug: 'lithaco',
    name: 'LITHACO',
    domain: 'lithaco.com',
    url: 'https://lithaco.com/',
    seoTitle: 'LITHACO: Solar Website with Savings Calculator',
    metaDescription: 'Custom WordPress site for LITHACO, a Vietnamese solar and storage installer, with a bill calculator that shows system size, savings and payback instantly.',
    industry: 'Solar, battery storage & EV charging',
    location: 'Vietnam (nationwide)',
    category: 'Website + web tool',
    services: ['Custom WordPress theme', 'Interactive savings calculator', 'Lead generation', 'Blog & content structure'],
    stack: ['WordPress', 'Custom theme', 'PHP', 'Vanilla JavaScript'],
    summary:
      'Solar and storage installer with 18 years and 5,000+ systems behind it. Visitors type their monthly power bill and instantly see a recommended system size, monthly savings and payback period.',
    overview: [
      'LITHACO designs, installs and maintains solar power, battery storage and EV charging systems across Vietnam, from family rooftops to 5 MWp factory roofs. Their buyers range from homeowners to factory managers and public institutions, and each of them asks a different first question.',
      'The site needed to answer the most important one straight away, <em>“how much will I save?”</em>, then route each type of buyer to the right solution and turn that interest into a site-survey request.',
    ],
    highlights: [
      {
        title: 'Electricity-bill calculator in the hero',
        text: 'Visitors enter their average monthly bill (or tap a preset of 2, 4, 8 or 20 million VND) and the calculator returns the recommended kWp, estimated savings per year and years to payback, using the engineering team’s own formula. No phone number is required to see the estimate, which removes the biggest point of friction before a lead is ready.',
      },
      {
        title: 'Solutions by buyer type',
        text: 'Separate paths for households, commercial buildings, factories, schools and hospitals, and government agencies, each with the arguments and system sizes that matter to that audience.',
      },
      {
        title: 'Cost & ROI estimator with ready-made packages',
        text: 'A detailed estimate page maps the bill to a prebuilt package and says so honestly when no package fits, pushing those visitors to a custom quote instead of a dead end.',
      },
      {
        title: 'Proof, front and centre',
        text: 'Seven manufacturers that authorise LITHACO as a distributor, a nationwide map of operating systems, 2025 awards, ISO certifications and TV/press coverage, all placed where a cautious B2B buyer looks for reassurance.',
      },
      {
        title: 'Content that answers real buyer questions',
        text: 'A five-step process from phone consultation to maintenance, plus articles such as whether old metal roofs can take solar panels, LFP vs NMC batteries, and which system suits a 5-million-VND bill.',
      },
    ],
    image: { w: 1440, h: 682, src: '/images/work/lithaco.webp', sm: '/images/work/lithaco-sm.webp', alt: 'LITHACO homepage with a solar rooftop photo and the electricity-bill savings calculator' },
  },
  {
    slug: 'ariseo',
    name: 'ARISEO',
    domain: 'ariseo.com · ariseo.co.kr',
    url: 'https://ariseo.com/',
    links: [
      { label: 'ariseo.com (Singapore)', url: 'https://ariseo.com/' },
      { label: 'ariseo.co.kr (Korea)', url: 'https://ariseo.co.kr/' },
    ],
    seoTitle: 'ARISEO: Shopify Stores for Singapore & Korea',
    metaDescription: 'Two Shopify stores for ARISEO, a curated fashion brand in Singapore and Seoul: custom Dawn-based themes, English and Korean storefronts, per-country shipping.',
    industry: 'Fashion retail',
    location: 'Singapore & Seoul, South Korea',
    category: 'Shopify',
    services: ['Two Shopify stores', 'Custom Dawn-based themes', 'English & Korean storefronts', 'Multi-country shipping setup'],
    stack: ['Shopify', 'Liquid', 'Dawn 15 (customised)', 'Git-managed themes', 'JavaScript'],
    summary:
      'A curated multi-label fashion brand with shops in Singapore and Seoul, running two Shopify stores: English for Singapore, Korean for Korea, each with its own editorial look.',
    overview: [
      'ARISEO is a “hybrid curated multi-label fashion space” with physical stores at NorthStar, Ang Mo Kio in Singapore and on Itaewon-ro in Seoul. It stocks its own collections alongside labels such as BunnyHill Concept and DirtyCoins.',
      'Each market needs its own storefront: a different language, currency, free-delivery threshold, legal footer and campaign imagery. We built and maintain two Shopify stores, <strong>ariseo.com</strong> for Singapore and <strong>ariseo.co.kr</strong> for Korea, from one shared theme codebase so the brand stays consistent while each store can run its own campaigns.',
    ],
    highlights: [
      {
        title: 'Two stores, one theme codebase',
        text: 'Both storefronts run a custom theme built on Shopify’s Dawn 15, managed in Git with a branch per store. Shared fixes ship to both, while each store keeps its own settings, campaigns and content.',
      },
      {
        title: 'Editorial, image-first design',
        text: 'Full-screen campaign slides (such as “ARISE : HELIX” and “AWAKEN”), a minimal serif wordmark and lots of white space let the photography sell the clothes.',
      },
      {
        title: 'Ship-to country and language switching',
        text: 'Shoppers choose where they are shipping to (Singapore, South Korea, Japan, China or the rest of the world) and can switch language, so prices, delivery and content match their market.',
      },
      {
        title: 'Built for Korean e-commerce\u00a0rules',
        text: 'The Korean store is fully localised and shows the business registration and mail-order licence details that Korean online retailers are required to display.',
      },
      {
        title: 'Retail and online working together',
        text: 'Store locations in both cities, try-on information, free-delivery banners per market (S$120 in Singapore, ₩50,000 in Korea) and collections such as New In, Best Sellers and brand edits.',
      },
    ],
    image: { domain: 'ariseo.co.kr', src: '/images/work/ariseo-co-kr.webp', sm: '/images/work/ariseo-co-kr-sm.webp', alt: 'ARISEO Korean Shopify store homepage with a black-and-white “AWAKEN” campaign slide' },
    gallery: [
      { src: '/images/work/ariseo-com.webp', alt: 'ARISEO Singapore store (ariseo.com) homepage with the “ARISE : HELIX” campaign' },
    ],
  },
  {
    slug: 'keb-vietnam',
    name: 'KEB Vietnam',
    domain: 'keb.com.vn',
    url: 'https://keb.com.vn/',
    seoTitle: 'KEB Vietnam: Drive Website with Model Lookup',
    metaDescription: 'Custom WordPress site for KEB Vietnam with a nameplate decoder covering 4,400+ KEB COMBIVERT model codes, an error-code library and one-tap support.',
    industry: 'Industrial automation, variable frequency drives',
    location: 'Vietnam',
    category: 'Website + web tool',
    services: ['Custom WordPress theme', 'Model-code decoder & search', 'Error-code library', 'Technical SEO'],
    stack: ['WordPress', 'Custom theme', 'PHP', 'Vanilla JavaScript'],
    summary:
      'Supply and repair site for KEB COMBIVERT drives. Engineers type the code from a drive’s nameplate and the site decodes it and finds the exact model among 4,400+ F4, F5, F6 and S6 codes.',
    overview: [
      'KEB Vietnam supplies, replaces and repairs KEB COMBIVERT drives made by KEB Automation in Germany. These drives run injection-moulding machines, plastic extruders, textile lines and woodworking equipment all over Vietnam.',
      'The typical visitor is a maintenance engineer standing next to a stopped machine. They don’t browse a catalogue. They have a model code on a sticker and an error on a display, and they need an answer fast. So the site is built around tools rather than brochure pages.',
    ],
    highlights: [
      {
        title: 'Nameplate decoder',
        text: 'Type a code such as <code>14.F5.A1E-3A0A</code> and the site breaks it into its parts (power size, series, control type, equipment, housing and option) and links to the matching model page.',
      },
      {
        title: 'Search that forgives the way people type',
        text: 'The lookup accepts codes with or without dots and spaces (<code>07F5B3A390A</code>, <code>07 F5 B3A 390A</code>) and searches more than 4,400 KEB F4, F5, F6 and S6 model codes.',
      },
      {
        title: 'Error-code library',
        text: 'Dedicated pages for common faults such as F6 error 44 (invalid power unit data) and E.OH (power module overheating), with quick checks an engineer can do before calling. These pages match exactly what people search for when a line goes down.',
      },
      {
        title: 'Pages for the machines drives live in',
        text: 'Content for OEM equipment such as Haitian injection-moulding machines, Battenfeld-Cincinnati extruders, Rieter textile machines and Homag woodworking lines, so engineers find the site by the machine name too.',
      },
      {
        title: 'One tap to a human',
        text: 'A “send a photo of the nameplate” flow plus floating phone, Zalo, Telegram and WhatsApp buttons, and a clear four-step repair process from diagnosis to warranty.',
      },
    ],
    image: { w: 1440, h: 668, src: '/images/work/keb.webp', sm: '/images/work/keb-sm.webp', alt: 'KEB Vietnam homepage with the KEB COMBIVERT model-code search and nameplate decoder' },
  },
  {
    slug: 'vuon-dau-tam-ba-phong',
    name: 'Ba Phong Mulberry Farm',
    domain: 'vuondautambaphong.com',
    url: 'https://vuondautambaphong.com/',
    seoTitle: 'Ba Phong Farm: WordPress & WooCommerce Site',
    metaDescription: 'WordPress and WooCommerce site for Ba Phong, a 5-hectare organic mulberry farm in Tây Ninh, with a live “today at the farm” panel, visit booking and a shop.',
    industry: 'Agritourism & organic food',
    location: 'Tây Ninh, Vietnam',
    category: 'Website + e-commerce',
    services: ['Custom WordPress theme', 'WooCommerce shop', 'Visit booking', 'Live chat'],
    stack: ['WordPress', 'Custom theme', 'WooCommerce', 'PHP', 'Vanilla JavaScript'],
    summary:
      'A warm, photo-led site for a 5-hectare organic mulberry farm, with free visit booking, a live “today at the farm” panel and a shop for mulberry syrup, wine and dried fruit.',
    overview: [
      'Vườn Dâu Tằm Ba Phong is a 5-hectare organic mulberry farm in Tây Ninh, southern Vietnam. Entry is free: visitors pick ripe mulberries straight from the trees, relax under the coconut palms and take home the farm’s own products.',
      'The website has two jobs. It has to convince families to make the drive at the weekend, and it has to sell the farm’s products to people who can’t visit. The design leans on real photography and a relaxed, hand-lettered tone to match the place.',
    ],
    highlights: [
      {
        title: '“Today at the farm” live panel',
        text: 'A status card in the hero shows what is happening right now: whether berries are ripe for picking, opening hours, and parking for 45-seat coaches. Its greeting changes with the time of day, and after dark it invites visitors to book for tomorrow instead.',
      },
      {
        title: 'Free visit booking',
        text: '“Book a free visit” is the primary call to action on every screen, so the farm knows who is coming and can prepare.',
      },
      {
        title: 'WooCommerce shop for farm products',
        text: 'Fresh mulberries, mulberry syrup, mulberry wine and dried mulberries, sold online with product pages that tell the story of how they are grown.',
      },
      {
        title: 'Story, gallery and press',
        text: 'The farm’s story, a photo corner for visitors, news from farm activities (sunrise yoga, tourism fairs) and press and TV coverage, including a feature on VTV9.',
      },
      {
        title: 'Chat that feels personal',
        text: 'A chat bubble that introduces the real people who answer, which suits a family-run farm far better than an anonymous contact form.',
      },
    ],
    image: { src: '/images/work/vuondautambaphong.webp', sm: '/images/work/vuondautambaphong-sm.webp', alt: 'Ba Phong Mulberry Farm homepage with a mulberry tree photo and the “today at the farm” panel' },
  },
  {
    slug: 'hitech-vina-drive-repair',
    name: 'Hitech Vina Drive Repair',
    domain: 'suachuabientan.com',
    url: 'https://suachuabientan.com/',
    seoTitle: 'Hitech Vina: Industrial Drive Repair Website',
    metaDescription: 'Custom WordPress site for Hitech Vina, a drive repair workshop in Ho Chi Minh City: brand-first navigation, nameplate search and instant Zalo contact.',
    industry: 'Industrial electronics repair',
    location: 'Ho Chi Minh City, Vietnam',
    category: 'Website',
    services: ['Custom WordPress theme', 'Brand & model search', 'Service and case-study pages', 'Local SEO'],
    stack: ['WordPress', 'Custom theme', 'PHP', 'Vanilla JavaScript'],
    summary:
      'Repair workshop for industrial drives since 2008. Visitors pick their drive brand or type the nameplate code, then call or send a photo of the fault on Zalo.',
    overview: [
      'Hitech Vina has repaired variable frequency drives and other industrial electronics since 2008, both at its Ho Chi Minh City workshop and on site at customers’ factories. It works on ABB, Siemens, KEB, Danfoss, Schneider, SEW, Lenze, Vacon and more.',
      'Its customers are in a hurry, because every hour a machine is down costs money. The site therefore gets out of the way: identify the drive, see that this workshop fixes it, and get in touch in one tap.',
    ],
    highlights: [
      {
        title: 'Brand-first navigation',
        text: 'A “which brand is your drive?” selector lists each manufacturer with its common series (ABB ACS150/ACS355, Siemens Sinamics G120/S120, KEB COMBIVERT F5/F6, Schneider Altivar), because that is how engineers think about their equipment.',
      },
      {
        title: 'Search by nameplate code',
        text: 'The header search takes the code printed on the drive (for example ACS580 or 6SE…) and goes straight to the relevant repair page.',
      },
      {
        title: 'One contact for the whole control cabinet',
        text: 'Service pages for servo drives, PLCs and I/O modules, HMIs, soft starters, DC drives, compressors, flow meters and scheduled maintenance, so one search can turn into a long-term customer.',
      },
      {
        title: 'Transparent process',
        text: 'Receive, diagnose, quote, repair and load-test, hand over: five steps with the promise up front of a quote before any work starts and a load test before anything leaves the workshop.',
      },
      {
        title: 'Case studies that build authority',
        text: 'Write-ups of real repairs (Siemens SIMOREG DC converters, MASTERDRIVES, capacitor reforming) and location pages such as Bà Rịa–Vũng Tàu. These help the site rank for the long, specific searches that bring in qualified jobs.',
      },
    ],
    image: { w: 1440, h: 710, src: '/images/work/suachuabientan.webp', sm: '/images/work/suachuabientan-sm.webp', alt: 'Hitech Vina drive repair homepage with the workshop photo and brand list' },
  },
  {
    slug: 'kim-hoe-tyres',
    name: 'Kim Hoe & Co',
    domain: 'kimhoeco.com',
    url: 'https://kimhoeco.com/',
    seoTitle: 'Kim Hoe & Co: WooCommerce Tyre Shop, Singapore',
    metaDescription: 'WooCommerce tyre store for Kim Hoe & Co, a Singapore workshop since 1974, with a tyre-size filter, vehicle selector, PayPal checkout and Klaviyo email.',
    industry: 'Automotive: tyres, batteries & rims',
    location: 'Singapore',
    category: 'E-commerce',
    services: ['Custom WooCommerce theme', 'Tyre-size & vehicle filter', 'Online payments', 'Email marketing integration'],
    stack: ['WordPress', 'WooCommerce', 'Custom theme', 'PayPal', 'Klaviyo'],
    summary:
      'Online tyre store for a Singapore workshop trading since 1974. Shoppers filter by width, profile, rim size and brand or by their vehicle, order online and get the tyres fitted at the workshop.',
    overview: [
      'Kim Hoe & Co has fitted tyres in Singapore since 1974 and stocks the big names: Michelin, Pirelli, Dunlop, Goodyear, Continental, Yokohama, Federal and more. The workshop carries thousands of tyres, plus car batteries and rims.',
      'The goal was to let drivers find the exact tyre for their car online and buy it before they arrive, turning a phone-and-walk-in business into one that also sells around the clock.',
    ],
    highlights: [
      {
        title: 'Tyre-size filter on the homepage',
        text: 'Width, height (profile), rim diameter and brand selectors narrow thousands of SKUs down to the tyres that fit, without making the shopper dig through category pages.',
      },
      {
        title: 'Shop by vehicle',
        text: 'Drivers who don’t know their tyre size can choose their vehicle instead.',
      },
      {
        title: 'Tyres, batteries and rims by brand',
        text: 'Brand catalogues for each product line, with warranty information such as the Pirelli TYRElife programme.',
      },
      {
        title: 'Checkout and marketing that are already wired up',
        text: 'WooCommerce checkout with PayPal, Klaviyo for email marketing, and WhatsApp chat for the many customers in Singapore who would rather message than call.',
      },
      {
        title: 'Trust signals for a 50-year-old business',
        text: 'Recent-purchase notifications, awards, testimonials, “how to buy” and FAQ pages, and the workshop’s story, all supporting a premium but friendly brand.',
      },
    ],
    image: { w: 1440, h: 668, src: '/images/work/kimhoeco.webp', sm: '/images/work/kimhoeco-sm.webp', alt: 'Kim Hoe & Co tyre shop homepage with the tyre-size filter and workshop banner' },
  },
];

export const HUBSTOCK = {
  slug: 'hubstock',
  name: 'HubStock: Multi-Store Sync',
  shortName: 'HubStock',
  appStoreUrl: 'https://apps.shopify.com/hubstock-multi-store-sync',
  summary:
    'Our own Shopify app. One master store owns the stock and every connected store mirrors it in real time, including inventory, products and orders.',
  image: { src: '/images/hubstock/promo.webp', sm: '/images/hubstock/promo-sm.webp', alt: 'HubStock promo: one master store keeping three connected Shopify stores in sync' },
  plans: [
    {
      name: 'Free',
      price: '0',
      note: 'For destination stores',
      features: ['Covered by the master store’s plan'],
    },
    {
      name: 'Starter',
      price: '24',
      features: ['Up to 5 connected stores', '300 products · 1,500 variants', '5 mapped locations per store', '25,000 History entries'],
    },
    {
      name: 'Growth',
      price: '47',
      featured: true,
      features: ['Up to 10 connected stores', '1,500 products · 7,500 variants', '10 mapped locations per store', '150,000 History entries'],
    },
    {
      name: 'Scale',
      price: '79',
      features: ['Up to 25 connected stores', '5,000 products · 25,000 variants', '25 mapped locations per store', '750,000 History entries'],
    },
  ],
};
