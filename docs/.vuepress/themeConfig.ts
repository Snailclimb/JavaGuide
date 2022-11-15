import { hopeTheme } from "vuepress-theme-hope";
import { navbarConfig } from "./navbar";
import { sidebarConfig } from "./sidebar";

export const themeConfig = hopeTheme({
  logo: "/logo.png",
  hostname: "https://javaguide.cn/",
  author: {
    name: "Guide",
    url: "https://javaguide.cn/article/",
  },
  repo: "https://github.com/Snailclimb/JavaGuide",
  docsDir: "docs",
  iconAssets: "//at.alicdn.com/t/c/font_2922463_bcn6tjuoz8b.css",
  navbar: navbarConfig,
  sidebar: sidebarConfig,
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
  footer:
    '<a href="https://beian.miit.gov.cn/" target="_blank">鄂ICP备2020015769号-1</a>',
  displayFooter: true,
  plugins: {
    blog: true,
    copyright: true,
    mdEnhance: {
      codetabs: true,
      container: true,
      tasklist: true,
    },
    feed: {
      json: true,
    },
  },
});
