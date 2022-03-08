import { defineNavbarConfig } from "vuepress-theme-hope";

export const navbarConfig = defineNavbarConfig([
  { text: "Java面试指南", icon: "java", link: "/home.md" },
  { text: "Java优质专栏", icon: "recommend", link: "/zhuanlan/" },
  { text: "关于作者", icon: "zuozhe", link: "/about-the-author/" },
  { text: "RSS订阅", icon: "rss", link: "https://javaguide.cn/feed.json" },
]);
