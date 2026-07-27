---
title: 比 iTerm2 更适合 Claude Code/Codex 的终端，我换成 Ghostty 了
description: 介绍 Ghostty 终端的安装、配置文件位置、字体主题、Starship、分屏快捷键、Quick Terminal、Shell Integration、SSH 和常见问题，适合 Claude Code 与 Codex CLI 用户搭建顺手的终端工作台。
category: AI 编程技巧
tag:
  - Ghostty
  - Claude Code
  - Codex
  - 终端工具
head:
  - - meta
    - name: keywords
      content: Ghostty,Ghostty安装,Ghostty配置,Ghostty教程,Claude Code终端,Codex CLI,AI编程终端,终端工具,Starship,Shell Integration
---

你好，我是小 G。我把终端从 iTerm2 换到 Ghostty 已经有三个月了。

整体体验还不错，这篇文章来分享一下。

Ghostty 不是 Claude Code 的官方指定终端，但确实被 Claude Code 带火了一把。Claude Code 创始人 Boris Cherny 在聊团队使用习惯时提到，他们的开发团队程序员非常喜欢 Ghostty。

![Boris Cherny 提到 Claude Code 团队喜欢 Ghostty](https://oss.javaguide.cn/github/javaguide/ai/coding/boris-ghostty-x.png)

我自己也是看了这个分享，后来被 iTerm2 搞烦了之后转去的。

用 Claude Code 或 Codex CLI 跑久了，终端会变成一个小工作台：一边看 Agent 输出，一边跑测试、看日志、处理 Git。iTerm2 当然也能做，但要调到顺手，通常得花不少时间配字体、主题、快捷键和分屏。Ghostty 的好处是下载下来就已经比较能用，后面只是按自己的习惯微调。

Ghostty 做的事情就是把终端模拟器这件事做好，没有什么花里花哨的。它没有内置 AI，也不是服务器管理器。

当然了，iTerm2、Warp、Kitty 等等，都是不错的，我希望看到这篇文章的朋友不要因为这些争论，你自己用着顺手才是最重要的！

![Ghostty 官网首页](https://oss.javaguide.cn/github/javaguide/ai/coding/ghostty-homepage.png)

## 安装

macOS 直接用 Homebrew：

```bash
brew install --cask ghostty
```

也可以去官网下载 `.dmg`，拖到 Applications。官方 macOS 包是 Ghostty 项目签名并经过 notarize 的；Homebrew cask 用的也是官方 `.dmg`。

装完看一下版本：

```bash
/Applications/Ghostty.app/Contents/MacOS/ghostty +version
```

如果 CLI 已经进 PATH：

```bash
ghostty +version
```

![Ghostty 版本检查输出](https://oss.javaguide.cn/github/javaguide/ai/coding/ghostty-version.png)

> 版本说明：本文配置按我本机的 Ghostty 1.3.1（1.3.x 系列）校对。Ghostty 更新挺快，配置项以你本机的 `ghostty +show-config --default --docs` 为准。Ghostty 1.4.0 计划提供 `ghostty +ssh`；下文保留 1.3.x 的 SSH 处理方式，1.4 用户请先看 [Ghostty SSH 文档](https://ghostty.org/docs/features/ssh)，不要直接照抄旧配置。

Linux 安装方式要看发行版。Arch Linux 可以直接：

```bash
sudo pacman -S ghostty
```

其他发行版优先看官方安装页。Ghostty 官方直接分发的是 macOS 预构建包，Linux 包多由发行版维护者或社区维护；工作机、公司机器上别随手跑来路不明的安装脚本。

## 先用默认值跑一天

其实你不需要做任何配置都能用，已经能够满足大部分朋友的需求了。

Ghostty 默认内置 JetBrains Mono，也带 Nerd Fonts 能力。大多数人不配字体也能直接用。

刚开始用，别一上来复制几百行配置。先打开跑一天，再改字体、主题、窗口内边距、透明度、剪贴板、Shell Integration 和分屏快捷键。终端配置越长，出问题越难查；Ghostty 值得用的一点，就是可以少配。

## 配置文件在哪里

Ghostty 配置就是 `key = value`。当前推荐文件名是 `config.ghostty`，旧文件名 `config` 仍会被读取。常见路径：

```text
~/.config/ghostty/config.ghostty
~/.config/ghostty/config
```

macOS 还会读：

```text
~/Library/Application Support/com.mitchellh.ghostty/config.ghostty
~/Library/Application Support/com.mitchellh.ghostty/config
```

两个地方都有配置时，macOS 的 Application Support 路径后加载，冲突项会覆盖前面的值。配置不生效，先查这个。

常用检查命令：

```bash
ghostty +list-fonts
ghostty +list-themes
ghostty +list-keybinds --default
ghostty +validate-config
```

改完配置后，macOS 按 `Cmd + Shift + ,` 重载，Linux 按 `Ctrl + Shift + ,`。透明度这类窗口项不一定热更新，没变化就重启 Ghostty。

## 我的最小配置

先建目录：

```bash
mkdir -p ~/.config/ghostty
```

编辑配置：

```bash
nano ~/.config/ghostty/config.ghostty
```

可直接用这一份：

```ini
# 字体
font-family = "JetBrainsMono Nerd Font Mono"
font-size = 14
font-thicken = true
font-thicken-strength = 80
font-codepoint-map = U+2E80-U+9FFF,U+F900-U+FAFF,U+FF00-U+FFEF=PingFang SC

# 主题
theme = Catppuccin Mocha

# 窗口
window-padding-x = 12
window-padding-y = 10
window-save-state = always
background-opacity = 0.95
background-blur = 20

# 光标和滚动
cursor-style = bar
cursor-style-blink = true
scrollback-limit = 10000000
scrollbar = never

# Shell Integration
shell-integration = detect
shell-integration-features = cursor,sudo,title

# macOS
macos-option-as-alt = left
macos-titlebar-style = transparent
macos-titlebar-proxy-icon = hidden

# 分屏
split-divider-color = #45475a
unfocused-split-opacity = 0.92

# 剪贴板
copy-on-select = false
clipboard-paste-protection = true
clipboard-paste-bracketed-safe = true
```

字体这里用的是 JetBrainsMono Nerd Font Mono，主要是为了让 Git 分支符号、Starship prompt、Powerline 图标别变成方块。没装的话：

```bash
brew install --cask font-jetbrains-mono-nerd-font
```

中文不要直接把 `PingFang SC` 当第二个 `font-family` 乱塞。主字体没命中时，英文可能也落到中文字体上，字距会很怪。`font-codepoint-map` 只把中文码位交给 `PingFang SC`，更稳。

`copy-on-select = false` 是我的习惯。Ghostty 默认选中文本会复制，Linux 用户可能喜欢；在 macOS 上，我更愿意手动 `Cmd + C`，避免剪贴板被误覆盖。

`clipboard-paste-protection = true` 建议留着。从网页复制多行命令进终端，本来就应该多一道提醒。

`scrollback-limit` 的单位是字节，不是行数；`10000000` 大约是 10 MB，而且每个分屏、标签页都会单独算。

![Ghostty 配合 Catppuccin Mocha、JetBrainsMono Nerd Font 和 Starship 的效果](https://oss.javaguide.cn/github/javaguide/ai/coding/ghostty-terminal-demo.png)

## 主题

列出内置主题：

```bash
ghostty +list-themes
```

换主题只要一行：

```ini
theme = TokyoNight
```

我一般用：

```ini
theme = Catppuccin Mocha
```

想跟随系统明暗模式：

```ini
theme = dark:Catppuccin Mocha,light:Catppuccin Latte
```

Ghostty 内置主题已经够多。自定义主题本质上也是一段会被 Ghostty 加载的配置片段，大多数只改颜色；从陌生来源下载时，打开看一眼，确认它没有顺手改字体、透明度或 keybind。

## Starship 可选

Ghostty 管终端窗口、字体、主题和协议；Starship 管 shell prompt。

想让 prompt 和 Catppuccin 风格一致，可以装：

```bash
brew install starship
```

`~/.zshrc` 末尾加：

```bash
command -v starship >/dev/null && eval "$(starship init zsh)"
```

想确认 Starship 到底显示了哪些模块，可以在 Git 仓库里跑：

```bash
starship explain
```

![Starship explain 展示 prompt 中的路径、分支和 Git 状态](https://oss.javaguide.cn/github/javaguide/ai/coding/starship-explain.png)

我不建议一开始就把 Starship 模块全开。目录、Git 分支、Git 状态、耗时够用；Kubernetes、云账号、容器这些东西，用到再加。prompt 每次回车都要计算，信息太满反而慢。

## 分屏和常用快捷键

macOS 下先记这些：

| 快捷键                  | 作用               |
| ----------------------- | ------------------ |
| `Cmd + T`               | 新标签页           |
| `Cmd + W`               | 关闭当前终端或分屏 |
| `Cmd + D`               | 向右分屏           |
| `Cmd + Shift + D`       | 向下分屏           |
| `Cmd + [` / `Cmd + ]`   | 前后切换分屏       |
| `Cmd + Option + 方向键` | 按方向切换分屏     |
| `Cmd + Shift + Enter`   | 放大/恢复当前分屏  |
| `Cmd + F`               | 搜索历史输出       |
| `Cmd + Shift + ,`       | 重载配置           |
| `Cmd + Shift + P`       | 命令面板           |

跑 Claude Code 时，三块布局最顺手：

1. `Cmd + D` 左右分屏。
2. 光标放到右侧，`Cmd + Shift + D` 再上下分屏。
3. 左侧跑 Claude Code，右上跑测试，右下看日志或 Git。
4. Claude 输出太长，按 `Cmd + Shift + Enter` 临时放大。

这个布局不用 tmux，也不用多个窗口来回摆。

![Ghostty 分屏运行 Claude Code、开发服务和日志](https://oss.javaguide.cn/github/javaguide/ai/coding/ghostty-split-claude-code.png)

想自己绑快捷键，用这个格式：

```ini
keybind = trigger=action
```

例如：

```ini
keybind = cmd+shift+e=equalize_splits
keybind = cmd+shift+f=toggle_split_zoom
```

## Quick Terminal

Quick Terminal 是从屏幕上方滑下来的临时终端。适合临时跑命令，不适合承载整天的主工作流。

配置：

```ini
quick-terminal-position = top
quick-terminal-screen = main
quick-terminal-autohide = true
quick-terminal-animation-duration = 0.15
keybind = global:ctrl+grave_accent=toggle_quick_terminal
```

Quick Terminal 没有默认快捷键，必须自己绑定 `toggle_quick_terminal`。`global:` 不是所有平台都能用：macOS 需要给 Ghostty 辅助功能权限；Linux Quick Terminal 只支持 Wayland，并要求 compositor 提供 `wlr-layer-shell-v1`，X11 不支持。Linux 的滑入动画目前只支持 KDE，还要启用 KWin 的 “Sliding Popups” 插件并完整重启 Ghostty；GNOME 等环境即使配置了 `quick-terminal-animation-duration` 也不会出现该动画。配置没问题但快捷键没反应时，先查显示协议、桌面环境能力、系统权限和快捷键冲突。

另外，macOS 上改 `quick-terminal-position` 后需要完整重启 Ghostty。

## Shell Integration

这一项我会留着：

```ini
shell-integration = detect
```

Ghostty 会给 zsh、fish、bash、nushell、elvish 加一段集成脚本。开了以后，新分屏会跟着当前目录走；比如你在项目根目录里开右侧分屏，右边不会又回到 home 目录。复杂 prompt 换行和 resize 也少一点错位，历史输出还能按 prompt 跳。

有两个小坑。

macOS 自带 `/bin/bash` 太老，官方文档说它不支持自动注入；默认 zsh 用户一般不用管。另一个是你在 Ghostty 里手动切 shell，比如进 `nix-shell`，集成能力可能会丢，需要手动加载对应脚本。

## SSH 不急着配

Ghostty 1.3.x 有自己的 terminfo 和协议能力。远程主机不认识时，Neovim、htop 这类 TUI 可能显示异常。

如果你只是偶尔 SSH，先别动。真遇到远程显示问题，再考虑：

```ini
shell-integration-features = cursor,title,ssh-env,ssh-terminfo
```

SSH 环境本来就复杂，没问题时少加一层包装。

Ghostty 1.4.0 发布后，优先评估 `ghostty +ssh` 提供的集成方式，再决定是否保留上述 1.3.x 配置。

## 常见问题

配置不生效，先查两个目录，再跑校验：

```bash
ls -la ~/.config/ghostty
ls -la "$HOME/Library/Application Support/com.mitchellh.ghostty"
ghostty +validate-config
```

网上有些配置会写 `=== 字体 ===` 这种分隔符，Ghostty 不认。注释要写成 `# 字体`。

英文字距很怪，先看字体名有没有命中：

```bash
ghostty +list-fonts | rg -i "JetBrains|Mono|Nerd"
```

如果你写了 `font-family = JetBrains Mono`，但本机没这个字体，Ghostty 会 fallback。fallback 到中文字体时，英文就容易变丑。装字体，或者改成 Ghostty 实际识别到的 family 名。

主题名以 `ghostty +list-themes` 输出为准。看到 `Catppuccin Mocha`，配置里就原样写：

```ini
theme = Catppuccin Mocha
```

透明度没变化，先完整重启 Ghostty。还有一种情况是 Neovim、tmux 自己画了背景色；Ghostty 默认只让窗口背景透明，不保证所有显式背景色的单元格都透明。真要连这些 cell 也一起透明，再看 `background-opacity-cells`。

选中文本把剪贴板覆盖了，就关掉：

```ini
copy-on-select = false
```

Quick Terminal 全局快捷键没反应，查三件事：配置里有没有 `global:`，系统权限或桌面环境是否支持，快捷键是不是被其他软件占了。

## 总结

如果只是想换个好看的终端，iTerm2 也能调主题和透明度。对我来说，Ghostty 在原生窗口、默认分屏、可读配置和长输出时的体感更轻；这属于个人机器和使用方式下的感受，不是统一性能结论。

建议先用默认值跑一天，再按实际问题调整字体、主题和快捷键；分屏用顺后，再决定是否启用 Quick Terminal。也可以让 Coding Agent 根据本文生成候选配置，但写入前要先确认本机 Ghostty 版本、平台和已有配置，避免覆盖个人快捷键。
