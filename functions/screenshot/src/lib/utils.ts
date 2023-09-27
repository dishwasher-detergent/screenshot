import { readFileSync } from 'fs';
import { get } from 'https';
import path from 'path';
import { fileURLToPath } from 'url';

import { ScreenshotParams, VideoParams } from '../types/types.js';

export const __filename = fileURLToPath(import.meta.url);
export const __dirname = path.dirname(__filename);
export const staticFolder = path.join(__dirname, '../../static');
export const tempFolder = path.join(__dirname, '../../temp');

export const fetchHTML = (url: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    get(url, (response) => {
      let data = '';

      response.on('data', (chunk) => {
        data += chunk;
      });

      response.on('end', () => {
        resolve(data); // Resolve the Promise with the HTML data
      });
    }).on('error', (error) => {
      reject(error); // Reject the Promise with an error if one occurs
    });
  });
};

export const parseScreenshotQueryParams = (queryParams: any) => {
  const width = queryParams.width ? Number(queryParams.width[0]) : 1280;
  if (Number.isNaN(width))
    throw new Error(
      `Width must be a number, you passed in "${queryParams.width[0]}".`
    );

  if (width > 1280) {
    throw new Error(
      `Width must be less than 1280, you passed in "${queryParams.width[0]}".`
    );
  }

  const height = queryParams.height ? Number(queryParams.height[0]) : 720;
  if (Number.isNaN(height))
    throw new Error(
      `Height must be a number, you passed in "${queryParams.height[0]}".`
    );

  if (height > 720) {
    throw new Error(
      `Height must be less than 720, you passed in "${queryParams.height[0]}".`
    );
  }

  const scale = queryParams.scale ? Number(queryParams.scale[0]) : 1;
  if (Number.isNaN(scale))
    throw new Error(
      `Scale must be a number, you passed in "${queryParams.scale[0]}".`
    );

  const clipX = queryParams.clipX ? Number(queryParams.clipX[0]) : 100;
  if (Number.isNaN(clipX))
    throw new Error(
      `ClipX must be a number, you passed in "${queryParams.clipX[0]}".`
    );

  const clipY = queryParams.clipY ? Number(queryParams.clipY[0]) : 100;
  if (Number.isNaN(clipY))
    throw new Error(
      `ClipY must be a number, you passed in "${queryParams.clipY[0]}".`
    );

  const quality = queryParams.quality ? Number(queryParams.quality[0]) : 80;
  if (Number.isNaN(quality))
    throw new Error(
      `Quality must be a number, you passed in "${queryParams.quality[0]}".`
    );

  const format = queryParams.format ? queryParams.format[0] : 'webp';
  if (format != 'webp' && format != 'png' && format != 'jpeg') {
    throw new Error(
      `Format must be "webp", "png", or "jpeg", you passed in "${queryParams.format[0]}".`
    );
  }

  const fullpage = queryParams.fullPage
    ? Boolean(queryParams.fullPage[0])
    : false;

  if (
    queryParams.fullPage &&
    queryParams.fullPage[0] != 'true' &&
    queryParams.fullPage[0] != 'false'
  )
    throw new Error(
      `FullPage must be a "true" or "false", you passed in "${queryParams.fullPage[0]}".`
    );

  const omitBackground = queryParams.omitBackground
    ? Boolean(queryParams.omitBackground[0])
    : false;

  if (
    queryParams.omitBackground &&
    queryParams.omitBackground[0] != 'true' &&
    queryParams.omitBackground[0] != 'false'
  )
    throw new Error(
      `OmitBackground must be a "true" or "false", you passed in "${queryParams.omitBackground[0]}".`
    );

  const darkMode = queryParams.darkMode
    ? Boolean(queryParams.darkMode[0])
    : false;

  if (
    queryParams.darkMode &&
    queryParams.darkMode[0] != 'true' &&
    queryParams.darkMode[0] != 'false'
  )
    throw new Error(
      `DarkMode must be a "true" or "false", you passed in "${queryParams.darkMode[0]}".`
    );

  const darkModeString = darkMode ? 'dark' : 'light';

  let clip = false;
  if (queryParams.clipY && queryParams.clipX) clip = true;

  const params: ScreenshotParams = {
    width: width,
    height: height,
    scale: scale,
    clip: clip,
    clipX: clipX,
    clipY: clipY,
    quality: quality,
    format: format,
    fullPage: fullpage,
    omitBackground: omitBackground,
    darkMode: darkMode,
    darkModeString: darkModeString,
  };

  return params;
};

