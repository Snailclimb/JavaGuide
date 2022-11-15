import { navbar } from "vuepress-theme-hope";

export const navbarConfig = navbar([
  { text: "面试指南", icon: "java", link: "/home.md" },
  { text: "开源项目", icon: "github", link: "/open-source-project/" },
  { text: "技术书籍", icon: "book", link: "/books/" },
  { text: "技术文章", icon: "article", link: "/high-quality-technical-articles/" },
  {
    text: "网站相关",
    icon: "about",
    children: [
      { text: "关于作者", icon: "zuozhe", link: "/about-the-author/" },
      {
        text: "更新历史",
        icon: "history",
        link: "/timeline/",
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
