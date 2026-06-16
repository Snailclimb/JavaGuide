---
home: true
icon: "mdi:home-outline"
title: JavaGuide（Java 面试 & 后端通用知识体系）
description: JavaGuide 是 GitHub 156K+ Star 的 Java 面试与后端知识体系指南，免费开源，系统覆盖 Java、计算机基础、数据库、分布式、高并发、高可用、系统设计与 AI 应用开发，适合校招、社招、跳槽和后端能力体系化复习。
heroImage: /logo.svg
heroText: JavaGuide
tagline: GitHub 156K+ Star 的 Java 面试与后端知识体系，覆盖计算机基础、数据库、分布式、高并发、系统设计与 AI 应用开发
sitemap:
  changefreq: weekly
  priority: 0.9
head:
  - - meta
    - name: keywords
      content: JavaGuide,Java面试,Java面试指南,Java八股文,后端面试,后端开发,数据库面试,MySQL面试,Redis面试,分布式,高并发,高性能,高可用,系统设计,消息队列,缓存,计算机网络,Linux,AI面试,AI应用开发,Agent,RAG,MCP,LLM,AI编程
  - - meta
    - property: og:image
      content: https://javaguide.cn/logo.png
actions:
  - text: 开始阅读
    link: /home.md
    type: primary
  - text: 知识星球
    link: /about-the-author/zhishixingqiu-two-years.md
    type: default
footer: |-
  <a href="https://beian.miit.gov.cn/" target="_blank">鄂ICP备2020015769号-1</a> | 主题: <a href="https://theme-hope.vuejs.press/" target="_blank">VuePress Theme Hope</a>
---

<!-- markdownlint-disable MD033 -->

## 核心入口

