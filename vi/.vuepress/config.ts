import { createRequire } from "node:module";
import { viteBundler } from "@vuepress/bundler-vite";
import { defineUserConfig } from "vuepress";
import theme from "./theme.js";
import { langSwitchPlugin } from "../../i18n/lang-switch/plugin.js";

const require = createRequire(import.meta.url);
const mermaidComponentPath = require.resolve(
  "@vuepress/plugin-markdown-chart/client/components/Mermaid.js",
);

export default defineUserConfig({
  // Deploy dưới dạng thư mục con của site gốc: <domain>/vi/
  // Build site gốc TRƯỚC (ra ./dist), rồi build site này (ra ./dist/vi).
  base: "/vi/",
  dest: "./dist/vi",

  title: "JavaGuide (Tiếng Việt)",
  description:
    "JavaGuide là bộ hướng dẫn học và ôn tập dành cho backend development / phỏng vấn backend, bao phủ Java, database/MySQL, Redis, distributed, high concurrency, high availability, system design và các kiến thức cốt lõi khác.",
  lang: "vi-VN",

  head: [
    // meta
    ["meta", { name: "robots", content: "all" }],
    ["meta", { name: "author", content: "Guide" }],
    // [
    //   "meta",
    //   {
    //     name: "keywords",
    //     content:
    //       "JavaGuide, phỏng vấn backend, backend development, phỏng vấn Java, Java Basics, concurrent programming, JVM, database, MySQL, Redis, Spring, distributed, high concurrency, high performance, high availability, system design, message queue, cache, computer network, Linux",
    //   },
    // ],
    // [
    //   "meta",
    //   {
    //     name: "description",
    //     content:
    //       "JavaGuide là bộ hướng dẫn học và ôn tập dành cho backend development / phỏng vấn backend, bao phủ Java, database/MySQL, Redis, distributed, high concurrency, high availability, system design và các kiến thức cốt lõi khác.",
    //   },
    // ],
    ["meta", { name: "apple-mobile-web-app-capable", content: "yes" }],
    // Thêm Baidu Analytics - load bất đồng bộ để tránh chặn render
    [
      "script",
      { defer: true },
      `var _hmt = _hmt || [];
        (function() {
          var hm = document.createElement("script");
          hm.src = "https://hm.baidu.com/hm.js?5dd2e8c97962d57b7b8fea1737c01743";
          hm.async = true;
          var s = document.getElementsByTagName("script")[0]; 
          s.parentNode.insertBefore(hm, s);
        })();`,
    ],
  ],

  bundler: viteBundler({
    viteOptions: {
      resolve: {
        alias: {
          "@vuepress/plugin-markdown-chart/client/components/Mermaid.js":
            mermaidComponentPath,
        },
      },
      css: {
        preprocessorOptions: {
          scss: {
            silenceDeprecations: ["if-function"],
          },
        },
      },
    },
  }),

  theme,

  pagePatterns: [
    "**/*.md",
    "!**/*.snippet.md",
    "!**/TODO.md",
    // File nội bộ của quy trình dịch, không phải nội dung site
    "!PROGRESS.md",
    "!GLOSSARY.md",
    "!.vuepress",
    "!node_modules",
  ],

  // Nút chuyển ngôn ngữ 中文 | VI (dùng chung với site gốc, xem i18n/)
  plugins: [langSwitchPlugin({ site: "vi", viRoutes: [] })],

  shouldPrefetch: false,
  shouldPreload: false,
});
