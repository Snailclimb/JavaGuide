---
title: Claude Code 使用指南：配置、工作流与进阶技巧
description: 结合 Anthropic 官方文档和真实项目用法，讲清 Claude Code 的配置、权限、MCP、Skills、Sub-Agent、上下文管理和常见工作流。
category: AI 编程实战
head:
  - - meta
    - name: keywords
      content: Claude Code,AI编程,CLAUDE.md,MCP,Skills,Sub-Agent,Agentic Coding,AI辅助开发
---

你好，我是小 G。前面写过 [IDEA 搭配 Qoder 插件的实战](../cases/idea-qoder-plugin.md)、[Trae 接入大模型的实战](../cases/trae-m2.7.md) 和 [Claude Code 接入第三方模型的实战](../cases/cc-glm5.1.md)，这篇继续聊 Claude Code。

正文开始之前，想先问一句：你第一次认真用 Claude Code 的时候，是什么感觉？

我自己刚开始用的时候，最直观的感受就是：这玩意儿不像普通代码补全，也不像单纯的聊天机器人。你让它修一个问题，它会自己读仓库、搜代码、跑命令、看报错、改文件，再根据验证结果继续迭代。

比如你丢给它一句：“修一下登录超时后无法刷新 token 的问题。”

它可能会去找认证流程、读相关测试、改实现、再跑一遍命令。这个过程看起来很爽，尤其是它真的把问题修掉的时候，会让人产生一种错觉：我是不是只要负责提需求就行了？

但用久了之后，翻车也会越来越多。

上下文没管好，它会把支线任务越扯越大；权限放太宽，它可能一口气改掉你没打算动的文件；验收标准没写清，它会用一套看起来合理、但并不符合业务的实现交差。最后你面对一堆 diff 发呆，不知道该留哪块、扔哪块。

所以这篇不是“Claude Code 有多强”的安利文，而是想把我这一年多高频使用里踩过的坑、稳定下来的配置和比较管用的工作流整理出来。重点会放在 `CLAUDE.md`、权限管理、MCP、Skills、Sub-Agent、上下文管理和验证习惯这些地方。

这篇文章参考了 Anthropic 官方文档。需要注意的是，Claude Code 迭代很快，部分命令和版本门槛会变，具体以 `claude --version` 和官方文档为准。比如 `/run`、`/verify` 需要 Claude Code v2.1.145+；新版 `/simplify` 的官方说明出现在 v2.1.154+ 之后；`--enable-auto-mode` 已经移除，现在用 `--permission-mode auto`。

另外，国内使用 Claude Code 还有现实门槛：账号、网络、成本、第三方中转稳定性都要考虑。GLM、MiniMax、Kimi、DeepSeek 这类模型可以作为替代或补充，但如果任务是大规模代码修改、复杂重构、长链路排错，Claude 目前仍然值得单独研究。

## `CLAUDE.md` 非常重要

`CLAUDE.md` 可以理解成写给 Claude Code 的项目规则文件。

它不是普通 README，也不是越长越好。Claude 每次启动都会读它，所以这里面只应该放每次会话都值得知道的东西。

千万别写成项目说明书！应该写 Claude 容易猜错、代码里读不出来、团队又必须遵守的规则。重点放技术栈版本、常用命令、架构取舍、团队约定和项目坑点；别塞空话、默认行为和大段文档。

判断标准很简单：这行删掉后，Claude 会不会更容易犯错？

