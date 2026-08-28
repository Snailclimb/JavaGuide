---
title: Claude Code Hooks 详解：生命周期钩子与自动化工作流
description: 从 Claude Code 生命周期出发，讲清 Hooks 的触发时机、handler 类型、输入输出、安全拦截、自动格式化和通知提醒，帮助你用 Hooks 把提示词里的软约束变成可审计、可复用的自动化动作。
category: AI 编程原理
tag:
  - Claude Code
  - Hooks
  - AI Agent
  - AI 编程
head:
  - - meta
    - name: keywords
      content: Claude Code,Hooks,生命周期钩子,AI编程,自动化工作流,PreToolUse,PostToolUse,UserPromptSubmit,SessionStart,权限控制
---

用 Claude Code/ Codex 写代码到一定阶段之后，很多人会遇到同一个问题。

问题通常不在模型能力上。

恰恰相反，是它太能干了。它能改文件、跑命令、查项目结构、生成脚本，也能一口气处理一串很长的任务。于是你会很自然地开始把更多动作交给它。

然后问题就来了：改完文件，它这次会不会忘了格式化？准备跑 Bash 命令时，它会不会不小心带上 `rm -rf`？它会不会顺手改到 `.env`、`.git/` 或生产配置？它卡在权限弹窗时，我能不能不用一直盯着终端？......

它们都不适合只靠提示词解决，因为提示词约束不够，无法完全保证。

这个时候就需要用到了 Hooks 了，它解决的就是这些问题，自动触发执行。

这两者的差别，可以先用一张图概括：

