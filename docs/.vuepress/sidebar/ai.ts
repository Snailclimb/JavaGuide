import { arraySidebar } from "vuepress-theme-hope";
import { ICONS } from "./constants.js";

export const ai = arraySidebar([
  {
    text: "大模型基础",
    icon: ICONS.MACHINE_LEARNING,
    prefix: "llm-basis/",
    children: [
      { text: "万字拆解 LLM 运行机制", link: "llm-operation-mechanism" },
      { text: "AI 编程开放性面试题", link: "ai-ide" },
    ],
  },
  {
    text: "AI Agent",
    icon: ICONS.CHAT,
    prefix: "agent/",
    children: [
      { text: "一文搞懂 AI Agent 核心概念", link: "agent-basis" },
      { text: "大模型提示词工程实践指南", link: "prompt-engineering" },
      { text: "上下文工程实战指南", link: "context-engineering" },
      { text: "万字详解 Agent Skills", link: "skills" },
      { text: "万字拆解 MCP 协议", link: "mcp" },
      {
        text: "一文搞懂 Harness Engineering",
        link: "harness-engineering",
      },
    ],
  },
  {
    text: "RAG",
    icon: ICONS.SEARCH,
    prefix: "rag/",
    children: [
      { text: "万字详解 RAG 基础概念", link: "rag-basis" },
      {
        text: "万字详解 RAG 向量索引算法和向量数据库",
        link: "rag-vector-store",
      },
    ],
  },
  {
    text: "AI 编程实战",
    icon: ICONS.CODE,
    prefix: "ai-coding/",
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
    ],
  },
]);
