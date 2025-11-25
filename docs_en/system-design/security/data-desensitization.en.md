---
title: Summary of data desensitization plan
category: system design
tag:
  - safe
---

<!-- @include: @article-header.snippet.md -->

> This article is reproduced and improved from [Hutool: Data desensitization with one line of code - JD Cloud Developer](https://mp.weixin.qq.com/s/1qFWczesU50ndPPLtABHFg).

## What is data desensitization?

### Definition of data desensitization

Data desensitization is defined in Baidu Encyclopedia as follows:

> Data desensitization refers to the deformation of certain sensitive information through desensitization rules to achieve reliable protection of sensitive private data. This allows for safe use of desensitized real data sets in development, testing and other non-production and outsourced environments. When customer security data or some commercially sensitive data is involved, real data must be transformed and used for testing without violating system rules. Personal information such as ID number, mobile phone number, card number, customer number, etc. all need to be desensitized. It is one of the database security technologies.

In general, data desensitization refers to the deformation of certain sensitive information through desensitization rules to achieve reliable protection of sensitive private data.

In the process of data desensitization, different algorithms and technologies are usually used to process data according to different needs and scenarios. For example, for an ID card number, a masking algorithm can be used to retain the first few digits, and the other digits can be replaced with "X" or "\*"; for a name, a pseudonymization algorithm can be used to replace the real name with a randomly generated pseudonym.

### Commonly used desensitization rules

Commonly used desensitization rules are used to protect the security of sensitive data and transform or modify it when processing and storing sensitive data.

Here are some common desensitization rules:

- Replacement (commonly used): Replace specific characters or character sequences in sensitive data with other characters. For example, replace the middle digits in a credit card number with asterisks (\*) or other characters.
- Delete: Randomly delete parts of the sensitive data. For example, remove random 3 digits from a phone number.
- Rearrange: Disorder the order of some characters or fields in the original data. For example, random bits of the ID number are interleaved and swapped.
- Noise addition: Inject some errors or noise into the data to achieve the effect of desensitizing the data. For example, add some randomly generated characters to sensitive data.
- Encryption (commonly used): Use encryption algorithms to convert sensitive data into ciphertext. For example, hashing a bank card number with a hash function such as MD5 or SHA-256. For a summary of common encryption algorithms, please refer to this article: <https://javaguide.cn/system-design/security/encryption-algorithms.html>.
-…

## Commonly used desensitization tools

### Hutool

Hutool is a Java basic tool class that encapsulates JDK methods such as files, streams, encryption and decryption, transcoding, regularization, threads, XML, etc., to form various Util tool classes, and also provides the following components:

| Modules | Introduction |
| :----------------: | :-----------------------------------------------------------------------------: |
| hutool-aop | JDK dynamic proxy encapsulation, providing aspect support under non-IOC |
| hutool-bloomFilter | Bloom filtering, providing bloom filtering of some Hash algorithms |
| hutool-cache | Simple cache implementation |
| hutool-core | Core, including Bean operations, dates, various Utils, etc. |
| hutool-cron | Scheduled task module, providing scheduled tasks similar to Crontab expressions |
| hutool-crypto | Encryption and decryption module, providing symmetric, asymmetric and digest algorithm packaging |
| hutool-db | JDBC encapsulated data operation, based on ActiveRecord idea |
| hutool-dfa | Multi-keyword search based on DFA model |
| hutool-extra | Extension module, encapsulating third parties (template engine, email, Servlet, QR code, Emoji, FTP, word segmentation, etc.) |
| hutool-http | Http client encapsulation based on HttpUrlConnection |
| hutool-log | Log facade for automatically identifying logs |
| hutool-script | Script execution encapsulation, such as Javascript |
| hutool-setting | More powerful Setting configuration file and Properties package |
| hutool-system | System parameter call encapsulation (JVM information, etc.) |
| hutool-json | JSON implementation |
| hutool-captcha | Image verification code implementation |
| hutool-poi | Encapsulation of Excel and Word in POI |
| hutool-socket | Java-based Socket encapsulation of NIO and AIO |
| hutool-jwt | JSON Web Token (JWT) encapsulation implementation |

Each module can be introduced separately according to requirements, or all modules can be introduced by introducing `hutool-all`. The data desensitization tool used in this article is in the `hutool.core` module.

The latest version of Hutool currently supports the following desensitized data types, which basically cover common sensitive information.

1. User ID
2. Chinese name
3. ID number
4. Landline number
5. Mobile phone number
6. Address
7. Email
8. Password
9. Mainland China license plates, including ordinary vehicles and new energy vehicles
10. Bank card

#### One line of code to achieve desensitization

The desensitization method provided by Hutool is shown in the figure below:

![](https://oss.javaguide.cn/github/javaguide/system-design/security/2023-08-01-10-2119fnVCIDozqHgRGx.png)

Note: Hutool desensitization uses \* to replace sensitive information. The specific implementation is in the StrUtil.hide method. If we want to customize hidden symbols, we can copy the source code of Hutool and re-implement it.

Here we take the desensitization of mobile phone number, bank card number, ID number, and password information as an example. The following is the corresponding test code.

```java
import cn.hutool.core.util.DesensitizedUtil;
import org.junit.Test;
import org.springframework.boot.test.context.Spring BootTest;

/**
 *
 * @description: Hutool implements data desensitization
 */
@Spring BootTest
public class HuToolDesensitizationTest {

    @Test
    public void testPhoneDesensitization(){
        String phone="13723231234";
        System.out.println(DesensitizedUtil.mobilePhone(phone)); //Output: 137****1234
    }
    @Test
    public void testBankCardDesensitization(){
        String bankCard="6217000130008255666";
        System.out.println(DesensitizedUtil.bankCard(bankCard)); //Output: 6217 **** **** *** 5666
    }

    @Test
    public void testIdCardNumDesensitization(){
        String idCardNum="411021199901102321";
        //Only display the first 4 digits and the last 2 digits
        System.out.println(DesensitizedUtil.idCardNum(idCardNum,4,2)); //Output: 4110************21
    }
    @Test
    public void testPasswordDesensitization(){
        String password="www.jd.com_35711";
        System.out.println(DesensitizedUtil.password(password)); //Output: ******************
    }
}```

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

After the above three steps, data desensitization through annotations has been completed. Let's test it.

First define a pojo to be tested, and add the policy to be desensitized to the corresponding field.

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

Next, write a test controller

```java
@RestController
public class TestController {

    @RequestMapping("/test")
    public TestPojo testDesensitization(){
        TestPojo testPojo = new TestPojo();
        testPojo.setUserName("I am the username");
        testPojo.setAddress("Earth China-Building 2, Jingdong Headquarters, Tongzhou District, Beijing");
        testPojo.setPhone("13782946666");
        testPojo.setPassword("sunyangwei123123123.");
        System.out.println(testPojo);
        return testPojo;
    }

}
```

![](https://oss.javaguide.cn/github/javaguide/system-design/security/2023-08-02-16-497DdCBy8vbf2D69g.png)

You can see that we successfully achieved data desensitization.

### Apache ShardingSphere

ShardingSphere is an ecosystem composed of a set of open source distributed database middleware solutions. It consists of three independent products: Sharding-JDBC, Sharding-Proxy and Sharding-Sidecar (planned). They all provide standardized data sharding, distributed transactions and database management functions.

There is a data desensitization module under Apache ShardingSphere, which integrates commonly used data desensitization functions. The basic principle is to parse and intercept the SQL input by the user, and rely on the user's desensitization configuration to rewrite the SQL, thereby encrypting the original text fields and decrypting the encrypted fields. Finally, user-insensitive encryption, decryption, storage and query are realized.

The data desensitization process can be automated & transparent through Apache ShardingSphere, and users do not need to pay attention to the intermediate implementation details of desensitization. Moreover, it provides a variety of built-in and third-party (AKS) desensitization strategies, which users can use with simple configuration.

Official document address: <https://shardingsphere.apache.org/document/4.1.1/cn/features/orchestration/encrypt/>.

### FastJSON

When developing web projects, in addition to the default serialization tool that comes with Spring, FastJson is also a very commonly used tool for serializing the Spring Web Restful interface.

There are two main ways for FastJSON to achieve data desensitization:

- Implementation based on the annotation `@JSONField`: You need to customize a serialization class for desensitization, and then specify our custom serialization type through `serializeUsing` in `@JSONField` on the field that needs to be desensitized.
- Based on serialization filters: You need to implement the `ValueFilter` interface, override the `process` method to complete custom desensitization, and then use a custom conversion strategy when converting JSON. For specific implementation, please refer to this article: <https://juejin.cn/post/7067916686141161479>.

### Mybatis-Mate

First, let’s introduce the relationship between MyBatis, MyBatis-Plus and Mybatis-Mate:

- MyBatis is an excellent persistence layer framework that supports customized SQL, stored procedures and advanced mapping.
- MyBatis-Plus is an enhancement tool for MyBatis that can greatly simplify the development of the persistence layer.
- Mybatis-Mate is an enterprise-level module provided for MyBatis-Plus, designed to process data more agilely and elegantly. However, you need to configure an authorization code (paid) before use.

Mybatis-Mate supports sensitive word desensitization and has built-in 9 commonly used desensitization rules such as mobile phone numbers, email addresses, and bank card numbers.

```java
@FieldSensitive("testStrategy")
private String username;

@Configuration
public class SensitiveStrategyConfig {

    /**
     *Inject desensitization strategy
     */
    @Bean
    public ISensitiveStrategy sensitiveStrategy() {
        // Customize testStrategy type desensitization processing
        return new SensitiveStrategy().addStrategy("testStrategy", t -> t + "***test***");
    }
}

// Skip decryption processing and use it for editing scenes
RequestDataTransfer.skipSensitive();
```

### MyBatis-Flex

Similar to MybatisPlus, MyBatis-Flex is also a MyBatis enhanced framework. MyBatis-Flex also provides data desensitization function and is free to use.

MyBatis-Flex provides the `@ColumnMask()` annotation and 9 built-in desensitization rules, available out of the box:

```java
/**
 * Built-in data desensitization method
 */
public class Masks {
    /**
     *Desensitization of mobile phone number
     */
    public static final String MOBILE = "mobile";
    /**
     * Landline desensitization
     */
    public static final String FIXED_PHONE = "fixed_phone";
    /**
     * Desensitization of ID number
     */
    public static final String ID_CARD_NUMBER = "id_card_number";
    /**
     *Chinese name desensitization
     */
    public static final String CHINESE_NAME = "chinese_name";
    /**
     * Address desensitization
     */
    public static final String ADDRESS = "address";
    /**
     * Email desensitization
     */
    public static final String EMAIL = "email";
    /**
     * Password desensitization
     */
    public static final String PASSWORD = "password";
    /**
     * License plate number desensitization
     */
    public static final String CAR_LICENSE = "car_license";
    /**
     * Bank card number desensitization
     */
    public static final String BANK_CARD_NUMBER = "bank_card_number";
    //...
}
```

Usage example:

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

If these built-in desensitization rules do not meet your requirements, you can also customize desensitization rules.

1. Register new desensitization rules through `MaskManager`:

```java
MaskManager.registerMaskProcessor("Custom rule name"
        , data -> {
            return data;
        })```

2. Use custom desensitization rules

```java
@Table("tb_account")
public class Account {

    @Id(keyType = KeyType.Auto)
    private Long id;

    @ColumnMask("custom rule name")
    private String userName;
}
```

Moreover, for scenarios where decryption processing needs to be skipped, such as entering the edit page to edit user data, MyBatis-Flex also provides corresponding support:

1. **`MaskManager#execWithoutMask`** (recommended): This method uses the template method design pattern to ensure that desensitization processing is skipped and desensitization processing is automatically resumed after executing relevant logic.
2. **`MaskManager#skipMask`**: Skip desensitization processing.
3. **`MaskManager#restoreMask`**: Resume desensitization processing to ensure that subsequent operations continue to use desensitization logic.

The `MaskManager#execWithoutMask` method is implemented as follows:

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

The `skipMask` and `restoreMask` methods of `MaskManager` are generally used together, and the `try{...}finally{...}` mode is recommended.

## Summary

This article mainly introduces:

- Definition of data desensitization: Data desensitization refers to the deformation of certain sensitive information through desensitization rules to achieve reliable protection of sensitive private data.
- Commonly used desensitization rules: replacement, deletion, rearrangement, noise addition and encryption.
- Commonly used desensitization tools: Hutool, Apache ShardingSphere, FastJSON, Mybatis-Mate and MyBatis-Flex.

## Reference

- Hutool tool official website: <https://hutool.cn/docs/#/>
- Let’s talk about how to customize data desensitization: <https://juejin.cn/post/7046567603971719204>
- FastJSON achieves data desensitization: <https://juejin.cn/post/7067916686141161479>

<!-- @include: @article-footer.snippet.md -->