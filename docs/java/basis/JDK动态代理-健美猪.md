最近在整理关于AOP的资料，发现绕不开代理（Proxy）这个概念，所以还是先梳理下这块的知识点，为以后做做铺垫，全文很长，改了很多版才敢发出来，约7000字，概念也比较多，可以先收藏慢慢看，毕竟不管多难的文章，**收藏=我会了**：


**但如果真看懂了，就来个赞吧，创作不易就想来点鼓励**。
<a name="n9Pff"></a>
## 什么是代理Proxy
代理我理解是一种**代码增强**，即在原先的方法逻辑上加上额外操作，在方法执行之前和之后加点通用逻辑，方便实现和维护，代理粗略可以分为静态代理和动态代理，本文的重点是后者，至于为什么要这么写，恐怕大部分人都是一知半解，所以本文的重点是解析JDK动态代码写法背后的过程和实现逻辑，但纯文字谁要看，所以文章里画了不少流程图希望能帮助你看懂。**
<a name="yRLx7"></a>
## 静态代理
先说下静态代理，比较简单，我通过一个例子简单讲下，比如有一个业务：**炜哥要去银行存钱10000块钱**，那么可以这样做：
定义一个 `SaveMoney` 的接口，需要实现的方法是**存钱**
```java
/**
 * 去银行存钱
 *
 * @author 炜哥
 */
public interface SaveMoney {

    /**
     * 去银行存钱
     */
    public void saveMoney();
}
```
然后有个具体实现类 `SaveMoneyToBankImpl` ：**谁存钱，存了多少钱**
```java
/**
 * 存钱实现
 * 谁存钱，存了多少钱
 *
 * @author
 */
public class SaveMoneyToBankImpl implements SaveMoney {

    private String peopleName;

    private int money;

    public SaveMoneyToBankImpl(String peopleName,int money) {
        this.peopleName = peopleName;
        this.money = money;
    }

    /**
     * 具体实现存钱
     */
    public void saveMoney() {
        System.out.println(peopleName + "在银行存了" + money + "元");
    }
}
```
平常代码（存钱）到这里就结束了，不过假设业务流程需要调整：

- 需要加一个校验（即存的钱是不是真的）
- 实现类不能动（来存钱的人不会自己验钞）

你肯定会想到在**实现类**的 `saveMoney()` 中前后增加一些操作：
```java
/**
 * 具体实现存钱
 */
public void saveMoney() {
    System.out.println("工作人员开始验钞...");
    System.out.println("验钞通过...");
    System.out.println(peopleName + "在银行存了" + money + "元");
    System.out.println("存钱完毕...");
}
```
这样做可以吗？**当然可以**，逻辑都实现了有啥不可以，但这时候**普通程序员**和**架构师**的区别就体现出来了：
> **普通程序员**：什么？加点额外操作，加！直接在原逻辑上开搞
> **架构师**：这个额外操作看着有点普遍，会不会其他地方也需要？如果其他代码也需要难道都一个个手动加么，能不能给原逻辑某个执行点前后自动加上所需操作，从而解放（拯救）我们码农的双手（头发）？

