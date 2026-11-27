---
title: Java AI 框架专题
description: 从 Spring AI 的一次业务请求出发，理解模型交互、检索、会话记忆、工具调用与应用职责，连接 Java 后端与 AI 应用设计。
category: AI
---

有了模型、RAG 和工具调用的基础，还需要理解这些能力怎样接入已有 Java 应用。本专题先沿着一次业务请求认识 Spring AI，重点解释组件职责、执行顺序和限制。

## 阅读顺序

1. [大模型 API 调用工程实践](../llm-basis/llm-api-engineering.md)：理解请求、流式返回和错误处理。
2. [Spring AI 应用实践：从知识库问答到工具调用](./spring-ai.md)：以售后助手为例，理解 ChatClient、Advisor、Memory、RAG 与工具调用。
3. [AI 应用系统设计](../system-design/ai-application-architecture.md)：把业务权限、任务状态和跨服务协作接入整体链路。

## 常见问题

- ChatClient、ChatModel 与 Advisor 分别负责什么？
- 检索、会话记忆和工具调用的顺序为什么影响结果？
- ChatMemory 为什么不能替代完整聊天历史和审计记录？
- 支持流式输出，是否意味着所有工具都以非阻塞方式执行？

工作流选型与 Spring AI Alibaba Graph 的示例见 [Workflow、Graph 与 Loop](../agent/workflow-graph-loop.md)。该项目与 Spring AI 的 API、版本应分别核对。
