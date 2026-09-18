import { arraySidebar } from "vuepress-theme-hope";
import { ICONS } from "./constants.js";

export const aiCoding = arraySidebar([
  {
    text: "Nhập môn",
    icon: ICONS.BASIC,
    children: [
      {
        text: "Câu hỏi phỏng vấn mở về AI Coding",
        link: "practices/ai-ide",
      },
      {
        text: "AI Coding nên chọn CLI hay IDE?",
        link: "practices/cli-vs-ide",
      },
    ],
  },
  {
    text: "Claude Code và Codex",
    icon: ICONS.CODE,
    children: [
      {
        text: "⭐️Hướng dẫn sử dụng Claude Code",
        link: "practices/claudecode-tips",
      },
      {
        text: "Giải thích chi tiết các lệnh cốt lõi Claude Code",
        link: "practices/claudecode-commands",
      },
      {
        text: "⭐️Hướng dẫn best practice OpenAI Codex",
        link: "practices/codex-best-practices",
      },
      {
        text: "Thay thế OMP bằng Claude Code giao diện đẹp",
        link: "practices/oh-my-pi",
      },
      {
        text: "Cài đặt, cấu hình và mẹo thường dùng cho Ghostty",
        link: "practices/ghostty",
      },
      {
        text: "Quản lý nhiều session với Claude Code Agent View",
        link: "practices/claudecode-agentview",
      },
    ],
  },
  {
    text: "Nguyên lý Claude Code",
    icon: ICONS.CODE,
    prefix: "principles/",
    children: [
      {
        text: "Quản lý context trong Claude Code",
        link: "claude-code-context-management",
      },
      {
        text: "Hệ thống memory của Claude Code",
        link: "claude-code-memory",
      },
      {
        text: "Nguyên lý Claude Code Skills",
        link: "claude-code-skills",
      },
      {
        text: "Nguyên lý Claude Code Hooks",
        link: "claude-code-hooks",
      },
      {
        text: "Cơ chế đa Agent của Claude Code",
        link: "claude-code-multi-agent",
      },
    ],
  },
  {
    text: "Quy chuẩn & tăng hiệu suất",
    icon: ICONS.PERFORMANCE,
    children: [
      {
        text: "⭐️Tổng hợp mẹo thực dụng Vibe Coding",
        link: "practices/the-cool-tricks-for-vibe-coding",
      },
      {
        text: "Spec Coding - lập trình hướng đặc tả",
        link: "practices/spec-coding",
      },
      {
        text: "⭐️Best practice cho CLAUDE.md",
        link: "practices/claude-md-best-practices",
      },
      {
        text: "⭐️Gợi ý các Skills cần có cho AI Coding",
        link: "practices/programmer-essential-skills",
      },
      {
        text: "Lựa chọn và tinh giản Skills cho AI Coding",
        link: "practices/skill-selection-and-pruning",
      },
      {
        text: "Hướng dẫn sử dụng chuyên sâu mattpocock/skills",
        link: "practices/mattpocock-skills",
      },
      {
        text: "Một AI drawing Skill dễ dùng",
        link: "practices/drawio-chart-skill",
      },
    ],
  },
  {
    text: "AI Coding thực chiến",
    icon: ICONS.PROJECT,
    children: [
      {
        text: "Thực chiến đa tình huống plugin IDEA + Qoder",
        link: "cases/idea-qoder-plugin",
      },
      {
        text: "Thực chiến đa tình huống Trae + MiniMax",
        link: "cases/trae-m2.7",
      },
      {
        text: "Thực chiến tích hợp model bên thứ ba vào Claude Code",
        link: "cases/cc-glm5.1",
      },
      {
        text: "Thực chiến DeepSeek V4 + Claude Code",
        link: "cases/deepseek-v4-claude-code",
      },
      {
        text: "Thực chiến MiniMax M3 + Claude Code",
        link: "cases/cc-m3",
      },
      {
        text: "Thực chiến đa tình huống Kimi K3",
        link: "cases/kimi-k3",
      },
      {
        text: "Thực chiến plugin IDEA + CC GUI",
        link: "project/cc-guide",
      },
    ],
  },
]);
