---
title: AI 应用开发面试指南：大模型、Agent、RAG、MCP、Prompt 工程
description: 面向后端开发者的 AI 应用开发面试指南，系统覆盖大模型/LLM、Agent、RAG、MCP 协议、Prompt 工程、AI 系统设计、向量数据库等高频考点，适合校招/社招 AI 工程师和 AI 应用开发岗位复习。
icon: "mdi:robot-outline"
sitemap:
  changefreq: weekly
  priority: 1
head:
  - - meta
    - name: keywords
      content: AI面试,AI面试指南,AI应用开发,AI应用开发面试,AI工程师面试,大模型面试,大模型面试题,LLM面试,LLM面试题,Agent面试,Agent面试题,RAG面试,RAG面试题,MCP面试,MCP面试题,Prompt工程,Prompt工程面试,向量数据库面试,AI系统设计,AI系统设计面试,Spring AI,AI编程面试
  - - meta
    - property: og:title
      content: AI 应用开发面试指南：大模型、Agent、RAG、MCP、Prompt 工程
  - - meta
    - property: og:description
      content: 系统整理 AI 应用开发高频面试考点，覆盖大模型/LLM、Agent、RAG、MCP、Prompt 工程、向量数据库与 AI 系统设计。
---

<!-- @include: @article-header.snippet.md -->

