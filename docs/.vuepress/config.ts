const { defineHopeConfig } = require("vuepress-theme-hope");
import themeConfig from "./themeConfig";

module.exports = defineHopeConfig({
  port: "8080",
  title: "JavaGuide",
  description:
    "「Java学习指北+Java面试指南」一份涵盖大部分 Java 程序员所需要掌握的核心知识。准备 Java 面试，复习 Java 知识点，首选 JavaGuide！  ",
  //指定 vuepress build 的输出目录
  dest: "./dist",
  // 是否开启默认预加载 js
  shouldPrefetch: (file, type) => false,
  head: [
    // meta
    ["meta", { name: "robots", content: "all" }],
    ["meta", { name: "author", content: "Guide" }],
    [
      "meta",
      {
        "http-equiv": "Cache-Control",
        content: "no-cache, no-store, must-revalidate",
      },
    ],
    ["meta", { "http-equiv": "Pragma", content: "no-cache" }],
    ["meta", { "http-equiv": "Expires", content: "0" }],
    [
      "meta",
      {
        name: "keywords",
        content:
          "Java基础, 多线程, JVM, 虚拟机, 数据库, MySQL, Spring, Redis, MyBatis, 系统设计, 分布式, RPC, 高可用, 高并发",
      },
    ],
    ["meta", { name: "apple-mobile-web-app-capable", content: "yes" }],
    // 添加百度统计
    [
      "script",
      {},
      `var _hmt = _hmt || [];
      (function() {
        var hm = document.createElement("script");
        hm.src = "https://hm.baidu.com/hm.js?5dd2e8c97962d57b7b8fea1737c01743";
        var s = document.getElementsByTagName("script")[0]; 
        s.parentNode.insertBefore(hm, s);
      })();`,
    ],
    [
      "link",
      {
        rel: "stylesheet",
        href: "/iconfont/iconfont.css",
      },
    ],
  ],
  locales: {
    "/": {
      lang: "zh-CN",
    },
  },
  themeConfig,
});
