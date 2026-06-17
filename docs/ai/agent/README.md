---
title: AI Agent 专题：Agent Loop、Memory、Prompt、Context、MCP 与 Skills
description: AI Agent 面试与学习路线，涵盖 Agent Loop、Memory、Prompt Engineering、Context Engineering、MCP、Agent Skills、Harness Engineering 和 AI 工作流。
category: AI
tag:
  - AI Agent
  - 大模型
  - AI 应用开发
sidebar: false
---

<!-- @include: @small-advertisement.snippet.md -->

Agent 不是“会调用工具的聊天机器人”。一旦任务变长，它就要处理状态、记忆、权限、失败重试、上下文裁剪和执行边界。

这份 **AI Agent 专题** 面向想理解和落地 Agent 应用的开发者，把 Agent Loop、Memory、Prompt、Context、Tools、MCP、Skills、Harness Engineering 和 Workflow 放到同一条工程主线里看。

## 适合谁看

- 想理解 AI Agent 原理和工程落地方式的开发者。
- 正在做工具调用、自动化任务、多轮推理、长任务执行相关 AI 应用的工程师。
- 准备 Agent、MCP、Prompt、Context、Skills、工作流相关面试题的同学。

## 学习重点

- Agent 和 Workflow 的区别不在于有没有调用大模型，而在于是否具备观察、规划、行动和反馈闭环。
- Memory 解决跨轮、跨任务的信息保留问题，但必须设计生命周期、存储边界和隐私治理。
- Prompt Engineering 更关注指令表达，Context Engineering 更关注把正确的信息在正确时机放进上下文。
- MCP、Skills、Harness Engineering 决定 Agent 能不能稳定、安全、可扩展地接入真实工具和环境。

## 建议阅读顺序

1. [一文搞懂 AI Agent 核心概念](./agent-basis.md)：先建立 Agent 的整体认知。
2. [大模型提示词工程实践指南](./prompt-engineering.md)、[上下文工程实战指南](./context-engineering.md)：理解指令和上下文如何共同影响输出。
3. [AI Agent 记忆系统](./agent-memory.md)：补齐短期记忆、长期记忆和记忆生命周期。
4. [万字拆解 MCP 协议](./mcp.md)、[万字详解 Agent Skills](./skills.md)：理解工具接入和能力扩展。
5. [一文搞懂 Harness Engineering](./harness-engineering.md)、[AI 工作流中的 Workflow、Graph 与 Loop](./workflow-graph-loop.md)、[Loop Engineering 是什么](./loop-engineering.md)：进入生产级 Agent 工程化。

## 核心文章

- [一文搞懂 AI Agent 核心概念](./agent-basis.md)：梳理 AI Agent 的演进脉络，讲清 Agent Loop、Context Engineering、Tools 注册等基础概念。
- [AI Agent 记忆系统](./agent-memory.md)：深入理解短期记忆与长期记忆设计，掌握记忆存储形式、生命周期操作与生产级工程优化策略。
- [大模型提示词工程实践指南](./prompt-engineering.md)：从 Prompt 四要素、常见技巧讲到企业级安全实践。
- [上下文工程实战指南](./context-engineering.md)：掌握静态规则编排、动态信息挂载、Token 预算降级等关键技术。
- [万字详解 Agent Skills](./skills.md)：理解 Skills 的设计理念，以及 Skills 与 Prompt、MCP、Function Calling 的本质区别。
- [万字拆解 MCP 协议](./mcp.md)：理解 MCP 协议的核心概念、架构设计和生产级最佳实践。
- [一文搞懂 Harness Engineering](./harness-engineering.md)：拆解 OpenAI、Anthropic、Stripe 等团队在 Agent 工程化上的实践思路。
- [AI 工作流中的 Workflow、Graph 与 Loop](./workflow-graph-loop.md)：对比传统工作流与 AI 工作流的差异，覆盖 Spring AI Alibaba 和 LangGraph 实现。
- [Loop Engineering 是什么？为什么说它是新瓶装旧酒？](./loop-engineering.md)：把 Loop Engineering 放回 Agent Loop、Context、Harness、Skills、MCP 和验证闭环里，理解它到底新在哪里。

## 高频问题

- Agent 和 Workflow、Chatbot、普通工具调用有什么区别？
- Agent Loop 中观察、规划、行动、反思分别负责什么？
- Memory 应该存什么、不存什么？如何避免污染和隐私风险？
- Prompt Engineering 和 Context Engineering 为什么不能混为一谈？
- MCP、Skills、Function Calling 的边界分别在哪里？
- 长任务 Agent 如何控制上下文、权限、失败重试和可观测性？

## 相关专题

- [AI 应用开发知识体系](../)
- [大模型基础专题](../llm-basis/)
- [RAG 专题](../rag/)
- [AI 应用开发面试题专题](../interview-questions/)

<!-- @include: @article-footer.snippet.md -->
