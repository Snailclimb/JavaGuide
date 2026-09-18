import { getDirname, path } from "vuepress/utils";

const __dirname = getDirname(import.meta.url);

export interface LangSwitchOptions {
  /** Site hiện tại: "cn" = bản gốc tiếng Trung, "vi" = bản dịch tiếng Việt */
  site: "cn" | "vi";
  /** Các route đã có bản dịch VI (chỉ cần cho site "cn" để biết trang nào bật được) */
  viRoutes: string[];
  /**
   * Chỉ cho site "cn" ở chế độ dev: proxy /vi/* sang dev server của site VI.
   * Nhờ đó dev chạy trên MỘT origin duy nhất, nút đổi ngôn ngữ hoạt động y hệt production.
   * Không đặt = không proxy.
   */
  devViPort?: number;
}

/**
 * Chèn nút chuyển ngôn ngữ 中文 | VI vào cả hai site mà KHÔNG phải sửa file nào
 * trong docs/ — nhờ đó pull code mới từ repo gốc không bao giờ conflict.
 */
export const langSwitchPlugin = ({
  site,
  viRoutes,
  devViPort,
}: LangSwitchOptions) => ({
  name: "javaguide-lang-switch",
  clientConfigFile: path.resolve(__dirname, "./client.ts"),
  define: {
    __LANG_SITE__: site,
    __VI_ROUTES__: viRoutes,
  },
  // Dev server của site CN không biết gì về /vi/ (đó là app VuePress riêng).
  // Không proxy thì VuePress router sẽ nuốt /vi/ rồi rewrite thành /vi.html -> 404.
  extendsBundlerOptions: (bundlerOptions: any, app: any) => {
    if (!devViPort || !app.env.isDev) return;
    const vite = (bundlerOptions.viteOptions ??= {});
    const server = (vite.server ??= {});
    const proxy = (server.proxy ??= {});
    proxy["/vi"] = {
      target: `http://localhost:${devViPort}`,
      changeOrigin: true,
      ws: true,
      // Site VI có base "/vi/" nên nó trả 404 cho "/vi" (thiếu dấu / cuối).
      // Thêm dấu / để gõ tay localhost:8080/vi cũng vào được.
      rewrite: (p: string) => (p === "/vi" ? "/vi/" : p),
    };
  },
});
