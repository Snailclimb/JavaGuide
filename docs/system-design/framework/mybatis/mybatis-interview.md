---
title: MyBatis常见面试题总结
description: MyBatis常见面试题详解，涵盖执行流程、Mapper动态代理、#{}与${}、动态SQL、结果映射、一级二级缓存、Executor、分页插件、批处理及Spring事务。
category: 框架
icon: "mdi:database-outline"
tag:
  - MyBatis
head:
  - - meta
    - name: keywords
      content: MyBatis面试题,MyBatis执行流程,Mapper动态代理,#{}与${},动态SQL,一级缓存,二级缓存,分页插件,BatchExecutor,MyBatis插件
---

> 本文最初整理自网络资料，原始出处已无法确认。本次重写以 MyBatis 3.5.x 官方文档和 MyBatis-Spring 官方文档为主要依据，并补充了缓存、批处理、Spring 事务和大结果集处理等高频问题。

## MyBatis 基础

### MyBatis 是什么？为什么说它是半自动 ORM？

MyBatis 是一款持久层框架。它封装了 JDBC 中创建连接、设置参数、执行 SQL、遍历结果集和关闭资源等重复工作，同时允许开发者自己编写 SQL，并把参数和查询结果映射为 Java 对象。

MyBatis 经常被称为半自动 ORM，原因在于 SQL、字段映射和关联查询通常仍由开发者控制。Hibernate/JPA 这类 ORM 更强调根据实体关系和映射元数据生成 SQL，MyBatis 则把 SQL 控制权留给开发者。

这种设计适合 SQL 复杂、需要精确优化或大量使用数据库特性的项目；代价是 SQL 和映射代码更多，数据库方言迁移、关联加载以及批量操作也需要开发者自己处理。

### MyBatis 和 JPA/Hibernate 有什么区别？

| 对比项     | MyBatis                            | JPA/Hibernate                        |
| ---------- | ---------------------------------- | ------------------------------------ |
| SQL        | 通常由开发者编写                   | 通常由框架根据映射生成               |
| 控制粒度   | 容易精确控制 SQL、索引和数据库特性 | 更关注对象模型和持久化状态           |
| 开发成本   | 映射和 SQL 较多                    | 常规 CRUD 代码较少                   |
| 数据库迁移 | 手写 SQL 可能依赖方言              | 标准查询的可移植性通常更好           |
| 关联查询   | 显式选择 Join 或嵌套查询           | 支持对象关联和抓取策略               |
| 常见风险   | SQL 分散、映射错误、拼接注入       | N+1、抓取范围过大、生成 SQL 难以控制 |

没有哪一种方案适合所有项目。简单 CRUD 多、领域模型稳定时，JPA/Hibernate 可以减少重复代码；报表、复杂查询和 SQL 优化较多时，MyBatis 更直接。也可以在同一个系统的不同模块中按需求选择。

### MyBatis 有哪些核心组件？

- **`SqlSessionFactoryBuilder`**：读取配置并创建 `SqlSessionFactory`。构建完成后通常就可以释放。
- **`SqlSessionFactory`**：创建 `SqlSession`，构建成本较高，通常在应用中保留一个实例。
- **`SqlSession`**：执行 SQL、管理事务并获取 Mapper。它不是线程安全的，应该限定在一次请求、一次方法或一次事务内。
- **`Configuration`**：保存全局设置、`MappedStatement`、`ResultMap`、`TypeHandler` 和插件等运行时元数据。
- **`MappedStatement`**：对应一个 `<select>`、`<insert>`、`<update>` 或 `<delete>` 映射。
- **`Executor`**：负责查询、更新、一级缓存和事务相关调用。
- **`StatementHandler`**：创建并操作 JDBC `Statement`。
- **`ParameterHandler`**：把参数设置到 `PreparedStatement`。
- **`ResultSetHandler`**：把 JDBC `ResultSet` 映射为 Java 对象。

`SqlSource` 保存 SQL 生成逻辑；真正执行时，它会根据参数生成 `BoundSql`，其中包含最终 SQL、参数映射和附加参数。

### SqlSessionFactory、SqlSession 和 Mapper 是线程安全的吗？

