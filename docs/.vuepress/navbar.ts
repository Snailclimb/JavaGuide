import { defineNavbarConfig } from "vuepress-theme-hope";

export const navbarConfig = defineNavbarConfig([
  { text: "面试指南", icon: "java", link: "/home.md" },
  { text: "优质专栏", icon: "recommend", link: "/zhuanlan/" },
  { text: "开源项目", icon: "github", link: "/open-source-project/" },
  { text: "技术书籍", icon: "book", link: "/books/" },
  { text: "技术文章", icon: "article", link: "/high-quality-technical-articles/" },
  {
    text: "网站相关",
    icon: "about",
    children: [
      { text: "走近作者", icon: "zuozhe", link: "/about-the-author/" },
      {
        text: "网站历史",
        icon: "java",
        link: "/javaguide/history.md",
      },
      {
        text: "旧版入口",
        icon: "java",
        link: "https://snailclimb.gitee.io/javaguide/#/",
      },
      { text: "RSS", icon: "rss", link: "https://javaguide.cn/feed.json" },
    ],
  },
]);
