---
title: Summary of MyBatis common interview questions
category: framework
icon: "database"
tag:
  -MyBatis
head:
  - - meta
    - name: keywords
      content: MyBatis
  - - meta
    - name: description
      content: Several common MyBatis common questions
---

<!-- @include: @small-advertisement.snippet.md -->

> This article was collected from the Internet by JavaGuide, and the original source is unknown.
>
> Compared to these boring interview questions, I suggest you read the high-quality MyBatis articles recommended at the end of the article.

### #What is the difference between {} and \${}?

Note: This question was asked by the interviewer when interviewing my colleague.

Answer:

- `${}` is a variable placeholder in the Properties file. It can be used for label attribute values and sql internals. It is an original text replacement and can replace any content. For example, \${driver} will be replaced as is with `com.mysql.jdbc. Driver`.

An example: sort by any field based on parameters:

```sql
select * from users order by ${orderCols}
```

`orderCols` can be `name`, `name desc`, `name,sex asc`, etc. to achieve flexible sorting.

- `#{}` is the parameter placeholder of sql. MyBatis will replace the `#{}` in sql with the ? sign. Before the sql is executed, the parameter setting method of PreparedStatement will be used to set the parameter value for the ? The name attribute value of the object, equivalent to `param.getItem().getName()`.

### In addition to the common select, insert, update, delete tags, what other tags are there in the xml mapping file?

Note: This question was asked by JD.com interviewer when interviewing me.

Answer: There are many other tags, `<resultMap>`, `<parameterMap>`, `<sql>`, `<include>`, `<selectKey>`, plus 9 tags of dynamic sql, `trim|where|set|foreach|if|choose|when|otherwise|bind`, etc., among which `<sql>` is sql Fragment tag, introduce sql fragment through `<include>` tag, `<selectKey>` generates policy tags for primary keys that do not support auto-increment.

### How does the Dao interface work? If the method in the Dao interface has different parameters, can the method be overloaded?

Note: This question was also asked by a JD interviewer during my interview.

Answer: In best practice, usually an xml mapping file will be written with a Dao interface corresponding to it. The Dao interface is what people often call the `Mapper` interface. The fully qualified name of the interface is the value of the namespace in the mapping file. The method name of the interface is the id value of `MappedStatement` in the mapping file. The parameters in the interface method are the parameters passed to sql. The `Mapper` interface does not have an implementation class. When calling the interface method, the fully qualified interface name + the method name are concatenated into a string as the key value, which can uniquely locate a `MappedStatement`. For example: `com.mybatis3.mappers. StudentDao.findStudentById`. You can uniquely find the `MappedStatement` whose namespace is `com.mybatis3.mappers. StudentDao` below `id = findStudentById` . In MyBatis, each `<select>`, `<insert>`, `<update>`, `<delete>` tag will be parsed into a `MappedStatement` object.

~~Methods in the Dao interface cannot be overloaded because of the saving and search strategy of fully qualified name + method name. ~~

Methods in the Dao interface can be overloaded, but IDs in Mybatis' xml are not allowed to be repeated.

Mybatis version 3.3.0, personal test is as follows:

```java
/**
 * Method overloading in Mapper interface
 */
public interface StuMapper {

 List<Student> getAllStu();

 List<Student> getAllStu(@Param("id") Integer id);
}
```

Then you can use Mybatis' dynamic sql in `StuMapper.xml` to achieve this.

```xml
<select id="getAllStu" resultType="com.pojo.Student">
  select * from student
  <where>
    <if test="id != null">
      id = #{id}
    </if>
  </where>
</select>
```

It can run normally and get corresponding results, thus realizing the overloaded method written in the Dao interface.

**The Dao interface of Mybatis can have multiple overloaded methods, but there must be only one mapping corresponding to multiple methods, otherwise an error will be reported at startup. **

