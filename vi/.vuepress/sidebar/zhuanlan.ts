import { arraySidebar } from "vuepress-theme-hope";
import { ICONS } from "./constants.js";

export const zhuanlan = arraySidebar([
  {
    text: "Project thực chiến",
    icon: ICONS.PROJECT,
    collapsible: false,
    children: [
      {
        text: "Nền tảng phỏng vấn thông minh Spring AI",
        link: "interview-guide",
      },
      { text: "Tự viết RPC framework", link: "handwritten-rpc-framework" },
    ],
  },
  {
    text: "Tài liệu phỏng vấn",
    icon: ICONS.INTERVIEW,
    collapsible: false,
    children: [
      { text: "Java Interview Guide", link: "java-mian-shi-zhi-bei" },
      {
        text: "Câu hỏi System Design & tình huống backend tần suất cao",
        link: "back-end-interview-high-frequency-system-design-and-scenario-questions",
      },
      {
        text: "Java Must-Read Source Code Series",
        link: "source-code-reading",
      },
    ],
  },
]);