`SqlSessionFactory` 构建完成后可以在应用中共享。`SqlSession` 包含数据库连接、事务和一级缓存等可变状态，不应跨线程共享。通过某个 `SqlSession` 获取的 Mapper 代理也应遵循同样的生命周期。

MyBatis-Spring 中注入的 Mapper 由 `SqlSessionTemplate` 提供支持。`SqlSessionTemplate` 是线程安全的，它会为当前 Spring 事务找到对应的 `SqlSession`，并负责提交、回滚和关闭等生命周期管理。因此，Spring 单例 Service 可以注入 Mapper，但不要把手动创建的原生 `SqlSession` 保存为单例字段。

### ⭐️Mapper 接口的工作原理是什么？

MyBatis 会通过 JDK 动态代理为 Mapper 接口创建代理对象。调用 Mapper 方法时，大致会经过下面这条链路：

1. `MapperProxy` 拦截接口方法。
2. MyBatis 根据 Mapper 接口全限定名和方法名得到 Statement ID，例如 `com.example.UserMapper.selectById`。
3. `MapperMethod` 分析参数和返回类型，调用 `SqlSession` 对应的 `selectOne()`、`selectList()`、`insert()` 等方法。
4. `SqlSession` 根据 Statement ID 找到 `MappedStatement`，再交给 `Executor` 执行。
5. 查询结果经过 `ResultSetHandler` 映射后，按照 Mapper 方法声明的返回类型返回。

Mapper 接口本身通常没有实现类。接口全限定名应与 XML 的 `namespace` 一致，方法名应与映射语句的 `id` 一致。

### Mapper 接口的方法可以重载吗？

Java 允许在 Mapper 接口中声明重载方法，但 MyBatis 查找映射语句时使用“接口全限定名 + 方法名”，不会把参数类型加入 Statement ID。XML 中同一 `namespace` 下也不能定义两个相同 `id` 的映射。

多个重载方法在少数情况下可以共用同一个动态 SQL，但 MyBatis 无法像 Java 编译器那样根据参数签名选择不同 SQL，而且参数名、返回类型和动态条件很容易发生冲突。实际项目应使用不同的方法名表达不同查询。

### ⭐️MyBatis 执行一条查询的完整流程是什么？

可以按“启动期解析”和“运行期执行”两部分回答。

启动期：

1. 读取 MyBatis 全局配置，创建 `Configuration`。
2. 解析 Mapper XML 或注解，把 SQL、参数映射、结果映射等注册为 `MappedStatement`、`ResultMap` 和 `SqlSource`。
3. 创建 `SqlSessionFactory`，Spring 项目再注册 Mapper 代理。

运行期：

1. 调用 Mapper 代理，根据接口名和方法名找到 `MappedStatement`。
2. `SqlSource` 根据实参生成 `BoundSql`。
3. `Executor` 先按规则检查一级缓存，未命中时继续访问数据库。
4. `StatementHandler` 创建 JDBC Statement，`ParameterHandler` 设置参数。
5. JDBC 执行 SQL，`ResultSetHandler` 将结果映射为对象。
6. 结果按规则写入缓存并返回；事务结束后提交或回滚。

插件可能包裹 `Executor`、`StatementHandler`、`ParameterHandler` 和 `ResultSetHandler`，因此分页、审计和 SQL 改写可能插入这条链路。

## 参数处理与动态 SQL

### ⭐️`#{}` 和 `${}` 有什么区别？

在映射 SQL 中：

- `#{}` 会生成 JDBC 参数占位符 `?`，MyBatis 再通过 `ParameterHandler` 和 `TypeHandler` 设置参数。参数作为数据传给数据库，通常能防止该位置的 SQL 注入。
- `${}` 会把表达式结果直接替换进 SQL 文本，不会生成绑定参数。它可以改变列名、表名、排序方向或整段 SQL，也因此存在注入风险。

```xml
<select id="findByName" resultType="User">
  SELECT id, name
  FROM users
  WHERE name = #{name}
  ORDER BY ${orderBy}
</select>
```

