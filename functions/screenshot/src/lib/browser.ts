import puppeteer, { Page, ScreenshotOptions } from 'puppeteer';
import { ScreenshotParams } from '../types/types.js';

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

export const takeScreenshot = async (page: Page, params: ScreenshotParams) => {
  let screenshot: string | Buffer | undefined = undefined;

  const screenShotOptions: ScreenshotOptions = {
    type: params.format,
    omitBackground: params.omitBackground,
    fullPage: params.fullPage,
  };

  const clip = params.clip ? { x: params.clipX, y: params.clipY } : {};

  if (screenShotOptions.type != 'png') {
    screenShotOptions.quality = params.quality;
  }

  try {
    page.setViewport({
      width: params.width,
      height: params.height,
      deviceScaleFactor: params.scale,
    });
  } catch (err) {
    throw new Error('Failed to set page viewport.');
  }

  try {
    page.emulateMediaFeatures([
      {
        name: 'prefers-color-scheme',
        value: params.darkModeString,
      },
    ]);
  } catch (err) {
    throw new Error('Failed to set darkmode.');
  }

  try {
    screenshot = await page.screenshot({
      ...screenShotOptions,
      ...clip,
    });
  } catch (err) {
    throw new Error('Failed to take screenshot');
  }

  return screenshot;
};
