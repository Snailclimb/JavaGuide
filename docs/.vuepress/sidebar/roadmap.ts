import { arraySidebar } from "vuepress-theme-hope";
import { ICONS } from "./constants.js";

export const roadmap = arraySidebar([
  {
    text: "学习路线",
    icon: ICONS.ROADMAP,
    children: [
      { text: "学习路线合集（2026）", link: "/roadmap/" },
      {
        text: "Java 后端学习路线（2026）",
        link: "java-roadmap",
      },
      {
        text: "Java/Go 转 AI 路线（2026）",
        link: "java-to-ai-roadmap",
      },
      {
        text: "后端转 AI Agent 建议（2026）",
        link: "backend-to-ai-agent-roadmap",
      },
      {
        text: "后端全栈学习路线（2026）",
        link: "full-stack-roadmap",
      },
      {
        text: "测试开发学习路线（2026）",
        link: "test-development-roadmap",
      },
    ],
  },
]);
