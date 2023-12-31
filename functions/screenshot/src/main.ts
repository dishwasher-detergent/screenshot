import { execSync } from 'child_process';
import { Hono } from 'hono';
import { cors } from 'hono/cors';

import { requestFromContext, responseForContext } from './lib/utils.js';
import { CSS, Home, JS } from './pages/home.js';
import { KeepWarm } from './pages/keepWarm.js';
import { Metadata } from './pages/metadata.js';
import { Record } from './pages/record.js';
import { Screenshot } from './pages/screenshot.js';
import { Context } from './types/types.js';

let installed = false;
const cache = 1440; //24 hours in seconds

const app = new Hono();

app.use('*', cors());

// Error Handling
app.onError((err, c) => {
  return c.json(err, 500);
});

// Post requests
KeepWarm(app);

// Static pages
Home(app);
CSS(app);
JS(app);

// API Routes
Screenshot(app, cache);
Record(app, cache);
Metadata(app, cache);

export default async (context: Context) => {
  if (installed) {
    context.log('already installed chromium');
  } else {
    execSync('apk add /usr/local/server/src/function/*.apk');
    context.log('installed chromium');
    installed = true;
  }

  const request = requestFromContext(context);
  const response = await app.request(request);

  return await responseForContext(context, response);
};
