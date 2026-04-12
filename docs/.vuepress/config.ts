import { viteBundler } from "@vuepress/bundler-vite";
import { defineUserConfig } from "vuepress";
import theme from "./theme.js";

const siteBase = "/JavaGuide/";
const siteUrl = "https://ltimax.github.io/JavaGuide/";

export default defineUserConfig({
  // GitHub Pages 项目页需要带上仓库名作为基础路径。
  base: siteBase,
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
    ["meta", { property: "og:url", content: siteUrl }],
    ["meta", { name: "apple-mobile-web-app-capable", content: "yes" }],
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
