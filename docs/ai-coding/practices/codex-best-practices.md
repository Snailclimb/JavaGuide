---
title: Codex 使用指南：配置、AGENTS.md 与 Agentic 工作流
description: 结合 OpenAI 官方文档和 Codex CLI 社区实践，讲清 Codex 的任务描述、计划阶段、AGENTS.md、config.toml、权限控制、MCP、Skills、Subagents、Hooks 和 Automations。
category: AI 编程实战
head:
  - - meta
    - name: keywords
      content: OpenAI Codex,Codex CLI,AI编程,AGENTS.md,Agent Skills,MCP,Subagents,Hooks,Automations,AI辅助开发
---

你好，我是小 G。前面写过一篇 [Claude Code 使用指南：配置、工作流与进阶技巧](./claudecode-tips.md)，发出去之后，有同学在后台问：Claude Code 讲了这么多，那 Codex 怎么用更稳？

我最开始用 Codex 的时候，对它的预期其实不高。

毕竟从名字上看，很容易以为它就是一个更会写代码的命令行助手。真正用了一段时间之后，感受不太一样：Codex 更像一个能自己读仓库、改文件、跑命令、回来交差的工程助手。它不适合只拿来补几行代码，反而更适合处理那些有明确目标、能验证、边界也说得清的任务。

但这里面有个前提。

你得先把工作台摆好：任务边界、权限、项目规则和验收标准，都要提前说清楚。

任务描述太虚，它就会到处猜；权限给得太宽，它可能顺手做出你没授权的动作；`AGENTS.md` 写成项目宣传稿，它每轮还是得重新理解仓库；验收标准不给，它很容易停在“看起来已经改完了”。

这篇文章不打算按产品发布史来介绍 Codex，也不围着某个模型名展开。模型、套餐、命令细节变得很快，写死很容易过期。更值得留下来的，是几条在真实项目里比较抗折腾的经验：任务怎么交代，什么时候先进计划阶段（Plan），`AGENTS.md` 放什么，`config.toml` 管什么，权限、Rules、Hooks 怎么分层，MCP、Skills、Subagents、Automations 又分别适合什么场景。

先说个边界：本文主要面向 **Codex CLI + Codex App** 的日常使用。IDE Extension、Web/Cloud 端能看到的命令和能力不一定完全一致。

## 任务别只写一句话

很多人第一次把任务丢给 Codex，会这么写：

```text
帮我优化一下登录逻辑。
```

这句话对人都不够用，对 Codex 当然也不够用。登录逻辑在哪里？优化的是性能、可读性、安全性，还是线上 Bug？哪些文件不能动？改完后用什么证明它真的好了？

OpenAI 官方最佳实践里有个很实在的框架：Goal、Context、Constraints、Done when。翻成日常写法，就是把“要做什么、看哪里、别碰什么、做到什么程度算完”说清楚。Done when 不要只写“功能正常”，最好写清楚测试、构建、lint、截图、日志或命令输出这类可验证证据。

比如同样是修登录问题，我会改成这样：

```text
目标：修复用户 session 过期后 refresh token 仍有效但刷新失败的问题。
上下文：重点阅读 src/auth、src/session 和 AuthControllerTest。
约束：不要改数据库表结构，不要引入新依赖，保持现有 Result<T> 返回格式。
完成标准：补一个能复现问题的测试，修改实现后运行相关测试，并汇报命令和结果。
```

这样可以减少 Codex 的猜测空间。

小任务可以简单一点。比如改一处文案、补一条日志、把某个参数名统一掉，直接说明目标就行。可一旦任务碰到权限、支付、订单状态、数据迁移、并发、兼容性这些东西，最好别省那几行说明。你前面多写 2 分钟，后面少看很多奇怪 diff。

还有一个习惯很有用：**把原始材料给 Codex，别只给自己的判断。**

比如线上报错，不要只说“应该是缓存没清”。把堆栈、请求参数、复现步骤、失败测试、浏览器控制台输出贴进去，让它自己定位。你先下一个结论，它很容易顺着你的猜测往下走，最后把一个配置问题修成了业务逻辑问题。

## 复杂任务先让它看路

Codex 能直接改代码，但不代表每次都应该直接改。

我现在会先看任务风险。改文案、补字段、加一条明显的空值保护，这类事情直接让它做。它读文件、改文件、跑一下测试，效率很高。

