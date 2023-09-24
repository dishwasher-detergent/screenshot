import { Hono } from 'hono';
import NodeCache from 'node-cache';
import zlib from 'zlib';

import { spawnBrowser, takeScreenshot } from '../lib/browser.js';
import { joinQueryParams, parseScreenshotQueryParams } from '../lib/utils.js';

export function Screenshot(
  app: Hono,
  cache: NodeCache,
  cacheDuration: number = 1440
) {
  app.get('/screenshot/:url', async (c) => {
    const url = c.req.param('url');
    const urlDecoded = decodeURIComponent(url);
    const queryParams = c.req.queries();
    const cacheKey = `${c.req.path}${joinQueryParams(queryParams)}`;
    try {
      const params = parseScreenshotQueryParams(queryParams);

      if (cache.has(cacheKey)) {
        const cachedData: string | undefined = cache.get(cacheKey);
        if (cachedData != undefined) {
          const compressedBuffer = Buffer.from(cachedData, 'base64');
          const buffer = zlib.inflateSync(compressedBuffer);

          c.status(200);
          c.header('Content-Type', `image/${params.format}`);
          c.header('Cache-Control', `public, max-age=${cacheDuration}`);

          return c.body(buffer.toString('base64'));
        }
      }

      const { browser, page } = await spawnBrowser(urlDecoded);

      const screenshot = await takeScreenshot(page, params);

      await browser.close();

      const compressedBuffer = zlib.deflateSync(screenshot);
      const compressedString = compressedBuffer.toString('base64');
      cache.set(cacheKey, compressedString);

      c.status(200);
      c.header('Content-Type', `image/${params.format}`);
      c.header('Cache-Control', `public, max-age=${cacheDuration}`);

      return c.body(screenshot.toString('base64'));
    } catch (err) {
      return c.json({ error: (err as Error).message }, 500);
    }
  });
}
