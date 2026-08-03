---
title: Loop Engineering 是什么？为什么说它是新瓶装旧酒？
description: 从 Agent Loop、Context Engineering、Harness、Skills、MCP、Sub-agent 和 Claude Code /loop、/goal 出发，说明 Loop Engineering 到底解决什么问题，以及什么时候值得用。
category: AI 应用开发
head:
  - - meta
    - name: keywords
      content: Loop Engineering,Agent Loop,AI Agent,Claude Code,/loop,/goal,Context Engineering,Harness Engineering,Agent Skills,MCP,AI 编程
---

CI 失败后，Agent 可以读失败日志、定位相关文件、运行最小测试集，再把排查结果写回 Issue。第一次排查没有收敛时，任务还会遇到一个更实际的问题：下一轮由谁启动，继续读哪些材料，什么时候该停下来交给人处理？

Loop Engineering 讨论的就是这段外层流程。它负责把 Agent 的一次次执行接起来：CI、PR 或定时任务触发下一轮，项目规则和相关证据进入上下文，测试与审查决定结果是否可信，状态记录让后续任务可以从上次停下的地方继续。

从公开讨论看，这个名称在 **2026 年 6 月上旬** 开始热起来，Addy Osmani 于 6 月 7 日发表了相关文章。Claude Code 与 Codex 中的 `/loop`、`/goal`、Automations 等能力，配合 Skills、Sub-agent、工作区隔离和 MCP/Connector，已经能组成类似流程。

## Loop Engineering 到底是什么？

Loop Engineering 用来安排 Agent 的多轮任务。它把任务的触发方式、每轮可读取的材料和可执行的动作、验收信号、状态保存位置，以及停止或人工接管的条件放进同一条流程。

拿 `auth` 模块为例，`goal` 可以写成“测试全部通过，最多尝试 5 轮”。同一份任务配置还会记录触发来源、可访问的文件和规则、允许的修改范围，以及结果写入的位置。

假设 CI 触发了这项任务：Agent 先读取项目规则和失败日志，定位到相关文件后运行目标测试。测试输出、lint、类型检查、截图或审查评论会回到下一轮，帮助判断是否继续。已经试过的方案、失败原因和下一步则写入外部文件、Issue、Linear 卡片或数据库；达到轮次或预算上限，权限不足，或需要业务判断时，流程停止并交给人处理。