`name` 应使用 `#{}`。`orderBy` 如果直接来自请求，攻击者就能改变 SQL；应在 Java 代码中把外部值映射为服务端预定义的列名和排序方向。

`${}` 还会出现在 MyBatis 配置文件中，例如 `${driver}`、`${url}`。这种写法属于配置属性替换，通常在解析配置时完成，与映射 SQL 中的动态文本替换场景不同。

### Mapper 方法有多个参数时，如何引用参数？

推荐使用 `@Param` 明确参数名：

```java
User selectByTenantAndId(
    @Param("tenantId") Long tenantId,
    @Param("userId") Long userId
);
```

```xml
<select id="selectByTenantAndId" resultType="User">
  SELECT id, name
  FROM users
  WHERE tenant_id = #{tenantId}
    AND id = #{userId}
</select>
```

没有 `@Param` 时，MyBatis 会提供 `param1`、`param2` 等通用名称；项目使用 `-parameters` 编译且开启 `useActualParamName` 时，也可以读取实际参数名。不过，编译配置变化可能让实际参数名不可用，公共 Mapper 使用 `@Param` 更稳定。

集合参数可以通过 `collection`、`list` 或 `array` 等名称访问，具体名称与参数类型和 `@Param` 有关。给集合显式添加 `@Param("ids")`，再在 `<foreach collection="ids">` 中使用，可读性更好。

### ⭐️MyBatis 动态 SQL 有哪些标签？原理是什么？

常用标签包括：

- `<if>`：按条件拼接 SQL。
- `<choose>`、`<when>`、`<otherwise>`：从多个分支中选择一个。
- `<trim>`、`<where>`、`<set>`：处理前后缀、多余的 `AND`、逗号等问题。
- `<foreach>`：遍历集合，常用于 `IN` 条件和批量插入。
- `<bind>`：创建可在当前动态 SQL 中使用的变量。

MyBatis 解析动态 SQL 时，会把 XML 节点构造成一棵 `SqlNode` 组合结构。执行 Mapper 方法后，各节点使用参数上下文和 OGNL 表达式决定是否输出 SQL，最终由 `DynamicSqlSource` 生成 `BoundSql`。

```xml
<select id="find" resultType="User">
  SELECT id, name, status
  FROM users
  <where>
    <if test="name != null and name != ''">
      name = #{name}
    </if>
    <if test="status != null">
      AND status = #{status}
    </if>
  </where>
</select>
```

`<where>` 只在内部有内容时输出 `WHERE`，并处理开头多余的 `AND` 或 `OR`。

### Mapper XML 中有哪些常用元素？

- `<cache>`、`<cache-ref>`：配置当前命名空间的二级缓存或引用其他命名空间缓存。
- `<resultMap>`：定义结果集和对象之间的映射。
- `<sql>`、`<include>`：定义和复用 SQL 片段。
- `<select>`、`<insert>`、`<update>`、`<delete>`：定义映射语句。
- `<selectKey>`：在插入前或插入后执行主键查询。

旧资料常提到 `<parameterMap>`，但它已经被弃用，应该使用内联参数映射。

`<sql>` 可以定义在引用它的 `<include>` 后面。MyBatis 解析 Mapper XML 时，会先收集并注册当前文件中的 `<sql>` 片段，再解析增删改查语句，所以不要求被引用片段必须写在前面。对于跨资源且暂时无法解析的引用，MyBatis 还会放入待处理集合并在相关定义加载后重试。不过，映射文件仍应按官方文档建议的顺序组织，避免循环引用和难以维护的跨文件依赖。

### Mapper XML 会被解析成哪些内部对象？

- 每个 `<select>`、`<insert>`、`<update>`、`<delete>` 会注册为一个 `MappedStatement`。
- 静态 SQL 通常对应 `RawSqlSource`，动态 SQL 通常对应 `DynamicSqlSource`。
- 执行时，`SqlSource` 生成 `BoundSql`，其中包含最终 SQL 和 `ParameterMapping` 列表。
- `<resultMap>` 会解析为 `ResultMap`，子映射解析为 `ResultMapping`。
- `<cache>` 会创建并装饰命名空间级缓存实例。