另一类任务就不一样了。比如你要改订单状态机，或者把一个 600 多行的函数拆开，又或者排查一个偶发超时。你自己都还没完全摸清调用链，这时候让 Codex 上来就写代码，很容易越修越绕。

这类任务我会先让它进入计划阶段：

```text
先进入计划阶段，不要修改文件。
阅读 src/payment、src/order 和相关测试，搞清楚支付成功后库存扣减的调用链。
请输出关键文件、当前流程、可能修改点、风险点和建议验证命令。
```

等它读完仓库，再让它把计划拆出来：

```text
基于刚才的分析，给出一个分阶段计划。
每个阶段写清楚要改哪些文件、补哪些测试、怎么验证。
不要开始实现，等我确认。
```

这个流程慢在前 10 分钟，快在后面。

老项目真正麻烦的地方，往往不是某一段代码难写，而是历史兼容逻辑、灰度开关、配置兜底和不敢动的边界混在一起。计划阶段（Plan）的价值，就是先把这些东西捞出来。

计划阶段的输出只是候选方案，不是最终事实。高风险改动仍然要人工确认关键调用链、事务边界和兼容性。

不过也别把计划阶段（Plan）当仪式。任务足够小、验收足够明确时，直接执行反而更好。社区里有个观点我挺认同：普通 Codex 配小任务，比复杂 workflow 更容易稳定产出。

## AGENTS.md 非常重要

### 不要写成第二份 README

它有点像 Claude Code 里的 `CLAUDE.md`，都是给 Agent 看的项目级指令文件。更直白一点说，`AGENTS.md` 是一份 **Agent 工作说明**：告诉 Codex 这个项目怎么启动、怎么测试、哪些目录别碰、改完后要给出什么证据。

