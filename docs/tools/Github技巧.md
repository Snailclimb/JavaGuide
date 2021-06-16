我使用 Github 已经有 5 年多了，今天毫无保留地把自己觉得比较有用的 Gihub 小技巧送给关注 JavaGuide 的各位小伙伴。

这篇文章肝了很久，就挺用心的，大家看内容就知道了。

如果觉得有收获的话，不要白嫖！点个赞/在看就是对我最大的鼓励。你要是可以三连（点赞+在看+转发）的话，我就更爽了（_我在想屁吃？_）。

## 1. 一键生成 Github 简历

通过 [https://resume.github.io/](https://resume.github.io/) 这个网站你可以一键生成一个在线的 Github 简历。

当时我参加的校招的时候，个人信息那里就放了一个在线的 Github 简历。我觉得这样会让面试官感觉你是一个内行，会提高一些印象分。

但是，如果你的 Github 没有什么项目的话还是不要放在简历里面了。生成后的效果如下图所示。

![Github简历](https://guide-blog-images.oss-cn-shenzhen.aliyuncs.com/2020-11/image-20201108192205620.png)

## 2. 个性化 Github 首页

Github 目前支持在个人主页自定义展示一些内容。展示效果如下图所示。

![个性化首页展示效果](/Users/guide/Library/Application Support/typora-user-images/image-20210616221212259.png)

想要做到这样非常简单，你只需要创建一个和你的 Github 账户同名的仓库，然后自定义`README.md`的内容即可。

展示在你主页的自定义内容就是`README.md`的内容（_不会 Markdown 语法的小伙伴自行面壁 5 分钟_）。

![创建一个和你的Github账户同名的仓库](https://guide-blog-images.oss-cn-shenzhen.aliyuncs.com/java-guide-blog/image-20201107110309341.png)

这个也是可以玩出花来的！比如说：通过 [github-readme-stats](https://hellogithub.com/periodical/statistics/click/?target=https://github.com/anuraghazra/github-readme-stats) 这个开源项目，你可以 README 中展示动态生成的 GitHub 统计信息。展示效果如下图所示。

![通过github-readme-stats动态生成GitHub统计信息 ](https://guide-blog-images.oss-cn-shenzhen.aliyuncs.com/java-guide-blog/image-20210616221312426.png)

关于个性化首页这个就不多提了，感兴趣的小伙伴自行研究一下。

## 3. 自定义项目徽章

你在 Github 上看到的项目徽章都是通过 [https://shields.io/](https://shields.io/) 这个网站生成的。我的 JavaGuide 这个项目的徽章如下图所示。

![项目徽章](https://guide-blog-images.oss-cn-shenzhen.aliyuncs.com/2020-11/image-20201107143136559.png)

并且，你不光可以生成静态徽章，shield.io 还可以动态读取你项目的状态并生成对应的徽章。

![自定义项目徽章](https://guide-blog-images.oss-cn-shenzhen.aliyuncs.com/2020-11/image-20201107143502356.png)

生成的描述项目状态的徽章效果如下图所示。

![描述项目状态的徽章](https://guide-blog-images.oss-cn-shenzhen.aliyuncs.com/2020-11/image-20201107143752642.png)

## 4. Github 表情

![Github表情](https://guide-blog-images.oss-cn-shenzhen.aliyuncs.com/2020-11/image-20201107162254582.png)

如果你想要在 Github 使用表情的话，可以在这里找找 ：[www.webfx.com/tools/emoji-cheat-sheet/ ](www.webfx.com/tools/emoji-cheat-sheet/)。

![在线Github表情](https://guide-blog-images.oss-cn-shenzhen.aliyuncs.com/2020-11/image-20201107162432941.png)

## 5. 高效阅读 Github 项目的源代码

Github 前段时间推出的 Codespaces 可以提供类似 VS Code 的在线 IDE，不过目前还没还没完全开发使用。

简单介绍几种我最常用的阅读 Github 项目源代码的方式。

### 5.1. Chrome 插件 Octotree

这个已经老生常谈了，是我最喜欢的一种方式。使用了 Octotree 之后网页侧边栏会按照树形结构展示项目，为我们带来 IDE 般的阅读源代码的感受。

![Chrome插件Octotree](https://guide-blog-images.oss-cn-shenzhen.aliyuncs.com/2020-11/image-20201107144944798.png)

### 5.2. Chrome 插件 SourceGraph

我不想将项目 clone 到本地的时候一般就会使用这种方式来阅读项目源代码。SourceGraph 不仅可以让我们在 Github 优雅的查看代码，它还支持一些骚操作，比如：类之间的跳转、代码搜索等功能。

当你下载了这个插件之后，你的项目主页会多出一个小图标如下图所示。点击这个小图标即可在线阅读项目源代码。

![](https://guide-blog-images.oss-cn-shenzhen.aliyuncs.com/2020-11/image-20201107145749659.png)

使用 SourceGraph 阅读代码的就像下面这样，同样是树形结构展示代码，但是我个人感觉没有 Octotree 的手感舒服。不过，SourceGraph 内置了很多插件，而且还支持类之间的跳转！

![](https://guide-blog-images.oss-cn-shenzhen.aliyuncs.com/2020-11/image-20201107150307314.png)

### 5.3. 克隆项目到本地

先把项目克隆到本地，然后使用自己喜欢的 IDE 来阅读。可以说是最酸爽的方式了！

如果你想要深入了解某个项目的话，首选这种方式。一个`git clone` 就完事了。

### 5.4. 其他

如果你要看的是前端项目的话，还可以考虑使用 [https://stackblitz.com/](https://stackblitz.com/) 这个网站。

这个网站会提供一个类似 VS Code 的在线 IDE。

## 6. 扩展 Github 的功能

**Enhanced GitHub** 可以让你的 Github 更好用。这个 Chrome 插件可以可视化你的 Github 仓库大小，每个文件的大小并且可以让你快速下载单个文件。

![](https://guide-blog-images.oss-cn-shenzhen.aliyuncs.com/2020-11/image-20201107160817672.png)

## 7. 自动为 Markdown 文件生成目录

如果你想为 Github 上的 Markdown 文件生成目录的话，通过 VS Code 的 **Markdown Preview Enhanced** 这个插件就可以了。

生成的目录效果如下图所示。你直接点击目录中的链接即可跳转到文章对应的位置，可以优化阅读体验。

![](<https://guide-blog-images.oss-cn-shenzhen.aliyuncs.com/2020-11/iShot2020-11-07%2016.14.14%20(1).png>)

## 8. 后记

这篇文章是我上周六的时候坐在窗台写的，花了一下午时间。

![](https://guide-blog-images.oss-cn-shenzhen.aliyuncs.com/2020-11/301604738120_.pic_hd.jpg)

除了我提到的这些技巧之外，像 Github 搜索技巧、GitHub Actions 等内容的话，我这里没有提，感兴趣的小伙伴自行研究一下。

这里多说一句心里话： **Github 搜索技巧不必要记网上那些文章说的各种命令啥的，真没啥卵用。你会发现你用的最多的还是关键字搜索以及 Github 自带的筛选功能。**
