import { execSync } from 'child_process';
import { accessSync, constants } from 'fs';
import { Hono } from 'hono';
import NodeCache from 'node-cache';

import { cors } from 'hono/cors';
import { requestFromContext, responseForContext } from './lib/utils.js';
import { CSS, Home, JS } from './pages/home.js';
import { Metadata } from './pages/metadata.js';
import { Record } from './pages/record.js';
import { Screenshot } from './pages/screenshot.js';
import { Context } from './types/types.js';

const cache = 1440; //24 hours in seconds
const nodeCache = new NodeCache({ stdTTL: cache, checkperiod: cache + 60 });

const app = new Hono();

app.use('*', cors());

// Error Handling
app.onError((err, c) => {
  return c.json(err, 500);
});

// Static pages
Home(app);
CSS(app);
JS(app);

// API Routes
Screenshot(app, nodeCache, cache);
Record(app, nodeCache, cache);
Metadata(app, nodeCache, cache);

export default async (context: Context) => {
  // Until larger builds get fixed I need to do this, once larger builds are fixed and I can include chrome in my build process this will go away.
  try {
    accessSync('/usr/bin/chromium-browser', constants.R_OK | constants.W_OK);
  } catch (err) {
    execSync('apk add --no-cache nss udev ttf-freefont chromium');
  }

  // Keeps the function warm
  if (context.req.headers['x-appwrite-trigger'] === 'schedule') {
    context.res.json({ keep_alive: true });
  }

  const request = requestFromContext(context);
  const response = await app.request(request);

  return await responseForContext(context, response);
};
