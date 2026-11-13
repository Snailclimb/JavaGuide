---
title: Loop Engineering 是什么？为什么说它是新瓶装旧酒？
description: 从 Agent Loop、Context Engineering、Harness、Skills、MCP、Sub-agent 和 Claude Code /loop、/goal 出发，说明 Loop Engineering 到底解决什么问题，以及什么时候值得用。
category: AI 应用开发
head:
  - - meta
    - name: keywords
      content: Loop Engineering,Agent Loop,AI Agent,Claude Code,/loop,/goal,Context Engineering,Harness Engineering,Agent Skills,MCP,AI 编程
---

假设要让 Agent 修好 `auth` 模块的失败测试，最多尝试 5 轮。第一轮结束时，如果只得到一句“还没修好”，第二轮仍得重新查日志。留下失败用例、测试命令、退出码和 diff，后续任务才能知道已经尝试过什么。

这些记录可以放进文件、Issue、Linear 卡片或数据库。任务入口再用标识取回它们，例如根据 CI 运行标识查到对应的排查进度。

## Loop Engineering 到底是什么？

**Loop Engineering 把 Agent 的多次执行组织成可以继续、检查和停止的流程。** 除了本轮的 Prompt，还需要安排什么时候开始下一轮，以及下一轮读取哪些结果。调度、工作流和状态保存都可以沿用已有实现。