这些对象最终保存在 `Configuration` 中。应用运行期间通常只读取这些元数据，不应随意动态修改全局 `Configuration`。

## 结果映射

### `resultType` 和 `resultMap` 有什么区别？

`resultType` 直接指定返回对象类型，适合列名与属性名容易自动匹配的简单查询。SQL 列别名也可以帮助匹配，例如 `user_name AS userName`。

`resultMap` 可以显式描述列与属性的关系，还支持构造器映射、类型处理器、鉴别器以及嵌套的 `association`、`collection`，适合复杂对象和关联查询。

```xml
<resultMap id="userMap" type="User">
  <id property="id" column="user_id" />
  <result property="userName" column="user_name" />
</resultMap>
```

自动映射可以配合 `mapUnderscoreToCamelCase=true` 把 `user_name` 映射到 `userName`。复杂 Join 查询不宜过度依赖全自动映射，重名列应使用别名，并在 `resultMap` 中明确配置。

### ⭐️`association` 和 `collection` 有什么区别？

- `<association>` 映射“有一个”关系，例如订单对应一个用户。
- `<collection>` 映射“有多个”关系，例如用户对应多个订单。

关联加载有两种常见方式：

1. **嵌套结果映射（Nested Results）**：通过 Join 一次查出主对象和关联对象，再根据 `<id>` 等映射合并重复行。SQL 次数少，但结果集可能膨胀。
2. **嵌套查询（Nested Select）**：先查主对象，再为关联属性执行另一个映射语句。结构简单，也支持延迟加载，但容易产生 N+1 查询。

使用 Join 映射一对多时，主对象和子对象都应正确配置 `<id>`。MyBatis 会依据这些标识复用已有对象并组装集合；缺少标识可能增加对象创建和映射成本，甚至得到错误结果。

### 什么是 N+1 查询？如何避免？

先查询 N 条主记录，再为每条记录查询一次关联对象，总共执行 1 + N 次 SQL，这就是常说的 N+1 查询。嵌套查询和延迟加载都可能触发它。

常见处理方式有：

- 使用 Join 和嵌套结果映射一次查询。
- 先批量查询主记录，再根据主键集合批量查询关联记录，最后在内存中组装。
- GraphQL/DataLoader 一类场景对同一批请求做批量合并。
- 只在确实会访问少量关联属性时使用延迟加载，并通过 SQL 监控确认查询次数。

Join 也不是越多越好。一对多层级较深时，笛卡尔积会让结果集急剧增大，分两次批量查询往往更容易控制。

### MyBatis 支持延迟加载吗？原理是什么？

MyBatis 可以对通过嵌套查询配置的 `association` 和 `collection` 做延迟加载。开启 `lazyLoadingEnabled` 后，MyBatis 使用代理对象保存待加载属性；访问相关属性时，代理再执行登记的查询并写回结果。

`fetchType="lazy"` 或 `fetchType="eager"` 可以覆盖单个关联的全局设置。MyBatis 3.5.x 默认使用 Javassist 创建延迟加载代理；CGLIB 已在 3.5.10 起被弃用。

延迟加载有两个常见问题：一是访问集合时触发 N+1；二是对象离开 `SqlSession` 或事务作用域后才访问属性，可能无法正常加载。接口返回 DTO 时，通常更适合在 Service 内明确查齐所需数据。

### TypeHandler 有什么作用？枚举如何映射？

`TypeHandler` 负责 Java 类型与 JDBC 类型之间的转换：设置 `PreparedStatement` 参数时把 Java 值转成 JDBC 值，读取 `ResultSet` 时再转回 Java 值。

MyBatis 默认使用 `EnumTypeHandler` 按枚举名称存储，例如 `ACTIVE`。`EnumOrdinalTypeHandler` 按枚举序号存储，但在枚举成员调整顺序后容易产生错误，一般不建议把 ordinal 当作长期数据库值。

业务枚举通常有稳定的 `code` 字段，可以自定义 `BaseTypeHandler` 完成 `code` 与枚举对象的映射。注册时要明确 `javaType`、必要的 `jdbcType` 和空值处理规则。

### 查询结果为空或映射不完整，应该如何排查？

可以按下面的顺序检查：