![image.png](https://cdn.nlark.com/yuque/0/2021/png/12928968/1620378296918-b8eeb9fd-37f6-41be-aefc-5297cba56b57.png)
**能不能另外弄一个代理程序，包含原程序需要执行的方法和额外操作，到时候只要执行下这个对象的方法不就行了么**，先不管通用不通用了，看看能不能把有这种功能的代理程序弄出来，既然思路有了就开搞：
为存钱这个动作做一个代理（**有一个银行工作人员帮你验钞**），即定义一个银行工作人员的代理类 `SaveMoneyByWokerProxy` ，构造函数的入参是实际对象（也就是XX要存XX钱的一个对象）
```java
/**
 * 存钱代理，银行柜员代理存钱
 *
 * @author 炜哥
 * @since 2021-04-15 21:56:39
 */
public class SaveMoneyByWokerProxy implements SaveMoney {

    //代理对象
    SaveMoney saveMoneyProxy;

    //通过构造器给代理对象赋值
    public SaveMoneyByWokerProxy(SaveMoney saveMoney) {
        this.saveMoneyProxy = saveMoney;
    }

    /**
     * 用代理存钱（工作人员帮忙存钱）
     * 在这里会有一些业务流程上的操作
     */
    public void saveMoney() {
        System.out.println("工作人员开始验钞...");
        System.out.println("验钞通过...");
        saveMoneyProxy.saveMoney();
        System.out.println("存钱完毕...");
    }
}
```
OK，接下来就是测试下了
```java
/**
 * 代理存钱测试类
 *
 * @author 炜哥
 * @since 2021-04-15 22:01:53
 */
public class SaveMoneyProxyTest {

    public static void main(String[] args) {

        //定义一个炜哥存钱10000元的实际对象，炜哥要去存10000元了
        //这边为什么不是实现类对象 = new 实现类();
        //1.可以统一化管理所有子类，只需要提供一个共有的方法
        //2.java设计原则之一：依赖于抽象编程，而不是实现
        SaveMoney weigeSaveMoney = new SaveMoneyToBankImpl("炜哥",10000);

        //炜哥把要存的一万元和身份信息交给银行工作人员（生成一个代理对象）
        SaveMoneyByWokerProxy workerProxySaveMoney = new SaveMoneyByWokerProxy(weigeSaveMoney);

        //代理对象也就是银行工作人员开始存钱（实际由代理类完成实际对象的方法）
        workerProxySaveMoney.saveMoney();
    }
}
```
运行结果：
![image.png](https://cdn.nlark.com/yuque/0/2021/png/12928968/1618541115094-d43003f1-254b-4c72-8e3e-6673b7f7a270.png)
到这里可能就会有人说了，这代理跟接口实现有什么区别吗，都用了关键词 `implements` 来实现
**有区别**，我们看下面用红框框起来的内容：
![image.png](https://cdn.nlark.com/yuque/0/2021/png/12928968/1620373395192-6aa39252-6480-4881-92bd-c720afc303b3.png)
代理对象 `saveMoneyProxy` 不仅做了实际对象需要做的操作 `saveMoney()` ，而且在这个操作的前后做了一些额外操作（这个额外操作在实际项目里很多应用场景，比如计算方法执行时间、执行前的校验、执行后的统一输出等），也就是**方法增强概念。而且静态代理还实现了目标接口类和增强代码的解耦，**但静态代理有非常致命的缺陷，为什么这么说呢，先来回顾下上述例子实现静态代理的过程：
![image.png](https://cdn.nlark.com/yuque/0/2021/png/12928968/1620379095140-028c2a5c-6f51-4d5b-bf91-ab3ff3d6c980.png)
显而易见，虽然原有程序（**目标类**）和增强代码解耦了，但是原有程序（**目标类**）跟代理程序（**代理类**）又纠缠不清了，为什么这么说呢，体现在两个方面：

- 代理的对象每次只能设定一种，如果上面的实际对象  `saveMoney` 换成其他就需要新增代理类
- 因为需要实现相同的方法，所以如果原有程序新增/修改方法，那么代理程序也都需要同步新增/修改



比较灵性的人看到这，会说，这两个问题有啥难的，我只要**用Object类和Method分别接收目标对象和目标对象需要增强的方法**不就行啦，至于需要实现接口的所有方法，那我**不实现接口**不行吗，为啥非要实现目标接口呢？多此一举，来，上**小爷的“动态代理类”**：
![image.png](https://cdn.nlark.com/yuque/0/2021/png/12928968/1620824714014-b8bcbb60-3953-406f-befd-2cbfe8b8edad.png)
执行代码改一改，变成这样：
```java
//炜哥把要存的一万元和身份信息交给银行工作人员（生成一个代理对象）
SaveMoneyByWokerProxy workerProxySaveMoney = new SaveMoneyByWokerProxy(weigeSaveMoney, weigeSaveMoney.getClass().getMethod("saveMoney"));
```
执行结果：
![image.png](https://cdn.nlark.com/yuque/0/2021/png/12928968/1620824854980-769cc7b7-f30b-4958-b8bc-3a8c299bbf91.png)
程序实现确实没有问题，但是我们忽略了一个问题，代理的**初衷**是什么，或者说什么是代理：


代理类是为目标类而服务的，目标类更占主导地位，后者只关心自己需要执行的方法，通俗点讲就是：**“你讲你的开场白和结束语，别影响我的真功夫表演”，**而上面这个所谓的代理类虽然实现了一样的作用但总有种**被托管**的味道，有点就像是“**我把我的真功夫给你，你替我发扬光大**”的意思，因为此时的代理类跟目标类没有任何关系了。


实际上，这种“代理类”被世人称之为**装饰器模式**，这两种模式在本文里的应用场景下根本体会不到它们之间的细微差别，因此继续讨论下去的意义不大，有兴趣去查下资料，**动态代理模式和装饰者模式之间的区别**，这里就不做展开，徒增你们的记忆负担了。


好了，回到正题，如何解决上述这两个问题，既要实现接口来体现代理的含义，又要解决因此带来的棘手问题
<a name="jnEVy"></a>
## JDK动态代理
**它的出现就是为了解决上述两大难，但如果是你，会如何去设计动态代理，不急，先分析下静态的过程**
<a name="LG8QM"></a>
### 创建代理类的目的

1. 创建上述的代理类 `SaveMoneyByWokerProxy` 是为了做什么，是不是为了初始化时接收目标类实例从而生成一个代理对象
1. 生成代理对象是为了干什么，是不是为了能够调用目标类实例的方法并同时执行代理对象中的增强代码

所以，重点来了，能不能通过不设计**完全没头绪的动态代理类**得到**代理对象**，从而调用**目标类实例方法**和**增强代码**，因为后面这两个才是我们最终想要的。
![image.png](https://cdn.nlark.com/yuque/0/2021/png/12928968/1620880813876-8b72cdd8-a4a4-4ed6-a0a8-de0e4c4ebed7.png)
按照静态代理的思路，获得目标实例的代理对象**一我们需要目标类的实例化对象，二需要一个代理类去接收该对象，获得对象方法，重写方法时在目标对象方法前后加点料（方法增强）。    **
第一步没有什么问题，虽然接口不能直接new一个对象，说到new，**可能有比较灵性的同学会想到，接口是有class对象的，能否通过class对象的 `newInstance` 方法反射创建对象呢？**很遗憾，反射没用**，因为它没有构造函数**，不信看下面代码：
```java
//获取接口的构造器
Constructor<?>[] constructors = SaveMoney.class.getConstructors();
for (Constructor<?> constructor : constructors) {
    System.out.println(constructor);
}
```
**输出的结果是空的，**那为什么这个代码看起来那么像是接口被实例化了，生成了“接口对象”：
```java
SaveMoney weigeSaveMoney = new SaveMoneyToBankImpl("炜哥",10000);
```
NoNoNo，千万别搞错了，很多人喜欢把一个 `A a = new A()` 的这个a当成一个对象，这样你完全没有办法理解后面的多态是怎么一回事，所以我更喜欢把a当成是一个引用，就像C语言的指针一样，指向的是右边真正创建的对象，也就是栈内存和堆内存存放数据类型之间的关系。


**所以，只要目标类被某个类实现了，目标对象不是什么问题（JDK动态代理的前提是接口至少被一个实现类实现，否则就无法生成代理对象）**，因此重点在于第二步。


想一下，如果我们要设计一个**动态代理类**，是不是应该把代理类设计成**一个可以接收所有目标对象和实现所有目标对象中所有方法**的样子，怎么去弄，我擦嘞！完全没头绪啊。
<a name="UG0V5"></a>
### 贴心的JDK
好难，第二个条件好难，有没有什么办法直接通过一个**API方法**来获得**代理对象**啊
**有！！！**
贴心的JDK中有一个 `java.lang.reflect` 包下的 `Proxy` 类，字面意思就是代理，我们看下它有哪些方法：
![image.png](https://cdn.nlark.com/yuque/0/2021/png/12928968/1620437611840-381617a1-f880-4935-93a8-0892cb18bc1f.png)
红框框起来的字面意思看起来跟我们需要解决的问题有很大关系，先看下第一个方法_getProxyClass_
_![image.png](https://cdn.nlark.com/yuque/0/2021/png/12928968/1620437741640-7eff4536-c9b9-4cd9-823e-11a94e0aa056.png)_
入参是类加载器和Class对象，返回了一个新的Class对象，想要更确切的信息看下源码中的英文注释：
> _Returns the {_**@code **_java.lang.Class} object for a proxy class given a class loader and an array of interfaces.  The proxy class will be defined by the specified class loader and will implement all of the supplied interfaces.  If any of the given interfaces is non-public, the proxy class will be non-public. If a proxy class for the same permutation of interfaces has already been defined by the class loader, then the existing proxy class will be returned; otherwise, a proxy class for those interfaces will be generated dynamically and defined by the class loader._

直接反手一个有道翻译：
> **返回代理类的{@code java.lang.Class}对象，给出类装入器和接口数组**。代理类将由指定的类装入器定义，并将实现提供的所有接口。如果任何给定接口是非公共的，则代理类是非公共的。如果类装入器已经定义了用于相同接口排列的代理类，那么将返回现有的代理类;否则，将动态生成这些接口的代理类，并由类装入器定义



我们只要关注第一句加粗的话，返回**代理类的Class对象**，等于说，我们上面绞尽脑汁想要的，这里只要一句话就搞定了！！！
```java
Class<?> proxyClass = Proxy.getProxyClass(SaveMoney.class.getClassLoader(), SaveMoney.class.getInterfaces());
```
**既然代理类的Class对象拿到了，那得到代理对象不是分分钟的事情，不就要求传入类加载器和类信息么，开搞：**
```java
//获得代理类的Class对象
Class<?> proxyClass = Proxy.getProxyClass(SaveMoney.class.getClassLoader(), SaveMoney.class.getInterfaces());
//通过Class反射获得代理类实例
SaveMoneyToBankImpl saveMoneyToBankImpl = (SaveMoneyToBankImpl)proxyClass.newInstance();
```
很遗憾，第二句代码的 `newInstance` 不行，为什么：
![image.png](https://cdn.nlark.com/yuque/0/2021/png/12928968/1620438625034-011d0fa1-b570-4c4e-9237-547eb150c8ad.png)
`Proxy` 的默认无参构造函数是private类型的（代理类继承了Proxy），而且注释上的_Prohibits instantiation._清清楚楚表达着：**别用这个，不允许**
**
其实你看上述代码应该也能想到，就算这样能创建出来的代理对象也是没软用的，为什么？
**因为目标对象 `saveMoney` 根本没用到呀，**`SaveMoney` 实现类那么多，但**我们只用了 **`**SaveMoney**` **接口，没用到目标对象的话怎么找到并执行目标对象的方法呢**
还有没有其他办法了，再往下看：
<a name="yIIY4"></a>
### Proxy的有参构造函数
![image.png](https://cdn.nlark.com/yuque/0/2021/png/12928968/1620438761618-b0ce91a2-1b8d-40cb-85a3-29822eeb4e12.png)
又发现了一个构造器，这个修饰词是protect，肯定能直接用，不过有个入参，类型是 `InvocationHandler` ，这个类做什么的？


在你不知道某个类干嘛用的，又找不到对应的api文档时，只能硬着头皮进源码看一眼了，但这次你会发现这个类出奇的简单：
![image.png](https://cdn.nlark.com/yuque/0/2021/png/12928968/1620439092284-2b722a3a-2630-484a-b3fe-22b32681f644.png)
只有一个 `invoke` 方法，对反射有经验的看到`invoke`应该能想到，反射类Method中也有`invoke`，那么是不是意味着这个`InvocationHandler`跟方法有关系，也就是跟增强代码可能有点联系。


而且你发现没有，`InvocationHandler`是一个接口，需要有实现类去实现，所以`invoke`方法得重写，问题又来了，invoke方法重写成什么样子，要想知道怎么重写首先得知道各个方法入参是什么意思：

- **dynamic_proxy**:代理对象com.sun.dynamic_proxy.$Proxy0
- **method**:代理对象的Method方法实例
- **args**:指代代理对象方法传递的参数



看了中文注释是不是还是有点懵逼？没关系，一个个来：

- 第一个com.sun.dynamic_proxy.$Proxy0是什么意思，其实是这样的，jvm会根据我们传入的参数生成代理类，被类加载加载后生成class字节码文件（也就是Class对象），类型名是**“$Proxy”+序号（据说使用后会被删除掉，所以你找不到这个class文件）**，这个类实现了所有传入接口的所有方法，也就是我们上面一心想要拿到的代理对象，但这个参数基本不会用到。
- 第二个method你可以理解为代理对象中的方法反射，因为通过Proxy生成的代理Class对象已经传入了接口所有需要实现的方法，所以通过这个参数我们能反射执行所有接口方法，了解反射的同学肯定知道Class对象中有个反射Data，里面就有Method实例
- 第三个比较好理解，就是一些参数之类的传递
- 除此之外，还有个return的Object，**这个object你可以理解成是和被代理对象方法相同的返回值，即目标对象的该方法返回什么，那么Object就是什么**

**
**先不管这么多了，我只要个代理对象，先随便重写下invoke方法试试看吧：**
**![image.png](https://cdn.nlark.com/yuque/0/2021/png/12928968/1620879082496-217134bd-ca73-4a83-9728-021ecb04f241.png)**
报错了，无法创建目标类的代理对象，为啥啊，我都按照api要求传入需要的参数了呀：
还是上述说的那个问题，**不传入目标对象，Proxy怎么给你造一个可以执行目标对象方法的代理对象**啊，一句话总结就是：**获得代理Class对象可以只用接口，但生成代理对象则需要目标对象**，所以我们换一种写法：
![image.png](https://cdn.nlark.com/yuque/0/2021/png/12928968/1620879460015-6752ecc8-ba36-4f0b-aad9-fb495deb4102.png)
可能有人对**`InvocationHandler`**这个参数还是没概念，那只能使出我的**和稀泥大法**：**你只要理解成把`InvocationHandler`丢到代理类 `Proxy` 中，JDK底层在`Proxy`中一通鸡儿操作，最后向下转型生成的代理类对象执行目标对象方法时，会自动调用`InvocationHandler`中重写的 `invoke` 方法，这样说的话，那重写的invoke方法是不是可以大做文章了？**
**![image.png](https://cdn.nlark.com/yuque/0/2021/png/12928968/1620879552715-b18fd367-5e8c-4b8c-a73d-187d7598607c.png)**
**![image.png](https://cdn.nlark.com/yuque/0/2021/png/12928968/1620881202389-bc475d83-0e2d-493b-ba95-ac0ea8f4a7bd.png)**
**所以 `Proxy` 类不光帮我们解决了如何获得代理对象，又允许我们通过`InvocationHandler`把目标对象和增强方法也放进去！！！**


说的有点深了，有些人已经忘记之前的思路是什么样子了，这里再回顾下：

- 需要能够接受所有泛型类和实现所有泛型类方法的动态代理类-》动态代理类不知道怎么创建-》拿不到代理对象-》**这条路走不通了**
- ①JDK有个Proxy类可以通过传入不需要实例化的接口就能生成代理类的**Class对象**-》
- ②**代理Class对象**有构造函数所以可以通过**反射**直接拿到代理对象，但**构造函数**需要传入`InvocationHandler`-》
- ③`InvocationHandler` 入参需要重写invoke方法，此时可以传入目标对象，通过**方法反射**执行目标对象方法，增强代码此时也可以放入，而通过**该构造函数生成的代理对象**执行目标方法时会自动执行`InvocationHandler` 中的重写invoke方法，最终达到代码增强的效果

所以最终JDK动态代理的思路大概应该是：
![image.png](https://cdn.nlark.com/yuque/0/2021/png/12928968/1620882373243-f00409ff-066e-4712-929f-b3e00ced291e.png)
ok，思路有了，Method实例有了，是不是可以通过 `method.invoke` 来执行目标类的方法，但invoke方法还需要传入目标对象，目标对象当然不是第一个参数_代理对象com.sun.dynamic_proxy.$Proxy0_ ，所以传入的目标对象**saveMoney**，上面的代码再改一改：
![image.png](https://cdn.nlark.com/yuque/0/2021/png/12928968/1620879727230-1f043b81-8bd6-4160-92dc-445c74f5c577.png)
执行输出：
![image.png](https://cdn.nlark.com/yuque/0/2021/png/12928968/1620450709671-e195eb45-e1a4-4f36-9363-538f052992d5.png)
代码执行了，也达到预期效果了，但有些小萌新还是会有点疑惑：

- 为什么要先反射获取代理Class对象的构造函数Constructor，然后通过Constructor的newInstance()方法创建代理对象，不能直接用代理Class对象的newInstance()方法创建代理对象吗？
- 为什么代理对象只能用接口`SaveMoney` 去接，不能使用它的实现类比如 `SaveMoneyToBankImpl` 去接收吗？



第一个问题，其实这个看Class源码就能知道，Class对象的newInstance()方法实际上还是调用构造器Constructor的无参构造函数newInstance()，比较局限，如果Class对象没有无参构造器，那么直接调用newInstance()就会报错，Constructor里支持无参和有参构造，因为需传入`InvocationHandler` 的关系所以得通过Constructor获得有参构造函数对象：
![image.png](https://cdn.nlark.com/yuque/0/2021/png/12928968/1620453535075-c5f48894-276d-488d-83f2-29356210b891.png)
至于第二个，我的解释非常简单，代理类已经实现了目标接口的所有方法，那么你可以把它看做就是个目标接口实现类，那么想用**另外一个目标接口实现类去接收代理对象**就相当于这样：
```java
public interface 接口 {...}
class 实现类1 implements 接口{...}
class 实现类2 implements 接口{...} //把代理类看做是实现类2
class Test{
    public static void main(String[] args) {
        //相当于这样
		实现类1 实现类1对象 = (实现类1) new 实现类2();
    }
}
```
这个操作肯定不允许啊，实现类1和实现类2之间又没有直接的联系，怎么能相互之间强转呢？_
<a name="bI9kO"></a>
### 直接拿代理对象_
OK，其实我们的目的已经达到了，不过可以往回看一眼， `Proxy` 类中除了 `getProxyClass` 方法之外，还有另外一个方法 `newProxyInstance` ，即直接返回给你一个代理对象！
![image.png](https://cdn.nlark.com/yuque/0/2021/png/12928968/1620453873833-3fd5c3d4-5eff-4de8-9083-67089b941efe.png)
这就更简单了，不需要再自己弄一个有参构造函数对象，直接调用这个Api就可以拿到代理对象了，是上述方法的**简化版**：
```java
//初始化目标类对象
SaveMoney saveMoney = new SaveMoneyToBankImpl("炜哥", 1000);

//通过有参构造函数得到代理对象
SaveMoney saveMoneyProxy = (SaveMoney) Proxy.newProxyInstance(
    saveMoney.getClass().getClassLoader(),
    saveMoney.getClass().getInterfaces(),
    new InvocationHandler() {
        @Override
        public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
            //为了实现功能，先这样写
            System.out.println("工作人员开始验钞...");
            System.out.println("验钞通过...");
            Object o = method.invoke(saveMoney, args);
            System.out.println("存钱完毕...");
            return o;
        }
    });

//这个saveMoney方法其实已经包含了上面的增强代码
saveMoneyProxy.saveMoney();
```
执行的结果和上面是一样的，同样需要先确定目标对象


不过上面的代码有点小瑕疵，需要抽取 `new InvocationHandler` 这块对象，因为如果还有其他增强业务呢，总不能把增强业务写死吧，而且内部的目标对象也不能写死：
![image.png](https://cdn.nlark.com/yuque/0/2021/png/12928968/1620459362534-47c3f17a-ab3f-48b3-87ca-317396676642.png)
把抽取出来的代码命名为`ProxyHandler` ，同时增加有参构造函数来接收像SaveMoney这样的变量
```java
/**
 * @author ：炜哥
 * @description：TODO 代理类
 * @date ：2021/4/15 14:20
 */
public class ProxyHandler implements InvocationHandler {

    //代理对象
    private Object target;

    //真实对象赋值
    public ProxyHandler(Object target) {
        this.target = target;
    }

    /**
     * dynamic_proxy:代理对象com.sun.dynamic_proxy.$Proxy0
     * method:代理对象的Method方法实例
     * args:指代代理对象方法传递的参数
     */
    public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
        System.out.println("工作人员开始验钞...");
        System.out.println("验钞通过...");
        Object o = method.invoke(target, args);
        System.out.println("存钱完毕...");
        return o;
    }
}
```
这个代理类跟静态代理中的 `SaveMoneyByWokerProxy` 类起到相同的作用，但不同的是实现了 `InvocationHandler` 接口，重写了 `invoke()` 方法，构造器入参由之前的**特定类**变成了**Object**


最后用 `Proxy` 类生成代理对象测试下（**解释各个入参的含义我已经尽力了......**）
```java
/**
 * 动态代理测试
 *
 * @author ：炜哥
 * @description：TODO
 * @date ：2021/4/14 16:36
 */
public class SaveProxyTest {

    public static void main(String[] args) {

        //定义一个炜哥存钱10000元的实际对象，炜哥要去存10000元了
        SaveMoney saveMoney = new SaveMoneyToBankImpl("炜哥",10000);

        /**
         * 代理对象的调用处理程序
         * 你可以把它想象成一个“传入真实对象生成代理对象”的程序，其内置的invoke()方法会最终调用真实对象的方法
         */
        InvocationHandler invocationHandler = new ProxyHandler(saveMoney);

        /**
         * 炜哥把要存的一万元和身份信息交给银行工作人员（通过newProxyInstance创建一个代理对象）
         *
         * 第一个参数 the class loader to define the dynamic_proxy class
         * 谁被代理就用谁的类加载器，是一种固定的写法，用来加载代理Class对象字节码
         *
         * 第二个参数 the list of interfaces for the dynamic_proxy class to implement
         * 让代理对象有跟被代理对象相同的方法，谁被代理就写谁的getInterfaces,也是一种固定写法
         *
         * 第三个参数 invocationHandler的invoke方法the invocation handler to dispatch method invocations to
         * 让我们可以把增强代码放入该handler中，从而实现代理
         *
         * 返回参数
         * a dynamic_proxy instance with the specified invocation handler of a that is defined by the specified class loader
         * and that implements the specified interfaces
         * 返回一个代理对象，该对象是被指定的类加载器定义并且实现了指定接口
         *
         */
        SaveMoney saveMoneyProxy = (SaveMoney) Proxy.newProxyInstance(
                saveMoney.getClass().getClassLoader(),
                saveMoney.getClass().getInterfaces(),
                invocationHandler);

        //这个saveMoney方法其实已经包含了上面的增强代码
        saveMoneyProxy.saveMoney();
    }
}
```
这样，增强代码放在了InvocationHandler中，并且可以通过反射执行目标类的所有方法，**实现了增强代码和目标类的解耦；**代理对象可以通过Proxy配合InvocationHandler获得，没有像静态代理一样与目标类纠缠不清的代理类，不管有多少个目标类，通过这两个类配合统统可以接收，**实现了目标类与代理对象的解耦**，这种通过接口获取代理对象的叫做**JDK动态代理（**不能用在非接口类的代理上面，因为newProxyInstance方法中第二个参数就是要求传入目标类对象的接口数组**）。**
**
在JDK动态代理中，为什么一定要基于接口实现？这个问题其实你可以通过代理类class反推，通过反编译得到一个结果：**代理类都继承了Proxy，因为java单继承的关系，只能通过实现关系来满足代理的意义**，那如果想基于没有被任何实现类实现的java类呢，能不能生成动态代理对象，答案当然是肯定的：


但是有空再说这种动态代理-cglib
