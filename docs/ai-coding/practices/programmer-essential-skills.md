---
title: AI 编程 Skills 选型清单：需求澄清、TDD、代码审查与 UI 设计
description: 按任务场景整理 AI 编程 Skills 选型清单，覆盖需求澄清、TDD、代码审查、UI 设计、React 性能优化、PostgreSQL、Claude API 与 Skill 开发，并说明哪些工具适合按需安装。
category: AI 编程实战
head:
  - - meta
    - name: keywords
      content: AI编程,Skills,Superpowers,mattpocock,grilling,Claude Code,Cursor,代码审查,TDD,UI设计,React,Next.js,PostgreSQL,Claude API,Skill开发
---

你好，我是小 G。最近有朋友问我：“你平时常用的有哪些 Skills？能不能给兄弟们分享一波？”

那当然可以啊！Skill 刚出来那会儿我就开始用了，后来也在公司内部定制过不少 Skill，同事朋友用了都说不错。

按理说，列份清单应该挺简单的。可真开始整理，我发现能入选的 Skill 其实并不多。而且，在整理 Skill 的过程中我再次感叹 AI 时代技术发展的太快了！有点顶不住啊！

Skill 刚出来那会，模型能力还没那么强。项目还没读明白就动手，代码写完不补测试，聊久了又忘掉前面的要求，这些情况都很常见。

于是我们把开发步骤一条条塞进 Skill：先澄清需求，再拆计划，测试要先写，改完还得审查。规则越细，心里越踏实。

可模型变强得太快了。

现在把同样的任务交给 Codex 或 Claude Code，大多数时候它们会自己读项目、查调用链、改文件、补测试、跑验证。以前需要在 `SKILL.md` 里反复叮嘱的事情，很多已经成了基础动作。

这时候还把 Skills 一股脑装满，就像给一个已经会干活的人塞了一摞操作手册。小改动也要写计划、走审查、跑完整验证，最后时间全花在流程上，多少有点折腾。

所以这份清单会收得比较克制。我现在愿意留下的，通常能补上模型猜不到的项目约定，或者自带专业流程、脚本、模板和参考资料。只会提醒“先读代码、再修改、最后跑测试”的 Skill，我基本不会再推荐了。

