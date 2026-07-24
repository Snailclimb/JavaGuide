---
title: AI 编程必备 Skills 推荐：TDD、代码审查、网页自动化与 MCP 实战
description: 按任务场景推荐 AI 编程 Skills，覆盖需求澄清、轻量工程流程、TDD、代码审查、UI 设计、网页自动化、本地 Web 测试、MCP 开发、Claude API 与 Skill 开发，并说明哪些工具适合按需安装。
category: AI 编程实战
head:
  - - meta
    - name: keywords
      content: AI编程,Skills,Superpowers,mattpocock,grilling,Claude Code,Cursor,代码审查,TDD,UI设计,网页自动化,MCP,Claude API
---

你好，我是小 G。之前写过一篇[万字详解 Agent Skills](https://javaguide.cn/ai/agent/skills.html)，聊了 Skills 是什么、怎么用，以及它和 Prompt、MCP 有什么区别。这篇只解决一个更实际的问题：现成 Skill 这么多，哪些值得程序员花时间了解？

先说我的使用原则：**这篇文章列出的 Skill 不需要全部安装。**

Skill 适合保存模型猜不到的偏好、需要反复执行的专业流程，以及脚本、模板和参考资料。只会提醒“先读代码、再修改、最后跑测试”的通用 Skill，强模型往往不需要。关于我为什么开始删减 Skills，可以先看 [强模型时代，AI 编程 Skills 还有必要装吗？](./skill-selection-and-pruning.md)。

本文内容基于 2026 年 7 月各项目的公开版本。各项按使用场景排列，同时写明不值得安装的情况。

## Superpowers

Superpowers 把需求澄清、计划、TDD、Git Worktree、子 Agent 协作、代码审查和完成前验证串成一套开发方法。它适合陌生代码库、复杂功能和高风险改动；改文案、补空值判断、调整一条校验逻辑时，这套流程通常太重。

当前流程包括：

| Skill                                             | 主要动作                               |
| ------------------------------------------------- | -------------------------------------- |
| `brainstorming`                                   | 编码前澄清需求、比较方案并保存设计     |
| `using-git-worktrees`                             | 创建隔离工作区，检查测试基线           |
| `writing-plans`                                   | 把设计拆成带文件位置和验证步骤的小任务 |
| `subagent-driven-development` / `executing-plans` | 分派子 Agent 或按批次执行计划          |
| `test-driven-development`                         | 执行 RED-GREEN-REFACTOR                |
| `requesting-code-review`                          | 按严重程度审查实现                     |
| `verification-before-completion`                  | 在宣布完成前检查证据                   |
| `finishing-a-development-branch`                  | 验证测试并处理合并、PR 或保留分支      |

Superpowers 已支持 Claude Code、Codex、Cursor、OpenCode 等多个 Agent。Claude Code 可以直接从官方插件市场安装：

```text
/plugin install superpowers@claude-plugins-official
```

Codex App 可以在侧边栏的 Plugins 中搜索 Superpowers；Codex CLI 则可以输入 `/plugins` 后搜索安装。不同 Agent 的安装方式并不互通，使用多个 Agent 时需要分别安装。

Claude Code 安装界面会让你选择作用范围：

![Superpowers 下载](https://oss.javaguide.cn/github/javaguide/ai/superpowers/superpowers-download.png)

| 选项                               | 作用范围         | 建议                                           |
| ---------------------------------- | ---------------- | ---------------------------------------------- |
| Install for you                    | 所有项目生效     | 已经确认自己愿意长期使用整套流程时再选         |
| Install for all collaborators      | 项目成员共享     | 团队已经约定采用同一开发方法时再提交           |
| Install for you, in this repo only | 只在当前仓库生效 | 第一次体验时优先选择，方便观察它是否拖慢小任务 |

我不再建议新手一上来全局安装。先在一个仓库里跑两三个真实任务，看看需求澄清、TDD 和审查流程是否真的减少返工，再决定要不要扩大范围。

项目地址：<https://github.com/obra/superpowers>

## mattpocock/skills

如果你只想加强开发流程里的某一个环节，可以看看 [mattpocock/skills](https://github.com/mattpocock/skills)。这个项目把工程经验拆成较小、容易修改、可以组合的 Skills，不会要求每个任务都走完同一套流程。

目前比较适合程序员的模块包括：

| Skill                    | 适合解决的问题                                             |
| ------------------------ | ---------------------------------------------------------- |
| `grill-me` / `grilling`  | 开工前持续追问，把需求、决策和依赖关系确认清楚             |
| `diagnosing-bugs`        | 按复现、缩小范围、提出假设、插桩、修复和回归测试的顺序排查 |
| `tdd`                    | 用 RED-GREEN-REFACTOR 循环开发功能或修复 Bug               |
| `code-review`            | 分别检查代码规范和实现是否符合原始需求                     |
| `to-spec` / `to-tickets` | 把已有讨论整理成规格说明，再拆成带依赖关系的任务           |
| `domain-modeling`        | 统一领域术语，并把关键决策写进 `CONTEXT.md` 和 ADR         |

跨 Agent 安装可以使用：

```bash
npx skills@latest add mattpocock/skills
```

安装器会让你选择需要的 Skills 和目标 Agent。按照项目当前的安装说明，还要勾选 `/setup-matt-pocock-skills`，然后在目标仓库运行一次，完成 Issue Tracker 和文档存放位置等配置。

第一次使用时，不必把整套都装上。需求经常没聊清楚，可以先选 `grill-me` 和 `grilling`；难定位的 Bug 多，再补 `diagnosing-bugs`。

这套 Skills 适合已经有基本开发习惯、只想补几个薄弱环节的人。如果项目里已经有稳定的需求模板、TDD 规范和代码审查流程，重复安装对应 Skill 不会带来多少帮助。

项目地址：<https://github.com/mattpocock/skills>

## ECC（原 Everything Claude Code）

Everything Claude Code 现在已经更名为 **ECC**。截至 2026 年 7 月，项目已经从一套 Claude Code 配置扩展为跨 Agent 的 Harness 系统，覆盖 Codex、Claude Code、Cursor、OpenCode 等工具。

它提供的不只是 Skills，还包括 Agents、Hooks、Rules、记忆管理、安全扫描、持续学习和多语言工程规则。仓库当前包含数百个 Skills，适合已经明确需要统一 Agent 工作方式、记忆和安全策略的团队。

![上下文腐化](https://oss.javaguide.cn/github/javaguide/ai/harness/context-rot-diagram.png)

这种规模也带来了选择成本。如果你只需要代码审查或 TDD，没有必要把整套系统装进每个项目。ECC 已经提供选择性安装能力，更合适的用法是先挑一个具体问题，例如 Java 代码审查、上下文持久化或安全扫描，再安装对应组件。

原文里引用过“开发速度提升 65%”“PR 问题从 12 个降到 3 个”等数据，但当前项目 README 已经没有保留这些实验说明，因此这里不再把它们当作通用效果。真实收益仍然取决于代码库、模型、任务风险和团队验收方式。

项目地址：<https://github.com/affaan-m/ECC>

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

这些信息先落到文档里，再交给 Coding Agent 实现，通常比一开始就写代码更稳。任务足够复杂时，可以继续接 Superpowers；小任务直接把技术方案和验收标准交给 Agent 即可。

安装 Anthropic 官方示例 Skills 的方式也很简单：

```bash
/plugin marketplace add anthropics/skills
/plugin install example-skills@anthropic-agent-skills
```

`example-skills` 是一组示例 Skill，不只包含 doc-coauthoring。已经安装过这组插件时，后面的 webapp-testing、mcp-builder 和 skill-creator 不需要重复安装。

项目地址：<https://github.com/anthropics/skills/tree/main/skills/doc-coauthoring>

## UI UX Pro Max

这是一个专为 AI 编程 Agent（Claude Code、Cursor、Windsurf 等）设计的专业 UI/UX 设计智能 Skill。

![UI UX Pro Max](https://oss.javaguide.cn/github/javaguide/ai/harness/ui-ux-pro-max-skill.png)

它会根据产品类型和行业特性生成设计系统，再把配色、字体、布局、动效和反模式交给 Agent 执行。与只有几段审美提示词的轻量 Skill 相比，它带了一套可以检索的设计资料。

当前公开版本提供的主要数据包括：

| 资源类型       | 数量   | 说明                                                    |
| -------------- | ------ | ------------------------------------------------------- |
| UI 风格        | 84 种  | Glassmorphism、Neumorphism、Bento Grid、AI-Native UI 等 |
| 产品类型与色板 | 192 组 | 按 SaaS、金融、医疗、电商等产品场景匹配                 |
| 字体搭配       | 74 组  | 包含 Google Fonts 组合                                  |
| 图表类型       | 25 种  | 面向仪表盘和分析页面                                    |
| 推理规则       | 161 条 | 按行业生成设计系统                                      |
| UX 准则        | 98 条  | 覆盖反模式、交互和可访问性                              |
| 支持技术栈     | 22 种  | React、Next.js、Vue、Nuxt、SwiftUI、Flutter、JavaFX 等  |

### 它怎么生成设计方案

当你输入“帮我做一个美容 SPA 的落地页”时，它不会随便给你一套紫色渐变，而是会推理出：这是健康养生行业 → 推荐柔和的 Soft UI 风格 → 配色用淡粉 + 鼠尾草绿 + 金色点缀 → 字体选优雅的 Cormorant Garamond，同时还会列出该行业应该避免的反模式（比如不要用 AI 感十足的紫粉渐变）。

Claude Code 可以从插件市场安装：

```text
/plugin marketplace add nextlevelbuilder/ui-ux-pro-max-skill
/plugin install ui-ux-pro-max@ui-ux-pro-max-skill
```

Codex、Cursor、Windsurf 等工具更适合使用当前官方 CLI。包名是 `ui-ux-pro-max-cli`，旧的 `uipro-cli` 已经不再更新：

```bash
npx ui-ux-pro-max-cli init --ai codex
npx ui-ux-pro-max-cli init --ai cursor
```

检索脚本需要 Python 3。安装后，用自然语言描述 UI 需求即可触发：

```text
帮我做一个 SaaS 产品的落地页
设计一个医疗分析仪表盘
做一个深色主题的金融 App
```

它还会生成交付前检查项，例如不用 emoji 充当图标、给可点击元素补 hover 状态、检查文本对比度和 `reduced-motion`。如果项目已经有成熟的设计系统，这类自动推荐可能反而会引入冲突；此时更适合把现有设计规范写成项目级 Skill。

项目地址：<https://github.com/nextlevelbuilder/ui-ux-pro-max-skill>

如果你觉得 UI UX Pro Max 太重，只需要一个轻量的前端设计指导，可以试试 Anthropic 官方的 **frontend-design** Skill。它专注于避免 AI 生成的“千篇一律”美学——拒绝 Inter/Roboto 等泛滥字体，拒绝紫白渐变这类套路配色，鼓励大胆的排版和非常规布局。没有 UI UX Pro Max 那么完整的设计知识库，但胜在轻量，适合对设计要求不那么复杂的场景。

## sanyuan-skills

这是一个边界比较清楚的 Skill 集合。相比 Superpowers 和 ECC，它不会默认接管整条开发流程，适合只拿走当前需要的一项能力。

当前仓库包含 6 个 Skill：

| Skill              | 适用场景                                               |
| ------------------ | ------------------------------------------------------ |
| Code Review Expert | 从 SOLID、安全、性能、错误处理和边界条件等维度审查代码 |
| Sigma              | 通过苏格拉底式追问学习技术概念                         |
| Skill Review       | 检查 Skill 的结构、描述、流程和 Token 使用             |
| Skill Forge        | 创建新的 Skill                                         |
| Wiki Ingest        | 把文章、文档或笔记整理成可交叉引用的 Wiki              |
| Book Study         | 阅读辅导、掌握度测试和间隔复习                         |

Java 开发者最容易直接用起来的是 Code Review Expert。它适合在提交前补一轮独立审查，但不能替代项目自己的检查规则。事务边界、错误码约定、日志字段和兼容性要求仍然要放进仓库的 `AGENTS.md`、审查说明或测试里。

每个 Skill 都可以单独安装：

```bash
npx skills add sanyuan0704/sanyuan-skills --path skills/code-review-expert
npx skills add sanyuan0704/sanyuan-skills --path skills/sigma
npx skills add sanyuan0704/sanyuan-skills --path skills/skill-review
npx skills add sanyuan0704/sanyuan-skills --path skills/skill-forge
```

安装后可以直接调用：

```text
/code-review-expert    # 审查当前 git 变更
/sigma <主题>          # 启动学习辅导，如 /sigma React Hooks
/skill-review          # 检查已有 Skill
/skill-forge           # 创建新技能
```

项目地址：<https://github.com/sanyuan0704/sanyuan-skills>

## Web Access

![Web Access](https://oss.javaguide.cn/github/javaguide/ai/harness/web-access.png)

很多 Agent 能搜索和抓取网页，但遇到登录态、动态交互、Shadow DOM 或文件上传时，仍然需要浏览器控制。Web Access 把联网策略、CDP 浏览器操作和站点经验放进同一个 Skill。

| 能力           | 说明                                                               |
| -------------- | ------------------------------------------------------------------ |
| 自动工具选择   | 根据场景组合 WebSearch、WebFetch、curl、Jina 和 CDP                |
| CDP 浏览器操作 | 连接 Chrome、Edge 等 Chromium 浏览器，操作动态页面并沿用现有登录态 |
| 本地 URL 检索  | 从浏览器书签和历史记录中查找内部系统或访问过的页面                 |
| 并行调研       | 多个目标交给子 Agent 处理，共享 Proxy，按 Tab 隔离                 |
| 媒体处理       | 从 DOM 提取图片、视频 URL，或者截取视频画面                        |

脚本已经迁移到 Node.js，支持 Windows、Linux 和 macOS，也能穿透 Shadow DOM、iframe 等普通选择器难以跨越的 DOM 边界。

推荐使用 `skills` CLI 安装：

```bash
npx skills add eze-is/web-access
```

CDP 模式要求 Node.js 22+，还要在 Chrome 的 `chrome://inspect/#remote-debugging` 或 Edge 的 `edge://inspect/#remote-debugging` 中允许远程调试。

安装后可以直接用自然语言驱动：

```text
搜索一下 xxx 的最新进展
帮我去小红书搜一下 xxx 的账号
同时调研这 5 个产品网站，给我一个对比总结
```

Web Access 连接的是带登录态的日常浏览器，Agent 理论上能看到登录后的页面，也可能执行发布、上传等操作。第一次使用时先做只读任务；涉及发帖、上传、删除和账号设置时，逐步确认。项目 README 也提醒，自动化操作社交平台可能触发限流或封禁，不要直接拿主账号试。

项目地址：<https://github.com/eze-is/web-access>

## Webapp Testing

Web Access 更偏“上网和操作现有网站”，而 **webapp-testing** 更适合程序员本地开发时用：启动本地服务，打开页面，跑 Playwright 脚本，检查交互、控制台日志和截图。

AI 写完前端后，经常只跑 `npm run build`，但没有真的点页面。构建通过不代表按钮可点、弹窗正常、表单校验生效，也不代表移动端没有遮挡。

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

当你开始频繁让 AI 查内部文档、读监控、看工单时，只靠复制粘贴会越来越慢。MCP 可以把这些重复动作变成带参数和权限控制的工具。

适合用它处理的场景：

- 把公司内部 OpenAPI 封装成 MCP 工具，让 Agent 能查订单、查用户、查配置
- 给数据库查询加一层受控工具，限制只读、限制表范围、统一脱敏
- 把部署、日志、告警平台的常用动作封装成标准工具
- 为团队沉淀一套可复用的 Agent 工具层，而不是每个人都写一遍脚本

MCP Builder 更适合已经准备动手做工具集成的同学。刚接触 AI 编程，或者偶尔才查一次外部系统，没有必要先写 MCP Server。等 Agent 开始反复查询同一批系统，并且复制粘贴已经影响效率时再做。

把内部系统接给 Agent 之前，还要先确定只读范围、身份认证、数据脱敏、分页上限和审计记录。能查询不等于应该开放写入；部署、删除、改生产配置等操作需要单独审批。

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

这是 Anthropic 官方 Skills 仓库中的一个元技能，用来创建、修改和评估 Skill。

它提供了一套 Skill 开发工作流：

| 阶段              | 工作内容                                               |
| ----------------- | ------------------------------------------------------ |
| **意图捕获**      | 理解你想让 Skill 做什么，明确边界和目标                |
| **起草 SKILL.md** | 编写 Skill 的核心指令文件，包含 frontmatter 和指令内容 |
| **测试验证**      | 创建测试用例，运行对比实验（有 Skill vs 无 Skill）     |
| **迭代优化**      | 根据测试反馈持续改进指令                               |
| **描述优化**      | 优化 Skill 的 description，提高触发准确性              |

它还带有评估工具，可以对比“使用 Skill”和“不使用 Skill”的输出，记录时间、Token 和断言结果，再生成可视化报告。如果没有 Skill 时模型已经能稳定完成任务，就没有必要继续维护一份额外流程。

适合想给团队做专属 Skill 的开发者作为起点。

项目地址：<https://github.com/anthropics/skills/tree/main/skills/skill-creator>

## 怎么选

| 你反复遇到的问题                         | 优先考虑           | 不建议安装的情况                           |
| ---------------------------------------- | ------------------ | ------------------------------------------ |
| 复杂功能容易漏需求、漏测试               | Superpowers        | 主要处理小改动，现有 Agent 已能稳定完成    |
| 只想补需求澄清、Bug 诊断、TDD 或代码审查 | mattpocock/skills  | 项目已经有稳定的等价流程                   |
| 团队要统一 Agents、Hooks、记忆和安全策略 | ECC                | 只缺一项代码审查或 TDD 流程                |
| PRD、技术方案经常写不清楚                | Doc Co-Authoring   | 只是改一小段已有文档                       |
| 没有设计系统，AI 生成页面经常千篇一律    | UI UX Pro Max      | 项目已经有成熟的组件库和设计规范           |
| 提交前想补一轮通用代码审查               | Code Review Expert | 项目风险主要来自内部规则，通用检查帮不上忙 |
| 需要操作登录后的动态网页                 | Web Access         | 搜索、抓取公开网页已经够用                 |
| AI 写完前端后没有真实点击验收            | Webapp Testing     | 项目已有稳定的 Playwright E2E 流程         |
| Agent 反复访问内部 API 或平台            | MCP Builder        | 偶尔查询一次，复制粘贴成本不高             |
| 正在开发 Claude API 应用                 | Claude API         | 只在 IDE 里使用 Coding Agent               |
| 想把反复失败的任务沉淀成 Skill           | skill-creator      | 没做过无 Skill 基线测试                    |

第一次安装第三方 Skill，我一般会做四件事：

1. 先看 `SKILL.md`、`scripts/` 和 `references/`，确认没有危险命令和过宽权限。
2. 先不用 Skill 跑一次同类任务，记录模型原本会在哪一步出错。
3. 优先安装到当前仓库，不急着全局启用。
4. 用两三个真实任务比较返工次数、执行时间和结果稳定性；没有明显改善就删除。

如果你只想从这篇文章里挑一个开始，优先选自己最近反复遇到的问题。前端页面写完没人验收，就试 Webapp Testing；代码审查总漏同一类风险，就试 Code Review Expert；需求还没定清楚 Agent 就开工，可以试 Doc Co-Authoring 或更轻量的 [`grilling`](https://github.com/mattpocock/skills/blob/main/skills/productivity/grilling/SKILL.md)。

Skill 列表短一点没有关系。每一个为什么存在、什么时候触发、失效后怎么删除，自己说得清楚就够了。
