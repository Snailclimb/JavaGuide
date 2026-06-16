import { arraySidebar } from "vuepress-theme-hope";
import { ICONS } from "./constants.js";

export const roadmap = arraySidebar([
  {
    text: "学习路线",
    icon: ICONS.ROADMAP,
    children: [
      { text: "学习路线合集", link: "/roadmap/" },
      {
        text: "Java 后端学习路线",
        link: "java-roadmap",
      },
      {
        text: "Java/Go 转 AI 应用开发路线",
        link: "java-to-ai-roadmap",
      },
      {
        text: "后端转型 AI Agent 建议",
        link: "backend-to-ai-agent-roadmap",
      },
      {
        text: "后端开发者全栈学习建议",
        link: "full-stack-roadmap",
      },
    ],
  },
]);
