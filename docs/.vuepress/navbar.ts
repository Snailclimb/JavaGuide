import { navbar } from "vuepress-theme-hope";

export default navbar([
  { text: "后端开发", icon: "mdi:language-java", link: "/home.md" },
  { text: "计算机基础", icon: "mdi:desktop-classic", link: "/cs-basics/" },
  { text: "AI应用开发", icon: "mdi:robot-outline", link: "/ai/" },
  { text: "AI编程", icon: "mdi:code-tags", link: "/ai-coding/" },
  {
    text: "推荐阅读",
    icon: "mdi:book-open-page-variant-outline",
    children: [
      { text: "学习路线", icon: "mdi:map-outline", link: "/roadmap/" },
      { text: "开源项目", icon: "mdi:github", link: "/open-source-project/" },
      {
        text: "技术书籍",
        icon: "mdi:book-open-page-variant-outline",
        link: "/books/",
      },
      {
        text: "程序人生",
        icon: "mdi:code-tags",
        link: "/high-quality-technical-articles/",
      },
    ],
  },
  {
    text: "网站相关",
    icon: "mdi:information-outline",
    children: [
      {
        text: "关于作者",
        icon: "mdi:account-edit-outline",
        link: "/about-the-author/",
      },
      {
        text: "PDF下载",
        icon: "mdi:file-pdf-box",
        link: "/interview-preparation/pdf-interview-javaguide.md",
      },
      {
        text: "面试突击",
        icon: "mdi:file-pdf-box",
        link: "https://interview.javaguide.cn/home.html",
      },
      {
        text: "更新历史",
        icon: "mdi:history",
        link: "/timeline/",
      },
    ],
  },
]);
