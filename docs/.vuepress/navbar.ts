import { defineNavbarConfig } from "vuepress-theme-hope";

export const navbarConfig = defineNavbarConfig([
  { text: "面试指南", icon: "java", link: "/home.md" },
  { text: "优质专栏", icon: "recommend", link: "/zhuanlan/" },
  { text: "开源项目精选", icon: "github", link: "/open-source-project/" },

  { text: "关于作者", icon: "zuozhe", link: "/about-the-author/" },
  { text: "RSS订阅", icon: "rss", link: "https://javaguide.cn/feed.json" },
]);
