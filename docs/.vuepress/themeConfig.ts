import { defineThemeConfig } from "vuepress-theme-hope";
import { navbarConfig } from "./navbar";
import { sidebarConfig } from "./sidebar";

export default defineThemeConfig({
  logo: "/logo.png",
  hostname: "https://javaguide.cn/",
  author: {
    name: "Guide",
    url: "https://javaguide.cn/article/",
  },
  repo: "https://github.com/Snailclimb/JavaGuide",
  docsDir: "docs",
  iconPrefix: "iconfont icon-",
  pure: true,
  navbar: navbarConfig,
  sidebar: sidebarConfig,
  pageInfo: ["Author", "Category", "Tag", "Date", "Original", "Word"],
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
    blog: {
      autoExcerpt: true,
    },
    mdEnhance: {
      tasklist: true,
    },
    feed: {
      json: true,
    },
    // comment: {
    //   type: "giscus",
    //   repo: "Snailclimb/JavaGuide",
    //   repoId: "MDEwOlJlcG9zaXRvcnkxMzI0NjQzOTU=",
    //   category: "Announcements",
    //   categoryId: "DIC_kwDOB-U_C84COYQF",
    // },
    search: {
      // https://v2.vuepress.vuejs.org/zh/reference/plugin/search.html
      // 排除首页
      isSearchable: (page) => page.path !== "/",
      maxSuggestions: 10,
      hotKeys: ["s", "/"],
      // 用于在页面的搜索索引中添加额外字段
      getExtraFields: () => [],
      locales: {
        "/": {
          placeholder: "搜索",
        },
      },
    },
  },
});
