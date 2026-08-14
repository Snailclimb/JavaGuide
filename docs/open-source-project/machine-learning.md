---
title: Java 优质开源 AI 项目
description: Java优质开源AI项目推荐，涵盖Spring AI、LangChain4j、AgentScope、LangGraph4j、DJL等Java人工智能框架和工具。
category: 开源项目
icon: "mdi:robot-outline"
---

如果你主要使用 Spring Boot，现在要考虑的已经不是“Java 能不能开发 AI 应用”，而是项目需要模型接入、RAG、Agent 编排，还是直接在 JVM 中运行模型。

这些项目解决的问题并不完全相同。Spring AI、LangChain4j 偏模型与应用集成；AgentScope、LangGraph4j 和 Embabel 更关注 Agent 运行与编排；DJL 则用于模型推理和训练。选型前先分清层次，会比只对比功能数量更有效。

## 基础框架

### Spring AI

[Spring AI](https://github.com/spring-projects/spring-ai) 是 Spring 官方的 AI 应用开发框架，目标是用 Spring 风格的抽象接入模型、向量数据库和工具调用等能力。

对于已有 Spring Boot 项目，它的接入方式相对自然，主要提供以下抽象：

- **模型通信（ChatClient）**：使用统一接口与 OpenAI、Ollama、Google Gemini 等模型交互。
- **提示词（Prompt）**：结构化管理发送给模型的提示词。
- **检索增强生成（RAG）**：通过 `VectorStore` 等抽象把外部知识库接入模型。
- **工具调用（Function Calling）**：允许模型调用 Java 应用中定义的方法。
- **记忆（ChatMemory）**：管理多轮对话的上下文历史。

官方文档：<https://spring.io/projects/spring-ai#learn>。

### Spring AI Alibaba

[Spring AI Alibaba](https://github.com/alibaba/spring-ai-alibaba) 集成 Spring AI 生态，它是一个专为多智能体系统和工作流编排设计的项目。项目从架构上包含如下三层：

![Spring AI Alibaba 架构](https://oss.javaguide.cn/github/javaguide/open-source-project/ai/springai-alibaba-architecture-new.png)

- **Agent Framework**：以 ReactAgent 设计理念为核心的 Agent 开发框架，构建具备自动上下文工程和人机交互能力的 Agent。
- **Graph**：低级别的工作流和多代理协调框架，是 Agent Framework 的底层运行时基座，帮助实现复杂的应用程序编排。
- **Augmented LLM**：基于 Spring AI 底层抽象，提供模型、工具、多模态组件（MCP）、向量存储等基础支持。

在这三层之外，项目还提供两个偏平台化的组件：

- **Admin**：一站式 Agent 平台，支持可视化开发、可观测、评估、MCP 管理，甚至与 Dify 等低代码平台集成，支持 DSL 迁移。
- **A2A（Agent-to-Agent）**：支持 Agent 间通信，并可与 Nacos 集成做分布式协调。

官方文档：<https://java2ai.com/>。

### LangChain4j

[LangChain4j](https://github.com/langchain4j/langchain4j) 是社区维护的 Java LLM 应用框架，提供统一的模型、Embedding、向量存储、工具调用和 RAG 接口。

它适合需要快速切换多个模型、向量库，或者希望保持框架相对独立的项目。用于大型系统时，工程结构、治理和可观测性仍需要结合现有基础设施补齐。

官方文档：<https://docs.langchain4j.dev/>。

### AgentScope

[AgentScope](https://github.com/agentscope-ai/agentscope-java) 是一个多智能体框架，提供 ReAct 推理、工具调用、记忆管理和多智能体协作等能力。项目同时提供 Python 和 Java 版本。

它和 Spring AI Alibaba 的侧重点不同：

- **AgentScope Java**：原生为 **Agentic（智能体）范式**设计。它的核心是“Agent”，强调的是自主性、推理循环（ReAct）和多智能体之间的复杂博弈与协作。
- **Spring AI Alibaba**：更侧重于 **Workflow（工作流）编排**。它基于 Spring AI 生态，擅长将 AI 能力作为工具融入到预定义的业务流中。

官方文档：<https://java.agentscope.io/zh/intro.html>。

### 其他框架与工具

- [Solon-AI](https://github.com/opensolon/solon-ai)：Java AI 应用开发框架，支持 LLM、RAG、MCP 和 Agent，兼容 Java 8 到 Java 25，可与 Spring Boot、JFinal、Vert.x、Quarkus 等框架配合使用。
- [Agent-Flex](https://github.com/agents-flex/agents-flex)：轻量级 Java LLM 应用开发框架，提供模型接入、提示词、工具、记忆、Embedding 和向量存储等能力。
- [Smile](https://github.com/haifengl/smile)：基于 Java 和 Scala 的机器学习库。
- [LangGraph4j](https://github.com/langgraph4j/langgraph4j)：用于构建有状态、多智能体应用的 Java 库，可与 LangChain4j 和 Spring AI 集成。它更偏向 Agent 执行图和状态管理，不是新的模型接入层。
- [Embabel Agent](https://github.com/embabel/embabel-agent)：面向 JVM 的 Agent 框架，把 LLM 交互、Java/Kotlin 代码和领域模型组合成 Agent 流程，并根据目标动态规划执行路径。
- [Deep Java Library](https://github.com/deepjavalibrary/djl)：与底层引擎解耦的 Java 深度学习框架，可在 Java 应用中加载、训练和部署模型。它解决的是模型推理与训练问题，不是 RAG 或 Agent 编排框架。

### 对比

| **框架名称**          | **核心特点**                                                                                                       | **适用场景**                                               |
| --------------------- | ------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------- |
| **Spring AI**         | Spring 官方底座：模型/向量库/工具调用/记忆/RAG/可观测/结构化输出；强调可移植与模块化                               | 现有 Spring Boot 企业应用 AI 化                            |
| **Spring AI Alibaba** | 面向 Agentic/Workflow/Multi-agent 的生产级体系：Agent Framework + Graph Runtime + Admin/Studio；支持 MCP/A2A/Nacos | 多智能体编排、复杂工作流、平台化治理与迁移（含可视化）     |
| **LangChain4j**       | 社区强势：统一 API 连接多模型/多向量库；Agents/Tools/RAG；支持 MCP；可集成 Spring/Quarkus/Helidon                  | 快速原型、强灵活性、多模型快速切换                         |
| **Solon-AI**          | Java 8~25 兼容；LLM/RAG/MCP/Agent/Ai Flow 全链路；可嵌入多框架                                                     | 历史系统/多框架场景、追求兼容性与全链路能力                |
| **Agent-Flex**        | 轻量：LLM/Prompt/Tool/MCP/Memory/Embedding/VectorStore/文档处理；OpenTelemetry 可观测                              | 希望快速接入、保持较少依赖的 LLM 应用                      |
| **AgentScope Java**   | Agentic 原生：ReAct + Tool + Memory + 多 Agent；MCP+A2A（Nacos）；Reactor 响应式 + GraalVM Serverless              | 自主智能体、分布式多 Agent、对生产可控性与性能要求高的场景 |

## 实战

### 智能面试平台

[interview-guide](https://github.com/Snailclimb/interview-guide) 基于 Spring Boot 4.0 + Java 21 + Spring AI + PostgreSQL + pgvector + RustFS + Redis，实现简历智能分析、AI 模拟面试、知识库 RAG 检索等核心功能。非常适合作为学习和简历项目，学习门槛低。

**系统架构如下**：

> **提示**：架构图采用 draw.io 绘制，导出为 SVG 格式，在 GitHub 深色模式下的显示效果会有问题。

![系统架构图](https://oss.javaguide.cn/xingqiu/pratical-project/interview-guide/interview-guide-architecture-diagram.png)

### AI 工作流编排系统

[PaiAgent](https://github.com/itwanger/PaiAgent) 是一个 AI 工作流可视化编排平台，可通过拖拽组合模型和处理节点，用于定义多模型协同的执行流程。

**系统架构如下**：

![](https://oss.javaguide.cn/github/javaguide/open-source-project/ai/paiagent-architecture-diagram.jpg)
