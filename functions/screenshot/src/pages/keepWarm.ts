import { Hono } from 'hono';

export function KeepWarm(app: Hono) {
  app.post('/', (c) => {
    if (c.req.header('x-appwrite-trigger') === 'schedule') {
      return c.text('scheduled');
    }

    return c.text('not scheduled');
  });
}
