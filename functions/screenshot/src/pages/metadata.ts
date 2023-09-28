import { Hono } from 'hono';

import { spawnBrowser } from '../lib/browser.js';

export function Metadata(app: Hono, cacheDuration: number = 1440) {
  app.get('/metadata/:url', async (c) => {
    const url = c.req.param('url');
    const urlDecoded = decodeURIComponent(url);

    const { browser, page } = await spawnBrowser(urlDecoded).catch(async (err) => {
      await browser.close();
      throw new Error(err);
    });
    
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

    return c.json(metadata, 200, {
      'Cache-Control': `public, max-age=${cacheDuration}`,
    });
  });
}