![多智能股票分析项目中的 CLAUDE.md 和 AGENTS.md](https://oss.javaguide.cn/github/javaguide/ai/coding/claude-agents-md.png)

Anthropic 建议保持 `CLAUDE.md` 精简不超过 200 行，只保留 Claude 无法轻易从代码中推断的信息。如果内容继续膨胀，可以拆到带 `paths` 的 `.claude/rules/`，或者把不是每次会话都需要的参考内容放到 Skills 里。

![Claude Code 官方文档对 CLAUDE.md 的建议](https://oss.javaguide.cn/github/javaguide/ai/coding/claudecode/claudemd-claude-docs.png)

### 放在哪里

Claude Code 的配置有几层作用域，不同文件解决不同问题：

| 作用域  | 位置                                             | 适合放什么                                       |
| ------- | ------------------------------------------------ | ------------------------------------------------ |
| Managed | 系统级或组织级托管配置                           | 公司安全策略、合规要求，通常由 IT 或平台团队维护 |
| User    | `~/.claude/`                                     | 个人长期偏好，比如编辑器、主题、常用插件         |
| Project | 仓库内 `.claude/` 或项目根目录                   | 团队共享规则，适合提交到 Git                     |
| Local   | `.claude/settings.local.json`、`CLAUDE.local.md` | 本机私有配置，通常加入 `.gitignore`              |

项目级 `CLAUDE.md` 建议提交到仓库。一个团队里所有人都用 Claude Code 时，它会慢慢变成 AI 版 onboarding 文档。不要把它写成教程，写成“这个仓库里怎么干活”就行。

如果项目比较大，可以拆开：

```text
my-project/
├── CLAUDE.md
├── backend/
│   └── CLAUDE.md
├── frontend/
│   └── CLAUDE.md
└── .claude/
    ├── rules/
    ├── skills/
    └── agents/
```

根目录的 `CLAUDE.md` 放全局约定，子目录的 `CLAUDE.md` 放局部规则。Claude 读取到某个子目录文件时，会按需加载对应目录下的说明。这个机制对 monorepo 很友好，后端、前端、管理台不用挤在一份文件里。

还有一个常被忽略的点：`@path` 引用并不能凭空省上下文。被引用的内容最终还是会进上下文，只是维护起来更清楚。如果某些规则只对特定目录生效，优先考虑 `.claude/rules/` 这类按路径加载的规则，而不是继续往 `CLAUDE.md` 里塞。

### 初始化和维护

新项目可以先运行：

```bash
/init
```

Claude 会读仓库，生成一份初始 `CLAUDE.md`。这份文件只能当草稿，不要直接照单全收。它可能会猜错构建命令，也可能把显而易见的内容写得很长。

我更常用的维护方式是“错误驱动”：

```text
你刚才又用了字段注入。更新 CLAUDE.md，后续 Spring Bean 一律使用构造器注入。
```

同类错误出现两三次，再把它归纳成一条规则。这样 `CLAUDE.md` 会跟着项目演进，而不是一开始就写成 500 行的愿望清单。

## 权限管理要重视

### 分层授权

Claude Code 默认会对敏感操作弹确认，比如写文件、执行 Bash、调用 MCP 工具。刚开始这很烦，但这个烦是有价值的。你还不熟悉它会怎么行动时，不要急着把门全打开。

更稳的做法是分层授权：

- 高频只读命令可以放行，比如 `git diff`、`git status`、`rg`。
- 固定验证命令可以放行，比如 `mvn test`、`pnpm test`、`npm run lint`。
- 破坏性命令默认不放，比如 `rm -rf`、`git push --force`、修改 `.git/`。
- 凭据、环境文件和构建产物可以用 deny 规则挡住。

权限可以通过 `/permissions` 配，也可以写进 `.claude/settings.json`：

```json
{
  "permissions": {
    "allow": ["Bash(git status*)", "Bash(git diff*)", "Bash(rg *)"],
    "deny": [
      "Read(./.env)",
      "Read(./.env.*)",
      "Read(./secrets/**)",
      "Bash(rm -rf *)"
    ]
  }
}
```

规则不是写给模型看的，是 Claude Code 自己执行的。也就是说，就算 prompt 里写了“请一定不要读 `.env`”，那仍然只是建议；deny 规则才是真正的拦截。

### Auto Mode

如果频繁确认已经影响节奏，可以用 Auto Mode：

```bash
claude --permission-mode auto
```

它会用单独的分类器判断操作风险，低风险操作自动放行，高风险操作拦截或转人工确认。这个模式适合你大致信任当前任务方向，但又不想每次文件读写都点确认的场景。

不过 Auto Mode 不是安全沙箱。它解决的是“少点确认”，不是“随便执行也没事”。如果要让 Claude 跑很重的自动化任务，尤其涉及下载脚本、安装依赖、访问外部服务，最好配合容器或受限环境。

`--dangerously-skip-permissions` 我不建议在日常项目里用。除非你已经把文件系统、网络、凭据都隔离好了，否则它省下来的几次确认，可能换来一次很难收拾的误操作。

## 用 MCP、Skills、Sub-Agent 和插件解决不同的问题

Claude Code 的扩展能力很多，刚接触时容易混在一起。我的理解很简单：

| 能力        | 解决的问题                 | 适合场景                                     |
| ----------- | -------------------------- | -------------------------------------------- |
| `CLAUDE.md` | 每次会话都要知道的项目背景 | 编码规范、常用命令、仓库约定                 |
| MCP         | 连接外部系统               | 数据库、浏览器、Sentry、Slack、Notion、Figma |
| Skills      | 保存可复用流程             | 发布、修 Issue、写 Review、生成迁移脚本      |
| Sub-Agent   | 隔离高消耗支线任务         | 大量搜索、日志分析、安全审查、并行研究       |
| Hooks       | 强制执行动作               | 格式化、测试、禁止危险命令、提交前检查       |
| 插件        | 打包分发一整套能力         | 团队共享 Skills、MCP、Hooks、Sub-Agent       |

这几个东西不要互相替代。比如“每次编辑后必须跑 formatter”，写进 `CLAUDE.md` 只能靠 Claude 记得；写成 Hook 才是确定性执行。再比如“修 GitHub Issue 的步骤”，放 `CLAUDE.md` 会污染所有会话，做成 Skill 更合适。

### MCP：让 Claude 接上真实世界

MCP（Model Context Protocol，模型上下文协议）像一套接线规范：**外部系统把能力封装成 MCP Server，支持 MCP 的 AI 应用连接上来之后，就能发现这些能力并调用。**

![MCP 图解](https://oss.javaguide.cn/github/javaguide/ai/skills/mcp-simple-diagram.png)

它是 Claude Code 连接外部工具的主要方式。

你可以让它查数据库、读 Sentry 报错、访问浏览器、拉 Notion 文档、取 Figma 设计稿。

添加远程 MCP 服务器的命令大概长这样：

```bash
claude mcp add --transport http notion https://mcp.notion.com/mcp \
  --header "Authorization: Bearer your-token"
```

团队项目里，能共享的 MCP 配置可以放到 `.mcp.json`，再提交到仓库。比如某个项目统一要接 Notion、Sentry、内部文档系统，就可以把 server 名称、URL、transport 这些公共配置沉淀下来。

但私密 token 不要这么干。

带 token、密钥、数据库连接串的配置，放用户级配置、本地环境变量或者密钥管理系统里。

### Skills：把重复流程存下来

规则文件和 Skill 解决的问题不太一样。

规则文件更适合放这个项目一直要遵守什么，比如：技术栈版本、启动命令、目录结构、错误码格式、哪些文件不能碰。

Skill 更适合放遇到某类任务时应该怎么做。比如做代码审查、写测试、改前端页面、网页调研、写技术文章，这些任务每次流程都差不多，就没必要每次都在聊天里重新提醒一遍。

小 G 之前写过两篇相关的文章：[Agent Skills 是什么？和 Prompt、MCP 到底差在哪？](https://javaguide.cn/ai/agent/skills.html) 和 [AI 编程必备 Skills 推荐](https://javaguide.cn/ai-coding/programmer-essential-skills.html)。

简单说，Skill 就是一份能被 Agent 按需加载的任务说明。它不是插件，也不是 MCP 工具本身，而是把某类任务的流程、约束、检查项和踩坑经验写进 `SKILL.md`。

它的正文只在需要时加载，不会像 `CLAUDE.md` 一样每次会话都占上下文。用户级 Skill 放在 `~/.claude/skills/`，项目级 Skill 放在 `.claude/skills/`。

![Agent 执行链路](https://oss.javaguide.cn/github/javaguide/ai/skills/skills-agent-execution-link.png)

这些重复性很强的流程，都适合沉淀成 Skill。比如写功能前固定走 TDD，先写失败测试再实现；代码审查时固定检查安全、事务、性能和边界条件；写技术文章时固定核对事实来源、引用、标题层级和 AI 味。

Skill 的价值就在这里：把重复提醒变成可复用的工作手册。官方对 Skill 的定义也基本是这个意思：它是一组可复用的指令、脚本和资源，用来让 Claude 按固定流程处理某类任务。

现成 Skill 也可以直接用，比如 Superpowers 把 TDD、Code Review、Spec-Driven、Git Worktree、子 Agent 协作这些流程封装好了。

我在[ AI 编程必备 Skills 推荐：TDD、代码审查与网页自动化实战](https://javaguide.cn/ai-coding/programmer-essential-skills.html)这篇文章中有详细推荐。

但第三方 Skill 不要拿来就跑。`SKILL.md` 也是指令，里面如果带了危险命令、奇怪脚本、过宽权限，Agent 会照着做。装之前至少看一眼正文、`scripts/` 和 `references/`，确认它没有越权操作。

### Sub-Agent：让主会话保持干净

Claude Code 里还有一个很实用的能力，叫 Sub-Agent。

![Claude Code Sub-Agent：让主对话保持干净](https://oss.javaguide.cn/github/javaguide/ai/coding/claudecode-sub-agent.png)

它解决的问题很具体：当 Claude 需要调查一个复杂问题时，往往会读很多文件、搜很多代码、跑一些命令，最后主会话的上下文被一堆日志、搜索结果、文件内容塞满。Sub-Agent 的作用，就是把这类“高消耗的支线任务”拆出去处理。

你可以把它理解成一个独立上下文里的专项助手。它自己去读代码、查日志、分析问题，完成后只把结论汇报回主会话。这样主会话不用背着一大堆中间过程继续往下聊，干净很多。

Claude Code 内置了几类 subagent：

| **子代理**          | **模型**            | **用途**                       |
| ------------------- | ------------------- | ------------------------------ |
| **Explore**         | Haiku，偏快速低延迟 | 文件发现、代码搜索、代码库探索 |
| **Plan**            | 继承自主对话        | Plan Mode 下的代码库研究       |
| **general-purpose** | 继承自主对话        | 复杂研究、多步骤操作、代码修改 |

Explore 和 Plan 更偏只读研究，不负责直接改代码。general-purpose 能处理更复杂的多步骤任务，也可能涉及代码修改。所以用的时候要注意边界，不要把所有事情都丢给它。

你也可以创建自己的 subagent。项目级配置放在 `.claude/agents/`，适合团队共享；用户级配置放在 `~/.claude/agents/`，适合自己跨项目复用。每个 subagent 都可以配置自己的系统提示词、工具权限、模型，以及什么时候应该被调用。

几个比较典型的用法：

- **隔离高消耗操作**：让 subagent 跑测试套件，只把失败用例和错误信息汇报回来。
- **并行研究代码模块**：让不同 subagent 分别研究认证、数据库、API 模块，最后汇总结论。
- **链式委派任务**：先让 code-reviewer subagent 找性能问题，再让 optimizer subagent 尝试修复。

不过 subagent 也不是越多越好。任务太小、边界不清、代码还在剧烈变化时，拆出去反而会增加沟通成本。比较稳的用法是：主会话负责整体目标、关键决策和最后验收，subagent 负责局部、明确、可汇报的专项任务。务。

一个自定义安全审查子代理可以这么写：

```markdown
---
name: security-reviewer
description: Reviews Java and Spring Boot code for security risks.
tools: Read, Grep, Glob, Bash
model: opus
---

Review the target diff for:

- SQL injection and unsafe dynamic queries.
- Authentication and authorization bypass.
- Secrets or credentials committed to code.
- Unsafe deserialization or command execution.

Return concrete file and line references. Do not rewrite code unless explicitly asked.
```

### Hooks：别把硬规则写成软建议

Hooks 是我觉得最容易被低估的一块。它可以在 Claude Code 的生命周期节点上执行动作，比如工具调用前、文件编辑后、会话结束前、上下文压缩前后。

举个例子，假设 Claude Code 准备执行：

```bash
rm -rf /tmp/build
```

`PreToolUse` Hook 会先拿到这次 Bash 调用，判断它是不是危险命令；如果命中规则，就返回 `deny`，Claude Code 会取消这次工具调用，并把拒绝原因反馈给 Claude。

下面这张图展示了整个过程，图源 Claude Code 官方文档对 Hooks 的介绍。

![Claude Code PreToolUse Hook](https://oss.javaguide.cn/github/javaguide/ai/coding/claude-code-runs-rm-rf-tmp-build-what-happens.svg)

适合做 Hook 的事情：

- 编辑后自动格式化。
- 会话结束前跑测试。
- 禁止改 `migrations/` 或 `.github/workflows/`。
- 拦截 `curl | bash`、`rm -rf`、向外部端点发送敏感内容。
- 在 Sub-Agent 启动时注入额外上下文。

判断标准很简单：这件事如果漏掉一次会出问题，就用 Hook；如果只是希望 Claude 知道，才写进 `CLAUDE.md`。

## 最常用的工作流

### 探索、计划、执行、验证

复杂任务别一上来就让 Claude 写代码。先让它读仓库，暂时不要修改文件：

```text
进入 plan mode。先阅读 src/auth 和相关测试，搞清楚登录态刷新流程。
不要写代码，只汇报当前流程、关键文件和可能的修改点。
```

接着让它给计划：

```text
我要修复用户 session 超时后刷新 token 失败的问题。
基于刚才的阅读，列出要改的文件、测试策略和风险点。
```

你确认计划后再执行：

```text
按这个计划实现。优先补一个能复现问题的测试，再改实现。
完成后运行相关测试，把命令和结果贴出来。
```

这个流程慢在前面，快在后面。尤其是你不熟悉代码库，或者改动跨多个模块时，先计划通常能省掉后面大量返工。

小改动可以跳过计划。比如改一个文案、加一条日志、补一个明显空指针判断，直接让它做就行。过度规划也会浪费上下文。

### TDD 测试驱动开发

AI 写代码最大的问题不是慢，而是它很会写“看起来合理”的代码。TDD 能把这个问题压下去。

推荐提示词：

```text
先不要改实现。为 TokenRefreshService 写一个失败测试，
覆盖 session 已过期但 refresh token 仍有效的场景。
测试失败后再修改实现，直到测试通过。
```

这个顺序有两个好处：一是 Claude 必须先理解期望行为，二是你能看到它是不是真的复现了问题。否则它可能直接改一堆代码，然后告诉你“已修复”。

### 让 Claude 自己验证

Anthropic 官方最佳实践里有一句我很认同：**给 Claude 一个能运行的检查。测试、构建、lint、截图对比、脚本输出都可以。**

不要只说：

```text
写一个邮箱校验函数。
```

换成：

```text
写一个邮箱校验函数。测试用例：

- hello@gmail.com 应该通过
- hello@ 应该失败
- @domain.com 应该失败
- a@b.co 应该通过

写完后运行测试，把命令和结果贴出来。
```

有了验收标准，Claude 才能从“看起来完成了”变成“检查通过了”。

如果任务会跑很久，可以再加一句“最多尝试 3 轮，仍失败就停下来汇报阻塞点”，避免它在错误方向上消耗太多 Token。

### 代码库问答

接手陌生项目时，Claude Code 很适合当临时向导。你可以直接问：

```text
用户登录的完整流程是什么？从 HTTP 请求进来到 session 写入为止，
列出关键类和方法，不要修改文件。
```

或者：

```text
这个项目里订单状态机在哪里定义？每个状态之间怎么流转？
如果有隐式约束，也一起指出来。
```

这种问题原本要问老同事，Claude 不嫌你问得细。

缺点也要承认：它总结出来的内容仍然要抽查，尤其是跨服务调用、配置开关、历史兼容逻辑，别全信。

### Bug 修复需要提供错误信息

很多人会这样问：

```text
登录有 bug，帮我修一下。
```

更好的方式是把原始材料直接给它：

```text
下面是线上报错日志、复现步骤和相关请求参数。
请先定位可能原因，不要马上改代码。
找到根因后，补一个能复现的测试，再修复。
```

日志、堆栈、Slack 讨论、Docker 输出、失败测试结果，都比你转述“好像是缓存问题”更有用。你一转述，就把 Claude 限定在你的猜测里了。

### 多实例和 Worktree

不要让一个 Claude 做所有事。真正提效的方式，是把独立任务拆开并行跑。

Claude Code 支持用 Git Worktree 隔离不同会话：

```bash
claude --worktree feature-auth
claude --worktree bugfix-payment
```

每个 Worktree 有独立目录和分支，一个会话改认证模块，另一个会话修支付 bug，不会互相踩文件。官方桌面应用也会为新会话自动创建 Worktree，这个方向和 CLI 是一致的。

![Claude Code Git Worktree](https://oss.javaguide.cn/github/javaguide/ai/coding/claude-code-git-worktree.png)

如果你已经有多个后台会话，可以用：

```bash
claude agents
```

Agent View 会把后台 session 放在一个界面里，看哪些在运行、哪些需要你确认、哪些已经完成。多会话用久了以后，这比开一排终端窗口清爽很多。

## 常用命令

分享一些非常实用的命令，不需要记，大概知道有就好了：

- `/simplify`：派三个 Agent 并行审查你刚写的代码，找到问题直接帮你改。适合提交前自审、重构后清理技术债。
- `/batch`：把一个大需求自动拆成多个工作单元，开多个后台 Worker 在隔离 worktree 里并行干。适合边界清晰的多模块大改。
- `/loop`：既能定时调度（每隔多久跑一次），也能自主试错（给个目标让它反复"执行—验证—修正"直到达成）。
- `/run`：把应用启动起来，看改动是不是真生效。
- `/verify`：比 `/run` 更轻量，主要做构建和运行验证，快速确认有没有编译或运行时问题。
- `/review`：日常 PR 和本地变更审查的主力，关注正确性、边界条件和潜在 Bug。
- `/diff`：看 Claude 到底改了哪些文件哪些行，`/simplify`、`/batch` 跑完必看一眼。
- `/context`：看上下文占用，长任务变慢、变飘时先查它。
- `/compact`：总结并压缩上下文，长会话继续推进前用。

我在[Claude Code 核心命令详解：simplify、review、loop、batch、run、verify](https://javaguide.cn/ai-coding/claudecode-commands.html)这篇文章中有详细推荐。

## 提示词怎么写更稳

### 尽量说英文，但别迷信英文

编程任务里，英文通常更稳。不是因为中文不行，而是代码、库名、错误信息、API 文档本来就大量使用英文。比如 `modal`、`debounce`、`retry policy`、`transaction boundary`，直接用英文比翻成中文更不容易歧义。

但业务背景、产品规则、中文文案，当然用中文说更准。我的习惯是：代码相关的动作、约束和术语尽量英文；业务语义和验收标准用中文讲清楚。

### 限制范围

Claude 最怕“调查一下这个项目”。它会很认真地读一堆文件，然后把上下文吃满。

更好的写法：

```text
只调查 src/payment 和 src/order 目录。
目标是确认订单支付成功后库存扣减在哪里触发。
不要修改文件，只列出调用链和关键类。
```

范围、目标、禁止动作，三件事写清楚，它就不容易乱跑。

### 给金标准范例

让 Claude 按项目风格写代码时，最好给一个现有样板：

```text
阅读 UserController.java、UserService.java 和 UserDTO.java。
参考它们的分层方式、构造器注入、Result<T> 返回格式和异常处理。
为订单查询补一个 OrderController，不要引入新的返回结构。
```

这比“按最佳实践写一个 Controller”靠谱得多。最佳实践太宽，项目里的既有风格才是最强约束。

### 前端别只说“做得好看”

如果让 Claude 写前端，别只说“现代、简洁、高级”。这类词太空，最后很容易得到 Inter 字体、紫色渐变、大圆角卡片。

更具体一点：

```text
使用现有 Ant Design 组件，不新增 UI 库。
页面是后台运营工具，信息密度优先，不要营销页风格。
主色沿用项目 CSS 变量，不要新增紫色渐变背景。
参考 src/pages/UserList.tsx 的筛选区和表格布局。
```

设计也可以做成 Skill，让 Claude 每次写前端前先读取项目视觉规范。重点不是“让它更有创意”，而是先把不该出现的套路挡住。

## 安全边界

Claude Code 很强，但它不是你的同事账号，也不该拥有同事账号的全部权限。

我建议至少守住几条线：

- 不把生产凭据、数据库密码、云厂商长期 token 暴露给 Claude。
- 不让它直接操作生产环境，除非有审批和审计。
- 不允许默认 push 到 `main` 或强推远端分支。
- 不让它在无隔离环境里执行来源不明的远程脚本。
- 不把 `.env`、`secrets/`、证书目录纳入可读范围。

真的需要自动化高权限任务时，放进容器、临时凭据、最小权限账号里跑。AI 写错代码还能 review，AI 拿错权限就麻烦多了。

## 常见失败模式

| 失败模式         | 症状                                   | 更稳的处理方式                                |
| ---------------- | -------------------------------------- | --------------------------------------------- |
| 会话太杂         | 一个会话里同时聊需求、排错、重构、发版 | 切任务就 `/clear`，必要时写 `HANDOFF.md`      |
| 纠正死循环       | 同一处错误纠正 3 次还不对              | 停止当前上下文，重写起始 prompt               |
| `CLAUDE.md` 膨胀 | 规则很多，Claude 反而不遵守            | 保留真实犯错后总结出的规则                    |
| 无边界调查       | 一次读几百个文件，上下文耗尽           | 限定目录、目标和禁止动作，或交给 Sub-Agent    |
| 只看绿灯         | 测试通过但行为不对                     | 让 Claude 展示证据，对比 main 和 feature 分支 |
| 权限过宽         | 为了省确认，直接 bypass                | 用 allow/deny、Auto Mode、容器隔离分层处理    |

## 最后几句

Claude Code 用顺手以后，感觉会从“我让 AI 写点代码”变成“我在调度几个能读代码、能跑命令的助手”。这时候最重要的不是写更玄的提示词，而是把上下文、权限、验证和任务边界管好。

我自己最常用的组合很朴素：`CLAUDE.md` 写清项目规矩，复杂任务先 plan，改动后必须 verify，长调查丢给 Sub-Agent，多任务用 Worktree 隔离。剩下的技巧都可以慢慢加。

别急着让 Claude 接管一切。先让它在一个小范围里稳定做对，再把边界往外推。

## 参考资料

- [Best practices for Claude Code](https://code.claude.com/docs/en/best-practices)
- [Claude Code CLI reference](https://code.claude.com/docs/en/cli-reference)
- [Claude Code commands](https://code.claude.com/docs/en/commands)
- [Claude Code settings](https://code.claude.com/docs/en/settings)
- [Configure permissions](https://code.claude.com/docs/en/permissions)
- [Extend Claude with skills](https://code.claude.com/docs/en/slash-commands)
- [Create custom subagents](https://code.claude.com/docs/en/sub-agents)
- [Automate with hooks](https://code.claude.com/docs/en/hooks)
- [Manage multiple agents with agent view](https://code.claude.com/docs/en/agent-view)
- [Run parallel sessions with worktrees](https://code.claude.com/docs/en/worktrees)