这是一份面向后端开发者的 **AI 应用开发面试指南**，免费开源，涵盖大模型/LLM 面试题、Agent 面试题、RAG 面试题、MCP 协议、Prompt 工程、向量数据库、AI 系统设计等高频考点，对标 [JavaGuide](https://javaguide.cn/home.html) 的质量标准。

如果你正在准备 AI 工程师、AI 应用开发、后端转 AI、Java AI 应用开发相关岗位，这个专栏帮你把零散概念串成一套可复习、可落地的知识体系。

这应该是当前最全面系统的讲解，每一篇都花费了大量时间完善和优化，每篇文章都画了大量配图辅助理解：

![AIGuide 内容概览，大量配图](https://oss.javaguide.cn/github/aiguide/aiguide-overview.png)

发布之后，也是收到了很多读者朋友的好评和推荐。非常感谢，一定会持续用心维护！

![AIGuide 收到了很多读者朋友的好评和推荐](https://oss.javaguide.cn/github/aiguide/ai-guide-received-many-positive-reviews-and-recommendations-from-readers.png)

本站所有内容都已经免费开源，欢迎一起维护完善，有帮助的话，欢迎 Star！

- **项目地址**：<https://github.com/Snailclimb/AIGuide>
- **在线阅读**：<https://javaguide.cn/ai/>

## AI 应用开发面试怎么准备？

很多开发者碰到的困境是：Agent、RAG、MCP 这些概念看了不少，但面试一问就卡壳，要么只知道概念说不清原理，要么知道原理但搭不出东西。

这个专栏就是冲着解决这个问题来的：把 AI 应用开发的核心知识拆透，让你面试能讲清楚，上手能做出来。

如果你想先按面试题快速过一遍，可以直接看这几份模块级总结：

- [AI 应用开发面试指南](./interview-questions/ai-interview-guide.md)：AI 应用开发面试题总入口，适合先建立复习路线。
- [大模型基础面试题总结](./interview-questions/llm-interview-questions.md)：覆盖 Token、上下文窗口、采样参数、API 调用、结构化输出和评测体系。
- [AI Agent 面试题总结](./interview-questions/agent-interview-questions.md)：覆盖 Agent Loop、Memory、Prompt、Context、MCP、Skills、Harness Engineering 和工作流。
- [RAG 面试题总结](./interview-questions/rag-interview-questions.md)：覆盖 RAG 基础、向量数据库、文档处理、检索优化、GraphRAG、知识库更新和评测。
- [AI 系统设计面试题总结](./interview-questions/ai-system-design-interview-questions.md)：覆盖生产级 AI 应用架构、模型网关、可观测、评测、安全治理和实时语音 Agent。

::: tip 持续更新中

这个专栏还在持续更新，后面会补更多高频面试考点。

想了解什么主题，或者发现内容有误，直接在项目 issue 区留言就行。

:::

### 1. 大模型/LLM 基础知识

做 Agent 工作流、调 RAG 检索，最容易踩坑的地方反而是最底层的 LLM 参数。比如：

- 为什么明明设置了温度为 0，结构化输出还是偶尔崩溃？
- 为什么往模型里塞了长文档后，它好像失忆了，忽略了 System Prompt 里的关键指令？
- Token 到底怎么算的？为什么中文和英文的消耗不一样？

这些问题，不搞懂 LLM 的底层原理就永远只能靠玄学调参。在[《万字拆解 LLM 运行机制》](./llm-basis/llm-operation-mechanism.md)中，我把 Token、上下文窗口、Temperature 这些概念还原成了清晰、可控的工程参数。

搞懂原理后，还需要知道怎么把这些模型调用落地到生产。[《大模型 API 调用工程实践》](./llm-basis/llm-api-engineering.md)系统拆解了一条完整的调用链路：业务入口 → Prompt 组装 → 模型网关 → 流式响应 → 重试限流 → 结构化返回，从 Demo 到生产级应用的核心知识点全覆盖。

[《大模型结构化输出详解》](./llm-basis/structured-output-function-calling.md)深入拆解 JSON Schema、Function Calling、Tool Calling 与 MCP 的底层链路，结合 Java 后端示例讲清楚 Schema 设计、服务端校验、工具分发和安全治理。

有了调用链路和结构化输出基础，还有一个问题没有解决：怎么知道你的 AI 应用到底好不好？[《AI 应用评测体系：从 Golden Set 构建到线上灰度闭环》](./llm-basis/llm-evaluation.md)系统拆解了评测的完整闭环：Golden Set 怎么构建、LLM-as-Judge 的三类偏差怎么管控、RAG 的检索指标和生成指标如何分段评测、Agent 轨迹准确率如何衡量、离线评测到线上灰度怎么串成一条发布流水线。

### 2. AI Agent 知识体系

AI Agent 是当下最热的方向，但网上的资料要么太浅要么太散，很难串起来。[《一文搞懂 AI Agent 核心概念》](./agent/agent-basis.md)把 Agent 从 2022 到 2025 年的六代进化史梳理了一遍，讲清楚 Agent 和传统编程、Workflow 的本质区别，以及 Agent Loop、Context Engineering、Tools 注册这些核心概念。

[《AI Agent 记忆系统》](./agent/agent-memory.md)深入讲解短期记忆与长期记忆的设计原理，涵盖记忆存储形式与功能分类、生命周期操作、主流技术架构对比及生产级工程优化策略。

[《大模型提示词工程实践指南》](./agent/prompt-engineering.md)覆盖了 Prompt 四要素框架（Role + Task + Context + Format）和六大核心技巧：角色扮演、思维链、少样本学习、任务分解、结构化输出、XML 标签与预填充。另外还讲了 Prompt 注入攻击原理和三层防护。

[《上下文工程实战指南》](./agent/context-engineering.md)讲的是 Context Engineering 和 Prompt Engineering 到底差在哪，以及静态规则编排、动态信息挂载、Token 预算降级三个核心技术。长任务的上下文持久化也覆盖了：Compaction、结构化笔记、Sub-agent 三种方案。

[《AI 工作流中的 Workflow、Graph 与 Loop》](./agent/workflow-graph-loop.md)拆解了为什么“把几个 Prompt 用 if-else 串起来”不够用——LLM 输出天然不确定，单次生成往往不达标，工具调用随时可能失败。文章讲清楚 Workflow、Graph、Loop 三个核心概念如何协作，覆盖 Node/Edge/State 设计原则、安全边界三要素，以及 Spring AI Alibaba 和 LangGraph 的完整代码实现。

### 3. RAG 检索增强生成

RAG 是企业级 AI 应用的核心技术，但很多开发者只停留在“把文档切块、转向量、检索”这个层面，背后的原理没搞懂。

- [《万字详解 RAG 基础概念》](./rag/rag-basis.md)：RAG 是什么、为什么需要它、核心优势和局限性在哪
- [《万字详解 RAG 向量索引算法和向量数据库》](./rag/rag-vector-store.md)：HNSW、IVFFLAT 等索引算法的原理，以及怎么选向量数据库
- [《万字详解 GraphRAG》](./rag/graphrag.md)：知识图谱驱动的 RAG，深入解析实体、关系、社区发现、全局检索与局部检索
- [《万字详解 RAG 检索优化》](./rag/rag-optimization.md)：Chunk 策略、Hybrid Search、Query Rewrite、Rerank、上下文压缩等实战优化
- [《RAG 文档处理与切分策略》](./rag/rag-document-processing.md)：从文档解析、清洗、Chunking 到多模态内容处理的完整链路拆解
- [《RAG 知识库文档更新策略》](./rag/rag-knowledge-update.md)：增量更新、版本控制、去重与全量重建的工程实践

### 4. MCP 协议与工具调用

AI 应用开发里，工具接入的碎片化一直是个老大难问题。MCP 协议就是来解决这个的。

[《万字拆解 MCP 协议》](./agent/mcp.md)讲了 MCP 为什么被称为“AI 领域的 USB-C 接口”，四大核心能力和四层分层架构，以及生产环境开发 MCP Server 的最佳实践。

[《万字详解 Agent Skills》](./agent/skills.md)讲清楚 Skills 为什么是“延迟加载”的 sub-agent，它和 Prompt、MCP、Function Calling 的本质区别，以及实战中怎么设计一个优秀的 Skill。

[《一文搞懂 Harness Engineering》](./agent/harness-engineering.md)拆解了 Agent = Model + Harness 这个等式——决定 Agent 天花板的是 Harness 而不是模型。文章覆盖了六层架构、上下文管理的 40% 阈值现象，以及 OpenAI、Anthropic、Stripe 等一线团队的工程化实战经验。

### 5. AI 应用系统设计

很多团队能把 Prompt Demo 跑起来，但上了生产才发现：同一个问题今天答对明天答偏；Token 账单飙升没人知道钱花在哪；出了事故，只能从一堆日志里猜模型当时看到了什么。分水岭就在这里——**Prompt Demo 证明的是模型能回答，生产系统要证明的是系统能长期、稳定、可控地回答**。

[《AI 应用系统设计：从 Prompt Demo 到生产级架构》](./system-design/ai-application-architecture.md)深入拆解生产必须面对的每个环节：Prompt 管理、模型网关、RAG、Memory、Tool 调用、异步任务、可观测性、评测闭环、安全合规，以及对应的 Java 后端落地方案。

[《大模型网关详解：多模型路由、fallback、限流与成本控制》](./system-design/llm-gateway.md)聚焦模型调用治理这一层，讲清楚 LLM Gateway 和 LLM Router 的区别，以及多模型路由、Token 预算、fallback、成本归因、观测审计、缓存和主流方案选型。

AI 语音是另一个快速落地的方向，面试里也开始出现相关题目。[《AI 语音技术详解：从 ASR、TTS 到实时语音 Agent 的工程化落地》](./system-design/ai-voice.md)拆解了语音系统的完整链路——音频采集、VAD、ASR、LLM、TTS、流式播放、打断处理，以及云端 API、本地模型、端云混合的真实选型逻辑。

### 6. AI 编程

面试里关于 AI 编程工具的问题越来越多：用过什么 AI 编程 IDE？Claude Code 和 Cursor 怎么选？AI 对后端开发者核心竞争力有什么影响？

Claude Code、Cursor、Codex 等工具的使用实战、面试准备与效率技巧，详见 [AI 编程](../ai-coding/) 专栏。

## 文章列表

### 面试题

- [AI 应用开发面试指南](./interview-questions/ai-interview-guide.md) - AI 应用开发面试题总入口，按大模型基础、AI Agent、RAG、AI 系统设计组织复习路线
- [大模型基础面试题总结](./interview-questions/llm-interview-questions.md) - 系统整理大模型/LLM 高频面试题，覆盖 Token、上下文窗口、采样参数、API 调用、结构化输出、Function Calling、MCP 与 AI 应用评测
- [AI Agent 面试题总结](./interview-questions/agent-interview-questions.md) - 系统整理 AI Agent 高频面试题，覆盖 Agent 核心概念、Memory、Prompt Engineering、Context Engineering、MCP、Agent Skills、Harness Engineering 与 AI 工作流
- [RAG 面试题总结](./interview-questions/rag-interview-questions.md) - 系统整理 RAG 高频面试题，覆盖 RAG 基础、Embedding、向量数据库、Chunk 策略、文档处理、检索优化、GraphRAG、知识库更新与 RAG 评测
- [AI 系统设计面试题总结](./interview-questions/ai-system-design-interview-questions.md) - 系统整理 AI 应用系统设计高频面试题，覆盖生产级架构、模型网关、Prompt 管理、可观测、评测、安全治理与实时语音 Agent

### 大模型基础

- [万字拆解 LLM 运行机制：Token、上下文与采样参数](./llm-basis/llm-operation-mechanism.md) - 深入剖析大模型底层原理，把 Token、上下文窗口、Temperature 等概念还原为清晰、可控的工程概念
- [大模型 API 调用工程实践：流式输出、重试、限流与结构化返回](./llm-basis/llm-api-engineering.md) - 系统拆解 AI 应用调用大模型 API 的生产链路，覆盖流式输出、重试、限流、结构化返回与 Java 后端落地
- [大模型结构化输出详解：JSON Schema、Function Calling 与工具调用](./llm-basis/structured-output-function-calling.md) - 深入拆解 JSON Schema、Function Calling、Tool Calling 与 MCP 的底层链路，结合 Java 后端示例讲清楚 Schema 设计、服务端校验、工具分发和安全治理
- [AI 应用评测体系：从 Golden Set 构建到线上灰度闭环](./llm-basis/llm-evaluation.md) - 系统拆解 AI 应用评测完整闭环，覆盖 Golden Set 构建、LLM-as-Judge 偏差控制、RAG/Agent/结构化输出分领域指标体系、Trace 回放与 CI 自动回归落地

### AI Agent

- [一文搞懂 AI Agent 核心概念](./agent/agent-basis.md) - 梳理 AI Agent 六代进化史，掌握 Agent Loop、Context Engineering、Tools 注册等核心概念
- [AI Agent 记忆系统](./agent/agent-memory.md) - 深入理解短期记忆与长期记忆设计，掌握记忆存储形式、生命周期操作与生产级工程优化策略
- [大模型提示词工程实践指南](./agent/prompt-engineering.md) - 掌握 Prompt 四要素框架、六大核心技巧及企业级安全实践
- [上下文工程实战指南](./agent/context-engineering.md) - 深入理解 Context Engineering 核心概念，掌握静态规则编排、动态信息挂载、Token 预算降级等关键技术
- [万字详解 Agent Skills](./agent/skills.md) - 深入理解 Skills 的设计理念，掌握 Skills 与 Prompt、MCP、Function Calling 的本质区别
- [万字拆解 MCP 协议，附带工程实践](./agent/mcp.md) - 理解 MCP 协议的核心概念、架构设计和生产级最佳实践
- [一文搞懂 Harness Engineering：六层架构、上下文管理与一线团队实战](./agent/harness-engineering.md) - 深度解析 Harness Engineering，拆解 OpenAI、Anthropic、Stripe 等一线团队的 Agent 工程化实战经验
- [AI 工作流中的 Workflow、Graph 与 Loop：从概念到实现](./agent/workflow-graph-loop.md) - 深度解析 Workflow、Graph、Loop 三大核心概念，对比传统工作流与 AI 工作流的差异，覆盖 Spring AI Alibaba 和 LangGraph 完整代码实现

### RAG（检索增强生成）

- [万字详解 RAG 基础概念](./rag/rag-basis.md) - 深入理解 RAG 的工作原理、核心优势和局限性
- [万字详解 RAG 向量索引算法和向量数据库](./rag/rag-vector-store.md) - 掌握 HNSW、IVFFLAT 等索引算法原理，学会选择合适的向量数据库
- [万字详解 GraphRAG](./rag/graphrag.md) - 深入理解知识图谱驱动的 RAG，掌握实体、关系、社区发现、全局检索与局部检索
- [万字详解 RAG 检索优化](./rag/rag-optimization.md) - 掌握 Chunk 策略、Hybrid Search、Query Rewrite、Rerank、上下文压缩等实战优化
- [RAG 文档处理与切分策略：从解析、清洗、Chunking 到多模态内容处理](./rag/rag-document-processing.md) - 深入解析 RAG 文档进入索引前的完整链路，涵盖文件解析、清洗、结构化、Chunking 策略与多模态内容处理
- [RAG 知识库文档更新策略：增量更新、版本控制、去重与全量重建](./rag/rag-knowledge-update.md) - 深入解析 RAG 知识库更新的工程实践，涵盖增量更新、版本回滚、去重与灰度发布

### AI 系统设计

- [AI 应用系统设计：从 Prompt Demo 到生产级架构](./system-design/ai-application-architecture.md) - 覆盖 Prompt 管理、模型网关、RAG、Memory、Tool 调用、异步任务、可观测性、评测、安全合规等生产环节，拆解 Demo 和生产系统的本质差距
- [大模型网关详解：多模型路由、fallback、限流与成本控制](./system-design/llm-gateway.md) - 深入拆解 LLM Gateway 的模型路由、fallback、限流配额、Token 预算、成本归因、观测审计、缓存策略和主流方案选型
- [AI 语音技术详解：从 ASR、TTS 到实时语音 Agent 的工程化落地](./system-design/ai-voice.md) - 深入拆解语音系统完整链路，涵盖 VAD、ASR、TTS、流式播放、打断处理与端云混合选型

## 配图预览

每篇文章都画了大量配图，挑几张看看：

_AI Agent 核心架构_

![AI Agent 核心架构](https://oss.javaguide.cn/github/javaguide/ai/agent/agent-core-arch.png)

_Agent Loop 工作流程_

![Agent Loop 工作流程](https://oss.javaguide.cn/github/javaguide/ai/agent/agent-loop-flow.png)

_Harness 和 Prompt/Context Engineering 的关系：_

![Harness 和 Prompt/Context Engineering 的关系](https://oss.javaguide.cn/github/javaguide/ai/harness/harness-engineering-layers-arch.png)

_Agent 记忆分类全景图：_

![Agent 记忆分类全景图](https://oss.javaguide.cn/github/javaguide/ai/agent/agent-memory-memory-taxonomy.svg)

## 写在最后

专栏持续更新中。觉得有帮助就分享给朋友，有问题直接 issue 留言。

---

![JavaGuide 官方公众号](https://oss.javaguide.cn/github/javaguide/gongzhonghaoxuanchuan.png)
