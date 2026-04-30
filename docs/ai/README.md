---
title: AI 应用开发面试指南
description: 深入浅出掌握 AI 应用开发核心知识，涵盖大模型基础、Agent、RAG、MCP 协议、AI 编程实战等高频面试考点，适合校招/社招 AI 应用开发岗位面试复习。
icon: "ai"
head:
  - - meta
    - name: keywords
      content: AI面试,AI面试指南,AI应用开发,LLM面试,Agent面试,RAG面试,MCP面试,AI编程面试,AI编程实战
---

<!-- @include: @small-advertisement.snippet.md -->

::: tip 持续更新中

这个专栏还在持续更新，后面会补更多高频面试考点。

想了解什么主题，或者发现内容有误，直接在项目 issue 区留言就行。

:::

## 这个专栏能帮你解决什么问题？

很多开发者碰到的困境是：Agent、RAG、MCP 这些概念看了不少，但面试一问就卡壳，要么只知道概念说不清原理，要么知道原理但搭不出东西。

这个专栏就是冲着解决这个问题来的：把 AI 应用开发的核心知识拆透，让你面试能讲清楚，上手能做出来。

### 1. 扎实的大模型基础知识

做 Agent 工作流、调 RAG 检索，最容易踩坑的地方反而是最底层的 LLM 参数。比如：

- 为什么明明设置了温度为 0，结构化输出还是偶尔崩溃？
- 为什么往模型里塞了长文档后，它好像失忆了，忽略了 System Prompt 里的关键指令？
- Token 到底怎么算的？为什么中文和英文的消耗不一样？

这些问题，不搞懂 LLM 的底层原理就永远只能靠玄学调参。在[《万字拆解 LLM 运行机制》](./llm-basis/llm-operation-mechanism.md)中，我把 Token、上下文窗口、Temperature 这些概念还原成了清晰、可控的工程参数。

### 2. AI Agent 知识体系

AI Agent 是当下最热的方向，但网上的资料要么太浅要么太散，很难串起来。[《一文搞懂 AI Agent 核心概念》](./agent/agent-basis.md)把 Agent 从 2022 到 2025 年的六代进化史梳理了一遍，讲清楚 Agent 和传统编程、Workflow 的本质区别，以及 Agent Loop、Context Engineering、Tools 注册这些核心概念。

[《大模型提示词工程实践指南》](./agent/prompt-engineering.md)覆盖了 Prompt 四要素框架（Role + Task + Context + Format）和六大核心技巧：角色扮演、思维链、少样本学习、任务分解、结构化输出、XML 标签与预填充。另外还讲了 Prompt 注入攻击原理和三层防护。

[《上下文工程实战指南》](./agent/context-engineering.md)讲的是 Context Engineering 和 Prompt Engineering 到底差在哪，以及静态规则编排、动态信息挂载、Token 预算降级三个核心技术。长任务的上下文持久化也覆盖了：Compaction、结构化笔记、Sub-agent 三种方案。

### 3. RAG 检索增强生成

RAG 是企业级 AI 应用的核心技术，但很多开发者只停留在”把文档切块、转向量、检索”这个层面，背后的原理没搞懂。

- [《万字详解 RAG 基础概念》](./rag/rag-basis.md)：RAG 是什么、为什么需要它、核心优势和局限性在哪
- [《万字详解 RAG 向量索引算法和向量数据库》](./rag/rag-vector-store.md)：HNSW、IVFFLAT 等索引算法的原理，以及怎么选向量数据库

### 4. 工具与协议

AI 应用开发里，工具接入的碎片化一直是个老大难问题。MCP 协议就是来解决这个的。

[《万字拆解 MCP 协议》](./agent/mcp.md)讲了 MCP 为什么被称为”AI 领域的 USB-C 接口”，四大核心能力和四层分层架构，以及生产环境开发 MCP Server 的最佳实践。

[《万字详解 Agent Skills》](./agent/skills.md)讲清楚 Skills 为什么是”延迟加载”的 sub-agent，它和 Prompt、MCP、Function Calling 的本质区别，以及实战中怎么设计一个优秀的 Skill。

[《一文搞懂 Harness Engineering》](./agent/harness-engineering.md)拆解了 Agent = Model + Harness 这个等式——决定 Agent 天花板的是 Harness 而不是模型。文章覆盖了六层架构、上下文管理的 40% 阈值现象，以及 OpenAI、Anthropic、Stripe 等一线团队的工程化实战经验。

### 5. AI 编程面试准备

AI 编程工具正在改变开发者的工作方式，面试也开始问了：用过什么 AI 编程 IDE？怎么看 AI 对后端开发的影响？程序员的核心竞争力会变成什么？

[《AI 编程开放性面试题》](./llm-basis/ai-ide.md)整理了 7 道高频开放性面试题的回答思路。

### 6. AI 编程实战

光看概念不够，得亲手用过才知道边界在哪。这个系列都是真实场景的实战案例：