- **后端面试主线**：[后端面试指南](./home.md)（⭐网站核心）：系统整理 Java 面试八股文和后端高频面试题，覆盖 Java 基础、集合、并发、JVM、Spring、MySQL、Redis、分布式、高并发、高可用和系统设计。
- **计算机基础**：[计算机基础面试指南](./cs-basics/)：系统梳理计算机网络、操作系统、数据结构与算法等后端面试底层基础，适合补齐基础短板。
- **AI 应用开发**：[AI 应用开发面试指南](./ai/)（⭐新增）：面向后端开发者梳理大模型基础、Prompt、Agent、RAG、MCP、LLM API 工程和 AI 系统设计等高频知识；如果想系统学习，可以配合 [AI 应用开发与 Agent 学习路线](./roadmap/java-to-ai-roadmap.md) 和 [后端转 AI Agent 学习建议](./roadmap/backend-to-ai-agent-roadmap.md)。
- **AI 编程实战**：[AI 编程实践指南](./ai-coding/)（⭐新增）：聚焦 Claude Code、Codex、AI IDE、CLI Agent、上下文管理和 AI 辅助开发工作流，帮助你把 AI 真正用进日常编码。
- **学习路线**：[学习路线合集](./roadmap/)：整理 Java 后端、AI 应用开发、AI Agent 和全栈开发等方向的系统学习建议。
- **延伸资料**：
  - [《Java 面试指北》](https://javaguide.cn/zhuanlan/java-mian-shi-zhi-bei.html)：四年打磨，和 JavaGuide 开源版的内容互补，带你从零开始系统准备后端面试！
  - [《后端面试高频系统设计&场景题》](https://javaguide.cn/zhuanlan/back-end-interview-high-frequency-system-design-and-scenario-questions.html)：30+ 道高频系统设计和场景面试，助你应对当下中大厂面试趋势。
  - [⭐AI 智能面试辅助平台 + RAG 知识库](https://javaguide.cn/zhuanlan/interview-guide.html)：基于 Spring Boot 4.0 + Java 21 + Spring AI 2.0 的大模型实战项目，适合作为学习和简历项目。

## 精选文章

- **后端面试路径**：[Java 后端面试通关计划](./interview-preparation/backend-interview-plan.md)、[Java 学习路线](./interview-preparation/java-roadmap.md)、[Java 后端面试重点总结](./interview-preparation/key-points-of-interview.md)。不知道从哪里开始复习时，优先看这一组。
- **Java、数据库与分布式高频题**：[Java 基础](./java/basis/java-basic-questions-01.md)、[Java 集合](./java/collection/java-collection-questions-01.md)、[Java 并发](./java/concurrent/java-concurrent-questions-01.md)、[JVM](./java/jvm/README.md)、[MySQL](./database/mysql/mysql-questions-01.md)、[Redis](./database/redis/redis-questions-01.md)、[分布式](./distributed-system/distributed-system-interview-questions.md)。适合集中刷核心八股和后端通用高频题。
- **计算机基础补强**：[计算机网络](./cs-basics/network/other-network-questions.md)、[操作系统](./cs-basics/operating-system/operating-system-basic-questions-01.md)、[进程和线程](./cs-basics/operating-system/process-and-thread.md)、[数据结构与算法](./cs-basics/algorithms/)。适合补齐校招、社招和大厂面试都绕不开的基础能力。
- **AI 应用开发进阶**：[AI 应用开发与 Agent 学习路线](./roadmap/java-to-ai-roadmap.md)、[后端转 AI Agent 学习建议](./roadmap/backend-to-ai-agent-roadmap.md)、[AI 应用开发知识体系](./ai/)、[LLM API 工程实践](./ai/llm-basis/llm-api-engineering.md)、[RAG 基础概念](./ai/rag/rag-basis.md)、[AI 应用系统设计](./ai/system-design/ai-application-architecture.md)。适合后端开发者先明确学习路径，再从模型调用走向可上线的 AI 应用。
- **AI 编程效率提升**：[AI 编程实战指南](./ai-coding/)、[Claude Code 使用指南](./ai-coding/practices/claudecode-tips.md)、[Codex 使用指南](./ai-coding/practices/codex-best-practices.md)、[AI IDE 选型与实践](./ai-coding/practices/ai-ide.md)。适合把 AI 编程工具真正接入日常开发、重构和排障流程。

## 关于 JavaGuide

JavaGuide 是一份面向 Java 和后端开发者的开源知识库，已在 GitHub 获得 **156K+ Star**。项目从 Java 面试复习出发，逐步扩展为覆盖后端核心技术、工程实践和 AI 应用开发的系统化学习指南。

JavaGuide 自 2018 年开源以来持续维护，累计提交 **6200+** commit ，共有 **640+** 多位贡献者共同参与维护和完善。

![JavaGuide 目前的 Star、Fork、Issue 和 PR 情况](https://oss.javaguide.cn/github/javaguide/intro/javaguide-star-issue-pr.png)

网站内容覆盖：

- **后端面试**：Java 基础、集合、并发、JVM、MySQL、Redis、分布式、系统设计等核心知识。
- **AI 应用开发**：大模型（LLM）基础、Agent 智能体、RAG 检索增强生成、MCP 协议等前沿技术。

真心希望能够把这个项目做好，真正能够帮助到有需要的朋友！

如果觉得 JavaGuide 的内容对你有帮助的话，还请点个免费的 Star（绝不强制点 Star，觉得内容不错有收获再点赞就好），这是对我最大的鼓励，感谢各位一路同行，共勉！传送门：[GitHub](https://github.com/Snailclimb/JavaGuide) | [Gitee](https://gitee.com/SnailClimb/JavaGuide)。

- [项目介绍](./javaguide/intro.md)（JavaGuide 的诞生）
- [贡献指南](./javaguide/contribution-guideline.md)（期待你的贡献，奖励丰富）
- [常见问题](./javaguide/faq.md)（统一回复大家的一些疑问）

## PDF 版本 & 微信联系

- 如果你更喜欢 **PDF**（比如通勤/离线阅读/打印学习），扫描下方二维码，后台回复“**PDF**”即可获取最新版（持续更新，详细介绍见：**[2026 最新后端面试 PDF 资料](./interview-preparation/pdf-interview-javaguide.md)**）。
- 如果你想加我的微信，可以扫描下方二维码，后台回复“**微信**”。我会在朋友圈分享一些优质技术内容、学习资料和项目更新。

<img src="https://oss.javaguide.cn/github/javaguide/gongzhonghao-javaguide.png" alt="JavaGuide 公众号" style="zoom: 43%; display: block; margin: 0 auto;" />
