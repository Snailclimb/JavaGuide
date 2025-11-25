---
title: Git核心概念总结
category: 开发工具
tag:
  - Git
head:
  - - meta
    - name: keywords
      content: Git,版本控制,分布式,分支,提交,合并,冲突解决,工作流
  - - meta
    - name: description
      content: 总结 Git 的核心概念与工作流，涵盖分支与合并、提交管理与冲突解决，助力团队协作与代码质量提升。
---

## 版本控制

### 什么是版本控制

版本控制是一种记录一个或若干文件内容变化，以便将来查阅特定版本修订情况的系统。 除了项目源代码，你可以对任何类型的文件进行版本控制。

### 为什么要版本控制

有了它你就可以将某个文件回溯到之前的状态，甚至将整个项目都回退到过去某个时间点的状态，你可以比较文件的变化细节，查出最后是谁修改了哪个地方，从而找出导致怪异问题出现的原因，又是谁在何时报告了某个功能缺陷等等。

### 本地版本控制系统

许多人习惯用复制整个项目目录的方式来保存不同的版本，或许还会改名加上备份时间以示区别。 这么做唯一的好处就是简单，但是特别容易犯错。 有时候会混淆所在的工作目录，一不小心会写错文件或者覆盖意想外的文件。

为了解决这个问题，人们很久以前就开发了许多种本地版本控制系统，大多都是采用某种简单的数据库来记录文件的历次更新差异。