![多智能股票分析项目中的 CLAUDE.md 和 AGENTS.md](https://oss.javaguide.cn/github/javaguide/ai/coding/claude-agents-md.png)

不过两者的定位不完全一样。

`CLAUDE.md` 是 Claude Code 专属入口，主要给 Claude Code 读；`AGENTS.md` 是一个面向 coding agents 的开放指令文件格式，OpenAI Codex 官方支持它。其他工具是否读取、如何读取，要以各自文档为准，不要默认所有 Agent 都会按同一套规则加载。

如果仓库里已经有 `AGENTS.md`，通常没必要再维护一份内容几乎一样的 `CLAUDE.md`。可以让 `CLAUDE.md` 导入 `AGENTS.md`，再补 Claude Code 特有的要求：

```markdown
@AGENTS.md

## Claude Code 特定指令

- 使用 plan mode 处理 `src/billing/` 下的改动。
```

这样基础规则只维护一份，Claude Code 和 Codex 都能复用。反过来，如果团队原来只有 `CLAUDE.md`，现在想让 Codex、Cursor 这类工具也读到同一套约定，可以把通用部分抽到 `AGENTS.md`，把 Claude Code 专属命令留在 `CLAUDE.md`。

我建议 `AGENTS.md` 只放 Agent 真会用到的信息：

- Codex 容易猜错的规则
- 代码里读不出来的约定
- 团队必须遵守的规范
- 技术栈版本、常用命令、架构取舍、项目坑点

### 分层怎么放

Codex 启动时会构建一条 instruction chain。当前官方文档里的发现顺序是：先读 Codex home 下的 `AGENTS.override.md`，如果没有再读 `AGENTS.md`；然后从项目根目录一路走到当前目录。每个目录按 `AGENTS.override.md`、`AGENTS.md`、fallback filenames 的顺序最多读取一个文件。越靠近当前工作目录的说明越靠后，也越容易影响本轮任务。

`AGENTS.override.md` 适合临时覆盖同目录下的 `AGENTS.md`。如果你只是想短期改一条规则，不想动基础文件，可以用它。

还有个不太起眼但很实际的限制：`project_doc_max_bytes` 默认限制的是 Codex 合并后的项目指令大小，官方默认是 32 KiB。即便能调大，也不建议把规则写成大而全的 README。文件太胖以后，重要规则会被淹掉，Codex 也不一定更听话。

我的判断标准很简单：

> 这行删掉以后，Codex 会不会更容易犯错？

会，就留；不会，就删。

有些团队还会把 `AGENTS.md` 当成 Agent 的错误笔记。比如 Codex 在某类任务里反复改错测试命令、误动生成目录、忘记跑某个检查，就把原因和正确做法沉淀进去。这个思路是对的，但别把每次失败都原样粘进去。最好压成一条可执行规则，否则文件会很快变成流水账。

`/init` 可以生成一份初始 `AGENTS.md`，但它只能当草稿。自动生成的内容经常会把 README 里的东西搬进来，也可能猜错测试命令。生成后最好人工删一轮，只保留会影响 Codex 行为的部分。

还有一种更适合大项目的写法：让 `AGENTS.md` 只做目录。

我在 [一文搞懂 Harness Engineering](https://javaguide.cn/ai/agent/harness-engineering.html) 里也提到过，OpenAI 自己的 `AGENTS.md` 大约只有 100 行，更像一个索引：先告诉 Agent 最关键的仓库规则，再指向 `docs/` 下面更细的设计文档、架构图、执行计划和质量评级。Agent 真的需要深入某个模块时，再顺着链接去读。

这就是渐进式披露。

不要把所有背景一次性塞进上下文。根目录 `AGENTS.md` 放最关键的工作规则；模块级 `AGENTS.md` 放局部约定；更长的设计说明、迁移背景、架构取舍，放到单独文档里，通过链接让 Agent 按需加载。这样既不浪费上下文，也更容易维护。

## `config.toml` 管客户端行为

`AGENTS.md` 是项目说明，`config.toml` 是 Codex 客户端自己的配置。

常见位置有几个：用户级配置在 `~/.codex/config.toml`，项目级配置在 `.codex/config.toml`，不同 profile 可以放到 `~/.codex/<profile>.config.toml`，系统级配置在 Unix 上通常是 `/etc/codex/config.toml`。

按当前官方配置文档，优先级从高到低是：CLI flags 和 `--config` 覆盖、项目级 `.codex/config.toml`、通过 `--profile` 选择的 profile、用户级 `~/.codex/config.toml`、系统级 `/etc/codex/config.toml`、内置默认值。项目级配置只有在项目被信任后才会加载；如果项目被标记为 untrusted，项目内的 `.codex/` 配置、Hooks 和 Rules 都会被跳过。

日常最值得关心的不是某个模型名，而是权限和沙箱。

```toml
approval_policy = "on-request"
sandbox_mode = "workspace-write"
```

这组配置比较适合日常开发：Codex 可以在工作区里改文件、跑验证，但遇到更敏感的命令会停下来问你。

`approval_policy = "never"` 或者更宽的沙箱，不是不可以用，只是要放在隔离好的环境里。比如临时 worktree、容器、一次性脚本、CI、测试账号、最小权限凭据。为了少点几次确认就把权限全放开，真实项目里不太划算。

Hooks 当前默认启用。如果你确实要关闭，再在 `config.toml` 里设置：

```toml
[features]
hooks = false
```

这个方向也更符合安全直觉：别人仓库里带的配置、Rules、Hooks 都可能影响本地执行，不能默认全信。

这几个文件和机制的分工可以先这么记：

| 能力               | 主要解决什么                   | 适合放什么                                   |
| ------------------ | ------------------------------ | -------------------------------------------- |
| `AGENTS.md`        | Agent 工作说明                 | 项目规则、常用命令、目录约定、验收标准       |
| `config.toml`      | Codex 客户端配置               | 模型、sandbox、approval、profile、MCP 等配置 |
| Rules              | 命令级 allow / prompt / forbid | 哪些命令可放行、哪些必须确认、哪些禁止       |
| Hooks              | 生命周期脚本                   | 检查、审计、格式化、上下文注入               |
| sandbox / approval | 最终执行边界                   | 文件系统、网络、命令执行和人工确认策略       |

## 权限、Rules 和 Hooks 各管各的

Codex 的安全控制有好几层，刚上手时容易全写到 `AGENTS.md` 里。

这种做法不够可靠，因为 `AGENTS.md` 只是指令，不是执行层面的硬约束。

`AGENTS.md` 是软提醒；sandbox 和 approval 管运行边界；Rules 管命令能不能跑；Hooks 管某个生命周期节点必须做什么。

比如“不要执行 `rm -rf`”，只写在 `AGENTS.md` 里，还是一条建议。写进 Rules，Codex 执行前就会被拦住。Rules 当前仍是实验能力，语法和成熟度可能变化；下面写法以当前 Codex Rules 文档为准。如果你的本机版本不支持，先用 `/permissions`、sandbox、approval 或 Hooks 做替代控制。

```python
prefix_rule(
    pattern = ["rm", "-rf"],
    decision = "forbidden",
    justification = "不要让 Codex 执行递归强删；请人工确认具体目录后手动处理。",
    match = [
        "rm -rf dist",
    ],
)
```

Hooks 解决的是另一类问题。

如果你希望 Codex 停止前跑一段校验脚本，或者在工具调用前检查 prompt 里有没有误贴 API key，或者编辑后自动跑格式化，就适合放到 Hook 里。Codex Hooks 当前支持的事件以官方文档为准，比如 `PreToolUse`、`PermissionRequest`、`PostToolUse`、`PreCompact`、`PostCompact`、`UserPromptSubmit`、`SessionStart`、`SubagentStart`、`SubagentStop`、`Stop` 等。

不过 Hook 最后跑的还是本地脚本，写坏了一样麻烦。官方文档里也提到，非托管命令 Hook 需要 Review 和信任，变更后会重新等待确认。多个匹配同一事件的 command hooks 会并发启动，不能依赖 Hook 之间的执行顺序来做安全拦截。这个限制看着啰嗦，但挺有必要。

## 让 Codex 证明它真的改对了

AI 写代码最麻烦的地方，不是它写不出来，而是它很会写“看起来合理”的代码。

所以我很少只说“改完告诉我”。我更愿意把验证写进任务里：

```text
先补一个失败测试复现这个问题。
确认测试失败后再改实现。
改完运行相关测试。
如果连续两三轮仍失败，停止并汇报当前阻塞点和证据，不要继续盲改。
```

这个顺序能挡住很多假修复。它必须先把问题复现出来，再改实现，最后用测试证明。

Codex 结束时，我一般会看 3 件事：改了哪些文件，跑了哪些命令，还有哪些风险没覆盖。`/diff` 用来快速看改动，`/review` 可以审当前未提交改动、某个 commit，或者按你的自定义要求做检查。

更细一点，AI Coding 的验证证据可以按这个清单要：

- 失败测试先红后绿。
- `git diff` 摘要和关键文件说明。
- 测试、lint、build 命令和结果。
- 没覆盖到的风险点。
- 需要人工 Review 的重点。
- 出问题时怎么回滚。

社区实践里有两个提示词也挺好用：

```text
Prove to me this works. Compare the diff against main and show the evidence.
```

```text
Knowing everything you know now, scrap this approach and propose the simpler implementation.
```

前一句是让它拿证据，不要只写结论。后一句适合在第一版方案能跑但很绕的时候用。Codex 已经读过一轮上下文，再让它重新想一次，往往能把实现收得更干净。

不过最后还是要自己看 diff。Codex 的总结不能代替 Review。它说“只改了测试”，你也得打开关键文件看一眼；它说“没有风险”，你也要自己想想事务、并发、权限、兼容性有没有漏。

## MCP 只接真正能省事的工具

MCP（Model Context Protocol，模型上下文协议）像一套接线规范：**外部系统把能力封装成 MCP Server，支持 MCP 的 AI 应用连接上来之后，就能发现这些能力并调用。**

![MCP 图解](https://oss.javaguide.cn/github/javaguide/ai/skills/mcp-simple-diagram.png)

真实开发里的上下文，不只在仓库里。

报错在 Sentry，需求在 Linear，接口说明在内部文档，设计稿在 Figma，复现步骤在浏览器，PR 讨论在 GitHub。你当然可以一段段复制给 Codex，但次数多了就很烦。

MCP 适合解决这种问题。按当前 Codex MCP 文档，Codex 支持 STDIO MCP Server 和 Streamable HTTP Server，Streamable HTTP Server 支持 Bearer token 或 OAuth 认证。具体 server 类型、认证字段和配置方式，还是以当前 MCP 文档为准。

比如添加 Context7 文档 MCP：

```bash
codex mcp add context7 -- npx -y @upstash/context7-mcp
```

加完之后，可以在 TUI 里用 `/mcp` 看当前服务器状态。

这里有个取舍：**MCP 不是越多越好。**

我更建议只接高频、明确、最好先只读的工具。经常查线上错误，就接 Sentry 或日志平台；经常改前端，就接浏览器、Playwright、Figma；经常处理 PR，就接 GitHub。带写权限、带 token、能操作外部系统的 MCP，先克制一点。

可以按风险分三层：

- 只读 MCP：查文档、查错误日志、读 Sentry、看 PR 信息。
- 半写 MCP：创建 issue、评论 PR、生成草稿、更新非生产文档。
- 高危 MCP：发版、改生产配置、删除资源、操作云平台或数据库。

默认先接只读工具。半写工具要限定 scope，高危工具单独审批和审计，token 尽量用最小权限和短期凭据。

工具越多，Codex 的选择空间越大，误用概率也会变高。

自己写 MCP Server 时，别只暴露工具参数。当前 Codex MCP 文档里提到，Codex 会读取 MCP 初始化时返回的 `instructions` 字段，并建议把最重要的说明放在前 512 个字符里。什么时候该用、什么时候不该用、返回内容怎么理解，这些都值得写清楚。

## Skills 用来存重复流程

规则文件和 Skill 解决的问题不太一样。

规则文件更适合放这个项目一直要遵守什么，比如：技术栈版本、启动命令、目录结构、错误码格式、哪些文件不能碰。

Skill 更适合放遇到某类任务时应该怎么做。比如做代码审查、写测试、改前端页面、网页调研、写技术文章，这些任务每次流程都差不多，就没必要每次都在聊天里重新提醒一遍。

小 G 之前写过两篇相关的文章：[Agent Skills 是什么？和 Prompt、MCP 到底差在哪？](https://javaguide.cn/ai/agent/skills.html) 和 [AI 编程必备 Skills 推荐](https://javaguide.cn/ai-coding/programmer-essential-skills.html)。

简单说，Skill 就是一份能被 Agent 按需加载的任务说明。它不是插件，也不是 MCP 工具本身，而是把某类任务的流程、约束、检查项和踩坑经验写进 `SKILL.md`。

Skill 不像 `AGENTS.md` 那样把全文每次都塞进上下文。默认情况下，Codex 会先看到 Skill 的名称和描述，用来判断是否该调用；只有真正用到这个 Skill 时，`SKILL.md` 正文和相关资源才会进入上下文。

![Agent 执行链路](https://oss.javaguide.cn/github/javaguide/ai/skills/skills-agent-execution-link.png)

这些重复性很强的流程，都适合沉淀成 Skill。比如写功能前固定走 TDD，先写失败测试再实现；代码审查时固定检查安全、事务、性能和边界条件；写技术文章时固定核对事实来源、引用、标题层级和 AI 味。

Skill 的价值就在这里：把重复提醒变成可复用的工作手册。Codex 的 Skills 和 Claude 的 Skills 在理念上接近，都是把重复任务流程沉淀成可复用能力；但两者的文件结构、触发方式、可用平台和安全模型，要分别以各自官方文档为准。

一份最小可用的 `SKILL.md`，可以先写到这个粒度：

```markdown
---
name: java-service-review
description: Review Java service-layer changes for transaction boundaries, null handling, logging, and regression tests.
---

Use this skill when reviewing Java service-layer changes.

Input materials:

- Current diff or target files.
- Related tests and error logs, if available.

Steps:

1. Read the changed service methods and related tests.
2. Check transaction boundaries, null handling, logging, and regression coverage.
3. Return findings with file and line references.

Do not rewrite code unless the user explicitly asks.

Done when:

- Findings are ordered by severity.
- Each finding explains the risk and a concrete fix direction.
```

现成 Skill 也可以直接用，比如 Superpowers 把 TDD、Code Review、Spec-Driven、Git Worktree、子 Agent 协作这些流程封装好了。

我在 [AI 编程必备 Skills 推荐：TDD、代码审查与网页自动化实战](https://javaguide.cn/ai-coding/programmer-essential-skills.html) 这篇文章中有详细推荐。

但第三方 Skill 不要拿来就跑。`SKILL.md` 也是指令，里面如果带了危险命令、奇怪脚本、过宽权限，Agent 会照着做。装之前至少看一眼正文、`scripts/` 和 `references/`，确认它没有越权操作。

## Subagents 适合处理支线调查

长任务里，最占上下文的往往不是最终方案，而是中间调查过程。

比如排查一个复杂 Bug，Codex 可能要读几十个文件、翻一堆日志、试几个假设。最后真正有用的结论只有几条，但主会话已经被搜索结果和中间推理塞满了。

这种时候可以用 Subagents。

按当前 Codex 文档，Subagent workflow 默认启用，但 Codex 只有在你明确要求时才会 spawn subagents。每个 subagent 都会执行自己的模型和工具工作，因此会比单 agent 更耗 token。

当前文档里列出的内置 agent 包括：`default` 做通用兜底，`worker` 更偏执行和修复，`explorer` 更偏只读探索。自定义 agent 配置格式、内置 agent 名称和可见入口都可能随版本变化，实际以 `/agent`、官方 Subagents 文档和本机版本为准。你也可以在 `~/.codex/agents/` 或 `.codex/agents/` 里放自定义 TOML Agent。

比较适合拆出去的任务长这样：

```text
Review current branch against main.
Spawn one subagent for each topic: security, concurrency, tests, maintainability.
Wait for all agents, then summarize findings with file references and severity.
Do not modify files.
```

这类任务边界清楚，也天然并行。

不适合拆的是很小的改动。改一个 DTO 字段还开 4 个 subagent，沟通成本可能比修改本身还高。我的习惯是：主会话负责目标、取舍和最后验收；subagent 只处理局部、明确、能独立汇报的事。

还有一点要留意：Subagents 继承当前 sandbox 策略。交互式 CLI 里，非当前 thread 的 approval 请求也可能弹出来，批准前看清楚是哪个 agent 发起的请求。

## Automations 别一上来就全自动

Codex App 里的 Automations 适合跑重复任务，比如每天扫近期提交、每周生成 release note、定时检查 CI 失败、汇总未处理告警。

它不是拿来“自动修复一切”的。

Codex App 的 Automations 要区分类型。Thread automation 绑定当前 thread，适合让 Codex 回到同一个对话里继续检查；standalone / project automation 可以按 schedule 启动独立运行。项目级 automation 运行时，本地 Codex App 所在机器要开机，Codex 要运行，项目路径也要还在磁盘上。Git 仓库任务可以在本地项目里跑，也可以在 dedicated background worktree 里跑。Automations 使用默认 sandbox 设置，如果给了 full access，后台任务风险也会变高。

我觉得比较稳的顺序是：先把流程写成普通 prompt，手动跑几次；如果每次都在复制同一套步骤，就沉淀成 Skill；等 Skill 稳定之后，再做成 Automation。

也就是说，Skill 定方法，Automation 定时间。Automation 的 prompt 也要写成可独立运行的 durable prompt，不要依赖上一次对话里的隐含上下文。

比如“每天自动修复所有 Bug 并提交 PR”，听起来很省事，真实项目里大概率制造一堆要人收拾的 diff。更靠谱的是“每天扫描最近 24 小时的 CI 失败并汇总原因”。先让它报告，再决定要不要改。

## 常用命令记几类就够了

Codex CLI 的 slash command 会变，CLI、Codex App、IDE Extension 看到的命令也不一定完全一致。下面这些命令只作为当前使用经验，实际以你所在 surface 的 `/` 弹窗和 `/help` 为准。

我一般记几类：

- 控制会话：`/permissions`、`/model`、`/fast`、`/status`、`/clear`。
- 看上下文和改动：`/diff`、`/compact`、`/copy`。
- 扩展能力：`/agent`、`/mcp`、`/hooks`、`/plugins`、`/apps`。
- Review 和恢复：`/review`、`/fork`、`/resume`。

命令只是入口，不是工作流本身。真正决定结果的，还是任务边界、项目规则、验证标准和权限设置。

## 几个我常用的工作流

接手陌生项目时，我会先让 Codex 当临时向导：

```text
不要修改文件。
请解释用户登录流程，从 HTTP 请求进入到 session 写入为止。
列出关键类、方法、配置项，以及你认为需要人工确认的隐式约束。
```

它总结出来的内容要抽查，尤其是跨服务调用、灰度配置、历史兼容逻辑。让它列文件和方法名，比只听自然语言总结可靠。

修 Bug 时，不要只说“帮我修一下”。我更愿意把材料摊开：

```text
下面是失败测试、错误日志和复现步骤。
先定位根因，不要马上改代码。
找到根因后，先补一个能复现的测试，再修改实现。
完成后运行相关测试，并说明为什么这个测试能覆盖问题。
```

如果它连续两轮都在同一个错误方向上打转，别继续追问“再试试”。停下来，让它复盘已经知道什么、哪些假设被证伪、下一步还缺什么证据。

TDD 对 AI 编程也很有用：

```text
先不要改实现。
为 OrderStatusService 写一个失败测试，覆盖已支付订单重复回调时不能重复扣库存的场景。
测试失败后再改实现，直到测试通过。
```

这个顺序能先固定期望行为，再让 Codex 去实现。

前端任务要更具体一点。别只说“现代、简洁、高级”，这类词太空，最后很容易得到紫色渐变、大圆角卡片、营销页布局。后台系统尤其容易翻车。

```text
这是后台运营页面，信息密度优先，不要营销页风格。
使用现有 Ant Design 组件，不新增 UI 库。
参考 src/pages/UserList.tsx 的筛选区、表格和分页布局。
主色沿用 CSS 变量，不要新增渐变背景。
完成后启动本地页面，检查移动端和桌面端是否有文本重叠。
```

PR Review 也一样，范围越窄越好：

```text
Review current branch against main.
Focus only on correctness, transaction boundaries, null handling, and missing tests.
Return findings ordered by severity with file and line references.
Do not comment on style unless it can cause a bug.
```

Codex 有时会把“可能更好”说得像“必须修”。Review 结果里真正要优先处理的，是会导致 Bug、安全问题、数据不一致、兼容性破坏和测试缺口的发现。

## 安全边界

Codex 能读文件、写文件、跑命令、接 MCP、调浏览器。能力越强，边界越要清楚。

我建议至少守住几条线：

- 不把生产数据库密码、云厂商长期 token、SSH key 暴露给 Codex。
- 不让它默认读取 `.env`、证书、数据库 dump、生产日志和私钥目录。
- 不让它直接操作生产环境，除非有临时凭据、审批和审计。
- 不允许默认 push 到主分支或强推远端分支。
- 不在无隔离环境里执行来源不明的远程脚本。
- 不把写权限 MCP 一次性全接上。

真的要跑高权限自动化，就放进容器、临时账号、最小权限凭据和独立 worktree 里。AI 写错代码还能 Review，AI 拿错权限就麻烦多了。高权限自动化还要保留操作日志、命令输出、diff 和审批记录，并确保能快速回滚。

## 容易翻车的地方

任务太虚，是最常见的问题。你只说“优化一下”，Codex 就只能自己猜，最后很可能搜一堆文件、改一堆边缘代码。把目标、上下文、限制和完成标准补齐，通常能少掉很多无效探索。

过度规划也会浪费时间。小改动不需要长计划，直接做、看 diff、跑验证就行。计划阶段（Plan）更适合跨模块、风险高、调用链不清楚的任务。

`AGENTS.md` 太胖时，效果反而会变差。规则很多，但真正关键的几条被冲淡了。它应该从真实错误里长出来：Codex 反复踩过的坑，写进去；代码里一眼能读出来的事实，删掉。

工具和权限也别一次放太开。MCP 接太多，Codex 会选错；权限给太宽，后台任务能做的事就超出你的心理预期。高权限任务放隔离环境，日常开发保持最小权限。

最后是验证缺失。代码看着合理，不代表行为对。测试、lint、构建、截图、日志，这些东西至少要有一种。长会话开始变慢、变飘时，就 `/compact`，必要时 `/fork` 或新开 thread。多 agent 也一样，主会话做决策，subagent 只处理局部研究。

## 按风险分层使用

小任务不用复杂化。改文案、补日志、改一个明显的字段映射，直接让 Codex 执行，结束后看 `/diff`，跑对应单测就行。

中等任务先走计划阶段（Plan），再执行，再验证。比如改一个模块内的业务流程、补一个接口、重构一个局部服务，最好先让 Codex 读相关文件，列出修改点和验证命令，你确认后再动手。

高风险任务先只读分析。支付、权限、数据迁移、生产配置、并发一致性这类改动，先让 Codex 找调用链、风险点和测试缺口；人工确认关键判断后，再用 TDD 或小步提交推进。环境上尽量用 worktree、容器、临时凭据和更收紧的权限。

自动化任务也别一步到位。先手动跑通一两次，再沉淀成 Skill；等 Skill 稳定，再做成 Automation。高权限自动化要额外保留审计记录和回滚方案。

## 总结

Codex 用顺之后，感觉会从“让 AI 写代码”变成“调度一个能自己读仓库、跑命令、交付 diff 的工程助手”。

但越是这样，越不能只盯着 prompt。

任务边界、项目规则、权限控制、验证标准、外部工具、可复用流程，这些东西一起决定了 Codex 最后交出来的质量。我的建议还是那句：先让它在一个小范围里稳定做对，再慢慢把边界往外推。

别一上来就全自动。
