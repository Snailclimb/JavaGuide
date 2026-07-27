---
title: Claude Code Multi-Agent 机制详解：Subagent、Subtask、Fork 与 Agent Teams
description: 结合 Claude Code 官方文档和社区源码分析，梳理 Subagent、Subtask、Fork Session、Agent Teams、任务协作、权限回流和成本控制，帮助理解 Claude Code 多 Agent 机制如何拆分任务、隔离上下文并管理协作。
category: AI 编程原理
tag:
  - Claude Code
  - Multi-Agent
  - AI Agent
  - AI 编程
head:
  - - meta
    - name: keywords
      content: Claude Code,Multi-Agent,Subagent,Subtask,Fork Session,Agent Teams,AI Agent,上下文隔离,任务协作,AI编程
---

你好，我是小 G。最近有 G 友问我一个问题：Claude Code 里的 Subagent、Fork、Agent Teams 到底是不是一回事？如果面试里被问到 Claude Code Multi-Agent 机制，应该如何回答？

这个问题我一开始也以为只是几个名字绕来绕去。真把官方文档、changelog 和社区源码分析放在一起看，才发现差别不小。

Claude Code 单 Agent 已经能干不少活，日常改代码、查问题、补测试，大部分时候都够用。

问题是，真实项目里的任务往往没那么干净。一个会话既要搜索、阅读、试错，又要最后产出修改，聊着聊着上下文就脏了。

比如排查一个接口性能问题，它可能先搜接口，再读 Mapper、看日志、查索引，中间还试几条 SQL。等真正要改代码时，聊天记录里已经塞满无关文件、旧猜测和被推翻的方案。

人看着都累，模型也容易被这些过程信息带偏。

Claude Code Multi-Agent 盯着的，正是这类**上下文和任务拆分问题**。

它不会把所有工作都塞给一个会话，而是按任务性质拆开：

- 一次性搜索交给 Subagent；
- 已经有上下文的支线探索交给 `/subtask`，需要独立继续时用 `/fork`；
- 需要多人协作的任务，再上 Agent Teams。

于是我把 Claude Code 里和 Multi-Agent 相关的几块放在一起整理了一下。本文会参考社区整理的 Claude Code 源码分析来深入到原理层面，但当前用法以官方文档和 changelog 为准。

这些功能迭代很快。本文版本信息核对到 Claude Code v2.1.218（2026-07-24）：v2.1.212 起，正常情况下，当前会话内的 forked subagent 使用 `/subtask`，`/fork` 则复制当前对话并创建独立后台 Session。关闭 Agent View 后是个例外：`/subtask` 不可用，`/fork` 会继续启动 forked subagent。旧文章把这两种行为都叫 Fork，容易混淆。

## Claude Code 为什么需要多个 Agent？

写一个小函数、改一个配置、补一段测试，单 Agent 通常够用。

不过，在执行跨模块任务时，可能就不够用了。比如，你让 Claude Code 排查一个线上慢查询，它可能要连续做这些事：

- 搜索相关接口和 SQL；
- 阅读 ORM / Mapper 层代码；
- 查看索引和执行计划；
- 修改查询逻辑；
- 补测试或压测脚本；
- 最后再总结原因和改动。

这些步骤如果都让一个 Agent 来做，全塞在主会话里，麻烦主要卡在两处：

- 过程信息太多。搜索命中的无关文件、旧日志、失败方案、临时猜测，都会留在上下文里。后面继续写代码时，模型还得从这些过期材料里捞当前重点。
- 任务惯性。刚排查完数据库问题，下一轮又让它审前端组件，它可能还会带着上一轮的判断方式继续看问题。

所以，我理解的 Multi-Agent，**先要保护好主会话。主会话负责判断和落地，脏活、杂活、支线活能拆就拆。至于并行提速，那只是拆分合理之后的副产品。**

这个思路和上下文工程里常说的“隔离支线过程”是一回事：主会话保留判断、计划和最终决策，把搜索、验证、审查这些容易膨胀的过程交给独立 worker。