![本地版本控制系统](https://oss.javaguide.cn/github/javaguide/tools/git/%E6%9C%AC%E5%9C%B0%E7%89%88%E6%9C%AC%E6%8E%A7%E5%88%B6%E7%B3%BB%E7%BB%9F.png)

### 集中化的版本控制系统

接下来人们又遇到一个问题，如何让在不同系统上的开发者协同工作？ 于是，集中化的版本控制系统（Centralized Version Control Systems，简称 CVCS）应运而生。

集中化的版本控制系统都有一个单一的集中管理的服务器，保存所有文件的修订版本，而协同工作的人们都通过客户端连到这台服务器，取出最新的文件或者提交更新。

![集中化的版本控制系统](https://oss.javaguide.cn/github/javaguide/tools/git/%E9%9B%86%E4%B8%AD%E5%8C%96%E7%9A%84%E7%89%88%E6%9C%AC%E6%8E%A7%E5%88%B6%E7%B3%BB%E7%BB%9F.png)

这么做虽然解决了本地版本控制系统无法让在不同系统上的开发者协同工作的诟病，但也还是存在下面的问题：

- **单点故障：** 中央服务器宕机，则其他人无法使用；如果中心数据库磁盘损坏又没有进行备份，你将丢失所有数据。本地版本控制系统也存在类似问题，只要整个项目的历史记录被保存在单一位置，就有丢失所有历史更新记录的风险。
- **必须联网才能工作：** 受网络状况、带宽影响。

### 分布式版本控制系统

于是分布式版本控制系统（Distributed Version Control System，简称 DVCS）面世了。 Git 就是一个典型的分布式版本控制系统。

这类系统，客户端并不只提取最新版本的文件快照，而是把代码仓库完整地镜像下来。 这么一来，任何一处协同工作用的服务器发生故障，事后都可以用任何一个镜像出来的本地仓库恢复。 因为每一次的克隆操作，实际上都是一次对代码仓库的完整备份。

![分布式版本控制系统](https://oss.javaguide.cn/github/javaguide/tools/git/%E5%88%86%E5%B8%83%E5%BC%8F%E7%89%88%E6%9C%AC%E6%8E%A7%E5%88%B6%E7%B3%BB%E7%BB%9F.png)

分布式版本控制系统可以不用联网就可以工作，因为每个人的电脑上都是完整的版本库，当你修改了某个文件后，你只需要将自己的修改推送给别人就可以了。但是，在实际使用分布式版本控制系统的时候，很少会直接进行推送修改，而是使用一台充当“中央服务器”的东西。这个服务器的作用仅仅是用来方便“交换”大家的修改，没有它大家也一样干活，只是交换修改不方便而已。

分布式版本控制系统的优势不单是不必联网这么简单，后面我们还会看到 Git 极其强大的分支管理等功能。

## 认识 Git

### Git 简史

Linux 内核项目组当时使用分布式版本控制系统 BitKeeper 来管理和维护代码。但是，后来开发 BitKeeper 的商业公司同 Linux 内核开源社区的合作关系结束，他们收回了 Linux 内核社区免费使用 BitKeeper 的权力。 Linux 开源社区（特别是 Linux 的缔造者 Linus Torvalds）基于使用 BitKeeper 时的经验教训，开发出自己的版本系统，而且对新的版本控制系统做了很多改进。

### Git 与其他版本管理系统的主要区别

Git 在保存和对待各种信息的时候与其它版本控制系统有很大差异，尽管操作起来的命令形式非常相近，理解这些差异将有助于防止你使用中的困惑。

下面我们主要说一个关于 Git 与其他版本管理系统的主要差别：**对待数据的方式**。

**Git 采用的是直接记录快照的方式，而非差异比较。我后面会详细介绍这两种方式的差别。**

大部分版本控制系统（CVS、Subversion、Perforce、Bazaar 等等）都是以文件变更列表的方式存储信息，这类系统**将它们保存的信息看作是一组基本文件和每个文件随时间逐步累积的差异。**

具体原理如下图所示，理解起来其实很简单，每当我们提交更新一个文件之后，系统都会记录这个文件做了哪些更新，以增量符号 Δ(Delta)表示。

![](https://oss.javaguide.cn/github/javaguide/tools/git/2019-3deltas.png)

**我们怎样才能得到一个文件的最终版本呢？**

很简单，高中数学的基本知识，我们只需要将这些原文件和这些增加进行相加就行了。

**这种方式有什么问题呢？**

比如我们的增量特别特别多的话，如果我们要得到最终的文件是不是会耗费时间和性能。

Git 不按照以上方式对待或保存数据。 反之，Git 更像是把数据看作是对小型文件系统的一组快照。 每次你提交更新，或在 Git 中保存项目状态时，它主要对当时的全部文件制作一个快照并保存这个快照的索引。 为了高效，如果文件没有修改，Git 不再重新存储该文件，而是只保留一个链接指向之前存储的文件。 Git 对待数据更像是一个 **快照流**。

![](https://oss.javaguide.cn/github/javaguide/tools/git/2019-3snapshots.png)

### Git 的三种状态

Git 有三种状态，你的文件可能处于其中之一：

1. **已提交（committed）**：数据已经安全的保存在本地数据库中。
2. **已修改（modified）**：已修改表示修改了文件，但还没保存到数据库中。
3. **已暂存（staged）**：表示对一个已修改文件的当前版本做了标记，使之包含在下次提交的快照中。

由此引入 Git 项目的三个工作区域的概念：**Git 仓库(.git directory)**、**工作目录(Working Directory)** 以及 **暂存区域(Staging Area)** 。

![](https://oss.javaguide.cn/github/javaguide/tools/git/2019-3areas.png)

**基本的 Git 工作流程如下：**

1. 在工作目录中修改文件。
2. 暂存文件，将文件的快照放入暂存区域。
3. 提交更新，找到暂存区域的文件，将快照永久性存储到 Git 仓库目录。

## Git 使用快速入门

### 获取 Git 仓库

有两种取得 Git 项目仓库的方法。

1. 在现有目录中初始化仓库: 进入项目目录运行 `git init` 命令,该命令将创建一个名为 `.git` 的子目录。
2. 从一个服务器克隆一个现有的 Git 仓库: `git clone [url]` 自定义本地仓库的名字: `git clone [url] directoryname`

### 记录每次更新到仓库

1. **检测当前文件状态** : `git status`
2. **提出更改（把它们添加到暂存区**）：`git add filename` (针对特定文件)、`git add *`(所有文件)、`git add *.txt`（支持通配符，所有 .txt 文件）
3. **忽略文件**：`.gitignore` 文件
4. **提交更新:** `git commit -m "代码提交信息"` （每次准备提交前，先用 `git status` 看下，是不是都已暂存起来了， 然后再运行提交命令 `git commit`）
5. **Skip the method of updating using the staging area**: `git commit -a -m "code submission information"`. With `git commit` and the `-a` option, Git will automatically temporarily save all tracked files and submit them together, thus skipping the `git add` step.
6. **Remove file**: `git rm filename` (Remove from the staging area and then commit.)
7. **Rename the file**: `git mv README.md README` (This command is equivalent to the set of three commands: `mv README.md README`, `git rm README.md`, and `git add README`)

### A good Git commit message

A good Git commit message is as follows:

```plain
Title line: Use this line to describe and explain your submission

The body part can be a few lines to add more details to explain the commit, preferably giving some relevant background or explaining what problem this commit can fix or solve.

Of course, the main body can also have several paragraphs, but be sure to pay attention to line breaks and sentences that are not too long. Because it will look better with indentation when using "git log".
```

The description in the title line of the submission should be as clear as possible and summarized in one sentence. This makes it easier for related Git log viewing tools to display and for others to read.

### Push changes to the remote repository

- If you have not cloned the existing warehouse and want to connect your warehouse to a remote server, you can use the following command to add: `git remote add origin <server>`. For example, if we want to associate a local warehouse with a warehouse created on GitHub, we can do this `git remote add origin https://github.com/Snailclimb/test.git`
- Submit these changes to the remote repository: `git push origin master` (you can replace _master_ with any branch you want to push)

  This way you can push your changes to the added server.

### Removal and renaming of remote warehouse

- Rename test to test1: `git remote rename test test1`
- Remove remote repository test1:`git remote rm test1`

### View submission history

After committing a few updates, or cloning a project, you may want to review the commit history. The simplest and most effective tool to accomplish this task is the `git log` command. `git log` will list all updates by commit time, with the most recent updates at the top.

**You can add some parameters to see what you want to see:**

Only view a person's submission records:

```shell
git log --author=bob
```

### Undo operation

Sometimes after we submit, we discover that we have missed a few files and have not added them, or that the submission information was wrong. At this point, you can try to resubmit by running the commit command with the `--amend` option:

```shell
git commit --amend
```

Cancel staged files

```shell
git reset filename
```

Undo changes to a file:

```shell
git checkout --filename
```

If you want to discard all your local changes and commits, you can get the latest version history from the server and point your local master branch to it:

```shell
git fetch origin
git reset --hard origin/master
```

### Branch

Branches are used to insulate feature development. When you create a repository, _master_ is the "default" branch. Develop on other branches and merge them into the master branch when finished.

We usually choose to create branches when developing new features, fixing an urgent bug, etc. Whether single-branch development or multi-branch development is better depends on the specific scenario.

Create a branch named test

```shell
git branch test
```

Switch the current branch to test (when you switch branches, Git will reset your working directory so that it looks like it was back to the last commit you made on that branch. Git will automatically add, delete, and modify files to ensure that your working directory looks exactly the same as the last commit on this branch)

```shell
git checkout test
```

![](https://oss.javaguide.cn/github/javaguide/tools/git/2019-3%E5%88%87%E6%8D%A2%E5%88%86%E6%94%AF.png)

You can also create a branch directly like this and switch to it (a combination of the above two commands)

```shell
git checkout -b feature_x
```

Switch to master branch

```shell
git checkout master
```

Merge branches (may have conflicts)

```shell
 git merge test
```

Delete the newly created branch

```shell
git branch -d feature_x
```

Push the branch to the remote warehouse (visible to others after the push is successful):

```shell
git push origin
```

## Recommended learning materials

**Online Demonstration Learning Tool:**

"Supplement, from [issue729](https://github.com/Snailclimb/JavaGuide/issues/729)" Learn Git Branching <https://oschina.gitee.io/learn-git-branching/>. This website can easily demonstrate basic git operations and explain them clearly. The function and result of each basic command.

**Recommended Reading:**

- [Git introductory graphic tutorial (1.5W words, 40 pictures)](https://www.cnblogs.com/anding/p/16987769.html): A very thoughtful article with comprehensive content and detailed illustrations. Highly recommended!
- [Git - Concise Guide](https://rogerdudler.github.io/git-guide/index.zh.html): Covers common Git operations, very clearly.
- [Illustrating Git](https://marklodato.github.io/visual-git-guide/index-zh-cn.html): Illustrating the most commonly used commands in Git. If you understand a little bit about how git works, this article can give you a better understanding.
- [Every monkey can understand getting started with Git](https://backlog.com/git-tutorial/cn/intro/intro1_1.html): Interesting explanation.
- [Pro Git book](https://git-scm.com/book/zh/v2): A foreign Git book, translated into multiple languages, with high quality.

<!-- @include: @article-footer.snippet.md -->