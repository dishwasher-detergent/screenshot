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
  const width = queryParams.width ? Number(queryParams.width) : 1280;
  if (Number.isNaN(width))
    throw new Error(
      `Width must be a number, you passed in "${queryParams.width}".`
    );

  if (width > 1280) {
    throw new Error(
      `Width must be less than 1280, you passed in "${queryParams.width}".`
    );
  }

  const height = queryParams.height ? Number(queryParams.height) : 720;
  if (Number.isNaN(height))
    throw new Error(
      `Height must be a number, you passed in "${queryParams.height}".`
    );

  if (height > 720) {
    throw new Error(
      `Height must be less than 720, you passed in "${queryParams.height}".`
    );
  }

  const scale = queryParams.scale ? Number(queryParams.scale) : 1;
  if (Number.isNaN(scale))
    throw new Error(
      `Scale must be a number, you passed in "${queryParams.scale}".`
    );

  const clipX = queryParams.clipX ? Number(queryParams.clipX) : 100;
  if (Number.isNaN(clipX))
    throw new Error(
      `ClipX must be a number, you passed in "${queryParams.clipX}".`
    );

  const clipY = queryParams.clipY ? Number(queryParams.clipY) : 100;
  if (Number.isNaN(clipY))
    throw new Error(
      `ClipY must be a number, you passed in "${queryParams.clipY}".`
    );

  const quality = queryParams.quality ? Number(queryParams.quality) : 80;
  if (Number.isNaN(quality))
    throw new Error(
      `Quality must be a number, you passed in "${queryParams.quality}".`
    );

  const format = queryParams.format ?? 'webp';
  if (format != 'webp' && format != 'png' && format != 'jpeg') {
    throw new Error(
      `Format must be "webp", "png", or "jpeg", you passed in "${queryParams.format}".`
    );
  }

  const fullpage = queryParams.fullPage ? Boolean(queryParams.fullPage) : false;

  if (
    queryParams.fullPage &&
    queryParams.fullPage != 'true' &&
    queryParams.fullPage != 'false'
  )
    throw new Error(
      `FullPage must be a "true" or "false", you passed in "${queryParams.fullPage}".`
    );

  const omitBackground = queryParams.omitBackground
    ? Boolean(queryParams.omitBackground)
    : false;

  if (
    queryParams.omitBackground &&
    queryParams.omitBackground != 'true' &&
    queryParams.omitBackground != 'false'
  )
    throw new Error(
      `OmitBackground must be a "true" or "false", you passed in "${queryParams.omitBackground}".`
    );

  const darkMode = queryParams.darkMode ? Boolean(queryParams.darkMode) : false;

  if (
    queryParams.darkMode &&
    queryParams.darkMode != 'true' &&
    queryParams.darkMode != 'false'
  )
    throw new Error(
      `DarkMode must be a "true" or "false", you passed in "${queryParams.darkMode}".`
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
  const width = queryParams.width ? Number(queryParams.width) : 1280;
  if (Number.isNaN(width))
    throw new Error(
      `Width must be a number, you passed in "${queryParams.width}".`
    );

  if (width < 500) {
    throw new Error(
      `Width must be greater than 500, you passed in "${queryParams.width}".`
    );
  }

  if (width > 1280) {
    throw new Error(
      `Width must be less than 1280, you passed in "${queryParams.width}".`
    );
  }

  const height = queryParams.height ? Number(queryParams.height) : 720;
  if (Number.isNaN(height))
    throw new Error(
      `Height must be a number, you passed in "${queryParams.height}".`
    );

  if (height < 500) {
    throw new Error(
      `Height must be greater than 500, you passed in "${queryParams.height}".`
    );
  }

  if (height > 720) {
    throw new Error(
      `Height must be less than 720, you passed in "${queryParams.height}".`
    );
  }

  const scale = queryParams.scale ? Number(queryParams.scale) : 1;
  if (Number.isNaN(scale))
    throw new Error(
      `Scale must be a number, you passed in "${queryParams.scale}".`
    );

  const darkMode = queryParams.darkMode ? Boolean(queryParams.darkMode) : false;

  if (
    queryParams.darkMode &&
    queryParams.darkMode != 'true' &&
    queryParams.darkMode != 'false'
  )
    throw new Error(
      `DarkMode must be a "true" or "false", you passed in "${queryParams.darkMode}".`
    );

  const animation = queryParams.animation ? queryParams.animation : null;

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
        .map((key) => `${key}=${queryParams[key]}`)
        .join('&')
    );
  } else {
    return '';
  }
};