![Loop Engineering 外层循环](https://oss.javaguide.cn/github/javaguide/ai/agent/loop-engineering-outer-loop.webp)

Prompt、上下文和工具描述仍然决定一次模型调用如何执行。Loop 在调用前后补上任务调度、材料准备、结果验证和状态恢复，让下一轮可以接着上一轮继续处理。

## 它其实借了哪些老概念？

### Agent Loop / ReAct：内层循环早就存在

![Agent Loop 工作流程](https://oss.javaguide.cn/github/javaguide/ai/agent/agent-loop-flow.png)

Agent Loop 的基本顺序没有变化：读取当前上下文，交给 LLM 决定下一步，调用工具或生成结果，再把工具输出写回上下文；达到停止条件后结束。

ReAct 也是这个思路：Reasoning 和 Acting 交替进行，模型走一步看一步，拿到外部反馈后再决定下一步。

[AI Agent 基础概念](https://javaguide.cn/ai/agent/agent-basis.html) 中介绍过这条循环。线上故障排查、代码库阅读和测试失败定位都没有预先确定的完整路径，模型需要根据每次拿到的证据调整下一步。

这里要区分两层循环。Agent Loop 发生在一次任务执行中：模型推理、调用工具、读取结果，再决定下一步。外层 Loop 则在这次任务结束后工作，例如等待下一次 CI 事件、检查测试结果、保存排查记录，再决定是否重新启动 Agent。

| 层级                  | 谁在循环             | 每轮做什么                               | 典型停止条件                 |
| --------------------- | -------------------- | ---------------------------------------- | ---------------------------- |
| 内层 Agent Loop       | Agent 自己           | 思考、调用工具、观察结果、继续下一步     | 不再需要工具，返回最终结果   |
| 外层 Engineering Loop | 调度系统或人写的流程 | 唤醒 Agent、分配任务、验证结果、记录状态 | 达成目标、超预算、失败转人工 |

### Workflow / Graph / Loop：可控回边早就有

在工作流图里，Loop 通常由回边表示。

回边是一条从后续节点指向前面节点的有向边：流程已经走到“审核”节点，却因为某个条件不满足，沿着这条边回到“修改”节点，再执行一次后续步骤。

![Workflow、Graph、Loop 三者关系概览](https://oss.javaguide.cn/github/javaguide/ai/workflow/workflow-graph-loop-relation.svg)

“生成初稿 → 审核 → 不通过就修改 → 再审核”中，审核不通过的条件边就是从“审核”回到“修改”的回边；审核通过则离开循环。 [AI 工作流中的 Workflow、Graph 与 Loop](https://javaguide.cn/ai/agent/workflow-graph-loop.html) 对这套结构有更完整的说明。运行配置还要写明最大轮次、超时、Token 预算和失败后的降级方式，防止回边没有出口。

代码 Agent 把同一条回边延伸到 Claude Code、Codex、CI、GitHub、Issue 系统和本地仓库：测试失败后读取错误、修改文件、重跑命令，再由外部信号决定是否继续。

### Context Engineering：每一轮该给 Agent 看什么

一个 CI 故障查到第三轮还没有收敛时，原始日志、测试输出、改动记录和相互矛盾的判断很容易堆在一起。它们全塞进上下文，项目规则反而容易被淹没，已经排除过的方案也可能再跑一遍。

![Context Engineering 和 Prompt Engineering 差别](https://oss.javaguide.cn/github/javaguide/ai/context-engineering/context-engineering-vs-context-engineering-dimension-comparison.png)

每轮调用前应先放入 `AGENTS.md`、`CLAUDE.md` 和编码规范等常驻规则，再按当前失败加载相关文件、测试输出、Issue 描述或设计文档。traceId、错误码、日志路径这类排障入口保留原值；已验证的过程压成结论并写入外部状态。

窗口接近上限时，需要在压缩历史、清理旧工具结果和落盘进度之间取舍。这样下一轮可以直接接上证据，避免重新读项目、猜规则或重复解释同一个错误。

### Harness Engineering：模型外面的执行环境

在 [Harness Engineering](https://javaguide.cn/ai/agent/harness-engineering.html) 中，Agent 可以拆成 Model + Harness。模型负责推理和生成，Harness 提供环境、工具、反馈、沙箱、权限、观测和恢复。

![Harness 和 Prompt/Context Engineering 的关系](https://oss.javaguide.cn/github/javaguide/ai/harness/harness-engineering-layers-arch.png)

可以把 Harness 看成单轮任务的运行环境。CI triage 能读哪些日志、能否修改文件、能运行哪些测试命令，都由 Harness 决定；Loop 再决定什么时候把这套环境启动一次、结果保存在哪里、需不需要交给另一个 Agent 检查。只有目标而没有文件权限、验证命令和失败处理，任务仍然无法无人值守地执行。

### Skills：把每轮都要重复解释的经验写下来

![Agent 执行链路](https://oss.javaguide.cn/github/javaguide/ai/skills/skills-agent-execution-link.png)

CI 排查重复发生时，仓库的测试命令、禁止修改的目录、格式化要求、PR 模板和数据库迁移确认规则不应每轮重新解释。

这些内容可写进 Skill：`description` 匹配 CI 排查任务，`SKILL.md` 保存允许读取的目录、测试命令、PR 模板和迁移确认规则。任务命中后加载正文，下一次失败仍沿用同一套限制。

![Skill 渐进式披露](https://oss.javaguide.cn/github/javaguide/ai/skills/agent-skills-progressive-disclosure.webp)

Skill 记录的是项目里反复要用的操作说明，而非为当前对话临时拼出来的一段 Prompt。

### MCP：让 Loop 能接触真实工具

GitHub Actions、日志平台、Linear 和 Slack 各有自己的 API。CI 排查、PR babysit 和任务分拣在这些系统之间来回切换；全部单独适配时，Agent 面前会出现多套工具描述和调用方式。

![MCP 图解](https://oss.javaguide.cn/github/javaguide/ai/skills/mcp-simple-diagram.png)

MCP Server 将 GitHub、Issue 系统、日志平台、内部文档和数据库提供为可发现工具；Agent Runtime 负责选择，业务系统仍执行权限和数据校验。

工具权限需要按副作用配置。无人值守 Loop 的写权限过大时，可能改错数据、发错消息、重复调用昂贵接口，或被提示词注入诱导读取无关文件；权限、审计、限流、脱敏和人工确认应随 MCP 工具一起部署。

## 那它到底新在哪？

TDD、CI、ReAct 和工作流图早就有循环。代码 Agent 把原来由人手完成的外层动作接了进来：读错误、定位文件、重跑命令、更新待办，并把结果交回下一轮。

以测试失败为例，定时任务或 CI 事件可以创建独立 worktree，加载项目 Skill，让实现 Agent 修改、验证 Agent 检查，再把结果写入外部状态。测试仍然失败时，下一轮依据日志和测试结果继续；权限不足、没有进展或遇到高风险操作时，流程交给人。

因此，Loop Engineering 关注的重点其实就三点：**下一轮继续需要什么证据，哪些动作必须暂停，以及前一轮的状态保存在哪里。**

![Loop Engineering 外层循环](https://oss.javaguide.cn/github/javaguide/ai/agent/loop-engineering-outer-loop.webp)

## Claude Code 的 /loop、/goal 可以怎么理解？

`/loop` 按时间再次运行 Prompt，`/goal` 按完成条件决定是否继续。更多说明可以参考 [Claude Code 命令详解](https://javaguide.cn/ai-coding/claudecode-commands.html)。

![Claude Code 推荐使用 loop 命令](https://oss.javaguide.cn/github/javaguide/ai/coding/claudecode/claudecode-father-loop.png)

`/loop` 主要解决“过一会儿再看一次”的问题。它会在当前 session 里重复运行一个 prompt。你可以给固定间隔，比如每 5 分钟检查一次部署；也可以不给间隔，让 Claude 根据观察结果自己选择下一次等待多久。

裸 `/loop` 会运行内置 maintenance prompt，或者读取 `.claude/loop.md`、`~/.claude/loop.md` 作为默认 prompt。

```bash
/loop 5m "检查部署是否完成，并汇报当前状态"
/loop 30m /code-review
/loop "检查 PR 的 CI 和 review comments，有变化就处理，没有变化就延后"
```

`/goal` 主要解决“这个目标有没有完成”的问题。你给它一个可验证完成条件，Claude 会一轮一轮推进；每轮结束后，由一个独立的小模型基于对话里已经出现的证据判断条件是否满足。不满足就继续，满足就停止。

```bash
/goal auth 模块所有单元测试通过，并且 npm test -- tests/auth 退出码为 0；最多 5 轮，连续 2 次失败原因相同就停止并汇报
/goal src/legacy 下组件迁移完成，npm run build 通过，且 git diff 只包含 src/legacy 和对应测试文件
```

可以把两者记成一句话：`/loop` 决定下一次什么时候醒，`/goal` 判断什么时候算做完。

Stop hook 或 Agent SDK 可以把继续条件交给脚本、Prompt 或外部 evaluator，并在每轮结束后执行确定性检查、权限拦截和状态落盘。

“测试通过前持续修改，最多尝试 5 次”由 `/goal` 检查完成条件。部署轮询、PR babysit、长时间 build 检查和定时 code review 则由 `/loop` 定时重新观察。

`/loop` 属于 session-scoped 的临时调度：任务只在 Claude Code 运行且空闲时触发；关闭终端、会话退出、新开会话都会影响它；`--resume` 或 `--continue` 只能恢复未过期的任务；循环任务最多 7 天自动过期。

任务必须跨机器、跨重启、长期稳定运行时，还是应该考虑 Routines、Desktop scheduled tasks、GitHub Actions、CI/CD 或自己的任务调度系统。

运行 `/loop` 前要收紧权限，写清轮询目标和停止条件；运行 `/goal` 前则把完成条件写成可验证结果，并要求 Claude 展示测试、build 或 diff 检查结果。关键路径先 commit，再让 Agent 修改，出错时可以回到明确的提交点。

## Loop 可以分成几类？

Loop 的差别主要在于“谁触发下一轮”。`/loop` 和 `/goal` 分别代表按时间唤醒、按完成条件继续；CI 事件和人工审批也可以成为触发点。下表按这个维度归类。

| 类型          | 触发方式                     | 适合任务                      | 代表工具                                      |
| ------------- | ---------------------------- | ----------------------------- | --------------------------------------------- |
| 时间驱动 Loop | 每 N 分钟、每天、每周        | PR babysit、CI 检查、日志巡检 | `/loop`、Codex Automations、cron              |
| 事件驱动 Loop | CI 失败、Issue 创建、PR 更新 | 故障分拣、评论处理、告警摘要  | GitHub Actions、Webhook、Claude Code Channels |
| 目标驱动 Loop | 上一轮结束后检查目标是否满足 | 修测试、迁移 API、补覆盖率    | `/goal`、Stop hook、Agent SDK                 |
| 人工审批 Loop | 关键动作前停下来确认         | 高风险改动、发布、权限变更    | approval gate、draft PR、review queue         |

这张表也能解释我前面那句“新瓶装旧酒”。触发、调度、验证、审批这些工程动作都不新，只是现在被重新摆到了代码 Agent 周围。

## 一个可落地的 Loop 长什么样？

以“每天自动处理 CI 失败”为例。这里按常见排查流程整理，不对应某家公司公开出来的完整实战案例。第一版只做 triage，不自动修改代码，也不自动合并。

第一版只验证三件事：Agent 能否找到正确证据，能否区分事实和猜测，能否按统一格式记录状态。三项稳定后，才考虑开放低风险修复权限。

CI triage 可由每天上午 9 点或 CI 失败触发，读取最近一次失败、相关 PR、最近提交和失败测试日志。它加载项目 `AGENTS.md` 与 `ci-triage` Skill，只读取相关模块文件，并区分环境抖动、测试不稳定、代码回归和依赖问题。

能在本地复现时运行最小测试集；不能复现则保留证据。结论写入 `TODO.md`、GitHub Issue 或 Linear 卡片，并标记“可自动修复”“需要负责人确认”或“疑似偶发”。流程不直接推送代码、不改生产配置，连续重试不超过 3 次。

![CI 排查 Loop 示例](https://oss.javaguide.cn/github/javaguide/ai/agent/loop-engineering-ci-triage-loop.webp)

等这个版本稳定之后，再逐步加自动修复：

- 对“依赖版本冲突”“格式化失败”“明显的测试快照更新”这类低风险问题，可以开独立 worktree 让 Agent 尝试修。
- 修完后必须跑目标测试。
- 通过后只创建 PR，不自动合并。
- 另一个审查 Agent 根据项目 Skill 和 diff 做二次检查。
- 失败或不确定时回到人工队列。

这个 Loop 里能看到前面提到的几个部件：

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

“每天 9 点运行”只提供了启动时间。CI 链接与失败日志确定排查入口，最小复现命令和测试结果决定是否继续，PR diff 与人工确认状态决定改动能否进入下一步。没有这些外部证据，定时任务只能重复发送同一个 Prompt。

## 什么场景值得做 Loop？

循环执行需要重复出现的任务和可检查的验收信号。日志、退出码、覆盖率和 diff 都能作为继续或停止的依据。以下任务通常能写出这类条件：

- CI 失败初步排查：有日志、有测试结果、有明确失败信号。
- 依赖版本变更：在独立分支中修改，以测试退出码和 build 结果验收。
- 测试覆盖率补齐：目标可以量化，比如某模块覆盖率从 62% 提到 75%。
- 文档同步：根据最近 diff 更新用户文档或 API 文档，最后走人工 review。
- 大规模机械迁移：例如 CommonJS 到 ESM、旧组件 API 替换、格式化修复。
- PR / Issue 分拣：读信息、归类、补充摘要、标记优先级。

以下任务则很难只靠外部信号验收：

- 目标很虚，比如“让产品体验更好”“想一个增长策略”。
- 验证信号很弱，只能靠 Agent 自己说“我觉得可以了”。
- 一旦做错影响很大，比如生产数据库写操作、权限系统变更、支付链路改造。
- 强依赖人的审美和业务判断，比如品牌文案定调、复杂产品取舍。
- 没有测试、没有日志、没有回滚方式的老项目大改。

“体验更好”或“继续优化”无法触发可靠的停止判断。循环前先把目标拆成可检查的子任务，并写出判定标准。

## 最容易踩的坑

### 目标写得太虚

“继续优化一下”缺少修改范围、验证命令和停止条件，Agent 无法据此结束任务。

只有目标的写法：

```text
/goal "优化这个项目，让代码质量更好"
```

带执行范围和退出条件的写法：

```text
/goal "auth 模块失败的单元测试全部通过，只允许修改 src/auth 和 tests/auth；每轮修改后运行 npm test -- tests/auth 并展示退出码；最多 5 轮；如果连续 2 次失败原因相同，停止并汇报"
```

`src/auth`、`tests/auth`、测试退出码、5 轮上限和连续失败条件都能由程序检查，第二条命令没有把验收标准留给 Agent 猜测。

### 把 Agent 自评当验收

测试退出码、CI 状态、lint、类型检查或截图对比才是完成证据，Agent 的说明只能作为补充。需要语义审查时，可由一个 Agent 实现、另一个 Agent 在独立上下文中检查；接近生产的步骤再增加人工审批。

### 忘了成本上限

每轮都可能重新读文件、调用工具、解释报错，并压缩上下文或启动审查 Agent。任务配置应同时限制预算和停止条件：

- 最大迭代次数。
- 最大工具调用次数。
- 单日或单任务 Token / 金额预算。
- 无进展检测，比如两轮失败原因相同就停。
- 低价值任务只做摘要，不自动修复。

无进展检测用于阻止失败原因不变时继续消耗 Token。

### 权限给得太大

读日志、开 PR、自动合并 PR，风险根本不是一个等级，不能拿同一套权限放行。删文件、改生产配置、发外部消息、写数据库这类操作，默认都要等人确认。

MCP Server 的来源、工具 description、返回内容和 Prompt 模板也要进入审核范围，因为这些内容都可能携带提示词注入。权限可以按执行阶段逐级开放：

| 阶段        | Agent 能做什么               | 人负责什么   |
| ----------- | ---------------------------- | ------------ |
| L0 只读摘要 | 读日志、读 Issue、生成报告   | 判断是否采纳 |
| L1 本地复现 | 运行指定测试、定位失败       | 决定是否修复 |
| L2 草稿修复 | 在 worktree 里改代码、跑测试 | Review diff  |
| L3 创建 PR  | 提交分支、写 PR 描述         | 审查、合并   |
| L4 自动合并 | 通过策略后自动合并           | 只处理异常   |

L1/L2 覆盖日志读取、问题复现和草稿修改。L4 需要同时满足问题类型固定、测试覆盖主要风险、回滚路径经过验证；涉及业务判断、权限或数据写入的任务继续保留人工审批。

![Loop 的安全边界](https://oss.javaguide.cn/github/javaguide/ai/agent/loop-engineering-safety-boundary.webp)

## 第一版先别急着自动修

第一次做 Loop，不建议直接上无人值守自动修复。可以先从只读 triage 开始，任务描述宁可写得细一些：

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

这一版把手脚收得很紧：只看 CI 证据和相关文件，不改代码，也不对外发消息；失败项和复现次数同样封顶。排查摘要里先盯三类问题：无关文件、重复工具调用和越权动作。它们还没处理干净之前，不该开放修复权限。

任务跨天后，新开的会话不会自然知道昨天试过什么。需要恢复的内容直接写到外部状态里：目标、范围、证据、已执行动作、结果、下一步和停止条件都要能被下一轮读到。

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

等这套 triage 跑稳，再给自动修复加上四条硬限制：

- 修改前创建独立 worktree 或分支。
- 修改范围白名单。
- 只允许跑指定测试和格式化命令。
- 通过后只开草稿 PR，不自动合并。

## 把 Loop 接入生产流程前

### 什么会触发下一轮？

每天的定时任务会先找出最近一段时间的失败；CI 失败事件则可以把失败的 job、相关 PR 和最近提交直接交给 triage。任务范围、可读文件和可用命令应随这次任务一起传入，新会话据此准备上下文。

### 什么时候继续，什么时候停？

CI 链接、失败日志、最小复现命令和测试退出码能够说明排查是否有新进展；`attempts` 和 `stop_condition` 则把已经试过的动作与停止原因留在外部状态中。权限不足、无法复现、需要业务判断，或者连续失败达到上限时，任务应转回人工队列。创建 PR、修改生产配置和自动合并不应成为同一条 Loop 的默认后续动作。

## 总结

Loop Engineering 把每次调用与前一轮留下的证据、状态和限制接在一起。

文中的 CI triage 从读取日志、定位失败和记录结论开始，YAML 状态保存 `evidence`、`action`、`result` 和 `next_step`。这些字段能让下一轮直接接着处理，也能让人工在接管时看到已做过什么。等只读排查稳定后，再逐步开放修改代码、创建 PR 和自动合并等权限。
