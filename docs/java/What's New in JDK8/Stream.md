Stream API 旨在让编码更高效率、干净、简洁。

### 从迭代器到Stream操作

当使用 `Stream` 时，我们一般会通过三个阶段建立一个流水线：

1. 创建一个 `Stream`；
2. 进行一个或多个中间操作;
3. 使用终止操作产生一个结果,`Stream` 就不会再被使用了。

**案例1：统计 List 中的单词长度大于6的个数**

```java
/**
* 案例1：统计 List 中的单词长度大于6的个数
*/
ArrayList<String> wordsList = new ArrayList<String>();
wordsList.add("Charles");
wordsList.add("Vincent");
wordsList.add("William");
wordsList.add("Joseph");
wordsList.add("Henry");
wordsList.add("Bill");
wordsList.add("Joan");
wordsList.add("Linda");
int count = 0;
```
Java8之前我们通常用迭代方法来完成上面的需求：

```java
//迭代（Java8之前的常用方法）
//迭代不好的地方：1. 代码多；2 很难被并行运算。
for (String word : wordsList) {
    if (word.length() > 6) {
        count++;
    }
}
System.out.println(count);//3
```
Java8之前我们使用 `Stream` 一行代码就能解决了，而且可以瞬间转换为并行执行的效果：

```java
//Stream
//将stream()改为parallelStream()就可以瞬间将代码编程并行执行的效果
long count2=wordsList.stream()
    .filter(w->w.length()>6)
    .count();
long count3=wordsList.parallelStream()
    .filter(w->w.length()>6)
    .count();
System.out.println(count2);
System.out.println(count3);
```

### `distinct()`

去除 List 中重复的 String

```java
List<String> list = list.stream()
    .distinct()
    .collect(Collectors.toList());
```

### `map`

map 方法用于映射每个元素到对应的结果，以下代码片段使用 map 输出了元素对应的平方数：

```java
List<Integer> numbers = Arrays.asList(3, 2, 2, 3, 7, 3, 5);
// 获取 List 中每个元素对应的平方数并去重
List<Integer> squaresList = numbers.stream().map( i -> i*i).distinct().collect(Collectors.toList());
System.out.println(squaresList.toString());//[9, 4, 49, 25]
```

