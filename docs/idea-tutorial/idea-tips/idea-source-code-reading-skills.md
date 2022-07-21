# IDEA源码阅读技巧

项目有个新来了一个小伙伴，他看我查看项目源代码的时候，各种骚操作“花里胡哨”的。于是他向我请教，想让我分享一下我平时使用 IDEA 看源码的小技巧。

## 基本操作

这一部分的内容主要是一些我平时看源码的时候常用的快捷键/小技巧！非常好用！

掌握这些快捷键/小技巧，看源码的效率提升一个等级！

### 查看当前类的层次结构

| 使用频率 | 相关快捷键 |
| -------- | ---------- |
| ⭐⭐⭐⭐⭐    | `Ctrl + H` |

平时，我们阅读源码的时候，经常需要查看类的层次结构。就比如我们遇到抽象类或者接口的时候，经常需要查看其被哪些类实现。

拿 Spring 源码为例，`BeanDefinition` 是一个关于 Bean 属性/定义的接口。

```java
public interface BeanDefinition extends AttributeAccessor, BeanMetadataElement {
  ......
}
```

如果我们需要查看 `BeanDefinition` 被哪些类实现的话，只需要把鼠标移动到 `BeanDefinition` 类名上，然后使用快捷键 `Ctrl + H` 即可。

