import { readFileSync, unlinkSync } from 'fs';
import puppeteer, { Page, ScreenshotOptions } from 'puppeteer';
import { PuppeteerScreenRecorder } from 'puppeteer-screen-recorder';

import { Animation, ScreenshotParams, VideoParams } from '../types/types.js';
import { tempFolder } from './utils.js';

export const spawnBrowser = async (url: string, options: any = {}) => {
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: '/usr/bin/chromium-browser',
    args: [
      '--no-sandbox',
      '--headless',
      '--disable-gpu',
      '--disable-dev-shm-usage',
    ],
  });

  const page = await browser.newPage();

  try {
    await page.goto(url, options);
  } catch {
    throw new Error(`Failed to load ${url}.`);
  }

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
  } catch (err: any) {
    throw new Error('Failed to take screenshot.');
  }

  return screenshot;
};

export const takeVideo = async (page: Page, params: VideoParams) => {
  let video: string | Buffer | undefined = undefined;
  const defaultAnimation: Animation[] = [
    {
      wait: 1000,
      top: 500,
      left: 0,
      behavior: 'smooth',
    },
  ];

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

    const animations = params.animation
      ? parseAnimation(params.animation)
      : defaultAnimation;

    await animate(page, animations);
    await recorder.stop();
  } catch (err) {
    throw new Error('Failed to take video.');
  }

  try {
    video = readFileSync(`${tempFolder}/${fileName}.mp4`, null);
  } catch (err) {
    throw new Error('Failed to read video file.');
  } finally {
    unlinkSync(`${tempFolder}/${fileName}.mp4`);
  }

  return video;
};

const animate = async (page: Page, animations: Animation[]) => {
  await wait(500);
  for (let i = 0; i < animations.length; i++) {
    const { wait: waitMs, top, left, behavior } = animations[i];
    await page.evaluate(
      ({ top, left, behavior }) => {
        window.scrollBy({
          top: top,
          left: left,
          behavior: behavior,
        });
      },
      { top, left, behavior }
    );
    await wait(waitMs);
  }
};

const parseAnimation = (animation: string) => {
  const animations: Animation[] = [];
  const split = animation.split(':');
  for (let i = 0; i < split.length; i++) {
    const frame = split[i];
    const frameSplit = frame.split(',');

    const wait = Number(frameSplit[0]);
    if (Number.isNaN(wait))
      throw new Error(
        `Animation Wait must be a number, you passed in "${frameSplit[0]}".`
      );

    const top = Number(frameSplit[1]);
    if (Number.isNaN(top))
      throw new Error(
        `Animation Top must be a number, you passed in "${frameSplit[1]}".`
      );

    const left = Number(frameSplit[2]);
    if (Number.isNaN(left))
      throw new Error(
        `Animation Left must be a number, you passed in "${frameSplit[2]}".`
      );

    const behavior = frameSplit[3];
    if (behavior != 'auto' && behavior != 'instant' && behavior != 'smooth') {
      throw new Error(
        `Animation Behavior must be "auto", "instant", or "smooth", you passed in "${frameSplit[3]}".`
      );
    }

    const frameObject: Animation = {
      wait: wait,
      top: top,
      left: left,
      behavior: behavior,
    };
    animations.push(frameObject);
  }

  return animations;
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
