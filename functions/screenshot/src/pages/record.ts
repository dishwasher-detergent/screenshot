import { Hono } from 'hono';
import NodeCache from 'node-cache';
import zlib from 'zlib';

import { spawnBrowser, takeVideo } from '../lib/browser.js';
import { joinQueryParams, parseVideoQueryParams } from '../lib/utils.js';

export function Record(
  app: Hono,
  cache: NodeCache,
  cacheDuration: number = 1440
) {
  app.get('/record/:url', async (c) => {
    const url = c.req.param('url');
    const urlDecoded = decodeURIComponent(url);
    const queryParams = c.req.queries();
    const cacheKey = `${c.req.path}${joinQueryParams(queryParams)}`;

    try {
      const params = parseVideoQueryParams(queryParams);

      if (cache.has(cacheKey)) {
        const cachedData: string | undefined = cache.get(cacheKey);
        if (cachedData != undefined) {
          const compressedBuffer = Buffer.from(cachedData, 'base64');
          const buffer = zlib.inflateSync(compressedBuffer);

          c.header('Content-Type', 'video/mp4');
          c.header('Cache-Control', `public, max-age=${cacheDuration}`);

          return c.body(buffer.toString('base64'));
        }
      }

      const { browser, page } = await spawnBrowser(urlDecoded, {
        waitUntil: 'networkidle0',
      });

      const videoFile = await takeVideo(page, params);
      await browser.close();

      const compressedBuffer = zlib.deflateSync(videoFile);
      const compressedString = compressedBuffer.toString('base64');

      cache.set(cacheKey, compressedString);

      c.header('Content-Type', 'video/mp4');
      c.header('Cache-Control', `public, max-age=${cacheDuration}`);

      return c.body(videoFile.toString('base64'));
    } catch (err) {
      return c.json({ error: (err as Error).message }, 500);
    }
  });
}
