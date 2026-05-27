---
title: RAG 专题：文档处理、向量数据库、GraphRAG、检索优化与知识库更新
description: RAG 面试与检索增强生成学习路线，涵盖文档处理、向量数据库、GraphRAG、检索优化、知识库更新和 RAG 评测。
category: AI
tag:
  - RAG
  - 向量数据库
  - AI 应用开发
sidebar: false
---

<!-- @include: @small-advertisement.snippet.md -->

RAG 最容易被低估的地方，是它看起来像“文档切块 + 向量检索”，但真正影响效果的环节远不止这两个。

这份 **RAG 专题** 面向企业知识库问答、智能客服、文档助手和内部搜索等场景，按文档进入系统后的真实链路展开：解析、清洗、切分、向量化、索引、召回、重排、生成、更新和评测。

## 适合谁看

- 正在学习或落地 RAG 知识库问答的开发者。
- 做过“文档切块 + 向量检索”Demo，但对召回质量、文档更新、一致性和评测不熟的工程师。
- 准备 RAG、向量数据库、GraphRAG、企业知识库相关面试题的同学。

## 学习重点

- RAG 的效果问题要分段排查：文档处理、Chunk、Embedding、召回、Rerank、上下文压缩和生成。
- 向量数据库选型要结合数据规模、过滤条件、更新频率、延迟要求和运维成本。
- GraphRAG 更适合实体关系强、全局问题多、需要跨文档推理的场景。
- 知识库更新不是简单覆盖文件，还要考虑版本、去重、增量索引、回滚和灰度。
- RAG 评测要同时看检索指标和生成指标，不能只凭最终回答是否“像那么回事”来判断。

## 建议阅读顺序

1. [万字详解 RAG 基础概念](./rag-basis.md)：先理解 RAG 的核心流程、优势和局限。
2. [RAG 文档处理与切分策略](./rag-document-processing.md)：理解文档进入索引前的处理链路。
3. [万字详解 RAG 向量索引算法和向量数据库](./rag-vector-store.md)：补齐向量索引和数据库选型基础。
4. [万字详解 RAG 检索优化](./rag-optimization.md)：掌握召回、重排、改写和上下文压缩。
5. [万字详解 GraphRAG](./graphrag.md)、[RAG 知识库文档更新策略](./rag-knowledge-update.md)：进一步理解复杂知识组织和持续更新。

## 核心文章

- [万字详解 RAG 基础概念](./rag-basis.md)：理解 RAG 的工作流程、适用场景和局限性。
- [RAG 文档处理与切分策略](./rag-document-processing.md)：涵盖文件解析、清洗、结构化、Chunking 策略与多模态内容处理。
- [万字详解 RAG 向量索引算法和向量数据库](./rag-vector-store.md)：掌握 HNSW、IVFFLAT 等索引算法原理，学会选择合适的向量数据库。
- [万字详解 RAG 检索优化](./rag-optimization.md)：围绕 Chunk 策略、Hybrid Search、Query Rewrite、Rerank、上下文压缩排查召回问题。
- [万字详解 GraphRAG](./graphrag.md)：理解知识图谱驱动的 RAG，掌握实体、关系、社区发现、全局检索与局部检索。
- [RAG 知识库文档更新策略](./rag-knowledge-update.md)：涵盖增量更新、版本回滚、去重与灰度发布。

## 高频问题

- RAG 为什么还会幻觉？应该从哪些环节排查？
- Chunk 切大还是切小？如何处理标题、表格、代码块和多模态内容？
- 向量检索、关键词检索、混合检索分别适合什么场景？
- Rerank 的作用是什么？什么时候值得引入？
- GraphRAG 和普通 RAG 有什么区别？
- 知识库更新如何保证一致性、可回滚和不停机？
- RAG 应用如何评测召回质量和最终回答质量？

## 相关专题

- [AI 应用开发知识体系](../)
- [大模型基础专题](../llm-basis/)
- [AI Agent 专题](../agent/)
- [AI 应用开发面试题专题](../interview-questions/)

<!-- @include: @article-footer.snippet.md -->
