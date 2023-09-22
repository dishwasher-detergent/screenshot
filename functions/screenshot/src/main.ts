import { execSync } from 'child_process';
import { accessSync, constants } from 'fs';
import { ScreenshotOptions } from 'puppeteer';
import { PuppeteerScreenRecorder } from 'puppeteer-screen-recorder';

import { spawnBrowser } from './lib/browser.js';
import { parseScreenshotQueryParams } from './lib/utils.js';
import { Context } from './types/types.js';

export default async ({ req, res, log, error }: Context) => {
  try {
    accessSync('/usr/bin/chromium-browser', constants.R_OK | constants.W_OK);
  } catch (err) {
    execSync('apk add --no-cache nss udev ttf-freefont chromium');
  }

  let https = false;

  if (req.path.includes('https')) {
    https = true;
  }

  const cache = 1440; //24 hours in seconds

  const queryParams = req.query;

  const fullPath = req.path;

  const firstSlashIndex = fullPath.indexOf('/') + 1;
  let secondSlashIndex = fullPath.indexOf('/', firstSlashIndex + 1);

  const path = req.path.slice(firstSlashIndex, secondSlashIndex);
  const url = fullPath.slice(secondSlashIndex + 1);

  log(path);
  log(url);

  if (!url) {
    return res.send('No URL specified!', 500);
  }

  if (path == 'metadata' || path == 'screenshot' || path == 'video') {
    const { browser, page } = await spawnBrowser(url);

    if (path == 'screenshot') {
      let screenshot;
      const params = parseScreenshotQueryParams(queryParams);

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
        error((err as Error).message);
      }

      try {
        page.emulateMediaFeatures([
          {
            name: 'prefers-color-scheme',
            value: params.darkModeString,
          },
        ]);
      } catch (err) {
        error((err as Error).message);
      }

      try {
        screenshot = await page.screenshot({
          ...screenShotOptions,
          ...clip,
        });
      } catch (err) {
        error((err as Error).message);
      }

      await browser.close();

      if (screenshot) {
        return res.send(screenshot, 200, {
          'Content-Type': `image/${queryParams.format ?? 'png'}`,
          'Cache-Control': `public, max-age=${cache}`,
        });
      } else {
        return res.send('Could not generate screenshot.', 500);
      }
    }

    if (path == 'video') {
      const recorder = new PuppeteerScreenRecorder(page);
    }

    if (path == 'metadata') {
      const metadata = await page.evaluate(() => {
        const metaTagsArray: any[] = [];
        const metaTags = document.querySelectorAll('meta');

        metaTags.forEach((metaTag) => {
          const attributes: any = {};

          for (const attr of metaTag.attributes) {
            attributes[attr.name] = attr.value;
          }

          metaTagsArray.push(attributes);
        });

        return metaTagsArray;
      });

      return res.send(metadata, 200, {
        'Content-Type': 'application/json',
        'Cache-Control': `public, max-age=${cache}`,
      });
    }
  }

  return res.send('Hello from test', 200);
};
