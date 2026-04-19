const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  await page.goto('http://35.198.244.51/login');
  
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  
  await page.reload();
  await page.waitForSelector('button', { timeout: 5000 });

  page.on('framenavigated', frame => {
    if (frame === page.mainFrame()) {
      console.log('Navigated to: ' + frame.url());
    }
  });

  const buttons = await page.$$('button');
  for (const btn of buttons) {
    const text = await page.evaluate(el => el.textContent, btn);
    if (text && text.includes('Google')) {
      console.log('Clicking Google button...');
      await btn.click();
      break;
    }
  }

  await new Promise(r => setTimeout(r, 5000));
  await browser.close();
})();
