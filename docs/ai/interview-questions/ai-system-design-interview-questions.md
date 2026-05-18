---
title: AI 系统设计面试题总结
description: 系统整理 AI 应用系统设计高频面试题，覆盖生产级 AI 应用架构、模型网关、Prompt 管理、RAG、Memory、Tool Calling、可观测、评测、安全合规、实时语音 Agent 等核心考点，并附对应参考文章。
category: AI
tag:
  - AI系统设计
  - AI面试
  - 大模型应用
head:
  - - meta
    - name: keywords
      content: AI系统设计面试题,AI应用架构面试题,大模型应用系统设计,LLM网关面试题,AI可观测面试题,AI评测面试题,语音Agent面试题,AI安全面试题
---

这份 AI 系统设计面试题根据 AI 专栏现有文章整理，适合 2 年以上开发者复习。系统设计题不只考概念，更考你能不能把 AI Demo 变成稳定、可观测、可回滚的生产系统。

## 生产级 AI 应用架构

参考文章：[《AI 应用系统设计：从 Prompt Demo 到生产级架构》](../system-design/ai-application-architecture.md)

- Prompt Demo 到生产系统最大的差距是什么？
- 怎么设计一个生产级 AI 应用的整体架构？
- 一次 AI 请求从入口到模型返回，完整链路应该怎么讲？
- 入口层、编排层、Prompt/Context、RAG/Memory/Tool、模型网关、评测观测分别承担什么职责？
- 同步、流式、异步三种模式怎么选？
- 为什么需要模型网关？
- Prompt 为什么要做版本管理？
- RAG 和 Memory 有什么区别？为什么不能混在一起治理？
- Tool Calling 的安全边界在哪里？
- AI 应用可观测要看哪些指标？
- LLM-as-Judge 能不能替代人工评测？

## 稳定性、成本与安全治理

参考文章：[《AI 应用系统设计：从 Prompt Demo 到生产级架构》](../system-design/ai-application-architecture.md)、[《大模型 API 调用工程实践：流式输出、重试、限流与结构化返回》](../llm-basis/llm-api-engineering.md)

- AI 应用如何做超时、重试、限流、熔断和降级？
- 为什么大模型调用限流要同时看 RPM、TPM、并发数和租户预算？
- 如何设计模型 fallback 策略？什么时候不能自动降级？
- Token 成本怎么归因到租户、用户、功能和 Prompt 版本？
- 高风险工具调用为什么要做二次确认？
- PII 脱敏、权限过滤、审计日志应该放在哪些环节？
- Prompt 注入攻击在系统设计层面怎么防？
- 出现模型输出事故后，如何通过 Trace 回放定位问题？

## 评测与持续迭代

参考文章：[《AI 应用评测体系：从 Golden Set 构建到线上灰度闭环》](../llm-basis/llm-evaluation.md)

- 为什么没有评测集就很难放心上线？
- Golden Set 如何覆盖正常路径、边缘场景、对抗样本和高权重失败？
- 离线评测、Trace 回放、线上灰度分别放在发布流程的哪个阶段？
- RAG、Agent、结构化输出的评测指标为什么不能混用一套？
- LLM-as-Judge 有哪些偏差？生产中怎么校准？
- CI 自动评测怎么控制成本和耗时？
- 线上质量下降时，如何判断是模型、Prompt、检索、工具还是数据分布变化导致？

## 实时语音 Agent

参考文章：[《AI 语音技术详解：从 ASR、TTS 到实时语音 Agent 的工程化落地》](../system-design/ai-voice.md)

- 如何设计一个实时语音 Agent？
- ASR、LLM、TTS、VAD 在语音系统中分别负责什么？
- 实时语音 Agent 的端到端延迟主要来自哪里？
- 用户打断时，系统应该如何取消播放、取消生成和更新上下文？
- listening、thinking、speaking、interrupted 这些状态如何管理？
- 云端 API、本地模型、端云混合怎么选？
- Speech-to-Speech API 适合什么场景？有哪些取舍？
- 语音 Agent 的可观测指标应该包括哪些？

## 复习建议

AI 系统设计面试要按“系统链路”来回答，不要从某个框架或工具名开始。更稳的表达方式是先讲 Demo 和生产差距，再讲分层架构、核心链路、治理能力和评测闭环。

如果面试官继续追问，再展开模型网关、Prompt 版本、RAG 和 Memory 隔离、Tool Calling 安全、Trace 回放、灰度评测这些关键点。
