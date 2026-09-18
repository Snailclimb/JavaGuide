import { PREVIEW_HEIGHT } from "./heights";

const withDefaultHeight = (
  paths: readonly string[],
  height: string = PREVIEW_HEIGHT.XL,
): Record<string, string> =>
  Object.fromEntries(paths.map((path) => [path, height]));

export const unlockConfig = {
  // Đổi số phiên bản sẽ buộc người dùng xác minh lại
  unlockVersion: "v1",
  // Dùng để debug: đặt true sẽ bỏ qua trạng thái đã mở khoá cục bộ, luôn kích hoạt giới hạn
  forceLock: false,
  code: "8888",
  // Dùng đường dẫn tương đối, ảnh đặt trong vi/.vuepress/public/images
  qrCodeUrl: "/images/qrcode-javaguide.jpg",
  // Đường dẫn -> chiều cao hiển thị (khuyến nghị dùng preset PREVIEW_HEIGHT)
  protectedPaths: {
    ...withDefaultHeight([
      "/java/jvm/memory-area.html",
      "/cs-basics/network/tcp-connection-and-disconnection.html",
      "/cs-basics/network/http-vs-https.html",
      "/cs-basics/network/dns.html",
    ]),
    // Nếu cần chiều cao đặc biệt thì ghi đè riêng
    // "/some/page.html": PREVIEW_HEIGHT.MEDIUM,
  },
  // Prefix thư mục -> chiều cao hiển thị (mọi bài trong thư mục này đều kích hoạt xác minh)
  // Ví dụ "/java/collection/" sẽ khớp "/java/collection/**"
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