1. SQL 是否真的返回数据，参数值和 JDBC 类型是否正确。
2. `namespace`、Statement ID 和 Mapper 方法是否对应。
3. 列别名是否与 Java 属性一致，是否开启了预期的驼峰映射。
4. `resultMap` 的 `column`、`property`、`javaType` 和 `typeHandler` 是否正确。
5. Join 是否出现同名列覆盖，嵌套结果的 `<id>` 是否完整。
6. 字段是否没有 Setter、构造器参数不匹配，或 Lombok 生成的方法与预期不同。
7. 一级缓存是否返回了同一 `SqlSession` 中较早的查询结果。

打开 MyBatis SQL 日志时还要同时观察最终参数，只有带占位符的 SQL 不能说明实际查询条件。

### `selectOne()` 查询到多条记录会怎样？

没有记录时，`selectOne()` 返回 `null`；恰好一条时返回该对象；超过一条时抛出 `TooManyResultsException`。它不会自动取第一条。

如果业务要求结果唯一，应该通过唯一约束保证数据一致性。只在业务明确允许“任选一条”或“取最新一条”时使用排序和 `LIMIT 1`，不能用它掩盖脏数据。

## MyBatis 缓存

### ⭐️MyBatis 一级缓存是什么？

一级缓存是 `SqlSession` 级本地缓存，默认作用域为 `SESSION`。同一个 `SqlSession` 中，两次查询的 Statement、最终 SQL、参数、分页和环境等信息形成相同缓存键时，第二次查询可以直接返回缓存结果。

一级缓存还用于处理嵌套结果映射中的循环引用。把 `localCacheScope` 设置为 `STATEMENT` 后，本地缓存只在一次语句执行期间使用，不再跨两次查询共享。

下面这些操作会让相关一级缓存失效或清空：

- 执行 `insert`、`update`、`delete`。
- 调用 `clearCache()`。
- 提交、回滚或关闭 `SqlSession`。
- 查询语句配置 `flushCache="true"`。

### Spring 项目中为什么感觉一级缓存没有生效？

一级缓存跟随真实 `SqlSession`。在 Spring 中，`SqlSessionTemplate` 会复用绑定到当前事务的 `SqlSession`；如果没有事务，每次 Mapper 调用完成后会关闭本次创建的 Session，下一次调用可能已经是新的 Session。

因此，同一个 Service 方法中连续调用两次 Mapper，如果没有进入 Spring 事务，不能假设它们一定共享一级缓存。也不应为了“命中缓存”随意扩大事务范围，事务长度仍应由业务一致性决定。

### ⭐️MyBatis 二级缓存是什么？如何开启？

二级缓存绑定到 Mapper XML 的 `namespace`，可以被不同 `SqlSession` 共享。全局 `cacheEnabled` 默认开启，但具体命名空间仍要配置 `<cache/>`，或者通过 `<cache-ref>` 引用其他命名空间缓存。

```xml
<mapper namespace="com.example.UserMapper">
  <cache />

  <select id="selectById" resultType="User" useCache="true">
    SELECT id, name FROM users WHERE id = #{id}
  </select>
</mapper>
```

查询结果通常要等事务提交后才对其他 Session 的二级缓存可见。该命名空间执行增删改时，默认会清空缓存。`useCache` 和 `flushCache` 可以在单条语句上调整行为。

默认缓存配置可能需要结果对象支持序列化；如果换成第三方缓存或调整 `readOnly`，对象复制和线程安全语义也会变化，需要按具体实现确认。

### 为什么生产项目要谨慎使用 MyBatis 二级缓存？

- 缓存按 `namespace` 组织，跨 Mapper 修改同一张表时，其他命名空间的缓存不会自动知道。
- 数据可能被其他应用、脚本或直接 SQL 修改，MyBatis 无法主动感知。
- 本地二级缓存只存在于当前应用实例，多实例之间不会自动同步。
- Join 查询依赖多张表，任一表变化都可能让结果过期。
- 缓存对象较大或命中率较低时，会占用内存却收效有限。

需要跨实例共享和明确失效策略时，通常会在业务层使用 Redis、Caffeine 等缓存方案，并把数据库作为权威数据源。MyBatis 二级缓存更适合数据变化少、读多写少、依赖关系清晰的查询。

