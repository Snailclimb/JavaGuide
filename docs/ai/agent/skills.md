---
title: Agent Skills 是什么？和 Prompt、MCP 到底差在哪？
description: 从工程视角聊 Agent Skills：它和 Prompt、Function Calling、MCP 的联系与边界，SKILL.md 怎么写才稳，延迟加载和渐进式披露怎么设计，以及写 Skill 最容易踩的坑。
category: AI 应用开发
head:
  - - meta
    - name: keywords
      content: Agent Skills,MCP,Function Calling,Prompt,AI Agent,智能体,延迟加载,上下文注入,SKILL.md
---

做 Code Review 时，经常需要同一份检查清单：这次改动有没有越权风险，有没有循环查库，是否符合项目约定。把清单保存在 Skill 中，下一次审查就能按需读取，不必每次重新粘贴。

全局项目约定仍可以放在 `AGENTS.md`。Skill 保存的是这类任务的操作说明，只有审查任务需要的长清单和资料，也可以跟着它一起管理。

## Agent Skills 是什么？

**Skill 是一个以 `SKILL.md` 为入口的任务资料包**，其中可以包含指令、参考文件、脚本和模板。Agent 先看到名称与描述，需要执行这类任务时再读取详细说明。

例如慢 SQL 排查 Skill 可以记录日志字段、执行计划检查方式和报告格式。读取了说明，不代表数据库已经查过；Agent 还需要可用的工具来运行查询或脚本。

## Skill 和 Prompt、MCP、Function Calling 有什么联系？

这几个概念常同时出现，但可以沿一次报表分析把它们分开。

拿“帮我分析这份报表”这个请求来说，用户说的话是 **Prompt**。模型决定调用 `read_file` 并生成结构化参数时，用到的是 **Function Calling**；`read_file` 若由 MCP Server 提供，**MCP** 负责的是连接和协议。

如果团队要求分析前先确认字段口径，再查异常值，可以把这套要求写进 **Skill**。Skill 加载后成为上下文中的指令材料，模型再据此调用读文件或数据分析工具。用户请求、操作说明、工具调用和连接协议分别完成各自的工作。

