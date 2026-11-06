#!/usr/bin/env node
// NDTify static site build. No dependencies. Run:  node build.mjs
// Writes HTML pages + sitemap.xml into ./public (the folder you upload to hosting).
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { render, SITE } from './src/site.mjs';
import { PROJECTS } from './src/projects.mjs';
import { home } from './src/pages/home.mjs';
import { workIndex, caseStudy } from './src/pages/work.mjs';
import { services } from './src/pages/services.mjs';
import { hubstock } from './src/pages/hubstock.mjs';
import { notFound } from './src/pages/notfound.mjs';
import { contact } from './src/pages/contact.mjs';

const OUT = join(dirname(fileURLToPath(import.meta.url)), 'public');
const today = new Date().toISOString().slice(0, 10);

const pages = [home(), services(), workIndex(), ...PROJECTS.map(caseStudy), hubstock(), contact()];

function write(path, html) {
  const file = path.endsWith('.html') ? join(OUT, path) : join(OUT, path, 'index.html');
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, html);
  console.log('  ✓', file.replace(OUT, 'public'));
}

for (const p of pages) write(p.path, render({ ...p, projects: PROJECTS }));
write('/404.html', render({ ...notFound(), projects: PROJECTS }));

const prio = (path) => (path === '/' ? '1.0' : path.split('/').length > 3 ? '0.7' : '0.8');
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages
  .map((p) => `  <url>\n    <loc>${SITE.url}${p.path}</loc>\n    <lastmod>${today}</lastmod>\n    <priority>${prio(p.path)}</priority>\n  </url>`)
  .join('\n')}
</urlset>
`;
writeFileSync(join(OUT, 'sitemap.xml'), sitemap);
console.log(`  ✓ public/sitemap.xml (${pages.length} URLs)`);
