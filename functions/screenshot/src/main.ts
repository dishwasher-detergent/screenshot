import { execSync } from 'child_process';
import { accessSync, constants } from 'fs';

import { ScreenshotOptions } from 'puppeteer';
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

  const queryParams = req.query;

  const path = req.path.replace(/https?:\/\//, '');
  const pathArray = path.split('/').filter((x: string) => x !== '');

  const url = `http${https ? 's' : ''}://${pathArray[1]}`;

  if (!url) {
    return res.send('No URL specified!', 500);
  }

  if (
    pathArray[0] == 'metadata' ||
    pathArray[0] == 'screenshot' ||
    pathArray[0] == 'video'
  ) {
    const { browser, page } = await spawnBrowser(url);

    if (pathArray[0] == 'screenshot') {
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
        });
      } else {
        return res.send('Could not generate screenshot.', 500);
      }
    }

    if (pathArray[0] == 'video') {
    }

    if (pathArray[0] == 'metadata') {
    }
  }

  return res.send('Hello from test', 200);
};
