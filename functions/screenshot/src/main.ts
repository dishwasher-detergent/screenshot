import { execSync } from 'child_process';
import { accessSync, constants } from 'fs';

import { extname } from 'path';
import { spawnBrowser, takeScreenshot, takeVideo } from './lib/browser.js';
import { getStaticFile, parseScreenshotQueryParams } from './lib/utils.js';
import { Context } from './types/types.js';

export default async ({ req, res, log, error }: Context) => {
  try {
    accessSync('/usr/bin/chromium-browser', constants.R_OK | constants.W_OK);
  } catch (err) {
    execSync('apk add --no-cache nss udev ttf-freefont chromium');
  }

  const cache = 1440; //24 hours in seconds

  const queryParams = req.query;

  const fullPath = req.path;

  const firstSlashIndex = fullPath.indexOf('/') + 1;
  let secondSlashIndex = fullPath.indexOf('/', firstSlashIndex + 1);

  const path = req.path.slice(firstSlashIndex, secondSlashIndex);
  const url = fullPath.slice(secondSlashIndex + 1);

  if (!url) {
    return res.send('No URL specified!', 500);
  }

  if (path == 'metadata' || path == 'screenshot' || path == 'video') {
    const { browser, page } = await spawnBrowser(url);

    if (path == 'screenshot') {
      try {
        const params = parseScreenshotQueryParams(queryParams);
        const screenshot = await takeScreenshot(page, params);
        await browser.close();

        return res.send(screenshot, 200, {
          'Content-Type': `image/${queryParams.format ?? 'png'}`,
          'Cache-Control': `public, max-age=${cache}`,
          'Access-Control-Allow-Origin': '*',
        });
      } catch (err) {
        return res.send(
          {
            error: (err as Error).message,
          },
          500,
          {
            'Content-Type': 'application/json',
            'Cache-Control': `public, max-age=${cache}`,
            'Access-Control-Allow-Origin': '*',
          }
        );
      }
    }

    if (path == 'video') {
      try {
        const params = parseScreenshotQueryParams(queryParams);
        const videoFile = await takeVideo(page, params);

        await browser.close();

        return res.send(videoFile, 200, {
          'Content-Type': 'video/mp4',
          'Cache-Control': `public, max-age=${cache}`,
          'Access-Control-Allow-Origin': '*',
        });
      } catch (err) {
        return res.send(
          {
            error: (err as Error).message,
          },
          500,
          {
            'Content-Type': 'application/json',
            'Cache-Control': `public, max-age=${cache}`,
            'Access-Control-Allow-Origin': '*',
          }
        );
      }
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
        'Access-Control-Allow-Origin': '*',
      });
    }
  }

  if (secondSlashIndex == -1 && /\.html$|\.css$|\.js$/.test(fullPath)) {
    const file = fullPath.substring(1);

    const extension = extname(file);

    return res.send(getStaticFile(file), 200, {
      'Content-Type': `text/${extension.substring(1)}; charset=utf-8`,
      'Access-Control-Allow-Origin': '*',
    });
  }

  return res.send(getStaticFile('index.html'), 200, {
    'Content-Type': 'text/html; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
  });
};
