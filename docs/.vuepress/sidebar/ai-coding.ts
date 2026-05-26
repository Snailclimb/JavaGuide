import { arraySidebar } from "vuepress-theme-hope";
import { ICONS } from "./constants.js";

export const aiCoding = arraySidebar([
  {
    text: "AI 编程实战",
    icon: ICONS.CODE,
    children: [
      {
        text: "IDEA + Qoder 插件多场景实战",
        link: "idea-qoder-plugin",
      },
      {
        text: "Trae + MiniMax 多场景实战",
        link: "trae-m2.7",
      },
      {
        text: "Claude Code 接入第三方模型实战",
        link: "cc-glm5.1",
      },
      {
        text: "DeepSeek V4 + Claude Code 实战",
        link: "deepseek-v4-claude-code",
      },
      {
        text: "IDEA + CC GUI 插件实战",
        link: "project/cc-guide",
      },
    ],
  },
  {
    text: "AI 编程技巧",
    icon: ICONS.TOOL,
    children: [
      {
        text: "AI 编程必备 Skills 推荐",
        link: "programmer-essential-skills",
      },
      {
        text: "Claude Code 核心命令详解",
        link: "claudecode-commands",
      },
      {
        text: "Claude Code 使用指南",
        link: "claudecode-tips",
      },
      {
        text: "OpenAI Codex 最佳实践指南",
        link: "codex-best-practices",
      },
      {
        text: "AI 编程选 CLI 还是 IDE？",
        link: "cli-vs-ide",
      },
      {
        text: "Claude Code Agent View 多会话管理",
        link: "practices/claudecode-agentview",
      },
      {
        text: "AI 编程开放性面试题",
        link: "ai-ide",
      },
    ],
  },
]);