![Prompt 提醒依赖上下文和模型记忆，Hooks 卡点通过自动触发、脚本审计和风险阻断保证动作发生](https://oss.javaguide.cn/github/javaguide/ai/coding/claudecode/hooks-vs-prompts-guarantee.webp)

我更愿意把 Hooks 理解成 Claude Code 工作流里的固定卡点。会话开始、用户提交 Prompt、工具调用前后、上下文压缩前后，都可以挂上对应的处理动作。

## Hooks 到底是什么

Hook 配置主要看事件和 handler。事件决定什么时候触发，handler 接收当时的输入并完成具体动作。

比如把一个 `command` handler 挂到 `PostToolUse`：Claude 成功修改文件后，Claude Code 会把这次工具调用的 JSON 交给脚本，脚本再决定是否运行 formatter。整个过程不需要 Claude 回头读提示词，也可以把脚本拿出来单独测试。

handler 也不限于 shell command，官方还支持 HTTP endpoint、MCP 工具和 LLM prompt 等形式（见官方文档 [Hooks reference](https://code.claude.com/docs/en/hooks) 中 "Hook handler fields" 一节）。

![Claude Code 官方文档 Hooks reference 页面列出的五类 handler：command、http、mcp_tool、prompt 和 agent](https://oss.javaguide.cn/github/javaguide/ai/coding/claudecode/hooks-handler-types-official-docs.png)

下图标出了常用触发点：

![Claude Code Hooks 围绕 SessionStart、UserPromptSubmit、PreToolUse、PostToolUse、PermissionRequest 和 PreCompact 等生命周期节点自动执行](https://oss.javaguide.cn/github/javaguide/ai/coding/claudecode/claude-code-hooks-lifecycle-map.webp)

Hook handler 主要有五类：

| 类型       | 做什么                               | 适合场景                               |
| ---------- | ------------------------------------ | -------------------------------------- |
| `command`  | 执行 shell command                   | 格式化、日志、安全拦截、通知           |
| `http`     | 把事件 JSON POST 到一个 URL          | 团队审计服务、远程通知、集中化策略     |
| `mcp_tool` | 调用已连接 MCP server 上的工具       | 复用现有 MCP 能力                      |
| `prompt`   | 用一次模型判断返回 yes/no 风格 JSON  | 轻量判断，比如 Stop 前检查任务是否完成 |
| `agent`    | 启动带工具访问能力的 subagent 做验证 | 需要读文件、搜代码、跑命令的验证       |

不过，这五类 handler 不是每个事件都能用：

- `PreToolUse`、`PostToolUse`、`PermissionRequest`、`Stop` 等事件支持全部五种类型；
- `Notification`、`PreCompact`、`ConfigChange` 等事件不支持 `prompt` 和 `agent`；
- `SessionStart`、`Setup` 只支持 `command` 和 `mcp_tool`。

准备使用非 command handler 时，最好先查一下对应事件的兼容范围。

这一步直接交给 AI 去做就好，你只需要提供我写的这篇文章给你使用的 Coding Agent 或者直接发一下官方的文档链接给它。

能确定性地写成脚本的规则，优先交给 `command`。脚本可以脱离 Claude Code 单独运行，失败原因也更容易复现。

只有验证过程需要读代码、运行测试并综合判断时，才需要考虑 `prompt` 或 `agent`。其中 `agent` hooks 在官方文档里仍标注为 experimental，接入前要把额外的调试成本算进去。

五类 handler 的关系如下：

![Hook handler 包括 command、http、mcp_tool、prompt 和 agent，优先使用稳定可审计的 command 脚本](https://oss.javaguide.cn/github/javaguide/ai/coding/claudecode/hook-handler-types.webp)

## Hooks 到底解决了什么问题

假设 `CLAUDE.md` 里写着“改完代码请运行 Prettier”。这条说明会进入上下文，Claude 通常会照做；任务变长、期间插入新要求后，它也可能漏掉。项目规则还没整理清楚时，可以先看 [CLAUDE.md 最佳实践](https://javaguide.cn/ai-coding/practices/claude-md-best-practices.html)。

“不要修改 `.env`”也有相同问题。自然语言可以说明意图，却无法在每次文件写入前强制检查路径。把规则接到 `PreToolUse` 后，脚本可以读取目标文件并在命中敏感路径时直接阻断；格式化则可以放在 `PostToolUse`，只处理刚修改的文件。

这类机制和 pre-commit、CI、lint-staged、CODEOWNERS、branch protection 的作用相近：把格式化、危险命令检查、权限通知等固定动作写进流程，留下可检查的执行结果。Hooks 补上的正是 Claude Code 生命周期中的这一段。

## Hooks 最小配置

Hook 配在 Claude Code 的 settings 文件里。常用位置有三个：

| 位置                          | 作用范围             | 适合放什么                   |
| ----------------------------- | -------------------- | ---------------------------- |
| `~/.claude/settings.json`     | 当前用户所有项目     | 个人通知、个人习惯           |
| `.claude/settings.json`       | 当前项目，可提交仓库 | 团队共享规则、项目级安全限制 |
| `.claude/settings.local.json` | 当前项目本机私有     | 不适合提交的个人配置         |

官方还支持 managed policy、插件的 `hooks/hooks.json`，以及 skill 或 agent frontmatter 里的 hooks。

日常写项目，先记住上面三个就够了。

一个最小配置长这样：

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "jq -r '.tool_input.file_path' | xargs npx prettier --write"
          }
        ]
      }
    ]
  }
}
```

拆开看，其实就是三层：

- `PostToolUse` 是事件名，表示工具调用成功之后触发。
- `matcher` 是过滤条件。这里写 `Edit|Write`，只在 Claude Code 使用 `Edit` 或 `Write` 改文件之后触发。工具名 matcher 可以用 `|` 分隔；从 Claude Code v2.1.191 开始，也可以用 `,` 分隔并在两侧留空格。带连字符的精确 matcher 则需要 v2.1.195 或更高版本，旧版本可以用 `^...$` 限定完整匹配。
- `hooks` 数组里是真正执行的 handler。这里是一个 `command`，会从 stdin 的 JSON 里取出刚编辑的文件路径，再交给 Prettier。

示例为了短，把命令直接写进了 JSON。实际项目里，只要命令开始变长，或者要引用项目里的脚本，我更建议写成独立文件，再用 `${CLAUDE_PROJECT_DIR}` 指过去：

```json
{
  "type": "command",
  "command": "${CLAUDE_PROJECT_DIR}/.claude/hooks/format-after-edit.sh",
  "args": []
}
```

官方文档建议，引用项目路径、插件路径这类占位符时优先用 exec form。每个 `args` 元素都会作为一个独立参数传给脚本，不再经过 shell 分词，因此路径中的空格、括号或特殊字符不会被二次拆分。

省略 `matcher`、填写空字符串或使用 `.*`，都会让这个 hook group 匹配对应事件的每一次触发。对格式化任务来说，这可能意味着每次工具调用后都启动 formatter；放在权限事件上，则可能把所有授权弹窗交给同一套自动处理逻辑。

matcher 应该贴着实际输入写。格式化文件就匹配 `Edit|Write`，检查 shell 风险就匹配 `Bash`，减少无关调用，也便于从日志里定位是哪条规则产生了结果。

## Hook 输入输出怎么工作

Hook 触发时，Claude Code 会把事件上下文作为 JSON 传给 handler：

- 如果是 `command` hook，这段 JSON 走 stdin。
- 如果是 `http` hook，这段 JSON 会作为 POST body 发给服务端。

所有事件都会有一些公共字段，比如：

| 字段              | 含义                       |
| ----------------- | -------------------------- |
| `session_id`      | 当前会话 ID                |
| `transcript_path` | 会话 JSONL 文件路径        |
| `cwd`             | 触发 hook 时的工作目录     |
| `permission_mode` | 当前权限模式，部分事件才有 |
| `hook_event_name` | 触发的事件名               |

工具相关事件还会带 `tool_name` 和 `tool_input`。

比如 Claude Code 准备执行 `npm test` 时，`PreToolUse` 可能收到这样的输入：

```json
{
  "session_id": "abc123",
  "cwd": "/Users/example/project",
  "hook_event_name": "PreToolUse",
  "tool_name": "Bash",
  "tool_input": {
    "command": "npm test"
  }
}
```

所以 Hook 脚本里很常见的一段就是：

```bash
INPUT="$(cat)"
TOOL_NAME="$(echo "$INPUT" | jq -r '.tool_name // empty')"
COMMAND="$(echo "$INPUT" | jq -r '.tool_input.command // empty')"
```

这里建议用 `jq` 解析 JSON，不要自己用 grep 拼字段。

这里别按普通脚本的习惯乱写。

Claude Code 会在每个退出码下检查 stdout。如果去掉开头空白后第一个字符是 `{`，就会尝试按 JSON 解析。准备返回结构化决策时，推荐使用 `exit 0`，并且不要往 stdout 里塞调试日志。错误原因和调试信息写 `stderr`。想阻断，大多数事件用 `exit 2`；普通非 0 错误很多时候只是 hook 报错，流程还会继续。

最容易踩的坑是 `exit 1`。

在普通 shell 脚本里，`exit 1` 经常表示失败。但在 Claude Code Hooks 里，如果 stdout 为空、是普通文本，或者 JSON 没通过校验，`exit 1` 对多数 hook event 只是非阻断错误，流程会继续。如果 stdout 是符合事件 schema 的 JSON，采用标准决策模型的事件会忽略这个退出码，按 JSON 里的字段处理结果。

再说 JSON 输出。

如果你想更精细地控制，比如 `PreToolUse` 里返回 `allow`、`deny`、`ask`、`defer`，推荐 `exit 0`，然后 stdout 只输出一个 JSON 对象。

例如拒绝一次工具调用：

```json
{
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permissionDecision": "deny",
    "permissionDecisionReason": "Database writes are not allowed"
  }
}
```

如果是 `PermissionRequest`，结构又不一样，重点在 `decision.behavior`：

```json
{
  "hookSpecificOutput": {
    "hookEventName": "PermissionRequest",
    "decision": {
      "behavior": "allow"
    }
  }
}
```

别把 stdout 当日志打。

如果你要输出 JSON，stdout 就只放 JSON。调试信息写 stderr，或者写到日志文件。否则很容易遇到 `JSON validation failed`，然后盯着配置怀疑人生。

如果脚本 `exit 2`，Claude Code 仍然会读取 stdout 里符合 schema 的 JSON。对支持阻断的事件来说，`exit 2` 的阻断结果不能被 JSON 覆盖；没有有效的 JSON 阻断原因时，Claude Code 才会使用 stderr。`PermissionRequest` 是个例外，它不接受 `exit 2` 阻断，批准或拒绝都要通过 `decision` 对象返回。

同一个事件下，如果有多个 Hook 同时命中，Claude Code 会让它们都跑完再合并结果。一个 Hook 返回 deny，不会阻止旁边那个 Hook 写日志、发 HTTP 请求或改文件；`PreToolUse` 里多个决策合并时，会采用更严格的结果。

所以，只要 Hook 会写日志、发请求、改文件，就应该自己判断要不要执行。不要假设另一个安全 Hook 会先跑、会先拦住风险。

改工具输入也一样要克制。官方文档特别提醒过，**如果多个 Hook 都尝试改同一个工具输入，最后生效的是最后完成的那个；但 Hook 是并行执行的，谁最后完成并不稳定。**

另外，`command` Hook 会直接以当前用户的权限运行 shell 命令。它能访问、修改甚至删除当前用户有权限操作的文件，所以接入第三方脚本前，一定要先看懂并单独测试。

![Claude Code 官方文档提醒 command Hook 会以当前用户权限执行 shell 命令，可能访问、修改或删除文件](https://oss.javaguide.cn/github/javaguide/ai/coding/claudecode/hooks-security-warning-official-docs.png)

## 常用生命周期事件怎么理解

官方文档里列出的事件不少，从会话、工具、权限、子 agent、任务、配置变化、工作树，到 MCP elicitation 都有。

事件名很多，但刚开始真正常用的就几类：会话开始、用户提交 Prompt、工具执行前、工具执行后、权限决定、停止响应、上下文压缩。

| 事件                | 触发时机                          | 适合做什么                             |
| ------------------- | --------------------------------- | -------------------------------------- |
| `SessionStart`      | 会话开始或恢复时                  | 注入动态上下文、加载环境、压缩后补规则 |
| `UserPromptSubmit`  | 用户提交 Prompt 后，Claude 处理前 | Prompt 审计、轻量拦截、补动态上下文    |
| `PreToolUse`        | 工具调用执行前                    | 拦危险命令、保护敏感文件、修改工具输入 |
| `PermissionRequest` | 工具调用需要权限决定时            | 审计权限，或非常窄地自动批准           |
| `PostToolUse`       | 工具调用成功后                    | 格式化、记录日志、lint、补充上下文     |
| `Notification`      | Claude Code 发送通知时            | 桌面通知、手机推送                     |
| `Stop`              | Claude 完成一轮响应时             | 完成通知、质量门禁、提醒继续处理       |
| `PreCompact`        | 上下文压缩前                      | 备份状态、阻止不合适的压缩             |
| `PostCompact`       | 上下文压缩后                      | 记录摘要、同步外部状态                 |

再往下，是一批进阶事件。知道有它们就行，用到时查官方 Reference或者直接问 AI。

| 类别              | 事件                                                                                                       |
| ----------------- | ---------------------------------------------------------------------------------------------------------- |
| 会话和配置        | `Setup`、`InstructionsLoaded`、`ConfigChange`、`CwdChanged`、`DirectoryAdded`、`FileChanged`、`SessionEnd` |
| 提示词和展示      | `UserPromptExpansion`、`MessageDisplay`、`TeammateIdle`                                                    |
| 工具和权限        | `PermissionDenied`、`PostToolUseFailure`、`PostToolBatch`                                                  |
| 子 agent 和任务   | `SubagentStart`、`SubagentStop`、`TaskCreated`、`TaskCompleted`                                            |
| 工作树和 MCP 表单 | `WorktreeCreate`、`WorktreeRemove`、`Elicitation`、`ElicitationResult`                                     |
| 停止补充          | `StopFailure`                                                                                              |

几个容易混淆的事件，需要按实际触发顺序区分。

`PreToolUse` 发生在工具执行之前。Bash 命令检查、`.env` 保护和生产配置写入限制都应该放在这个阶段，脚本才有机会在副作用出现前返回拒绝结果。

`PostToolUse` 发生在工具成功之后，所以它适合收尾，不适合做第一道安全门。比如格式化可以放这里，但敏感文件保护不能只靠它，因为文件已经被改了。它仍然可以用 JSON 给 Claude 提供反馈，或者替换工具输出，只是无法撤销刚刚发生的工具调用。

`PermissionRequest` 在工具调用需要权限决定、Claude Code 准备请求权限时触发，可以批准或拒绝这次请求。交互模式下通常会显示权限确认框；无法显示确认框的后台非交互 subagent 仍会运行这个 Hook，如果没有 Hook 返回决定，工具调用会被拒绝。在 `-p` 非交互模式中，只有 Agent SDK 的 `canUseTool` 回调会提供这套权限请求流程；普通 `claude -p` 应该使用 `PreToolUse` 做自动权限决策。必须稳定执行的风险检查仍然要放在 `PreToolUse`，自动批准也要同时收窄 matcher 和输入条件，避免全局放行。

`Stop` 不等于“任务完成”，它只是 Claude 准备结束本轮响应时触发。如果你用 Stop hook 做质量门禁，要防止循环。官方提供了 `stop_hook_active` 字段帮助判断当前是否已经由 Stop hook 继续过；连续阻断达到 8 次后，Claude Code 会忽略 Hook 的阻断并结束本轮响应。

`PreCompact` 可以阻止压缩，`PostCompact` 不能改变已经完成的压缩结果。压缩后重新注入规则，更常见的做法是用 `SessionStart` 搭配 `compact` matcher。上下文压缩和规则补回属于 Context Engineering 的一部分，想继续展开可以看 [上下文工程实战指南](https://javaguide.cn/ai/agent/context-engineering.html)。

## 三个最小可用示例

真要上手，我建议大家从三个例子开始：一个只负责通知，一个负责改完文件后的收尾，一个放在工具执行前做拦截。

它们刚好覆盖低风险、自动化收益和安全底线三种场景。

### Notification，Claude 需要你时弹个通知

这个适合第一个配，因为它几乎不碰代码，风险最低。

macOS 上可以写到 `~/.claude/settings.json`：

```json
{
  "hooks": {
    "Notification": [
      {
        "matcher": "permission_prompt",
        "hooks": [
          {
            "type": "command",
            "command": "osascript -e 'display notification \"Claude Code needs your attention\" with title \"Claude Code\"'"
          }
        ]
      }
    ]
  }
}
```

这里 `matcher` 写 `permission_prompt`，表示只有 Claude 需要你批准工具调用时才通知。这个通知通常要等权限请求停留大约 6 秒后才触发，不是确认流程一开始就立即发送。如果想所有通知都触发，可以省略 matcher 或写空字符串。官方列出的 Notification matcher 还包括 `idle_prompt`、`auth_success`、`elicitation_dialog` 等。

如果 macOS 没弹通知，先在终端手动跑：

```bash
osascript -e 'display notification "test"'
```

然后去系统设置里给 Script Editor 打开通知权限。这个坑很常见，Hook 可能已经触发，只是系统没让通知显示。

### PostToolUse，改完文件自动格式化

前端项目里，最常见的是改完 `Edit` 或 `Write` 后跑 Prettier：

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "jq -r '.tool_input.file_path' | xargs npx prettier --write"
          }
        ]
      }
    ]
  }
}
```

