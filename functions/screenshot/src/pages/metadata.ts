import { Hono } from 'hono';
import NodeCache from 'node-cache';

import { spawnBrowser } from '../lib/browser.js';

export function Metadata(
  app: Hono,
  cache: NodeCache,
  cacheDuration: number = 1440
) {
  app.get('/metadata/:url', async (c) => {
    const url = c.req.param('url');
    const urlDecoded = decodeURIComponent(url);
    const cacheKey = `${c.req.path}`;

    if (cache.has(cacheKey)) {
      const cachedData: string | undefined = cache.get(cacheKey);

      if (cachedData != undefined) {
        const metadata = JSON.parse(cachedData);

        return c.json(metadata, 200, {
          'Cache-Control': `public, max-age=${cacheDuration}`,
        });
      }
    }

    const { browser, page } = await spawnBrowser(urlDecoded);
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

    await browser.close();

    cache.set(cacheKey, JSON.stringify(metadata));

    return c.json(metadata, 200, {
      'Cache-Control': `public, max-age=${cacheDuration}`,
    });
  });
}
