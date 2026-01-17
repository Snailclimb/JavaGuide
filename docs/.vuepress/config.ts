import { viteBundler } from "@vuepress/bundler-vite";
import { defineUserConfig } from "vuepress";
import theme from "./theme.js";

export default defineUserConfig({
  dest: "./dist",

  title: "JavaGuide",
  description:
    "JavaGuide 是一份面向后端开发/后端面试的学习与复习指南，覆盖 Java、数据库/MySQL、Redis、分布式、高并发、高可用、系统设计等核心知识。",
  lang: "zh-CN",

  head: [
    // meta
    ["meta", { name: "robots", content: "all" }],
    ["meta", { name: "author", content: "Guide" }],
    // [
    //   "meta",
    //   {
    //     name: "keywords",
    //     content:
    //       "JavaGuide, 后端面试, 后端开发, Java面试, Java基础, 并发编程, JVM, 数据库, MySQL, Redis, Spring, 分布式, 高并发, 高性能, 高可用, 系统设计, 消息队列, 缓存, 计算机网络, Linux",
    //   },
    // ],
    // [
    //   "meta",
    //   {
    //     name: "description",
    //     content:
    //       "JavaGuide 是一份面向后端开发/后端面试的学习与复习指南，覆盖 Java、数据库/MySQL、Redis、分布式、高并发、高可用、系统设计等核心知识。",
    //   },
    // ],
    ["meta", { property: "og:site_name", content: "JavaGuide" }],
    ["meta", { property: "og:type", content: "website" }],
    ["meta", { property: "og:locale", content: "zh_CN" }],
    ["meta", { property: "og:url", content: "https://javaguide.cn/" }],
    ["meta", { name: "apple-mobile-web-app-capable", content: "yes" }],
    // 添加百度统计 - 异步加载避免阻塞渲染
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

  pagePatterns: ["**/*.md", "!**/*.snippet.md", "!.vuepress", "!node_modules"],

  shouldPrefetch: false,
  shouldPreload: false,
});