这段配置有三个关键信息。

`matcher` 只匹配 `Edit|Write`，所以读文件、跑 Bash、调用 MCP 工具都不会触发格式化。

`command` 从 stdin JSON 里拿 `.tool_input.file_path`，再交给 `npx prettier --write`。

这个 Hook 在 `PostToolUse` 上，所以它是“工具执行后收尾”。formatter 失败时，你可以让错误暴露出来，也可以改成脚本，按文件后缀选择不同 formatter。

比如更稳一点的脚本：

```bash
#!/usr/bin/env bash
set -euo pipefail

file="$(jq -r '.tool_input.file_path // empty')"

case "$file" in
  *.js|*.jsx|*.ts|*.tsx|*.json|*.md)
    npx prettier --write "$file"
    ;;
esac
```

Hook 没有魔法。如果你是 Java 项目，应该换成 `spotlessApply`、`google-java-format` 或项目里已有的格式化命令。如果你是 Python 项目，可能是 `ruff format`。先贴着项目现有工具走，不要为了写 Hook 新造一套格式化体系。

### PreToolUse，阻止危险命令和敏感文件

`PreToolUse` 会在工具执行前提供 `tool_name` 和 `tool_input`。脚本可以先检查命令和文件路径，命中风险时直接拒绝这次调用。

