---
title: 数据脱敏方案总结
category: 系统设计
tag:
  - 安全
---

<!-- @include: @article-header.snippet.md -->

> 本文转载完善自[Hutool：一行代码搞定数据脱敏 - 京东云开发者](https://mp.weixin.qq.com/s/1qFWczesU50ndPPLtABHFg)。

## 什么是数据脱敏

### 数据脱敏的定义

数据脱敏百度百科中是这样定义的：

> 数据脱敏，指对某些敏感信息通过脱敏规则进行数据的变形，实现敏感隐私数据的可靠保护。这样就可以在开发、测试和其它非生产环境以及外包环境中安全地使用脱敏后的真实数据集。在涉及客户安全数据或者一些商业性敏感数据的情况下，在不违反系统规则条件下，对真实数据进行改造并提供测试使用，如身份证号、手机号、卡号、客户号等个人信息都需要进行数据脱敏。是数据库安全技术之一。

总的来说，数据脱敏是指对某些敏感信息通过脱敏规则进行数据的变形，实现敏感隐私数据的可靠保护。

在数据脱敏过程中，通常会采用不同的算法和技术，以根据不同的需求和场景对数据进行处理。例如，对于身份证号码，可以使用掩码算法（masking）将前几位数字保留，其他位用 “X” 或 "\*" 代替；对于姓名，可以使用伪造（pseudonymization）算法，将真实姓名替换成随机生成的假名。

### 常用脱敏规则

常用脱敏规则是为了保护敏感数据的安全性，在处理和存储敏感数据时对其进行变换或修改。

下面是几种常见的脱敏规则：

- 替换(常用)：将敏感数据中的特定字符或字符序列替换为其他字符。例如，将信用卡号中的中间几位数字替换为星号（\*）或其他字符。
- 删除：将敏感数据中的部分内容随机删除。比如，将电话号码的随机 3 位数字进行删除。
- 重排：将原始数据中的某些字符或字段的顺序打乱。例如，将身份证号码的随机位交错互换。
- 加噪：在数据中注入一些误差或者噪音，达到对数据脱敏的效果。例如，在敏感数据中添加一些随机生成的字符。
- 加密（常用）：使用加密算法将敏感数据转换为密文。例如，将银行卡号用 MD5 或 SHA-256 等哈希函数进行散列。常见加密算法总结可以参考这篇文章：<https://javaguide.cn/system-design/security/encryption-algorithms.html> 。
- ……

## 常用脱敏工具

### Hutool

Hutool 一个 Java 基础工具类，对文件、流、加密解密、转码、正则、线程、XML 等 JDK 方法进行封装，组成各种 Util 工具类，同时提供以下组件：

|        模块        |                                     介绍                                      |
| :----------------: | :---------------------------------------------------------------------------: |
|     hutool-aop     |                   JDK 动态代理封装，提供非 IOC 下的切面支持                   |
| hutool-bloomFilter |                    布隆过滤，提供一些 Hash 算法的布隆过滤                     |
|    hutool-cache    |                                 简单缓存实现                                  |
|    hutool-core     |                   核心，包括 Bean 操作、日期、各种 Util 等                    |
|    hutool-cron     |                 定时任务模块，提供类 Crontab 表达式的定时任务                 |
|   hutool-crypto    |                 加密解密模块，提供对称、非对称和摘要算法封装                  |
|     hutool-db      |                 JDBC 封装后的数据操作，基于 ActiveRecord 思想                 |
|     hutool-dfa     |                          基于 DFA 模型的多关键字查找                          |
|    hutool-extra    | 扩展模块，对第三方封装（模板引擎、邮件、Servlet、二维码、Emoji、FTP、分词等） |
|    hutool-http     |                   基于 HttpUrlConnection 的 Http 客户端封装                   |
|     hutool-log     |                          自动识别日志实现的日志门面                           |
|   hutool-script    |                         脚本执行封装，例如 Javascript                         |
|   hutool-setting   |                功能更强大的 Setting 配置文件和 Properties 封装                |
|   hutool-system    |                        系统参数调用封装（JVM 信息等）                         |
|    hutool-json     |                                   JSON 实现                                   |
|   hutool-captcha   |                                图片验证码实现                                 |
|     hutool-poi     |                       针对 POI 中 Excel 和 Word 的封装                        |
|   hutool-socket    |                    基于 Java 的 NIO 和 AIO 的 Socket 封装                     |
|     hutool-jwt     |                         JSON Web Token (JWT) 封装实现                         |

可以根据需求对每个模块单独引入，也可以通过引入`hutool-all`方式引入所有模块，本文所使用的数据脱敏工具就是在 `hutool.core` 模块。

现阶段最新版本的 Hutool 支持的脱敏数据类型如下，基本覆盖了常见的敏感信息。

1. 用户 id
2. 中文姓名
3. 身份证号
4. 座机号
5. 手机号
6. 地址
7. 电子邮件
8. 密码
9. 中国大陆车牌，包含普通车辆、新能源车辆
10. 银行卡

#### 一行代码实现脱敏

Hutool 提供的脱敏方法如下图所示：

![](https://oss.javaguide.cn/github/javaguide/system-design/security/2023-08-01-10-2119fnVCIDozqHgRGx.png)

注意：Hutool 脱敏是通过 \* 来代替敏感信息的，具体实现是在 StrUtil.hide 方法中，如果我们想要自定义隐藏符号，则可以把 Hutool 的源码拷出来，重新实现即可。

这里以手机号、银行卡号、身份证号、密码信息的脱敏为例，下面是对应的测试代码。

```java
import cn.hutool.core.util.DesensitizedUtil;
import org.junit.Test;
import org.springframework.boot.test.context.Spring BootTest;

/**
 *
 * @description: Hutool实现数据脱敏
 */
@Spring BootTest
public class HuToolDesensitizationTest {

    @Test
    public void testPhoneDesensitization(){
        String phone="13723231234";
        System.out.println(DesensitizedUtil.mobilePhone(phone)); //输出：137****1234
    }
    @Test
    public void testBankCardDesensitization(){
        String bankCard="6217000130008255666";
        System.out.println(DesensitizedUtil.bankCard(bankCard)); //输出：6217 **** **** *** 5666
    }

    @Test
    public void testIdCardNumDesensitization(){
        String idCardNum="411021199901102321";
        //只显示前4位和后2位
        System.out.println(DesensitizedUtil.idCardNum(idCardNum,4,2)); //输出：4110************21
    }
    @Test
    public void testPasswordDesensitization(){
        String password="www.jd.com_35711";
        System.out.println(DesensitizedUtil.password(password)); //输出：****************
    }
}
```

以上就是使用 Hutool 封装好的工具类实现数据脱敏。

#### 配合 JackSon 通过注解方式实现脱敏

现在有了数据脱敏工具类，如果前端需要显示数据数据的地方比较多，我们不可能在每个地方都调用一个工具类，这样就显得代码太冗余了，那我们如何通过注解的方式优雅的完成数据脱敏呢？

如果项目是基于 Spring Boot 的 web 项目，则可以利用 Spring Boot 自带的 jackson 自定义序列化实现。它的实现原理其实就是在 json 进行序列化渲染给前端时，进行脱敏。

**第一步：脱敏策略的枚举。**

```java
/**
 * @author
 * @description:脱敏策略枚举
 */
public enum DesensitizationTypeEnum {
    //自定义
    MY_RULE,
    //用户id
    USER_ID,
    //中文名
    CHINESE_NAME,
    //身份证号
    ID_CARD,
    //座机号
    FIXED_PHONE,
    //手机号
    MOBILE_PHONE,
    //地址
    ADDRESS,
    //电子邮件
    EMAIL,
    //密码
    PASSWORD,
    //中国大陆车牌，包含普通车辆、新能源车辆
    CAR_LICENSE,
    //银行卡
    BANK_CARD
}
```

上面表示支持的脱敏类型。

**第二步：定义一个用于脱敏的 Desensitization 注解。**

- `@Retention (RetentionPolicy.RUNTIME)`：运行时生效。
- `@Target (ElementType.FIELD)`：可用在字段上。
- `@JacksonAnnotationsInside`：此注解可以点进去看一下是一个元注解，主要是用户打包其他注解一起使用。
- `@JsonSerialize`：上面说到过，该注解的作用就是可自定义序列化，可以用在注解上，方法上，字段上，类上，运行时生效等等，根据提供的序列化类里面的重写方法实现自定义序列化。

```java
/**
 * @author
 */
@Target(ElementType.FIELD)
@Retention(RetentionPolicy.RUNTIME)
@JacksonAnnotationsInside
@JsonSerialize(using = DesensitizationSerialize.class)
public @interface Desensitization {
    /**
     * 脱敏数据类型，在MY_RULE的时候，startInclude和endExclude生效
     */
    DesensitizationTypeEnum type() default DesensitizationTypeEnum.MY_RULE;

    /**
     * 脱敏开始位置（包含）
     */
    int startInclude() default 0;

    /**
     * 脱敏结束位置（不包含）
     */
    int endExclude() default 0;
}
```

注：只有使用了自定义的脱敏枚举 `MY_RULE` 的时候，开始位置和结束位置才生效。

**第三步：创建自定的序列化类**

这一步是我们实现数据脱敏的关键。自定义序列化类继承 `JsonSerializer`，实现 `ContextualSerializer` 接口，并重写两个方法。

```java
/**
 * @author
 * @description: 自定义序列化类
 */
@AllArgsConstructor
@NoArgsConstructor
public class DesensitizationSerialize extends JsonSerializer<String> implements ContextualSerializer {
    private DesensitizationTypeEnum type;

    private Integer startInclude;

    private Integer endExclude;

    @Override
    public void serialize(String str, JsonGenerator jsonGenerator, SerializerProvider serializerProvider) throws IOException {
        switch (type) {
            // 自定义类型脱敏
            case MY_RULE:
                jsonGenerator.writeString(CharSequenceUtil.hide(str, startInclude, endExclude));
                break;
            // userId脱敏
            case USER_ID:
                jsonGenerator.writeString(String.valueOf(DesensitizedUtil.userId()));
                break;
            // 中文姓名脱敏
            case CHINESE_NAME:
                jsonGenerator.writeString(DesensitizedUtil.chineseName(String.valueOf(str)));
                break;
            // 身份证脱敏
            case ID_CARD:
                jsonGenerator.writeString(DesensitizedUtil.idCardNum(String.valueOf(str), 1, 2));
                break;
            // 固定电话脱敏
            case FIXED_PHONE:
                jsonGenerator.writeString(DesensitizedUtil.fixedPhone(String.valueOf(str)));
                break;
            // 手机号脱敏
            case MOBILE_PHONE:
                jsonGenerator.writeString(DesensitizedUtil.mobilePhone(String.valueOf(str)));
                break;
            // 地址脱敏
            case ADDRESS:
                jsonGenerator.writeString(DesensitizedUtil.address(String.valueOf(str), 8));
                break;
            // 邮箱脱敏
            case EMAIL:
                jsonGenerator.writeString(DesensitizedUtil.email(String.valueOf(str)));
                break;
            // 密码脱敏
            case PASSWORD:
                jsonGenerator.writeString(DesensitizedUtil.password(String.valueOf(str)));
                break;
            // 中国车牌脱敏
            case CAR_LICENSE:
                jsonGenerator.writeString(DesensitizedUtil.carLicense(String.valueOf(str)));
                break;
            // 银行卡脱敏
            case BANK_CARD:
                jsonGenerator.writeString(DesensitizedUtil.bankCard(String.valueOf(str)));
                break;
            default:
        }

    }

    @Override
    public JsonSerializer<?> createContextual(SerializerProvider serializerProvider, BeanProperty beanProperty) throws JsonMappingException {
        if (beanProperty != null) {
            // 判断数据类型是否为String类型
            if (Objects.equals(beanProperty.getType().getRawClass(), String.class)) {
                // 获取定义的注解
                Desensitization desensitization = beanProperty.getAnnotation(Desensitization.class);
                // 为null
                if (desensitization == null) {
                    desensitization = beanProperty.getContextAnnotation(Desensitization.class);
                }
                // 不为null
                if (desensitization != null) {
                    // 创建定义的序列化类的实例并且返回，入参为注解定义的type,开始位置，结束位置。
                    return new DesensitizationSerialize(desensitization.type(), desensitization.startInclude(),
                            desensitization.endExclude());
                }
            }

            return serializerProvider.findValueSerializer(beanProperty.getType(), beanProperty);
        }
        return serializerProvider.findNullValueSerializer(null);
    }
}
```

经过上述三步，已经完成了通过注解实现数据脱敏了，下面我们来测试一下。

首先定义一个要测试的 pojo，对应的字段加入要脱敏的策略。

```java
/**
 *
 * @description:
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TestPojo {

    private String userName;

    @Desensitization(type = DesensitizationTypeEnum.MOBILE_PHONE)
    private String phone;

    @Desensitization(type = DesensitizationTypeEnum.PASSWORD)
    private String password;

    @Desensitization(type = DesensitizationTypeEnum.MY_RULE, startInclude = 0, endExclude = 2)
    private String address;
}
```

接下来写一个测试的 controller

```java
@RestController
public class TestController {

    @RequestMapping("/test")
    public TestPojo testDesensitization(){
        TestPojo testPojo = new TestPojo();
        testPojo.setUserName("我是用户名");
        testPojo.setAddress("地球中国-北京市通州区京东总部2号楼");
        testPojo.setPhone("13782946666");
        testPojo.setPassword("sunyangwei123123123.");
        System.out.println(testPojo);
        return testPojo;
    }

}
```

![](https://oss.javaguide.cn/github/javaguide/system-design/security/2023-08-02-16-497DdCBy8vbf2D69g.png)

可以看到我们成功实现了数据脱敏。

### Apache ShardingSphere

ShardingSphere 是一套开源的分布式数据库中间件解决方案组成的生态圈，它由 Sharding-JDBC、Sharding-Proxy 和 Sharding-Sidecar（计划中）这 3 款相互独立的产品组成。 他们均提供标准化的数据分片、分布式事务和数据库治理功能 。

Apache ShardingSphere 下面存在一个数据脱敏模块，此模块集成的常用的数据脱敏的功能。其基本原理是对用户输入的 SQL 进行解析拦截，并依靠用户的脱敏配置进行 SQL 的改写，从而实现对原文字段的加密及加密字段的解密。最终实现对用户无感的加解密存储、查询。

通过 Apache ShardingSphere 可以自动化&透明化数据脱敏过程，用户无需关注脱敏中间实现细节。并且，提供了多种内置、第三方(AKS)的脱敏策略，用户仅需简单配置即可使用。

官方文档地址：<https://shardingsphere.apache.org/document/4.1.1/cn/features/orchestration/encrypt/> 。

### FastJSON

平时开发 Web 项目的时候，除了默认的 Spring 自带的序列化工具，FastJson 也是一个很常用的 Spring Web Restful 接口序列化的工具。

FastJSON 实现数据脱敏的方式主要有两种：

- 基于注解 `@JSONField` 实现：需要自定义一个用于脱敏的序列化的类，然后在需要脱敏的字段上通过 `@JSONField` 中的 `serializeUsing` 指定为我们自定义的序列化类型即可。
- 基于序列化过滤器：需要实现 `ValueFilter` 接口，重写 `process` 方法完成自定义脱敏，然后在 JSON 转换时使用自定义的转换策略。具体实现可参考这篇文章： <https://juejin.cn/post/7067916686141161479>。

### Mybatis-Mate

先介绍一下 MyBatis、MyBatis-Plus 和 Mybatis-Mate 这三者的关系：

- MyBatis 是一款优秀的持久层框架，它支持定制化 SQL、存储过程以及高级映射。
- MyBatis-Plus 是一个 MyBatis 的增强工具，能够极大地简化持久层的开发工作。
- Mybatis-Mate 是为 MyBatis-Plus 提供的企业级模块，旨在更敏捷优雅处理数据。不过，使用之前需要配置授权码（付费）。

Mybatis-Mate 支持敏感词脱敏，内置手机号、邮箱、银行卡号等 9 种常用脱敏规则。

```java
@FieldSensitive("testStrategy")
private String username;

@Configuration
public class SensitiveStrategyConfig {

    /**
     * 注入脱敏策略
     */
    @Bean
    public ISensitiveStrategy sensitiveStrategy() {
        // 自定义 testStrategy 类型脱敏处理
        return new SensitiveStrategy().addStrategy("testStrategy", t -> t + "***test***");
    }
}

// 跳过脱密处理，用于编辑场景
RequestDataTransfer.skipSensitive();
```

### MyBatis-Flex

类似于 MybatisPlus，MyBatis-Flex 也是一个 MyBatis 增强框架。MyBatis-Flex 同样提供了数据脱敏功能，并且是可以免费使用的。

MyBatis-Flex 提供了 `@ColumnMask()` 注解，以及内置的 9 种脱敏规则，开箱即用：

```java
/**
 * 内置的数据脱敏方式
 */
public class Masks {
    /**
     * 手机号脱敏
     */
    public static final String MOBILE = "mobile";
    /**
     * 固定电话脱敏
     */
    public static final String FIXED_PHONE = "fixed_phone";
    /**
     * 身份证号脱敏
     */
    public static final String ID_CARD_NUMBER = "id_card_number";
    /**
     * 中文名脱敏
     */
    public static final String CHINESE_NAME = "chinese_name";
    /**
     * 地址脱敏
     */
    public static final String ADDRESS = "address";
    /**
     * 邮件脱敏
     */
    public static final String EMAIL = "email";
    /**
     * 密码脱敏
     */
    public static final String PASSWORD = "password";
    /**
     * 车牌号脱敏
     */
    public static final String CAR_LICENSE = "car_license";
    /**
     * 银行卡号脱敏
     */
    public static final String BANK_CARD_NUMBER = "bank_card_number";
    //...
}
```

使用示例：

```java
@Table("tb_account")
public class Account {

    @Id(keyType = KeyType.Auto)
    private Long id;

    @ColumnMask(Masks.CHINESE_NAME)
    private String userName;

    @ColumnMask(Masks.EMAIL)
    private String email;

}
```

如果这些内置的脱敏规则不满足你的要求的话，你还可以自定义脱敏规则。

1、通过 `MaskManager` 注册新的脱敏规则：

```java
MaskManager.registerMaskProcessor("自定义规则名称"
        , data -> {
            return data;
        })
```

2、使用自定义的脱敏规则

```java
@Table("tb_account")
public class Account {

    @Id(keyType = KeyType.Auto)
    private Long id;

    @ColumnMask("自定义规则名称")
    private String userName;
}
```

并且，对于需要跳过脱密处理的场景，例如进入编辑页面编辑用户数据，MyBatis-Flex 也提供了对应的支持：

1. **`MaskManager#execWithoutMask`**（推荐）：该方法使用了模版方法设计模式，保障跳过脱敏处理并执行相关逻辑后自动恢复脱敏处理。
2. **`MaskManager#skipMask`**：跳过脱敏处理。
3. **`MaskManager#restoreMask`**：恢复脱敏处理，确保后续的操作继续使用脱敏逻辑。

`MaskManager#execWithoutMask`方法实现如下：

```java
public static <T> T execWithoutMask(Supplier<T> supplier) {
    try {
        skipMask();
        return supplier.get();
    } finally {
        restoreMask();
    }
}
```

`MaskManager` 的`skipMask`和`restoreMask`方法一般配套使用，推荐`try{...}finally{...}`模式。

## 总结

这篇文章主要介绍了：

- 数据脱敏的定义：数据脱敏是指对某些敏感信息通过脱敏规则进行数据的变形，实现敏感隐私数据的可靠保护。
- 常用的脱敏规则：替换、删除、重排、加噪和加密。
- 常用的脱敏工具：Hutool、Apache ShardingSphere、FastJSON、Mybatis-Mate 和 MyBatis-Flex。

## 参考

- Hutool 工具官网： <https://hutool.cn/docs/#/>
- 聊聊如何自定义数据脱敏：<https://juejin.cn/post/7046567603971719204>
- FastJSON 实现数据脱敏：<https://juejin.cn/post/7067916686141161479>

<!-- @include: @article-footer.snippet.md -->