![](https://guide-blog-images.oss-cn-shenzhen.aliyuncs.com/idea/20210527135533686.png)

同理，如果你想查看接口 `BeanDefinition` 继承的接口 `AttributeAccessor` 被哪些类实现的话，只需要把鼠标移动到 `AttributeAccessor` 类名上，然后使用快捷键 `Ctrl + H` 即可。

### 查看类结构

| 使用频率 | 相关快捷键                            |
| -------- | ------------------------------------- |
| ⭐⭐⭐⭐     | `Alt + 7`(Win) / `Command +7` （Mac） |

类结构可以让我们快速了解到当前类的方法、变量/常量，非常使用！

我们在对应的类的任意位置使用快捷键 `Alt + 7`(Win) / `Command +7` （Mac）即可。

![](https://guide-blog-images.oss-cn-shenzhen.aliyuncs.com/idea/20210527135552183.png)

### 快速检索类

| 使用频率 | 相关快捷键                               |
| -------- | ---------------------------------------- |
| ⭐⭐⭐⭐⭐    | `Ctrl + N` (Win) / `Command + O` （Mac） |

使用快捷键 `Ctrl + N` (Win) / `Command + O` （Mac）可以快速检索类/文件。

![](https://guide-blog-images.oss-cn-shenzhen.aliyuncs.com/idea/20210527135629367.png)

### 关键字检索

| 使用频率 | 相关快捷键 |
| -------- | ---------- |
| ⭐⭐⭐⭐⭐    | 见下文     |

- 当前文件下检索 ： `Ctrl + F` (Win) / `Command + F` （Mac）
- 全局的文本检索 : `Ctrl + Shift + F` (Win) / `Command + Shift + F` （Mac）

### 查看方法/类的实现类

| 使用频率 | 相关快捷键                                         |
| -------- | -------------------------------------------------- |
| ⭐⭐⭐⭐     | `Ctrl + Alt + B` (Win) / `Command + Alt + B` (Mac) |

如果我们想直接跳转到某个方法/类的实现类，直接在方法名或者类名上使用快捷键 `Ctrl + Alt + B/鼠标左键` (Win) / `Command + Alt + B/鼠标左键` (Mac) 即可。

如果对应的方法/类只有一个实现类的话，会直接跳转到对应的实现类。

比如 `BeanDefinition` 接口的 `getBeanClassName()` 方法只被 `AbstractBeanDefinition` 抽象类实现，我们对这个方法使用快捷键就可以直接跳转到 `AbstractBeanDefinition` 抽象类中对应的实现方法。

```java
public interface BeanDefinition extends AttributeAccessor, BeanMetadataElement {
  @Nullable
	String getBeanClassName();
  ......
}
```

如果对应的方法/类有多个实现类的话，IDEA 会弹出一个选择框让你选择。

比如 `BeanDefinition` 接口的 `getParentName()` 方法就有多个不同的实现。

![](https://guide-blog-images.oss-cn-shenzhen.aliyuncs.com/idea/20210527135703164.png)

### 查看方法被使用的情况

| 使用频率 | 相关快捷键 |
| -------- | ---------- |
| ⭐⭐⭐⭐     | `Alt + F7` |

我们可以通过直接在方法名上使用快捷键 `Alt + F7` 来查看这个方法在哪些地方被调用过。

![](https://guide-blog-images.oss-cn-shenzhen.aliyuncs.com/idea/20210527135712962.png)

### 查看最近使用的文件

| 使用频率 | 相关快捷键                             |
| -------- | -------------------------------------- |
| ⭐⭐⭐⭐⭐    | `Ctrl + E`(Win) / `Command +E` （Mac） |

你可以通过快捷键 `Ctrl + E`(Win) / `Command +E` （Mac）来显示 IDEA 最近使用的一些文件。

![](https://guide-blog-images.oss-cn-shenzhen.aliyuncs.com/idea/20210527135733816.png)

### 查看图表形式的类继承链

| 使用频率 | 相关快捷键               |
| -------- | ------------------------ |
| ⭐⭐⭐⭐     | 相关快捷键较多，不建议记 |

点击类名 **右键** ，选择 **Shw Diagrams** 即可查看图表形式的类继承链。

![](https://guide-blog-images.oss-cn-shenzhen.aliyuncs.com/idea/20210527135745518.png)

你还可以对图表进行一些操作。比如，你可以点击图表中具体的类 **右键**，然后选择显示它的实现类或者父类。

![](https://guide-blog-images.oss-cn-shenzhen.aliyuncs.com/idea/20210527135757163.png)

再比如你还可以选择是否显示类中的属性、方法、内部类等等信息。

![](https://guide-blog-images.oss-cn-shenzhen.aliyuncs.com/idea/20210527135902827.png)

如果你想跳转到对应类的源码的话，直接点击图表中具体的类 **右键** ，然后选择 **Jump to Source** 。

![](https://guide-blog-images.oss-cn-shenzhen.aliyuncs.com/idea/20210527135807668.png)

## 插件推荐

### 一键生成方法的序列图

**序列图**（Sequence Diagram），亦称为**循序图**，是一种 UML 行为图。表示系统执行某个方法/操作（如登录操作）时，对象之间的顺序调用关系。

这个顺序调用关系可以这样理解：你需要执行系统中某个对象 a 提供的方法/操作 login（登录），但是这个对象又依赖了对象 b 提供的方法 getUser(获取用户)。因此，这里就有了 a -> b 调用关系之说。

我们可以通过 **SequenceDiagram** 这个插件一键生成方法的序列图。

> 如果你因为网络问题没办法使用 IDEA 自带的插件市场的话，也可以通过 IDEA 插件市场的官网手动下载安装。

![](https://guide-blog-images.oss-cn-shenzhen.aliyuncs.com/idea/2021052218304014.png)

**如何使用呢？**

1、选中方法名（注意不要选类名），然后点击鼠标右键，选择 **Sequence Diagram** 选项即可！

![](https://guide-blog-images.oss-cn-shenzhen.aliyuncs.com/idea/20201021170110697.png)

2、配置生成的序列图的一些基本的参数比如调用深度之后，我们点击 ok 即可！

![](https://guide-blog-images.oss-cn-shenzhen.aliyuncs.com/idea/c5040f1105c762ddf8689892913bc02d.png)

3、你还可以通过生成的时序图来定位到相关的代码，这对于我们阅读源码的时候尤其有帮助！

![](https://guide-blog-images.oss-cn-shenzhen.aliyuncs.com/idea/20201021171623809.png)

4、时序图生成完成之后，你还可以选择将其导出为图片。

![](https://guide-blog-images.oss-cn-shenzhen.aliyuncs.com/idea/20201021170228723.png)

相关阅读：[《安利一个 IDEA 骚操作:一键生成方法的序列图》](https://mp.weixin.qq.com/s/SG1twZczqdup_EQAOmNERg) 。

### 项目代码统计

为了快速分析项目情况，我们可以对项目的 **代码的总行数、单个文件的代码行数、注释行数等信息进行统计。**

**Statistic** 这个插件来帮助我们实现这一需求。

![](https://guide-blog-images.oss-cn-shenzhen.aliyuncs.com/idea/20210522183550110.png)

有了这个插件之后你可以非常直观地看到你的项目中所有类型的文件的信息比如数量、大小等等，可以帮助你更好地了解你们的项目。

![](https://guide-blog-images.oss-cn-shenzhen.aliyuncs.com/idea/20210522183616310.png)

你还可以使用它看所有类的总行数、有效代码行数、注释行数、以及有效代码比重等等这些东西。

![](https://guide-blog-images.oss-cn-shenzhen.aliyuncs.com/idea/20210522183630459.png)

如果，你担心插件过多影响 IDEA 速度的话，可以只在有代码统计需求的时候开启这个插件，其他时间禁用它就完事了！

相关阅读：[快速识别烂项目！试试这款项目代码统计 IDEA 插件](https://mp.weixin.qq.com/s/fVEeMW6elhu79I-rTZB40A)