先写一个脚本，比如 `.claude/hooks/guard.sh`：

```bash
#!/usr/bin/env bash
set -euo pipefail

input="$(cat)"
tool="$(jq -r '.tool_name // empty' <<<"$input")"
command="$(jq -r '.tool_input.command // empty' <<<"$input")"
file="$(jq -r '.tool_input.file_path // empty' <<<"$input")"

if [[ "$tool" == "Bash" ]] && [[ "$command" =~ rm[[:space:]]+-rf|chmod[[:space:]]+-R[[:space:]]+777 ]]; then
  echo "Blocked risky shell command: $command" >&2
  exit 2
fi

if [[ "$tool" == "Edit" || "$tool" == "Write" ]]; then
  case "$file" in
    *.env|*.env.*|*/.env|*/.git/*|*id_rsa*|*id_ed25519*)
      echo "Blocked sensitive file edit: $file" >&2
      exit 2
      ;;
  esac
fi

exit 0
```

给它执行权限：

```bash
chmod +x .claude/hooks/guard.sh
```

再挂到项目级 `.claude/settings.json`：

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash|Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "\"$CLAUDE_PROJECT_DIR\"/.claude/hooks/guard.sh"
          }
        ]
      }
    ]
  }
}
```

这段脚本放在工具执行前，并通过返回值表达处理结果。命中风险后，它把原因写到 stderr 并执行 `exit 2`；Claude Code 会阻止这次工具调用，同时把原因反馈给 Claude。

实际项目里，敏感清单要按自己的情况改。生产配置、凭证文件、迁移脚本、锁文件、CI 配置，都可以逐步加进去。

这里别只靠一条命令黑名单兜底。比如只拦 `rm *`，不代表能拦住 `/bin/rm`、`find -delete` 这类变体。高风险操作最好同时结合路径限制、权限配置、Hooks、Sandbox、CI 和人工 Review。

## 非 command Hook 怎么选

`command` 适合本机就能完成的确定性任务，前面的格式化、通知和命令拦截都属于这一类。脚本可以独立调试，也容易纳入代码审查。

团队需要集中收集审计记录或执行远程策略时，可以用 `http`。服务端返回的 JSON body 会按 command hook 的 JSON 输出格式处理。HTTP 状态码本身不负责阻断工具调用；服务端需要返回 2xx，并在 response body 中提供符合 schema 的决策字段。

`mcp_tool` 用于调用已经连接的 MCP server。它不会触发 OAuth，也不会替你建立连接。`SessionStart`、`Setup` 等事件发生得较早，如果 MCP server 此时尚未就绪，调用会直接失败。

`prompt` 根据 Hook 输入做一次模型判断，例如在 Stop 前检查任务是否完成。验证还需要读文件、搜索代码或运行命令时，可以使用 `agent`，但它目前仍是 experimental 功能。

选择时先看判断依据放在哪里：规则完全由输入字段和脚本决定，用 `command`；结果需要进入团队服务，用 `http`；已经有可用的 MCP 工具，再选 `mcp_tool`；只有语义判断无法写成确定规则时，才引入 `prompt` 或 `agent`。

## Hooks 和 Skills 到底怎么分

这俩概念也特别容易混。

Skills 通过 `SKILL.md` 扩展 Coding Agent 的能力。Coding Agent 在执行任务时，会主动决定是否使用相关 skill，你也可以用 `/skill-name` 显式调用。

Skill 的正文只有在使用时才加载进上下文（渐进式加载），所以很适合沉淀长流程、检查清单、项目知识、脚本和参考资料。

![Skill 渐进式披露](https://oss.javaguide.cn/github/javaguide/ai/skills/agent-skills-progressive-disclosure.webp)

如果想系统理解 Skills 和 Prompt、MCP、Function Calling 的分工，可以看 [Agent Skills 是什么？和 Prompt、MCP 到底差在哪？](https://javaguide.cn/ai/agent/skills.html)。

![Agent 执行链路](https://oss.javaguide.cn/github/javaguide/ai/skills/skill-agent-execution-link.webp)

Hooks 在生命周期节点上自动执行动作，Skills 则把完成某类任务所需的说明、脚本和参考资料交给 Claude。两者可以按下表区分：

![Hooks 适合自动触发、固定动作和安全阻断，Skills 适合按需加载、上下文判断和复杂流程](https://oss.javaguide.cn/github/javaguide/ai/coding/claudecode/hooks-vs-skills-responsibilities.webp)

| 维度             | Hooks                                                        | Skills                                                   |
| ---------------- | ------------------------------------------------------------ | -------------------------------------------------------- |
| 触发方式         | Claude Code 生命周期事件自动触发                             | Claude 判断相关时加载，或用户手动 `/skill-name`          |
| 核心价值         | 让固定动作稳定发生                                           | 给 Claude 增加某类能力或流程知识                         |
| 适合场景         | 格式化、危险命令拦截、权限审计、通知、日志、质量门禁         | 代码审查流程、部署 SOP、故障排查、资料检索、复杂任务处理 |
| 对模型判断的依赖 | 低，尤其是 `command` hook                                    | 更高，Claude 需要理解并执行 skill 指令                   |
| 是否适合阻断     | 适合，尤其是 `PreToolUse`、`UserPromptSubmit`、`Stop` 等事件 | 不适合作为硬拦截机制                                     |
| 常见风险         | matcher 写太宽、脚本慢、自动批准过度                         | 描述不清、触发不准、流程太长                             |

放到实际任务里就好理解了。文件刚被 `Edit` 或 `Write` 修改，可以直接把路径交给 Prettier；工具准备写入 `.env`，也可以在执行前检查路径并拒绝。这些信息都能从事件输入里拿到，脚本不需要猜。

代码审查和接口超时排查就没这么固定了。Claude 要先读代码、日志和任务要求，再决定检查哪些文件、运行哪些命令，这类流程放进 Skill 更合适。

两者也可以接在同一条工作流上：**Skill 规定代码审查要检查什么，Hook 负责在文件修改后运行 formatter、在危险命令执行前拦截，以及在响应结束前检查是否留下测试结果。**

## 实际落地：先把三个 Hook 跑稳

第一版不用急着覆盖所有生命周期事件，按 `Notification`、`PostToolUse`、`PreToolUse` 的顺序接入就够了。

![Claude Code Hooks 建议按 Notification、PostToolUse、PreToolUse 的顺序渐进接入](https://oss.javaguide.cn/github/javaguide/ai/coding/claudecode/hooks-progressive-rollout.webp)

Hook 配得越多，出问题时越难定位。比如 Claude 突然不再响应，你得逐个确认：`PreToolUse` 有没有返回 deny，`PermissionRequest` 有没有给出权限决定，`Stop` 是否反复触发，某个 `PostToolUse` 脚本是不是跑超时了。这几种问题表面上很像，排查方式却完全不同。

先接 `Notification`。前面的示例只在等待授权时发通知，不会修改项目文件。收到通知，至少能确认配置已经加载，事件和 matcher 也成功命中。即使写错了，影响通常也比较小。

通知正常后，再把 `PostToolUse` 接到项目已有的格式化工具上。前端项目用 Prettier，Python 项目用 Ruff，Java 项目继续沿用原来的格式化命令。matcher 负责限制工具名，脚本再按文件类型筛选，别让一次无关的 Bash 命令或读取操作也启动 formatter。

最后再测 `PreToolUse`，因为它会直接阻断工具调用。刚开始只拦几类明确的高风险操作，例如删除命令、递归提权，以及对 `.env`、`.git/`、私钥和生产配置的访问。先从日志里观察拦截结果，再根据误拦记录调整规则。

命令黑名单只能识别已经写进去的命令形式，换一种写法就可能绕过去。路径限制、权限配置、沙箱和人工 Review 仍然要保留，不能因为加了 `PreToolUse` 就删掉。

这三个 Hook 跑稳后，再根据项目里实际发生的问题补事件。上下文压缩后经常丢规则，可以用 `SessionStart` 的 `compact` matcher 重新注入，必要时再通过 `PreCompact` 保存当前状态。需要追踪配置变化时接 `ConfigChange`；工作目录或文件变化会影响环境时，再考虑用 `CwdChanged`、`FileChanged` 配合 `CLAUDE_ENV_FILE`。

如果用 `Stop` 做完成检查，脚本里必须同时写好退出条件。否则 Hook 让 Claude 继续处理后，下一轮结束时又会命中同一条规则，来回重复。Claude Code 连续阻断 8 次后会强制结束本轮，但前面的重复处理照样会浪费时间和 token。

`PermissionRequest` 也很容易用错。它在工具调用进入权限决策流程时触发，不代表确认框已经显示出来；无法显示确认框的后台非交互 subagent，同样可能运行这个 Hook。

普通 `claude -p` 没有这套权限请求流程，需要自动决定权限时，应把规则放到 `PreToolUse`。官方示例只自动批准 `ExitPlanMode`。照搬示例时，matcher 和事件输入也要一起保留，别用一条宽泛的 allow 规则接管所有权限请求。删除文件、操作生产环境、读取凭证或调用外部 API 写数据，继续交给人确认更稳妥。

## Hook 没按预期工作，怎么排查

配置写进去了，Claude Code 却毫无反应；或者 Hook 明明运行了，危险命令还是继续执行。像事件有哪些字段、某个 `handler` 支持哪些事件、`stdout` 会不会进入上下文，这类细节跟版本有关，用到时让 AI 对照当前官方文档查就行。

真遇到问题，我更建议按下面的顺序排查：

![Claude Code Hook 没生效时，从配置加载、脚本单独运行到 matcher 逐层排查](https://oss.javaguide.cn/github/javaguide/ai/coding/claudecode/hooks-troubleshooting-flow.webp)

1. 先运行 `/hooks`，确认配置已经加载，并且挂在预期的事件上。如果这里看不到，先检查 settings 文件的位置和 JSON 格式，暂时不用管脚本逻辑。

   ![Claude Code 官方文档说明 /hooks 菜单可以查看事件、matcher、handler 详情和配置来源](https://oss.javaguide.cn/github/javaguide/ai/coding/claudecode/hooks-menu-official-docs.png)

2. 把脚本从 Claude Code 里拿出来单独运行。Hook 脚本会从 `stdin` 读取 JSON，先确认它能读到字段、给出预期的退出码，再接回配置。

   ```bash
   printf '%s\n' '{"tool_name":"Bash","tool_input":{"command":"rm -rf /tmp/demo"}}' \
     | .claude/hooks/guard.sh

   echo $?
   # 预期输出 2
   ```

3. 脚本单独运行正常，再记录 Claude Code 实际传进来的事件数据。调试信息写到 `stderr` 或临时日志，不要混进准备返回 JSON 的 `stdout`。

   ```bash
   input="$(cat)"
   printf '%s\n' "$input" >> /tmp/claude-hook-debug.log
   ```

   日志里可能包含文件路径、命令和 Prompt 内容，排查结束后记得删掉，不要提交进仓库。

4. 一次只启用一个 Hook。多个 Hook 同时命中时会并行运行，只看最终表现很难判断是哪一条出了问题。单个脚本跑通后，再逐个恢复其他规则。

如果已经出现明确症状，可以先查对应这一项：

| 现象                           | 优先检查                                                      |
| ------------------------------ | ------------------------------------------------------------- |
| `/hooks` 里看不到配置          | settings 文件位置、JSON 格式                                  |
| 已注册，但一直没有触发         | 事件是否选对、matcher 是否匹配实际输入                        |
| 脚本报错了，工具调用仍在继续   | 是否误用了 `exit 1`；安全拦截是否放在 `PreToolUse`            |
| Claude 不停继续处理，无法结束  | `Stop` Hook 是否缺少退出条件                                  |
| 每次操作都运行 formatter       | matcher 是否省略或写得太宽                                    |
| 通知脚本执行了，但没有弹窗     | 先手动运行通知命令，再检查操作系统的通知权限                  |
| 交互模式正常，`claude -p` 异常 | 不要依赖 `PermissionRequest`，需要自动决策时改用 `PreToolUse` |

还定位不出来，可以把 `claude --version` 的输出、Hook 配置、脚本和实际现象一起交给 AI，让它对照当前官方文档检查。粘贴之前，记得删掉密钥、Token 和业务敏感信息。提示词不用写得很复杂：

```text
我在 Claude Code <版本号> 中配置了下面这个 Hook。

