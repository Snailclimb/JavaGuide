import { navbar } from "vuepress-theme-hope";

export default navbar([
  { text: "Backend Development", icon: "mdi:language-java", link: "/home.md" },
  {
    text: "Computer Science cơ bản",
    icon: "mdi:desktop-classic",
    link: "/cs-basics/",
  },
  {
    text: "AI Application Development",
    icon: "mdi:robot-outline",
    link: "/ai/",
  },
  { text: "AI Coding", icon: "mdi:code-tags", link: "/ai-coding/" },
  {
    text: "Đọc thêm",
    icon: "mdi:book-open-page-variant-outline",
    children: [
      { text: "Lộ trình học", icon: "mdi:map-outline", link: "/roadmap/" },
      {
        text: "Project mã nguồn mở",
        icon: "mdi:github",
        link: "/open-source-project/",
      },
      {
        text: "Sách kỹ thuật",
        icon: "mdi:book-open-page-variant-outline",
        link: "/books/",
      },
      {
        text: "Đời lập trình viên",
        icon: "mdi:code-tags",
        link: "/high-quality-technical-articles/",
      },
    ],
  },
  {
    text: "Về website",
    icon: "mdi:information-outline",
    children: [
      {
        text: "Về tác giả",
        icon: "mdi:account-edit-outline",
        link: "/about-the-author/",
      },
      {
        text: "Tải PDF",
        icon: "mdi:file-pdf-box",
        link: "/interview-preparation/pdf-interview-javaguide.md",
      },
      {
        text: "Cấp tốc ôn phỏng vấn",
        icon: "mdi:file-pdf-box",
        link: "https://interview.javaguide.cn/home.html",
      },
      {
        text: "Lịch sử cập nhật",
        icon: "mdi:history",
        link: "/timeline/",
      },
    ],
  },
]);
