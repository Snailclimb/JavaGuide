---
title: CLAUDE.md 最佳实践：该写什么、不该写什么、项目变大后怎么拆
description: 说明 CLAUDE.md 适合记录哪些项目规则，以及如何配合 .claude/rules、Auto Memory 管理和维护这些规则。
category: AI 编程实战
head:
  - - meta
    - name: keywords
      content: CLAUDE.md,Claude Code,AI编程,AI项目规范,Agentic Coding,AI辅助开发,CLAUDE.md最佳实践,.claude/rules
---

你好，我是小 G。前几天分享 [Claude Code 使用技巧](https://javaguide.cn/ai-coding/practices/claudecode-tips.html) 时，我简单介绍了 `CLAUDE.md`。有 G 友在评论区问，这个文件能不能单独写一篇。

很多朋友第一次看到 `CLAUDE.md`，会把它当成另一份 README。README 主要给人介绍项目，`CLAUDE.md` 则给 Claude Code 提供工作指令，例如项目怎么启动、哪些文件不能改、接口返回格式是什么、改完代码要运行哪些检查。

这些内容当然可以在每次新会话里重新说明，但很容易漏。长期有效、Claude 又无法从代码中准确推断的规则，更适合提前写进 `CLAUDE.md`。

本文结合 [Claude Code 官方文档](https://code.claude.com/docs/en/best-practices)和自己的使用经验，介绍 `CLAUDE.md` 该写什么、怎样拆分以及后续如何维护。

还有个小提醒：Claude Code 迭代很快，`.claude/rules/` 和 Auto Memory 这两块尤其容易随版本变化。本文按 2026-07-24 的官方文档核对。实际落地前，先用 `claude --version` 确认版本，再用 `/context` 查看本会话实际加载的指令；`/memory` 主要用于查看和编辑规则、记忆的配置位置与文件。

## 什么是 CLAUDE.md？

`CLAUDE.md` 是 Claude Code 的持久指令文件，可以放在用户级、项目级等不同位置。Claude Code 读取它之后，会根据其中的命令、约定和限制处理当前项目。

适合写入的内容包括：

- Claude 容易猜错的规则
- 代码里读不出来的约定
- 团队必须遵守的规范
- 技术栈版本、常用命令、架构取舍、项目坑点

判断一条内容是否有必要保留，可以问：

> 这行删掉后，Claude 会不会更容易犯错？

如果会，就保留；如果不会，它大概率只是在浪费上下文。

## CLAUDE.md 和其他规则文件有什么区别？

![CLAUDE.md 与其他规则文件怎么分工](https://oss.javaguide.cn/github/javaguide/ai/coding/claudecode/claude-md-best-practices-rule-files-relationship.png)

### CLAUDE.md vs AGENTS.md

|          | CLAUDE.md                  | AGENTS.md                                                   |
| -------- | -------------------------- | ----------------------------------------------------------- |
| **谁读** | Claude Code 专属           | 跨工具开放标准，OpenAI Codex、Cursor、Google Jules 等也采用 |
| **定位** | Claude Code 的项目规则文件 | 跨工具通用的 Agent 指令文件                                 |

![CLAUDE.md 和 AGENTS.md](https://oss.javaguide.cn/github/javaguide/ai/coding/claude-agents-md.png)

**AGENTS.md** 面向多个编码 Agent，**CLAUDE.md** 是 Claude Code 的专属入口。仓库同时使用两种文件时，可以让它们复用同一份基础指令。

`AGENTS.md` 也可以由团队约定一块“已确认的常见错误”区域，但 Agent 不会因为文件存在就自动记录错误，更不能保证写入一条规则后下次不再犯。是否写入、谁来评审、何时删除，都要在工作流里明确。

如果仓库已经用 `AGENTS.md` 给其他编码 Agent 提供指令，可以创建一个导入 `AGENTS.md` 的 `CLAUDE.md`，让两个工具复用同一份基础指令，不用重复维护。

```markdown
@AGENTS.md

## Claude Code 特定指令

- 使用 plan mode 处理 `src/billing/` 下的改动
```

我的 [一文搞懂 Harness Engineering](https://javaguide.cn/ai/agent/harness-engineering.html) 还介绍过一个例子：OpenAI 的 `AGENTS.md` 大约只有 100 行，主要用于指向 docs/ 目录下更具体的设计文档、架构图、执行计划和质量评级。Agent 先读取入口文件，处理到相关任务时再加载详细资料，避免一开始就把所有内容放进上下文。

### CLAUDE.md vs .claude/rules/

|                | CLAUDE.md                                                                 | `.claude/rules/`                                                             |
| -------------- | ------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| **加载方式**   | 根目录/项目级文件通常在会话启动时加载；子目录文件在读取对应目录时按需加载 | 不带 `paths` 的规则启动时加载；带 `paths` 的规则在 Claude 读取匹配文件时加载 |
| **适用场景**   | 全局通用规则                                                              | 只针对特定文件/目录的规则                                                    |
| **上下文消耗** | 根目录/项目级规则会持续消耗上下文                                         | 只有 path-scoped rules 按需消耗；全局 rules 仍会持续消耗上下文               |

后端 API 规范、测试配置等只对特定目录生效的规则，可以放进 `.claude/rules/`，不必继续写进根目录 `CLAUDE.md`。

要注意两点：

1. `.claude/rules/` 不是 Claude Code 安装后默认一定会出现的目录，需要时可以手动创建。
2. 带 `paths` frontmatter 的路径规则会按匹配结果加载；没有 `paths` 的规则仍会作为全局规则进入上下文。因此，创建 `.claude/rules/` 目录本身并不能减少上下文占用。

### CLAUDE.md vs SPEC.md

| ​        | CLAUDE.md                              | SPEC.md                                          |
| -------- | -------------------------------------- | ------------------------------------------------ |
| **用途** | 项目规则（怎么干活）                   | 需求规格（做什么）                               |
| **内容** | 编码规范、常用命令、踩坑记录、团队约定 | 需求边界、功能定义、验收标准，类似面向 AI 的 PRD |
| **谁用** | AI 编码助手（日常编码）                | Spec Coding 流程（需求驱动开发）                 |

`SPEC.md` 是一些团队在 **Spec Coding** 中使用的文件名，`Specify → Design → Implement → Test` 也是本文采用的一种组织方式。不同工具可能使用 requirements、design、tasks、plan 等文件和阶段，不存在统一强制的四阶段标准。

![Spec Coding 规范驱动编程流水线](https://oss.javaguide.cn/github/javaguide/ai/coding/spec-coding-pipeline-flow.png)

上图中的 `requirements.md` 是该工作流在 `Specify` 阶段生成的需求文件；其他团队也可能把同类任务规格集中写在 `SPEC.md`，两者不是通用的固定别名。

我在[Spec Coding 规范驱动编程实战：从 Vibe Coding 到 AI 代码规范](https://javaguide.cn/ai-coding/practices/spec-coding.html)这篇文章中有详细介绍。

可以这样区分：**CLAUDE.md 管长期行为规范，Spec 管当次任务约束。**

### 实际怎么选？

- **CLAUDE.md**：Claude Code 专属的行为规范；根目录/用户级通常在会话开始时加载，子目录规则按需生效。
- **AGENTS.md**：跨工具通用的“怎么干”规则，可被 `CLAUDE.md` 导入复用。
- **`.claude/rules/`**：局部规则目录；不带 `paths` 更像全局规则，带 `paths` 才会在处理匹配文件时生效。
- **SPEC.md**：需求规格文件，定义这次做什么，属于 Spec Coding 流程中的一环。

## CLAUDE.md 到底该写什么？

先看一个我经常见到的写法。很多人跑完 `/init`，看到 Claude 生成了一份 `CLAUDE.md`，觉得“有总比没有好”，于是基本没改就提交了：

```markdown
# 项目说明

这是一个 Spring Boot 项目，使用 Java 17 和 Maven。

# 代码风格

- 写干净的代码
- 遵循最佳实践
- 确保代码可读性

# 工作流

- 提交前运行测试
- 保持良好的代码组织
```

这几条要求本身没有错，但很难改变 Claude 的行为。以“写干净的代码”为例，删掉这句话以后，Claude 依然会尽量生成可读的代码。它留在文件里，只会继续占用上下文。

`CLAUDE.md` 会和系统指令、对话记录、读取的文件共同占用上下文。Anthropic 在官方文档中指出：**随着上下文窗口被填满，Claude 的整体表现会下降。**

![上下文为什么会失效](https://oss.javaguide.cn/github/javaguide/ai/context-engineering/why-does-the-following-content-fail.png)

文件越长，留给后续对话和代码的空间越少，真正重要的规则也更容易被其他内容淹没。

Anthropic 建议保持 `CLAUDE.md` 精简不超过 200 行，只保留 Claude 无法轻易从代码中推断的信息。如果内容继续膨胀，可以拆到带 `paths` 的 `.claude/rules/`，或者把不是每次会话都需要的参考内容放到 Skills 里。

![Claude Code 官方文档对 CLAUDE.md 的建议](https://oss.javaguide.cn/github/javaguide/ai/coding/claudecode/claudemd-claude-docs.png)

检查 `CLAUDE.md` 时，可以逐行问：“删掉这行以后，Claude 是否更容易犯同类错误？”有明确影响的规则留下；看不出行为差异的内容先删除，后面遇到实际问题再补。

### 该写的东西

值得写进 `CLAUDE.md` 的内容主要有五类。

**1\. 技术栈和版本信息。**

框架版本差异经常直接影响生成结果。例如，Spring Boot 2 和 3 的部分配置方式不同；没有明确版本时，Claude 可能生成与当前项目不一致的用法。MyBatis-Plus 这类依赖可以从 `pom.xml` 读到，选择它而没有使用 JPA 的原因，则需要额外说明。

**2\. 常用命令。**

在 `CLAUDE.md` 中直接给出项目编译、测试、lint 和启动命令。使用代码块或行内代码保留原始参数，Claude 执行时不需要再把自然语言转换成命令。

```markdown
# Commands

- 构建：`mvn clean package -DskipTests`
- 测试：`mvn test -pl module-name`
- 启动：`mvn spring-boot:run -pl bootstrap`
- 代码检查：`mvn checkstyle:check`
```

**3\. 架构决策和背后的理由。**

规则背后的原因会影响 Claude 如何处理相邻场景。之前我的项目里只写了“不要直接写 SQL，使用 QueryWrapper”，Claude 仍会在部分查询中写 SQL。后来补充原因：“SQL 审计系统依赖 Wrapper 的解析来记录操作日志。”这条约束的适用范围就清楚了，其他查询也应该使用 Wrapper。

**4\. 团队约定和项目特有的坑。**

提交信息格式（如 `feat(scope): message`）、分支命名规范、环境变量依赖，都很难只靠阅读代码确定。这类新成员接手项目时需要询问的信息，也适合写进 `CLAUDE.md`。

**5\. 需要跨会话保留的任务信息。**

任务描述、验收标准、优先级、依赖关系和阻塞问题需要跨会话保留时，可以单独建立任务文件，再由 `CLAUDE.md` 或 `AGENTS.md` 指向它。这样既能保留当前任务的进度，也不会把经常变化的内容和长期规则混在一起。

### 不该写的东西

**1\. 代码风格规则。**

缩进用几个空格、import 怎么排序、要不要尾分号——这类事交给格式化工具。

项目里没配 Checkstyle 或者 Prettier 的，先配工具，别用自然语言去干代码格式化的活。

**2\. 语言或框架的默认行为。**

例如：

- “Vue 用 `ref` / `reactive` 管理响应式状态。”
- “JPA 实体类对应数据库表。”
- “SQL 用 `WHERE` 做条件过滤。”

这些纯是废话，写下来只会给 AI 增加理解负担。

**3\. 大段参考文档。**

外部 API 文档、SDK 参数表这种内容，不要整段塞进来。放链接就够了，Claude 真用到时再读。

### 好的 CLAUDE.md 示例

#### 用户级示例：先管住通用坏习惯

[andrej-karpathy-skills](https://github.com/multica-ai/andrej-karpathy-skills) 是一个第三方整理的 Claude Code 规则/Skills 项目，灵感来自 Andrej Karpathy 对 LLM 编码问题的公开观察。里面的规则不依赖具体仓库，更适合放在用户级，用来限制编码过程中常见的跑偏行为。

下图是这个仓库里的 `CLAUDE.md` 示例：

![andrej-karpathy-claudemd](https://oss.javaguide.cn/github/javaguide/ai/coding/claudecode/andrej-karpathy-claudemd.png)

这份文件只处理几个高频问题：编码前检查假设，避免过度抽象，把修改限制在任务范围内，完成后运行测试并对照验收标准。规则数量不多，每条都对应一种可以观察到的行为。

建议直接去 GitHub 读原文，这里不再整段引用。

#### 项目级示例：把仓库规矩写成速查卡

我的 [interview-guide](https://javaguide.cn/zhuanlan/interview-guide.html) 使用的是项目级 `CLAUDE.md`。根目录文件保留技术栈、常用命令、分层边界、异常处理、事务规则和禁止清单，详细规范再交给 `.claude/rules/`。

精简后的根目录文件可以这样写：

```markdown
# AI Interview Platform Rules

Spring Boot 4.0 + Java 21 + Spring AI 2.0 + React 面试平台。

## Tech Stack

- Backend: Spring Boot 4.0 / Java 21 / Gradle / Spring AI 2.0
- Database: PostgreSQL + pgvector（1024 维 COSINE）
- Cache & MQ: Redis / Redisson / Redis Stream
- Frontend: React 18 + TypeScript + Vite + TailwindCSS 4（`frontend/`）
- Mapping & Docs: MapStruct / OpenAPI / iText 8 / Apache Tika

## Commands

- 构建：`./gradlew build`
- 测试：`./gradlew test`
- 后端启动：`./gradlew bootRun`
- 前端启动：`cd frontend && npm run dev`
- 前端检查：`cd frontend && npm run lint`

## Architecture

- 单模块 Gradle 项目，按功能分包。
- 后端遵循 `Controller -> Service -> Repository` 分层。
- 基础设施能力放在 `common/`，包括限流、AI 调用、异步任务、配置、异常、统一响应。
- 前端代码放在 `frontend/`。
- 详细项目结构见 `docs/architecture.md`。

## Must Follow

- Controller 只做参数校验和响应包装，不写业务逻辑。
- Service 承担业务编排，`@Transactional` 只放 Service 层。
- Repository 只负责数据访问，不写业务逻辑。
- 对外响应统一使用 `Result<T>`。
- 业务异常必须使用 `BusinessException(ErrorCode.XXX, "描述信息")`。
- Entity 映射使用 MapStruct，禁止手写重复转换逻辑。
- LLM、S3、外部 HTTP 调用不得放在数据库事务内。
- 统一通过 `LlmProviderRegistry` 获取 `ChatClient`。
- 结构化输出统一使用 `StructuredOutputInvoker` 做重试包装。
- Redis Stream 生产/消费使用 `AbstractStreamProducer` / `AbstractStreamConsumer` 模板。
- 限流使用 `@RateLimit`，不要手写散落的 Redis 限流逻辑。
- 数据库向量搜索使用 PostgreSQL + pgvector，维度为 1024，距离类型为 COSINE。

## Never Do

- 不要 `throw new RuntimeException(...)`，必须用 `BusinessException`。
- 不要直接返回 Entity 给前端。
- 不要把 `@Value` 散落在 Service 中，配置集中到 `@ConfigurationProperties`。
- 不要内联全限定类名，使用 import。
- 不要事务内调用 LLM、S3 或外部 HTTP。
- 不要同类内部调用 `@Transactional` 方法。
- 不要 `catch (Exception e) {}` 静默忽略。
- 不要循环调用 DB，优先批量操作。
- 不要硬编码密钥。
- 不要使用 `Executors.newXxxThreadPool()`，使用显式 `ThreadPoolExecutor`。

## More Rules

- 错误码规范：`.claude/rules/error-handling.md`
- 限流规范：`.claude/rules/rate-limit.md`
- Redis Stream 规范：`.claude/rules/redis-stream.md`
- AI 服务调用规范：`.claude/rules/ai-service.md`
- 数据库规范：`.claude/rules/database.md`
- 前端规范：`.claude/rules/frontend.md`
```

## 怎么写才能让 Claude 真正遵守？

规则需要对应明确动作，并且能够检查执行结果。

### 规则要具体可验证

“注意代码可读性”没有给出可检查的标准。换成“函数名使用动词开头、单个函数不超过 40 行”，Claude 才知道具体要做什么，代码审查时也能直接核对。

### 禁令要搭配替代方案

禁令最好同时给出替代方案：不要做 X，遇到这种情况使用 Y。

举个我自己项目里的例子。之前 Claude 经常写 `@Autowired` 字段注入，但团队规范是构造器注入。

一开始我只写了“不要用 `@Autowired` 字段注入”。效果很一般：它确实不用字段注入了，但有时改成手写构造器，有时又绕到别的注入方式上。后来我把规则补完整：

```markdown
# 依赖注入

- 不要使用 @Autowired 字段注入
- 使用构造器注入，配合 Lombok 的 @RequiredArgsConstructor
- 参考示例：UserController.java 中的写法
```

补全后的规则同时给出了推荐写法和项目内的参考文件，Claude 处理同类代码时有了可以直接遵循的样板。

### 善用标记词但别滥用

Claude 反复违反某条规则时，可以在前面加 `IMPORTANT:` 或 `YOU MUST:`。这类标记只用于少数关键规则；如果每条都有标记，强调就失去了区分度。

如果 Claude 反复忽略某条规则的话，这个时候就要检查文件是否过长、规则是否放错位置。继续增加强调词，通常不能解决这两个问题。

### 标题用常规名字

Commands、Structure、Conventions、Testing 这类常见标题已经能准确说明内容。Claude 更容易按这些标题找到命令、目录结构和测试要求，项目成员阅读时也省得重新理解一套命名。

### Hooks

`CLAUDE.md` 只能提供指令，无法强制阻止一次工具调用。修改敏感文件、执行危险命令等操作，可以交给 Hook 检查。例如，`PreToolUse` 会在工具执行前接收调用信息，再根据权限和风险决定是否放行。

Claude Code 官方文档给出的执行过程如下：

![Claude Code PreToolUse Hook](https://oss.javaguide.cn/github/javaguide/ai/coding/claude-code-runs-rm-rf-tmp-build-what-happens.svg)

能机械检查的要求，优先交给 Linter、Hook 或 CI。比如要阻止 Claude 修改 `.env`，可以让 `PreToolUse` Hook 检查目标路径并拒绝操作；只在 `CLAUDE.md` 中提醒，仍然可能漏掉。

适合做 Hook 的事情：

- 编辑后自动格式化。
- 会话结束前跑测试。
- 禁止改 `migrations/` 或 `.github/workflows/`。
- 拦截 `curl | bash`、`rm -rf`、向外部端点发送敏感内容。
- 在 Sub-Agent 启动时注入额外上下文。

漏掉一次就会产生明显风险的要求，适合用 Hook 强制检查。仅用于帮助 Claude 理解项目的约定，继续写在 `CLAUDE.md` 中。

## CLAUDE.md 放在哪里？

Claude Code 支持在多个位置放置 `CLAUDE.md`，各自的影响范围如下：

![CLAUDE.md 层级与优先级](https://oss.javaguide.cn/github/javaguide/ai/coding/claudecode/claude-md-best-practices-file-hierarchy.png)

| 位置       | 路径                                                                                                                                                  | 用途                                                                         |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| **组织级** | macOS: `/Library/Application Support/ClaudeCode/CLAUDE.md`，Linux/WSL: `/etc/claude-code/CLAUDE.md`，Windows: `C:\Program Files\ClaudeCode\CLAUDE.md` | IT/DevOps 统一下发的编码规范、合规要求和数据处理说明，不能通过个人配置排除。 |
| **用户级** | `~/.claude/CLAUDE.md`                                                                                                                                 | 你的个人偏好，对所有项目生效                                                 |
| **项目级** | `./CLAUDE.md` 或 `./.claude/CLAUDE.md`                                                                                                                | 团队共享规范，提交至 Git                                                     |
| **本地级** | `./CLAUDE.local.md`                                                                                                                                   | 个人的项目特定配置，加入 `.gitignore`                                        |
| **子目录** | `./subdir/CLAUDE.md`                                                                                                                                  | Claude 访问该目录文件时按需加载，不在会话开始时注入                          |

不同层级的 `CLAUDE.md` 会一起加载，后面的文件不会直接覆盖前面的全部内容。越靠近当前项目、作用范围越具体的规则，越贴近当前任务。

例如，用户级规则要求统一用空格缩进，项目级规则却要求使用 Tab，Claude 在该项目里更可能采用项目规则。不过，冲突指令会增加不确定性，发现后应该直接清理。

我的做法比较简单：项目级 `CLAUDE.md` 提交到 Git，放团队都要遵守的规则；只和自己有关的偏好，比如当前项目里希望提交信息用中文，就放进 `CLAUDE.local.md`，再加到 `.gitignore`，别把个人习惯混进团队文件。

## 项目变大了，CLAUDE.md 怎么管？

中小项目通常只需要一份 `CLAUDE.md`。模块增多以后，所有规则继续挤在根目录文件里，会让每个会话都加载一批与当前任务无关的内容。

![CLAUDE.md 组织方式演进](https://oss.javaguide.cn/github/javaguide/ai/coding/claudecode/claude-md-best-practices-scaling-evolution.png)

### 项目不大时：只保留一份文件

技术栈、常用命令和架构边界等全局信息留在根目录文件中。大部分中小项目用这一层就够了，我自己的 `CLAUDE.md` 通常也不会超过 50 行。

### 内容变多时：让主文件负责路由

根目录 `CLAUDE.md` 保留项目概述和常用命令，架构规范、API 约定、测试要求放在独立文件中，再用 `@path/to/file` 引用：

```markdown
## Project

Spring Boot 3.2 + MyBatis-Plus + MySQL 8.0 的订单管理服务。

## Commands

- 构建：`mvn clean package`
- 测试：`mvn test`

## Rules

- API 约定：@docs/api-conventions.md
- 数据库规范：@docs/database-rules.md
```

### 规则只对部分代码生效时：按路径加载

在 `.claude/rules/` 中使用 frontmatter 匹配文件路径：

```markdown
---
paths:
  - "src/main/java/**/controller/**/*.java"
---

# Controller 规范

- 统一使用 Result<T> 包装返回值
- 所有接口必须添加 Swagger 注解
```

编辑 Controller 时会加载 Controller 规则，处理 Service 时则不会一直占用这部分上下文。实际使用时，加载时机还会带来三个边界。

**新建文件时，路径规则可能尚未加载。** path-scoped rules 在 Claude **读取**匹配文件时注入，不会在每次工具调用前检查。直接新建一个匹配路径的文件时，创建期规则可能还没有进入上下文。“新建 Controller 必须带某个文件头”这类要求应该放到无 `paths` 的全局 rules、根目录 `CLAUDE.md`，或者交给 Hook 检查。

**压缩上下文后，局部规则需要重新触发。** `/compact` 之后，根目录 `CLAUDE.md` 会重新注入；子目录 `CLAUDE.md` 和路径规则要等 Claude 再次读取匹配文件才会加载。继续修改文件前，可以先用 `/context` 检查当前会话中的指令。

**规则是否加载需要实际检查。** `/context` 可以查看当前会话加载的 `CLAUDE.md`、`CLAUDE.local.md` 和 rules 文件；`/memory` 用于查看和编辑配置位置。需要记录详细加载过程时，可以配置 `InstructionsLoaded` Hook。

我目前在用的就是主文件 + 按路径匹配的规则文件这一层级。更高阶的玩法（比如引入 Skills 和 MCP 做动态能力加载）还在探索中。

> **工程提示**：`@path/to/file` 会把整个文件嵌入上下文。引用几百行的文件，会让每个会话一开始就占用较多指令空间。官方文档目前限制递归导入最多 4 层。对于大文件，可以改写成“架构细节参见 `docs/architecture.md`”，让 Claude 在需要时读取。

## 怎么维护？

项目结构、命令和工作流发生变化后，`CLAUDE.md` 中的旧规则也要跟着清理。

`CLAUDE.md` 用于保存主动维护的长期指令，例如团队必须遵守的规则和每个会话都要知道的项目事实。Auto Memory 是 Claude Code v2.1.59+ 内置的自动记忆机制，可以记录协作过程中出现的调试结论、偏好和工作习惯。

我的习惯是：会影响团队协作、每次会话都应该遵守的，写进 `CLAUDE.md`；只是在排查过程中学到的小经验，就交给 Auto Memory。

比如“所有接口返回 `Result<T>`”应该写进 `CLAUDE.md`；“这个项目的 Redis Stream 测试需要本地先启动 Redis”这种调试发现，让 Auto Memory 记住就够了。Auto Memory 默认开启，可以在 `/memory` 里查看、编辑、关闭；它会为每个项目维护独立的 memory 目录，但它不是团队共享规范，不能替代提交到仓库里的 `CLAUDE.md`。

![CLAUDE.md 维护决策流程](https://oss.javaguide.cn/github/javaguide/ai/coding/claudecode/claude-md-best-practices-maintenance-flow.png)

### 什么时候添加规则？

Claude 已经出现过某类错误，而且一句明确的规则能够降低重复出错的概率，这时再考虑添加。规则文件只能提供指令；可以机械校验的要求，还要交给测试、Linter、Hook 或 CI。

### 什么时候删除规则？

规则对应的项目约束已经失效，或者移除后 Claude 的行为没有变化，就可以删除。代码中已经能够直接读出的事实，也不需要在规则文件里重复维护。

### 怎么判断规则需要调整？

Claude 如果说“抱歉，我刚才忽略了 XX 规则”，先确认该文件是否已经加载，再检查规则是否给出了明确动作。只有“注意”“尽量”这类要求时，可以换成可执行、可验证的表述。

同一条规则在不同会话中反复被违反，还要排查文件是否过长、多个规则是否冲突、规则是否放在正确的作用域。继续加粗或加感叹号，通常不会改变这些问题。

### 怎么做定期检查？

可以定期选几条规则，问 Claude：“删除这条规则后，你会改变哪些行为？”这个回答只能用于初步筛选，因为 Claude 对自身行为的预判并不完全可靠。拿不准时，可以在两个平行会话中分别使用包含和不包含该规则的 `CLAUDE.md`，给出相同 prompt，再比较结果。

遇到错误时，也不要立即让 Claude 把教训写进 `CLAUDE.md`。先判断它是否长期有效、是否影响团队成员、以后是否还会遇到。同类错误重复出现后，再归纳成一条规则；只与本机有关的偏好或一次调试结论，可以留在 Auto Memory。

## 常见踩坑

- **只知道加规则，不记得删。** 每次出错就往 `CLAUDE.md` 里补一句，旧规则却一直留着，文件很快就会越写越长。等 Claude 开始漏规则时，再加粗、加感叹号意义不大，先把过期、重复的内容删掉。
- **用 `@` 一口气导入大文件。** `@` 引用会把整个文件放进上下文。几百行的文档直接导入，会话还没开始就先占掉一块空间。低频资料写成“架构细节见 `docs/architecture.md`”就够了，需要时再让 Claude 自己读。
- **把新建文件的要求全放在 path-scoped rules 里。** 路径规则要等 Claude 读取匹配文件后才会加载。直接新建文件时，这些规则可能还没有进入上下文。创建阶段必须遵守的要求，放到全局 rules、根目录 `CLAUDE.md` 或 Hook 里更合适。
- **几个规则文件各说各话。** 用户级、项目级和目录级规则一旦冲突，Claude 不一定会提醒你，也不一定每次都做出同样的选择。项目规则改动后，顺手检查一下其他层级，把重复和冲突的内容一起清掉。
- **Claude 偶尔出错，就马上补一条永久规则。** 一次罕见问题换来一条长期规则，后面的每个会话都要为它占用上下文。同类问题反复出现，而且确实能用一句明确指令约束时，再写进去也不迟。

## 总结

写 `CLAUDE.md` 时，不用想着把项目里的所有规矩都塞进去，这样完全没意义。

我自己平时经常用的一个判断是：这条信息，Claude 光看代码能不能猜准？看不出来，猜错后又容易把活干偏，这类信息就该写。

技术栈版本、启动和测试命令、架构边界、项目里那些不太显眼的限制，通常都值得留。至于缩进、import 排序这些，交给格式化工具更省心。

项目还小时，也别急着搭一套复杂的规则体系。先在根目录放一份短一点的 `CLAUDE.md`，够用就行。等内容真的多了，再把局部规则拆到 `.claude/rules/` 或独立文档里。拆完用 `/context` 看一眼，别以为文件放对了，Claude 就一定已经读到了。

`CLAUDE.md` 也不是写完就封存的说明书。Claude 反复犯同一个错，就补一条；项目改了，旧规则就删；能靠测试、Linter、Hook 或 CI 卡住的，直接交给工具。文件短一点、规则准一点，往往比面面俱到更有用。