预期行为：<希望它做什么>
实际行为：<现在发生了什么>

Hook 配置：
<粘贴配置>

脚本：
<粘贴脚本>

请先查阅 Claude Code 当前版本的官方文档，再依次检查事件、matcher、输入字段、退出码和 JSON 输出格式。
只指出会导致当前问题的地方，不要扩展其他配置。
```

## 总结

聊到这里，你应该已经能抓住 Hooks 的重点了：它会在 Claude Code 的关键节点自动执行固定动作，例如格式化、危险命令检查、权限通知。

自动格式化放在 `PostToolUse`，危险命令和敏感文件拦截放在 `PreToolUse`，离开电脑时想及时收到提醒，就用 `Notification`。

就我个人使用经验来说，不建议大家刚开始就配太多，没太大意义，还容易乱。

先把这三个 Hook 跑稳。尤其是安全和权限规则，宁可收紧范围、慢慢补，也别一上来就自动批准所有操作。Hooks 能帮你守住固定流程，但沙箱、权限配置、CI 和人工 Review 还是要保留。

还有一个容易混淆的地方：能写成确定脚本的规则交给 Hook；代码审查、故障排查这类需要结合上下文判断的任务，继续放在 Skill 里。按这个思路分工，配置会简单不少，后面排错也更轻松。
