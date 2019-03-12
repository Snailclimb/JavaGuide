Java面试通关手册（Java学习指南）github地址（欢迎star和pull）：[https://github.com/Snailclimb/Java_Guide](https://github.com/Snailclimb/Java_Guide)



下面是按jvm虚拟机知识点分章节总结的一些jvm学习与面试相关的一些东西。一般作为Java程序员在面试的时候一般会问的大多就是**Java内存区域、虚拟机垃圾算法、虚拟垃圾收集器、JVM内存管理**这些问题了。这些内容参考周的《深入理解Java虚拟机》中第二章和第三章就足够了对应下面的[深入理解虚拟机之Java内存区域：](https://link.zhihu.com/?target=https%3A//mp.weixin.qq.com/s%3F__biz%3DMzU4NDQ4MzU5OA%3D%3D%26mid%3D2247483910%26idx%3D1%26sn%3D246f39051a85fc312577499691fba89f%26chksm%3Dfd985467caefdd71f9a7c275952be34484b14f9e092723c19bd4ef557c324169ed084f868bdb%23rd)和[深入理解虚拟机之垃圾回收](https://link.zhihu.com/?target=https%3A//mp.weixin.qq.com/s%3F__biz%3DMzU4NDQ4MzU5OA%3D%3D%26mid%3D2247483914%26idx%3D1%26sn%3D9aa157d4a1570962c39783cdeec7e539%26chksm%3Dfd98546bcaefdd7d9f61cd356e5584e56b64e234c3a403ed93cb6d4dde07a505e3000fd0c427%23rd)这两篇文章。


> ### 常见面试题

[深入理解虚拟机之Java内存区域：](https://link.zhihu.com/?target=https%3A//mp.weixin.qq.com/s%3F__biz%3DMzU4NDQ4MzU5OA%3D%3D%26mid%3D2247483910%26idx%3D1%26sn%3D246f39051a85fc312577499691fba89f%26chksm%3Dfd985467caefdd71f9a7c275952be34484b14f9e092723c19bd4ef557c324169ed084f868bdb%23rd)

1. 介绍下Java内存区域（运行时数据区）。

2. 对象的访问定位的两种方式。


[深入理解虚拟机之垃圾回收](https://link.zhihu.com/?target=https%3A//mp.weixin.qq.com/s%3F__biz%3DMzU4NDQ4MzU5OA%3D%3D%26mid%3D2247483914%26idx%3D1%26sn%3D9aa157d4a1570962c39783cdeec7e539%26chksm%3Dfd98546bcaefdd7d9f61cd356e5584e56b64e234c3a403ed93cb6d4dde07a505e3000fd0c427%23rd)

1. 如何判断对象是否死亡（两种方法）。

2. 简单的介绍一下强引用、软引用、弱引用、虚引用（虚引用与软引用和弱引用的区别、使用软引用能带来的好处）。

3. 垃圾收集有哪些算法，各自的特点？

4. HotSpot为什么要分为新生代和老年代？

5. 常见的垃圾回收器有那些？

6. 介绍一下CMS,G1收集器。

7. Minor Gc和Full GC 有什么不同呢？



[虚拟机性能监控和故障处理工具](https://link.zhihu.com/?target=https%3A//mp.weixin.qq.com/s%3F__biz%3DMzU4NDQ4MzU5OA%3D%3D%26mid%3D2247483922%26idx%3D1%26sn%3D0695ff4c2700ccebb8fbc39011866bd8%26chksm%3Dfd985473caefdd6583eb42dbbc7f01918dc6827c808292bb74a5b6333e3d526c097c9351e694%23rd)

1. JVM调优的常见命令行工具有哪些？

[深入理解虚拟机之类文件结构](https://link.zhihu.com/?target=https%3A//mp.weixin.qq.com/s%3F__biz%3DMzU4NDQ4MzU5OA%3D%3D%26mid%3D2247483926%26idx%3D1%26sn%3D224413da998f7e024f7b8d87397934d9%26chksm%3Dfd985477caefdd61a2fe1a3f0be29e057082252e579332f5b6d9072a150b838cefe2c47b6e5a%23rd)

1. 简单介绍一下Class类文件结构（常量池主要存放的是那两大常量？Class文件的继承关系是如何确定的？字段表、方法表、属性表主要包含那些信息？）

[深入理解虚拟机之虚拟机类加载机制](http://mp.weixin.qq.com/s?__biz=MzU4NDQ4MzU5OA==&mid=2247483934&idx=1&sn=f247f9bee4e240f5e7fac25659da3bff&chksm=fd98547fcaefdd6996e1a7046e03f29df9308bdf82ceeffd111112766ffd3187892700f64b40#rd)

1. 简单说说类加载过程，里面执行了哪些操作？

2. 对类加载器有了解吗？

3. 什么是双亲委派模型？

4. 双亲委派模型的工作过程以及使用它的好处。





> ### 推荐阅读

[深入理解虚拟机之虚拟机字节码执行引擎](https://juejin.im/post/5aebcb076fb9a07a9a10b5f3)

[《深入理解 Java 内存模型》读书笔记](http://www.54tianzhisheng.cn/2018/02/28/Java-Memory-Model/) （非常不错的文章）

[全面理解Java内存模型(JMM)及volatile关键字 ](https://blog.csdn.net/javazejian/article/details/72772461)

**欢迎关注我的微信公众号:"Java面试通关手册"（一个有温度的微信公众号，期待与你共同进步~~~坚持原创，分享美文，分享各种Java学习资源）：**

![微信公众号](https://user-gold-cdn.xitu.io/2018/3/19/1623c870135a3609?w=215&h=215&f=jpeg&s=29172)
