---
title: AI 编程必备 Skills 推荐：TDD、代码审查、网页自动化与 MCP 实战
description: 实战分享 10 个 AI 编程 Skills 工具，覆盖 TDD 开发流程、代码审查、UI 设计、网页自动化、本地 Web 测试、MCP 开发、Claude API 与 Skill 开发，让 AI 编程 Agent 真正成为生产力利器。
category: AI 编程实战
head:
  - - meta
    - name: keywords
      content: AI编程,Skills,Superpowers,Claude Code,Cursor,代码审查,TDD,UI设计,网页自动化,MCP,Claude API
---

你好，我是小 G。之前写了篇[万字详解 Agent Skills](https://javaguide.cn/ai/agent/skills.html)，聊了 Skills 是什么、怎么用、和 Prompt / MCP 有什么区别。这篇不聊概念，直接分享 10 个我觉得程序员很值得装的 Skills，覆盖开发流程、代码审查、UI 设计、网页操作、前端验收、MCP 开发和 API 接入这些场景：

- 让 AI 自动遵循 TDD 流程，先写测试再写实现
- 把模糊需求整理成 PRD、技术方案或决策文档
- 一键生成符合行业标准的设计系统
- 对代码进行多维度专业审查（SOLID、安全性、性能）
- 解决 AI 聊太久会“失忆”的上下文腐化问题
- 给 AI 加上完整的网页浏览和自动化操作能力
- 用 Playwright 对本地 Web 应用做交互验收和截图检查
- 辅助开发 MCP Server，把内部 API 封装成 Agent 可调用工具
- 写 Claude API 应用时查 SDK、流式输出、工具调用、缓存和模型迁移细节

下面按场景来看。

## Superpowers

> 这个会有点重，对于个人开发的话，其实是可以不用装的，可以看看后面推荐的 Skills。

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

项目地址：<https://github.com/obra/superpowers>

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

![上下文腐化](https://oss.javaguide.cn/github/javaguide/ai/harness/context-rot-diagram.png)

AI 聊太久会“失忆”，输出质量下降。这套配置让 AI 始终在清晰的角色框架内工作，保持稳定输出。每个 Agent 只负责自己擅长的领域，不会越界；每个 Skill 都有明确的触发条件和执行步骤，不会乱来。

项目地址：<https://github.com/affaan-m/everything-claude-code>

## Doc Co-Authoring

程序员写代码之前，最容易被低估的一步其实是：把需求讲清楚。

需求没讲清楚时，AI 编程 Agent 会很努力地往前冲，但冲的方向不一定对。它可能把一个还没定边界的想法直接写成实现，最后代码、测试、文档都很完整，只是和真实需求差了一截。

Anthropic 官方 Skills 仓库里的 **doc-coauthoring** 就是为这类场景准备的。它关注的重点很具体：把写 PRD、技术方案、决策文档、RFC 这类工作拆成一套协作流程，先处理上下文、结构和读者理解，句子润色只是后面的事。

它的核心流程分三步：

| 阶段                       | 做什么                                                       |
| -------------------------- | ------------------------------------------------------------ |
| **Context Gathering**      | 先收集背景、约束、历史讨论、架构依赖和利益相关方关注点       |
| **Refinement & Structure** | 按章节迭代，先提问和发散，再筛选内容，最后写成可读段落       |
| **Reader Testing**         | 用一个全新上下文的 Claude 测试文档，检查读者是否会误解或遗漏 |

这个流程很适合放在编码前面用。比如你准备让 AI 写一个订单退款模块，不要一上来就说“帮我实现退款功能”，可以先让 doc-coauthoring 产出一份短技术方案：退款状态机有哪些、哪些接口要幂等、库存和优惠券怎么回滚、失败后是否需要人工补偿。

这些信息先落到文档里，再交给 Superpowers 或其他开发类 Skill 执行，返工会少很多。

安装 Anthropic 官方示例 Skills 的方式也很简单：

```bash
/plugin marketplace add anthropics/skills
/plugin install example-skills@anthropic-agent-skills
```

项目地址：<https://github.com/anthropics/skills/tree/main/skills/doc-coauthoring>

## UI UX Pro Max

这是一个专为 AI 编程 Agent（Claude Code、Cursor、Windsurf 等）设计的专业 UI/UX 设计智能 Skill。

![UI UX Pro Max](https://oss.javaguide.cn/github/javaguide/ai/harness/ui-ux-pro-max-skill.png)

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

项目地址：<https://github.com/nextlevelbuilder/ui-ux-pro-max-skill>

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

项目地址：<https://github.com/sanyuan0704/sanyuan-skills>

## Web Access

![Web Access](https://oss.javaguide.cn/github/javaguide/ai/harness/web-access.png)

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

项目地址：<https://github.com/eze-is/web-access>

## Webapp Testing

Web Access 更偏“上网和操作现有网站”，而 **webapp-testing** 更适合程序员本地开发时用：启动本地服务，打开页面，跑 Playwright 脚本，检查交互、控制台日志和截图。

它解决的是另一个很具体的问题：AI 写完前端后，经常只跑 `npm run build`，但没有真的点页面。构建通过不代表按钮可点、弹窗正常、表单校验生效，也不代表移动端没有遮挡。

webapp-testing 内置了一套 Playwright 测试流程：

| 能力                 | 说明                                                                         |
| -------------------- | ---------------------------------------------------------------------------- |
| **服务生命周期管理** | 通过 `scripts/with_server.py` 启动一个或多个本地服务，测试结束后自动处理退出 |
| **动态页面检查**     | 等待 `networkidle` 后再检查 DOM，避免页面还没渲染完就开始断言                |
| **截图与日志捕获**   | 保存页面截图，读取控制台日志，适合排查前端样式和运行时错误                   |
| **元素发现**         | 先侦察页面上的按钮、链接、输入框，再生成更可靠的选择器                       |

举个很常见的用法：AI 写完一个管理后台页面后，让它用 webapp-testing 打开 `http://localhost:5173`，检查新增按钮、表单提交、错误提示、弹窗关闭、暗色模式和移动端宽度下的布局。这个环节不一定替代正式 E2E 测试，但能抓住很多“代码看起来没问题、页面一用就露馅”的问题。

如果前面已经安装了 Anthropic 的 `example-skills`，通常不用重复安装，直接提到 “use webapp-testing” 这类需求即可触发。

项目地址：<https://github.com/anthropics/skills/tree/main/skills/webapp-testing>

## MCP Builder

MCP 已经是 AI 编程工具里绕不开的一层：数据库、内部平台、工单系统、知识库、部署平台，都可以通过 MCP 暴露给 Agent。

但 MCP Server 不是把 API 包一层就完事。更容易踩坑的地方在工具边界、参数收敛、错误返回、鉴权、分页，以及怎样让 Agent 调用后拿到足够稳定的结果。

**mcp-builder** 是 Anthropic 官方提供的 MCP Server 开发 Skill，用来指导你构建高质量 MCP 服务。它覆盖 Python 的 FastMCP，也覆盖 Node / TypeScript 方向的 MCP SDK。

我会把它放在“程序员必备”里，原因很简单：当你开始频繁让 AI 读项目、查内部文档、跑部署、查监控时，只靠复制粘贴上下文很快会到上限。MCP 的作用就是把这些重复动作变成工具。

适合用它处理的场景：

- 把公司内部 OpenAPI 封装成 MCP 工具，让 Agent 能查订单、查用户、查配置
- 给数据库查询加一层受控工具，限制只读、限制表范围、统一脱敏
- 把部署、日志、告警平台的常用动作封装成标准工具
- 为团队沉淀一套可复用的 Agent 工具层，而不是每个人都写一遍脚本

这里要诚实一点：MCP Builder 更适合已经准备动手做工具集成的同学。刚接触 AI 编程时，可以先用 Superpowers、sanyuan-skills 这类开箱即用的 Skill；等你发现 Agent 总是在重复查同一批系统，再考虑写 MCP Server。

项目地址：<https://github.com/anthropics/skills/tree/main/skills/mcp-builder>

## Claude API

如果你的工作只是在 IDE 里用 AI 写代码，Claude API 这个 Skill 不一定每天都会用到。

但只要你开始开发 AI 应用，比如做智能客服、代码生成平台、文档分析工具、内部 Agent 平台，它就很有价值。因为 API 细节变化快，靠记忆写 SDK 调用很容易写出过期代码。

Anthropic 官方的 **claude-api** Skill 覆盖了模型选择、价格、参数、流式输出、工具调用、MCP、Agent、缓存、Token 计算和模型迁移等内容，还按语言拆了文档目录：

| 语言 / 接入方式 | 说明                             |
| --------------- | -------------------------------- |
| **Python**      | 使用官方 Python SDK              |
| **TypeScript**  | 使用官方 TypeScript SDK 和 Zod   |
| **Java**        | Java / Kotlin / Scala 项目可参考 |
| **Go**          | Go 服务端应用可参考              |
| **Ruby / PHP**  | 适合对应语言栈项目               |
| **C#**          | .NET 项目可参考                  |
| **cURL**        | 原始 HTTP、Shell 脚本或调试用    |

这个 Skill 最值得借鉴的一点是它的“先查文档再写代码”约束：遇到 SDK 方法名、参数、流式事件、工具调用结构时，不让 AI 凭印象猜。对 API 集成来说，这比多写几行示例代码更重要。

项目地址：<https://github.com/anthropics/skills/tree/main/skills/claude-api>

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

项目地址：<https://github.com/anthropics/skills/tree/main/skills/skill-creator>

## 总结

按场景整理一下，方便按需选择：

| 场景               | 推荐 Skill                      | 一句话说明                               |
| ------------------ | ------------------------------- | ---------------------------------------- |
| **完整开发流程**   | Superpowers                     | TDD + Code Review + 自动计划，装完直接用 |
| **多角色协作**     | Everything Claude Code          | 子 Agent 分工，解决上下文腐化            |
| **需求与技术文档** | Doc Co-Authoring                | PRD、技术方案、决策文档的协作写作流程    |
| **UI 设计**        | UI UX Pro Max / frontend-design | 前者完整设计系统，后者轻量设计指导       |
| **代码审查**       | sanyuan-skills                  | SOLID + 安全 + 性能多维度审查            |
| **网页浏览与操作** | Web Access                      | CDP 浏览器自动化 + 站点经验积累          |
| **本地 Web 验收**  | Webapp Testing                  | Playwright 交互测试 + 截图和日志检查     |
| **工具接入**       | MCP Builder                     | 开发 MCP Server，连接内部 API 和平台     |
| **AI 应用开发**    | Claude API                      | SDK、流式输出、工具调用、缓存和模型迁移  |
| **自制 Skill**     | skill-creator                   | Anthropic 官方的 Skill 开发工具          |

不需要全装，根据日常场景挑几个就行。刚开始接触的话，建议从 **Superpowers** 和 **sanyuan-skills** 入手，先把开发流程和代码质量兜住；如果你经常做前端，再加上 **Webapp Testing**；如果你已经开始给团队做内部 Agent，**MCP Builder** 和 **skill-creator** 会更有用。
