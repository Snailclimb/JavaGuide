---
title: 大模型基础面试题总结
description: 系统整理大模型/LLM 高频面试题，覆盖 Token、上下文窗口、采样参数、API 调用、流式输出、结构化输出、Function Calling、MCP、AI 应用评测等核心考点，并附对应参考文章。
category: AI
tag:
  - 大模型面试
  - LLM面试
  - AI面试
head:
  - - meta
    - name: keywords
      content: 大模型面试题,LLM面试题,大模型面试,LLM面试,Token面试题,上下文窗口面试题,Function Calling面试题,结构化输出面试题,AI应用评测面试题
---

这份大模型基础面试题主要根据 AI 专栏现有文章整理，适合用来快速定位高频考点。每道题后面都附了参考文章，详细答案建议回到原文阅读。

## LLM 运行机制

参考文章：[《LLM 运行机制：Token、上下文窗口与采样参数怎么影响输出》](../llm-basis/llm-operation-mechanism.md)

- Token 是什么？为什么中文、英文、代码消耗的 Token 不一样？
- 上下文窗口是什么？上下文窗口越大，效果一定越好吗？
- 什么是 Lost in the Middle 问题？长上下文场景下怎么缓解？
- Temperature、Top-P、Top-K 分别控制什么？生产环境怎么设置更稳？
- 为什么 Temperature 设置为 0，模型输出仍然可能不完全一致？
- 大模型为什么会产生幻觉？常见缓解方案有哪些？
- Token 预算怎么估算？输入、输出、历史消息、RAG 证据如何取舍？
- 长上下文窗口会不会取代 RAG？二者分别适合什么场景？

## API 调用工程

参考文章：[《大模型 API 调用工程实践：流式输出、重试、限流与结构化返回》](../llm-basis/llm-api-engineering.md)

- 大模型 API 调用的完整链路是什么？
- Streaming 为什么能改善用户体验？它能减少总耗时和 Token 成本吗？
- SSE、WebSocket、HTTP Chunked 在流式输出场景下怎么选？
- 哪些大模型 API 错误可以重试？哪些错误不能重试？
- 为什么大模型调用必须做幂等？
- 大模型限流为什么不能只按 QPS 做？
- 模型网关通常要承担哪些能力？
- AI 应用的调用日志里至少要记录哪些字段？

## 结构化输出与工具调用

参考文章：[《大模型结构化输出：从 JSON 契约到 Function Calling 落地》](../llm-basis/structured-output-function-calling.md)

- 为什么只写“请返回 JSON”不可靠？
- JSON Mode 和 Structured Outputs 有什么区别？
- JSON Schema 在大模型应用里解决什么问题？
- Function Calling 的完整链路是什么？
- Function Calling 和 MCP 有什么区别？
- MCP Tool 和普通 HTTP API 有什么关系？
- Agent Skill 和 Function Calling 是一回事吗？
- 结构化输出失败后怎么处理？
- 工具调用为什么必须做安全治理？
- 面试里怎么一句话概括结构化输出？

## AI 应用评测

参考文章：[《AI 应用评测体系：从 Golden Set 构建到线上灰度闭环》](../llm-basis/llm-evaluation.md)

- 为什么不能只靠公开 benchmark 评估 AI 应用质量？
- Golden Set 应该怎么构建？冷启动阶段没有生产日志怎么办？
- LLM-as-Judge 有哪些主要偏差？怎么缓解？
- RAG 评测为什么必须分检索和生成两段？
- Agent 评测为什么比普通问答和 RAG 更复杂？
- 离线评测、Trace 回放、线上灰度分别解决什么问题？
- CI 里的 AI 评测如何平衡速度和覆盖度？
- 如果 LLM-as-Judge 和人工评测结果不一致，应该怎么处理？

## 复习建议

大模型基础面试不要只背概念定义，重点要能把参数、调用链路、结构化输出和评测闭环讲成工程方案。

如果时间有限，建议按这个顺序复习：

1. 先看 Token、上下文窗口、采样参数，建立基础认知。
2. 再看 API 调用工程，理解从 Demo 到生产的差距。
3. 接着看结构化输出和 Function Calling，这是 AI 应用开发的高频追问点。
4. 最后看评测体系，尤其是 Golden Set、LLM-as-Judge、Trace 回放。
