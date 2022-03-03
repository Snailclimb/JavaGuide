import { defineNavbarConfig } from "vuepress-theme-hope";

export const navbarConfig = defineNavbarConfig([
  { text: "Java面试指南", icon: "java", link: "/home" },
  {
    text: "Java面试指北",
    icon: "recommend",
    link: "https://www.yuque.com/docs/share/f37fc804-bfe6-4b0d-b373-9c462188fec7",
  },
  {
    text: "官方知识星球",
    icon: "recommend",
    link: "https://www.yuque.com/docs/share/8a30ffb5-83f3-40f9-baf9-38de68b906dc",
  },
  { text: "关于作者", icon: "zuozhe", link: "/about-the-author/" },
]);
