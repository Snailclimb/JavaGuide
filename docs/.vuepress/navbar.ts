import { navbar } from "vuepress-theme-hope";

export default navbar([
  { text: "面试指南", icon: "java", link: "/home.md" },
  { text: "开源项目", icon: "github", link: "/open-source-project/" },
  { text: "技术书籍", icon: "book", link: "/books/" },
  {
    text: "程序人生",
    icon: "article",
    link: "/high-quality-technical-articles/",
  },
  {
    text: "知识星球",
    icon: "planet",
    children: [
      {
        text: "星球介绍",
        icon: "about",
        link: "/about-the-author/zhishixingqiu-two-years.md",
      },
      {
        text: "星球专属优质专栏",
        icon: "about",
        link: "/zhuanlan/",
      },
      {
        text: "星球优质主题汇总",
        icon: "star",
        link: "https://www.yuque.com/snailclimb/rpkqw1/ncxpnfmlng08wlf1",
      },
    ],
  },
  {
    text: "网站相关",
    icon: "about",
    children: [
      { text: "关于作者", icon: "zuozhe", link: "/about-the-author/" },
      {
        text: "面试突击",
        icon: "pdf",
        link: "https://interview.javaguide.cn/home.html",
      },
      {
        text: "更新历史",
        icon: "history",
        link: "/timeline/",
      },
    ],
  },
]);
