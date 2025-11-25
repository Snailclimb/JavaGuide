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

When the Controller method uses the `@RequestBody` annotation to receive the request body and bind it to an object, you can add the `@Valid` annotation before the parameter to trigger verification of the object. If validation fails, it will throw `MethodArgumentNotValidException`.

```java
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Person {
    @NotNull(message = "classId cannot be empty")
    private String classId;

    @Size(max = 33)
    @NotNull(message = "name cannot be empty")
    private String name;

    @Pattern(regexp = "((^Man$|^Woman$|^UGM$))", message = "sex value is not in the optional range")
    @NotNull(message = "sex cannot be empty")
    private String sex;

    @Email(message = "email format is incorrect")
    @NotNull(message = "email cannot be empty")
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

For simple types of data that map directly to method parameters (such as path variables `@PathVariable` or request parameters `@RequestParam`), the verification method is slightly different:

1. **Add the `@Validated` annotation to the Controller class**: This annotation is provided by Spring (non-JSR standard), which enables Spring to handle method-level parameter validation annotations. **This is a required step. **
2. **Place verification annotations directly on method parameters**: Apply verification annotations such as `@Min`, `@Max`, `@Size`, `@Pattern` directly to the corresponding `@PathVariable` or `@RequestParam` parameters.

Be sure not to forget to add the `@Validated` annotation on the class. This parameter can tell Spring to verify the method parameters.

```java
@RestController
@RequestMapping("/api")
@Validated // Key step 1: @Validated must be added to the class
public class PersonController {

    @GetMapping("/person/{id}")
    public ResponseEntity<Integer> getPersonByID(
            @PathVariable("id")
            @Max(value = 5, message = "ID cannot exceed 5") // Key step 2: Place the verification annotation directly on the parameter
            Integer id
    ) {
        // If the passed in id > 5, Spring will throw a ConstraintViolationException before entering the method body.
        // The global exception handler also needs to handle this exception.
        return ResponseEntity.ok().body(id);
    }

    @GetMapping("/person")
    public ResponseEntity<String> findPersonByName(
            @RequestParam("name")
            @NotBlank(message = "Name cannot be blank") // Also applies to @RequestParam
            @Size(max = 10, message = "The name cannot exceed 10")
            String name
    ) {
        return ResponseEntity.ok().body("Found person: " + name);
    }
}
```

Bean Validation mainly solves the verification of data format and syntax level. But this alone is not enough.

## Permission verification

The data format has been checked and there is no problem. However, does the currently logged-in user have the right to do this operation? ** This is the problem that **permission verification** wants to solve. For example:

- Can ordinary users modify other people's orders? (no)
- Can visitors access the administrator backend interface? (no)
- Can visitors manage other users' information? (no)
- Can VIP users use exclusive coupons? (can)
-…

Permission verification occurs after **data verification**, and it is concerned with "**who (Who)** can perform **what operations (Action)** on **what resources (What)**".

**Why is permission verification so important? **

- **Security Cornerstone:** Prevent unauthorized access and operations, protect user data and system security.
- **Business isolation:** Ensure that different roles (administrators, ordinary users, VIP users, etc.) can only access and operate functions within their scope of authority.
- **Compliance Requirements:** Many industry regulations have strict requirements on data access permissions.

The current mainstream method for Java backend is to use a mature security framework to implement permission verification instead of handwriting it yourself (which is error-prone and difficult to maintain).

1. **Spring Security (industry standard, recommended):** Intercept requests based on the filter chain (Filter Chain), perform authentication (Authentication - who are you?) and authorization (Authorization - what can you do?). Spring Security has powerful functions, an active community, and seamless integration with the Spring ecosystem. However, the configuration is relatively complex and the learning curve is steep.
2. **Apache Shiro:** Another popular security framework, it is more lightweight than Spring Security and its API is more intuitive and easy to understand. It also provides authentication, authorization, session management, encryption and other functions. It is a good choice for projects that are not familiar with Spring or feel that Spring Security is too heavy.
3. **Sa-Token:** Domestic lightweight Java permission authentication framework. Supports authentication and authorization, single sign-on, kicking people offline, automatic renewal and other functions. Compared with Spring Security and Shiro, Sa-Token has more built-in out-of-the-box functions and is easier to use.
4. **Manual check (not recommended for complex scenarios):** In the Service layer or Controller layer code, manually obtain the current user information (for example, from SecurityContextHolder or Session), and then use if-else to determine the user role or permissions. Permission logic is coupled with business logic, causing code duplication, difficulty in maintenance, and easy omission. Only suitable for very simple permission scenarios.

**Introduction to Permission Model:**

- **RBAC (Role-Based Access Control):** Role-based access control. Assign roles to users and assign permissions to roles. The user has the sum of the permissions of all his or her roles. This is the most common model.
- **ABAC (Attribute-Based Access Control):** Attribute-based access control. Decisions are based on user attributes, resource attributes, operational attributes, and environment attributes. More flexible but also more complex.

In general, most systems use the RBAC permission model or its simplified version. Use a diagram to describe it as follows:

![RBAC authority model diagram](https://oss.javaguide.cn/github/javaguide/system-design/security/design-of-authority-system/rbac.png)

For a detailed introduction to authority system design, you can read this article: [Detailed explanation of authority system design](https://javaguide.cn/system-design/security/design-of-authority-system.html).

## Summary

All in all, in order to build a secure, stable, and user-friendly Web application, the three levels of front-end and back-end data verification and back-end permission verification must be set up, and each has its own emphasis:

- **Front-end data verification:** Improve user experience and reduce invalid requests, which is the first "friendly" line of defense.
- **Back-end data verification:** Ensuring that the data format is correct and conforms to business rules is the "technical" line of defense to prevent "dirty data" from being entered into the database. Bean Validation allows us to declare validation rules directly on the properties of JavaBean (such as our DTO object) using annotations, which is very convenient.
- **Backend permission verification:** Ensuring that the “right person” does the “right thing” is a “safe” line of defense to prevent unauthorized operations. Frameworks such as Spring Security, Shiro, and Sa-Token can help us implement permission verification.

## Reference

- Why do both the front and back ends need to perform data verification? : <https://juejin.cn/post/7306045519099658240>- Detailed explanation of authority system design: <https://javaguide.cn/system-design/security/design-of-authority-system.html>