---
title: GitHub 实用小技巧总结
description: 汇总 GitHub 的高效使用技巧，包括个人主页、项目徽章、代码阅读、GitHub Actions、Explore/Trending 和开源协作提效方法。
category: 开发工具
tag:
  - Git
head:
  - - meta
    - name: keywords
      content: GitHub 技巧,个人主页,README,统计信息,开源贡献,GitHub Actions,代码阅读
---

GitHub 不只是代码托管平台。对开发者来说，它同时承担了项目展示、代码阅读、开源协作、自动化构建和个人主页的作用。这篇文章整理一些比较实用的 GitHub 使用技巧。

## 一键生成 GitHub 简历与 GitHub 年报

通过 [https://resume.github.io/](https://resume.github.io/) 这个网站你可以一键生成一个在线的 GitHub 简历。

不过，简历里是否放 GitHub 链接要看账号内容质量。如果账号里有完整项目、持续维护记录、清晰 README 和比较规范的提交历史，GitHub 链接会加分；如果只有空仓库或者临时练习代码，就没必要强行放。生成后的效果如下图所示。

![GitHub简历](https://oss.javaguide.cn/2020-11/image-20201108192205620.png)

通过 <https://www.githubtrends.io/wrapped> 这个网站，你可以生成一份 GitHub 个人年报，这个年报会列举出你在这一年的项目贡献情况、最常使用的编程语言、详细的贡献信息。

![](https://oss.javaguide.cn/github/dootask/image-20211226144607457.png)

## 个性化 GitHub 首页

GitHub 目前支持在个人主页自定义展示一些内容。展示效果如下图所示。

![个性化首页展示效果](https://oss.javaguide.cn/java-guide-blog/image-20210616221212259.png)

想要做到这样非常简单，你只需要创建一个和你的 GitHub 账户同名的仓库，然后自定义`README.md`的内容即可。

展示在你主页的自定义内容就是`README.md`的内容（_不会 Markdown 语法的小伙伴自行面壁 5 分钟_）。

![创建一个和你的GitHub账户同名的仓库](https://oss.javaguide.cn/java-guide-blog/image-20201107110309341.png)

这个也是可以玩出花来的！比如说：通过 [github-readme-stats](https://hellogithub.com/periodical/statistics/click/?target=https://github.com/anuraghazra/github-readme-stats) 这个开源项目，你可以在 README 中展示动态生成的 GitHub 统计信息。展示效果如下图所示。

![通过github-readme-stats动态生成GitHub统计信息 ](https://oss.javaguide.cn/java-guide-blog/image-20210616221312426.png)

关于个性化首页这个就不多提了，感兴趣的小伙伴自行研究一下。

## 自定义项目徽章

你在 GitHub 上看到的项目徽章都是通过 [https://shields.io/](https://shields.io/) 这个网站生成的。我的 JavaGuide 这个项目的徽章如下图所示。

![项目徽章](https://oss.javaguide.cn/2020-11/image-20201107143136559.png)

并且，你不光可以生成静态徽章，shield.io 还可以动态读取你项目的状态并生成对应的徽章。

![自定义项目徽章](https://oss.javaguide.cn/2020-11/image-20201107143502356.png)

生成的描述项目状态的徽章效果如下图所示。

![描述项目状态的徽章](https://oss.javaguide.cn/2020-11/image-20201107143752642.png)

## 自动为项目添加贡献情况图标

通过 repobeats 这个工具可以为 GitHub 项目添加如下图所示的项目贡献基本情况图表。

![](https://oss.javaguide.cn/github/dootask/repobeats.png)

地址：<https://repobeats.axiom.co/> 。

## GitHub 表情

![GitHub表情](https://oss.javaguide.cn/2020-11/image-20201107162254582.png)

如果你想要在 GitHub 使用表情的话，可以在这里找找：[www.webfx.com/tools/emoji-cheat-sheet/](https://www.webfx.com/tools/emoji-cheat-sheet/)。

![在线GitHub表情](https://oss.javaguide.cn/2020-11/image-20201107162432941.png)

## 高效阅读 GitHub 项目的源代码

GitHub Codespaces 可以提供类似 VS Code 的在线开发环境，适合临时阅读、调试或快速参与开源项目。对于大型项目或需要本地服务依赖的项目，还是建议 clone 到本地，用自己熟悉的 IDE 阅读和调试。

简单介绍几种常用的 GitHub 项目源码阅读方式。

### Chrome 插件 Octotree

这个已经老生常谈了，是我最喜欢的一种方式。使用了 Octotree 之后网页侧边栏会按照树形结构展示项目，为我们带来 IDE 般的阅读源代码的感受。

![Chrome插件Octotree](https://oss.javaguide.cn/2020-11/image-20201107144944798.png)

### Sourcegraph

不想将项目 clone 到本地时，也可以使用 Sourcegraph 这类代码搜索和阅读工具。Sourcegraph 支持跨仓库代码搜索、引用跳转等功能，阅读大型项目时比较有帮助。

当你下载了这个插件之后，你的项目主页会多出一个小图标如下图所示。点击这个小图标即可在线阅读项目源代码。

![](https://oss.javaguide.cn/2020-11/image-20201107145749659.png)

使用 Sourcegraph 阅读代码的效果类似下面这样，同样是树形结构展示代码，还支持类之间的跳转。

![](https://oss.javaguide.cn/2020-11/image-20201107150307314.png)

### 克隆项目到本地

先把项目克隆到本地，然后使用自己喜欢的 IDE 来阅读。想深入理解一个项目，首选这种方式。

```bash
git clone https://github.com/Snailclimb/JavaGuide.git
```

## 扩展 GitHub 的功能

**Enhanced GitHub** 可以让你的 GitHub 更好用。这个浏览器插件可以展示仓库大小、文件大小，并支持快速下载单个文件。

![](https://oss.javaguide.cn/2020-11/image-20201107160817672.png)

## 自动为 Markdown 文件生成目录

如果你想为 Markdown 文件生成目录，通过 VS Code 的 **Markdown Preview Enhanced** 这类插件就可以了。

生成的目录效果如下图所示。你直接点击目录中的链接即可跳转到文章对应的位置，可以优化阅读体验。

![](<https://oss.javaguide.cn/2020-11/iShot2020-11-07%2016.14.14%20(1).png>)

不过，目前 GitHub 已经会为 Markdown 文件自动生成目录，只是需要通过页面上的目录按钮展开。

![](https://oss.javaguide.cn/github/cosy/image-20211227093215005.png)

## 善用 GitHub Explore

GitHub 自带的 Explore 是一个非常强大且好用的功能，适合用来发现项目、主题和技术趋势。

简单来说，GitHub Explore 可以提供下面这些服务：

1. 可以根据你的个人兴趣为你推荐项目；
2. GitHub Topics 按照类别/话题将一些项目进行了分类汇总。比如 [Data visualization](https://github.com/topics/data-visualization) 汇总了数据可视化相关的一些开源项目，[Awesome Lists](https://github.com/topics/awesome) 汇总了 Awesome 系列的仓库；
3. 通过 GitHub Trending 我们可以看到最近比较热门的一些开源项目，我们可以按照语言类型以及时间维度对项目进行筛选；
4. GitHub Collections 类似一个收藏夹集合。比如 [Teaching materials for computational social science](https://github.com/collections/teaching-computational-social-science) 这个收藏夹就汇总了计算机课程相关的开源资源，[Learn to Code](https://github.com/collections/learn-to-code) 这个收藏夹就汇总了对你学习编程有帮助的一些仓库；
5. ……

![](https://oss.javaguide.cn/github/javaguide/github-explore.png)

## GitHub Actions 很强大

你可以简单地将 GitHub Actions 理解为 GitHub 自带的自动化平台。通过 GitHub Actions，你可以直接在 GitHub 上完成构建、测试、部署、依赖扫描、定时任务等工作。

关于 GitHub Actions 的详细介绍，推荐看一下阮一峰老师写的 [GitHub Actions 入门教程](https://www.ruanyifeng.com/blog/2019/09/getting-started-with-github-actions.html) 。

GitHub Actions 有一个官方市场，上面有很多别人提交的 Actions，可以直接复用。

![](https://oss.javaguide.cn/github/javaguide/image-20211227100147433.png)

## 后记

GitHub 技巧不需要一次性全部记住。个人主页、项目徽章、代码阅读、Explore/Trending、GitHub Actions 这几块先用起来，就已经能覆盖大部分日常场景。

另外，这篇文章没有展开讲 GitHub 搜索语法。实际使用中，关键词搜索、语言筛选、Star 数排序、更新时间筛选，往往比死记复杂语法更常用。

<!-- @include: @article-footer.snippet.md -->
