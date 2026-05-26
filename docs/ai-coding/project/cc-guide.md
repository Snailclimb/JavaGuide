---
title: IDEA 爽用 Claude Code 和 Codex 的终极方案，很丝滑！
description: CC GUI 是一款开源的 JetBrains 插件，为 Claude Code 和 OpenAI Codex 提供完整的可视化界面，支持 @file 引用、Diff 对比、Agent 系统、MCP 扩展等功能，让 JetBrains 重度用户在 IDE 内完成 AI 编码的全流程。
category: AI 编程实战
head:
  - - meta
    - name: keywords
      content: CC GUI,Claude Code,Codex,IDEA插件,JetBrains,AI编程,Agent,MCP,可视化编程
---

大家好，我是 Guide。前面分享过 [IDEA 搭配 Qoder 插件的实战](https://mp.weixin.qq.com/s/vz5A7fQh8WxqVBHscqHzQA)，这篇文章介绍另一款在 JetBrains 用户群体中口碑非常好的插件——**CC GUI**。

## CC GUI 是什么

**CC GUI**（原名 Claude Code GUI，后为规避商标风险改名）是一款 **MIT 协议、100% 开源** 的 JetBrains 插件，为 Claude Code 和 OpenAI Codex 提供 GUI 可视化界面。

![CC GUI Github 项目界面](https://oss.javaguide.cn/github/javaguide/ai/cc-guide/cc-gui-github-project.png)

项目地址：**https://github.com/zhukunpenglinyutong/jetbrains-cc-gui** 。

如果你看过我之前的文章，应该对 **ACP（Agent Client Protocol）**协议比较熟悉了。简单来说，这就是一个让 AI Agent 和 IDE 即插即用的通用接口。有了 ACP，任何 Agent 只要实现 ACP Server，任何 IDE 只要实现 ACP Client，两者就能直接对接。

目前，IDEA 支持通过 ACP 对接 Cursor、Claude Code、Codex、Gemini CLI、Kimi CLI 等外部 Agent。

CC GUI 和 ACP 是两种不同的路线：

- **官方路线**（ACP + 官方插件）：更轻量，核心是让 Claude Code 在 IDE 内跑起来，重点在 Diff 查看、上下文共享、快速启动。适合命令行重度用户。
- **CC GUI 路线**：更完整，把 Claude Code 和 Codex 做成一个可视化工作台，补上了会话管理、图片输入、Agent 系统、MCP 扩展、界面体验等 GUI 层的能力。适合在 IDE 内形成完整闭环。

两者不冲突，可以按偏好选择。

CC GUI 的核心能力可以概括为以下几点：

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

首次使用会提示安装 Claude Code/Codex SDK。这是 Agent 运行的基础，点击安装即可，大概 20 秒完成。

![成功安装 Claude Code/Codex SDK](https://oss.javaguide.cn/github/javaguide/ai/cc-guide/sdk-installed-success.png)

**遇到黑屏？** 部分用户在 IDEA 2026.1 上打开 CC GUI 面板时会出现黑屏。

解决方法：先尝试清除 IDE 内置浏览器缓存；如果不行，在 Help → Edit Custom VM Options 中添加以下两行：

```bash
-Dide.browser.jcef.out-of-process.enabled=false
-Dide.browser.jcef.gpu.disable=true
```

添加后重启 IDEA 即可。详见：**https://github.com/zhukunpenglinyutong/jetbrains-cc-gui/issues/813** 。

### 第二步：配置模型供应商

点击供应商设置，配置 API 密钥。支持以下几种方式：

- **直接使用 Anthropic API Key**：如果有 Claude 官方订阅。
- **使用本地 settings.json 授权**：如果之前已经配置过 Claude Code CLI，可以直接复用。
- **导入 cc-switch 配置**：cc-switch 是社区常用的 Claude Code 供应商管理工具，CC GUI 兼容其配置，导入即可直接使用。
- **第三方代理端点**：支持配置自定义端点，对国内用户比较友好。

如果同时想用 Codex，切换到 OpenAI 供应商配置对应的 API Key 即可。

这里我们选择直接导入 cc-switch 配置，非常简单方便，体验很好。

![直接导入 cc-switch 配置](https://oss.javaguide.cn/github/javaguide/ai/cc-guide/cc-switch-config-import.png)

### 第三步：开始使用

配置完成后，在右侧面板直接开始对话。建议先试试简单的任务，比如“分析一下当前项目的目录结构”，感受一下上下文感知能力。

这里我们以一个日常开发中的高频场景为例：**审查已有代码是否符合规范，并批量修复问题**。这种事手动做极其枯燥——打开文件、逐行对照规范、发现问题、手动改、下一个文件……

CC GUI 支持 **Skill（斜杠命令）**，可以把特定的审查流程固化下来。比如我配置了一个 `java-coding-standards` Skill，它内置了 Google Java Style Guide 和 Spring Boot 最佳实践的审查规则。

这里我们直接以 [AI 智能面试平台](https://javaguide.cn/zhuanlan/interview-guide.html)项目为例，用的时候，直接在对话框输入：

```
/java-coding-standards 检查一下 @infrastructure 下的代码
```

`/java-coding-standards` 加载审查规则，`@infrastructure` 把整个 infrastructure 包拉进上下文。AI 会自动读取该目录下的 14 个 Java 文件，逐个对照规范扫描，然后输出一份结构化的审查报告：

| 严重度 | 问题                                                 | 涉及文件                      | 数量 |
| ------ | ---------------------------------------------------- | ----------------------------- | ---- |
| 高     | 日志 `log.error("xxx: {}", e.getMessage())` 丢失堆栈 | FileHashService               | 3 处 |
| 高     | BusinessException 缺少 ErrorCode                     | RedisService                  | 1 处 |
| 中     | 内联全限定类名（`java.util.function.Function`）      | InterviewMapper、ResumeMapper | 7 处 |
| 中     | 返回 `Map<String, Object>` 而非专用 DTO              | InterviewMapper               | 2 处 |
| 低     | 字体资源未用 try-with-resources                      | PdfExportService              | 1 处 |
| 低     | DateTimeFormatter 每次调用重复创建                   | FileStorageService            | 1 处 |

![java-coding-standards 结构化的审查报告](https://oss.javaguide.cn/github/javaguide/ai/coding/claudecode/java-coding-standards-structured-review-report.png)

拿到报告后，直接说“开始执行修复”，AI 会逐文件逐一修改。每个修改都可以在 Diff 面板里审查——改了哪行、改成什么、为什么改，一目了然。

这次修复涉及 9 个文件、20+ 处改动，从审查到修复到编译验证，整个过程不到五分钟。如果手动做：先 grep 找问题、逐个文件打开改、改完还要确认没有遗漏，至少半小时起步。

**Skill 的价值**：它把“审查什么、按什么标准审”这件事标准化了。不用每次都从零描述“帮我看看代码有没有问题”，一个斜杠命令就把审查规则和检查范围都定义好了。团队里不管谁来做 Code Review，标准都是一致的。

好用的 Vibe Coding Skills 推荐以及 Skills 常见问题解答，可以阅读笔者写的这两篇文章：

1. [ AI 编程必备 Skills 推荐：TDD、代码审查与网页自动化实战](https://javaguide.cn/ai-coding/programmer-essential-skills.html)
2. [Agent Skills 是什么？和 Prompt、MCP 到底差在哪？ ](https://mp.weixin.qq.com/s/5iaTBH12VTH55jYwo4wmwA)

## CC GUI 内置功能

CC GUI 还内置了使用统计功能，可以清晰看到 Token 消耗、费用统计和使用趋势分析。

![CC GUI 使用统计](https://oss.javaguide.cn/github/javaguide/ai/cc-guide/cc-gui-usage-stats.png)

还支持 Commit AI、自定义智能体、维护提示词库、添加 MCP 服务器等功能。

![CC GUI Commit AI](https://oss.javaguide.cn/github/javaguide/ai/cc-guide/cc-gui-commit-ai.png)

并且，你还可以看到历史消息，支持搜索和删除：

![Claude Code 历史消息](https://oss.javaguide.cn/github/javaguide/ai/cc-guide/claude-code-history.png)

## CC GUI 和 Qoder 怎么选？

这两款插件定位不同，简单对比一下：

| 维度          | CC GUI                                 | Qoder                  |
| ------------- | -------------------------------------- | ---------------------- |
| **定位**      | Claude Code / Codex 的 GUI 壳          | 独立的 AI 编程 Agent   |
| **开源**      | MIT 协议，完全开源                     | 闭源，阿里出品         |
| **模型**      | Claude Code + Codex 双引擎，自定义添加 | 内置模型               |
| **上下文**    | `@file` 引用 + 图片输入                | `@database` + `@file`  |
| **适合场景**  | 已有 Claude / Codex 订阅               | 开箱即用，不想折腾配置 |
| **Java 优化** | 通用                                   | 对 Java 生态优化较好   |

**我的建议：**

- **已有 Claude Code 或 Codex 订阅** → 选 CC GUI，直接复用现有订阅，能力完全继承
- **想要开箱即用、不想折腾 API 配置** → 选 Qoder，注册即可使用
- **两个都装也行** → 它们不冲突，可以按场景切换使用

## 总结

CC GUI 的核心价值是**补齐 JetBrains 用户的可视化工作流**。它把原来分散在终端、编辑器、截图工具、文件管理器里的操作，尽量压回到 IDE 内一个地方完成。

如果你是 JetBrains 的忠实用户，又想把 Claude Code 或 Codex 真正接进日常开发流程，CC GUI 值得试一试。