### 一级缓存可能造成脏读吗？

同一个 `SqlSession` 第一次查询后，如果数据库被另一个事务或应用更新，本 Session 再次执行相同查询可能仍返回一级缓存中的旧对象。这不是数据库隔离级别意义上的脏读，但会表现为应用看到旧数据。

需要获取外部最新数据时，可以调用 `clearCache()`、缩短 Session 生命周期、将 `localCacheScope` 设置为 `STATEMENT`，或者让查询使用新的事务/Session。不要在一次事务中随意清缓存后期待数据库一定可见其他事务的新值，最终结果仍受数据库隔离级别影响。

## Executor、批处理与插件

### MyBatis 有哪些 Executor？

| ExecutorType | 行为                                                               |
| ------------ | ------------------------------------------------------------------ |
| `SIMPLE`     | 每次执行创建新的 `PreparedStatement`，是默认类型                   |
| `REUSE`      | 在当前 `SqlSession` 内复用 SQL 对应的 `PreparedStatement`          |
| `BATCH`      | 对更新语句复用 Statement 并调用 JDBC Batch，查询前或提交时刷新批次 |

三种 Executor 的作用范围都跟随 `SqlSession`。`REUSE` 复用 Statement，不等于复用查询结果；查询结果复用由缓存处理。

可以通过全局 `defaultExecutorType`、`openSession(ExecutorType)` 或 `SqlSessionTemplate` 构造参数选择执行器。Spring 同一事务中不要切换 ExecutorType；确需使用不同类型时，应使用独立事务或在事务外执行。

### ⭐️MyBatis 如何执行批处理？

可以使用 `ExecutorType.BATCH`，重复调用 Mapper 的 `insert`、`update` 或 `delete`，最后执行 `flushStatements()` 或提交事务。`BatchExecutor` 会按 Statement 和 SQL 组织批次，再调用 JDBC `addBatch()`、`executeBatch()`。

批处理需要注意：

- 不要一次积累无限多数据，应按固定批次 `flushStatements()` 并清理会话缓存。
- 中间执行查询会触发已有批次刷新。
- 单次 Mapper 调用的返回值不一定是最终受影响行数，批次结果要在刷新后获取。
- 发生 `BatchUpdateException` 时，前面部分语句可能已经由数据库执行，要结合事务回滚和驱动返回结果判断。
- 批量插入 SQL、JDBC Batch 和数据库提供的 Bulk Load 是不同方案，性能和主键回填能力也不同。

在 MyBatis-Spring 中不要手动提交或关闭 `SqlSessionTemplate`，应让 Spring 事务管理提交和回滚。

### 批量插入可以回填主键吗？

在数据库和 JDBC 驱动支持的前提下，可以通过 `useGeneratedKeys="true"` 与 `keyProperty` 回填自增主键。参数是对象列表时，驱动需要正确返回每一行的 generated keys，MyBatis 才能依次写回对象。

```xml
<insert id="batchInsert"
        useGeneratedKeys="true"
        keyProperty="id">
  INSERT INTO users (name, status)
  VALUES
  <foreach collection="list" item="item" separator=",">
    (#{item.name}, #{item.status})
  </foreach>
</insert>
```

不同数据库、驱动版本和批量 SQL 写法的支持差异较大，应通过集成测试验证主键数量和顺序。不能依赖 JDBC generated keys 时，可以在应用侧生成 UUID、雪花 ID，或者使用 `<selectKey>` 按数据库能力获取主键。

### `useGeneratedKeys` 和 `<selectKey>` 有什么区别？

- `useGeneratedKeys` 使用 JDBC `getGeneratedKeys()`，常用于数据库自增主键。
- `<selectKey>` 会额外执行一条查询，可以配置在插入前或插入后运行，适合序列、特定数据库函数或遗留数据库。

`keyProperty` 指定回填到哪个 Java 属性，必要时用 `keyColumn` 指定数据库列。批量插入、复合主键和多数据源场景要单独验证，不能根据单条插入成功就推断批量行为一致。

