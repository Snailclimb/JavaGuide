---
title: AI 应用开发面试题专题
description: AI 应用开发面试题与复习路线，围绕大模型基础、AI Agent、RAG、AI 系统设计梳理常见追问，适合 AI 工程师和后端转 AI 岗位。
category: AI
tag:
  - AI
  - AI 面试
  - 后端面试
sidebar: false
---

<!-- @include: @small-advertisement.snippet.md -->

AI 应用开发面试很少只问“概念是什么”。更常见的是顺着一个项目往下追：为什么这样设计，出了问题怎么排查，上线后怎么评测，成本和安全怎么管。

这份 **AI 应用开发面试题专题** 面向 AI 工程师、AI 应用开发和后端转 AI 岗位复习，把“大模型基础、AI Agent、RAG、AI 系统设计”这些问题串成一条复习路线。

## 适合谁看

- 准备 AI 应用开发、AI 工程师、后端转 AI 相关岗位面试的同学。
- 已经看过一些 AI 概念，但回答面试题时容易说散、说浅，或者只停留在 Demo 层面的读者。
- 想把项目经历整理成“问题 -> 原理 -> 方案 -> 取舍 -> 落地”表达方式的开发者。

## 学习重点

- 大模型基础题重点讲清 Token、上下文、采样参数、结构化输出、模型调用和评测。
- Agent 题重点讲清 Agent Loop、Memory、Prompt、Context、MCP、Skills 和工作流。
- RAG 题重点讲清文档处理、向量检索、混合检索、Rerank、GraphRAG、知识库更新和评测。
- 系统设计题重点讲清模型网关、可观测、成本、安全、灰度和实时语音 Agent。

## 建议阅读顺序

1. [AI 应用开发面试指南](./ai-interview-guide.md)：先看总入口，建立整体复习地图。
2. [大模型基础面试题总结](./llm-interview-questions.md)：补齐 LLM 基础概念和 API 调用链路。
3. [AI Agent 面试题总结](./agent-interview-questions.md)：掌握 Agent 相关高频概念和工程化问题。
4. [RAG 面试题总结](./rag-interview-questions.md)：围绕企业知识库问答，复习召回、排序、更新和评测问题。
5. [AI 系统设计面试题总结](./ai-system-design-interview-questions.md)：把前面的模块串成生产级系统设计表达。

## 核心文章

- [AI 应用开发面试指南](./ai-interview-guide.md)：AI 应用开发面试题总入口，按大模型基础、AI Agent、RAG、AI 系统设计组织复习路线。
- [大模型基础面试题总结](./llm-interview-questions.md)：覆盖 Token、上下文窗口、采样参数、API 调用、结构化输出、Function Calling、MCP 与 AI 应用评测。
- [AI Agent 面试题总结](./agent-interview-questions.md)：覆盖 Agent 核心概念、Memory、Prompt Engineering、Context Engineering、MCP、Agent Skills、Harness Engineering 与 AI 工作流。
- [RAG 面试题总结](./rag-interview-questions.md)：覆盖 RAG 基础、Embedding、向量数据库、Chunk 策略、文档处理、检索优化、GraphRAG、知识库更新与 RAG 评测。
- [AI 系统设计面试题总结](./ai-system-design-interview-questions.md)：覆盖生产级架构、模型网关、Prompt 管理、可观测、评测、安全治理与实时语音 Agent。

## 高频问题

- 面试官问“你做过 AI 应用吗”，如何从业务场景、架构、效果评测和上线治理回答？
- 大模型 API 调用为什么需要重试、限流、fallback 和结构化校验？
- Agent 和普通工作流的区别是什么？
- RAG 检索不到、检索错、生成错分别怎么排查？
- AI 应用系统设计如何体现稳定性、可观测性、成本控制和安全治理？

## 相关专题

- [AI 应用开发知识体系](../)
- [大模型基础专题](../llm-basis/)
- [AI Agent 专题](../agent/)
- [RAG 专题](../rag/)

<!-- @include: @article-footer.snippet.md -->
