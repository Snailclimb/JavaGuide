---
title: AI 编程必备 Skills 推荐：TDD、代码审查与网页自动化实战
description: 实战分享 6 个 AI 编程 Skills 工具，覆盖 TDD 开发流程、代码审查、UI 设计、网页自动化与 Skill 开发，让 AI 编程 Agent 真正成为生产力利器。
category: AI 编程实战
head:
  - - meta
    - name: keywords
      content: AI编程,Skills,Superpowers,Claude Code,Cursor,代码审查,TDD,UI设计,网页自动化
---

<!-- @include: @article-header.snippet.md -->

之前写了篇[万字详解 Agent Skills](/ai/agent/skills.html)，聊了 Skills 是什么、怎么用、和 Prompt / MCP 有什么区别。这篇不聊概念，直接分享 6 个我日常在用的 Skills，覆盖开发流程、代码审查、UI 设计、网页操作这些场景：

- 让 AI 自动遵循 TDD 流程，先写测试再写实现
- 一键生成符合行业标准的设计系统
- 对代码进行多维度专业审查（SOLID、安全性、性能）
- 解决 AI 聊太久会”失忆”的上下文腐化问题
- 给 AI 加上完整的网页浏览和自动化操作能力

下面一个个来看。

## Superpowers

Superpowers 是一个专为 AI 编程 Agent（Claude Code、Cursor 等）设计的软件开发工作流框架，把 TDD、Code Review、Spec-Driven、Git Worktree、子 Agent 协作等实践封装成 Skills。内置的核心技能如下：

| 技能名称                           | 触发方式                       | 核心功能                                                                                       |
| ---------------------------------- | ------------------------------ | ---------------------------------------------------------------------------------------------- |
| **brainstorming**                  | 命令 `/superpowers:brainstorm` | 通过苏格拉底式提问帮你理清需求，输出设计文档                                                   |
| **using-git-worktrees**            | 自动（设计确定后）             | 创建隔离的 Git worktree 分支，避免影响主分支                                                   |
| **writing-plans**                  | 自动（设计确定后）             | 将设计拆解成可执行的小任务（每个任务 2-5 分钟），包含文件路径、代码片段和验证步骤              |
| **executing-plans**                | 自动（执行计划时可选）         | 批量执行任务计划，适合逻辑简单、重复性高的任务                                                 |
| **test-driven-development**        | 自动（代码实现阶段）           | 强制红-绿-重构循环，所有代码必须先写测试才能写实现                                             |
| **subagent-driven-development**    | 自动（执行计划时可选）         | 为每个任务派发一个全新的子代理，完成后自动进行两阶段审查（先检查是否符合设计，再评估代码质量） |
| **code-review**                    | 自动（任务完成后）             | 双阶段代码审查，代码完成后质量把关                                                             |
| **systematic-debugging**           | 需要时触发                     | 系统化除错，分四个阶段调查根因                                                                 |
| **verification-before-completion** | 自动（宣称完成时）             | 强制验证，没有证据不能说完成                                                                   |

这些技能不是孤立存在的，它们会串联成一条完整的工作流。

目前 Superpowers 支持 Claude Code、Cursor、Codex、OpenCode 等主流 AI 编码平台，安装后即可自动启用。这里以 Claude Code 为例说明。

如果你本机没有安装 Claude Code 的话，只需要运行下面这行命令安装即可（Node.js 18+）：

```bash
npm install -g @anthropic-ai/claude-code
```

在 Claude Code 中，首先要注册插件市场：

```bash
/plugin marketplace add obra/superpowers-marketplace
```

然后从这个插件市场安装插件：

```
/plugin install superpowers@superpowers-marketplace
```

一共有三个下载选项：