### ⭐️MyBatis 如何分页？分页插件的原理是什么？

MyBatis 提供 `RowBounds`，但它不会自动给 SQL 加 `LIMIT`。默认情况下，仍然执行原 SQL，再由结果集处理逻辑跳过 `offset` 并限制返回数量。数据量大或 offset 很深时，这种方式可能读取大量无用记录。

生产查询通常使用下面两种方式：

- 在 SQL 中明确编写数据库支持的物理分页。
- 使用 PageHelper 等分页插件，在执行前根据数据库方言改写 SQL，并按需生成 Count 查询。

分页插件通过 MyBatis 插件机制拦截 `Executor` 或 `StatementHandler` 等对象，读取 `MappedStatement`、`BoundSql` 和分页参数，再生成新的分页 SQL。插件仍要处理方言、参数顺序、Count SQL、线程上下文清理和多数据源等问题。

深度分页即使加了 `LIMIT offset, size` 仍可能扫描并丢弃大量记录。可以使用基于稳定排序键的游标分页，例如 `WHERE id > ? ORDER BY id LIMIT ?`。

### MyBatis 插件的原理是什么？如何编写？

MyBatis 插件可以拦截下面四类组件的特定方法：

- `Executor`
- `StatementHandler`
- `ParameterHandler`
- `ResultSetHandler`

插件实现 `Interceptor`，使用 `@Intercepts` 和 `@Signature` 声明目标接口、方法和参数类型。MyBatis 创建组件时会调用 `pluginAll()`，符合签名的目标对象会被 JDK 动态代理包裹；调用目标方法时进入 `intercept()`。

```java
@Intercepts({
    @Signature(
        type = Executor.class,
        method = "update",
        args = {MappedStatement.class, Object.class}
    )
})
public class AuditInterceptor implements Interceptor {
    @Override
    public Object intercept(Invocation invocation) throws Throwable {
        // 只做必要处理，并保证最终调用原方法
        return invocation.proceed();
    }
}
```

插件会进入所有匹配 SQL 的主链路，代码应尽量轻量，并避免修改共享的 `MappedStatement`。多个插件的执行顺序受配置顺序和代理嵌套影响，分页、审计、数据权限插件同时改写 SQL 时要做组合测试。

## 事务、性能与工程问题

### MyBatis-Spring 中事务是如何工作的？

MyBatis-Spring 使用 `SqlSessionTemplate` 把 `SqlSession` 绑定到当前 Spring 事务。同一事务、同一 `SqlSessionFactory` 的 Mapper 调用会使用同一个 Session 和数据库连接；方法正常结束时提交，抛出符合回滚规则的异常时回滚。

常见注意点有：

- `@Transactional` 要通过 Spring 代理调用，自调用可能绕过事务拦截。
- 事务管理器和 `SqlSessionFactory` 应使用同一个 `DataSource`。
- 不要对 Spring 管理的 `SqlSession` 手动调用 `commit()`、`rollback()` 或 `close()`。
- 异步线程不会自动继承原线程事务。
- 捕获异常后不再抛出，可能让 Spring 误判为正常完成。

### 为什么 Mapper 调用成功了，数据却没有提交？

常见原因包括：

- 手动使用 `openSession()` 时默认不是自动提交，也没有调用 `commit()`。
- Spring 事务最终发生回滚，或事务方法抛出了运行时异常。
- `@Transactional` 因自调用、非 Spring 管理对象或方法可见性等原因没有生效。
- 写入和查询使用了不同数据源，读库复制尚未完成。
- 使用 `BatchExecutor` 后没有刷新批次或提交事务。

排查时同时观察事务日志、数据源、连接 auto-commit 状态和最终异常，不能只看 Mapper 方法有没有抛错。

### 如何使用 MyBatis 处理大结果集？

一次性返回 `List` 会把所有结果和映射对象放进内存。数据量大时可以考虑：

- 使用 `Cursor<T>` 逐条迭代结果。
- 使用 `ResultHandler` 在回调中处理每行数据。
- 按稳定排序键分批查询。
- 数据导出时边读边写，并限制缓冲区大小。

