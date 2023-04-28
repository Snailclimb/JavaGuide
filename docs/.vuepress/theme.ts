import { hopeTheme } from "vuepress-theme-hope";

import navbar from "./navbar.js";
import sidebar from "./sidebar/index.js";

export default hopeTheme({
  logo: "/logo.png",
  hostname: "https://javaguide.cn/",

  iconAssets: "//at.alicdn.com/t/c/font_2922463_9aayheyb3v7.css",

  author: {
    name: "Guide",
    url: "https://javaguide.cn/article/",
  },

  repo: "https://github.com/Snailclimb/JavaGuide",
  docsDir: "docs",

  navbar,
  sidebar,
  footer:
    '<a href="https://beian.miit.gov.cn/" target="_blank">鄂ICP备2020015769号-1</a>',
  displayFooter: true,

  pageInfo: [
    "Author",
    "Category",
    "Tag",
    "Date",
    "Original",
    "Word",
    "ReadingTime",
  ],

  blog: {
    intro: "/about-the-author/",
    sidebarDisplay: "mobile",
    medias: {
      Zhihu: "https://www.zhihu.com/people/javaguide",
      Github: "https://github.com/Snailclimb",
      Gitee: "https://gitee.com/SnailClimb",
    },
  },

  plugins: {
    blog: true,
    copyright: true,
    mdEnhance: {
      codetabs: true,
      container: true,
      tasklist: true,
    },
    feed: {
      atom: true,
      json: true,
      rss: true,
    },
  },
});
