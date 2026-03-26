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
      { text: "万字详解 Agent Skills", link: "skills" },
      { text: "万字拆解 MCP 协议", link: "mcp" },
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
]);
