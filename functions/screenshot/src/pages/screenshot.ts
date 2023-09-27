import { Hono } from 'hono';

import { spawnBrowser, takeScreenshot } from '../lib/browser.js';
import { parseScreenshotQueryParams } from '../lib/utils.js';

export function Screenshot(app: Hono, cacheDuration: number = 1440) {
  app.get('/screenshot/:url', async (c) => {
    const url = c.req.param('url');
    const urlDecoded = decodeURIComponent(url);
    const queryParams = c.req.queries();

    const { browser, page } = await spawnBrowser(urlDecoded, {
      waitUntil: 'domcontentloaded',
    });

    let screenshot;
    let error;
    let format;

    try {
      const params = parseScreenshotQueryParams(queryParams);
      format = params.format;

      screenshot = await takeScreenshot(page, params);
    } catch (err) {
      error = { error: (err as Error).message };
    } finally {
      await browser.close();
    }

    if (screenshot && screenshot.length > 0 && format) {
      c.header('Content-Type', `image/${format}`);
      c.header('Cache-Control', `public, max-age=${cacheDuration}`);
      return c.body(screenshot.toString('base64'));
    }

    if (error) {
      return c.json(error, 500);
    }

    return c.json({ error: 'Failed with no message.' }, 500);
  });
}