Claude 团队的 [Getting started with loops](https://claude.com/resources/articles/getting-started-with-loops)（2026 年 6 月 30 日）按触发方式和停止条件介绍了不同循环。例如，定时检查部署是在等待外部状态变化；修复失败测试，则可以根据本轮验证结果继续修改。后文的 `/loop` 和 `/goal` 分别对应这两类安排。

![Loop Engineering 外层循环](https://oss.javaguide.cn/github/javaguide/ai/agent/loop-engineering-outer-loop.webp)

读取记录后，调度程序再决定是否继续。测试通过就结束；未通过且还有轮次和预算，可以再启动一次。没有必要的权限，或有待确认的业务判断，就把当前进度交给人。即使问题没解决，用完额度也要停。

这里还容易漏掉代码版本。测试通过后又改了一次文件，旧结果就不能用来证明新代码通过。日志中的命令和退出码要能对应到当时的版本，lint、类型检查、截图和审查意见也是如此。

## 它其实借了哪些老概念？

### Agent Loop / ReAct：内层循环早就存在

![Agent Loop 工作流程](https://oss.javaguide.cn/github/javaguide/ai/agent/agent-loop-flow.png)

Agent 调用工具后，通常还要把输出交回模型，模型再决定继续调用工具还是返回结果。这是 [AI Agent 基础概念](https://javaguide.cn/ai/agent/agent-basis.html)中的 Agent Loop。ReAct 把 Reasoning 与 Acting 交替组织起来，下一步会参考上一步的外部反馈。

因此，一次排查就可能已经有很多次工具调用。本文所说的外层循环，要等这次排查结束后再判断是否重新启动任务。它和工具调用之间的循环不是同一个计数范围，表中用内外层区分；其他实现可以采用不同的组织方式。

| 层级                  | 谁在循环             | 每轮做什么                               | 典型停止条件                 |
| --------------------- | -------------------- | ---------------------------------------- | ---------------------------- |
| 内层 Agent Loop       | Agent 自己           | 思考、调用工具、观察结果、继续下一步     | 不再需要工具，返回最终结果   |
| 外层 Engineering Loop | 调度系统或人写的流程 | 唤醒 Agent、分配任务、验证结果、记录状态 | 达成目标、超预算、失败转人工 |

### Workflow / Graph / Loop：可控回边早就有

工作流中的“审核 → 修改 → 再审核”，就是一段循环。审核后指回修改节点的有向边叫回边，用它可以重复执行先前的步骤。

![Workflow、Graph、Loop 三者关系概览](https://oss.javaguide.cn/github/javaguide/ai/workflow/workflow-graph-loop-relation.svg)

从审核节点返回修改节点时，可以顺便检查次数和预算。也就是说，图上有回边，不代表每次审核失败都必须继续。当前任务无权访问复现所需的生产数据，就该退出并交接。如何用状态和条件边表达这些分支，见 [AI 工作流中的 Workflow、Graph 与 Loop](https://javaguide.cn/ai/agent/workflow-graph-loop.html)。

执行跨越多个会话时，还得有恢复入口。[Anthropic 的长任务 Harness 实践](https://www.anthropic.com/research/effective-harnesses-for-long-running-agents)会让新会话先读进度、看 Git 历史并跑基础测试。旧记录说明上次做过什么，重新运行测试则能发现项目当前的状态是否已经变化。

### Context Engineering：每一轮该给 Agent 看什么

假设第一轮报连接超时，第三轮连接已经正常，只剩业务断言失败。这次请求就应围绕当前断言组织材料，第一轮的完整日志可以留在外部文件里。

![Context Engineering 和 Prompt Engineering 差别](https://oss.javaguide.cn/github/javaguide/ai/context-engineering/context-engineering-vs-context-engineering-dimension-comparison.png)

这次可以只带上当前 diff、失败断言，以及“已排除连接超时”的结论。结论旁边保留 traceId 和日志路径，需要复核时再读原文。旧工具结果太长，也可以按这个方式移出上下文。

`AGENTS.md`、`CLAUDE.md` 等项目规则仍由对应宿主加载。裁剪日志不应连同规则一起裁掉。移到磁盘的材料则要留下读取入口，不能只存一个文件，就默认下一轮会找到它。

### Harness Engineering：模型外面的执行环境

[Harness Engineering](https://javaguide.cn/ai/agent/harness-engineering.html)讨论模型以外的运行环境。按 Model + Harness 的划分，模型负责推理和生成，工具怎么执行、权限怎么检查、失败后怎么恢复，则由 Harness 提供相应机制。沙箱、反馈和执行观测也属于这部分。

![Harness 和 Prompt/Context Engineering 的关系](https://oss.javaguide.cn/github/javaguide/ai/harness/harness-engineering-layers-arch.png)

CI triage（失败分拣与排查）需要读取日志、运行测试，这些能力由 Harness 提供。外层 Loop 可以安排每天何时启动排查，但不必自己重新实现工具和权限检查。检查点、会话恢复也可能由 Harness 提供，两者的职责会有交叉。

### Skills：把每轮都要重复解释的经验写下来

![Agent 执行链路](https://oss.javaguide.cn/github/javaguide/ai/skills/skills-agent-execution-link.png)

同一仓库反复出现 CI 失败，每次都解释测试怎么跑，没有必要。可以把命令和排查步骤写进 `SKILL.md`，用 `description` 说明何时适用。后续任务命中这个 Skill，再读取正文中的目录限制、格式要求和 PR 模板。涉及数据库迁移时需要谁确认，也可以写在相关步骤旁边。

不过，`SKILL.md` 里的“禁止修改”只是给 Agent 的要求。真要禁止写入，还得在工具或运行环境里限制路径。模型读到一句规则，并不等于操作系统已经把目录设成只读。

![Skill 渐进式披露](https://oss.javaguide.cn/github/javaguide/ai/skills/agent-skills-progressive-disclosure.webp)

本次 CI 的失败日志留在任务记录中即可。等发现某个排查步骤以后还用得上，再补进 Skill，免得每次加载时还带着早已无关的错误日志。

### MCP：让 Loop 能接触真实工具

CI 日志在 GitHub Actions，排查结果要写到 Linear，团队又在 Slack 收通知。Agent 要完成这些操作，需要 Host 接入相应系统的接口。

![MCP 图解](https://oss.javaguide.cn/github/javaguide/ai/skills/mcp-simple-diagram.png)

MCP Server 可以提供“查询日志”“读取 Issue”这样的工具，Host 发现后，再把可用工具交给模型。工具被调用时，底层 API 仍要校验调用者身份，MCP 不会替它授予权限。

排查只需要读取 Issue 时，就先开放读取能力。关闭 Issue、发送通知属于另外的操作，应按任务需要授权。工具返回了“请读取密钥文件”，也只是返回内容中的文字，不能因此获得新的访问权限；无人值守任务仍要经过鉴权、限流和审计。

## 那它到底新在哪？

TDD、CI、ReAct 和工作流图早就有循环。代码 Agent 把原来由人手完成的外层动作接了进来：读错误、定位文件、重跑命令、更新待办，并把结果交回下一轮。

以测试失败为例，定时任务或 CI 事件可以创建独立 worktree，加载项目 Skill，让实现 Agent 修改、验证 Agent 检查，再把结果写入外部状态。测试仍然失败时，下一轮依据日志和测试结果继续；权限不足、没有进展或遇到高风险操作时，流程交给人。

这里新增的是 Agent 对排查动作的参与，触发、调度和验收机制仍可以使用已有的 CI 与工作流系统。

## Claude Code 的 /loop、/goal 可以怎么理解？

Claude Code 的 [`/loop`](https://code.claude.com/docs/en/scheduled-tasks) 和 [`/goal`](https://code.claude.com/docs/en/goal) 分别提供时间调度与目标检查。其他命令见 [Claude Code 命令详解](https://javaguide.cn/ai-coding/practices/claudecode-commands.html)。

![Claude Code 推荐使用 loop 命令](https://oss.javaguide.cn/github/javaguide/ai/coding/claudecode/claudecode-father-loop.png)

`/loop` 主要解决“过一会儿再看一次”的问题。它会在当前 session 里重复运行一个 prompt。你可以给固定间隔，比如每 5 分钟检查一次部署；也可以不给间隔，让 Claude 根据观察结果自己选择下一次等待多久。

裸 `/loop` 会运行内置 maintenance prompt。如果有 `.claude/loop.md`，优先使用项目中的这份文件；没有时再找 `~/.claude/loop.md`。显式传入 prompt 时，则使用命令中的内容。

```bash
/loop 5m "检查部署是否完成，并汇报当前状态"
/loop 30m /code-review
/loop "检查 PR 的 CI 和 review comments，有变化就处理，没有变化就延后"
```

`/goal` 接收一个完成条件。每轮结束后，独立的评估模型读取对话中已经出现的证据，判断目标是否完成；未完成时继续。它不会自己运行测试或打开文件，因此执行 Agent 要把命令结果展示出来。目标完成、被判断为无法完成，或遇到需要用户处理的错误时，目标会被清除。

```bash
/goal auth 模块所有单元测试通过，并且 npm test -- tests/auth 退出码为 0；最多 5 轮，连续 2 次失败原因相同就停止并汇报
/goal src/legacy 下组件迁移完成，npm run build 通过，且 git diff 只包含 src/legacy 和对应测试文件
```

示例里的“最多 5 轮”也写在目标条件中，由模型根据对话判断。需要程序严格限制调用次数时，应在执行器中另设计数器，不能把自然语言条件当作硬性配额。

需要定制时，可以通过 Agent SDK 编排，或在 Stop hook 中增加完成检查。不过，Stop hook 处理的是一轮响应结束时的事情。对写入目录的权限检查，应在工具执行前完成，不能留到这个阶段。

选择这两个命令时，要看下一步是否需要等待外部变化。部署还在外部系统中运行，Claude 需要的是过一会儿再查，所以用 `/loop`。测试修复则要读取本轮失败结果，继续定位和修改，通常用 `/goal` 就能接着做。

**定时间隔与实际开始时间并不相同。** `/loop` 到期时，Claude 可能还在处理当前请求。调度提示要等它空闲后才执行；若已经错过多个周期，也只触发一次，不逐个补跑。

另一处要单独检查的是会话恢复。`--resume` / `--continue` 恢复了对话，不代表所有任务都跟着恢复。以下是 **2026-11-11** [官方文档](https://code.claude.com/docs/en/scheduled-tasks#limitations)列出的限制：

- `CronCreate` 创建的周期任务，未过期时可以由 `--resume` / `--continue` 恢复。周期任务创建满 7 天后会过期。
- 一次性任务已经错过执行时间，就不会恢复。
- 动态间隔的 `/loop` 需要重新启动，不随会话恢复。

需要长期保留的任务，可以交给 Claude 云端定时任务、Desktop 定时任务，或已有的 GitHub Actions、CI/CD 和调度系统。选哪种，要看它需要读取哪里的文件。

Claude 云端任务不依赖本机开机，但默认使用云端仓库副本，本机未提交的改动不会自动带过去。Desktop 任务能读取本地文件，执行时机器必须开启；重启后还保留任务配置，并不表示关机期间也能执行。

OpenAI 的 [Scheduled tasks 文档](https://learn.chatgpt.com/docs/automations)同样区分执行环境。桌面任务访问本地项目，要求电脑和应用运行，Git 项目可选原目录或独立 worktree；网页任务不能直接读电脑上的文件夹。准备仓库、日志和进度记录时，应放在任务实际能访问的位置。

定时任务启动前，先手动跑一次相同任务，确认它能读到日志、执行验证并留下结果。需要改代码时，可以先保存已确认的版本，再使用独立 worktree。worktree 便于分开查看 diff，并不是文件或网络权限的沙箱；权限仍取决于运行环境。

## Loop 可以分成几类？

Loop 的差别主要在于“谁触发下一轮”。`/loop` 和 `/goal` 分别代表按时间唤醒、按完成条件继续；CI 事件和人工审批也可以成为触发点。下表按这个维度归类。

| 类型          | 触发方式                     | 适合任务                      | 代表工具                                      |
| ------------- | ---------------------------- | ----------------------------- | --------------------------------------------- |
| 时间驱动 Loop | 每 N 分钟、每天、每周        | PR babysit、CI 检查、日志巡检 | `/loop`、Codex Automations、cron              |
| 事件驱动 Loop | CI 失败、Issue 创建、PR 更新 | 故障分拣、评论处理、告警摘要  | GitHub Actions、Webhook、Claude Code Channels |
| 目标驱动 Loop | 上一轮结束后检查目标是否满足 | 修测试、迁移 API、补覆盖率    | `/goal`、Stop hook、Agent SDK                 |
| 人工审批 Loop | 关键动作前停下来确认         | 高风险改动、发布、权限变更    | approval gate、draft PR、review queue         |

表里的分类不要求四选一。CI 事件启动任务后，修复可以按目标继续；同一项任务到了发布步骤，也可以停在人工审批处。

## 一个可落地的 Loop 长什么样？

假设要处理一个仓库的 CI 失败，先把输出定为排查摘要，暂时不自动修代码。上午 9 点的定时任务或 CI 失败事件都可以触发它。Agent 读取失败记录、相关 PR 和最近提交，再判断可能的原因：环境异常、偶发测试失败、代码回归，或者依赖变化。

开始排查前，读取项目的 `AGENTS.md` 和 `ci-triage` Skill，再按报错定位相关模块。没有必要为了分析一条失败，把整仓文件都读一遍。

排查结果写到 `TODO.md`，项目已授权时也可以写入 GitHub Issue 或 Linear 卡片。记录里要能找到这次 CI 和关键报错。比如标记“疑似偶发”，这是待确认的判断；本地已经复现，则附上实际运行的命令和结果。二者不能混写。

本次排查最多尝试 3 轮，不推送代码，也不改生产配置。后面的任务模板还会限制单个失败项的复现次数。

![CI 排查 Loop 示例](https://oss.javaguide.cn/github/javaguide/ai/agent/loop-engineering-ci-triage-loop.webp)

排查稳定以后，再增加自动修复。可以先选修复规则明确的格式问题，在独立 worktree 中改完并运行目标测试。依赖升级和快照更新还涉及兼容性、预期行为，即使 diff 很短，也要分别核对。

这一版只把验证过的改动做成 PR，仍由人合并。另一个 Agent 可以根据项目 Skill 和 diff 复核，但不能用它的一句“通过”替代测试。失败或无法确认的项继续留给人处理。

把前面介绍的组件放到这个任务里，各自承担的工作如下：

| 部件                | 在这个例子里做什么                     |
| ------------------- | -------------------------------------- |
| Automation          | 每天或 CI 失败时启动                   |
| Skill               | 固化 CI 排查流程、测试命令、仓库规则   |
| MCP / Connector     | 读取 GitHub、CI、Issue、日志平台       |
| Context Engineering | 只加载失败相关日志、文件和规则         |
| Worktree            | 隔离自动修复分支，避免污染主工作区     |
| Sub-agent           | 一个负责实现，一个负责验证             |
| Memory / State      | 记录已尝试方案、失败原因和下一步       |
| Stop Condition      | 测试通过、达到重试上限、遇到高风险操作 |

第二天定时任务再次读到同一条失败时，先查它是否已经处理。有可能开发者已经修好，对应提交也通过了 CI，此时只需更新记录，不要再按昨天的报错启动修复。

## 什么场景值得做 Loop？

CommonJS 到 ESM 迁移有明确的剩余工作：旧引用还没处理完，就继续迁移；本轮构建没通过，就先处理构建错误。依赖升级也可以比较升级前后的测试与 build 输出。这类任务不只知道“还没完成”，还能据此安排下一轮。

我会谨慎使用“提高覆盖率”这类单指标目标。数字从 62% 变成 75%，可能只是新增用例执行了更多代码，并没有断言返回值。验收还是要看断言验证了什么。[Anthropic 的 Agent 评测文章](https://www.anthropic.com/research/demystifying-evals-for-ai-agents)也区分了完成声明与环境中的实际结果。文档同步同理，对照代码 diff 核对接口、字段和配置，才知道同步是否正确。

有些任务可以自动准备材料，但结果需要人选。比如品牌文案、增长策略，可以循环到约定的候选和评审资料齐备，然后交给人判断。PR / Issue 分拣也可以先交付分类、摘要和优先级建议；修改负责人、发送通知则另外授权。

生产数据库、权限系统、支付链路的改动，需要各自的审批和恢复方案。老代码项目连故障都不能复现时，也应先补日志、测试及回滚方式。把任务交给循环，并不会补上这些缺失的条件。

## 最容易踩的坑

### 目标写得太虚

这条目标没有说明要改哪里，也没说明完成以后怎样检查：

```text
/goal "优化这个项目，让代码质量更好"
```

如果实际问题只是 auth 模块的测试失败，就把目标限定到这里：

```text
/goal "auth 模块失败的单元测试全部通过，只允许修改 src/auth 和 tests/auth；每轮修改后运行 npm test -- tests/auth 并展示退出码；最多 5 轮；如果连续 2 次失败原因相同，停止并汇报"
```

有了第二条指令，改动是否越界，可以检查 `src/auth`、`tests/auth` 以外的 diff；测试有没有通过，可以检查 `npm test -- tests/auth` 的输出和退出码。写在目标里的 5 轮限制仍由模型判断，要作为硬上限使用，还得让执行器计数。

至于“连续两次失败原因相同”，模型可能对同一种错误给出不同总结。程序需要比较时，应先归一化失败测试和错误类型，再作判断。

### 把 Agent 自评当验收

“auth 已修复”是 Agent 的结论，实际测试输出才说明它验证过什么。涉及界面或业务含义的改动，还要结合截图和审查意见。

换另一个 Agent 检查时，也要给它需求和执行结果。独立上下文能多提供一次复核，不能代替这些材料，涉及生产的操作仍按项目要求进行人工审批。

### 忘了成本上限

“最多 5 轮”只限制了循环次数，一轮仍可能读取大量文件或发起多次工具调用。因此还要分别设置最大工具调用次数、单任务或单日的 Token / 金额预算，达到任一上限就停止。

预算未耗尽也可能需要提前结束。连续两轮仍是同一个失败测试、同一类错误，且没有取得新证据时，应保留当前 diff 和日志，汇报未解决的问题。低价值任务可以只输出摘要，省去自动修复和复验的成本。

### 权限给得太大

排查日志、创建 PR 和合并 PR，需要的权限不同。读取失败记录不应顺带获得修改目标分支的能力。删除文件、改生产配置、发外部消息、写业务数据库，如果没有预先授权，就应停下来确认，具体审批规则由项目配置。

接入工具时，还要检查 MCP Server 的来源，以及工具 description、返回内容和 Prompt 模板。这些内容可能携带提示词注入，诱导 Agent 使用已有权限去做任务以外的操作。本文的 CI 任务可以按阶段开放能力：

| 阶段        | Agent 能做什么               | 人负责什么   |
| ----------- | ---------------------------- | ------------ |
| L0 只读摘要 | 读日志、读 Issue、生成报告   | 判断是否采纳 |
| L1 本地复现 | 运行指定测试、定位失败       | 决定是否修复 |
| L2 草稿修复 | 在 worktree 里改代码、跑测试 | Review diff  |
| L3 创建 PR  | 提交分支、写 PR 描述         | 审查、合并   |
| L4 自动合并 | 通过策略后自动合并           | 只处理异常   |

不必一路升到 L4。L1 的复现结果可靠以后，可以先开放 L2，让开发者审查 worktree 里的 diff。只有问题类型固定、测试覆盖主要风险、回滚经过验证的任务，才考虑自动合并，运行后仍需审计。涉及业务判断、权限变更或业务数据写入时，继续保留人工审批。

![Loop 的安全边界](https://oss.javaguide.cn/github/javaguide/ai/agent/loop-engineering-safety-boundary.webp)

## 第一版先别急着自动修

把第一版任务写成可直接执行的说明时，可以用下面的模板。它允许运行指定测试、更新 `TODO.md`，所以需要有限的写入权限；业务代码修改和外部发消息不在允许范围内。运行前也要确认测试命令连接的是测试环境。

```text
任务：每天看最近 24 小时的 CI 失败，产出排查摘要，供人处理。

允许做：
- 读 GitHub Actions、最近提交、失败测试日志，以及和报错直接相关的文件。
- 定位到具体测试时，可以跑对应测试确认是否复现。
- 把结论写进 TODO.md，带上 CI 链接、关键错误和建议负责人。

开始前：
- 先读取 AGENTS.md。
- 命中 CI 排查任务时加载 ci-triage Skill。

不允许做：
- 不改代码，不创建 PR，不发 Slack/邮件。
- 不读取整仓无关文件，不粘贴完整日志。
- 超过 10 个失败项就停；单个失败最多复现 2 次。
- 权限不足、日志缺失、需要业务判断时，直接标记人工处理。
```

先运行这份任务，再看实际记录：有没有读取无关目录，已经复现的测试是否反复执行，是否试图发送消息。任务描述写得清楚，还需要用执行记录确认它有没有照做。发现这些问题时，先调整权限和步骤，再考虑让它修代码。

一次本地复现后，可以按下面的 YAML 保存状态。`evidence` 用来找到 CI 记录，`action` 和 `result` 记录这次执行，`next_step` 留给后续处理。这里的 `max_attempts: 3` 限制整项排查的轮次；单个失败项最多复现 2 次，是上面任务描述中的另一项限制，计数不能因进入下一轮而重置。

```yaml
loop_id: ci-triage-2026-06-17
goal: "排查最近 24 小时 CI 失败"
status: running
scope:
  repos: ["backend-service"]
  max_items: 10
attempts:
  - item: "auth-test failure"
    evidence: "GitHub Actions run #12345"
    action: "ran npm test -- tests/auth"
    result: "reproduced locally"
next_step: "ask auth owner to review"
stop_condition:
  max_attempts: 3
  require_human_when:
    ["permission_missing", "production_change", "uncertain_root_cause"]
```

以后开放自动修复，可以在这份记录中补上 diff 和验证结果。不过旧记录中的 `reproduced locally` 只说明复现过故障，不能拿它作为修复后的验证结果。每次修改之后，都要记录新的验证。

## 把 Loop 接入生产流程前

### 什么会触发下一轮？

同一项 CI 失败可能刚触发一次事件任务，又被上午 9 点的定时任务扫到。入口可以不同，处理记录要使用一致的标识，例如仓库、提交和失败项的组合。需要并发领取任务时，靠数据库唯一约束或原子更新防止重复领取，仅让两个 Agent 各自“先查一下”仍有竞态。

### 什么时候继续，什么时候停？

`attempts` 中已经有相同命令和失败结果时，先看这一轮是否改变了测试输入或待验证的假设。什么都没变，再跑一次通常也解释不了原因。达到 `stop_condition` 则保存记录并交接，任务尚未完成也不能越过上限。

## Coding Agent 反复修不好，下一轮还要继续吗？

先比较失败证据有没有变化。修改了更多文件，并不代表更接近问题原因。假设 Agent 要修复订单金额计算错误，连续两轮只调整展示文案，原先失败的金额断言始终未变。第三轮如果仍围绕文案修改，就没有新的排查依据。

每轮保留失败用例、实际与预期结果、相关 diff，以及本轮想验证的原因。下一轮先回答：这次改动是否作用于失败路径？错误是否消失或发生了可解释的变化？有没有新增回归？测试通过是否只是因为删除或放宽了断言？

日志指向税费计算，就应当去查计算条件。若上一轮另外引入了回归，可以撤回这一轮能够确认归属的改动。回退前先检查 diff，尤其是共享工作区，不能把用户或其他任务的修改一并撤掉。

如果缺少金额规则的资料，或者仍然无法复现，交接时就写清缺什么、试过什么，并附上失败用例。获得新资料以后再继续查。仅仅换个说法重发目标，仍然是原来的排查条件；预算用完也必须结束。

## 总结

检查 Loop 是否接好了，可以让同一项排查连续运行两次。第二次应当读到上一次的记录，跳过已经处理的失败项，把尚未解决的问题接着往下查。定时器成功启动两次，并不能说明这些都已做到。

这部分确认以后，再考虑开放自动修复。保留下来的 diff、验证结果和未完成事项，既供下一轮使用，也供接手的开发者核对。
