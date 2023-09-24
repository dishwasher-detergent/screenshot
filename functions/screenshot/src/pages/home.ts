import { readFileSync } from 'fs';
import { Hono } from 'hono';
import { staticFolder } from '../lib/utils.js';

export function Home(app: Hono) {
  app.get('/', (c) => {
    const filePath = staticFolder + '/index.html';
    const html = readFileSync(filePath);
    return c.html(html.toString());
  });
}

export function CSS(app: Hono) {
  app.get('/:filename{.+.css$}', (c) => {
    const filePath = `${staticFolder}/${c.req.param('filename')}`;
    const css = readFileSync(filePath);
    c.header('Content-Type', 'text/css');
    return c.body(css.toString());
  });
}

export function JS(app: Hono) {
  app.get('/:filename{.+.js$}', (c) => {
    const filePath = `${staticFolder}/${c.req.param('filename')}`;
    const js = readFileSync(filePath);
    c.header('Content-Type', 'text/js');
    return c.body(js.toString());
  });
}