![ Skill 和 Prompt、MCP、Function Calling 对比](https://oss.javaguide.cn/github/javaguide/ai/skills/skill-prompt-function-calling-mcp-comparison.webp)

放在一个真实链路里，大概是这样：

![Agent 执行链路](https://oss.javaguide.cn/github/javaguide/ai/skills/skill-agent-execution-link.webp)

1. 用户提出任务（Prompt）
2. 宿主把可用 Skills 的简短描述放进上下文（Skill 元数据）
3. 模型判断当前任务命中了某个 Skill（Skill 路由）
4. 宿主再把完整 `SKILL.md` 加载进来（延迟加载）
5. 模型按照 Skill 里的流程去调工具、读资料、写结果（执行）

工具并不是 Skill 的必备部分。[sanyuan-skills](https://github.com/sanyuan0704/sanyuan-skills) 里的 Code Review Expert 只规定从 SOLID、安全、性能等维度审查；[Superpowers](https://github.com/obra/superpowers) 的 TDD Skill 则要求 Agent 跑测试、读取输出，再决定下一步。

因此，Function Calling 是执行动作时可能用到的能力，Skill 更接近一次按需的**上下文注入**。`load_skill()` 也是这个意义上的概念，不是跨平台统一的 API 名称；Claude Code、Cursor、Codex、Copilot 的发现和加载方式各不相同。

## ⭐️SKILL.md 到底怎么写？

### 基本结构

最小可用的 Skill 其实很简单，就是一个目录加一个 Markdown 文件 `SKILL.md`。

`scripts/`、`references/`、`assets/` 这些都不是必需项，但复杂点的 Skill 经常会用到这些文件夹，例如 `scripts/` 中放一些 Skill 需要用到的脚本。

```text
skill-name/
├── SKILL.md          # 主文件，触发时加载
├── scripts/          # 实用脚本（执行，不需要加载到上下文）
├── references/       # 参考资料（按需加载）
└── assets/           # 模板和静态文件（按需加载）
```

一个 `SKILL.md` 包含两部分：

1. 前面是 **YAML 前置元数据**，告诉宿主“我是谁、什么时候该用我”；
2. 后面是**正文**，写具体流程、约束、示例和失败处理。

想要学 Skill 怎么写，我们直接看最顶级的开源 Skill 就好了。

这里我们以 [Superpowers 的 TDD 技能](https://github.com/obra/superpowers/blob/main/skills/test-driven-development/SKILL.md)为例，

它的元数据只有两行：

```yaml
---
name: test-driven-development
description: Use when implementing any feature or bugfix, before writing implementation code
---
```

TDD 会涉及到 Red-Green-Refactor 循环，但这个 TDD Skill 的 description 压根没提到，就一句话说清楚什么时候该用。正文才展开讲具体怎么做，简化版如下：

```markdown
# TDD

## Rule

Write a failing test before production code.

If you did not watch the test fail, the test is not trusted.

## Flow

1. **RED**: Write one small failing test.
2. **VERIFY RED**: Run it. Confirm it fails for the expected reason.
3. **GREEN**: Write the smallest code to pass.
4. **REFACTOR**: Clean up without changing behavior.

## Use For

- Features
- Bug fixes
- Refactoring
- Behavior changes

## Ask Before Skipping

- Throwaway prototypes
- Generated code

## Done Checklist

- [ ] Test written first
- [ ] Failure observed
- [ ] Minimal code added
- [ ] Tests pass
```

### 先看官方的 skill-creator

[`skill-creator`](https://github.com/anthropics/skills/blob/main/skills/skill-creator/SKILL.md) 是 Anthropic 官方 Skills 仓库提供的创建 Skill 的 Skill。使用它时，需要先说明希望 Agent 完成什么任务、哪些请求应该触发，再整理正文、脚本和参考资料。

以 PDF 处理为例，“提取文本”是触发场景，提取命令是执行步骤，表单填写指南则可以留在独立文件里。先把这些用途分开，主文件就不会同时承担项目介绍、API 手册和全部操作说明。

### 元数据（Frontmatter）

宿主发现 Skill 时通常先读取 `name` 和 `description`。前者用于标识，后者帮助模型判断任务是否匹配。正文写得再详细，如果描述没说明适用场景，模型也可能根本不去打开它。

按 [Agent Skills 规范](https://agentskills.io/specification)，`name` 的要求包括：

- 1–64 个字符，使用小写字母、数字和连字符
- 不能以连字符开头或结尾，不能出现连续连字符
- 必须与父目录名称一致

[Claude 的编写指南](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices)还限制 XML 标签和 `anthropic`、`claude` 等保留字。宿主特有的要求与通用格式规范要分别核对。

命名时可以优先用动名词形式，也就是“动词 + -ing”。这样一眼就能看出这个 Skill 提供的是什么能力。

| **好的命名**              | **不好的命名**                 |
| ------------------------- | ------------------------------ |
| `processing-pdfs`         | `helper`、`utils`，太模糊      |
| `reviewing-code`          | `documents`，太通用            |
| `test-driven-development` | `tools`，啥也没说              |
| `analyzing-spreadsheets`  | `anthropic-helper`，包含保留字 |

`description` 更关键。如果`description` 写的不好，那这个Skill 就没办法在该调用的时候被调用。毕竟 Agent 不会先把每个 Skill 的 `SKILL.md` 都读一遍，而是先看描述来判断该不该加载。

`description`的描述不能太简洁，也不要太多。一个好用的 `description`，建议说清楚两件事就足够了：

1. 这个 Skill 做什么
2. 在什么场景下需要用它

我们前面列举的 Superpowers 的 TDD 技能就是满足这个要求的。

最好再带上一些用户可能会说出来的词。比如 PDF、表单、提取、提交消息、git diff 这类词。这样不管是规则匹配还是语义匹配，都更容易抓到。

```yaml
# ✓ 好的：有能力、有场景、有触发词
description: 从 PDF 文件中提取文本和表格、填充表单、合并文档。在处理 PDF 文件或用户提及 PDF、表单、文档提取时使用。

# ✗ 避免：第一人称 + 触发条件不清楚
description: 我可以帮助您处理 PDF 文件

# ✗ 避免：只写能力，不写什么时候用
description: 处理 Excel 文件
```

看几个实际例子：

```yaml
# Superpowers 的 TDD
name: test-driven-development
description: Use when implementing any feature or bugfix, before writing implementation code

# sanyuan-skills 的 Code Review Expert
name: code-review-expert
description: Expert code review of current git changes with a senior engineer lens. Detects SOLID violations, security risks, and proposes actionable improvements.

# Git 提交助手
description: 通过分析 git diff 生成描述性提交消息。当用户要求帮助编写提交消息或审查暂存更改时使用。
```

只写概念、范围过宽或缺少触发条件的 `description`，例如：

```yaml
# Superpowers 的 TDD 反例，只写概念，不写触发时机
name: test-driven-development
description: Helps with test-driven development and writing better tests.

# Code Review Expert 反例，太泛
name: code-review-expert
description: Helps review code and improve quality.

# Git 提交助手反例，只写功能名
description: 生成提交消息。
```

### 正文

命中 PDF 提取任务后，Agent 才需要知道使用哪个库、输入文件在哪里、输出放到哪里，以及读不到文本时怎么办。这些内容放进正文；PDF 的历史和通用定义通常不影响操作，可以省略。

正文一旦加载，就会和对话历史、系统提示共用上下文。省下无关解释，是为了让文件路径和处理条件更容易被找到。

![上下文为什么会失效](https://oss.javaguide.cn/github/javaguide/ai/context-engineering/why-does-the-following-content-fail.png)

检查一段说明是否需要保留，可以看删掉它会不会改变执行。例如默认库、输出路径和错误处理会改变动作；“PDF 是一种常见文件格式”通常不会。

处理 PDF 文本时，正文直接给默认库和调用方式：

````markdown
## 提取 PDF 文本

使用 pdfplumber 进行文本提取：

```python
import pdfplumber
with pdfplumber.open("file.pdf") as pdf:
    text = pdf.pages[0].extract_text()
```
````

从 PDF 定义和工具罗列开始的正文，对 Agent 的下一步没有帮助：

```markdown
## 提取 PDF 文本

PDF（便携式文档格式）是一种常见文件格式，通常包含文本、图片和其他内容。
如果要从 PDF 中提取文本，需要使用专门的 PDF 处理库。
目前有很多库可以完成这类工作，例如 pypdf、pdfplumber、PyMuPDF 等。
这里建议使用 pdfplumber，因为它比较容易上手，也能覆盖大多数普通 PDF 文本提取场景。
首先，你需要使用 pip 安装它，然后再编写下面的代码……
```

项目约定也不能靠模型猜。例如同样是查询 `users` 表，项目采用软删除时要额外加条件：

```markdown
users 表使用软删除。所有正式查询都必须加 `WHERE deleted_at IS NULL`。
```

这条约束会直接改变查询结果；软删除的通用定义无需放进 Skill：

```markdown
软删除是一种常见的数据删除方式，通常不会真正删除数据库记录，而是通过字段标记记录状态。
```

Anthropic 建议 `SKILL.md` 正文尽量少于 500 行。这是组织内容的建议，不是超出一行就无法加载的硬限制。篇幅增长时，可以先找只在某个分支使用的资料，将其移到参考文件，并留下读取条件。

![SKILL.md 正文最好控制在 500 行以内](https://oss.javaguide.cn/github/javaguide/ai/skills/keep-skill-md-content-under-500-lines-for-best-performance.png)

例如，Code Review Skill 的主文件只需指出何时读取 SOLID 检查项：

```markdown
需要做 SOLID 设计检查时，读取 `references/solid-checklist.md`。
```

`references/solid-checklist.md` 保存具体 checklist；任务不涉及设计检查时，Agent 不必读取它。

不知道哪些内容留在主文件时，可以对照这几个仓库看实际文件：

- [Superpowers](https://github.com/obra/superpowers) 的 TDD Skill 把 RED、GREEN、REFACTOR 和每一步的验证要求放在正文里。要写有执行顺序的 Skill，可以看它怎样规定进入下一步的条件。
- [sanyuan-skills](https://github.com/sanyuan0704/sanyuan-skills) 的 [Code Review Expert](https://github.com/sanyuan0704/sanyuan-skills/blob/main/skills/code-review-expert/SKILL.md) 在主文件中保留审查流程、严重等级和输出格式，SOLID 等细项则放进 `references/`。主文件仍然有操作步骤，并非只剩几个资料链接。
- [Anthropic 官方 Skills 仓库](https://github.com/anthropics/skills) 同时提供基础模板和 PDF、DOCX 等文档 Skill。可以先看模板需要填写什么，再对照文档 Skill 查看脚本和参考资料怎样配合正文使用。

![查找自己需要和热门的 Skills](https://oss.javaguide.cn/github/javaguide/ai/skills/skillssh.png)

![Superpowers 内置的 skills](https://oss.javaguide.cn/github/javaguide/ai/skills/superpowers-skills.png)

在 Claude Code 这类工具中，可以用 `/skill-name` 主动调用，也可以让模型根据任务选择；触发后再读取流程、约束、脚本和参考文件。

## 自由度怎么把控？

假设数据库迁移已经确认使用 `python scripts/migrate.py --verify --backup`。此时需要 Agent 执行的就是这条命令，不能因为运行失败，就自行删掉参数重试。Skill 可以直接写明：

````markdown
## 数据库迁移

运行下面这条命令：

```bash
python scripts/migrate.py --verify --backup
```

不要修改命令，不要添加额外参数。

如果命令失败，停止执行，并把错误输出返回给用户。
````

代码审查则需要给 Agent 留出追踪问题的空间。Skill 可以约定检查项和报告要求：

```markdown
## 代码审查

重点检查：

1. 是否有明显 Bug 或边界情况遗漏
2. 是否存在安全风险
3. 是否影响性能或资源使用
4. 是否违反项目已有约定
5. 是否有更简单的实现方式

输出时优先写会影响正确性和线上稳定性的问题，不要只做格式建议。
```

审查过程中要追踪哪个调用、继续打开哪个文件，取决于 diff 中发现了什么。把文件顺序全部写死，可能反而妨碍追查问题。迁移命令和代码审查需要的约束不同，[Claude 的编写指南](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices#set-appropriate-degrees-of-freedom)将这种可调整的范围分为三档：

| **自由度** | **适合场景**                 | **写法**               |
| ---------- | ---------------------------- | ---------------------- |
| 高         | 需要判断和取舍，答案不唯一   | 给检查方向，不写死步骤 |
| 中         | 有固定模板，但允许按场景调整 | 给模板、参数和边界     |
| 低         | 操作脆弱，出错代价高         | 给精确命令，明确不能改 |

报告模板介于两者之间：可以固定字段，让 Agent 按当前 diff 填写问题和依据。同一份 Skill 也可以分别约束各个步骤，不必把阅读、判断和执行命令都定为同一档。

## ⭐️延迟加载与渐进式披露

![Skill 渐进式披露](https://oss.javaguide.cn/github/javaguide/ai/skills/agent-skills-progressive-disclosure.webp)

### 为什么不能把所有 Skill 一次性全塞进去？

PDF Skill 的目录里可以同时放着提取文本、填写表单的说明。用户只要求提取文本时，填表手册留在磁盘上即可，不需要陪着提取结果一起进入上下文。

**文件已经安装，与模型已经读过它，是两回事。** 渐进式披露安排的就是读取时机：先提供用于选择 Skill 的描述，选中后再读取正文，执行到某个分支时才补充对应资料。

这样能减少无关内容的占用，至于回答是否更准确，还要用具体任务检查。**Context Rot（上下文腐化）**讨论上下文增长后的信息利用问题，**Lost in the Middle** 关注相关信息所处的位置；输入长度本身不能说明是哪种问题，具体区别见 [上下文为什么会失效](./context-engineering.md#上下文为什么会失效)。

![渐进式披露](https://oss.javaguide.cn/github/javaguide/ai/skills/skills-progressive-disclosure.svg)

以这份 PDF Skill 为例，三层加载分别读取不同的内容：

![渐进式披露（三层模型）](https://oss.javaguide.cn/github/javaguide/ai/skills/skills-progressive-disclosure-three-layer-model.png)

**1. 广告层：先让模型知道有这个 Skill**

宿主提供 `name` 和 `description` 后，模型就能知道有哪些 PDF 操作可选。此时还没有读到提取命令，也没有读到填表指南。

**2. 指令层：命中后再读正文**

请求匹配后，Agent 打开 `SKILL.md`，这时才拿到提取命令。正文里还应写明：遇到填表任务，去哪里找后续步骤。

**3. 资源层：执行时再读细节**

填表时读取 `FORMS.md`，查询 API 用法时读取 `REFERENCE.md`。主文件要提供这些入口：

```markdown
## 高级功能

**表单填充**：完整指南请参阅 [FORMS.md](FORMS.md)

**API 参考**：所有方法请参阅 [REFERENCE.md](REFERENCE.md)
```

脚本的执行和源码的读取也要分开。已有调用方式足以完成任务时，Agent 可以直接运行脚本；需要排查错误或修改实现，再打开源码。脚本在磁盘上，并不意味着源码已经占用了上下文。

### 实际项目中怎么组织文件？

数据分析 Skill 可以按业务域保存指标说明：

```text
bigquery-analysis/
├── SKILL.md              # 概述和导航，命中时加载
└── reference/
    ├── finance.md        # 收入、ARR、账单指标
    ├── sales.md          # 机会、管道、账户
    ├── product.md        # API 使用、功能采用
    └── marketing.md      # 活动、归因、电子邮件
```

`SKILL.md` 负责把请求引到对应文件，具体指标口径由各文件维护：

```markdown
# BigQuery 数据分析

## 可用数据集

**财务**：收入、ARR、账单 → 参阅 [reference/finance.md](reference/finance.md)

**销售**：机会、管道、账户 → 参阅 [reference/sales.md](reference/sales.md)

**产品**：API 使用、功能采用 → 参阅 [reference/product.md](reference/product.md)

**营销**：活动、归因、电子邮件 → 参阅 [reference/marketing.md](reference/marketing.md)
```

用户问“上个季度的销售管道怎么样”，从这个入口就能找到 `reference/sales.md`。查询没有涉及财务、产品和营销时，其余三份资料仍可留在磁盘上。

如果关键口径要连续打开几个文件才能找到，拆分反而增加了查找步骤：

```markdown
SKILL.md → advanced.md → details.md → 最关键的规则藏在这里
```

这里可以让主文件直接链接到需要的资料：

```markdown
SKILL.md
├── 直接包含基本用法
├── 高级功能 → advanced.md
└── API 参考 → reference.md
```

参考文件本身很长，可以在文件内加目录。Agent 从主文件找到它后，还能继续定位到具体章节；主文件变短不应以增加多层跳转为代价。

## 工作流和反馈循环怎么设计？

一个开发任务做到哪一步算完成，要看验收条件。若要求测试通过，只生成实现文件还不够，交付时还得有对应的运行结果。Skill 应把执行、检查以及检查失败后的去向接起来。

![Skill 工作流设计](https://oss.javaguide.cn/github/javaguide/ai/skills/agent-skills-workflow-design.webp)

### 用清单把步骤串起来

Superpowers 的 TDD Skill 要求先看到测试失败，再写生产代码：

```text
NO PRODUCTION CODE WITHOUT A FAILING TEST FIRST
```

如果顺序反了，已经提前写了实现，它的要求是：

```text
Write code before the test? Delete it. Start over.
```

这里指的是按该流程开发时提前写出的实现，不包括用户或其他任务已有的代码。测试对象和断言仍由当前功能决定；固定的是执行顺序：

```markdown
### RED - Write Failing Test

Write one minimal test showing what should happen.

### Verify RED - Watch It Fail

**MANDATORY. Never skip.**

Confirm:

- Test fails, not errors
- Failure message is expected
- Fails because feature missing, not typos

### GREEN - Minimal Code

Write simplest code to pass the test.
Don't add features.

### REFACTOR - Clean Up

After green only:

- Remove duplication
- Improve names
- Extract helpers

Keep tests green. Don't add behavior.
```

RED 和 Verify RED 要分开，是因为测试文件存在并不代表它能检查目标行为。例如模块导入失败时，断言还没有执行。修好导入路径，再运行一次，确认失败确实来自尚未实现的功能，才进入 GREEN。

到交付时，再按清单核对做过的检查：

```markdown
## Verification Checklist

Before marking work complete:

- [ ] Every new function/method has a test
- [ ] Watched each test fail before implementing
- [ ] Each test failed for expected reason
- [ ] Wrote minimal code to pass each test
- [ ] All tests pass
- [ ] Output has no errors or warnings
```

“All tests pass”要有运行记录支持。假设只执行了一个模块的测试，报告就应写明这个范围，不能扩大成整个项目通过。命令、结果和未验证的部分都留下，后续才有依据接着检查。

### 反馈循环

一次失败输出可以帮助定位问题，修改完成后还需要新的运行结果。测试仍然失败，就根据新输出继续排查；通过了，才满足这项验证条件。[Claude 官方 Skill 编写指南](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices)把这几步接成了反馈循环：

```text
运行 → 验证 → 修复 → 再验证
```

代码审查也可以安排检查顺序。先看模块职责和依赖，再看实现细节；发现明显设计问题时，先报告它，因为后续修改可能会改变需要审查的代码：

```markdown
## 代码审查流程

1. 获取变更文件列表和 diff

2. 第一轮：设计审查

   - 检查整体结构是否合理
   - 检查是否违反 SOLID 原则
   - 如果发现明显架构问题，先报告，不急着进入细节审查

3. 第二轮：实现审查

   - 检查安全风险，比如 SQL 注入、XSS、越权
   - 检查性能热点，比如循环里的 DB 调用、缺失索引
   - 检查异常处理和边界条件

4. 输出问题
   - 标注严重等级：Critical / Warning / Suggestion
   - 给出可以直接修改的建议
```

这段流程只负责审查，输出问题列表就完成了。用户同时要求修复，才把问题列表交回修改步骤，再检查新的 diff。遇到无法解决的问题，应停下来交付当前改动、失败输出和原因；保留未完成状态，不能无限重试或报告验证通过。

### 条件分支

用户说“修改这份文档”，就要先读取原文件，保留未要求修改的部分；说“新建一份文档”，才从模板开始。采用解包后编辑、再重新打包的处理方式时，可以这样组织流程：

```markdown
## 文档修改工作流

1. 先判断任务类型

   **创建新文档？**

   走创建工作流。

   **编辑现有文档？**

   走编辑工作流。

2. 创建工作流

   - 使用模板生成文档
   - 导出为目标格式
   - 验证文件可以正常打开

3. 编辑工作流

   - 解包现有文档
   - 修改指定内容
   - 每次修改后验证
   - 完成后重新打包
```

创建、编辑和导出的步骤逐渐变长后，可以分别存放：

```text
workflows/
├── create-document.md
├── edit-document.md
└── export-document.md
```

主文件仍要写清楚何时打开这些文件。例如编辑已有文档先读 `edit-document.md`，执行到导出时再读 `export-document.md`。只把三个文件放进目录，Agent 还不知道本次该从哪一份开始。

## Skill 路由怎么做？

![Skill 路由流程](https://oss.javaguide.cn/github/javaguide/ai/skills/agent-skills-routing-flow.webp)

用户提交“频繁 Full GC”时，JVM 诊断 Skill 的描述应能匹配这项请求。数据库排查和文档处理没有对应任务时，无需一起加载。

Skill 只有三五个时，可以让模型直接比较 `description`。数量增加到几十个后，自建路由器可以先缩小候选集，再排序和选择；是否优于直接选择，需要用实际请求测试。下面是一种实现方式：

| 阶段   | 输入与处理                                                                          | 输出                       |
| ------ | ----------------------------------------------------------------------------------- | -------------------------- |
| 粗召回 | 将请求与 Skill 的名称、`description`、典型 Query 样本向量化，按余弦相似度取 top-5。 | 少量候选 Skill             |
| 精排   | 比较名称、描述、示例的命中情况；安全、数据库等高风险 Skill 使用更高阈值。           | 按相关性和风险排序的候选   |
| 决策   | 最高分满足阈值则加载对应 Skill；分数整体偏低时不加载任何 Skill，走默认流程。        | 一个、多个或零个已选 Skill |

同一请求中包含互不依赖的任务时，先拆分任务再路由。例如“分析 GC 日志并改一份部署文档”至少涉及 JVM 诊断和文档编辑，不能用一个泛化 Skill 覆盖两条流程。

对“频繁 Full GC”这类请求，粗召回可能得到 `jvm-metrics-analyzer`、链路追踪和 K8s 事件查看三个候选；精排检查“Full GC”“堆栈”等示例后，JVM 诊断 Skill 排在首位。若请求只写“帮我处理一下”，没有足够的语义线索，路由器应保留默认流程，而不是猜测用户要做数据库迁移或生产操作。

![Skill 路由流程](https://oss.javaguide.cn/github/javaguide/ai/skills/skills-router.svg)

新 Skill 还没有历史 Query，可以先整理几条典型请求供路由器匹配。自建调度器可以单独维护这份索引；[Agent Skills 规范](https://agentskills.io/specification)并没有定义通用的 `triggers` frontmatter 字段，不能把自定义字段当成所有宿主都能识别的配置：

```yaml
skill: jvm-runtime-diagnosis
examples:
  - "接口卡死了"
  - "频繁 Full GC"
  - "帮我看看这段 Java 堆栈"
  - "服务 OOM 了怎么排查"
```

在这个方案中，路由器把 `examples`、`name` 和 `description` 一起向量化，正文仍按选中的 Skill 加载。若使用第三方宿主，先查它支持哪些字段；宿主不读取的索引，写得再详细也不会参与选择。

几十个 Skill 用 NumPy 在内存中计算相似度即可，耗时通常来自外部 embedding API。先缓存 Query 向量；数量增长到数百或数千后，再评估 ANN 索引或向量数据库。

通用调度器可拆成四个部分：

| 部分         | 职责                                         |
| ------------ | -------------------------------------------- |
| 注册中心     | 保存 Skill 元数据、路由索引和向量。          |
| 路由引擎     | 召回候选、计算分数并应用阈值。               |
| 加载器       | 按路由结果读取 `SKILL.md` 与必要的参考资料。 |
| 上下文装配器 | 将已加载的内容放入对应任务的上下文。         |

路由引擎不负责读取 Skill 正文，加载器也不参与打分。这样更新正文不会改变召回结果，更换向量存储也无需改动加载逻辑。

## Skill 更新后，正在执行的任务用哪个版本？

**可以让任务在开始时绑定一个不可变的 Skill 版本，新任务再使用发布后的版本。** 这是一种应用层方案，适合有多个执行实例、长任务和审计要求的系统；单人使用本地 Skill 时，未必需要完整的发布机制。

[Agent Skills 规范](https://agentskills.io/specification)允许在 `metadata` 中记录版本，但没有规定任务级版本绑定、灰度发布或回滚。写上版本号，并不代表宿主已经实现这些能力。

假设一个订单处理 Skill 从 v1 升级到 v2：v2 增加了退款前的人工确认步骤。任务 A 已按 v1 完成订单查询，如果下一轮临时读入 v2 的正文，却仍使用 v1 的参考资料，执行过程就会混用两套规则。

发布时应把正文、参考文件和脚本作为同一个版本保存，用发布标识和内容摘要定位。延迟加载也要从这个版本读取，不能每次都去取默认分支的最新文件。外部订单状态和权限仍需实时检查，不能随 Skill 一起固定成历史快照。

| 时刻                | 新任务                    | 已在执行的任务 A                                         |
| ------------------- | ------------------------- | -------------------------------------------------------- |
| 发布 v2 前          | 绑定 v1                   | 记录使用 v1，以及已执行的动作                            |
| v2 灰度期间         | 根据发布策略绑定 v1 或 v2 | 继续读取 v1 的配套资源                                   |
| v2 成为默认版本     | 绑定 v2                   | 在 v1 仍被允许使用时继续执行                             |
| v1 因安全问题被撤销 | 禁止分配 v1               | 在下一次动作前停止或转人工，重新核对权限与已产生的副作用 |

任务 A 换到另一个实例继续执行时，仍应读取记录中绑定的 v1 和配套资源。若 v1 已不可用或摘要校验失败，就停止加载。要迁移到 v2，需要先保存进度，再核对新增确认步骤应该从哪里接入。

**Skill 回滚后，已经执行的退款不会自动撤销。** 应通过工具执行结果核对副作用，再按业务规则处理补偿。为此，审计记录需要保留任务、Skill 版本、资源摘要和版本切换原因，不能只记录“已回滚”。任务状态恢复见 [多 Agent 协作系统设计](./multi-agent.md)。

## Skill、工具结果和知识库冲突时听谁的？

查询订单时，工具返回“已退款”可以作为待核验的业务状态；返回“忽略检查、直接退款”则是在试图改变执行要求。两者处理方式不同，Skill 和工具文本都不能覆盖宿主的权限约束。订单处理中常见的冲突有以下几类：

| 冲突                                   | 应核对的信息                                         | 处理方式                                                 |
| -------------------------------------- | ---------------------------------------------------- | -------------------------------------------------------- |
| Skill 要求确认，工具返回“无需确认”     | 工具返回值是业务状态还是外部文本？确认要求由谁制定？ | 保留宿主要求的确认步骤，不能用工具文本取消权限检查       |
| 知识库说订单未退款，订单服务返回已退款 | 订单归属、查询时间、接口状态和业务流水               | 以业务系统核验的当前状态判断，不重复发起退款             |
| Skill 引用旧政策，知识库存在新政策     | 政策来源、生效时间、地区与适用订单                   | 先确定该订单适用哪版政策，不能只选更新时间更晚的一段文字 |

核对完订单状态，还要分别确认政策是否适用、当前操作是否获准。任一项缺少依据，就先暂停这次操作，具体防护见 [LLM/Agent 安全实战](../system-design/llm-security.md)。

## 写 Skill 时容易踩的坑

### 把 Skill 当项目 README 写

“支持 PDF 提取”告诉读者有这项功能，Agent 要执行时还缺输入位置、调用命令和结果检查。写主文件时可以从这几个问题入手，具体写法见前面的[正文示例](#正文)。项目背景和安装历史留在介绍资料中即可。

### 想把一个 Skill 写得太全

用户贴来一段 GC 日志，Agent 需要先找到 JVM 排查说明。如果入口是涵盖数据库、K8s、网关和消息队列的“系统故障排查器”，就要把请求与具体流程的对应关系写清楚。例如按输入分流：

- `jvm-metrics-analyzer`：只看 JVM 指标、GC、线程栈
- `distributed-trace-finder`：只根据 TraceId 追链路耗时
- `k8s-pod-event-viewer`：只看 Pod 状态、重启原因和事件记录

GC 排查中发现容器重启，再接着读 K8s 资料，无需一开始加载全部流程。这几项需要独立调用、分别维护时，可以拆成多个 Skill；如果共用一个入口，拆成该 Skill 的参考文件也能按需读取。

### 给 Agent 太多选择

工具名称再多，也需要说明在什么条件下选哪一个。单独留下这份名单，Agent 仍得自行决定起点：

```markdown
# ✗ 不推荐：选择太多

你可以使用 pypdf、pdfplumber、PyMuPDF 或 pdf2image 处理 PDF。
```

如果任务是提取文本，可以在同一处写清默认工具和扫描件的处理分支：

```markdown
# ✓ 推荐：默认方案 + 兜底方案

默认使用 pdfplumber 提取文本。
如果是扫描版 PDF，需要 OCR，再改用 pdf2image + pytesseract。
```

遇到提取失败，可以据此检查文件是否为扫描件；确认后转入 OCR。这个分支只处理扫描件，其他失败原因仍需要另外排查。

### 术语别来回换

前面用“API 端点”表示方法与路径，后面却只写“URL”，读者就要猜是否还需要核对请求方法。同一对象沿用同一个名称；确实要分别讨论 URL、路由和路径时，再把区别说清楚。

### 让 LLM 做确定性工作

任务要求批量转换文件或精确计算时，可以让模型识别输入、选择操作，再由脚本执行并校验结果。不必让模型逐行模拟文件处理过程。

脚本失败后，错误也会成为 Agent 的下一步输入。例如必需文件不存在，应当报错并说明缺的是哪份输入，不能创建一个空文件继续处理：

```python
# ✓ 推荐：错误条件写清楚
def process_file(path):
    try:
        with open(path, encoding="utf-8") as f:
            return f.read()
    except FileNotFoundError as exc:
        raise FileNotFoundError(
            f"必需输入文件不存在：{path}。请检查路径或先生成该文件。"
        ) from exc
```

下列写法会抛出 `FileNotFoundError`，通常也包含缺失路径，但没有补充这个文件在当前任务中是必需输入还是待生成产物：

```python
# 仅返回原始异常，未补充当前任务的处理要求
def process_file(path):
    return open(path).read()
```

超时和重试参数也要写清含义。`MAX_RETRIES` 是失败后追加的重试次数，还是包含首次调用的总尝试次数，会影响执行成本，必须与实现一致。下面只表示一组配置，实际取值要结合接口超时、任务总时限和重试成本：

```markdown
# 单位与计数口径；具体取值按任务调整

REQUEST_TIMEOUT = 30 # 单次请求超时，单位：秒
MAX_RETRIES = 3 # 首次失败后最多追加 3 次；还需服从任务总时限
```

## 总结

写完 Skill 后，用一项真正涉及它的任务检查一次。以代码审查为例，记录是否选中了 Skill、实际加载了哪些检查项，以及报告能否指向文件位置和依据。这样发现漏检时，才知道应该改描述、加载入口，还是正文中的检查要求。

## 参考

- Anthropic 官方 Skills 仓库：<https://github.com/anthropics/skills>
- Anthropic 官方 skill-creator：<https://github.com/anthropics/skills/blob/main/skills/skill-creator/SKILL.md>
- Superpowers：<https://github.com/obra/superpowers>
- sanyuan-skills：<https://github.com/sanyuan0704/sanyuan-skills>
- ECC（Everything Claude Code）：<https://github.com/affaan-m/ECC>
- skills.sh（查找现成 Skills 的平台）：<https://skills.sh/>

<!-- @include: @article-footer.snippet.md -->