`Cursor` 依赖尚未关闭的 `SqlSession`、连接和结果集，消费过程必须位于它们的生命周期内。`fetchSize` 只是给 JDBC 驱动的提示，不同数据库可能还要求特定游标或连接配置。流式查询期间占用连接时间较长，应设置超时、限流并避免在循环中再触发 N+1 查询。

### MyBatis SQL 性能问题如何排查？

1. 获取最终 SQL 和实际参数，确认动态条件与预期一致。
2. 在数据库中查看执行计划、扫描行数、返回行数、排序和临时表。
3. 检查索引、隐式类型转换、函数计算、模糊匹配和深度分页。
4. 检查是否出现 N+1、一次加载过多列、批量操作退化为单条循环。
5. 区分连接池等待、数据库执行、结果集传输和 Java 对象映射耗时。
6. 再检查插件、TypeHandler、日志和缓存是否增加额外开销。

MyBatis 只是 SQL 执行链的一部分。“Mapper 方法慢”不一定是 SQL 本身慢，也可能是连接池耗尽、结果集过大或对象映射占用大量 CPU。

### 使用 MyBatis 如何避免 SQL 注入？

- 值参数默认使用 `#{}`，不要把用户输入拼接到 SQL。
- 表名、列名和排序方向通过服务端枚举映射为固定 SQL 片段。
- 动态 SQL 只控制是否输出受信任片段，不执行用户提供的表达式。
- 数据库账号遵循最小权限，降低注入成功后的影响。
- 对插件和 SQL Provider 中的字符串拼接同样做安全审查。

参数化查询只能保护参数所在的位置。`ORDER BY ${sort}`、`${tableName}` 和注解 Provider 返回的拼接 SQL 仍然需要白名单。

### 不同 Mapper XML 中的 `id` 可以重复吗？

可以，前提是 `namespace` 不同。`MappedStatement` 的完整 ID 是 `namespace + id`，例如：

```text
com.example.UserMapper.selectById
com.example.OrderMapper.selectById
```

同一 `namespace` 内不能注册两个相同完整 ID。Mapper XML 与接口配套使用时，`namespace` 一般写 Mapper 接口的全限定名。

### MyBatis 使用时还有哪些常见误区？

- 认为使用 MyBatis 就不会有 SQL 注入，忽略 `${}`、Provider 和插件中的字符串拼接。
- 把 Mapper 方法重载当成可以映射多条同名 SQL。
- 认为 `RowBounds` 一定是数据库物理分页。
- 把二级缓存当成跨应用一致的业务缓存。
- 在单例对象中保存原生 `SqlSession`。
- 使用枚举 ordinal 入库，却在后续版本调整枚举顺序。
- 在循环里访问延迟加载属性，造成 N+1。
- 批量写入只看方法调用次数，没有确认 JDBC 驱动是否真正执行 Batch。
- 用 `LIMIT 1` 掩盖本应由唯一约束保证的数据问题。

## 参考资料

- [MyBatis 3 官方文档：Configuration](https://mybatis.org/mybatis-3/configuration.html)
- [MyBatis 3 官方文档：Mapper XML Files](https://mybatis.org/mybatis-3/sqlmap-xml.html)
- [MyBatis 3 官方文档：Dynamic SQL](https://mybatis.org/mybatis-3/dynamic-sql.html)
- [MyBatis 3 官方文档：Java API](https://mybatis.org/mybatis-3/java-api.html)
- [MyBatis-Spring 官方文档：Using an SqlSession](https://mybatis.org/spring/sqlsession.html)
- [MyBatis Mapper 方法重载讨论](https://github.com/Snailclimb/JavaGuide/issues/1122)

## 文章推荐

- [2W 字全面剖析 MyBatis 中的 9 种设计模式](https://juejin.cn/post/7273516671574687759)
- [从零开始实现一个 MyBatis 加解密插件](https://mp.weixin.qq.com/s/WUEAdFDwZsZ4EKO8ix0ijg)
- [MyBatis 最全使用指南](https://juejin.cn/post/7051910683264286750)
- [MyBatis 居然也有并发问题](https://juejin.cn/post/7264921613551730722)

<!-- @include: @article-footer.snippet.md -->
