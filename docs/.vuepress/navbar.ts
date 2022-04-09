import { defineNavbarConfig } from "vuepress-theme-hope";

export const navbarConfig = defineNavbarConfig([
  { text: "面试指南", icon: "java", link: "/home.md" },
  { text: "优质专栏", icon: "recommend", link: "/zhuanlan/" },
  { text: "项目精选", icon: "github", link: "/open-source-project/" },
  { text: "书籍精选", icon: "book", link: "/books/" },
  {
    text: "旧版链接",
    icon: "java",
    link: "https://snailclimb.gitee.io/javaguide/#/",
  },
  { text: "RSS订阅", icon: "rss", link: "https://javaguide.cn/feed.json" },
  { text: "关于作者", icon: "zuozhe", link: "/about-the-author/" },
]);
