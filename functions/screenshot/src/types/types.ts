export interface Context {
  req: any;
  res: any;
  log: (msg: any) => void;
  error: (msg: any) => void;
}

export interface MetadataParams {}

export interface Metadata {
  name?: string;
  propety?: string;
  content: string;
}

export interface ScreenshotParams {
  width: number;
  height: number;
  scale: number;
  clip: boolean;
  clipX: number;
  clipY: number;
  quality: number;
  format: 'jpeg' | 'png' | 'webp';
  fullPage: boolean;
  omitBackground: boolean;
  darkMode: boolean;
  darkModeString: 'dark' | 'light';
}

export interface VideoParams {
  width: number;
  height: number;
  scale: number;
  darkMode: boolean;
  darkModeString: 'dark' | 'light';
  animation: string;
}

export interface Animation {
  wait: number;
  top: number;
  left: number;
  behavior: ScrollBehavior;
}
