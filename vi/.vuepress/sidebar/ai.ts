import { arraySidebar } from "vuepress-theme-hope";
import { ICONS } from "./constants.js";

export const ai = arraySidebar([
  {
    text: "Tổng quan nhập môn",
    icon: ICONS.BASIC,
    children: [
      { text: "⭐️Tổng quan khái niệm cốt lõi AI", link: "ai-core-concepts" },
    ],
  },
  {
    text: "Câu hỏi phỏng vấn",
    icon: ICONS.INTERVIEW,
    prefix: "interview-questions/",
    children: [
      {
        text: "⭐️Hướng dẫn phỏng vấn AI Application Development",
        link: "ai-interview-guide",
      },
      {
        text: "Tổng hợp câu hỏi phỏng vấn nền tảng LLM",
        link: "llm-interview-questions",
      },
      {
        text: "Tổng hợp câu hỏi phỏng vấn AI Agent",
        link: "agent-interview-questions",
      },
      {
        text: "Thực chiến phỏng vấn project Agent",
        link: "agent-project-interview-guide",
      },
      {
        text: "Tổng hợp câu hỏi phỏng vấn RAG",
        link: "rag-interview-questions",
      },
      {
        text: "Tổng hợp câu hỏi phỏng vấn AI System Design",
        link: "ai-system-design-interview-questions",
      },
    ],
  },
  {
    text: "Nền tảng LLM",
    icon: ICONS.MACHINE_LEARNING,
    prefix: "llm-basis/",
    children: [
      {
        text: "Mổ xẻ cơ chế vận hành LLM (vạn chữ)",
        link: "llm-operation-mechanism",
      },
      { text: "Thực hành kỹ thuật gọi LLM API", link: "llm-api-engineering" },
      {
        text: "Giải thích chi tiết structured output của LLM",
        link: "structured-output-function-calling",
      },
      { text: "Hệ thống đánh giá ứng dụng AI", link: "llm-evaluation" },
    ],
  },
  {
    text: "AI Agent",
    icon: ICONS.CHAT,
    prefix: "agent/",
    children: [
      {
        text: "⭐️Giải thích chi tiết khái niệm cốt lõi AI Agent",
        link: "agent-basis",
      },
      {
        text: "⭐️Giải thích chi tiết hệ thống memory của AI Agent",
        link: "agent-memory",
      },
      { text: "Thiết kế hệ thống đa Agent phối hợp", link: "multi-agent" },
      {
        text: "Hướng dẫn thực chiến Prompt Engineering",
        link: "prompt-engineering",
      },
      {
        text: "Hướng dẫn thực chiến Context Engineering",
        link: "context-engineering",
      },
      { text: "Giải thích chi tiết Agent Skills (vạn chữ)", link: "skills" },
      { text: "Mổ xẻ giao thức MCP (vạn chữ)", link: "mcp" },
      {
        text: "Giải thích chi tiết Harness Engineering",
        link: "harness-engineering",
      },
      { text: "Giải thích chi tiết AI workflow", link: "workflow-graph-loop" },
      {
        text: "Giải thích chi tiết Loop Engineering",
        link: "loop-engineering",
      },
    ],
  },
  {
    text: "RAG",
    icon: ICONS.SEARCH,
    prefix: "rag/",
    children: [
      {
        text: "⭐️Giải thích chi tiết khái niệm cơ bản RAG",
        link: "rag-basis",
      },
      {
        text: "Xử lý tài liệu và chiến lược chunking trong RAG",
        link: "rag-document-processing",
      },
      {
        text: "⭐️Thuật toán vector index và vector database trong RAG",
        link: "rag-vector-store",
      },
      {
        text: "Chiến lược cập nhật tài liệu knowledge base RAG",
        link: "rag-knowledge-update",
      },
      { text: "Giải thích chi tiết GraphRAG", link: "graphrag" },
      { text: "Tối ưu retrieval trong RAG", link: "rag-optimization" },
    ],
  },
  {
    text: "AI System Design",
    icon: ICONS.DESIGN,
    prefix: "system-design/",
    children: [
      {
        text: "System Design cho ứng dụng AI",
        link: "ai-application-architecture",
      },
      { text: "Thực chiến bảo mật LLM/Agent", link: "llm-security" },
      { text: "Giải thích chi tiết LLM Gateway", link: "llm-gateway" },
      { text: "AI Observability và Trace", link: "ai-observability" },
      { text: "Giải thích chi tiết công nghệ AI voice", link: "ai-voice" },
    ],
  },
]);
