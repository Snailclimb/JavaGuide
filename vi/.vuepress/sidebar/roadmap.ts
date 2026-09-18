import { arraySidebar } from "vuepress-theme-hope";
import { ICONS } from "./constants.js";

export const roadmap = arraySidebar([
  {
    text: "Lộ trình học",
    icon: ICONS.ROADMAP,
    children: [
      { text: "Tổng hợp lộ trình học (2026)", link: "/roadmap/" },
      {
        text: "Lộ trình học Java backend (2026)",
        link: "java-roadmap",
      },
      {
        text: "Lộ trình Java/Go chuyển sang AI (2026)",
        link: "java-to-ai-roadmap",
      },
      {
        text: "Gợi ý backend chuyển sang AI Agent (2026)",
        link: "backend-to-ai-agent-roadmap",
      },
      {
        text: "Lộ trình học full-stack cho backend (2026)",
        link: "full-stack-roadmap",
      },
      {
        text: "Lộ trình học Test Development (2026)",
        link: "test-development-roadmap",
      },
    ],
  },
]);
