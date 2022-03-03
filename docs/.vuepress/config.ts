const { defineHopeConfig } = require("vuepress-theme-hope");
import themeConfig from "./themeConfig";

module.exports = defineHopeConfig({
  port: "8080",
  title: "JavaGuide",
  description: "Java学习&&面试指南",
  //指定 vuepress build 的输出目录
  dest: "./dist",
  // 是否开启默认预加载 js
  shouldPrefetch: (file, type) => false,
  head: [
    // 百度站点验证
    ["meta", { name: "baidu-site-verification", content: "code-IZvTs9l2OK" }],
    [
      "script",
      { src: "https://cdn.jsdelivr.net/npm/react/umd/react.production.min.js" },
    ],
    [
      "script",
      {
        src: "https://cdn.jsdelivr.net/npm/react-dom/umd/react-dom.production.min.js",
      },
    ],
    ["script", { src: "https://cdn.jsdelivr.net/npm/vue/dist/vue.min.js" }],
    [
      "script",
      { src: "https://cdn.jsdelivr.net/npm/@babel/standalone/babel.min.js" },
    ],
    // 添加百度统计
    [
      "script", {},
      `var _hmt = _hmt || [];
      (function() {
        var hm = document.createElement("script");
        hm.src = "https://hm.baidu.com/hm.js?5dd2e8c97962d57b7b8fea1737c01743";
        var s = document.getElementsByTagName("script")[0]; 
        s.parentNode.insertBefore(hm, s);
      })();`
    ],
    [
      "link",
      {
        rel: "stylesheet",
        href: "//at.alicdn.com/t/font_2922463_zpzjti5jsah.css",
      },
    ],
  ],
  locales: {
    "/": {
      lang: "zh-CN"
    }
  },
  themeConfig,
});
