import { readFileSync } from 'fs';
import puppeteer, { Page, ScreenshotOptions } from 'puppeteer';
import { PuppeteerScreenRecorder } from 'puppeteer-screen-recorder';
import { ScreenshotParams } from '../types/types.js';
import { tempFolder } from './utils.js';

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

export const takeVideo = async (page: Page, params: ScreenshotParams) => {
  let video: string | Buffer | undefined = undefined;

  const screenShotOptions: ScreenshotOptions = {
    type: params.format,
    omitBackground: params.omitBackground,
    fullPage: params.fullPage,
  };

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

  const fileName = createFileName();

  try {
    const recorder = new PuppeteerScreenRecorder(page);
    await recorder.start(`${tempFolder}/${fileName}.mp4`);
    await animate(page);
    await recorder.stop();
  } catch (err) {
    throw new Error('Failed to take screenshot');
  }

  try {
    video = readFileSync(`${tempFolder}/${fileName}.mp4`, null);
  } catch (err) {
    throw new Error('Failed to read video file.');
  }

  return video;
};

const animate = async (page: Page) => {
  await wait(500);
  await page.evaluate(() => {
    window.scrollBy({ top: 500, left: 0, behavior: 'smooth' });
  });
  await wait(500);
  await page.evaluate(() => {
    window.scrollBy({ top: 1000, left: 0, behavior: 'smooth' });
  });
  await wait(1000);
};

const wait = (ms: number) => new Promise((res) => setTimeout(res, ms));

const createFileName = () => {
  const min = 1000000;
  const max = 9999999;
  const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;

  const date = Date.now().toString();

  const unique = `${randomNumber}${date}`;

  return unique;
};