Related issue: [Correction: Methods in the Dao interface can be overloaded, but IDs in Mybatis' xml are not allowed to be repeated! ](https://github.com/Snailclimb/JavaGuide/issues/1122).

The working principle of the Dao interface is JDK dynamic proxy. When MyBatis is running, it will use the JDK dynamic proxy to generate a proxy object for the Dao interface. The proxy object proxy will intercept the interface method, execute the sql represented by `MappedStatement`, and then return the sql execution result.

**Additional**:

Dao interface methods can be overloaded, but the following conditions need to be met:

1. There is only one parameterless method and one parameterized method
2. When there are multiple methods with parameters, the number of parameters must be consistent. And use the same `@Param`, or use `param1` like this

**The test is as follows**:

`PersonDao.java`

```java
Person queryById();

Person queryById(@Param("id") Long id);

Person queryById(@Param("id") Long id, @Param("name") String name);
```

`PersonMapper.xml`

```xml
<select id="queryById" resultMap="PersonMap">
    select
      id, name, age, address
    from person
    <where>
        <if test="id != null">
            id = #{id}
        </if>
        <if test="name != null and name != ''">
            name = #{name}
        </if>
    </where>
    limit 1
</select>
```

The `org.apache.ibatis.scripting.xmltags.DynamicContext.ContextAccessor#getProperty` method is used to obtain the conditional value in the `<if>` tag

```java
public Object getProperty(Map context, Object target, Object name) {
  Map map = (Map) target;

  Object result = map.get(name);
  if (map.containsKey(name) || result != null) {
    return result;
  }

  Object parameterObject = map.get(PARAMETER_OBJECT_KEY);
  if (parameterObject instanceof Map) {
    return ((Map)parameterObject).get(name);
  }

  return null;
}
```

`parameterObject` is a map, which stores information related to parameters in the Dao interface.

`((Map)parameterObject).get(name)` method is as follows

```java
public V get(Object key) {
  if (!super.containsKey(key)) {
    throw new BindingException("Parameter '" + key + "' not found. Available parameters are " + keySet());
  }
  return super.get(key);
}
```1. `queryById()`方法执行时，`parameterObject`为 null，`getProperty`方法返回 null 值，`<if>`标签获取的所有条件值都为 null，所有条件不成立，动态 sql 可以正常执行。
2. `queryById(1L)`方法执行时，`parameterObject`为 map，包含了`id`和`param1`两个 key 值。当获取`<if>`标签中`name`的属性值时，进入`((Map)parameterObject).get(name)`方法中，map 中 key 不包含`name`，所以抛出异常。
3. `queryById(1L,"1")`方法执行时，`parameterObject`中包含`id`,`param1`,`name`,`param2`四个 key 值，`id`和`name`属性都可以获取到，动态 sql 正常执行。

### MyBatis 是如何进行分页的？分页插件的原理是什么？

注：我出的。

答：**(1)** MyBatis 使用 RowBounds 对象进行分页，它是针对 ResultSet 结果集执行的内存分页，而非物理分页；**(2)** 可以在 sql 内直接书写带有物理分页的参数来完成物理分页功能，**(3)** 也可以使用分页插件来完成物理分页。

分页插件的基本原理是使用 MyBatis 提供的插件接口，实现自定义插件，在插件的拦截方法内拦截待执行的 sql，然后重写 sql，根据 dialect 方言，添加对应的物理分页语句和物理分页参数。

举例：`select _ from student` ，拦截 sql 后重写为：`select t._ from （select \* from student）t limit 0，10`

### 简述 MyBatis 的插件运行原理，以及如何编写一个插件

注：我出的。

答：MyBatis 仅可以编写针对 `ParameterHandler`、 `ResultSetHandler`、 `StatementHandler`、 `Executor` 这 4 种接口的插件，MyBatis 使用 JDK 的动态代理，为需要拦截的接口生成代理对象以实现接口方法拦截功能，每当执行这 4 种接口对象的方法时，就会进入拦截方法，具体就是 `InvocationHandler` 的 `invoke()` 方法，当然，只会拦截那些你指定需要拦截的方法。

实现 MyBatis 的 `Interceptor` 接口并复写 `intercept()` 方法，然后在给插件编写注解，指定要拦截哪一个接口的哪些方法即可，记住，别忘了在配置文件中配置你编写的插件。

### MyBatis 执行批量插入，能返回数据库主键列表吗？

注：我出的。

答：能，JDBC 都能，MyBatis 当然也能。

### MyBatis 动态 sql 是做什么的？都有哪些动态 sql？能简述一下动态 sql 的执行原理不？

注：我出的。

答：MyBatis 动态 sql 可以让我们在 xml 映射文件内，以标签的形式编写动态 sql，完成逻辑判断和动态拼接 sql 的功能。其执行原理为，使用 OGNL 从 sql 参数对象中计算表达式的值，根据表达式的值动态拼接 sql，以此来完成动态 sql 的功能。

MyBatis 提供了 9 种动态 sql 标签:

- `<if></if>`
- `<where></where>(trim,set)`
- `<choose></choose>（when, otherwise）`
- `<foreach></foreach>`
- `<bind/>`

关于 MyBatis 动态 SQL 的详细介绍，请看这篇文章：[Mybatis 系列全解（八）：Mybatis 的 9 大动态 SQL 标签你知道几个？](https://segmentfault.com/a/1190000039335704) 。

关于这些动态 SQL 的具体使用方法，请看这篇文章：[Mybatis【13】-- Mybatis 动态 sql 标签怎么使用？](https://cloud.tencent.com/developer/article/1943349)

### MyBatis 是如何将 sql 执行结果封装为目标对象并返回的？都有哪些映射形式？

注：我出的。

答：第一种是使用 `<resultMap>` 标签，逐一定义列名和对象属性名之间的映射关系。第二种是使用 sql 列的别名功能，将列别名书写为对象属性名，比如 T_NAME AS NAME，对象属性名一般是 name，小写，但是列名不区分大小写，MyBatis 会忽略列名大小写，智能找到与之对应对象属性名，你甚至可以写成 T_NAME AS NaMe，MyBatis 一样可以正常工作。

有了列名与属性名的映射关系后，MyBatis 通过反射创建对象，同时使用反射给对象的属性逐一赋值并返回，那些找不到映射关系的属性，是无法完成赋值的。

### MyBatis 能执行一对一、一对多的关联查询吗？都有哪些实现方式，以及它们之间的区别

注：我出的。

答：能，MyBatis 不仅可以执行一对一、一对多的关联查询，还可以执行多对一，多对多的关联查询，多对一查询，其实就是一对一查询，只需要把 `selectOne()` 修改为 `selectList()` 即可；多对多查询，其实就是一对多查询，只需要把 `selectOne()` 修改为 `selectList()` 即可。

关联对象查询，有两种实现方式，一种是单独发送一个 sql 去查询关联对象，赋给主对象，然后返回主对象。另一种是使用嵌套查询，嵌套查询的含义为使用 join 查询，一部分列是 A 对象的属性值，另外一部分列是关联对象 B 的属性值，好处是只发一个 sql 查询，就可以把主对象和其关联对象查出来。

那么问题来了，join 查询出来 100 条记录，如何确定主对象是 5 个，而不是 100 个？其去重复的原理是 `<resultMap>` 标签内的 `<id>` 子标签，指定了唯一确定一条记录的 id 列，MyBatis 根据 `<id>` 列值来完成 100 条记录的去重复功能， `<id>` 可以有多个，代表了联合主键的语意。

同样主对象的关联对象，也是根据这个原理去重复的，尽管一般情况下，只有主对象会有重复记录，关联对象一般不会重复。

举例：下面 join 查询出来 6 条记录，一、二列是 Teacher 对象列，第三列为 Student 对象列，MyBatis 去重复处理后，结果为 1 个老师 6 个学生，而不是 6 个老师 6 个学生。

| t_id | t_name  | s_id |
| ---- | ------- | ---- |
| 1    | teacher | 38   |
| 1    | teacher | 39   |
| 1    | teacher | 40   |
| 1    | teacher | 41   |
| 1    | teacher | 42   |
| 1    | teacher | 43   |

### MyBatis 是否支持延迟加载？如果支持，它的实现原理是什么？

注：我出的。

答：MyBatis 仅支持 association 关联对象和 collection 关联集合对象的延迟加载，association 指的就是一对一，collection 指的就是一对多查询。在 MyBatis 配置文件中，可以配置是否启用延迟加载 `lazyLoadingEnabled=true|false。`

它的原理是，使用 `CGLIB` 创建目标对象的代理对象，当调用目标方法时，进入拦截器方法，比如调用 `a.getB().getName()` ，拦截器 `invoke()` 方法发现 `a.getB()` 是 null 值，那么就会单独发送事先保存好的查询关联 B 对象的 sql，把 B 查询上来，然后调用 a.setB(b)，于是 a 的对象 b 属性就有值了，接着完成 `a.getB().getName()` 方法的调用。这就是延迟加载的基本原理。

当然了，不光是 MyBatis，几乎所有的包括 Hibernate，支持延迟加载的原理都是一样的。

### MyBatis 的 xml 映射文件中，不同的 xml 映射文件，id 是否可以重复？

注：我出的。

答：不同的 xml 映射文件，如果配置了 namespace，那么 id 可以重复；如果没有配置 namespace，那么 id 不能重复；毕竟 namespace 不是必须的，只是最佳实践而已。

原因就是 namespace+id 是作为 `Map<String, MappedStatement>` 的 key 使用的，如果没有 namespace，就剩下 id，那么，id 重复会导致数据互相覆盖。有了 namespace，自然 id 就可以重复，namespace 不同，namespace+id 自然也就不同。

### MyBatis 中如何执行批处理？

注：我出的。

答：使用 `BatchExecutor` 完成批处理。

### MyBatis 都有哪些 Executor 执行器？它们之间的区别是什么？

注：我出的

Answer: MyBatis has three basic `Executor` executors:

- **`SimpleExecutor`:** Every time update or select is executed, a Statement object is opened and the Statement object is closed immediately after use.
- **`ReuseExecutor`:** Execute update or select, use sql as the key to find the Statement object, use it if it exists, and create it if it does not exist. After use, the Statement object is not closed, but placed in Map<String, Statement> for next use. In short, reuse Statement objects.
- **`BatchExecutor`**: Execute update (no select, JDBC batch processing does not support select), add all sql to the batch (addBatch()), and wait for unified execution (executeBatch()). It caches multiple Statement objects. After each Statement object is addedBatch(), wait for the executeBatch() batch to be executed one by one. Same as JDBC batch processing.

Scope: These features of `Executor` are strictly limited within the scope of the SqlSession life cycle.

### How to specify which Executor to use in MyBatis?

Note: I produced it

Answer: In the MyBatis configuration file, you can specify the default `ExecutorType` executor type, or you can manually pass the `ExecutorType` type parameter to the `DefaultSqlSessionFactory` method of creating a SqlSession.

### Can MyBatis map the Enum enumeration class?

Note: I produced it

Answer: MyBatis can map enumeration classes. Not only can it map enumeration classes, MyBatis can map any object to a column of the table. The mapping method is to customize a `TypeHandler` and implement the `setParameter()` and `getResult()` interface methods of `TypeHandler`. `TypeHandler` has two functions:

- First, complete the conversion from javaType to jdbcType;
- The second is to complete the conversion from jdbcType to javaType, which is embodied in two methods: `setParameter()` and `getResult()`, which respectively represent setting sql question mark placeholder parameters and obtaining column query results.

### In the MyBatis mapping file, if the A tag references the content of the B tag through include, can the B tag be defined after the A tag, or must it be defined in front of the A tag?

Note: I produced it

Answer: Although MyBatis parses the xml mapping file in order, the referenced B tag can still be defined anywhere, and MyBatis can correctly identify it.

The principle is that MyBatis parses the A tag and finds that the A tag references the B tag, but the B tag has not been parsed and does not exist yet. At this time, MyBatis will mark the A tag as unresolved, and then continue to parse the remaining tags, including the B tag. After all tags are parsed, MyBatis will re-parse the tags marked as unresolved. When parsing the A tag, the B tag already exists, and the A tag can be parsed normally.

### Briefly describe the mapping relationship between MyBatis’ xml mapping file and MyBatis’ internal data structure?

Note: I produced it

Answer: MyBatis encapsulates all xml configuration information into the All-In-One heavyweight object Configuration. In the xml mapping file, the `<parameterMap>` tag will be parsed into a `ParameterMap` object, and each of its child elements will be parsed into a ParameterMapping object. The `<resultMap>` tag will be parsed as a `ResultMap` object, and each of its child elements will be parsed as a `ResultMapping` object. Each `<select>, <insert>, <update>, <delete>` tag will be parsed into a `MappedStatement` object, and the sql in the tag will be parsed into a BoundSql object.

### Why is MyBatis a semi-automatic ORM mapping tool? What is the difference between it and fully automatic?

Note: I produced it

Answer: Hibernate is a fully automatic ORM mapping tool. When you use Hibernate to query related objects or related collection objects, you can obtain them directly based on the object relationship model, so it is fully automatic. When MyBatis queries related objects or related collection objects, it needs to be manually written sql to complete, so it is called a semi-automatic ORM mapping tool.

The interview questions seem to be very simple, but if you want to answer them correctly, you must be someone who has studied the source code in depth, rather than someone who only knows how to use it or is very familiar with it. All the above interview questions and their answers are covered in detail in my MyBatis series of blogs. There are detailed explanations and principle analysis.

<!-- @include: @article-footer.snippet.md -->

### Article recommendation

- [2W words comprehensive analysis of 9 design patterns in Mybatis](https://juejin.cn/post/7273516671574687759)
- [Implementing a MyBatis encryption and decryption plug-in from scratch](https://mp.weixin.qq.com/s/WUEAdFDwZsZ4EKO8ix0ijg)
- [MyBatis most complete user guide](https://juejin.cn/post/7051910683264286750)
- [Open your mind! It was the first time I saw MyBatis being used like this, and I was stunned for a moment. ](https://juejin.cn/post/7269390456530190376)
- [MyBatis actually also has concurrency problems](https://juejin.cn/post/7264921613551730722)