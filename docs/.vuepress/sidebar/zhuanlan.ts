import { arraySidebar } from "vuepress-theme-hope";
import { ICONS } from "./constants.js";

export const zhuanlan = arraySidebar([
  {
    text: "实战项目",
    icon: ICONS.PROJECT,
    collapsible: false,
    children: [
      { text: "Spring AI 智能面试平台", link: "interview-guide" },
      { text: "手写 RPC 框架", link: "handwritten-rpc-framework" },
    ],
  },
  {
    text: "面试资料",
    icon: ICONS.INTERVIEW,
    collapsible: false,
    children: [
      { text: "Java 面试指北", link: "java-mian-shi-zhi-bei" },
      {
        text: "后端高频系统设计&场景题",
        link: "back-end-interview-high-frequency-system-design-and-scenario-questions",
      },
      { text: "Java 必读源码系列", link: "source-code-reading" },
    ],
  },
]);
