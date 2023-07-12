## LinkedHashMap简介

`LinkedHashMap`是Java提供的一个集合类，它继承自`HashMap`，并在`HashMap`基础上维护一条双向链表，使得具备如下特性:
1. 支持遍历时会按照插入顺序有序进行迭代。
2. 支持按照元素访问顺序排序,适用于封装LRU缓存工具。
3. 因为内部使用双向链表维护各个节点，所以遍历时的效率和元素个数成正比，相较于和容量成正比的HashMap来说，迭代效率会高很多。

`LinkedHashMap`逻辑结构如下图所示，它是在HashMap基础上在各个节点之间维护一条双向链表，使得原本散列在不同`bucket`上的节点、链表、红黑树有序关联起来。



![在这里插入图片描述](https://qiniuyun.sharkchili.com/202307112055203.png)


## LinkedHashMap使用示例

### 顺序遍历

如下所示，我们按照顺序往`LinkedHashMap`添加元素然后进行遍历。


```java
HashMap<String,String> map=new LinkedHashMap<>();
        map.put("a","2");
        map.put("g","3");
        map.put("r","1");
        map.put("e","23");
        map.put("h","54");
        map.put("j","22");

        for (Map.Entry<String, String> entry : map.entrySet()) {
            System.out.println(entry.getKey()+":"+entry.getValue());
        }
```

输出结果如下,可以看出,LinkedHashMap的迭代顺序是和插入顺序一致的,这一点是HashMap所不具备的。

```java
a:2
g:3
r:1
e:23
h:54
j:22
```


### 最近最少访问优先


再来看看这段代码，我们将`accessOrder`设置为true，使之具备访问有序性，随后我们顺序插入key为1、2、3的键值对，再访问一次key为2的键值对。



```java
LinkedHashMap<Integer, String> map = new LinkedHashMap<>(16, 0.75f, true);
map.put(1, "one");
map.put(2, "two");
map.put(3, "three");

System.out.println(map.get(2)); // 访问元素2，元素2会被移动到链表末端

for (Map.Entry<Integer, String> entry : map.entrySet()) {
    System.out.println(entry.getKey() + " : " + entry.getValue());
}
```

从输出结果来看，将`accessOrder`设置为true的`LinkedHashMap`排序时会按照最近最少访问(LRU)进行元素迭代，所以当我们访问key为2的键值对之后，该键值对就会被移动至链表末端，所以迭代顺序才变为1、3、2。

```java
two
1 : one
3 : three
2 : two
```


### LRU缓存

从上一个我们可以了解到通过`LinkedHashMap`我们可以封装一个LRU缓存，确保当存放的元素超过容器容量时，将最近最少访问的元素移除。




![在这里插入图片描述](https://qiniuyun.sharkchili.com/202307112055374.png)




代码如下所示，可以看到笔者封装了一个`LRUCache`并继承`LinkedHashMap`,构造函数初始化容量之后，将`accessOrder`设置为true。并且笔者重写了removeEldestEntry方法，该方法会返回一个boolean值，告知`LinkedHashMap`是否需要移除链表首元素，因为我们将`accessOrder`设置为true，所以首元素就是最近最少访问的元素，由此我们的LRU缓存就封装完成了。

```java
public class LRUCache<K, V> extends LinkedHashMap<K, V> {
    private final int capacity;
		
    public LRUCache(int capacity) {
        super(capacity, 0.75f, true);
        this.capacity = capacity;
    }

    /**
     * 判断size超过容量时返回true，告知LinkedHashMap移除最近最少访问的元素(即链表的第一个元素)
     * @param eldest
     * @return
     */
    protected boolean removeEldestEntry(Map.Entry<K, V> eldest) {
        return size() > capacity;
    }

    
}
```

测试代码如下，笔者初始化缓存容量为2，然后按照次序先后添加4个元素。


```java
public static void main(String[] args) {
        LRUCache<Integer, String> cache = new LRUCache<>(2);
        cache.put(1, "one");
        cache.put(2, "two");
        cache.put(3, "three");

        System.out.println(cache.get(1)); // 输出null

        cache.put(4, "four");

        System.out.println(cache.get(2)); // 输出null

        System.out.println(cache.get(3)); // 输出"three"
    }
```

从输出结果来看，添加3时，因为缓存size为2，于是将key为1的键值对删除了，所以第一次输出为null。同理我们再次添加4，size超过了容量大小，将2移除，所以输出的key为2的键值对为null，而键值对为3的输出结果为three。


```java
null
null
three
```

## LinkedHashMap源码解析


### Node的设计

在正式讨论`LinkedHashMap`前，我们先来聊聊`LinkedHashMap`节点`Entry`的设计,我们都知道`HashMap`的bucket上的因为冲突转为链表的节点会在符合以下两个条件时会将链表转为红黑树:

1. 链表上的节点个数达到树化的阈值-1，即`TREEIFY_THRESHOLD - 1`。
2. bucket的容量达到最小的树化容量即`MIN_TREEIFY_CAPACITY`。



而`LinkedHashMap`是在`HashMap`的基础上为bucket上的每一个节点建立一条双向链表，这就使得转为红黑树的树节点也需要具备双向链表节点的特性，即每一个树节点都需要拥有两个引用存储前驱节点和后继节点的地址,所以对于树节点类`TreeNode`的设计就是一个比较棘手的问题。

对此我们不妨来看看两者之间节点类的类图，可以看到:
1. `LinkedHashMap`的节点内部类`Entry`基于`HashMap`的基础上，增加before和after指针使节点具备双向链表的特性。
2. `HashMap`的树节点`TreeNode`继承了具备双向链表特性的`LinkedHashMap`的`Entry`。



![在这里插入图片描述](https://qiniuyun.sharkchili.com/202307112055375.png)


很多读者此时就会有这样一个疑问，为什么`HashMap`的树节点`TreeNode`要通过`LinkedHashMap`获取双向链表的特性呢?为什么不直接在`Node`上实现前驱和后继指针呢?


先来回答第一个问题,我们都知道`LinkedHashMap`是在`HashMap`基础上对节点增加双向指针实现双向链表的特性,所以`LinkedHashMap`内部链表转红黑树时，对应的节点会转为树节点`TreeNode`,为了保证使用`LinkedHashMap`时树节点具备双向链表的特性，所以树节点`TreeNode`需要继承`LinkedHashMap`的`Entry`。


再来说说第二个问题，我们直接在`HashMap`的节点`Node`上直接实现前驱和后继指针,然后`TreeNode`直接继承`Node`获取双向链表的特性为什么不行呢？其实这样做也是可以的。只不过这种做法会使得使用`HashMap`时存储键值对的节点类`Node`多了两个没有必要的引用，占用没必要的内存空间。

所以为了保证`HashMap`底层的节点类`Node`没有多余的引用，又要保证`LinkedHashMap`的节点类Entry拥有存储链表的引用，设计者就让`LinkedHashMap`的节点`Entry`去继承`Node`并增加存储前驱后继节点的引用`before`、`after`，让需要用到链表特性的节点去实现需要的逻辑。然后树节点`TreeNode`再通过继承`Entry`获取`before`、`after`两个指针。

```bash
static class Entry<K,V> extends HashMap.Node<K,V> {
        Entry<K,V> before, after;
        Entry(int hash, K key, V value, Node<K,V> next) {
            super(hash, key, value, next);
        }
    }
```


但是这样做，不也使得使用`HashMap`时的`TreeNode`多了两个没有必要的引用吗?这不也是一种空间的浪费吗？


```bash
 static final class TreeNode<K,V> extends LinkedHashMap.Entry<K,V> {
	//略

}
```


对于这个问题,引用作者的一段注释，作者们认为在良好的`hashCode`算法时，`HashMap`转红黑树的概率不大。就算转为红黑树变为树节点，也可能会因为移除或者扩容将`TreeNode`变为`Node`，所以`TreeNode`的使用概率不算很大，对于这一点资源空间的浪费是可以接受的。


```bash
Because TreeNodes are about twice the size of regular nodes, we
use them only when bins contain enough nodes to warrant use
(see TREEIFY_THRESHOLD). And when they become too small (due to
removal or resizing) they are converted back to plain bins.  In
usages with well-distributed user hashCodes, tree bins are
rarely used.  Ideally, under random hashCodes, the frequency of
nodes in bins follows a Poisson distribution
```


### 构造方法


`LinkedHashMap`构造方法有4个实现也比较简单，直接调用父类即`HashMap`的构造方法完成初始化，在设置accessOrder ,默认情况下`accessOrder` 为false，所以假如我们若要`LinkedHashMap`实现键值对按照访问顺序排序(即将最近最少访问的元素排在链表首部、最近访问的元素移动到链表尾部)，需要调用第4个构造方法将`accessOrder` 设置为true。

```bash
public LinkedHashMap() {
        super();
        accessOrder = false;
    }


public LinkedHashMap(int initialCapacity) {
        super(initialCapacity);
        accessOrder = false;
    }

public LinkedHashMap(int initialCapacity, float loadFactor) {
        super(initialCapacity, loadFactor);
        accessOrder = false;
    }

public LinkedHashMap(int initialCapacity,
                         float loadFactor,
                         boolean accessOrder) {
        super(initialCapacity, loadFactor);
        this.accessOrder = accessOrder;
    }
```



### get方法

`get`方法是`LinkedHashMap`增删改查操作中唯一一个重写的方法,它会在元素查询完成之后，将当前访问的元素移到链表的末尾。


我们就以下面这张图为例，我们的双向链表指向前驱节点的指针为红色，指向后继节点的指针为蓝色，演示一下访问key为13(后文统称为13)的元素后`LinkedHashMap`的如何将其移动至链表尾部。


![在这里插入图片描述](https://qiniuyun.sharkchili.com/202307112055883.png)



当我们访问`LinkedHashMap`中key为13的元素时，双向链表首先会将13的后继指针指向null,所以笔者这里索性将指针删除。

![在这里插入图片描述](https://qiniuyun.sharkchili.com/202307112055476.png)


随后，查看13是否有前驱节点，发现其前驱节点是一个key为11的节点，故让11直接指向13的后继节点25。


![在这里插入图片描述](https://qiniuyun.sharkchili.com/202307112055529.png)


同理，如果13的后继节点不为空，也让其指向13的前驱节点，所以25的前驱指针指向11。

![在这里插入图片描述](https://qiniuyun.sharkchili.com/202307112055430.png)



回到13节点，如果它发现双向链表存在尾节点，则将自己的前驱指针指向尾节点，而尾节点也会将前驱指针指向13。



![在这里插入图片描述](https://qiniuyun.sharkchili.com/202307112055109.png)


最终链表的指向尾节点的指针tail指向13，由此完成将访问过的节点移动至链表尾部。

![在这里插入图片描述](https://qiniuyun.sharkchili.com/202307112055272.png)




通过图解我们大抵了解了`LinkedHashMap`访问后置的流程，接下来我们从`get`方法的源码为入口复盘一下上述的操作，`get`的执行步骤为:

1. 调用父类即`HashMap`的`getNode`获取键值对,若为空则直接返回。
2. 判断`accessOrder`是否为true，若为true则说明需要保证`LinkedHashMap`的链表访问有序性，执行步骤3。
3. 调用`LinkedHashMap`重写的`afterNodeAccess`将当前元素添加到链表末尾。

```java
 public V get(Object key) {
        Node<K,V> e;
        //获取key的键值对,若为空直接返回
        if ((e = getNode(hash(key), key)) == null)
            return null;
        //若accessOrder为true，则调用afterNodeAccess将当前元素移到链表末尾
        if (accessOrder)
            afterNodeAccess(e);
        //返回键值对的值
        return e.value;
    }
```

上文提到保证访问有序的调用方法`afterNodeAccess`，从源码中我可以看到它完成的操作:


1. 如果`accessOrder` 为true且链表尾部不为当前节点p，我们则需要将当前节点移到链表尾部。
2. 获取当前节点p、以及它的前驱节点b和后继节点a。
3. 将当前节点p的后继指针设置为null，使其和后继节点p断开联系。
4. 尝试将前驱节点指向后继节点，若前驱节点为空，则说明当前节点p就是链表首节点，故直接将后继节点a设置为首节点，随后我们再将p追加到a的末尾。
5. 再尝试让后继节点a指向前驱节点b。
6. 上述操作让前驱节点和后继节点完成关联，并将当前节点p独立出来，这一步则是将当前节点p追加到链表末端，如果链表末端为空，则说明当前链表只有一个节点p，所以直接让head指向p即可。
7. 上述操作已经将p成功到达链表末端，最后我们将tail指针即指向链表末端的指针指向p即可。

```java
void afterNodeAccess(Node<K,V> e) { // move node to last
        LinkedHashMap.Entry<K,V> last;
        //如果accessOrder 且当前节点不未链表尾节点
        if (accessOrder && (last = tail) != e) {

		//获取当前节点、以及前驱节点和后继节点
            LinkedHashMap.Entry<K,V> p =
                (LinkedHashMap.Entry<K,V>)e, b = p.before, a = p.after;
                
            //将当前节点的后继节点指针指向空，使其和后继节点断开联系
            p.after = null;


            //如果前驱节点为空，则说明当前节点是链表的首节点，故将后继节点设置为首节点
            if (b == null)
                head = a;
            else
            //如果后继节点不为空，则让前驱节点指向后继节点
                b.after = a;


			//如果后继节点不为空，则让后继节点指向前驱节点
            if (a != null)
                a.before = b;
            else
            //如果后继节点为空，则说明当前节点在链表最末尾，直接让last 指向前驱节点,这个 else其实 没有意义，因为最开头if已经确保了p不是尾结点了，自然after不会是null
                last = b;
                
            //如果last为空，则说明当前链表只有一个节点p，则将head指向p
            if (last == null)
                head = p;
            else {
            //反之让p的前驱指针指向尾节点，再让尾节点的前驱指针指向p
                p.before = last;
                last.after = p;
            }
            //tail指向p，自此将节点p移动到链表末尾
            tail = p;
            
            ++modCount;
        }
    }
```

### remove方法后置操作——afterNodeRemoval

`LinkedHashMap`并没有对`remove`方法进行重写，而实直接继承`HashMap`的`remove`方法，为了保证键值对移除后双向链表中的节点也会同步被移除，`LinkedHashMap`重写了`HashMap`的空实现方法`afterNodeRemoval`。


我们还是以这个链表为例，来演示一下在`LinkedHashMap`的`afterNodeRemoval`方法如何将已和bucket断开联系的节点13从链表中移除。


![在这里插入图片描述](https://qiniuyun.sharkchili.com/202307112055254.png)




首先将13的前驱和后继指针指置空，确保被删节点和其他节点断开联系。



![在这里插入图片描述](https://qiniuyun.sharkchili.com/202307112055115.png)




判断13是否有前驱节点，如果有则将其后继指针指向13的后继节点，让其与13断开联系，所以前驱节点11指向了25。



![在这里插入图片描述](https://qiniuyun.sharkchili.com/202307112055429.png)





同理13后继节点若不为空，则让其指向13的前驱节点，所以25的前驱指针指向了11，最终13就变成没有被任何引用指向的对象，等待被gc。


![在这里插入图片描述](https://qiniuyun.sharkchili.com/202307112055885.png)



再来看看源码，我们可以看到从`HashMap`继承来的`remove`方法内部调用的`removeNode`方法将节点从bucket删除后，调用了`afterNodeRemoval`。

```java
final Node<K,V> removeNode(int hash, Object key, Object value,
                               boolean matchValue, boolean movable) {
        //略
            if (node != null && (!matchValue || (v = node.value) == value ||
                                 (value != null && value.equals(v)))) {
                if (node instanceof TreeNode)
                    ((TreeNode<K,V>)node).removeTreeNode(this, tab, movable);
                else if (node == p)
                    tab[index] = node.next;
                else
                    p.next = node.next;
                ++modCount;
                --size;
                //HashMap的removeNode完成元素移除后会调用afterNodeRemoval进行移除后置操作
                afterNodeRemoval(node);
                return node;
            }
        }
        return null;
    }
//空实现
void afterNodeRemoval(Node<K,V> p) { }
```


查看`afterNodeRemoval`的源码，它的整体操作就是让当前节点p和前驱节点、后继节点断开联系，等待gc回收，整体步骤为:

1. 获取当前节点p、以及e的前驱节点b和后继节点a。
2. 让当前节点p和其前驱、后继节点断开联系。
3. 尝试让前驱节点b指向后继节点a，若b为空则说明当前节点p在链表首部，我们直接将head指向后继节点a即可。
4. 尝试让后继节点a指向前驱节点b，若a为空则说明当前节点p在链表末端，所以直接让tail指针指向前驱节点a即可。


```bash
void afterNodeRemoval(Node<K,V> e) { // unlink

		//获取当前节点p、以及e的前驱节点b和后继节点a
        LinkedHashMap.Entry<K,V> p =
            (LinkedHashMap.Entry<K,V>)e, b = p.before, a = p.after;
		//将p的前驱和后继指针都设置为null，使其和前驱、后继节点断开联系
        p.before = p.after = null;

		//如果前驱节点为空，则说明当前节点p是链表首节点，让head指针指向后继节点a即可
        if (b == null)
            head = a;
        else
        //如果前驱节点b不为空，则让b直接指向后继节点a
            b.after = a;

		//如果后继节点为空，则说明当前节点p在链表末端，所以直接让tail指针指向前驱节点a即可
        if (a == null)
            tail = b;
        else
        //反之后继节点的前驱指针直接指向前驱节点
            a.before = b;
    }
```







### put方法后置操作——afterNodeInsertion

同样的`LinkedHashMap`并没有实现插入方法，而是直接继承`HashMap`的所有插入方法交由用户使用，但为了维护双向链表访问的有序性，它做了这样两件事:

1. 重写`afterNodeAccess`(上文提到过),如果当前被插入的key已存在与map中，因为`LinkedHashMap`的插入操作会将新节点追加至链表末尾，所以对于存在的key则调用`afterNodeAccess`将其放到链表末端。
2. 重写了`HashMap`的`afterNodeInsertion`方法，当`removeEldestEntry`返回true时，会将链表首节点移除。


这一点我们可以在`HashMap`的插入操作核心方法`putVal`中看到。

```java
final V putVal(int hash, K key, V value, boolean onlyIfAbsent,
                   boolean evict) {
        	//略
            if (e != null) { // existing mapping for key
                V oldValue = e.value;
                if (!onlyIfAbsent || oldValue == null)
                    e.value = value;
                 //如果当前的key在map中存在，则调用afterNodeAccess
                afterNodeAccess(e);
                return oldValue;
            }
        }
        ++modCount;
        if (++size > threshold)
            resize();
         //调用插入后置方法，该方法被LinkedHashMap重写
        afterNodeInsertion(evict);
        return null;
    }
```




上述步骤的源码上文已经解释过了，所以这里我们着重了解一下`afterNodeInsertion`的工作流程，假设我们的重写了`removeEldestEntry`，当链表`size()`超过`capacity`时，就返回true。


```java
/**
     * 判断size超过容量时返回true，告知LinkedHashMap移除最近最少访问的元素(即链表的第一个元素)
     * @param eldest
     * @return
     */
    protected boolean removeEldestEntry(Map.Entry<K, V> eldest) {
        return size() > capacity;
    }
```


以下图为例，假设笔者最后新插入了一个不存在的节点19,假设capacity为4，所以removeEldestEntry返回true，我们要将链表首节点移除。



![在这里插入图片描述](https://qiniuyun.sharkchili.com/202307112055181.png)




移除的步骤很简单，查看链表首节点是否存在，若存在则断开首节点和后继节点的关系，并让首节点指针指向下一节点，所以head指针指向了12，节点10成为没有任何引用指向的空对象，等待GC。

![在这里插入图片描述](https://qiniuyun.sharkchili.com/202307112055209.png)







通过图解后我们查看源码，可以看到`afterNodeInsertion`执行步骤为:

1. 判断eldest是否为true，只有为true才能说明可能需要将最年长的键值对(即链表首部的元素)进行移除，具体是否具体要进行移除，还得确定链表是否为空`((first = head) != null)`，以及`removeEldestEntry`方法是否返回true，只有这两个方法返回true才能确定当前链表不为空，且链表需要进行移除操作了。
2. 获取链表第一个元素的key。
3. 调用`HashMap`的`removeNode`方法，该方法我们上文提到过，它会将节点从HashMap的bucket中移除，并且`LinkedHashMap`还重写了`removeNode`中的`afterNodeRemoval`方法，所以这一步将通过调用`removeNode`将元素从`HashMap`的bucket中移除，并和`LinkedHashMap`的双向链表断开，等待gc回收。

```java
void afterNodeInsertion(boolean evict) { // possibly remove eldest
        LinkedHashMap.Entry<K,V> first;
        //如果evict为true且队首元素不为空以及removeEldestEntry返回true，则说明我们需要最老的元素(即在链表首部的元素)移除。
        if (evict && (first = head) != null && removeEldestEntry(first)) {
        	//获取链表首部的键值对的key
            K key = first.key;
            //调用removeNode将元素从HashMap的bucket中移除，并和LinkedHashMap的双向链表断开，等待gc回收
            removeNode(hash(key), key, null, false, true);
        }
    }
```



### removeEldestEntry


还记得我们上文中LRU缓存案例吗？我们继承`LinkedHashMap`后重写了空方法`removeEldestEntry`，该方法会在`LinkedHashMap`中的从`HashMap`继承的任何一个插入方法中被调用到，所以我们的LRU缓存就是通过重写该方法的逻辑，告知`LinkedHashMap`在链表的大小大于容量时就返回true，让`LinkedHashMap`将链表首元素移除。

```bash
 /**
     * 判断size超过容量时返回true，告知LinkedHashMap移除最近最少访问的元素(即链表的第一个元素)
     * @param eldest
     * @return
     */
    protected boolean removeEldestEntry(Map.Entry<K, V> eldest) {
        return size() > capacity;
    }
```







## LinkedHashMap和HashMap遍历性能比较

`LinkedHashMap`维护了一个双向链表来记录数据插入的顺序，因此在迭代遍历生成的迭代器的时候，是按照双向链表的路径进行遍历的。这一点相比于`HashMap`那种遍历整个bucket的方式来说，高效需多。

这一点我们可以从两者的迭代器中得以印证，先来看看`HashMap`的迭代器，可以看到HashMap迭代键值对时会用到一个`nextNode`方法，该方法会返回next指向的下一个元素，并会从next开始遍历bucket找到下一个bucket中不为空的元素Node。

```java
 final class EntryIterator extends HashIterator
        implements Iterator<Map.Entry<K,V>> {
        public final Map.Entry<K,V> next() { return nextNode(); }
    }

//获取下一个Node
 final Node<K,V> nextNode() {
            Node<K,V>[] t;
            //获取下一个元素next
            Node<K,V> e = next;
            if (modCount != expectedModCount)
                throw new ConcurrentModificationException();
            if (e == null)
                throw new NoSuchElementException();
             //将next指向bucket中下一个不为空的Node
            if ((next = (current = e).next) == null && (t = table) != null) {
                do {} while (index < t.length && (next = t[index++]) == null);
            }
            return e;
        }
```


相比之下`LinkedHashMap`的迭代器则是直接使用通过`after`指针快速定位到当前节点的后继节点,简洁高效需多。


```java
 final class LinkedEntryIterator extends LinkedHashIterator
        implements Iterator<Map.Entry<K,V>> {
        public final Map.Entry<K,V> next() { return nextNode(); }
    }
//获取下一个Node
 final LinkedHashMap.Entry<K,V> nextNode() {
 			//获取下一个节点next
            LinkedHashMap.Entry<K,V> e = next;
            if (modCount != expectedModCount)
                throw new ConcurrentModificationException();
            if (e == null)
                throw new NoSuchElementException();
            //current 指针指向当前节点
            current = e;
            //next直接当前节点的after指针快速定位到下一个节点
            next = e.after;
            return e;
        }
```



为了验证笔者所说的观点，笔者对这两个容器进行了压测，测试插入1000w和迭代1000w条数据的耗时，代码如下:



```java
public static void main(String[] args) {
        int count = 1000_0000;
        Map<Integer, Integer> hashMap = new HashMap<>();
        Map<Integer, Integer> linkedHashMap = new LinkedHashMap<>();

        Long start, end;

        start = System.currentTimeMillis();
        for (int i = 0; i < count; i++) {
            hashMap.put(RandomUtil.randomInt(1,count),RandomUtil.randomInt(1,count));
        }
        end = System.currentTimeMillis();
        System.out.println("map time putVal: " + (end - start));

        start = System.currentTimeMillis();
        for (int i = 0; i < count; i++) {
            linkedHashMap.put(RandomUtil.randomInt(1,count),RandomUtil.randomInt(1,count));
        }
        end = System.currentTimeMillis();
        System.out.println("linkedHashMap putVal time: " + (end - start));

        start = System.currentTimeMillis();
        for (Integer v : hashMap.values()) {
        }
        end = System.currentTimeMillis();
        System.out.println("map get time: " + (end - start));

        start = System.currentTimeMillis();
        for (Integer v : linkedHashMap.values()) {
        }
        end = System.currentTimeMillis();
        System.out.println("linkedHashMap get time: " + (end - start));
    }
```


从输出结果来看,因为`LinkedHashMap`需要维护双向链表的缘故，相较于`Hashmap`会更耗时，但是有了双向链表明确的前后节点关系，迭代效率相对于前者高效了需多。


```java
map time putVal: 6794
linkedHashMap putVal time: 7882
map get time: 131
linkedHashMap get time: 59
```


## LinkedHashMap常见面试题


### 什么是LinkedHashMap？

`LinkedHashMap`是Java集合框架中`HashMap`的一个子类，它继承了`HashMap`的所有属性和方法，并且在HashMap的基础重写了`afterNodeRemoval`、`afterNodeInsertion`、`afterNodeAccess`方法。使之拥有顺序插入和访问有序的特性。

### LinkedHashMap如何按照插入顺序迭代元素？

`LinkedHashMap`按照插入顺序迭代元素是它的默认行为。`LinkedHashMap`内部维护了一个双向链表，用于记录元素的插入顺序。因此，当使用迭代器迭代元素时，元素的顺序与它们最初插入的顺序相同。

### LinkedHashMap如何按照访问顺序迭代元素？

`LinkedHashMap`可以通过构造函数中的`accessOrder`参数指定按照访问顺序迭代元素。当`accessOrder`为true时，每次访问一个元素时，该元素会被移动到链表的末尾，因此下次访问该元素时，它就会成为链表中的最后一个元素，从而实现按照访问顺序迭代元素。

### LinkedHashMap如何实现LRU缓存？

将`accessOrder`设置为true并重写`removeEldestEntry`方法当链表大小超过容量时返回true，使得每次访问一个元素时，该元素会被移动到链表的末尾。一旦插入操作让`removeEldestEntry`返回true时，视为缓存已满，`LinkedHashMap`就会将链表首元素移除，由此我们就能实现一个LRU缓存。

### LinkedHashMap和HashMap有什么区别？

`LinkedHashMap`和`HashMap`都是Java集合框架中的Map接口的实现类。它们的最大区别在于迭代元素的顺序。`HashMap`迭代元素的顺序是不确定的，而LinkedHashMap提供了按照插入顺序或访问顺序迭代元素的功能。此外，`LinkedHashMap`内部维护了一个双向链表，用于记录元素的插入顺序或访问顺序，而`HashMap`则没有这个链表。因此，`LinkedHashMap`的插入性能可能会比`HashMap`略低，但它提供了更多的功能并且迭代效率相较于`HashMap`更加高效。






## 参考文献

[LinkedHashMap 源码详细分析（JDK1.8）](https://www.imooc.com/article/22931)


[HashMap与LinkedHashMap](https://www.cnblogs.com/Spground/p/8536148.html#:~:text=LinkedHashMap%20%E5%92%8C%20HashMap%20%E6%80%A7%E8%83%BD%E7%9A%84%E6%AF%94%E8%BE%83:%E5%9C%A8%E5%9F%BA%E6%9C%AC%E7%9A%84%20put,get%20remove%20%E6%93%8D%E4%BD%9C%EF%BC%8C%E4%B8%A4%E8%80%85%E7%9A%84%E6%80%A7%E8%83%BD%E5%87%A0%E4%B9%8E%E7%9B%B8%E8%BF%91%EF%BC%8C%E7%94%B1%E4%BA%8E%20LinkedHashMap%20%E7%BB%B4%E6%8A%A4%E7%9D%80%E4%B8%80%E4%B8%AA%E5%8F%8C%E5%90%91%E9%93%BE%E8%A1%A8%EF%BC%8C%E5%9B%A0%E6%AD%A4%E6%80%A7%E8%83%BD%E5%8F%AF%E8%83%BD%E7%A8%8D%E5%BE%AE%E5%B7%AE%E4%B8%80%E7%82%B9%E7%82%B9%E3%80%82)

[源于 LinkedHashMap源码](https://leetcode.cn/problems/lru-cache/solution/yuan-yu-linkedhashmapyuan-ma-by-jeromememory/)