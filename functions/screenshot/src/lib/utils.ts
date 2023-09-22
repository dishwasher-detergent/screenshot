import { get } from 'https';
import { ScreenshotParams } from '../types/types.js';

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

export const parseScreenshotQueryParams = (
  queryParams: any
): ScreenshotParams => {
  const width = queryParams.width ? Number(queryParams.width) : 1920;
  const height = queryParams.height ? Number(queryParams.height) : 1080;

  const scale = queryParams.scale ? Number(queryParams.scale) : 1;

  const clipX = queryParams.clipX ? Number(queryParams.clipX) : 100;
  const clipY = queryParams.clipY ? Number(queryParams.clipY) : 100;

  let clip = false;

  if (clipX && clipX) clip = true;

  const quality = queryParams.quality ? Number(queryParams.quality) : 80;

  const format = queryParams.format ?? 'webp';

  const fullpage = queryParams.fullPage ? Boolean(queryParams.fullPage) : false;
  const omitBackground = queryParams.omitBackground
    ? Boolean(queryParams.omitBackground)
    : false;
  const darkMode = queryParams.darkMode ? Boolean(queryParams.darkMode) : false;
  const darkModeString = darkMode ? 'dark' : 'light';

  return {
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
};
