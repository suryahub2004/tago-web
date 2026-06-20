const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();

  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));
  page.on('response', response => {
    if (response.status() >= 400 && response.url().includes('api')) {
      console.log('NETWORK ERROR:', response.status(), response.url());
    }
  });

  console.log("Navigating to login...");
  await page.goto('http://localhost:3000/auth/login');
  
  console.log("Waiting for form...");
  await page.waitForSelector('input[type="email"]');
  
  await page.type('input[type="email"]', 'admin@tago.io');
  await page.type('input[type="password"]', 'ChangeMeImmediately123!');
  
  console.log("Submitting login...");
  await Promise.all([
    page.click('button[type="submit"]'),
    page.waitForNavigation({ waitUntil: 'networkidle0' })
  ]);
  
  console.log("Logged in. Checking dashboard text...");
  const bodyText = await page.evaluate(() => document.body.innerText);
  
  if (bodyText.includes("Failed to load stats")) {
    console.log("DASHBOARD FAILED TO LOAD STATS");
  } else {
    console.log("DASHBOARD LOADED STATS SUCCESSFULLY");
  }
  
  await browser.close();
})();
