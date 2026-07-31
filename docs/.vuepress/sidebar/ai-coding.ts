import { arraySidebar } from "vuepress-theme-hope";
import { ICONS } from "./constants.js";

export const aiCoding = arraySidebar([
  {
    text: "入门",
    icon: ICONS.BASIC,
    children: [
      {
        text: "AI 编程开放性面试题",
        link: "practices/ai-ide",
      },
      {
        text: "AI 编程选 CLI 还是 IDE？",
        link: "practices/cli-vs-ide",
      },
    ],
  },
  {
    text: "Claude Code 与 Codex",
    icon: ICONS.CODE,
    children: [
      {
        text: "⭐️Claude Code 使用指南",
        link: "practices/claudecode-tips",
      },
      {
        text: "Claude Code 核心命令详解",
        link: "practices/claudecode-commands",
      },
      {
        text: "⭐️OpenAI Codex 最佳实践指南",
        link: "practices/codex-best-practices",
      },
      {
        text: "高颜值 Claude Code 替代 OMP",
        link: "practices/oh-my-pi",
      },
      {
        text: "Ghostty 安装、配置和常见技巧",
        link: "practices/ghostty",
      },
      {
        text: "Claude Code Agent View 多会话管理",
        link: "practices/claudecode-agentview",
      },
    ],
  },
  {
    text: "Claude Code 原理",
    icon: ICONS.CODE,
    prefix: "principles/",
    children: [
      {
        text: "Claude Code 上下文管理",
        link: "claude-code-context-management",
      },
      {
        text: "Claude Code 记忆系统",
        link: "claude-code-memory",
      },
      {
        text: "Claude Code Skills 原理",
        link: "claude-code-skills",
      },
      {
        text: "Claude Code Hooks 原理",
        link: "claude-code-hooks",
      },
      {
        text: "Claude Code 多 Agent 机制",
        link: "claude-code-multi-agent",
      },
    ],
  },
  {
    text: "规范与提效",
    icon: ICONS.PERFORMANCE,
    children: [
      {
        text: "⭐️Vibe Coding 实用技巧总结",
        link: "practices/the-cool-tricks-for-vibe-coding",
      },
      {
        text: "Spec Coding 规范驱动编程",
        link: "practices/spec-coding",
      },
      {
        text: "⭐️CLAUDE.md 最佳实践",
        link: "practices/claude-md-best-practices",
      },
      {
        text: "⭐️AI 编程必备 Skills 推荐",
        link: "practices/programmer-essential-skills",
      },
      {
        text: "AI 编程 Skills 选型与精简",
        link: "practices/skill-selection-and-pruning",
      },
      {
        text: "mattpocock/skills 深度使用指南",
        link: "practices/mattpocock-skills",
      },
      {
        text: "一个好用的 AI 绘图 Skill",
        link: "practices/drawio-chart-skill",
      },
    ],
  },
  {
    text: "AI 编程实战",
    icon: ICONS.PROJECT,
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
        text: "Kimi K3 多场景实战",
        link: "cases/kimi-k3",
      },
      {
        text: "IDEA + CC GUI 插件实战",
        link: "project/cc-guide",
      },
    ],
  },
]);