之前的[万字详解 Agent Skills](https://javaguide.cn/ai/agent/skills.html)讲过 Skill 和 Prompt、MCP 的区别；如果你想知道我为什么开始删减 Skills，可以接着看最新写的这篇 [强模型时代，AI 编程 Skills 还有必要装吗？](./skill-selection-and-pruning.md)。

## Superpowers

Superpowers 把需求澄清、计划、TDD、Git Worktree、子 Agent 协作、代码审查和完成前验证串成一套开发方法。它适合陌生代码库、复杂功能和高风险改动；改文案、补空值判断、调整一条校验逻辑时，这套流程通常太重。

Superpowers 会依次调用这些 Skill：

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

这套流程已经适配 Claude Code、Codex、Cursor 和 OpenCode。Claude Code 对应的插件安装命令是：

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

这几个 Skill 的实际用法和适用边界，我单独写了一篇：[mattpocock/skills：我最推荐的 4 个 AI 编程 Skill](https://javaguide.cn/ai-coding/practices/mattpocock-skills.html)。

项目地址：<https://github.com/mattpocock/skills>

## ECC（原 Everything Claude Code）

Everything Claude Code 现在已经更名为 **ECC**。

项目已经从一套 Claude Code 配置扩展为跨 Agent 的 Harness 系统，覆盖 Codex、Claude Code、Cursor、OpenCode 等工具。

ECC 仓库同时放了 Skills、Agents、Hooks、Rules，以及记忆管理、安全扫描、持续学习和多语言工程规则。仓库里的 Skills 已经达到数百个，更像一套团队级 Harness 配置库。团队需要统一 Agent 的工作方式、记忆策略和安全检查时，集中管理会省去不少重复配置。

![上下文腐化](https://oss.javaguide.cn/github/javaguide/ai/harness/context-rot-diagram.png)

组件一多，选择成本也会跟着上来。项目只缺代码审查或 TDD 时，可以用 ECC 的选择性安装，只取 Java 代码审查、上下文持久化或安全扫描等对应组件，不必把整套系统塞进每个仓库。

项目地址：<https://github.com/affaan-m/ECC>

## Doc Co-Authoring

程序员写代码之前，最容易被低估的一步其实是：把需求讲清楚。

需求没讲清楚时，AI 编程 Agent 会很努力地往前冲，但冲的方向不一定对。它可能把一个还没定边界的想法直接写成实现，最后代码、测试、文档都很完整，只是和真实需求差了一截。

Anthropic 官方 Skills 仓库里的 **doc-coauthoring** 就是为这类场景准备的。它关注的重点很具体：把写 PRD、技术方案、决策文档、RFC 这类工作拆成一套协作流程，先处理上下文、结构和读者理解，句子润色只是后面的事。

doc-coauthoring 用三个阶段处理一份文档：

| 阶段                       | 做什么                                                       |
| -------------------------- | ------------------------------------------------------------ |
| **Context Gathering**      | 先收集背景、约束、历史讨论、架构依赖和利益相关方关注点       |
| **Refinement & Structure** | 按章节迭代，先提问和发散，再筛选内容，最后写成可读段落       |
| **Reader Testing**         | 用一个全新上下文的 Claude 测试文档，检查读者是否会误解或遗漏 |

拿订单退款模块举例。Coding Agent 开工前，可以先让 doc-coauthoring 整理一份短技术方案，把退款状态机、接口幂等、库存和优惠券回滚、失败后的人工补偿逐项写清楚。

文档定下来后，小任务可以直接把技术方案和验收标准交给 Agent；改动涉及多个模块时，再接 Superpowers 拆计划、写测试和审查代码。这样做主要是为了把分歧留在文档阶段解决，免得实现完成后再改范围。

Claude Code 的安装命令如下：

```bash
/plugin marketplace add anthropics/skills
/plugin install example-skills@anthropic-agent-skills
```

`example-skills` 是一组示例 Skill，doc-coauthoring 只是其中之一。装过这组插件后，后面提到的 skill-creator 也会一起提供，不用重复安装。

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

以“帮我做一个美容 SPA 的落地页”为例，生成结果会先把页面归到健康养生场景，再给出 Soft UI 方向，配色采用淡粉、鼠尾草绿和金色点缀，字体选择 Cormorant Garamond。同一份结果还会列出反模式，例如避免常见的紫粉渐变。

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

它的检索脚本依赖 Python 3。安装完成后，直接描述页面类型和行业即可触发：

```text
帮我做一个 SaaS 产品的落地页
设计一个医疗分析仪表盘
做一个深色主题的金融 App
```

交付检查会继续检查图标、hover 状态、文本对比度和 `reduced-motion`，其中包括“不用 emoji 充当图标”这类明确规则。已有设计系统的项目要谨慎使用自动推荐，否则新生成的色板、字体和组件规范可能与现有规则冲突。这种情况下，把团队已有的设计规范写成项目级 Skill 会更合适。

项目地址：<https://github.com/nextlevelbuilder/ui-ux-pro-max-skill>

不需要完整设计知识库时，可以换成 Anthropic 官方的 **frontend-design** Skill。

当前版本更强调先确定鲜明的视觉方向，再通过字体、配色、布局、动效和细节把方向落实，同时避免模板化的“AI 页面”观感。它不再把禁用 Inter、Roboto 或紫白渐变写成固定规则；是否使用某种字体和配色，应由品牌规范、内容类型和既有设计系统决定。

## Vercel React Best Practices

现在让 Agent 写出一个能跑的 React 页面并不难，容易被忽略的是后面的性能问题：几个本来可以并行的请求被写成串行，客户端收到一大坨用不到的数据，组件因为依赖项处理不当反复渲染，随手引入一个包又把 Bundle 撑大了。

Vercel 官方维护的 **vercel-react-best-practices** 就盯着这些问题。截至 2026 年 7 月，它在 [skills.sh](https://skills.sh/vercel-labs/agent-skills/vercel-react-best-practices) 上的累计安装量约为 57 万次，包含 70 条 React 和 Next.js 性能规则，并按影响程度分成 8 类。

| 优先级     | 主要检查内容                                                                |
| ---------- | --------------------------------------------------------------------------- |
| CRITICAL   | 消除请求瀑布、控制 Bundle 体积                                              |
| HIGH       | 服务端缓存与请求去重、并行获取数据、减少 React Server Components 序列化开销 |
| MEDIUM     | 客户端请求去重、依赖项管理、减少无效重渲染、处理 Hydration 问题             |
| LOW-MEDIUM | DOM 批处理、缓存重复计算、用 Set 或 Map 优化高频查找                        |

每条规则都带有错误代码、修改后的代码和适用条件。写新页面、做性能审查或者重构 React 代码时，让 Agent 按这些规则逐项检查，比临时提醒一句“帮我优化性能”更具体。

安装命令如下：

```bash
npx skills add https://github.com/vercel-labs/agent-skills --skill vercel-react-best-practices
```

这套规则只适合 React 和 Next.js 项目，Vue、Svelte 或后端项目没必要安装。性能优化也不能只看规则清单，涉及缓存、序列化和渲染的问题，最后还是要结合构建产物、React Profiler 和真实请求链路验证。

项目地址：<https://github.com/vercel-labs/agent-skills/tree/main/skills/react-best-practices>

## sanyuan-skills

`sanyuan-skills` 当前收录 6 个独立 Skill，安装时可以按目录选择。只想在提交前补一轮代码审查，就装 Code Review Expert，不会同时引入需求澄清、TDD 等流程。

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
npx skills add sanyuan0704/sanyuan-skills --skill code-review-expert
npx skills add sanyuan0704/sanyuan-skills --skill sigma
npx skills add sanyuan0704/sanyuan-skills --skill skill-review
npx skills add sanyuan0704/sanyuan-skills --skill skill-forge
```

安装后可以直接调用：

```text
/code-review-expert    # 审查当前 git 变更
/sigma <主题>          # 启动学习辅导，如 /sigma React Hooks
/skill-review          # 检查已有 Skill
/skill-forge           # 创建新技能
```

项目地址：<https://github.com/sanyuan0704/sanyuan-skills>

## Supabase Postgres Best Practices

**supabase-postgres-best-practices** 由 Supabase 官方维护，内容主要围绕 PostgreSQL，普通 PostgreSQL 项目也能用。截至 2026 年 7 月，它在 [skills.sh](https://skills.sh/supabase/agent-skills/supabase-postgres-best-practices) 上的累计安装量约为 30 万次。

它把 PostgreSQL 相关规则分成 8 类：查询性能、连接管理、安全与 RLS、表结构设计、并发与锁、数据访问模式、监控诊断和高级特性。每条规则会说明问题出现的原因，再给出错误 SQL、修改后的 SQL、`EXPLAIN` 分析和性能指标。

比如让 Agent 审查一条“按用户、状态和创建时间查询订单”的 SQL，它会继续检查组合索引的字段顺序、查询条件是否命中索引、连接池是否合理，以及这个改动会不会影响写入和锁竞争，不会只留下一句“加个索引”。

安装命令如下：

```bash
npx skills add https://github.com/supabase/agent-skills --skill supabase-postgres-best-practices
```

Java 后端项目只要使用 PostgreSQL，也可以直接拿来检查 SQL、表结构和数据库配置。MySQL 项目不要照搬其中的 RLS、索引和数据库参数；涉及建索引、改字段或调整连接池时，还要结合数据量、`EXPLAIN ANALYZE` 和压测结果判断，不能让 Agent 直接改生产库。

项目地址：<https://github.com/supabase/agent-skills/tree/main/skills/supabase-postgres-best-practices>

## Claude API

Claude API 这个 Skill 面向的是 AI 应用开发。只在 IDE 里使用 Coding Agent 时可以跳过；做智能客服、代码生成平台、文档分析工具或内部 Agent 平台时，它可以用来核对 SDK 和 API 细节。

模型名称、参数和流式事件都可能随版本变化，凭记忆写调用代码容易用到旧接口。Anthropic 官方的 **claude-api** Skill 覆盖模型选择、价格、参数、流式输出、工具调用、MCP、Agent、缓存、Token 计算和模型迁移，并按语言拆分文档：

| 语言 / 接入方式 | 说明                             |
| --------------- | -------------------------------- |
| **Python**      | 使用官方 Python SDK              |
| **TypeScript**  | 使用官方 TypeScript SDK 和 Zod   |
| **Java**        | Java / Kotlin / Scala 项目可参考 |
| **Go**          | Go 服务端应用可参考              |
| **Ruby / PHP**  | 适合对应语言栈项目               |
| **C#**          | .NET 项目可参考                  |
| **cURL**        | 原始 HTTP、Shell 脚本或调试用    |

遇到 SDK 方法名、参数、流式事件或工具调用结构时，这个 Skill 会先查对应文档，再生成代码。它的主要作用就是减少 Agent 凭旧版本记忆猜接口的情况。

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

| 你反复遇到的问题                         | 优先考虑                         | 不建议安装的情况                           |
| ---------------------------------------- | -------------------------------- | ------------------------------------------ |
| 复杂功能容易漏需求、漏测试               | Superpowers                      | 主要处理小改动，现有 Agent 已能稳定完成    |
| 只想补需求澄清、Bug 诊断、TDD 或代码审查 | mattpocock/skills                | 项目已经有稳定的等价流程                   |
| 团队要统一 Agents、Hooks、记忆和安全策略 | ECC                              | 只缺一项代码审查或 TDD 流程                |
| PRD、技术方案经常写不清楚                | Doc Co-Authoring                 | 只是改一小段已有文档                       |
| 没有设计系统，AI 生成页面经常千篇一律    | UI UX Pro Max                    | 项目已经有成熟的组件库和设计规范           |
| React / Next.js 页面能跑但性能问题多     | Vercel React Best Practices      | 项目没有使用 React                         |
| 提交前想补一轮通用代码审查               | Code Review Expert               | 项目风险主要来自内部规则，通用检查帮不上忙 |
| PostgreSQL 查询和表结构经常需要返工      | Supabase Postgres Best Practices | 项目使用 MySQL 或其他数据库                |
| 正在开发 Claude API 应用                 | Claude API                       | 只在 IDE 里使用 Coding Agent               |
| 想把反复失败的任务沉淀成 Skill           | skill-creator                    | 没做过无 Skill 基线测试                    |

我的做法是先不用 Skill 跑一次同类任务。模型本来就能稳定完成，就不装；同一个问题反复出现，再去看候选项目的 `SKILL.md`、`scripts/` 和 `references/`，确认它确实补上了缺口，也没有危险命令或过宽权限。

第一次安装尽量限定在当前仓库。连续跑两三个真实任务后，再比较返工次数、执行时间和结果稳定性。没有明显改善就删掉，确认长期有用再考虑全局启用。

具体从哪个开始，取决于最近哪类问题最常返工：代码审查总漏同一类风险，可以试 Code Review Expert；需求还没定清楚 Agent 就开工，可以试 Doc Co-Authoring，或者更轻量的 [`grilling`](https://github.com/mattpocock/skills/blob/main/skills/productivity/grilling/SKILL.md)。

这份清单没有默认必装项。能说清一个 Skill 解决什么问题、什么时候触发，以及失效后怎么删，它才值得留在列表里。
