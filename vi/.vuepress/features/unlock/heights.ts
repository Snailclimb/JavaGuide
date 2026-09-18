export const PREVIEW_HEIGHT = {
  SHORT: "500px",
  MEDIUM: "1000px",
  LONG: "1500px",
  XL: "2000px",
  XXL: "2500px",
} as const;

export type PreviewHeight =
  (typeof PREVIEW_HEIGHT)[keyof typeof PREVIEW_HEIGHT];
