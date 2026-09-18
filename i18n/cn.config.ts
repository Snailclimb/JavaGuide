// Cấu hình site GỐC tiếng Trung, bọc ngoài docs/.vuepress/config.ts.
//
// Mục đích: thêm nút chuyển ngôn ngữ vào site tiếng Trung mà KHÔNG sửa bất kỳ
// file nào trong docs/ → `git pull` từ repo gốc không bao giờ conflict.
//
// Chạy: npx vuepress dev docs -c i18n/cn.config.ts   (xem Makefile)
import { getDirname, path } from "vuepress/utils";
import baseConfig from "../docs/.vuepress/config.js";
import { langSwitchPlugin } from "./lang-switch/plugin.js";
import { scanViRoutes } from "./lang-switch/vi-routes.mjs";

const __dirname = getDirname(import.meta.url);
const viRoutes = scanViRoutes(path.resolve(__dirname, "../vi"));

export default {
  ...baseConfig,
  plugins: [
    ...(baseConfig.plugins ?? []),
    langSwitchPlugin({ site: "cn", viRoutes, devViPort: 8081 }),
  ],
};
