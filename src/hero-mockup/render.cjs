const pp = require(process.argv[2] + '/node_modules/puppeteer-core');
(async () => {
  const b = await pp.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--allow-file-access-from-files'] });
  const p = await b.newPage();
  await p.setViewport({ width: 1200, height: 900, deviceScaleFactor: 2 });
  await p.goto('file://' + process.argv[3] + '/hero-mockup.source.html', { waitUntil: 'networkidle0' });
  await p.screenshot({ path: process.argv[3] + '/hero-mockup@2x.png' });
  await b.close();
})();
