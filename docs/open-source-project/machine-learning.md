---
title: Java 优质开源 AI 项目
description: Java优质开源AI项目推荐，涵盖Spring AI、LangChain4j、Deeplearning4j等Java人工智能和机器学习框架介绍。
category: 开源项目
icon: a-MachineLearning
---

很多小伙伴私下问我：现在 AI 这么火，咱们写 Java 的是不是只能在旁边看戏？

**说实话，以前确实有点难受。** 毕竟主流的 AI 框架大多是 Python 的天下。但现在，时代变了！随着 Spring AI 以及各种 Java AI 框架的爆发，咱们 Java 开发者完全可以像平时写 CRUD 一样，优雅地把大模型集成到应用里。

今天就带大家盘点一下，目前 Java 生态里最硬核的几个 AI 框架。

## 基础框架

### Spring AI

[Spring AI](https://github.com/spring-projects/spring-ai) 是 Spring 官方亲自下场打造的 AI 应用开发框架 。它的核心哲学非常直观：**将 AI 能力无缝集成到 Spring 生态中** 。

对于习惯了 Spring Boot 的开发者来说，这玩意儿几乎没有学习门槛。它提供了一套构建 AI 应用所需的“底层原子能力抽象” ：

- **模型通信 (ChatClient):** 提供了统一的接口与不同的大语言模型（如 OpenAI GPT、Ollama、Google Gemini）进行对话。
- **提示词 (Prompt):** 结构化地管理和构建发送给模型的提示词。
- **检索增强生成 (RAG):** 通过 `VectorStore` 等抽象，方便地实现 RAG 模式，将外部知识库与模型结合，提升回答的准确性和时效性。
- **工具调用 (Function Calling):** 允许模型调用 Java 应用中定义好的方法，实现与外部世界的交互。
- **记忆 (ChatMemory):** 管理多轮对话的上下文历史。

官方文档：<https://spring.io/projects/spring-ai#learn>。

### Spring AI Alibaba

[Spring AI Alibaba](https://github.com/alibaba/spring-ai-alibaba) 集成 Spring AI 生态，它是一个专为多智能体系统和工作流编排设计的项目。项目从架构上包含如下三层：

![Spring AI Alibaba 架构](https://oss.javaguide.cn/github/javaguide/open-source-project/ai/springai-alibaba-architecture-new.png)

- **Agent Framework**：以 ReactAgent 设计理念为核心的 Agent 开发框架，构建具备自动上下文工程和人机交互能力的 Agent。
- **Graph**：低级别的工作流和多代理协调框架，是 Agent Framework 的底层运行时基座，帮助实现复杂的应用程序编排。
- **Augmented LLM**：基于 Spring AI 底层抽象，提供模型、工具、多模态组件（MCP）、向量存储等基础支持。

另外它还有非常“工程化”的组件：

- **Admin**：一站式 Agent 平台，支持可视化开发、可观测、评估、MCP 管理，甚至与 Dify 等低代码平台集成，支持 DSL 迁移。
- **A2A（Agent-to-Agent）**：支持 Agent 间通信，并可与 Nacos 集成做分布式协调。

官方文档：<https://java2ai.com/>。

### LangChain4j

如果说 Spring AI 是官方正规军，那 [LangChain4j](https://github.com/langchain4j/langchain4j) 就是目前社区里非常强势的 Java LLM 框架，它是 LangChain 的 Java 版本。

它的优势在于功能全面，各种大模型的适配速度快得离谱，但在 Spring 体系里总有一种“外来客”的违和感。

如果你追求“多模型快速切换 + 能力覆盖面广 + 原型推进快”，LangChain4j 通常是第一梯队选择；代价是你需要自己在工程结构、治理、可观测、平台化上多做一点“工程化拼装”。

官方文档：<https://docs.langchain4j.dev/>。

### AgentScope

[AgentScope](https://github.com/agentscope-ai/agentscope-java) 是一个多智能体框架，旨在提供一种简单高效的方式来构建基于大语言模型的智能体应用程序。

如果说大模型（LLM）是 AI 应用的大脑，那么 AgentScope 就是它的“中枢神经系统”和“手脚”。它不仅提供了多智能体协作的架构，还内置了 ReAct 推理、工具调用、记忆管理等核心能力。

AgentScope 提供了 Python 和 Java 版本，二者核心能力完全对齐！

**AgentScope 也是阿里开源的，那和 Spring AI Alibaba 有何不同呢？**

- **AgentScope Java**：原生为 **Agentic（智能体）范式**设计。它的核心是“Agent”，强调的是自主性、推理循环（ReAct）和多智能体之间的复杂博弈与协作。
- **Spring AI Alibaba**：更侧重于 **Workflow（工作流）编排**。它基于 Spring AI 生态，擅长将 AI 能力作为工具融入到预定义的业务流中。

官方文档：<https://java.agentscope.io/zh/intro.html>。

### 其他

- [Solon-AI](https://github.com/opensolon/solon-ai)：Java AI 应用开发框架（支持 LLM，RAG，MCP，Agent），同时兼容 Java8 ~ Java25，支持 SpringBoot、jFinal、Vert.x、Quarkus 等框架。
- [Agent-Flex](https://github.com/agents-flex/agents-flex)：一个优雅的 LLM（大语言模型）应用开发框架，对标 LangChain、使用 Java 开发、简单、轻量。
- [Deeplearning4j](https://github.com/eclipse/deeplearning4j)：Deeplearning4j 是第一个为 Java 和 Scala 编写的商业级，开源，分布式深度学习库。
- [Smile](https://github.com/haifengl/smile)：基于 Java 和 Scala 的机器学习库。
- [GdxAI](https://github.com/libgdx/gdx-ai)：完全用 Java 编写的人工智能框架，用于使用 libGDX 进行游戏开发。

### 对比

| **框架名称**          | **核心特点**                                                                                                       | **适用场景**                                               |
| --------------------- | ------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------- |
| **Spring AI**         | Spring 官方底座：模型/向量库/工具调用/记忆/RAG/可观测/结构化输出；强调可移植与模块化                               | 现有 Spring Boot 企业应用 AI 化                            |
| **Spring AI Alibaba** | 面向 Agentic/Workflow/Multi-agent 的生产级体系：Agent Framework + Graph Runtime + Admin/Studio；支持 MCP/A2A/Nacos | 多智能体编排、复杂工作流、平台化治理与迁移（含可视化）     |
| **LangChain4j**       | 社区强势：统一 API 连接多模型/多向量库；Agents/Tools/RAG；支持 MCP；可集成 Spring/Quarkus/Helidon                  | 快速原型、强灵活性、多模型快速切换                         |
| **Solon-AI**          | Java 8~25 兼容；LLM/RAG/MCP/Agent/Ai Flow 全链路；可嵌入多框架                                                     | 历史系统/多框架场景、追求兼容性与全链路能力                |
| **Agent-Flex**        | 轻量优雅：LLM/Prompt/Tool/MCP/Memory/Embedding/VectorStore/文档处理；OpenTelemetry 可观测                          | 追求简洁上手、可观测的 LLM 应用开发                        |
| **AgentScope Java**   | Agentic 原生：ReAct + Tool + Memory + 多 Agent；MCP+A2A（Nacos）；Reactor 响应式 + GraalVM Serverless              | 自主智能体、分布式多 Agent、对生产可控性与性能要求高的场景 |

## 实战

### 智能面试平台

[interview-guide](https://github.com/Snailclimb/interview-guide) 基于 Spring Boot 4.0 + Java 21 + Spring AI + PostgreSQL + pgvector + RustFS + Redis，实现简历智能分析、AI 模拟面试、知识库 RAG 检索等核心功能。非常适合作为学习和简历项目，学习门槛低。

**系统架构如下**：

> **提示**：架构图采用 draw.io 绘制，导出为 svg 格式，在 Github Dark 模式下的显示效果会有问题。

![](https://oss.javaguide.cn/xingqiu/pratical-project/interview-guide/interview-guide-architecture-diagram.svg)

### AI 工作流编排系统

[PaiAgent](https://github.com/itwanger/PaiAgent) 是一个**企业级的 AI 工作流可视化编排平台**，让 AI 能力的组合和调度变得简单高效。通过直观的拖拽式界面，开发者和业务人员都能快速构建复杂的 AI 处理流程，无需编写代码即可实现多种大模型的协同工作。

**系统架构如下**：

![](https://oss.javaguide.cn/github/javaguide/open-source-project/ai/paiagent-architecture-diagram.jpg)