![Superpowers 下载](https://oss.javaguide.cn/github/javaguide/ai/superpowers/superpowers-download.png)

| **选项**                                             | **作用范围**                                                |
| ---------------------------------------------------- | ----------------------------------------------------------- |
| **Install for you (user scope)**                     | **全局生效**。你在电脑上任何地方开启 Claude Code 都能调用。 |
| **Install for all collaborators (project scope)**    | **项目成员共有**。配置会写入项目文件，同事拉代码后也能用。  |
| **Install for you, in this repo only (local scope)** | **仅限当前文件夹**。换个目录就没了。                        |

这里推荐选择 **User Scope** 全局安装。因为 Superpowers 的“技能”是通用的，无论你写 Java 业务还是 Python 脚本，这套方法论在大多数场景下都能用。全局安装后，你随时都能唤起这些能力，不用每个项目都折腾一遍。

安装完成后，在 Claude Code 中输入 `/plugin` 或 `/plugin list`，如果看到 Superpowers 出现在列表中，就说明安装成功了。

项目地址：**https://github.com/obra/superpowers**

## Everything Claude Code

很多人把 Claude Code 当聊天框用。有位开发者在 8 小时内用它做完一个产品，拿了 Anthropic 黑客松冠军。

他把这套配置集开源了出来，在 Github 上已经斩获接近 4w Star：Everything Claude Code。

它把开发流程拆解成多个组件，让 AI 在不同角色间分工协作：

| 组件类型     | 作用说明                                             |
| ------------ | ---------------------------------------------------- |
| **Agents**   | 分工的子智能体，比如规划、架构、TDD、代码审查        |
| **Skills**   | 封装好的工作流，像 TDD 方法论、后端开发经验          |
| **Hooks**    | 自动执行的任务，改完代码自动检查有没有遗留的调试日志 |
| **Rules**    | 全局生效的开发规范                                   |
| **Commands** | 斜杠命令，`/tdd` 跑测试、`/code-review` 审查代码     |

在实战测试中，这套方案让功能开发速度提升了 65%。代码审查出的问题减少了 75%，PR 的平均问题数从 12 个降到了 3 个。

但它解决的一个更实际痛点是：**上下文腐化**。

AI 聊太久会“失忆”，输出质量下降。这套配置让 AI 始终在清晰的角色框架内工作，保持稳定输出。每个 Agent 只负责自己擅长的领域，不会越界；每个 Skill 都有明确的触发条件和执行步骤，不会乱来。

项目地址：**https://github.com/affaan-m/everything-claude-code**

## UI UX Pro Max

这是一个专为 AI 编程 Agent（Claude Code、Cursor、Windsurf 等）设计的专业 UI/UX 设计智能 Skill。

它的核心能力是**一键生成完整的设计系统**（Design System），根据产品类型和行业特性自动给出设计决策。

v2.0 新增了 **Design System Generator**，能根据你的产品类型、行业特性、目标用户，在几秒内自动输出一套完整的设计系统。

该技能内置的设计知识库：

| 资源类型       | 数量   | 说明                                                                             |
| -------------- | ------ | -------------------------------------------------------------------------------- |
| **UI 风格**    | 67 种  | Glassmorphism、Neumorphism、Bento Grid、AI-Native UI 等                          |
| **行业色板**   | 161 个 | 每个行业都有专属配色方案，全部带色值说明                                         |
| **字体搭配**   | 57 种  | 精选字体组合，附带 Google Fonts 链接                                             |
| **推理规则**   | 161 条 | 行业特定的设计系统生成规则                                                       |
| **UX 准则**    | 99 条  | 最佳实践、反模式和可访问性规则                                                   |
| **支持技术栈** | 13 种  | React/Next.js + shadcn/ui、Vue/Nuxt、Tailwind、SwiftUI、Flutter、React Native 等 |

**它是如何工作的？**

当你输入“帮我做一个美容 SPA 的落地页”时，它不会随便给你一套紫色渐变，而是会推理出：这是健康养生行业 → 推荐柔和的 Soft UI 风格 → 配色用淡粉 + 鼠尾草绿 + 金色点缀 → 字体选优雅的 Cormorant Garamond，同时还会列出该行业应该避免的反模式（比如不要用 AI 感十足的紫粉渐变）。

安装方式非常简单：

**Claude Code（推荐）**：

```
/plugin marketplace add nextlevelbuilder/ui-ux-pro-max-skill
/plugin install ui-ux-pro-max@ui-ux-pro-max-skill
```

**Cursor / Windsurf / Continue 等**：使用官方 CLI

```bash
npm install -g uipro-cli
uipro init --ai claude      # 或 cursor、windsurf 等
```

安装后，只需自然语言描述你的 UI 需求，技能会自动激活：

```
帮我做一个 SaaS 产品的落地页
设计一个医疗分析仪表盘
做一个深色主题的金融 App
```

它还会自动生成 Pre-delivery Checklist，确保没有 emoji 当图标、hover 状态完整、reduced-motion 被尊重等专业细节。

项目地址：**https://github.com/nextlevelbuilder/ui-ux-pro-max-skill**

如果你觉得 UI UX Pro Max 太重，只需要一个轻量的前端设计指导，可以试试 Anthropic 官方的 **frontend-design** Skill。它专注于避免 AI 生成的“千篇一律”美学——拒绝 Inter/Roboto 等泛滥字体，拒绝紫白渐变这类套路配色，鼓励大胆的排版和非常规布局。没有 UI UX Pro Max 那么完整的设计知识库，但胜在轻量，适合对设计要求不那么复杂的场景。

## sanyuan-skills

这是一个面向生产环境的 Claude Code 技能集合，它把资深工程师的代码审查经验封装成 Skill，让 AI 从多个专业维度对代码进行审查。

该集合目前包含三个核心技能：

| 技能名称               | 核心功能                                                                      | 适用场景                     |
| ---------------------- | ----------------------------------------------------------------------------- | ---------------------------- |
| **Code Review Expert** | 资深工程师级别的代码审查，覆盖 SOLID 原则、安全性、性能、错误处理、边界条件等 | 代码提交前的质量把关         |
| **Sigma**              | 基于 Bloom's 2-Sigma 掌握学习理论的 1 对 1 AI 导师，采用苏格拉底式提问        | 学习新技术、深入理解某个概念 |
| **Skill Forge**        | 元技能，用于创建高质量 Skill，内置 12 种经过实战检验的技术                    | 想自己开发 Skill 时的起点    |

**Code Review Expert 的审查维度：**

- **SOLID 原则**：单一职责、开闭原则、里氏替换等
- **安全性**：SQL 注入、XSS、敏感信息泄露等
- **性能**：算法复杂度、内存泄漏、不必要的循环等
- **错误处理**：异常捕获、边界条件、空值处理等
- **代码质量**：命名规范、注释、可读性等

使用 npx 命令安装：

```bash
# 安装代码审查专家
npx skills add sanyuan0704/sanyuan-skills --path skills/code-review-expert

# 安装 Sigma 导师
npx skills add sanyuan0704/sanyuan-skills --path skills/sigma

# 安装 Skill Forge
npx skills add sanyuan0704/sanyuan-skills --path skills/skill-forge
```

安装后，在 Claude Code 中直接调用：

```
/code-review-expert    # 审查当前 git 变更
/sigma <主题>          # 启动学习辅导，如 /sigma React Hooks
/skill-forge           # 创建新技能
```

项目地址：**https://github.com/sanyuan0704/sanyuan-skills**

## Web Access

Claude Code 自带 WebSearch 和 WebFetch，但缺少编排策略和浏览器自动化能力。这个 Skill 补上了这块——让 Claude Code 能自主浏览网页、操作动态页面，并且跨会话积累站点经验。

| 能力               | 说明                                                                      |
| ------------------ | ------------------------------------------------------------------------- |
| **自动工具选择**   | 根据场景自动选择 WebSearch / WebFetch / curl / Jina / CDP，可自由组合     |
| **CDP 浏览器操作** | 直连日常使用的 Chrome，自然携带登录态；支持动态页面、交互操作、视频帧捕获 |
| **并行分治**       | 派发子 Agent 并行处理多个目标，共享一个 Proxy，Tab 级隔离                 |
| **站点经验积累**   | 按域名存储操作经验（URL 规律、平台特征、已知坑点），跨会话复用            |
| **媒体提取**       | 直接从 DOM 提取图片/视频 URL，或截取任意时间点的视频帧并分析              |

v2.4.1 将脚本从 bash 迁移到了 Node.js，支持 Windows / Linux / macOS。还新增了 DOM 边界穿透能力，能处理 Shadow DOM、iframe 等选择器无法到达的元素。

安装方式：

```bash
git clone https://github.com/eze-is/web-access ~/.claude/skills/web-access
```

前提条件：Node.js 22+，Chrome 需开启远程调试（在 `chrome://inspect/#remote-debugging` 中勾选"Allow remote debugging for this browser instance"）。

安装后可以直接用自然语言驱动：

```
搜索一下 xxx 的最新进展
帮我去小红书搜一下 xxx 的账号
同时调研这 5 个产品网站，给我一个对比总结
```

项目地址：**https://github.com/eze-is/web-access**

## skill-creator

这是 Anthropic 官方 Skills 仓库中的一个元技能，专门用于**创建、修改和优化 Skill**。

它提供了一套 Skill 开发工作流：

| 阶段              | 工作内容                                               |
| ----------------- | ------------------------------------------------------ |
| **意图捕获**      | 理解你想让 Skill 做什么，明确边界和目标                |
| **起草 SKILL.md** | 编写 Skill 的核心指令文件，包含 frontmatter 和指令内容 |
| **测试验证**      | 创建测试用例，运行对比实验（有 Skill vs 无 Skill）     |
| **迭代优化**      | 根据测试反馈持续改进指令                               |
| **描述优化**      | 优化 Skill 的 description，提高触发准确性              |

它还内置了**评估系统**：生成可视化评测报告，对比“使用 Skill”和“不使用 Skill”的输出差异，支持多轮迭代优化。

适合想给团队做专属 Skill 的开发者作为起点。

项目地址：**https://github.com/anthropics/skills/tree/main/skills/skill-creator**

## 总结

按场景整理一下，方便按需选择：

| 场景               | 推荐 Skill                      | 一句话说明                               |
| ------------------ | ------------------------------- | ---------------------------------------- |
| **完整开发流程**   | Superpowers                     | TDD + Code Review + 自动计划，装完直接用 |
| **多角色协作**     | Everything Claude Code          | 子 Agent 分工，解决上下文腐化            |
| **UI 设计**        | UI UX Pro Max / frontend-design | 前者完整设计系统，后者轻量设计指导       |
| **代码审查**       | sanyuan-skills                  | SOLID + 安全 + 性能多维度审查            |
| **网页浏览与操作** | Web Access                      | CDP 浏览器自动化 + 站点经验积累          |
| **自制 Skill**     | skill-creator                   | Anthropic 官方的 Skill 开发工具          |

不需要全装，根据日常场景挑几个就行。刚开始接触的话，建议从 **Superpowers** 和 **sanyuan-skills** 入手——前者管开发流程，后者管代码质量，覆盖了最常见的开发需求。
