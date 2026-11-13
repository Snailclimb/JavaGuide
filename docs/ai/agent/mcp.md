---
title: 什么是 Model Context Protocol (MCP)？和 Function Calling、Agent 什么关系？
description: MCP（Model Context Protocol）核心概念、四层分层架构、JSON-RPC 2.0 通信机制及生产级 MCP Server 开发实践。
category: AI 应用开发
head:
  - - meta
    - name: keywords
      content: MCP,Model Context Protocol,JSON-RPC,Function Calling,AI Agent,工具接入,Anthropic
---

读取 Git 提交记录的代码已经写好了，接入 Claude Desktop 要适配一次，换成 Cursor 或自建 Agent 又要适配一次。重复的工作往往出在工具怎样被发现、参数怎样传入、结果怎样返回。

MCP 统一的就是这部分通信。把 Git 工具放进 MCP Server，各应用通过自己的 Client 调用它；拿到提交记录以后，是总结改动还是继续分析代码，再由上层应用决定。

![MCP 图解](https://oss.javaguide.cn/github/javaguide/ai/skills/mcp-simple-diagram.png)

> 本文以当前稳定的 [2026-07-28 revision](https://modelcontextprotocol.io/specification/2026-07-28) 为主。上一代 `2025-11-25` revision 使用初始化握手和传输层会话；`2026-07-28` 改为无状态、自描述请求，移除了 `initialize`/`initialized` 握手和 `Mcp-Session-Id`，并将 Tasks 移至 `io.modelcontextprotocol/tasks` 扩展。兼容旧版的客户端和 SDK 可能仍使用 `2025-11-25`，接入前要同时确认协议 revision、SDK 版本和 Host 能力。

## MCP 到底是什么？

MCP 全称是 Model Context Protocol，通常译为“模型上下文协议”。协议规定 Client 和 Server 怎样交换消息，包括发现工具、读取资源、调用工具和取得提示词模板。

不过，也不要把 MCP 理解成给模型加插件这么简单。之前在星球群里看大家讨论 MCP 的时候，有不少同学都是这样认为的。

这里要分清三个角色：用户面对的是 **Host**，例如桌面应用或 IDE；Host 内的 **Client** 发送协议请求；**Server** 收到请求后执行查询等操作。模型通常由 Host 调用，并不直接和 Server 建立连接。

比如 G 友问：“帮我看看这个项目最近一次提交改了什么。”模型没有这份本地提交记录，需要应用读取 Git 日志。应用可以直接调用本地函数，也可以连接一个提供 Git 工具的 MCP Server。

有了 MCP 之后，Git 相关能力可以被封装成一个 MCP Server。Host 里的 MCP Client 连上它，先发现有哪些工具，再按协议调用工具，最后把结果交给模型继续分析。

同一个 Server 可以被其他支持 MCP 的 Host 接入。协议复用了，但每个 Host 的授权、工具展示和结果处理仍要配置，不能把“支持 MCP”理解成所有功能都会自动可用。

## MCP、Function Calling、Agent 到底是什么关系？

模型分析提交记录时发现缺少项目背景，可能提出读取 README 的请求。Function Calling 返回的调用信息可以包含下面这些字段：

```json
{
  "name": "read_file",
  "arguments": {
    "path": "/repo/README.md"
  }
}
```

OpenAI 将这类机制称为 Function Calling，Anthropic 称为 Tool Use。模型输出的只是工具名和参数，文件此时还没有被读取。

如果 `read_file` 来自 MCP Server，Host 会将调用交给对应的 Client，再按 MCP 协议请求 Server。Server 检查路径权限、读取文件并返回内容；工具来自本地函数时，则可以直接调用，不必经过 MCP。

README 返回后，模型发现仍缺少某个配置文件，就再提出一次读取请求。应用继续执行、回传结果，这样接起来的是 Agent Loop。MCP 负责其中 Client 与 Server 之间的消息传递，不负责判断还缺什么材料。

![FC/MCP/Agent 三层关系图](https://oss.javaguide.cn/github/javaguide/ai/skills/mcp-fc-agent-layer.png)

不同场景的关注重点如下：

| 场景                           | 更关键的东西     | 原因                                   |
| ------------------------------ | ---------------- | -------------------------------------- |
| 让模型判断要不要查天气         | Function Calling | 重点是模型把意图转成结构化参数         |
| 让 Claude Desktop 读取本地文件 | MCP              | 重点是宿主和本地文件系统之间有标准接口 |
| 让 AI 自动排查线上故障         | Agent            | 重点是多步决策、工具调用和结果反馈     |

Agent 可以直接调用本地工具，MCP 也可以为固定工作流提供数据，三者并不要求同时使用。

## MCP 里到底有哪些东西？

MCP 的通信链路由 Host、Client 和 Server 组成。

![MCP 四层架构](https://oss.javaguide.cn/github/javaguide/ai/skills/mcp-four-layer-architecture.png)

Host 是用户使用的 AI 应用，例如 Claude Desktop、Cursor、VS Code 中的 AI 插件或自建 Agent 平台。

一个 Host 可以同时连接 Git、文件和数据库 Server，通常为每个 Server 维护一个 Client。Client 按对应 revision 发送消息：旧版 `2025-11-25` 有初始化握手，新版 `2026-07-28` 改为无状态请求。这里的无状态指 MCP 传输，不代表应用不能保存用户任务或业务数据。

开发者主要编写 Server。文件读取、SQL 查询、GitHub Issue 查询和内部工单查询等能力，都可以由它向 Host 暴露。

图里 Server 后面的数据库、文件和第三方 API 是能力的实际来源，不是新增的 MCP 角色。比如同一个订单查询工具，内部可以查数据库，也可以请求已有业务服务，Host 仍按相同的工具定义调用。

## 一次 MCP 调用大概怎么走？

还是拿“分析这个仓库的最新提交”举例。

![MCP 调用时序图](https://oss.javaguide.cn/github/javaguide/ai/skills/mcp-call-seq.png)

模型发现自己缺少 Git 日志后，先生成工具调用。Host 把调用交给 MCP Client，Client 通过 JSON-RPC 请求 Server；Server 查询 Git，再把结果沿原路径返回，模型据此组织回答。

工具的名称、`description`、参数说明和禁用场景会直接影响模型的选择。Server 接收到的参数也必须视为不可信输入：文件读取要限制目录，SQL 要参数化，高危操作要审批，返回数据要脱敏。

在 `2026-07-28` revision 中，MCP 不再要求 `initialize`/`initialized` 握手或 `Mcp-Session-Id`。每个请求都自包含协议版本和客户端能力；[规范要求](https://modelcontextprotocol.io/specification/2026-07-28/basic/versioning) Server 必须实现 `server/discover`，但 Client 可以不调用，直接发送其他请求。使用 `2025-11-25` 或更早 revision 的兼容客户端仍会执行初始化握手。排查工具未出现时，先确认 Client 和 Server 选用的 revision，再检查现代请求的能力元数据或旧版握手结果。

## MCP 暴露的能力只有 Tools 吗？

除了执行工具，Server 还可以提供可读取的资源和可复用的提示词模板。

### Resources、Tools 和 Prompts

Server 可以提供 Resources、Tools 和 Prompts 三类能力。

Resources 用于提供只读上下文，例如本地文件、日志片段、数据库 Schema 或配置记录。

Tools 暴露可调用的函数，例如查询数据库、发送消息、创建工单或调用业务接口。工具既可以只读，也可以产生副作用，Server 要分别校验权限。

Prompts 是可复用的提示词模板，例如“按团队规范做代码审查”或“把接口文档整理成测试用例”。

Tools 通常由模型选择并调用；Resources 和 Prompts 的展示、选择方式还可以由 Host、用户界面或应用逻辑决定。

继续看仓库分析场景：项目说明可以作为 Resource 供应用读取，查询某次提交可以暴露为 Tool，“按团队规范审查这次 Diff”则可以做成 Prompt 模板。三者分别提供材料、操作和任务入口。

Resource 由 URI 标识，Host 决定何时将它加入上下文，具体见[规范说明](https://modelcontextprotocol.io/specification/2026-07-28/server/resources)。Prompt 模板也不等同于长期用户偏好，只有被选取并加入本次交互后才会参与模型调用。

### Roots、Sampling 和 Elicitation

除了 Server 侧能力，Client 侧也可以提供一些能力给 Server 使用，比如 Roots、Sampling、Elicitation。`2026-07-28` 将 Roots、Sampling 和 Logging 标记为 deprecated（仍会保留至少十二个月）；Tasks 则移至 `io.modelcontextprotocol/tasks` 扩展。新实现应先确认目标 Client/Host 对这些能力或扩展的支持情况。

Roots 传递的是预期的文件工作范围。例如 Host 只公布项目目录，Server 就知道任务围绕哪个仓库展开。不过这份目录列表并没有修改操作系统权限。Server 读文件前仍要规范化路径、检查越界，需要强隔离时再使用沙箱。

日志 Server 已经拿到日志，想借用 Host 的模型生成摘要，可以发起 Sampling 请求。这里请求从 Server 发向 Client，实际是否调用模型仍由 Host 控制。

缺少的是用户输入时，则使用 Elicitation。例如某个选项尚未确定，Server 可以请 Host 向用户询问。请求发出后，用户能否看到交互，还取决于 Host 有没有实现这项能力。

因此，SDK 里能调用某个方法，不代表目标 Host 就支持它。先按工具需求实现 Tools，需要提供只读材料或任务模板时再加入 Resources、Prompts；Roots、Sampling、Elicitation 和 Tasks 扩展另行核对两端支持情况。

## 为什么 MCP 用 JSON-RPC？

MCP 底层通信使用 JSON-RPC 2.0。

JSON-RPC 用 `method` 表示方法，用 `params` 携带参数，用 `id` 关联请求和响应。MCP 的 `tools/call`、`resources/read` 就是这样的方法名。与 `/users/1` 这类 REST 资源路径相比，这种消息直接表达要调用哪个操作。

按 [2026-07-28 规范的请求元数据字段](https://modelcontextprotocol.io/specification/2026-07-28/basic/index)，工具调用请求可以写成下面这样。`_meta` 位于 `params` 内，与 `name`、`arguments` 同级；这里的 `my-app` 和 `1.0` 是示例客户端的名称与版本，空能力对象表示本次请求不声明可选客户端能力：

```json
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "read_file",
    "arguments": {
      "path": "/path/to/file.txt"
    },
    "_meta": {
      "io.modelcontextprotocol/protocolVersion": "2026-07-28",
      "io.modelcontextprotocol/clientInfo": {
        "name": "my-app",
        "version": "1.0"
      },
      "io.modelcontextprotocol/clientCapabilities": {}
    }
  },
  "id": 1
}
```

响应可能是这样：

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "resultType": "complete",
    "content": [
      {
        "type": "text",
        "text": "文件内容..."
      }
    ]
  }
}
```

JSON-RPC 协议层错误通过 `error` 返回，例如请求参数不符合协议要求：

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "error": {
    "code": -32602,
    "message": "Invalid params"
  }
}
```

JSON-RPC 响应中的 `result` 与 `error` 不能同时出现，也不要附上 `error: null`。但拿到 `result` 不代表业务操作成功：[MCP 工具执行错误](https://modelcontextprotocol.io/specification/2026-07-28/server/tools#error-handling)通过 `result.isError: true` 和错误内容返回，例如业务校验不通过或下游 API 调用失败。Client 需要同时区分协议错误与工具执行错误。

`id: 1` 让 Client 能把响应对应回请求，`result` 或 `error` 则说明这次协议调用的结果。JSON-RPC 自身不检查 `read_file` 的路径类型和访问权限，这些规则来自工具 Schema 和 Server 实现。日志可以记录消息摘要，但其中的密钥、业务数据需要脱敏。

## stdio 和 Streamable HTTP 怎么选？

本地 Server 通常使用 stdio。Host 将它作为子进程启动，再通过 stdin/stdout 交换消息；Claude Desktop 中的很多本地 Server 都采用这种方式。它没有额外的网络部署成本，但 Server 运行在本机，文件、Shell 和数据库权限要单独收紧。

尤其要看启动进程继承了什么权限。第三方 Server 以当前用户运行时，可能读到该用户可访问的文件。审核源码和依赖之外，还应限制挂载目录、环境变量和网络访问；Linux 中可结合 namespace、cgroups 或容器配置隔离，不能只启动一个容器就认为权限已经收紧。

stdio 模式下，stdout 是 JSON-RPC 消息通道，不能用于打印调试日志。一行 `print()` 输出就可能破坏消息格式，导致 Host 解析失败或 Server 断连。调试日志应写入 stderr 或文件；排查“Server 启动失败”时，也要确认 stdout 中没有混入日志。

远程 Server 更适合使用 Streamable HTTP。MCP 早期远程传输常见 HTTP + SSE，后来转向 Streamable HTTP；旧版 HTTP+SSE 已被标记为 deprecated。`2026-07-28` 继续使用 Streamable HTTP，但采用无状态请求，并要求请求携带 `Mcp-Method` 和 `Mcp-Name` 头，认证、负载均衡和网关接入可以沿用普通 HTTP 服务的运维方式。

```http
POST /mcp HTTP/1.1
Authorization: Bearer xxx
Content-Type: application/json
Accept: application/json, text/event-stream
MCP-Protocol-Version: 2026-07-28
Mcp-Method: tools/call
Mcp-Name: read_file
```

以上是前面 `read_file` 调用对应的 HTTP 请求头，请求体使用前面的 JSON；`Mcp-Method` 与方法名、`Mcp-Name` 与工具名保持一致，参见 [官方版本说明](https://blog.modelcontextprotocol.io/posts/2026-07-28/)。响应可能是普通 JSON，也可能是 SSE 流，取决于请求类型。

个人使用的本地文件工具通常从 stdio 开始，省去网络服务部署。多个用户共享一个远程业务接口时，再使用 Streamable HTTP。传输方式改变的是消息怎样送达，读写权限、限流和审计仍由两端实现。

![MCP 传输方式选择](https://oss.javaguide.cn/github/javaguide/ai/skills/mcp-transport-decision.png)

## MCP 的意义只是让模型会调接口吗？

假设团队把工单查询接成了 MCP Server。桌面应用可以使用它，自建的值班 Agent 也可以使用它，工单后端不必分别实现两套工具发现协议。这是 MCP 能减少的集成工作。

但 Server 只能提供已经实现的能力。值班文档还在 Wiki 中、排查脚本没有封装接口时，接入 MCP 不会自动让 Agent 获得这些材料。开发者仍要选择暴露哪些资源或工具，并配置调用身份和数据范围。

## MCP 接进来之后，就能直接上生产吗？

一次工具调用成功，只验证了这次输入和权限组合。换一个用户、传入错误参数，或者下游超时，Server 还需要给出可判断的结果。

时间字段是 ISO-8601 还是时间戳、金额单位是元还是分、分页默认值是什么，都要写进 Schema、字段说明和示例。Server 要据此校验参数，并返回模型能够据以修正请求的错误信息。

一条 Agent 回答可能经过多个 Server 和工具。Trace ID、结构化日志和调用链需要记录调用参数、耗时、结果摘要与错误码，才能定位哪一步影响了最终回答。

本地 stdio 可能获得用户机器上的文件权限，远程 Server 可能连到内部系统。文件目录、可查询的表、是否可写生产 API、是否允许发送邮件都应明确授权。删除、修改、发送和生产调用等写操作还需要二次确认、审计和回滚预案。

Server 的 `description`、Prompt 模板和返回内容同样需要审核：恶意或粗糙的内容可能夹带提示词注入，引导模型读取更多文件或外传信息。Server 来源、依赖包、权限范围和更新记录都属于上线审查范围。

模型 Token、向量检索、第三方 API 和云资源都会产生费用。调用应能关联到用户、业务线和工具，否则费用上升时无法判断成本来自哪里。

工具接口的字段、枚举或返回结构发生不兼容变更，也会改变模型的判断。工具级版本、灰度、旧版本保留和自动化兼容性测试应与 Server 一起维护。

## 企业落地 MCP 前，应该先检查哪些问题？

### Schema 和版本

- 每个工具是否有明确输入输出 Schema？
- 字段单位、时间格式、枚举值、默认值是否写清楚？
- 工具接口是否有版本号？
- 不兼容变更有没有灰度和回滚方案？
- 是否能基于 Schema 做自动化校验？

### 权限和安全

- Server 能访问哪些文件、目录、数据库和 API？
- 是否区分只读工具和写操作工具？
- 高危操作是否需要人工确认？
- 返回结果是否做了脱敏？
- 是否防路径遍历、SQL 注入、命令注入？
- 第三方 MCP Server 是否经过源码、依赖和权限审核？

### 可观测性

选一次经过多个工具的请求，沿 Trace ID 能否找到各次调用？记录中应有工具名、参数与结果摘要、耗时和错误码。再模拟一次超时，检查日志能否区分“请求没到 Server”和“下游处理慢”，并确认重试没有绕过总时限。

### 成本归因

账单上涨时，要能找到是哪次任务、哪个工具增加了调用。记录用户、业务线、会话和工具后，可以把模型 Token、外部 API 和云资源费用分开统计，再给相应任务设置配额与告警。否则只能看到总费用变高，找不到重复运行的那条 Loop。

### 依赖治理

Server 升级后，原来能用的参数可能不再接受，返回字段或错误码也可能变化。保留一批旧版调用用于回放，才能在切换前发现这些差异，再决定同步修改 Client 还是暂缓升级、回滚 Server。

SDK、第三方库和 Server 本身都应记录版本、维护者和更新来源。某个扩展已经无人维护，即使当前调用正常，也需要有人负责后续漏洞修复。

## 写 MCP Server 时，有什么需要注意的？

### 别先追求大而全

以查询订单为例，如果 Server 只提供 SQL 和通用 HTTP 接口，模型就得先选择数据表或 URL，再拼装请求。接口看起来很少，但每次调用要作出的判断更多：

```text
execute_sql(sql)
file_operation(op, path, data)
call_api(url, method, body)
```

业务只需要查用户、列订单和写报告时，可以把固定查询封装进 Server。模型提交用户 ID，Server 执行预先定义的查询，不必每次重新生成 SQL。通用文件接口仍可保留，但允许访问的目录要由 Server 检查：

```text
get_user_by_id(id)
list_active_orders(user_id)
read_file(path)
write_report(path, content)
```

[Anthropic 的工具设计实践](https://www.anthropic.com/research/writing-tools-for-agents)建议从实际任务选择接口，并允许一个工具组合相关操作。粒度不必一律越细越好：查订单时，可以一起返回后续判断需要的状态和时间，减少模型再发几次查询；返回字段仍应限制在当前任务所需范围。

`description` 要帮助模型区分工具。例如 `list_active_orders` 需要说明“活跃”包含哪些状态、是否分页，以及未找到订单时返回空列表还是错误。名称相近的工具更需要把差别写清楚。

例如，查慢 SQL 的工具除了“查询慢 SQL 日志”，还应写明：服务响应慢、数据库超时、CPU 飙升且怀疑与数据库相关时使用；用户询问网络或内存问题时不要调用它。这样的约束能减少模型把相近问题送到错误工具的情况。

### 大文件和长文本要小心

读取 CSV 不一定要先把整份文件交给模型。接口可以先返回文件名、大小、更新时间、摘要和可读取范围，模型确定要看哪一部分后，再请求对应的 chunk。日志、Markdown 和网页 HTML 也可以这样处理。

单块返回多少，要同时看 Host 剩余的上下文、响应大小限制和 Server 的内存及网络预算。Server 可以用字符数或字节数限制单次读取，避免绑定某个模型的 tokenizer；Host 再按实际模型计算 Token 并组织上下文。分块以后仍要限制每次返回量，否则只是把一次超大的响应换成了另一次。

### 安全问题不能靠相信模型解决

`read_file(path)` 收到的路径属于外部输入。Server 需要规范化路径，再检查它是否仍位于允许访问的目录，不能仅凭模型说“这是项目文件”就读取。数据库工具也应将参数作为值绑定到预先定义的 SQL 中，不直接执行模型拼出的语句；能发现一个工具，并不代表调用者有权访问工具背后的所有数据。

查询订单只需要状态和金额时，返回对象就可以省略手机号、邮箱和内部链接。确实需要敏感字段，再按调用者权限返回或脱敏；Token 和密钥不应进入模型上下文。

写操作还要核对具体动作。允许读订单，不等于允许退款；允许生成邮件草稿，也不等于允许发送。Server 在执行前检查授权并记录审计，Host 再提供必要的确认交互。调用频率也由 Server 限制，避免一个合法工具被反复调用到耗尽资源。

Prompt Injection、Token Passthrough、资源级鉴权、本地 Server 隔离和第三方 Skill/MCP 供应链的完整链路，可以继续看 [LLM/Agent 安全实战](../system-design/llm-security.md)。

### MCP Server 最小示例：先跑通一个工具

用 Python SDK 的 FastMCP 风格写一个天气 Server，大概是这样。下面的导入路径和启动方式需要按项目锁定的 SDK 版本核对，这里未验证它们与支持 `2026-07-28` 的 SDK 版本一致：

```python
from mcp.server.fastmcp import FastMCP

mcp = FastMCP("weather-server")

@mcp.tool()
def get_weather(city: str) -> str:
    """获取指定城市的天气信息"""
    return f"{city} 今天晴天，温度 25°C"

@mcp.resource("weather://forecast")
def weather_forecast() -> str:
    """返回未来一周天气预报"""
    return "未来七天天气预报..."

if __name__ == "__main__":
    mcp.run()
```

Claude Desktop 里可以这样配：

```json
{
  "mcpServers": {
    "weather-server": {
      "command": "uv",
      "args": ["run", "--with", "mcp", "/path/to/weather_server.py"]
    }
  }
}
```

可以先用 MCP Inspector 检查进程能否启动、工具是否可发现：

```bash
# Python Server
npx @modelcontextprotocol/inspector uv run --with mcp /path/to/weather_server.py

# Node Server
npx @modelcontextprotocol/inspector node build/index.js
```

先确认 Inspector 能列出 `get_weather`，再传入 `city` 调用它。这个函数目前返回的是固定天气字符串，只用来观察调用链；要查询真实天气，还需接入天气数据源。

如果 Inspector 能运行，而 Claude Desktop 启动失败，先检查 `mcp.log` 中的命令路径、工作目录和依赖错误。使用虚拟环境解释器，或通过 `uv run --with mcp ...` 声明依赖，可以减少对全局 Python 环境的依赖；生产部署还应锁定 SDK 版本，不能把未指定版本的命令当作可复现环境。

## 用 Inspector 验证远程 Server

上面的例子通过 stdio 启动本地进程。要观察远程 Server 的连接协商、工具发现和调用，可以继续用 [MCP Inspector](https://github.com/modelcontextprotocol/inspector)，换成 Streamable HTTP 连接。

这里以 [Parallel Search MCP](https://docs.parallel.ai/integrations/mcp/search-mcp) 为例。它提供网页搜索 `web_search` 和网页内容提取 `web_fetch`，匿名入口是 `https://search.parallel.ai/mcp`，不需要 Parallel 账号或 API Key，免费访问有速率限制。

下面使用 Inspector 2.5.0，需要 Node.js 22.19.0 或更高版本。在终端先列出工具：

```bash
npx --yes @modelcontextprotocol/inspector@2.5.0 --cli \
  https://search.parallel.ai/mcp --transport http --method tools/list
```

`--transport http` 指定 Streamable HTTP。Inspector 会根据 Server 支持的协议 revision 选择现代无状态流程或兼容的旧版初始化流程，然后发送 `tools/list`；返回结果中应能看到 `web_search`、`web_fetch` 及其参数 Schema。这个匿名示例不传 `Authorization` 请求头。

接着调用一次搜索工具，查找 Java 虚拟线程的官方资料：

```bash
npx --yes @modelcontextprotocol/inspector@2.5.0 --cli \
  https://search.parallel.ai/mcp --transport http \
  --method tools/call --tool-name web_search \
  --tool-arg 'objective=查找 OpenJDK 关于 Java 虚拟线程的官方说明' \
  --tool-arg 'search_queries=["OpenJDK JEP 444 virtual threads"]'
```

`objective` 和 `search_queries` 都是必填参数，后者是 JSON 数组。工具结果会包含来源 URL 和内容摘录，可以沿着链接核对答案。排查时要区分连接失败、JSON-RPC 错误和工具返回的 `isError: true`；仅收到 HTTP 200 不代表工具执行成功。

执行搜索或提取时，查询词、目标 URL 和传入的目标描述等上下文会发送给 Parallel，请只使用适合交给第三方处理的内容。这里的 CLI 命令执行完会断开连接，不会给其他 Host 安装服务；如果之后在 Agent 中启用这些工具，Agent 也可能按任务需要自行调用，用完可在对应 Host 中禁用或移除连接。

## 接入时记录协议 revision

MCP 统一了 Host 与外部工具、数据源之间的发现和调用方式，但不会替代业务鉴权、数据权限和执行审计。一个 Server 在某个 Host 中可用，也不代表换到另一个 Host 后仍支持 Sampling、Elicitation、Tasks 等可选能力。

实现最小 Server 时，先固定协议 revision 和 SDK 版本，使用 Inspector 验证连接协商、能力发现、参数校验和错误响应。准备接入远程服务后，再补 OAuth、限流、Trace、版本兼容和回滚；文件与命令工具还要在 Server 侧落实目录校验和沙箱。

## 总结

MCP 为 Host、Client 和 Server 建立了统一的能力发现与调用方式，解决的是外部工具和数据源的接入问题。模型如何决定调用、业务如何编排、请求是否被授权，仍分别由 Function Calling、Agent/Workflow 和业务安全策略负责。

接入时先确认协议 revision、SDK 与 Host 的能力协商结果，用最小 Server 验证连接、Schema 和错误处理。进入生产环境后，工具权限、数据脱敏、目录或 SQL 校验、限流、审计和版本兼容都需要由 Server 与宿主共同落实。