export const parseVideoQueryParams = (queryParams: any) => {
  const width = queryParams.width ? Number(queryParams.width[0]) : 852;
  if (Number.isNaN(width))
    throw new Error(
      `Width must be a number, you passed in "${queryParams.width[0]}".`
    );

  if (width < 500) {
    throw new Error(
      `Width must be greater than 500, you passed in "${queryParams.width[0]}".`
    );
  }

  if (width > 1280) {
    throw new Error(
      `Width must be less than 1280, you passed in "${queryParams.width[0]}".`
    );
  }

  const height = queryParams.height ? Number(queryParams.height[0]) : 480;
  if (Number.isNaN(height))
    throw new Error(
      `Height must be a number, you passed in "${queryParams.height[0]}".`
    );

  if (height < 480) {
    throw new Error(
      `Height must be greater than 500, you passed in "${queryParams.height[0]}".`
    );
  }

  if (height > 720) {
    throw new Error(
      `Height must be less than 720, you passed in "${queryParams.height[0]}".`
    );
  }

  const scale = queryParams.scale ? Number(queryParams.scale[0]) : 0.5;
  if (Number.isNaN(scale))
    throw new Error(
      `Scale must be a number, you passed in "${queryParams.scale[0]}".`
    );

  const darkMode = queryParams.darkMode
    ? Boolean(queryParams.darkMode[0])
    : false;

  if (
    queryParams.darkMode &&
    queryParams.darkMode[0] != 'true' &&
    queryParams.darkMode[0] != 'false'
  )
    throw new Error(
      `DarkMode must be a "true" or "false", you passed in "${queryParams.darkMode[0]}".`
    );

  const animation = queryParams.animation ? queryParams.animation[0] : null;

  const darkModeString = darkMode ? 'dark' : 'light';

  const params: VideoParams = {
    width: width,
    height: height,
    scale: scale,
    darkMode: darkMode,
    darkModeString: darkModeString,
    animation: animation,
  };

  return params;
};

export const getStaticFile = (fileName: string) => {
  return readFileSync(path.join(staticFolder, fileName)).toString();
};

export const joinQueryParams = (queryParams: any) => {
  if (queryParams) {
    return (
      '?' +
      Object.keys(queryParams)
        .map((key) => `${key}=${queryParams[key][0]}`)
        .join('&')
    );
  } else {
    return '';
  }
};

export const requestFromContext = (context: any) => {
  const headers = new Headers();
  for (const header of Object.keys(context.req.headers)) {
    headers.set(header, context.req.headers[header]);
  }

  let body = context.req.bodyRaw;
  if (context.req.method === 'GET' || context.req.method === 'HEAD') {
    body = undefined;
  }

  const request = new Request(context.req.url, {
    method: context.req.method,
    body,
    headers,
  });

  return request;
};

export async function responseForContext(context: any, response: any) {
  const headers: Record<string, string> = {};
  for (const pair of response.headers.entries()) {
    headers[pair[0]] = pair[1];
  }

  let content;
  if (
    headers['content-type'].includes('image') ||
    headers['content-type'].includes('video')
  ) {
    content = Buffer.from(await response.text(), 'base64');
  } else {
    content = await response.text();
  }

  return context.res.send(content, response.status, headers);
}
