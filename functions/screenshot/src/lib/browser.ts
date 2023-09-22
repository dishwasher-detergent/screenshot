import puppeteer from 'puppeteer';

export const spawnBrowser = async (url: string) => {
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/chromium-browser',
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--headless',
      '--disable-gpu',
      '--disable-dev-shm-usage',
    ],
  });

  const page = await browser.newPage();

  await page.goto(url, {
    waitUntil: 'networkidle0',
  });

  return { browser, page };
};
