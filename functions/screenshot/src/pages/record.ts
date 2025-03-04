import { Hono } from 'hono';

import { spawnBrowser, takeVideo } from '../lib/browser.js';
import { parseVideoQueryParams } from '../lib/utils.js';

export function Record(app: Hono, cacheDuration: number = 1440) {
  app.get('/record/:url', async (c) => {
    const url = c.req.param('url');
    const urlDecoded = decodeURIComponent(url);
    const queryParams = c.req.queries();

    let videoFile;
    let error;

    const { browser, page } = await spawnBrowser(urlDecoded, {
      waitUntil: 'networkidle2',
    }).catch(async (err) => {
      await browser.close();
      throw new Error(err);
    });

    try {
      const params = parseVideoQueryParams(queryParams);

      videoFile = await takeVideo(page, params);
    } catch (err) {
      error = { error: (err as Error).message };
    } finally {
      await browser.close();
    }

    if (videoFile && videoFile.length > 0) {
      c.header('Content-Type', 'video/mp4');
      c.header('Cache-Control', `public, max-age=${cacheDuration}`);
      return c.body(videoFile.toString('base64'));
    }

    if (error) {
      return c.json(error, 500);
    }

    return c.json({ error: 'Failed with no message.' }, 500);
  });
}
