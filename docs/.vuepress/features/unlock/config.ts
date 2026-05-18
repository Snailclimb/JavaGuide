import { PREVIEW_HEIGHT } from "./heights";

const withDefaultHeight = (
  paths: readonly string[],
  height: string = PREVIEW_HEIGHT.XL,
): Record<string, string> =>
  Object.fromEntries(paths.map((path) => [path, height]));

export const unlockConfig = {
  // 版本号变更可强制用户重新验证
  unlockVersion: "v1",
  // 调试用：设为 true 时无视本地已解锁状态，始终触发限制
  forceLock: false,
  code: "8888",
  // 使用相对路径，图片放在 docs/.vuepress/public/images 下
  qrCodeUrl: "/images/qrcode-javaguide.jpg",
  // 路径 -> 可见高度（建议使用 PREVIEW_HEIGHT 预设）
  protectedPaths: {
    ...withDefaultHeight([
      "/java/jvm/memory-area.html",
      "/cs-basics/network/tcp-connection-and-disconnection.html",
      "/cs-basics/network/http-vs-https.html",
      "/cs-basics/network/dns.html",
    ]),
    // 如需特殊高度，再单独覆盖
    // "/some/page.html": PREVIEW_HEIGHT.MEDIUM,
  },
  // 目录前缀 -> 可见高度（该目录下所有文章都触发验证）
  // 例如 "/java/collection/" 会匹配 "/java/collection/**"
  protectedPrefixes: {
    ...withDefaultHeight([
      "/database/",
      "/high-performance/",
      "/java/basis/",
      "/java/collection/",
      "/ai/",
    ]),
  },
} as const;

export { PREVIEW_HEIGHT };