- [《IDEA 搭配 Qoder 插件实战》](./ai-coding/idea-qoder-plugin.md)：从接口优化到代码重构，展示如何在 JetBrains IDE 中利用 AI 完成从分析到落地的完整闭环
- [《Trae + MiniMax 多场景实战》](./ai-coding/trae-m2.7.md)：使用 Trae IDE 接入 MiniMax 大模型，通过 Redis 故障排查和跨语言重构场景，分享 AI 辅助编程的实战经验与踩坑心得
- [《Claude Code 接入第三方模型实战》](./ai-coding/cc-glm5.1.md)：通过 Claude Code 接入 GLM-5.1，完成 JVM 智能诊断助手搭建和百万级数据量慢查询治理，分享 AI 辅助编程的工作方法与踩坑经验
- [《Claude Code 使用指南》](./ai-coding/claudecode-tips.md)：整理自 Anthropic 官方技术文档并融合实战经验，系统梳理 Claude Code 的配置、能力扩展、高效工作流与进阶技巧
- [《OpenAI Codex 最佳实践指南》](./ai-coding/codex-best-practices.md)：综合官方文档与实战经验，系统梳理 Codex 云端智能体和 CLI 的提示工程、工具配置与安全策略

## 文章列表

### 大模型基础

- [万字拆解 LLM 运行机制：Token、上下文与采样参数](./llm-basis/llm-operation-mechanism.md) - 深入剖析大模型底层原理，把 Token、上下文窗口、Temperature 等概念还原为清晰、可控的工程概念
- [AI 编程开放性面试题](./llm-basis/ai-ide.md) - 7 道高频开放性面试问题，涵盖 AI 编程 IDE 使用技巧、AI 对后端开发的影响等

### AI Agent

- [一文搞懂 AI Agent 核心概念](./agent/agent-basis.md) - 梳理 AI Agent 六代进化史，掌握 Agent Loop、Context Engineering、Tools 注册等核心概念
- [大模型提示词工程实践指南](./agent/prompt-engineering.md) - 掌握 Prompt 四要素框架、六大核心技巧及企业级安全实践
- [上下文工程实战指南](./agent/context-engineering.md) - 深入理解 Context Engineering 核心概念，掌握静态规则编排、动态信息挂载、Token 预算降级等关键技术
- [万字详解 Agent Skills](./agent/skills.md) - 深入理解 Skills 的设计理念，掌握 Skills 与 Prompt、MCP、Function Calling 的本质区别
- [万字拆解 MCP 协议，附带工程实践](./agent/mcp.md) - 理解 MCP 协议的核心概念、架构设计和生产级最佳实践
- [一文搞懂 Harness Engineering：六层架构、上下文管理与一线团队实战](./agent/harness-engineering.md) - 深度解析 Harness Engineering，拆解 OpenAI、Anthropic、Stripe 等一线团队的 Agent 工程化实战经验

### RAG（检索增强生成）

- [万字详解 RAG 基础概念](./rag/rag-basis.md) - 深入理解 RAG 的工作原理、核心优势和局限性
- [万字详解 RAG 向量索引算法和向量数据库](./rag/rag-vector-store.md) - 掌握 HNSW、IVFFLAT 等索引算法原理，学会选择合适的向量数据库

### AI 编程实战

- [IDEA + Qoder 插件多场景实战：接口优化与代码重构](./ai-coding/idea-qoder-plugin.md) - 通过深分页优化、祖传代码重构两个真实案例，展示 AI 辅助编程的实战效果
- [Trae + MiniMax 多场景实战：Redis 故障排查与跨语言重构](./ai-coding/trae-m2.7.md) - 使用 Trae IDE 接入 MiniMax 大模型，通过 Redis 故障排查和跨语言重构场景，分享 AI 辅助编程的实战经验
- [Claude Code 接入第三方模型实战：JVM 智能诊断与慢查询治理](./ai-coding/cc-glm5.1.md) - 通过 Claude Code 接入 GLM-5.1，完成 JVM 智能诊断助手搭建和百万级数据量慢查询治理
- [Claude Code 使用指南：配置、工作流与进阶技巧](./ai-coding/claudecode-tips.md) - 整理自 Anthropic 官方技术文档并融合实战经验，系统梳理 Claude Code 的使用技巧
- [OpenAI Codex 最佳实践指南：提示工程、工具配置与安全策略](./ai-coding/codex-best-practices.md) - 综合官方文档与实战经验，系统梳理 Codex 的最佳实践

## 配图预览

每篇文章都画了大量配图，挑几张看看：

_Prompt 六大核心技巧_

![六大核心技巧](https://oss.javaguide.cn/github/javaguide/ai/context-engineering/prompt-six-core-techniques.svg)

_上下文窗口组成_

![上下文窗口示意图](https://oss.javaguide.cn/github/javaguide/ai/llm/llm-context-window.png)

_Harness 和 Prompt/Context Engineering 三者不是并列关系，而是嵌套关系。更重要的是，每一层解决的是完全不同的问题：_

![Harness 和 Prompt/Context Engineering 的关系](https://oss.javaguide.cn/github/javaguide/ai/harness/harness-engineering-layers-arch.png)

_MCP 被称为“AI 领域的 USB-C 接口”，统一了 LLM 与外部工具的通信规范_

![MCP 图解](https://oss.javaguide.cn/github/javaguide/ai/skills/mcp-simple-diagram.png)

## 写在最后

专栏持续更新中。觉得有帮助就分享给朋友，有问题直接 issue 留言。

---

![JavaGuide 官方公众号](https://oss.javaguide.cn/github/javaguide/gongzhonghaoxuanchuan.png)
