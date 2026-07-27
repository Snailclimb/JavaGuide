---
title: 在 IDEA 中使用 Claude Code 和 Codex：CC GUI 上手指南
description: CC GUI 是一款开源 JetBrains 插件，为 Claude Code 和 OpenAI Codex 提供可视化界面。本文以 v0.4.7 为快照，介绍安装、认证、Diff、Agent 与 MCP 等常用能力及其边界。
category: AI 编程实战
head:
  - - meta
    - name: keywords
      content: CC GUI,Claude Code,Codex,IDEA插件,JetBrains,AI编程,Agent,MCP,可视化编程
---

大家好，我是小 G。前面分享过 [IDEA 搭配 Qoder 插件的实战](https://mp.weixin.qq.com/s/vz5A7fQh8WxqVBHscqHzQA)，这篇文章再看一个 JetBrains 插件：**CC GUI**。

> **版本说明**：下文功能和截图按 CC GUI v0.4.7（2026-07-24）整理。插件迭代较快，安装和认证方式以项目 README 与当前界面为准。

## CC GUI 是什么

**CC GUI**（原名 Claude Code GUI）是一个采用 MIT 协议的开源 JetBrains 插件，为 Claude Code 和 OpenAI Codex 提供 GUI 界面。

![CC GUI Github 项目界面](https://oss.javaguide.cn/github/javaguide/ai/cc-guide/cc-gui-github-project.png)

项目地址：[zhukunpenglinyutong/jetbrains-cc-gui](https://github.com/zhukunpenglinyutong/jetbrains-cc-gui)。

如果你看过我之前的文章，应该对 **ACP（Agent Client Protocol）**协议比较熟悉了。它为 Agent 与 IDE 之间定义了一套交互接口；实际能否对接，还取决于双方实现的协议版本、能力和认证方式。

JetBrains 内置 Agent 集成、ACP Registry 中的 Agent 和用户手动配置的 ACP Agent 是不同层次的能力，不能统称为“官方插件”。可用 Agent 也会随 IDE 版本、插件和账户变化。

CC GUI 和 ACP 是两种不同的路线：

- **JetBrains/ACP 路线**：使用 IDE 内置集成、Registry Agent 或自定义 ACP Agent，重点是复用 JetBrains 的 AI Chat、Diff 和上下文能力；功能取决于具体 Agent 实现。
- **CC GUI 路线**：使用独立社区插件为 Claude Code 和 Codex 增加会话管理、图片输入、Agent、MCP 等 GUI 能力；支持范围以 CC GUI 当前版本为准。

两者不冲突，可以按偏好选择。

以 v0.4.7 为快照，本文使用到的能力包括：

- **双引擎支持**：同时接入 Claude Code 和 OpenAI Codex，供应商设置中按需切换。
- **可视化对话**：支持 `@file` 引用、图片发送、对话回退，比 CLI 直观得多。
- **Agent + MCP**：内置 Agent 系统和 Slash 命令（如 [/loop 调度](https://mp.weixin.qq.com/s/apkuuxHmC1c6bR0kWhgmUA)、[/simplify 代码审查](https://mp.weixin.qq.com/s/Np3oaBmdJAE319wuT7zHBw)），支持 MCP 扩展。
- **Diff 对比**：代码修改直接在 IDEA 内展示 Diff，支持文件导航和代码跳转。
- **会话管理**：历史记录、搜索、收藏、导出。

## 安装与配置

### 第一步：安装插件和 SDK

打开 IDEA，进入 **Settings → Plugins**（快捷键 `Cmd + ,`），搜索 **CC GUI** 安装即可。

![IDEA 插件 CC GUI](https://oss.javaguide.cn/github/javaguide/ai/cc-guide/idea-plugin-cc-gui.png)

安装完成之后，你可以在 IDEA 右侧工具栏找到 CC GUI 入口，点击图标即可打开。

![IDEA CC GUI 入口](https://oss.javaguide.cn/github/javaguide/ai/cc-guide/idea-cc-gui-entry.png)

首次使用会提示安装 Claude Code/Codex SDK。这是 Agent 运行的基础，点击后按界面完成安装。耗时取决于网络和本机环境。

![成功安装 Claude Code/Codex SDK](https://oss.javaguide.cn/github/javaguide/ai/cc-guide/sdk-installed-success.png)

**遇到黑屏？** 部分用户在 IDEA 2026.1 上打开 CC GUI 面板时会出现黑屏。

可以先尝试清除 IDE 内置浏览器缓存。若仍无效，项目 Issue 中有人通过 Help → Edit Custom VM Options 添加以下参数绕过：

```bash
-Dide.browser.jcef.out-of-process.enabled=false
-Dide.browser.jcef.gpu.disable=true
```

添加后重启 IDEA 再验证。这个参数只是在部分 JCEF/显卡环境下有效的 workaround，关联 Issue 截至 2026-07-24 仍未关闭，不应把它当成确定修复；参数也可能影响 JCEF 隔离或硬件加速。详见：<https://github.com/zhukunpenglinyutong/jetbrains-cc-gui/issues/813>。

### 第二步：配置模型供应商

点击供应商设置，按插件当前支持的认证方式配置：

- **Claude.ai OAuth 登录**：Claude 订阅通过 Claude.ai 账户授权使用 Claude Code。
- **Anthropic API Key**：API Key 来自 Anthropic Console，按 API 用量单独计费；Claude.ai 订阅不会自动提供 API Key。
- **复用 Claude Code CLI 登录态**：如果插件当前版本支持，可以复用既有 Claude.ai OAuth 登录状态；这不等于从 `settings.json` 读取认证信息。
- **导入本地 Provider 配置**：`settings.json` 是配置载体，可能包含模型、端点或 API 相关设置。导入前要确认插件实际读取的字段和密钥存储方式。
- **导入 cc-switch 配置**：cc-switch 是社区常用的 Claude Code 供应商管理工具，CC GUI 兼容其配置，导入即可直接使用。
- **第三方代理端点**：可以配置自定义端点，但兼容性、数据处理和密钥安全由代理服务决定。

Claude Code 的认证方式可参考[官方认证文档](https://code.claude.com/docs/en/authentication)。Codex 官方同时支持 ChatGPT 登录和 API Key，两者的套餐与计费不同；CC GUI 是否支持对应登录流程，以当前插件版本为准，详见 [Codex 认证文档](https://developers.openai.com/codex/auth)。

本文截图使用导入 cc-switch 配置的方式。

![直接导入 cc-switch 配置](https://oss.javaguide.cn/github/javaguide/ai/cc-guide/cc-switch-config-import.png)

### 第三步：开始使用

配置完成后，在右侧面板直接开始对话。建议先试试简单的任务，比如“分析一下当前项目的目录结构”，感受一下上下文感知能力。

这里我们以一个日常开发中的高频场景为例：**审查已有代码是否符合规范，并批量修复问题**。这种事手动做极其枯燥——打开文件、逐行对照规范、发现问题、手动改、下一个文件……

CC GUI 支持 **Skill（斜杠命令）**，可以把特定的审查流程整理成可复用说明。比如我配置了一个 `java-coding-standards` Skill，其中包含 Java 与 Spring Boot 的项目审查规则。

这里我们直接以 [AI 智能面试平台](https://javaguide.cn/zhuanlan/interview-guide.html)项目为例，用的时候，直接在对话框输入：

```
/java-coding-standards 检查一下 @infrastructure 下的代码
```

`/java-coding-standards` 加载审查规则，`@infrastructure` 指定检查范围。在这次演示中，Agent 读取了目录下的 14 个 Java 文件，并输出一份结构化报告：

| 严重度 | 问题                                                 | 涉及文件                      | 数量 |
| ------ | ---------------------------------------------------- | ----------------------------- | ---- |
| 高     | 日志 `log.error("xxx: {}", e.getMessage())` 丢失堆栈 | FileHashService               | 3 处 |
| 高     | BusinessException 缺少 ErrorCode                     | RedisService                  | 1 处 |
| 中     | 内联全限定类名（`java.util.function.Function`）      | InterviewMapper、ResumeMapper | 7 处 |
| 中     | 返回 `Map<String, Object>` 而非专用 DTO              | InterviewMapper               | 2 处 |
| 低     | 字体资源未用 try-with-resources                      | PdfExportService              | 1 处 |
| 低     | DateTimeFormatter 每次调用重复创建                   | FileStorageService            | 1 处 |

![java-coding-standards 结构化的审查报告](https://oss.javaguide.cn/github/javaguide/ai/coding/claudecode/java-coding-standards-structured-review-report.png)

拿到报告后，可以让 AI 逐文件生成候选修复，并在 Diff 面板逐项审查改动和原因。

这次演示涉及 9 个文件、20 多处改动，从审查到生成修复和完成一次编译验证用了不到五分钟。这个耗时只代表本次样例；代码规模、模型、缓存状态和验收要求不同，结果也会不同。

**Skill 的价值**：它把“审查什么、按什么步骤审”整理成可复用入口，减少每次重复说明。它可以提高检查口径的一致性，但不能保证不同模型、不同上下文下的结果完全一致；团队标准仍应落在可版本化的规则、静态检查和 Review 流程里。

好用的 Vibe Coding Skills 推荐以及 Skills 常见问题解答，可以阅读笔者写的这两篇文章：

1. [AI 编程 Skills 选型清单：需求澄清、TDD、代码审查与 UI 设计](https://javaguide.cn/ai-coding/practices/programmer-essential-skills.html)
2. [Agent Skills 是什么？和 Prompt、MCP 到底差在哪？](https://mp.weixin.qq.com/s/5iaTBH12VTH55jYwo4wmwA)

## CC GUI 内置功能

CC GUI 还内置了使用统计功能，可以清晰看到 Token 消耗、费用统计和使用趋势分析。

![CC GUI 使用统计](https://oss.javaguide.cn/github/javaguide/ai/cc-guide/cc-gui-usage-stats.png)

还支持 Commit AI、自定义智能体、维护提示词库、添加 MCP 服务器等功能。

![CC GUI Commit AI](https://oss.javaguide.cn/github/javaguide/ai/cc-guide/cc-gui-commit-ai.png)

并且，你还可以看到历史消息，支持搜索和删除：

![Claude Code 历史消息](https://oss.javaguide.cn/github/javaguide/ai/cc-guide/claude-code-history.png)

## CC GUI 和 Qoder 怎么选？

这两款插件定位不同，简单对比一下：

| 维度          | CC GUI                                  | Qoder                 |
| ------------- | --------------------------------------- | --------------------- |
| **定位**      | Claude Code / Codex 的 GUI 壳           | 独立的 AI 编程 Agent  |
| **开源**      | MIT 协议，完全开源                      | 闭源，阿里出品        |
| **模型**      | Claude Code + Codex，支持范围以版本为准 | 内置及当前可选模型    |
| **上下文**    | `@file` 引用 + 图片输入                 | `@database` + `@file` |
| **适合场景**  | 希望在 JetBrains 中使用现有 CLI 工作流  | 希望使用一体化 Agent  |
| **Java 优化** | 通用                                    | 对 Java 生态优化较好  |

**我的建议：**

- **已有 Claude Code 或 Codex 工作流** → 可以评估 CC GUI，但先确认插件支持的认证方式和功能映射；GUI 不保证完整继承 CLI 的全部能力
- **想要开箱即用、不想折腾 API 配置** → 选 Qoder，注册即可使用
- **两个都装也行** → 它们不冲突，可以按场景切换使用

## 总结

CC GUI 的核心价值是**补齐 JetBrains 用户的可视化工作流**。它把原来分散在终端、编辑器、截图工具、文件管理器里的操作，尽量压回到 IDE 内一个地方完成。

如果你主要使用 JetBrains，又希望在 IDE 中管理 Claude Code 或 Codex 会话，可以在测试项目里试用 CC GUI，再根据认证、功能兼容性和团队安全要求决定是否进入日常流程。
