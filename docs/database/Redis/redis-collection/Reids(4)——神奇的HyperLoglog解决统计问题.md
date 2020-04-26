> 授权转载自： https://github.com/wmyskxz/MoreThanJava#part3-redis

![](https://upload-images.jianshu.io/upload_images/7896890-a408d790b0b4f4b9.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

# 一、HyperLogLog 简介

**HyperLogLog** 是最早由 [Flajolet](http://algo.inria.fr/flajolet/Publications/FlFuGaMe07.pdf) 及其同事在 2007 年提出的一种 **估算基数的近似最优算法**。但跟原版论文不同的是，好像很多书包括 Redis 作者都把它称为一种 **新的数据结构(new datastruct)** *(算法实现确实需要一种特定的数据结构来实现)*。

![](http://wx2.sinaimg.cn/large/006oOWahly1fpsc3t7fnng30ab05tkjl.gif)

## 关于基数统计

**基数统计(Cardinality Counting)** 通常是用来统计一个集合中不重复的元素个数。

**思考这样的一个场景：** 如果你负责开发维护一个大型的网站，有一天老板找产品经理要网站上每个网页的 **UV(独立访客，每个用户每天只记录一次)**，然后让你来开发这个统计模块，你会如何实现？

![](https://upload-images.jianshu.io/upload_images/7896890-a9dbcf6374d482ba.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)


如果统计 **PV(浏览量，用户没点一次记录一次)**，那非常好办，给每个页面配置一个独立的 Redis 计数器就可以了，把这个计数器的 key 后缀加上当天的日期。这样每来一个请求，就执行 `INCRBY` 指令一次，最终就可以统计出所有的 **PV** 数据了。

但是 **UV** 不同，它要去重，**同一个用户一天之内的多次访问请求只能计数一次**。这就要求了每一个网页请求都需要带上用户的 ID，无论是登录用户还是未登录的用户，都需要一个唯一 ID 来标识。

你也许马上就想到了一个 *简单的解决方案*：那就是 **为每一个页面设置一个独立的 set 集合** 来存储所有当天访问过此页面的用户 ID。但这样的 **问题** 就是：

1. **存储空间巨大：** 如果网站访问量一大，你需要用来存储的 set 集合就会非常大，如果页面再一多.. 为了一个去重功能耗费的资源就可以直接让你 **老板打死你**；
2. **统计复杂：** 这么多 set 集合如果要聚合统计一下，又是一个复杂的事情；

![](https://upload-images.jianshu.io/upload_images/7896890-b8ddfcd39cb46cb5.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)


## 基数统计的常用方法

对于上述这样需要 **基数统计** 的事情，通常来说有两种比 set 集合更好的解决方案：

### 第一种：B 树

**B 树最大的优势就是插入和查找效率很高**，如果用 B 树存储要统计的数据，可以快速判断新来的数据是否存在，并快速将元素插入 B 树。要计算基础值，只需要计算 B 树的节点个数就行了。

不过将 B 树结构维护到内存中，能够解决统计和计算的问题，但是 **并没有节省内存**。

### 第二种：bitmap

**bitmap** 可以理解为通过一个 bit 数组来存储特定数据的一种数据结构，**每一个 bit 位都能独立包含信息**，bit 是数据的最小存储单位，因此能大量节省空间，也可以将整个 bit 数据一次性 load 到内存计算。如果定义一个很大的 bit 数组，基础统计中 **每一个元素对应到 bit 数组中的一位**，例如：

![](https://upload-images.jianshu.io/upload_images/7896890-fb4283ad7dbd89a2.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

bitmap 还有一个明显的优势是 **可以轻松合并多个统计结果**，只需要对多个结果求异或就可以了，也可以大大减少存储内存。可以简单做一个计算，如果要统计 **1 亿** 个数据的基数值，**大约需要的内存**：`100_000_000/ 8/ 1024/ 1024 ≈ 12 M`，如果用 **32 bit** 的 int 代表 **每一个** 统计的数据，**大约需要内存**：`32 * 100_000_000/ 8/ 1024/ 1024 ≈ 381 M`

可以看到 bitmap 对于内存的节省显而易见，但仍然不够。统计一个对象的基数值就需要 `12 M`，如果统计 1 万个对象，就需要接近 `120 G`，对于大数据的场景仍然不适用。

![](https://upload-images.jianshu.io/upload_images/7896890-1ebb3265b4297fa1.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

## 概率算法

实际上目前还没有发现更好的在 **大数据场景** 中 **准确计算** 基数的高效算法，因此在不追求绝对精确的情况下，使用概率算法算是一个不错的解决方案。

概率算法 **不直接存储** 数据集合本身，通过一定的 **概率统计方法预估基数值**，这种方法可以大大节省内存，同时保证误差控制在一定范围内。目前用于基数计数的概率算法包括:

- **Linear Counting(LC)**：早期的基数估计算法，LC 在空间复杂度方面并不算优秀，实际上 LC 的空间复杂度与上文中简单 bitmap 方法是一样的（但是有个常数项级别的降低），都是 O(N<sub>max</sub>)
- **LogLog Counting(LLC)**：LogLog Counting 相比于 LC 更加节省内存，空间复杂度只有 O(log<sub>2</sub>(log<sub>2</sub>(N<sub>max</sub>)))
- **HyperLogLog Counting(HLL)**：HyperLogLog Counting 是基于 LLC 的优化和改进，在同样空间复杂度情况下，能够比 LLC 的基数估计误差更小

其中，**HyperLogLog** 的表现是惊人的，上面我们简单计算过用 **bitmap** 存储 **1 个亿** 统计数据大概需要 `12 M` 内存，而在 **HyperLoglog** 中，只需要不到 **1 K** 内存就能够做到！在 Redis 中实现的 **HyperLoglog** 也只需要 **12 K** 内存，在 **标准误差 0.81%** 的前提下，**能够统计 2<sup>64</sup> 个数据**！

![](https://upload-images.jianshu.io/upload_images/7896890-439fe643e2dc081a.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

**这是怎么做到的？！** 下面赶紧来了解一下！

# 二、HyperLogLog 原理

我们来思考一个抛硬币的游戏：你连续掷 n 次硬币，然后说出其中**连续掷为正面的最大次数，我来猜你一共抛了多少次**。

这很容易理解吧，例如：你说你这一次 *最多连续出现了 2 次* 正面，那么我就可以知道你这一次投掷的次数并不多，所以 *我可能会猜是 5* 或者是其他小一些的数字，但如果你说你这一次 *最多连续出现了 20 次* 正面，虽然我觉得不可能，但我仍然知道你花了特别多的时间，所以 *我说 GUN...*。

![](https://upload-images.jianshu.io/upload_images/7896890-2042926c4383c027.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)


这期间我可能会要求你重复实验，然后我得到了更多的数据之后就会估计得更准。**我们来把刚才的游戏换一种说法**：

![](https://upload-images.jianshu.io/upload_images/7896890-24e8f48f5e3eb81f.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

这张图的意思是，我们给定一系列的随机整数，**记录下低位连续零位的最大长度 K**，即为图中的 `maxbit`，**通过这个 K 值我们就可以估算出随机数的数量 N**。

## 代码实验

我们可以简单编写代码做一个实验，来探究一下 `K` 和 `N` 之间的关系：

```java
public class PfTest {

    static class BitKeeper {

        private int maxbit;

        public void random() {
            long value = ThreadLocalRandom.current().nextLong(2L << 32);
            int bit = lowZeros(value);
            if (bit > this.maxbit) {
                this.maxbit = bit;
            }
        }

        private int lowZeros(long value) {
            int i = 0;
            for (; i < 32; i++) {
                if (value >> i << i != value) {
                    break;
                }
            }
            return i - 1;
        }
    }

    static class Experiment {

        private int n;
        private BitKeeper keeper;

        public Experiment(int n) {
            this.n = n;
            this.keeper = new BitKeeper();
        }

        public void work() {
            for (int i = 0; i < n; i++) {
                this.keeper.random();
            }
        }

        public void debug() {
            System.out
                .printf("%d %.2f %d\n", this.n, Math.log(this.n) / Math.log(2), this.keeper.maxbit);
        }
    }

    public static void main(String[] args) {
        for (int i = 1000; i < 100000; i += 100) {
            Experiment exp = new Experiment(i);
            exp.work();
            exp.debug();
        }
    }
}
```

跟上图中的过程是一致的，话说为啥叫 `PfTest` 呢，包括 Redis 中的命令也一样带有一个 `PF` 前缀，还记得嘛，因为 **HyperLogLog** 的提出者上文提到过的，叫 `Philippe Flajolet`。

截取部分输出查看：

```java
//n   n/log2 maxbit
34000 15.05 13
35000 15.10 13
36000 15.14 16
37000 15.18 17
38000 15.21 14
39000 15.25 16
40000 15.29 14
41000 15.32 16
42000 15.36 18
```

会发现 `K` 和 `N` 的对数之间存在显著的线性相关性：**N 约等于 2<sup>k</sup>**

## 更近一步：分桶平均

**如果 `N` 介于 2<sup>k</sup> 和 2<sup>k+1</sup> 之间，用这种方式估计的值都等于 2<sup>k</sup>，这明显是不合理的**，所以我们可以使用多个 `BitKeeper` 进行加权估计，就可以得到一个比较准确的值了：

```java
public class PfTest {

    static class BitKeeper {
        // 无变化, 代码省略
    }

    static class Experiment {

        private int n;
        private int k;
        private BitKeeper[] keepers;

        public Experiment(int n) {
            this(n, 1024);
        }

        public Experiment(int n, int k) {
            this.n = n;
            this.k = k;
            this.keepers = new BitKeeper[k];
            for (int i = 0; i < k; i++) {
                this.keepers[i] = new BitKeeper();
            }
        }

        public void work() {
            for (int i = 0; i < this.n; i++) {
                long m = ThreadLocalRandom.current().nextLong(1L << 32);
                BitKeeper keeper = keepers[(int) (((m & 0xfff0000) >> 16) % keepers.length)];
                keeper.random();
            }
        }

        public double estimate() {
            double sumbitsInverse = 0.0;
            for (BitKeeper keeper : keepers) {
                sumbitsInverse += 1.0 / (float) keeper.maxbit;
            }
            double avgBits = (float) keepers.length / sumbitsInverse;
            return Math.pow(2, avgBits) * this.k;
        }
    }

    public static void main(String[] args) {
        for (int i = 100000; i < 1000000; i += 100000) {
            Experiment exp = new Experiment(i);
            exp.work();
            double est = exp.estimate();
            System.out.printf("%d %.2f %.2f\n", i, est, Math.abs(est - i) / i);
        }
    }
}
```

这个过程有点 **类似于选秀节目里面的打分**，一堆专业评委打分，但是有一些评委因为自己特别喜欢所以给高了，一些评委又打低了，所以一般都要 **屏蔽最高分和最低分**，然后 **再计算平均值**，这样的出来的分数就差不多是公平公正的了。

![](https://upload-images.jianshu.io/upload_images/7896890-6c927d25750f20d1.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

上述代码就有 **1024** 个 "评委"，并且在计算平均值的时候，采用了 **调和平均数**，也就是倒数的平均值，它能有效地平滑离群值的影响：

```java
avg = (3 + 4 + 5 + 104) / 4 = 29
avg = 4 / (1/3 + 1/4 + 1/5 + 1/104) = 5.044
```

观察脚本的输出，误差率百分比控制在个位数：

```java
100000 94274.94 0.06
200000 194092.62 0.03
300000 277329.92 0.08
400000 373281.66 0.07
500000 501551.60 0.00
600000 596078.40 0.01
700000 687265.72 0.02
800000 828778.96 0.04
900000 944683.53 0.05
```

真实的 HyperLogLog 要比上面的示例代码更加复杂一些，也更加精确一些。上面这个算法在随机次数很少的情况下会出现除零错误，因为 `maxbit = 0` 是不可以求倒数的。

## 真实的 HyperLogLog

有一个神奇的网站，可以动态地让你观察到 HyperLogLog 的算法到底是怎么执行的：[http://content.research.neustar.biz/blog/hll.html](http://content.research.neustar.biz/blog/hll.html)

![](https://upload-images.jianshu.io/upload_images/7896890-72f00a9983a1395e.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

其中的一些概念这里稍微解释一下，您就可以自行去点击 `step` 来观察了：

- **m 表示分桶个数：** 从图中可以看到，这里分成了 64 个桶；
- **蓝色的 bit 表示在桶中的位置：** 例如图中的 `101110` 实则表示二进制的 `46`，所以该元素被统计在中间大表格 `Register Values` 中标红的第 46 个桶之中；
- **绿色的 bit 表示第一个 1 出现的位置**： 从图中可以看到标绿的 bit 中，从右往左数，第一位就是 1，所以在 `Register Values` 第 46 个桶中写入 1；
- **红色 bit 表示绿色 bit 的值的累加：** 下一个出现在第 46 个桶的元素值会被累加；


### 为什么要统计 Hash 值中第一个 1 出现的位置？

因为第一个 1 出现的位置可以同我们抛硬币的游戏中第一次抛到正面的抛掷次数对应起来，根据上面掷硬币实验的结论，记录每个数据的第一个出现的位置 `K`，就可以通过其中最大值 K<sub>max</sub> 来推导出数据集合中的基数：**N = 2<sup>K<sub>max</sub></sup>**

### PF 的内存占用为什么是 12 KB？

我们上面的算法中使用了 **1024** 个桶，网站演示也只有 **64** 个桶，不过在 Redis 的 HyperLogLog 实现中，用的是 **16384** 个桶，即：2<sup>14</sup>，也就是说，就像上面网站中间那个 `Register Values` 大表格有 **16384** 格。

**而Redis 最大能够统计的数据量是 2<sup>64</sup>**，即每个桶的 `maxbit` 需要 **6** 个 bit 来存储，最大可以表示 `maxbit = 63`，于是总共占用内存就是：**(2<sup>14</sup>) x 6 / 8** *(每个桶 6 bit，而这么多桶本身要占用 16384 bit，再除以 8 转换成 KB)*,算出来的结果就是 `12 KB`。

# 三、Redis 中的 HyperLogLog 实现

从上面我们算是对 **HyperLogLog** 的算法和思想有了一定的了解，并且知道了一个 **HyperLogLog** 实际占用的空间大约是 `12 KB`，但 Redis 对于内存的优化非常变态，当 **计数比较小** 的时候，大多数桶的计数值都是 **零**，这个时候 Redis 就会适当节约空间，转换成另外一种 **稀疏存储方式**，与之相对的，正常的存储模式叫做 **密集存储**，这种方式会恒定地占用 `12 KB`。

## 密集型存储结构

密集型的存储结构非常简单，就是 **16384 个 6 bit 连续串成** 的字符串位图：

![](https://upload-images.jianshu.io/upload_images/7896890-0ba2adb0214afd0c.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

我们都知道，一个字节是由 8 个 bit 组成的，这样 6 bit 排列的结构就会导致，有一些桶会 **跨越字节边界**，我们需要 **对这一个或者两个字节进行适当的移位拼接** 才可以得到具体的计数值。

假设桶的编号为 `index`，这个 6 bity 计数值的起始字节偏移用 `offset_bytes` 表示，它在这个字节的其实比特位置偏移用 `offset_bits` 表示，于是我们有：

```python
offset_bytes = (index * 6) / 8
offset_bits = (index * 6) % 8
```

前者是商，后者是余数。比如 `bucket 2` 的字节偏移是 1，也就是第 2 个字节。它的位偏移是 4，也就是第 2 个字节的第 5 个位开始是 bucket 2 的计数值。需要注意的是 **字节位序是左边低位右边高位**，而通常我们使用的字节都是左边高位右边低位。

这里就涉及到两种情况，**如果 `offset_bits` 小于等于 2**，说明这 **6 bit 在一个字节的内部**，可以直接使用下面的表达式得到计数值 `val`：

```python
val = buffer[offset_bytes] >> offset_bits  # 向右移位
```

**如果 `offset_bits` 大于 2**，那么就会涉及到 **跨越字节边界**，我们需要拼接两个字节的位片段：

```python
# 低位值
low_val = buffer[offset_bytes] >> offset_bits
# 低位个数
low_bits = 8 - offset_bits
# 拼接，保留低6位
val = (high_val << low_bits | low_val) & 0b111111
```

不过下面 Redis 的源码要晦涩一点，看形式它似乎只考虑了跨越字节边界的情况。这是因为如果 6 bit 在单个字节内，上面代码中的 `high_val` 的值是零，所以这一份代码可以同时照顾单字节和双字节：

```c
// 获取指定桶的计数值
#define HLL_DENSE_GET_REGISTER(target,p,regnum) do { \
    uint8_t *_p = (uint8_t*) p; \
    unsigned long _byte = regnum*HLL_BITS/8; \ 
    unsigned long _fb = regnum*HLL_BITS&7; \  # %8 = &7
    unsigned long _fb8 = 8 - _fb; \
    unsigned long b0 = _p[_byte]; \
    unsigned long b1 = _p[_byte+1]; \
    target = ((b0 >> _fb) | (b1 << _fb8)) & HLL_REGISTER_MAX; \
} while(0)

// 设置指定桶的计数值
#define HLL_DENSE_SET_REGISTER(p,regnum,val) do { \
    uint8_t *_p = (uint8_t*) p; \
    unsigned long _byte = regnum*HLL_BITS/8; \
    unsigned long _fb = regnum*HLL_BITS&7; \
    unsigned long _fb8 = 8 - _fb; \
    unsigned long _v = val; \
    _p[_byte] &= ~(HLL_REGISTER_MAX << _fb); \
    _p[_byte] |= _v << _fb; \
    _p[_byte+1] &= ~(HLL_REGISTER_MAX >> _fb8); \
    _p[_byte+1] |= _v >> _fb8; \
} while(0)
```

## 稀疏存储结构

稀疏存储适用于很多计数值都是零的情况。下图表示了一般稀疏存储计数值的状态：

![](https://upload-images.jianshu.io/upload_images/7896890-9d5a9018d2eedbd8.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

当 **多个连续桶的计数值都是零** 时，Redis 提供了几种不同的表达形式：

- `00xxxxxx`：前缀两个零表示接下来的 6bit 整数值加 1 就是零值计数器的数量，注意这里要加 1 是因为数量如果为零是没有意义的。比如 `00010101` 表示连续 `22` 个零值计数器。
- `01xxxxxx yyyyyyyy`：6bit 最多只能表示连续 `64` 个零值计数器，这样扩展出的  14bit 可以表示最多连续 `16384` 个零值计数器。这意味着 HyperLogLog 数据结构中 `16384` 个桶的初始状态，所有的计数器都是零值，可以直接使用 2 个字节来表示。
- `1vvvvvxx`：中间 5bit 表示计数值，尾部 2bit 表示连续几个桶。它的意思是连续 `(xx +1)` 个计数值都是 `(vvvvv + 1)`。比如 `10101011` 表示连续 `4` 个计数值都是 `11`。

注意 *上面第三种方式* 的计数值最大只能表示到 `32`，而 HyperLogLog 的密集存储单个计数值用 6bit 表示，最大可以表示到 `63`。**当稀疏存储的某个计数值需要调整到大于 `32` 时，Redis 就会立即转换 HyperLogLog 的存储结构，将稀疏存储转换成密集存储。**

## 对象头

HyperLogLog 除了需要存储 16384 个桶的计数值之外，它还有一些附加的字段需要存储，比如总计数缓存、存储类型。所以它使用了一个额外的对象头来表示：

```c
struct hllhdr {
    char magic[4];      /* 魔术字符串"HYLL" */
    uint8_t encoding;   /* 存储类型 HLL_DENSE or HLL_SPARSE. */
    uint8_t notused[3]; /* 保留三个字节未来可能会使用 */
    uint8_t card[8];    /* 总计数缓存 */
    uint8_t registers[]; /* 所有桶的计数器 */
};
```

所以 **HyperLogLog** 整体的内部结构就是 **HLL 对象头** 加上 **16384** 个桶的计数值位图。它在 Redis 的内部结构表现就是一个字符串位图。你可以把 **HyperLogLog 对象当成普通的字符串来进行处理：**

```console
> PFADD codehole python java golang
(integer) 1
> GET codehole
"HYLL\x01\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x80C\x03\x84MK\x80P\xb8\x80^\xf3"
```

但是 **不可以** 使用 **HyperLogLog** 指令来 **操纵普通的字符串**，**因为它需要检查对象头魔术字符串是否是 "HYLL"**。

# 四、HyperLogLog 的使用

**HyperLogLog** 提供了两个指令 `PFADD` 和 `PFCOUNT`，字面意思就是一个是增加，另一个是获取计数。`PFADD` 和 `set` 集合的 `SADD` 的用法是一样的，来一个用户 ID，就将用户 ID 塞进去就是，`PFCOUNT` 和 `SCARD` 的用法是一致的，直接获取计数值：

```console
> PFADD codehole user1
(interger) 1
> PFCOUNT codehole
(integer) 1
> PFADD codehole user2
(integer) 1
> PFCOUNT codehole
(integer) 2
> PFADD codehole user3
(integer) 1
> PFCOUNT codehole
(integer) 3
> PFADD codehole user4 user 5
(integer) 1
> PFCOUNT codehole
(integer) 5
```

我们可以用 Java 编写一个脚本来试试 HyperLogLog 的准确性到底有多少：

```java
public class JedisTest {
  public static void main(String[] args) {
    for (int i = 0; i < 100000; i++) {
      jedis.pfadd("codehole", "user" + i);
    }
    long total = jedis.pfcount("codehole");
    System.out.printf("%d %d\n", 100000, total);
    jedis.close();
  }
}
```

结果输出如下：

```java
100000 99723
```

发现 `10` 万条数据只差了 `277`，按照百分比误差率是 `0.277%`，对于巨量的 UV 需求来说，这个误差率真的不算高。

当然，除了上面的 `PFADD` 和 `PFCOUNT` 之外，还提供了第三个 `PFMEGER` 指令，用于将多个计数值累加在一起形成一个新的 `pf` 值：

```console
> PFADD  nosql  "Redis"  "MongoDB"  "Memcached"
(integer) 1

> PFADD  RDBMS  "MySQL" "MSSQL" "PostgreSQL"
(integer) 1

> PFMERGE  databases  nosql  RDBMS
OK

> PFCOUNT  databases
(integer) 6
```

# 相关阅读

1. Redis(1)——5种基本数据结构 - [https://www.wmyskxz.com/2020/02/28/redis-1-5-chong-ji-ben-shu-ju-jie-gou/](https://www.wmyskxz.com/2020/02/28/redis-1-5-chong-ji-ben-shu-ju-jie-gou/)
2. Redis(2)——跳跃表 - [https://www.wmyskxz.com/2020/02/29/redis-2-tiao-yue-biao/](https://www.wmyskxz.com/2020/02/29/redis-2-tiao-yue-biao/)
3. Redis(3)——分布式锁深入探究 - [https://www.wmyskxz.com/2020/03/01/redis-3/](https://www.wmyskxz.com/2020/03/01/redis-3/)

# 扩展阅读

1. 【算法原文】HyperLogLog: the analysis of a near-optimal
cardinality estimation algorithm - [http://algo.inria.fr/flajolet/Publications/FlFuGaMe07.pdf](http://algo.inria.fr/flajolet/Publications/FlFuGaMe07.pdf)

# 参考资料

1. 【Redis 作者博客】Redis new data structure: the HyperLogLog - [http://antirez.com/news/75](http://antirez.com/news/75)
2. 神奇的HyperLogLog算法 - [http://www.rainybowe.com/blog/2017/07/13/%E7%A5%9E%E5%A5%87%E7%9A%84HyperLogLog%E7%AE%97%E6%B3%95/index.html](http://www.rainybowe.com/blog/2017/07/13/%E7%A5%9E%E5%A5%87%E7%9A%84HyperLogLog%E7%AE%97%E6%B3%95/index.html)
3. 深度探索 Redis HyperLogLog 内部数据结构 - [https://zhuanlan.zhihu.com/p/43426875](https://zhuanlan.zhihu.com/p/43426875)
4. 《Redis 深度历险》 - 钱文品/ 著


> - 本文已收录至我的 Github 程序员成长系列 **【More Than Java】，学习，不止 Code，欢迎 star：[https://github.com/wmyskxz/MoreThanJava](https://github.com/wmyskxz/MoreThanJava)**
> - **个人公众号** ：wmyskxz，**个人独立域名博客**：wmyskxz.com，坚持原创输出，下方扫码关注，2020，与您共同成长！

![](https://upload-images.jianshu.io/upload_images/7896890-fca34cfd601e7449.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

非常感谢各位人才能 **看到这里**，如果觉得本篇文章写得不错，觉得 **「我没有三颗心脏」有点东西** 的话，**求点赞，求关注，求分享，求留言！**

创作不易，各位的支持和认可，就是我创作的最大动力，我们下篇文章见！