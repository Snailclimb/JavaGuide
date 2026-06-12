import { arraySidebar } from "vuepress-theme-hope";
import { ICONS } from "./constants.js";

export const aiCoding = arraySidebar([
  {
    text: "AI 编程技巧",
    icon: ICONS.TOOL,
    children: [
      {
        text: "⭐️Vibe Coding 实用技巧总结",
        link: "practices/the-cool-tricks-for-vibe-coding",
      },
      {
        text: "⭐️Claude Code 使用指南",
        link: "practices/claudecode-tips",
      },
      {
        text: "⭐️CLAUDE.md 最佳实践",
        link: "practices/claude-md-best-practices",
      },
      {
        text: "Claude Code 核心命令详解",
        link: "practices/claudecode-commands",
      },
      {
        text: "⭐️AI 编程必备 Skills 推荐",
        link: "practices/programmer-essential-skills",
      },
      {
        text: "OpenAI Codex 最佳实践指南",
        link: "practices/codex-best-practices",
      },
      {
        text: "AI 编程选 CLI 还是 IDE？",
        link: "practices/cli-vs-ide",
      },
      {
        text: "Claude Code Agent View 多会话管理",
        link: "practices/claudecode-agentview",
      },
      {
        text: "AI 编程开放性面试题",
        link: "practices/ai-ide",
      },
      {
        text: "Spec Coding 规范驱动编程",
        link: "practices/spec-coding",
      },
    ],
  },
  {
    text: "AI 编程实战",
    icon: ICONS.CODE,
    children: [
      {
        text: "IDEA + Qoder 插件多场景实战",
        link: "cases/idea-qoder-plugin",
      },
      {
        text: "Trae + MiniMax 多场景实战",
        link: "cases/trae-m2.7",
      },
      {
        text: "Claude Code 接入第三方模型实战",
        link: "cases/cc-glm5.1",
      },
      {
        text: "DeepSeek V4 + Claude Code 实战",
        link: "cases/deepseek-v4-claude-code",
      },
      {
        text: "MiniMax M3 + Claude Code 实战",
        link: "cases/cc-m3",
      },
      {
        text: "Claude Desktop 接入第三方模型实战",
        link: "cases/claude-desktop-cc-switch",
      },
      {
        text: "IDEA + CC GUI 插件实战",
        link: "project/cc-guide",
      },
    ],
  },
]);
