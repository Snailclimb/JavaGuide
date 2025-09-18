---
title: 为什么前后端都要做数据校验
category: 系统设计
tag:
  - 安全
---

> 相关面试题：
>
> - 前端做了校验，后端还还需要做校验吗？
> - 前端已经做了数据校验，为什么后端还需要再做一遍同样（甚至更严格）的校验呢？
> - 前端/后端需要对哪些内容进行校验？

咱们平时做 Web 开发，不管是写前端页面还是后端接口，都离不开跟数据打交道。那怎么保证这些传来传去的数据是靠谱的、安全的呢？这就得靠**数据校验**了。而且，这活儿，前端得干，后端**更得干**，还得加上**权限校验**这道重要的“锁”，缺一不可！

为啥这么说？你想啊，前端校验主要是为了用户体验和挡掉一些明显的“瞎填”数据，但懂点技术的人绕过前端校验简直不要太轻松（比如直接用 Postman 之类的工具发请求）。所以，**后端校验才是咱们系统安全和数据准确性的最后一道，也是最硬核的防线**。它得确保进到系统里的数据不仅格式对，还得符合业务规矩，最重要的是，执行这个操作的人得有**权限**！

![](https://oss.javaguide.cn/github/javaguide/system-design/security/user-input-validation.png)

## 前端校验

前端校验就像个贴心的门卫，主要目的是在用户填数据的时候，就赶紧告诉他哪儿不对，让他改，省得提交了半天，结果后端说不行，还得重来。这样做的好处显而易见：

1. **用户体验好：** 输入时就有提示，错了马上知道，改起来方便，用户感觉流畅不闹心。
2. **减轻后端压力：** 把一些明显格式错误、必填项没填的数据在前端就拦下来，减少了发往后端的无效请求，省了服务器资源和网络流量。需要注意的是，后端同样还是要校验，只是加上前端校验可以减少很多无效请求。

那前端一般都得校验点啥呢？

- **必填项校验:** 最基本的，该填的地儿可不能空着。
- **格式校验:** 比如邮箱得像个邮箱样儿 (xxx@xx.com)，手机号得是 11 位数字等。正则表达式这时候就派上用场了。
- **重复输入校验：** 确保两次输入的内容一致，例如注册时的“确认密码”字段。
- **范围/长度校验:** 年龄不能是负数吧？密码长度得在 6 到 20 位之间吧？这种都得看着。
- **合法性/业务校验:** 比如用户名是不是已经被注册了？选的商品还有没有库存？这得根据具体业务来，需要配合后端来做。
- **文件上传校验：**限制文件类型（如仅支持 `.jpg`、`.png` 格式）和文件大小。
- **安全性校验:** 防范像 XSS（跨站脚本攻击）这种坏心思，对用户输入的东西做点处理，别让人家写的脚本在咱们页面上跑起来。
- ...等等，根据业务需求来。

总之，前端校验的核心是 **引导用户正确输入** 和 **提升交互体验**。

## 后端校验

前端校验只是第一道防线，虽然提升了用户体验，但毕竟可以被绕过，真正起决定性作用的是后端校验。后端需要对所有前端传来的数据都抱着“可能有问题”的态度，进行全面审查。后端校验不仅要覆盖前端的基本检查（如格式、范围、长度等），还需要更严格、更深入的验证，确保系统的安全性和数据的一致性。以下是后端校验的重点内容：

1. **完整性校验:** 接口文档中明确要求的字段必须存在，例如 `userId` 和 `orderId`。如果缺失任何必需字段，后端应立即返回错误，拒绝处理请求。
2. **合法性/存在性校验:** 验证传入的数据是否真实有效。例如，传过来的 `productId` 是否存在于数据库中？`couponId` 是否已经过期或被使用？这通常需要通过查库或调用其他服务来确认。
3. **一致性校验:** 针对涉及多个数据对象的操作，验证它们是否符合业务逻辑。例如，更新订单状态前，需要确保订单的当前状态允许修改，不能直接从“未支付”跳到“已完成”。一致性校验是保证数据流转正确性的关键。
4. **安全性校验:** 后端必须防范各种恶意攻击，包括但不限于 XSS、SQL 注入等。所有外部输入都应进行严格的过滤和验证，例如使用参数化查询防止 SQL 注入，或对返回的 HTML 数据进行转义，避免跨站脚本攻击。
5. ...基本上，前端能做的校验，后端为了安全都得再来一遍。

在 Java 后端，每次都手写 if-else 来做这些基础校验太累了。好在 Java 社区给我们提供了 **Bean Validation** 这套标准规范。它允许我们用**注解**的方式，直接在 JavaBean（比如我们的 DTO 对象）的属性上声明校验规则，非常方便。

- **JSR 303 (1.0):** 打下了基础，引入了 `@NotNull`, `@Size`, `@Min`, `@Max` 这些老朋友。
- **JSR 349 (1.1):** 增加了对方法参数和返回值的校验，还有分组校验等增强。
- **JSR 380 (2.0):** 拥抱 Java 8，支持了新的日期时间 API，还加了 `@NotEmpty`, `@NotBlank`, `@Email` 等更实用的注解。

早期的 Spring Boot (大概 2.3.x 之前): spring-boot-starter-web 里自带了 `hibernate-validator`，你啥都不用加。

Spring Boot 2.3.x 及之后: 为了更灵活，校验相关的依赖被单独拎出来了。你需要手动添加 `spring-boot-starter-validation` 依赖：

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-validation</artifactId>
</dependency>
```

Bean Validation 规范及其实现（如 Hibernate Validator）提供了丰富的注解，用于声明式地定义校验规则。以下是一些常用的注解及其说明：

- `@NotNull`: 检查被注解的元素（任意类型）不能为 `null`。
- `@NotEmpty`: 检查被注解的元素（如 `CharSequence`、`Collection`、`Map`、`Array`）不能为 `null` 且其大小/长度不能为 0。注意：对于字符串，`@NotEmpty` 允许包含空白字符的字符串，如 `" "`。
- `@NotBlank`: 检查被注解的 `CharSequence`（如 `String`）不能为 `null`，并且去除首尾空格后的长度必须大于 0。（即，不能为空白字符串）。
- `@Null`: 检查被注解的元素必须为 `null`。
- `@AssertTrue` / `@AssertFalse`: 检查被注解的 `boolean` 或 `Boolean` 类型元素必须为 `true` / `false`。
- `@Min(value)` / `@Max(value)`: 检查被注解的数字类型（或其字符串表示）的值必须大于等于 / 小于等于指定的 `value`。适用于整数类型（`byte`、`short`、`int`、`long`、`BigInteger` 等）。
- `@DecimalMin(value)` / `@DecimalMax(value)`: 功能类似 `@Min` / `@Max`，但适用于包含小数的数字类型（`BigDecimal`、`BigInteger`、`CharSequence`、`byte`、`short`、`int`、`long`及其包装类）。 `value` 必须是数字的字符串表示。
- `@Size(min=, max=)`: 检查被注解的元素（如 `CharSequence`、`Collection`、`Map`、`Array`）的大小/长度必须在指定的 `min` 和 `max` 范围之内（包含边界）。
- `@Digits(integer=, fraction=)`: 检查被注解的数字类型（或其字符串表示）的值，其整数部分的位数必须 ≤ `integer`，小数部分的位数必须 ≤ `fraction`。
- `@Pattern(regexp=, flags=)`: 检查被注解的 `CharSequence`（如 `String`）是否匹配指定的正则表达式 (`regexp`)。`flags` 可以指定匹配模式（如不区分大小写）。
- `@Email`: 检查被注解的 `CharSequence`（如 `String`）是否符合 Email 格式（内置了一个相对宽松的正则表达式）。
- `@Past` / `@Future`: 检查被注解的日期或时间类型（`java.util.Date`、`java.util.Calendar`、JSR 310 `java.time` 包下的类型）是否在当前时间之前 / 之后。
- `@PastOrPresent` / `@FutureOrPresent`: 类似 `@Past` / `@Future`，但允许等于当前时间。
- ……

当 Controller 方法使用 `@RequestBody` 注解来接收请求体并将其绑定到一个对象时，可以在该参数前添加 `@Valid` 注解来触发对该对象的校验。如果验证失败，它将抛出`MethodArgumentNotValidException`。

```java
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Person {
    @NotNull(message = "classId 不能为空")
    private String classId;

    @Size(max = 33)
    @NotNull(message = "name 不能为空")
    private String name;

    @Pattern(regexp = "((^Man$|^Woman$|^UGM$))", message = "sex 值不在可选范围")
    @NotNull(message = "sex 不能为空")
    private String sex;

    @Email(message = "email 格式不正确")
    @NotNull(message = "email 不能为空")
    private String email;
}


@RestController
@RequestMapping("/api")
public class PersonController {
    @PostMapping("/person")
    public ResponseEntity<Person> getPerson(@RequestBody @Valid Person person) {
        return ResponseEntity.ok().body(person);
    }
}
```

对于直接映射到方法参数的简单类型数据（如路径变量 `@PathVariable` 或请求参数 `@RequestParam`），校验方式略有不同：

1. **在 Controller 类上添加 `@Validated` 注解**：这个注解是 Spring 提供的（非 JSR 标准），它使得 Spring 能够处理方法级别的参数校验注解。**这是必需步骤。**
2. **将校验注解直接放在方法参数上**：将 `@Min`, `@Max`, `@Size`, `@Pattern` 等校验注解直接应用于对应的 `@PathVariable` 或 `@RequestParam` 参数。

一定一定不要忘记在类上加上 `@Validated` 注解了，这个参数可以告诉 Spring 去校验方法参数。

```java
@RestController
@RequestMapping("/api")
@Validated // 关键步骤 1: 必须在类上添加 @Validated
public class PersonController {

    @GetMapping("/person/{id}")
    public ResponseEntity<Integer> getPersonByID(
            @PathVariable("id")
            @Max(value = 5, message = "ID 不能超过 5") // 关键步骤 2: 校验注解直接放在参数上
            Integer id
    ) {
        // 如果传入的 id > 5，Spring 会在进入方法体前抛出 ConstraintViolationException 异常。
        // 全局异常处理器同样需要处理此异常。
        return ResponseEntity.ok().body(id);
    }

    @GetMapping("/person")
    public ResponseEntity<String> findPersonByName(
            @RequestParam("name")
            @NotBlank(message = "姓名不能为空") // 同样适用于 @RequestParam
            @Size(max = 10, message = "姓名长度不能超过 10")
            String name
    ) {
        return ResponseEntity.ok().body("Found person: " + name);
    }
}
```

Bean Validation 主要解决的是**数据格式、语法层面**的校验。但光有这个还不够。

## 权限校验

数据格式都验过了，没问题。但是，**这个操作，当前登录的这个用户，他有权做吗？** 这就是**权限校验**要解决的问题。比如：

- 普通用户能修改别人的订单吗？（不行）
- 游客能访问管理员后台接口吗？（不行）
- 游客能管理其他用户的信息吗？（不行）
- VIP 用户能使用专属的优惠券吗？（可以）
- ……

权限校验发生在**数据校验之后**，它关心的是“**谁 (Who)** 能对 **什么资源 (What)** 执行 **什么操作 (Action)**”。

**为啥权限校验这么重要？**

- **安全基石：** 防止未经授权的访问和操作，保护用户数据和系统安全。
- **业务隔离：** 确保不同角色（管理员、普通用户、VIP 用户等）只能访问和操作其权限范围内的功能。
- **合规要求：** 很多行业法规对数据访问权限有严格要求。

目前 Java 后端主流的方式是使用成熟的安全框架来实现权限校验，而不是自己手写（容易出错且难以维护）。

1. **Spring Security (业界标准，推荐):** 基于过滤器链（Filter Chain）拦截请求，进行认证（Authentication - 你是谁？）和授权（Authorization - 你能干啥？）。Spring Security 功能强大、社区活跃、与 Spring 生态无缝集成。不过，配置相对复杂，学习曲线较陡峭。
2. **Apache Shiro:** 另一个流行的安全框架，相对 Spring Security 更轻量级，API 更直观易懂。同样提供认证、授权、会话管理、加密等功能。对于不熟悉 Spring 或觉得 Spring Security 太重的项目，是一个不错的选择。
3. **Sa-Token:** 国产的轻量级 Java 权限认证框架。支持认证授权、单点登录、踢人下线、自动续签等功能。相比于 Spring Security 和 Shiro 来说，Sa-Token 内置的开箱即用的功能更多，使用也更简单。
4. **手动检查 (不推荐用于复杂场景):** 在 Service 层或 Controller 层代码里，手动获取当前用户信息（例如从 SecurityContextHolder 或 Session 中），然后 if-else 判断用户角色或权限。权限逻辑与业务逻辑耦合、代码重复、难以维护、容易遗漏。只适用于非常简单的权限场景。

**权限模型简介:**

- **RBAC (Role-Based Access Control):** 基于角色的访问控制。给用户分配角色，给角色分配权限。用户拥有其所有角色的权限总和。这是最常见的模型。
- **ABAC (Attribute-Based Access Control):** 基于属性的访问控制。决策基于用户属性、资源属性、操作属性和环境属性。更灵活但也更复杂。

一般情况下，绝大部分系统都使用的是 RBAC 权限模型或者其简化版本。用一个图来描述如下：

![RBAC 权限模型示意图](https://oss.javaguide.cn/github/javaguide/system-design/security/design-of-authority-system/rbac.png)

关于权限系统设计的详细介绍，可以看这篇文章：[权限系统设计详解](https://javaguide.cn/system-design/security/design-of-authority-system.html)。

## 总结

总而言之，要想构建一个安全、稳定、用户体验好的 Web 应用，前后端数据校验和后端权限校验这三道关卡，都得设好，而且各有侧重：

- **前端数据校验：** 提升用户体验，减少无效请求，是第一道“友好”的防线。
- **后端数据校验：** 保证数据格式正确、符合业务规则，是防止“脏数据”入库的“技术”防线。 Bean Validation 允许我们用注解的方式，直接在 JavaBean（比如我们的 DTO 对象）的属性上声明校验规则，非常方便。
- **后端权限校验：** 确保“对的人”做“对的事”，是防止越权操作的“安全”防线。Spring Security、Shiro、Sa-Token 等框架可以帮助我们实现权限校验。

## 参考

- 为什么前后端都需要进行数据校验？: <https://juejin.cn/post/7306045519099658240>
- 权限系统设计详解：<https://javaguide.cn/system-design/security/design-of-authority-system.html>