![Sub-agent 拆分任务，隔离上下文](https://oss.javaguide.cn/github/javaguide/ai/context-engineering/sub-agent-task-splitting-context-isolation%20.png)

先放一张我自己整理的表。看 Claude Code 里的多 Agent，可以先按几类问题来区分：

| 问题                             | 适合的机制  | 说明                                                            |
| -------------------------------- | ----------- | --------------------------------------------------------------- |
| 支线搜索太多，污染主会话         | Subagent    | 子代理自己读文件、查资料，主会话只拿结果                        |
| 需要继承当前上下文做支线探索     | `/subtask`  | 当前会话内的 forked subagent 继承上下文并返回结果               |
| 需要复制对话并独立继续           | `/fork`     | 创建可独立恢复、管理的后台 Session                              |
| 多个角色需要协作、通信和认领任务 | Agent Teams | 每个 teammate 是独立 Claude Code 实例，有共享任务列表和消息机制 |

> **环境差异**：这张表按 Agent View 已启用的默认情况整理。关闭 Agent View 后，`/subtask` 不可用，`/fork` 会启动当前会话内的 forked subagent。

名字都带 Agent，干的活差得还挺远：

- Subagent 的用法接近“你去查一下，查完告诉我”。
- `/subtask` 在当前会话内复制上下文做支线任务；`/fork` 创建独立后台 Session。
- Agent Teams 则让几个独立实例一起做项目，可以发消息、领任务、最后再汇总。

![Subagents 和 Agent Teams 对比](https://oss.javaguide.cn/github/javaguide/ai/coding/claude-code-subagents-vs-agent-teams.png)

这里还有个细节：Subagent 不一定要你手动点名。官方文档里说，Claude 会根据 Subagent 的 `description` 判断什么时候委派；内置的 Explore、Plan、general-purpose 等 Subagent，也会在合适任务里自动用上。

看完这张表，再问一个更实际的问题：到底要不要显式指定 Subagent，什么时候又该升级到 Agent Teams。

选的时候先问一句：**这些 worker 之间要不要互相沟通？**

如果只需要查完回报，用 Subagent 就够了。代码审查、日志分析、单点调研，都属于这类。

如果几个 worker 需要互相发消息、认领任务、交换中间结果，才考虑 Agent Teams。比如一个 teammate 看后端接口，一个看前端页面，一个专门做测试和验收。

成本这块也很实在：每个 teammate 都有自己的上下文窗口，token 用量会跟着活跃 teammate 数量一起涨。研究、审查、新功能拆分这类任务通常值得；日常小改动，单会话反而更省。

## Subagent：主会话里的轻量委派

### Subagent 是什么？

Subagent 是 Claude Code 里最常用、也最不容易用过头的一种委派机制。

你可以把它理解成主会话临时派出去的 worker。它有自己的上下文窗口，可以使用指定工具。任务结束后，它把结果返回给主会话，不会把完整搜索过程一股脑倒回来。

很多时候，Agent 多读几个文件不是问题。麻烦的是，它把搜索过程、临时判断和最后被推翻的猜测都带回主会话。Subagent 的好处就在这儿：让它自己查，主会话只拿整理后的结果。

这块我觉得挺香：主会话不用跟着一起外耗。

![Claude Code Explore Subagent：支线搜索在后台执行](https://oss.javaguide.cn/github/javaguide/ai/coding/claude-code-explore-subagent-demo.png)

上图里，主会话只是把登录、鉴权、权限校验相关搜索交给 Explore subagent。搜索过程在后台跑，主线继续保持干净，等子代理结束后再拿整理后的文件列表、调用链和后续关注点。

![Claude Code Sub-Agent：让主对话保持干净](https://oss.javaguide.cn/github/javaguide/ai/coding/claudecode-sub-agent.png)

什么时候需要自定义 Subagent？

我的判断是：同一类 worker 反复出现，而且每次都要给它同一套指令时，再沉淀成自定义 Subagent。比如你经常让它做只读代码审查、数据库查询检查、安全扫描、日志归因，这些任务的角色、工具权限和输出格式都比较稳定，就值得单独配一个。

如果只是偶尔查一次文件、临时看一段日志，直接让 Claude Code 用内置 Subagent 或手动委派就够了，没必要为了“看起来专业”专门建文件。

自定义文件通常放在：

```text
~/.claude/agents/
.claude/agents/
```

这两个目录不一定默认存在。你没看到很正常，说明本机或当前项目还没有创建过自定义 Subagent。

新版文档里的创建方式更直接：让 Claude 帮你写，或者自己建目录写 Markdown 文件。`/agents` 在 v2.1.198 起不再打开交互创建向导，只会提醒你找 Claude 创建，或者直接编辑 `.claude/agents/`。如果是本次会话里第一次新建 `agents` 目录，Claude Code 可能需要重启后才能发现。

用户级 Subagent 对所有项目生效，项目级 Subagent 适合和团队共享。

Subagent 文件就是 Markdown + YAML frontmatter，里面可以配置名称、描述、工具、模型、权限模式、hooks 和 skills。`name` 和 `description` 是必填项，其中 `description` 很关键，Claude 会靠它判断什么时候自动委派。

### Subagent 怎么跑起来？

从运行日志或社区源码分析里看，`Agent` 工具的这几个单次调用参数最值得注意：

| 参数                | 作用                                                                       |
| ------------------- | -------------------------------------------------------------------------- |
| `description`       | 给主会话看的任务简述                                                       |
| `prompt`            | 交给子代理执行的具体任务                                                   |
| `subagent_type`     | 指定使用哪类 Subagent；省略时仍是 `general-purpose`，不会自动变成 fork     |
| `model`             | 指定子代理使用的模型别名                                                   |
| `run_in_background` | 是否后台运行；新版未显式配置时，Claude 会自己选择，v2.1.198 起默认后台运行 |
| `name`              | 给后台 Subagent 或 Agent Teams teammate 设置可寻址名称                     |
| `team_name`         | 旧版本 Agent Teams 使用的字段；新版本仍接受但会被忽略                      |

这张表展示的是 `Agent` 工具的调用参数，不是 `.claude/agents/*.md` 的 YAML frontmatter。Subagent 文件里对应的后台和工作区配置是 `background`、`isolation` 等字段。

这张表不用背。重点是不要依赖“省略 `subagent_type` 就隐式 fork”的旧实现说法。普通 Agent 调用在未指定类型时使用 `general-purpose`；需要继承上下文，应显式使用当前版本提供的 `/subtask` 或对应 fork 配置。

内部实现中，`AgentTool` 负责入口和路由，真正把子代理跑起来的是 `runAgent()`。

`runAgent()` 会先做一批运行时准备：

- 初始化 agent 自己需要的 MCP Server；
- 创建子代理专用的 `ToolUseContext`；
- 执行 `SubagentStart` 相关 hooks；
- 写入 sidechain transcript 和 agent metadata；
- 进入 `query()` 主循环。

这些细节说明一件事：Subagent 不是主会话里的普通函数调用。它复用了 Claude Code 的 Agent runtime，有工具、权限、上下文、消息流和 transcript。

所以，它适合承担完整一点的支线任务。让它读一批文件、做一轮审查、给出结论，都比把这些过程塞进主会话干净。

### 哪些任务适合交给 Subagent？

我一般会把这类任务交给 Subagent：

- 只读审查某个模块，最后给出问题列表；
- 搜索某类错误日志，主会话只拿结论；
- 汇总某个外部库的用法，不把搜索过程带回来；
- 对一次改动做独立验证，失败了也能重新派一次。

需要主会话持续参与判断的任务，最好别拆出去。

比如正在改一个核心文件，主会话和子代理同时动手，最后很可能没提速，反而制造冲突。我的习惯是让 Subagent 多做只读和验证，少让它直接参与主线修改。

## `/subtask`、`/fork` 和后台 Agent：什么时候继承上下文？

### `/subtask` 和普通 Subagent 的区别

普通 Subagent 通常靠主会话给一段明确 prompt 开始工作。默认不要继承主会话的完整历史，否则“隔离过程信息”的意义就没了。

`/subtask` 走的是另一条路：它在当前会话内启动 forked subagent，继承父会话已经形成的对话上下文，再把结果返回当前主线。必须显式选择这条路径；省略 `subagent_type` 不会触发 implicit fork。

这适合一种比较特殊的时刻：主会话刚好有一份高质量上下文，你不想浪费它，又想分几个方向试。

比如主会话已经读完了整个支付模块，现在你想顺手分几个方向查：

- 查状态机设计问题；
- 查幂等逻辑问题；
- 查测试覆盖缺口。

这时 `/subtask` 比普通 Subagent 更合适。每个 child 都能拿到父会话刚刚建立好的上下文，不用重新读一遍项目。

![Claude Code Fork：基于当前上下文启动后台分支](https://oss.javaguide.cn/github/javaguide/ai/coding/claude-code-fork-subagent-demo.png)

上图记录的是旧版 `/fork` 行为。按 v2.1.212 之后的命名，启用 Agent View 时，当前会话内做这种上下文分支应使用 `/subtask`；现在的 `/fork` 会复制整个对话到独立后台 Session，可单独查看、恢复和继续。关闭 Agent View 后，`/subtask` 不可用，`/fork` 仍保持旧的 forked subagent 行为。

### 两种复制方式的适用时机和限制

社区对内部实现的分析显示，当前会话内的 forked subagent 会复用父会话已经渲染的 system prompt 和消息历史。这有利于复用 prompt cache，但它属于实现观察，不应当作外部稳定 API。

这么做主要是为了 prompt cache。

如果每个 fork child 都重新调用一遍 system prompt 生成逻辑，哪怕内容看起来一样，也可能因为动态配置、工具列表、实验开关等细节导致字节不一致。

字节不一致，prompt cache 命中就会受影响。

复用父会话上下文会影响 prompt cache，也把 Multi-Agent 和上下文、工具注册这些底层机制绑在了一起。

这也是 `/subtask` 适合“上下文刚准备好、立刻补一条支线”的原因。若支线需要独立管理、稍后继续或单独恢复，更适合使用现在的 `/fork`。如果担心文件修改互相影响，可以为 Agent 配置 `isolation: "worktree"`，把改动放到独立 Git Worktree 里。

**后台 Agent 解决的是等待问题。**

比如你让一个 Agent 去跑完整代码审查，另一个 Agent 去分析日志，主会话可以继续做设计和拆任务。等后台 Agent 完成后，再把结果回流回来。

如果后台任务开多了，管理成本会立刻上来。当前会话里的 `/subtask` 和其他后台 Subagent 用 `/tasks` 查看、接管或停止；`/fork` 创建的独立后台 Session 则用 `claude agents` 打开 Agent View 统一管理。两者都在后台运行，但不是同一层任务。

![Claude Code Agent View](https://oss.javaguide.cn/github/javaguide/ai/coding/claudecode/claude-agents-list-view-20260518102539932.png)

但后台不等于免费。后台 Agent 仍然会消耗 token、占用上下文和任务状态。开太多以后，主会话虽然没被卡住，人反而要开始管理一堆任务。

Claude Code 也设置了默认上限：Claude 通过 `Agent` 工具在每个 Session 最多生成 200 个 Subagent，默认最多并发运行 20 个。前者可通过 `CLAUDE_CODE_MAX_SUBAGENTS_PER_SESSION` 调整，后者可通过 `CLAUDE_CODE_MAX_CONCURRENT_SUBAGENTS` 调整；Ultracode Session 不执行默认并发上限。

这两个上限主要阻止 `Agent` 工具继续生成新 Subagent。手动执行的 `/subtask` 仍会计入配额并占用并发槽位，但达到上限后依然可以启动；`/fork` 创建的是独立 Session，不计入当前会话的 200 个配额，并拥有自己的预算。

Subagent 默认不能再创建 Subagent；需要嵌套委派时，可以通过 `CLAUDE_CODE_MAX_SUBAGENT_SPAWN_DEPTH` 设置层级。Agent Teams 里，in-process teammate 不能继续生成 teammate，它自己的 Subagent 也只能在前台运行。这些限制是保护措施，不是建议目标，日常任务通常远用不到。

`/subtask` 和 `/fork` 的共同代价是：它们都会复制父会话历史。

父会话越干净，复制上下文越有价值。刚读完一个模块、整理完任务计划、讲清关键文件和约束时，再开 `/subtask` 或 `/fork`，能省掉重复阅读成本。

反过来，如果主会话已经聊了很久，里面塞满无关文件、旧猜测、失败方案和临时判断，再继续 fork，就等于把这团乱麻复制给每个 child。

这种情况下，复制会话不是在分担任务，而是在复制混乱。

## Agent Teams：一组独立 Claude Code 实例

### Agent Teams 和 Subagent 的区别

Agent Teams 是 Claude Code 里更重的一套多 Agent 机制，别把它当成 Subagent 的增强版。

一个 session 作为 team lead，后面简称 lead，负责协调工作、分配任务和综合结果；teammates 独立工作，每个 teammate 都有自己的 context window，并且可以互相通信。

这点很容易搞错：teammate 不会继承 lead 的聊天历史。它像一个新开的 Claude Code session，会加载当前项目的 `CLAUDE.md`、MCP servers 和 Skills，也会收到 lead 发过去的 spawn prompt，但前面那些来回讨论、临时猜测、被推翻的方案，不会自动带过去。

spawn prompt 也就不能只写“你去看一下后端”。关键路径、已知限制、希望输出什么，都要写进去。否则 teammate 拿到的是一个干净窗口，但也可能干净到不知道你刚刚讨论过什么。

Subagent 通常是“干完回来汇报”。teammate 则会通过共享 task list 和 mailbox 协作：有人领任务，有人补信息，lead 最后汇总。

teammate 也可以复用已有的 Subagent 定义。比如你已经写了一个 `security-reviewer`，spawn teammate 时可以指定这个 agent type。它会沿用这个定义里的 `tools` 和 `model`，并把定义正文追加到 teammate 的 system prompt 里。注意，`skills` 和 `mcpServers` 这两个 frontmatter 字段不会通过这条路径生效；teammate 还是按普通 session 的项目和用户设置加载 Skills / MCP servers。

使用前还要先开实验开关。目前 Agent Teams 还是 experimental，默认关闭，需要设置：

```json
{
  "env": {
    "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1"
  }
}
```

或者在 shell 里设置同名环境变量。

### shared task list、mailbox 和 teammate mode

Agent Teams 不是让几个 teammate 在一个大聊天框里刷消息。它主要靠两套东西来协作：

| 组件             | 作用                                      |
| ---------------- | ----------------------------------------- |
| shared task list | 记录团队任务，teammate 可以认领和完成任务 |
| mailbox          | teammate 之间发消息、请求信息、同步状态   |

这里多出来的，不只是结果回报。Agent Teams 会维护 shared task list 和 mailbox，让 teammate 能认领任务、同步状态、互相补信息。

把 shared task list 当普通 TODO 会低估这套机制。任务有 `pending`、`in progress`、`completed` 三种状态，也可以设置依赖；依赖没完成时，后面的任务不能被认领。多个 teammate 抢同一个任务时，Claude Code 会用文件锁避免并发认领冲突。

消息这块也一样。lead 会给每个 teammate 分配名字，后续可以按名字发消息。teammate 空闲或失败时，也会自动通知 lead，不需要 lead 一直轮询。

源码分析里能看到更底层的实现：mailbox 是文件式 inbox，写入时会考虑并发锁；task list 则让 teammate 不只是接收 prompt，还能 claim work item。

普通 Subagent 更像一次性委派。Agent Teams 会维护共享任务和消息，味道更像一个小型工作队列。

prompt 怎么写也会跟着变。用 Subagent 时，任务最好一次讲清楚；用 Agent Teams 时，lead 可以先把大任务拆到 shared task list 里，teammate 再围绕任务列表和消息往前推。

![Claude Code Agent Teams：多个 teammate 围绕完整分析链路协作审查](https://oss.javaguide.cn/github/javaguide/ai/coding/claude-code-agent-teams-agentinvest-review.png)

上图是一个更接近真实项目的例子：team lead 先把 AgentInvest 的完整分析链路拆成后端 SSE、Agent 编排、前端渲染、测试与韧性风险四条线，再 spawn 4 个 teammate 分别认领。这里的重点不是多开几个搜索任务，而是 teammate 围绕同一份 shared task list 分工推进，最后由 lead 汇总跨模块问题。

`--teammate-mode` 用来控制 teammate 怎么显示：

| 模式         | 含义                                               |
| ------------ | -------------------------------------------------- |
| `in-process` | 默认模式，在当前进程里展示 teammates               |
| `auto`       | 在 tmux / iTerm2 可用时用分屏，否则回退 in-process |
| `tmux`       | 使用 tmux 或 iTerm2 分屏                           |
| `iterm2`     | 使用 iTerm2 native split panes，v2.1.186 加入      |

`teammateMode` 的默认值在 v2.1.179 从 `auto` 改成了 `in-process`。

这类版本变化在写脚本和团队文档时要注意。网上不少教程还会默认推荐 tmux，或者沿用旧的 team 创建流程，照搬容易和当前版本对不上。

### v2.1.178 之后的版本变化

旧实现里能看到 `TeamCreate` / `TeamDelete`、`team file`、`team_name` 等细节。这些内容对理解 Agent Teams 的演进有帮助，但不能直接写成当前稳定用法。

v2.1.178 之后，启用 `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS` 后，第一个 teammate 生成时会自动组成当前 Session 的 Agent Team，不再需要单独的创建步骤。一个 Session 同一时间只有一个 Team，不能再创建其他命名 Team。

`TeamCreate` 和 `TeamDelete` 工具已经移除，运行态 Team 配置会在 Session 结束时自动清理。

`Agent` 工具里的 `team_name` 参数仍然接受，但会被忽略。`TaskCreated`、`TaskCompleted`、`TeammateIdle` hook payload 里的 `team_name` 也属于兼容字段。

Agent Team 运行期间会使用两类本地目录：Team runtime config 在 `~/.claude/teams/{team-name}/config.json`，Task list 在 `~/.claude/tasks/{team-name}/`。

这两个目录由 Claude Code 自动生成和更新。Config 里是 Session ID、Pane ID、Members 这类运行态信息，Session 结束后会被删除；Task list 会保留在本地，恢复 Session 后还能继续使用，清理周期由 `cleanupPeriodDays` 控制。不要手工修改这些文件，也不要在项目里写 `.claude/teams/teams.json` 期待它生效。

所以读旧源码时，我会分开看：

- 旧实现帮助理解 Agent Teams 为什么会有 task list、mailbox 和 team 目录；
- 当前使用方式要以官方文档为准，不要再教用户调用 `TeamCreate`。

## 权限、成本和版本变化

**权限请求先回到 lead**

多 Agent 最怕的一件事，是 worker 绕过主会话权限，自己去改文件、跑命令。

Claude Code 没让 teammate 自己拍板。需要用户确认的权限请求，还是会回到 lead。

源码分析里可以看到 leader permission bridge：in-process teammate 如果需要用户确认，会优先把请求塞回 leader 的 ToolUseConfirmQueue，UI 上带 worker 标识。bridge 不可用时，再退到 mailbox 路径。

用户仍然在一个地方做权限判断，不需要在多个 teammate 里分别盯着确认弹窗。

Subagent 也可以配置自己的工具范围和 hooks。

官方 Subagent 文档里给过只允许只读数据库查询的例子：用 `PreToolUse` hook 检查 Bash 命令，如果发现 `INSERT`、`UPDATE`、`DELETE` 等写操作，就退出并阻止执行。

这类设计和工具调用安全分层是同一个方向：低风险操作可以放宽，高风险操作要确认，涉及文件删除、提交、部署、数据库写入时，不能只靠一句 prompt 约束。

![工具调用安全风险分层：按风险等级匹配不同的控制策略](https://oss.javaguide.cn/github/javaguide/ai/llm/structured-output-function-calling-tool-call-security.png)

**成本主要花在多个独立上下文上**

Agent Teams 贵，主要是因为每个 teammate 都是独立 Claude Code 实例。

我会把成本控制压成几条使用习惯：

- teammate 的模型要显式指定，或者在 `/config` 里设置 `Default teammate model`；它不一定自动跟随 lead 的 `/model`；
- 大多数工作流先从 3-5 个 teammate 开始，三个聚焦的 teammate 往往比五个分散的 teammate 更好用；
- task 不要拆得太碎，也不要大到长时间没有 check-in，最好是一个函数、一个测试文件、一次审查这类自包含交付物；
- 新手先从研究、审查、bug 排查这种不写代码的任务试起；
- 如果要并行改代码，尽量让每个 teammate 负责不同文件，避免两个 teammate 同时改同一个文件。

说到底，这还是上下文管理。

开三个 teammate，相当于同时维护多个窗口，不会把一个窗口拆成三份。任务真的能并行时，这个成本值得；任务本身强依赖、要反复等对方结果时，就不一定划算，最后很容易变成自己给自己加外耗。

**版本信息只能当快照看**

本文按 Claude Code v2.1.218（2026-07-24）核对。版本信息会变，具体功能还是以官方文档和 changelog 为准。尤其是 Agent Teams、Subagent、Skills 这类快速迭代的功能，旧文章里的命令和工具名不一定继续有效。

## 实际使用时怎么选？

**小任务用单 Agent**

任务清楚、改动范围小、上下文不复杂，就用单 Agent，不用想太复杂。

比如：

- 改一个函数；
- 补一个单元测试；
- 调整一个配置；
- 解释一段代码。

这类任务上来就开 Subagent 或 Agent Teams，只会增加调度成本。小改动让一个会话做完，反而最稳。

**支线任务用 Subagent**

我会把 Subagent 当成“出去跑一趟”的人。

比如让它只读审查一个模块、搜一批错误日志、理清某个模块的上下文，或者帮刚改完的代码做一次独立验证。

这些活有个共同点：过程不一定重要，结论重要。主会话只需要知道哪里有问题、证据在哪、下一步怎么改，不需要把所有搜索命中、临时猜测和失败路径都塞进来。

真要动核心代码，我还是更愿意留在主会话里做。Subagent 负责找线索和验结果，主会话负责判断和落地。

**需要协作再上 Agent Teams**

Agent Teams 我会更谨慎一点。它适合那种单靠“查完回来汇报”不够的任务。

比如一个新功能同时牵到后端接口、前端交互、测试策略和反向审查。几个 teammate 不只是各看各的，还要互相问一句：这个接口字段变了，前端要不要跟？测试要不要补？谁现在手里有空可以认领下一块？

这时候 shared task list 和消息机制才有价值。否则只是多开几个 worker，各自跑完一段总结回来，Subagent 就够了。

这些场景就别硬拆：同一个文件里的连续修改、强顺序依赖的任务、需要一个人持续掌握全部上下文的任务。强行拆开，最后只会增加协调开销。

如果多个 Agent 都要改代码，最好先把工作区隔开。比较稳的做法是一个 Agent 一个 Git Worktree，一个分支只承载一个清晰任务，最后再由人或 lead 做合并和验收。

![Claude Code Git Worktree](https://oss.javaguide.cn/github/javaguide/ai/coding/claude-code-git-worktree.png)

**先拆清任务，再增加 Agent**

任务边界不清时，多个 Agent 只会生成更多方向不一致的中间结果。先用单 Agent 明确目标和依赖；能独立验证的交给 Subagent；当前上下文值得复用时选择 `/subtask` 或 `/fork`；确实需要角色间通信时，再启用 Agent Teams。

更具体一点，可以先跑成串行流水线：Plan 只读方案，Code 做单个任务，Test 补验证，Review 只看 diff。等这套流程稳定后，再把其中能独立执行的环节拆给不同 Agent。

![Multi-Agent 三代理协作流水线](https://oss.javaguide.cn/github/javaguide/ai/coding/spec-coding-multi-agent-pipeline.png)

## 总结

写到这里，再回到开头那个问题：Claude Code 里的 Subagent、Fork、Agent Teams 到底怎么选？

别先盯着“多 Agent 会不会更快”。我更愿意把它看成一种上下文治理方式：主会话负责判断、计划和落地，支线搜索、审查、验证这些容易把上下文弄脏的活，能拆出去就拆出去。

Subagent 适合隔离过程。让它自己读文件、查日志、做只读审查，主会话只拿结论和证据。

`/subtask` 适合在当前会话里复用已经整理好的上下文，完成一次支线并回传结果；启用 Agent View 时，`/fork` 适合把整段对话复制成独立后台 Session，后续单独管理。主会话已经很乱时，两者都只会复制混乱。

Agent Teams 再重一层。只有任务真的需要多个 teammate 认领任务、互相通信、共享 task list 时，才值得上。它花的是多个独立上下文的钱，也会带来协调成本。

我的使用顺序是：小任务单 Agent；干净的支线用普通 Subagent；需要复用上下文时在 `/subtask` 和 `/fork` 之间选择；真正跨模块协作时再开 Agent Teams。它的主要价值是隔离过程和明确责任，并行只是任务可独立拆分后的结果。

延伸阅读可以看 [AIGuide：AI 应用开发、AI 编程实战与面试指南](https://mp.weixin.qq.com/s/le3RzJsaAH22auUoB05y1Q) 的 [上下文工程实战指南](https://javaguide.cn/ai/agent/context-engineering.html) 和 [Spec Coding 规范驱动编程](https://javaguide.cn/ai-coding/practices/spec-coding.html)，前者更偏上下文隔离，后者更偏多代理协作流水线。

## 参考资料

- [Claude Code Commands](https://code.claude.com/docs/en/commands)
- [Create custom subagents](https://code.claude.com/docs/en/sub-agents)
- [Run agents in parallel](https://code.claude.com/docs/en/agents)
- [Orchestrate teams of Claude Code sessions](https://code.claude.com/docs/en/agent-teams)
- [Claude Code Changelog](https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md)
- [Claude Code Source Code Deep Research Report（社区源码分析，非官方）](https://claudeai.dev/docs/mechanics/development/claude-code-source-deep-research/)
