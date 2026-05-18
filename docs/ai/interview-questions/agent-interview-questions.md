---
title: AI Agent 面试题总结
description: 系统整理 AI Agent 高频面试题，覆盖 Agent 核心概念、Agent Loop、Memory、Prompt Engineering、Context Engineering、MCP、Agent Skills、Harness Engineering、Workflow、Graph、Loop 等核心考点，并附对应参考文章。
category: AI
tag:
  - Agent面试
  - AI Agent
  - AI面试
head:
  - - meta
    - name: keywords
      content: AI Agent面试题,Agent面试题,AI Agent面试,Agent Loop面试,Agent Memory面试题,MCP面试题,Prompt工程面试题,Context Engineering面试,Harness Engineering面试,Agent Skills面试题
---

这份 AI Agent 面试题根据 AI 专栏现有文章整理，重点覆盖“概念怎么讲清楚”和“工程上怎么落地”。每组题后面都附了参考文章，详细答案建议回到原文阅读。

## Agent 基础

参考文章：[《AI Agent 核心概念：Agent Loop、Context Engineering、Tools 注册》](../agent/agent-basis.md)

- AI Agent 是什么？和普通 Chatbot 有什么区别？
- Agent = LLM + Planning + Memory + Tools 这条公式怎么理解？
- Agent Loop 的完整流程是什么？
- Agent 和传统编程、Workflow 的核心区别是什么？
- ReAct、Plan-and-Execute、Reflection、Multi-Agent 分别适合什么场景？
- Tools 注册时，工具 description 为什么很关键？
- 什么时候用纯 Agent，什么时候用 Workflow 或 Agentic Workflow？
- Multi-Agent 协作的主要问题是什么？为什么生产里不能盲目上多 Agent？

## Agent Memory

参考文章：[《AI Agent 记忆系统：短期记忆、长期记忆与记忆演化机制》](../agent/agent-memory.md)

- Agent 的短期记忆和长期记忆有什么区别？
- Agent 记忆系统要解决哪些核心问题？
- 向量记忆和 Markdown 记忆分别适合什么场景？
- Auto Memory 是什么？它为什么不能无限自动写入？
- 团队共享记忆为什么适合走 Git 和 Code Review？
- 记忆压缩、记忆过期、记忆冲突应该怎么处理？
- 如何避免长期记忆污染上下文？
- 面试里怎么讲“有记忆”不是简单保存聊天记录？

## Prompt 与 Context Engineering

参考文章：[《大模型提示词工程实践指南》](../agent/prompt-engineering.md)、[《上下文工程实战指南：让 Agent 少犯蠢的工程方法论》](../agent/context-engineering.md)

- Prompt Engineering 和 Context Engineering 有什么区别？
- Prompt 四要素 Role、Task、Context、Format 分别解决什么问题？
- Few-Shot、CoT、任务分解、结构化输出分别适合什么场景？
- Prompt 注入攻击是什么？常见防护方式有哪些？
- 为什么 Agent 场景下只优化 Prompt 不够？
- Context Engineering 要解决哪些问题？
- 静态规则、动态信息、工具结果、记忆应该如何进入上下文？
- 长任务上下文溢出时，Compaction、结构化笔记、Sub-agent 分别怎么用？

## MCP 与 Agent Skills

参考文章：[《深入理解 MCP 协议：一次开发，多处复用》](../agent/mcp.md)、[《Agent Skills 是什么？和 Prompt、MCP 到底差在哪？》](../agent/skills.md)

- MCP 解决什么问题？为什么常被类比成 AI 领域的 USB-C？
- MCP Client、MCP Server、Host 分别是什么？
- MCP 的 Tools、Resources、Prompts 分别解决什么问题？
- MCP 和 Function Calling 有什么区别？
- 生产级 MCP Server 要做哪些安全治理？
- Agent Skills 是什么？它和 Prompt、MCP、Function Calling 的边界是什么？
- Skills 为什么要延迟加载？
- Skill 路由怎么做？为什么它和 RAG 相似但目标不同？
- 写一个 `SKILL.md` 最容易踩哪些坑？

## Harness Engineering

参考文章：[《一文搞懂 Harness Engineering：六层架构、上下文管理与一线团队实战》](../agent/harness-engineering.md)

- Harness Engineering 是什么？它和 Prompt Engineering、Context Engineering 有什么关系？
- 为什么说 Agent = Model + Harness？
- Harness 的六层架构分别解决什么问题？
- 模型能力升级后，Harness 里的某些机制为什么需要重新验证？
- 上下文污染、代码熵积累、工具调用可靠性分别怎么治理？
- Agent 工程里为什么需要评测器、验证器和任务状态管理？
- 一线团队做 Agent 工程化时，共同遇到的难点是什么？

## Workflow、Graph 与 Loop

参考文章：[《AI 工作流中的 Workflow、Graph 与 Loop：从概念到实现》](../agent/workflow-graph-loop.md)

- 为什么 AI 系统需要工作流？
- Workflow、Graph、Loop 三者是什么关系？
- Graph Loop 和 Agent Loop 有什么区别？
- Loop 如何防止死循环？
- State 的更新策略怎么选？Replace、Append、Reducer 分别适合什么字段？
- 条件边和动态路由有什么区别？
- 工作流中断后怎么恢复？
- 工作流有哪些特有的安全风险？

## 复习建议

AI Agent 面试最怕只会讲“模型会自己思考和调用工具”。更稳的复习方式是把 Agent 拆成运行循环、上下文、记忆、工具、协议、工作流和评测几个层次。

建议先讲清楚 Agent 和 Workflow 的边界，再讲 Memory、Context、MCP、Skills 如何支撑 Agent 稳定执行，最后补 Harness Engineering 和 Workflow 的工程化落地。
