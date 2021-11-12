---
icon: creative
category: IDEA指南
---

# IntelliJ IDEA 使用指南 | 必备插件推荐 | 插件开发入门 | 重构小技巧 | 源码阅读技巧

![](https://my-blog-to-use.oss-cn-beijing.aliyuncs.com/2020-8/2a2423cd-68bc-4c39-ae8f-1ba9915c5404.png)

在这里，我会分享一下自己使用 IDEA 的一些经验，希望对大家有帮助（欢迎 star）！

- Github 地址：[https://github.com/CodingDocs/awesome-idea-tutorial](https://github.com/CodingDocs/awesome-idea-tutorial)
- 码云地址：[https://gitee.com/SnailClimb/awesome-idea-tutorial](https://gitee.com/SnailClimb/awesome-idea-tutorial ) （Github 无法访问或者访问速度比较慢的小伙伴可以看码云上的对应内容）

大学的时候，我一直在用 Eclipse ，说实话用习惯了，占内存也比较小，最主要的是还免费使用。我当时一直没有换 IntelliJ IDEA（后面会简称为 IDEA） 的很大一部分原因是切换到 IDEA 需要很长时间去适应，有点跳出舒适区的感觉。

不过，说实话，我现在用 IDEA 这么久了，还是感觉很香的！俗话说：**工欲善其事，必先利其器 ，就我个人而言 IDEA 是最适合 Java 开发者的 IDE 。** 如果你没有用过的 IDEA 就随便评判两者的话，我建议你不妨挑出自己的舒适区，尝试着去使用一段时间。**如果你觉得 Eclipse 更适合你的话，我觉得也没忙病，萝卜白菜各有所爱，我们也要尊重别人的想法 💡。**

IDEA 是 JetBrains 在 2001 年发布的，主要用来支持 Java 编程，不过也支持 Kotlin（由 JetBrains 开发），Groovy，Clojure，Scala 等编程语言。

JetBrains 真的是很厉害的一家公司，这家公司推出的很多 IDE 基本都是工程师编程首选比如 PyCharm、WebStorm 等等。这家公司做出来的东西为什么好？我觉得主要就一个词总结：**智能** （ IntelliJ->intelligent)

![Intelligent Agents Lab](https://my-blog-to-use.oss-cn-beijing.aliyuncs.com/2020-8/cover.png)

下面 Guide 会简单对比一下它们，方便大家更好地去了解这个 IDE。

### 易用程度

#### IDEA 提供了更多人性化的功能

个人感觉 IDEA 更加易用，因为 IDEA 内置了太多人性的话的功能比如对 Git 功能的支持、代码检查等等。

如下图示，这个是 IDEA 自带的版本控制功能，非常好用，清晰地展示了提交记录，便于查阅别人的提交以及项目组进行 Code Review。

![版本控制](https://my-blog-to-use.oss-cn-beijing.aliyuncs.com/2020-8/0538df6c-4043-4894-8b75-9bee97fec64a.png)

#### IDEA 智能上下文提示

另外，**IDEA 比 Eclipse 更好的一点是它的智能代码提示，这个确实好用，而且还是根据你当前上下文来提示提示的（基于快速索引技术）。**

![](https://my-blog-to-use.oss-cn-beijing.aliyuncs.com/2020-8/8173c155-2b90-41c0-9f2d-76270262f06d.png)

#### 使用 IDEA 更加智能的进行重构

IDEA 对重构的支持更加友好以及安全，你可以更加方便地去进行重构比如使用快捷键提取方法、抽取变量等等。

下图对应地地址在这里：[https://www.jetbrains.com/help/idea/refactoring-source-code.html](https://www.jetbrains.com/help/idea/refactoring-source-code.html) 。

![](https://my-blog-to-use.oss-cn-beijing.aliyuncs.com/2020-8/bf928840-043e-4607-a0fe-f57133458fa0.png)

### 是否免费

IDEA 社区版和 Eclipse IDE 均可免费下载和使用，不过 IDEA 还提供了一个功能更多地称为 Ultimate Edition（最终版本）的版本，不过作为 Java 初学者来说 IntelliJ IDEA 社区版就完全够用了。

IDEA 的付费商业版本和免费版本的主要区别如下图所示，可以看出商业版的 IDEA 提供了更多功能的支持比如帮你找到你的项目中找到重复的代码块、提供数据库管理工具等等。

![](https://my-blog-to-use.oss-cn-beijing.aliyuncs.com/2020-8/81e432ec-79d0-465c-811f-7bf706eab6b7.png)

### 系统占用和内存管理

不得不承认， IDEA 的系统占用更大，平稳运行至少需要 4g 以上的闲置内存。而 Eclipse 只需要 1g 的内存就组足够平稳运行了（项目过大的情况可能需要更多地运行内存支持）。

另外，内存管理方面的话，Eclipse 做的也更好，之前我的电脑是 8 g 内存，不过，它足以流畅运行 Eclipse 。我现在的电脑是 16 g 内存，某些时候运行 IDEA 甚至会比较卡顿。

**如果你的电脑真的没办法支持 IDEA 运行的话，我的建议是：“你要换电脑了”。**

### 插件

相比于 Eclipse 来说，IDEA 里面有太多太多宝藏插件了，真的非常棒 👍！

> 最近我也在整理一些使用 IDEA 开发必备的插件，可能只需要 30s 就能收走你们的再看。下一篇文章我就会分享到，大家期待一波吧！

很多插件都会优先支持 IDEA，毕竟 IDEA 的使用占比率还是比较大的。

![](https://my-blog-to-use.oss-cn-beijing.aliyuncs.com/2020-8/1156a113-4370-4e8d-bd81-f95732a8cda6.png)

### 受欢迎程度

就现在来看，IDEA 的使用占比和受欢迎程度比 Eclipse 更高，并且大有远超之势。

下图是国外的一个网站的一个统计报告！

![](https://my-blog-to-use.oss-cn-beijing.aliyuncs.com/2020-8/b4639707-ad60-4aae-8ee8-35408939b413.png)

最后再分享一下国外一个网站关于 “ Java 编程最好的 IDE 是哪一个？”的数据，可以看出 IDEA 还是略胜一筹的。

![](https://my-blog-to-use.oss-cn-beijing.aliyuncs.com/2020-8/dfa0db1b-66c9-41bc-91ce-880094e6c9fc.png)
