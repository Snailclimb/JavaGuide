---
title: Summary of common annotations for Spring&SpringBoot
category: framework
tag:
  - SpringBoot
  - Spring
---

It is no exaggeration to say that the common Spring/SpringBoot annotations introduced in this article have basically covered most of the common scenarios you encounter in your work. This article provides specific usage for each annotation. After mastering these contents, there is basically no big problem in using Spring Boot to develop projects!

**Why write this article? **

Recently I saw an article on the Internet about Spring Boot common annotations that was widely reprinted, but the content of the article is somewhat misleading and may not be friendly to developers who do not have much practical experience. So I spent a few days summarizing this article, hoping to help everyone better understand and use Spring annotations.

**Due to limited personal ability and energy, if there are any errors or omissions, please correct me! Very grateful! **

## Spring Boot basic annotations

`@SpringBootApplication` is the core annotation of Spring Boot applications and is usually used to annotate the main startup class.

Example:

```java
@SpringBootApplication
public class SpringSecurityJwtGuideApplication {
      public static void main(java.lang.String[] args) {
        SpringApplication.run(SpringSecurityJwtGuideApplication.class, args);
    }
}
```

We can think of `@SpringBootApplication` as a combination of the following three annotations:

- **`@EnableAutoConfiguration`**: Enable Spring Boot’s automatic configuration mechanism.
- **`@ComponentScan`**: Scan classes annotated with `@Component`, `@Service`, `@Repository`, `@Controller`, etc.
- **`@Configuration`**: Allows registering additional Spring Beans or importing additional configuration classes.

The source code is as follows:

```java
package org.springframework.boot.autoconfigure;
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@Documented
@Inherited
@SpringBootConfiguration
@EnableAutoConfiguration
@ComponentScan(excludeFilters = {
    @Filter(type = FilterType.CUSTOM, classes = TypeExcludeFilter.class),
    @Filter(type = FilterType.CUSTOM, classes = AutoConfigurationExcludeFilter.class) })
public @interface SpringBootApplication {
   ...
}

package org.springframework.boot;
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@Documented
@Configuration
public @interface SpringBootConfiguration {

}
```

## Spring Bean

### Dependency Injection (DI)

`@Autowired` is used to automatically inject dependencies (i.e. other Spring beans). It can be annotated on the constructor, field, Setter method or configuration method, and the Spring container will automatically find beans of matching type and inject them.

```java
@Service
public class UserServiceImpl implements UserService {
    // ...
}

@RestController
public class UserController {
    //Field injection
    @Autowired
    private UserService userService;
    // ...
}
```

`@Autowired`'s default injection by type may cause ambiguity when there are multiple beans of the same type. At this time, you can use it in conjunction with `@Qualifier` to precisely select the instance that needs to be injected by specifying the name of the bean.

```java
@Repository("userRepositoryA")
public class UserRepositoryA implements UserRepository { /* ... */ }

@Repository("userRepositoryB")
public class UserRepositoryB implements UserRepository { /* ... */ }

@Service
public class UserService {
    @Autowired
    @Qualifier("userRepositoryA") //Specify to inject a Bean named "userRepositoryA"
    private UserRepository userRepository;
    // ...
}
```

`@Primary` is also used to solve the injection problem of multiple Bean instances of the same type. Add the `@Primary` annotation when the Bean is defined (for example, using `@Bean` or class annotation) to indicate that the Bean is the **preferred** injection object. When doing `@Autowired` injection, if no name is specified using `@Qualifier`, Spring will prefer beans with `@Primary`.

```java
@Primary // Set UserRepositoryA as the preferred injection object
@Repository("userRepositoryA")
public class UserRepositoryA implements UserRepository { /* ... */ }

@Repository("userRepositoryB")
public class UserRepositoryB implements UserRepository { /* ... */ }

@Service
public class UserService {
    @Autowired // UserRepositoryA will be automatically injected because it is @Primary
    private UserRepository userRepository;
    // ...
}
```

`@Resource(name="beanName")` is an annotation defined by the JSR-250 specification and is also used for dependency injection. It looks for beans by name by default for injection, while `@Autowired` defaults by type (by Type)**. If the `name` attribute is not specified, it will try to find based on the field name or method name, and if not found, fall back to finding by type (similar to `@Autowired`).

`@Resource` can only be annotated on fields and Setter methods, and does not support constructor injection.

```java
@Service
public class UserService {
    @Resource(name = "userRepositoryA")
    private UserRepository userRepository;
    // ...
}
```

### Bean scope

`@Scope("scopeName")` defines the scope of Spring Bean, that is, the life cycle and visible scope of the Bean instance. Commonly used scopes include:

- **singleton** : There is only one bean instance in the IoC container. Beans in Spring are all singletons by default, which is an application of the singleton design pattern.
- **prototype** : A new bean instance will be created for each retrieval. In other words, if you call `getBean()` twice in a row, you will get different Bean instances.
- **request** (only available for web applications): Each HTTP request will generate a new bean (request bean), which is only valid within the current HTTP request.
- **session** (available only for web applications): Each HTTP request from a new session will generate a new bean (session bean), which is only valid within the current HTTP session.
- **application/global-session** (available only for web applications): Each web application creates a Bean (application bean) when it starts, which is only valid during the current application startup time.
- **websocket** (available only for web applications): Each WebSocket session generates a new bean.

```java
@Component
// Each retrieval will create a new PrototypeBean instance
@Scope("prototype")
public class PrototypeBean {
    // ...
}```

### Bean Registration

The Spring container needs to know which classes need to be managed as beans. In addition to explicit declaration using the `@Bean` method (usually in the `@Configuration` class), a more common way is to use Stereotype (stereotype) annotation to mark the class, and cooperate with the component scanning (Component Scanning) mechanism to let Spring automatically discover and register these classes as beans. These beans can subsequently be injected into other components through `@Autowired` and other methods.

The following are some common annotations for registered beans:

- `@Component`: A general annotation that can mark any class as a `Spring` component. If a bean does not know which layer it belongs to, it can be annotated using the `@Component` annotation.
- `@Repository`: corresponds to the persistence layer, which is the Dao layer, and is mainly used for database-related operations.
- `@Service`: Corresponds to the service layer, which mainly involves some complex logic and requires the use of the Dao layer.
- `@Controller`: Corresponds to the Spring MVC control layer, mainly used to accept user requests and call the Service layer to return data to the front-end page.
- `@RestController`: a combined annotation, equivalent to `@Controller` + `@ResponseBody`. It is specifically designed for building controllers for RESTful web services. For classes marked with `@RestController`, the return values ​​of all handler methods will be automatically serialized (usually JSON) and written to the HTTP response body instead of being parsed into view names.

`@Controller` vs `@RestController`:

- `@Controller`: Mainly used in traditional Spring MVC applications. The method return value is usually the logical view name, which requires a view resolver to cooperate with rendering the page. If you need to return data (such as JSON), you need to add an additional `@ResponseBody` annotation to the method.
- `@RestController`: Designed for building RESTful APIs that return data. After using this annotation on a class, the return value of all methods will be treated as the response body content by default (equivalent to `@ResponseBody` being implicitly added to each method), which is usually used to return JSON or XML data. In modern front-end and back-end separation applications, `@RestController` is the more common choice.

For a comparison between `@RestController` and `@Controller`, please read this article: [@RestController vs @Controller](https://mp.weixin.qq.com/s?__biz=Mzg2OTA0Njk0OA==&mid=2247485544&idx=1&sn=3cc95b88979e28fe3bfe539eb421c6 d8&chksm=cea247a3f9d5ceb5e324ff4b8697adc3e828ecf71a3468445e70221cce768d1e722085359907&token=1725092312&lang=zh_CN#rd).

## Configuration

### Declare configuration class

`@Configuration` is mainly used to declare that a class is a Spring configuration class. Although it can also be replaced by the `@Component` annotation, `@Configuration` can more clearly express the purpose of the class (defining Bean), has clearer semantics, and facilitates Spring's specific processing (for example, ensuring the singleton behavior of the `@Bean` method through the CGLIB proxy).

```java
@Configuration
public class AppConfig {

    // @Bean annotation is used to declare a Bean in the configuration class
    @Bean
    public TransferService transferService() {
        return new TransferServiceImpl();
    }

    // The configuration class can contain one or more @Bean methods.
}
```

### Read configuration information

In application development, we often need to manage some configuration information, such as database connection details, keys or addresses of third-party services (such as Alibaba Cloud OSS, SMS service, WeChat authentication), etc. Usually, this information will be stored centrally in configuration files (such as `application.yml` or `application.properties`) for easy management and modification.

Spring provides a variety of convenient ways to read this configuration information. Suppose we have the following `application.yml` file:

```yaml
wuhan2020: A new type of coronavirus broke out in Wuhan at the beginning of 2020. The epidemic was serious, but I believe everything will pass! Come on Wuhan! Come on, China!

my-profile:
  name: Brother Guide
  email: koushuangbwcx@163.com

library:
  location: Come on Wuhan, Hubei Come on China
  books:
    - name: Genius Basic Law
      description: On the day her father was diagnosed with Alzheimer's disease, twenty-two-year-old Lin Zhaoxi learned that Pei Zhi, the school boy whom she had a crush on for many years, was about to go abroad for further study - the school her father had admitted to was the one her father had given up for her.
    - name: order of time
      description: Why do we remember the past but not the future? What does it mean for time to “pass”? Do we exist within time, or does time exist within us? Carlo Rove uses poetic words to invite us to think about this eternal problem-the nature of time.
    - name: amazing me
      description: How to develop a new habit? How to become more mentally mature? How to have high-quality relationships? How to get out of difficult moments in life?
```

Here are some commonly used ways to read configuration:

1. `@Value("${property.key}")` injects a single property value in the configuration file (such as `application.properties` or `application.yml`). It also supports Spring Expression Language (SpEL), which enables more complex injection logic.

```java
@Value("${wuhan2020}")
String wuhan2020;
```

2. `@ConfigurationProperties` can read configuration information and bind it to beans, which is more useful.

```java
@Component
@ConfigurationProperties(prefix = "library")
class LibraryProperties {
    @NotEmpty
    private String location;
    private List<Book> books;

    @Setter
    @Getter
    @ToString
    static class Book {
        String name;
        String description;
    }
  Omit getter/setter
  ...
}
```

You can inject it into a class just like a normal Spring Bean.

```java
@Service
public class LibraryService {

    private final LibraryProperties libraryProperties;

    @Autowired
    public LibraryService(LibraryProperties libraryProperties) {
        this.libraryProperties = libraryProperties;
    }

    public void printLibraryInfo() {
        System.out.println(libraryProperties);
    }
}
```

### Load the specified configuration file

The `@PropertySource` annotation allows loading of custom configuration files. Suitable for scenarios where some configuration information needs to be stored independently.

```java
@Component
@PropertySource("classpath:website.properties")

class WebSite {
    @Value("${url}")
    private String url;

  Omit getter/setter
  ...
}
```

**Note**: When using `@PropertySource`, make sure the external file path is correct and the file is on the classpath.

For more information, please check out my article: [10 minutes to complete SpringBoot's elegant reading of configuration files? ](https://mp.weixin.qq.com/s?__biz=Mzg2OTA0Njk0OA==&mid=2247486181&idx=2&sn=10db0ae64ef501f96a5b0dbc4bd78786&ch ksm=cea2452ef9d5cc384678e456427328600971180a77e40c13936b19369672ca3e342c26e92b50&token=816772476&lang=zh_CN#rd) .

##MVC

### HTTP request

**5 common request types:**- **GET**: Request to obtain a specific resource from the server. For example: `GET /users` (get all students)
- **POST**: Create a new resource on the server. For example: `POST /users` (create student)
- **PUT**: Update the resource on the server (the client provides the entire updated resource). For example: `PUT /users/12` (update student number 12)
- **DELETE**: Delete a specific resource from the server. For example: `DELETE /users/12` (delete student number 12)
- **PATCH**: Updates resources on the server (the client provides changed attributes, which can be regarded as a partial update). It is rarely used, so I will not give an example here.

#### GET request

`@GetMapping("users")` is equivalent to `@RequestMapping(value="/users",method=RequestMethod.GET)`.

```java
@GetMapping("/users")
public ResponseEntity<List<User>> getAllUsers() {
 return userRepository.findAll();
}
```

#### POST request

`@PostMapping("users")` is equivalent to `@RequestMapping(value="/users",method=RequestMethod.POST)`.

`@PostMapping` is usually used in conjunction with `@RequestBody` to receive JSON data and map it to Java objects.

```java
@PostMapping("/users")
public ResponseEntity<User> createUser(@Valid @RequestBody UserCreateRequest userCreateRequest) {
 return userRepository.save(userCreateRequest);
}
```

#### PUT request

`@PutMapping("/users/{userId}")` is equivalent to `@RequestMapping(value="/users/{userId}",method=RequestMethod.PUT)`.

```java
@PutMapping("/users/{userId}")
public ResponseEntity<User> updateUser(@PathVariable(value = "userId") Long userId,
  @Valid @RequestBody UserUpdateRequest userUpdateRequest) {
  ...
}
```

#### DELETE request

`@DeleteMapping("/users/{userId}")` is equivalent to `@RequestMapping(value="/users/{userId}", method=RequestMethod.DELETE)`

```java
@DeleteMapping("/users/{userId}")
public ResponseEntity deleteUser(@PathVariable(value = "userId") Long userId){
  ...
}
```

#### PATCH request

Generally in actual projects, we only use PATCH requests to update data after PUT is not enough.

```java
  @PatchMapping("/profile")
  public ResponseEntity updateStudent(@RequestBody StudentUpdateRequest studentUpdateRequest) {
        studentRepository.updateDetail(studentUpdateRequest);
        return ResponseEntity.ok().build();
    }
```

### Parameter binding

When processing HTTP requests, Spring MVC provides a variety of annotations for binding request parameters to method parameters. The following are common parameter binding methods:

#### Extract parameters from URL path

`@PathVariable` is used to extract parameters from the URL path. For example:

```java
@GetMapping("/klasses/{klassId}/teachers")
public List<Teacher> getTeachersByClass(@PathVariable("klassId") Long klassId) {
    return teacherService.findTeachersByClass(klassId);
}
```

If the request URL is `/klasses/123/teachers`, then `klassId = 123`.

#### Bind query parameters

`@RequestParam` is used to bind query parameters. For example:

```java
@GetMapping("/klasses/{klassId}/teachers")
public List<Teacher> getTeachersByClass(@PathVariable Long klassId,
                                        @RequestParam(value = "type", required = false) String type) {
    return teacherService.findTeachersByClassAndType(klassId, type);
}
```

If the request URL is `/klasses/123/teachers?type=web`, then `klassId = 123`, `type = web`.

#### Bind JSON data in the request body

`@RequestBody` is used to read the body part of the Request request (which may be a POST, PUT, DELETE, GET request) and the **Content-Type is application/json** format data. After receiving the data, the data will be automatically bound to the Java object. The system will use `HttpMessageConverter` or a custom `HttpMessageConverter` to convert the json string in the request body into a java object.

I use a simple example to demonstrate the basic use!

We have a registered interface:

```java
@PostMapping("/sign-up")
public ResponseEntity signUp(@RequestBody @Valid UserRegisterRequest userRegisterRequest) {
  userService.save(userRegisterRequest);
  return ResponseEntity.ok().build();
}
```

`UserRegisterRequest` object:

```java
@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserRegisterRequest {
    @NotBlank
    private String userName;
    @NotBlank
    private String password;
    @NotBlank
    private String fullName;
}
```

We send a post request to this interface, and the body carries JSON data:

```json
{ "userName": "coder", "fullName": "shuangkou", "password": "123456" }
```

In this way, our backend can directly map data in json format to our `UserRegisterRequest` class.

![](./images/spring-annotations/@RequestBody.png)

**Note**:

- A method can only have one `@RequestBody` parameter, but can have multiple `@PathVariable` and `@RequestParam`.
- If you need to receive multiple complex objects, it is recommended to merge them into a single object.

## Data verification

Data verification is a key link to ensure system stability and security. Even if data validation has been implemented in the user interface (front-end), the back-end service must still validate the received data again. This is because front-end validation can be easily bypassed (for example, by modifying the request through developer tools or directly calling the API using HTTP tools such as Postman and curl), and malicious or erroneous data can be sent directly to the backend. Therefore, back-end verification is the last and most important line of defense to prevent illegal data, maintain data consistency, and ensure the correct execution of business logic.

Bean Validation is a set of specifications that define JavaBean parameter verification standards (JSR 303, 349, 380). It provides a series of annotations that can be directly used on JavaBean properties to achieve convenient parameter verification.- **JSR 303 (Bean Validation 1.0):** laid the foundation, introduced core validation annotations (such as `@NotNull`, `@Size`, `@Min`, `@Max`, etc.), defined how to verify JavaBean properties through annotations, and supported nested object verification and custom validators.
- **JSR 349 ​​(Bean Validation 1.1):** Extended on the basis of 1.0, such as introducing support for method parameter and return value verification, and enhancing the processing of group validation (Group Validation).
- **JSR 380 (Bean Validation 2.0):** Embraces the new features of Java 8 and makes some improvements, such as supporting date and time types in the `java.time` package and introducing some new validation annotations (such as `@NotEmpty`, `@NotBlank`, etc.).

Bean Validation itself is just a set of specifications (interfaces and annotations). We need a specific framework that implements this set of specifications to execute the verification logic. Currently, **Hibernate Validator** is the most authoritative and widely used reference implementation of the Bean Validation specification.

- Hibernate Validator 4.x implements Bean Validation 1.0 (JSR 303).
- Hibernate Validator 5.x implements Bean Validation 1.1 (JSR 349).
- Hibernate Validator 6.x and later implements Bean Validation 2.0 (JSR 380).

It is very convenient to use Bean Validation in Spring Boot projects, thanks to Spring Boot's automatic configuration capabilities. Regarding the introduction of dependencies, please note:

- In older versions of Spring Boot (usually before 2.3.x), the `spring-boot-starter-web` dependency includes hibernate-validator by default. Therefore, as long as Web Starter is introduced, there is no need to add additional verification-related dependencies.
- Starting from Spring Boot 2.3.x version, for more refined dependency management, verification-related dependencies have been moved out of spring-boot-starter-web. If your project uses these or newer versions and requires Bean Validation functionality, then you need to explicitly add the `spring-boot-starter-validation` dependency:

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-validation</artifactId>
</dependency>
```

![](https://oss.javaguide.cn/2021/03/c7bacd12-1c1a-4e41-aaaf-4cad840fc073.png)

Non-SpringBoot projects need to introduce relevant dependency packages by themselves. I won’t go into details here. For details, you can check out this article of mine: [How to do parameter verification in Spring/Spring Boot? Everything you need to know is here! ](https://mp.weixin.qq.com/s?__biz=Mzg2OTA0Njk0OA==&mid=2247485783&idx=1&sn=a407f3b75efa17c643407daa7fb2acd6&ch ksm=cea2469cf9d5cf8afbcd0a8a1c9cc4294d6805b8e01bee6f76bb2884c5bc15478e91459def49&token=292197051&lang=zh_CN#rd).

👉 It should be noted that for all annotations, it is recommended to use JSR annotations, namely `javax.validation.constraints` instead of `org.hibernate.validator.constraints`

### Some common field validation annotations

The Bean Validation specification and its implementations (such as Hibernate Validator) provide rich annotations for declaratively defining validation rules. The following are some commonly used annotations and their descriptions:

- `@NotNull`: Checks that the annotated element (of any type) cannot be `null`.
- `@NotEmpty`: Checks that the annotated element (such as `CharSequence`, `Collection`, `Map`, `Array`) cannot be `null` and its size/length cannot be 0. Note: For strings, `@NotEmpty` allows strings containing whitespace characters, such as `" "`.
- `@NotBlank`: Check that the annotated `CharSequence` (such as `String`) cannot be `null`, and the length after removing leading and trailing spaces must be greater than 0. (i.e., cannot be a blank string).
- `@Null`: Checks that the annotated element must be `null`.
- `@AssertTrue` / `@AssertFalse`: Check that the annotated `boolean` or `Boolean` type element must be `true` / `false`.
- `@Min(value)` / `@Max(value)`: Checks that the value of the annotated numeric type (or its string representation) must be greater than or equal to / less than or equal to the specified `value`. Applies to integer types (`byte`, `short`, `int`, `long`, `BigInteger`, etc.).
- `@DecimalMin(value)` / `@DecimalMax(value)`: Function similar to `@Min` / `@Max`, but suitable for numeric types containing decimals (`BigDecimal`, `BigInteger`, `CharSequence`, `byte`, `short`, `int`, `long` and their wrapper classes). `value` must be a string representation of a number.
- `@Size(min=, max=)`: Checks that the size/length of annotated elements (such as `CharSequence`, `Collection`, `Map`, `Array`) must be within the specified `min` and `max` range (inclusive of boundaries).
- `@Digits(integer=, fraction=)`: Checks the value of the annotated numeric type (or its string representation). The number of digits in the integer part must be ≤ `integer` and the number of digits in the fractional part must be ≤ `fraction`.
- `@Pattern(regexp=, flags=)`: Check whether the annotated `CharSequence` (such as `String`) matches the specified regular expression (`regexp`). `flags` can specify matching patterns (eg case-insensitive).
- `@Email`: Check whether the annotated `CharSequence` (such as `String`) conforms to the Email format (a relatively loose regular expression is built-in).
- `@Past` / `@Future`: Check whether the annotated date or time type (`java.util.Date`, `java.util.Calendar`, types under the JSR 310 `java.time` package) is before/after the current time.
- `@PastOrPresent` / `@FutureOrPresent`: Like `@Past` / `@Future`, but allowed to be equal to the current time.
-…

### Verify request body (RequestBody)

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
```### 验证请求参数(Path Variables 和 Request Parameters)

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

## 全局异常处理

介绍一下我们 Spring 项目必备的全局处理 Controller 层异常。

**相关注解：**

1. `@ControllerAdvice` :注解定义全局异常处理类
2. `@ExceptionHandler` :注解声明异常处理方法

如何使用呢？拿我们在第 5 节参数校验这块来举例子。如果方法参数不对的话就会抛出`MethodArgumentNotValidException`，我们来处理这个异常。

```java
@ControllerAdvice
@ResponseBody
public class GlobalExceptionHandler {

    /**
     * 请求参数异常处理
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<?> handleMethodArgumentNotValidException(MethodArgumentNotValidException ex, HttpServletRequest request) {
       ......
    }
}
```

更多关于 Spring Boot 异常处理的内容，请看我的这两篇文章：

1. [SpringBoot 处理异常的几种常见姿势](https://mp.weixin.qq.com/s?__biz=Mzg2OTA0Njk0OA==&mid=2247485568&idx=2&sn=c5ba880fd0c5d82e39531fa42cb036ac&chksm=cea2474bf9d5ce5dcbc6a5f6580198fdce4bc92ef577579183a729cb5d1430e4994720d59b34&token=2133161636&lang=zh_CN#rd)
2. [使用枚举简单封装一个优雅的 Spring Boot 全局异常处理！](https://mp.weixin.qq.com/s?__biz=Mzg2OTA0Njk0OA==&mid=2247486379&idx=2&sn=48c29ae65b3ed874749f0803f0e4d90e&chksm=cea24460f9d5cd769ed53ad7e17c97a7963a89f5350e370be633db0ae8d783c3a3dbd58c70f8&token=1054498516&lang=zh_CN#rd)

## 事务

在要开启事务的方法上使用`@Transactional`注解即可!

```java
@Transactional(rollbackFor = Exception.class)
public void save() {
  ......
}

```

我们知道 Exception 分为运行时异常 RuntimeException 和非运行时异常。在`@Transactional`注解中如果不配置`rollbackFor`属性,那么事务只会在遇到`RuntimeException`的时候才会回滚,加上`rollbackFor=Exception.class`,可以让事务在遇到非运行时异常时也回滚。

`@Transactional` 注解一般可以作用在`类`或者`方法`上。

- **作用于类**：当把`@Transactional` 注解放在类上时，表示所有该类的 public 方法都配置相同的事务属性信息。
- **作用于方法**：当类配置了`@Transactional`，方法也配置了`@Transactional`，方法的事务会覆盖类的事务配置信息。

更多关于 Spring 事务的内容请查看我的这篇文章：[可能是最漂亮的 Spring 事务管理详解](./spring-transaction.md) 。

## JPA

Spring Data JPA 提供了一系列注解和功能，帮助开发者轻松实现 ORM（对象关系映射）。

### 创建表

`@Entity` 用于声明一个类为 JPA 实体类，与数据库中的表映射。`@Table` 指定实体对应的表名。

```java
@Entity
@Table(name = "role")
public class Role {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String description;

    // 省略 getter/setter
}
```

### 主键生成策略

`@Id`声明字段为主键。`@GeneratedValue` 指定主键的生成策略。

JPA 提供了 4 种主键生成策略：

- **`GenerationType.TABLE`**：通过数据库表生成主键。
- **`GenerationType.SEQUENCE`**：通过数据库序列生成主键（适用于 Oracle 等数据库）。
- **`GenerationType.IDENTITY`**：主键自增长（适用于 MySQL 等数据库）。
- **`GenerationType.AUTO`**：由 JPA 自动选择合适的生成策略（默认策略）。

```java
@Id
@GeneratedValue(strategy = GenerationType.IDENTITY)
private Long id;
```

通过 `@GenericGenerator` 声明自定义主键生成策略：

```java
@Id
@GeneratedValue(generator = "IdentityIdGenerator")
@GenericGenerator(name = "IdentityIdGenerator", strategy = "identity")
private Long id;
```

等价于：

```java
@Id
@GeneratedValue(strategy = GenerationType.IDENTITY)
private Long id;
```

JPA 提供的主键生成策略有如下几种：

```java
public class DefaultIdentifierGeneratorFactory
    implements MutableIdentifierGeneratorFactory, Serializable, ServiceRegistryAwareService {

  @SuppressWarnings("deprecation")
  public DefaultIdentifierGeneratorFactory() {
    register( "uuid2", UUIDGenerator.class );
    register( "guid", GUIDGenerator.class );      // can be done with UUIDGenerator + strategy
    register( "uuid", UUIDHexGenerator.class );      // "deprecated" for new use
    register( "uuid.hex", UUIDHexGenerator.class );   // uuid.hex is deprecated
    register( "assigned", Assigned.class );
    register( "identity", IdentityGenerator.class );
    register( "select", SelectGenerator.class );
    register( "sequence", SequenceStyleGenerator.class );
    register( "seqhilo", SequenceHiLoGenerator.class );
    register( "increment", IncrementGenerator.class );
    register( "foreign", ForeignGenerator.class );
    register( "sequence-identity", SequenceIdentityGenerator.class );
    register( "enhanced-sequence", SequenceStyleGenerator.class );
    register( "enhanced-table", TableGenerator.class );
  }

  public void register(String strategy, Class generatorClass) {
    LOG.debugf( "Registering IdentifierGenerator strategy [%s] -> [%s]", strategy, generatorClass.getName() );
    final Class previous = generatorStrategyToClassNameMap.put( strategy, generatorClass );
    if ( previous != null ) {
      LOG.debugf( "    - overriding [%s]", previous.getName() );
    }
  }

}
```

### Field mapping

`@Column` is used to specify the mapping relationship between entity fields and database columns.

- **`name`**: Specify the database column name.
- **`nullable`**: Specifies whether `null` is allowed.
- **`length`**: Set the length of the field (only for `String` type).
- **`columnDefinition`**: Specify the database type and default value of the field.

```java
@Column(name = "user_name", nullable = false, length = 32)
private String userName;

@Column(columnDefinition = "tinyint(1) default 1")
private Boolean enabled;
```

### Ignore fields

`@Transient` is used to declare fields that do not require persistence.

```java
@Entity
public class User {

    @Transient
    private String temporaryField; // will not be mapped to the database table
}
```

Other fields that are not persisted:

- **`static`**: Static fields will not be persisted.
- **`final`**: Final fields will not be persisted.
- **`transient`**: Fields declared using Java's `transient` keyword will not be serialized or persisted.

### Large field storage

`@Lob` is used to declare large fields (such as `CLOB` or `BLOB`).

```java
@Lob
@Column(name = "content", columnDefinition = "LONGTEXT NOT NULL")
private String content;
```

### Enumeration type mapping

`@Enumerated` is used to map enumerated types to database fields.

- **`EnumType.ORDINAL`**: Stores the ordinal number of the enumeration (default).
- **`EnumType.STRING`**: Stores the name of the enumeration (recommended).

```java
public enum Gender {
    MALE,
    FEMALE
}

@Entity
public class User {

    @Enumerated(EnumType.STRING)
    private Gender gender;
}
```

The value stored in the database is `MALE` or `FEMALE`.

### Audit function

Through the audit function of JPA, information such as creation time, update time, creator and updater can be automatically recorded in the entity.

Audit base class:

```java
@Data
@MappedSuperclass
@EntityListeners(AuditingEntityListener.class)
public abstract class AbstractAuditBase {

    @CreatedDate
    @Column(updatable = false)
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;

    @CreatedBy
    @Column(updatable = false)
    private String createdBy;

    @LastModifiedBy
    private String updatedBy;
}
```

Configure audit function:

```java
@Configuration
@EnableJpaAuditing
public class AuditConfig {

    @Bean
    public AuditorAware<String> auditorProvider() {
        return () -> Optional.ofNullable(SecurityContextHolder.getContext())
                .map(SecurityContext::getAuthentication)
                .filter(Authentication::isAuthenticated)
                .map(Authentication::getName);
    }
}
```

Let’s briefly introduce some of the annotations involved above:

1. `@CreatedDate`: Indicates that the field is a creation time field. When this entity is inserted, the value will be set.
2. `@CreatedBy`: Indicates that this field is the creator. When this entity is inserted, the value `@LastModifiedDate` and `@LastModifiedBy` will be set in the same way.
3. `@EnableJpaAuditing`: Enable JPA auditing function.

### Modify and delete operations

The `@Modifying` annotation is used to identify modification or deletion operations and must be used together with `@Transactional`.

```java
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    @Modifying
    @Transactional
    void deleteByUserName(String userName);
}
```

### Association relationship

JPA provides 4 types of annotations for relationships:

- **`@OneToOne`**: one-to-one relationship.
- **`@OneToMany`**: One-to-many relationship.
- **`@ManyToOne`**: Many-to-one relationship.
- **`@ManyToMany`**: Many-to-many relationship.

```java
@Entity
public class User {

    @OneToOne
    private Profile profile;

    @OneToMany(mappedBy = "user")
    private List<Order> orders;
}
```

## JSON data processing

In web development, it is often necessary to deal with conversion between Java objects and JSON format. Spring usually integrates the Jackson library to complete this task. The following are some commonly used Jackson annotations that can help us customize the JSON serialization (Java object to JSON) and deserialization (JSON to Java object) process.

### Filter JSON fields

Sometimes we do not want certain fields of a Java object to be included in the final generated JSON, or certain JSON properties are not processed when converting JSON to a Java object.

`@JsonIgnoreProperties` is used on classes to filter out specific fields that are not returned or parsed.

```java
// Ignore userRoles attribute when generating JSON
// If unknown properties are allowed (that is, properties that are in JSON but not in the class), you can add ignoreUnknown = true
@JsonIgnoreProperties({"userRoles"})
public class User {
    private String userName;
    private String fullName;
    private String password;
    private List<UserRole> userRoles = new ArrayList<>();
    // getters and setters...
}
```

`@JsonIgnore` works at the field or `getter/setter` method level and is used to specify that a specific property is ignored when serializing or deserializing.

```java
public class User {
    private String userName;
    private String fullName;
    private String password;

    // Ignore userRoles attribute when generating JSON
    @JsonIgnore
    private List<UserRole> userRoles = new ArrayList<>();
    // getters and setters...
}
```

`@JsonIgnoreProperties` is more suitable for explicitly excluding multiple fields when defining a class, or for field exclusion in inheritance scenarios; `@JsonIgnore` is more directly used to mark a single specific field.

### Format JSON data

`@JsonFormat` is used to specify the format of properties during serialization and deserialization. Commonly used for formatting date and time types.

For example:

```java
// Specify the Date type to be serialized into an ISO 8601 format string, and set the time zone to GMT
@JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", timezone = "GMT")
private Date date;
```

### Flatten JSON objectThe `@JsonUnwrapped` annotation acts on a field and is used to "promote" the properties of its nested object to the level of the current object during serialization, and perform the opposite operation during deserialization. This makes the JSON structure flatter.

Suppose there is an `Account` class, containing two nested objects `Location` and `PersonInfo`.

```java
@Getter
@Setter
@ToString
public class Account {
    private Location location;
    private PersonInfo personInfo;

  @Getter
  @Setter
  @ToString
  public static class Location {
     private String provinceName;
     private String countyName;
  }
  @Getter
  @Setter
  @ToString
  public static class PersonInfo {
    private String userName;
    private String fullName;
  }
}

```

JSON structure before flattening:

```json
{
  "location": {
    "provinceName": "Hubei",
    "countyName": "Wuhan"
  },
  "personInfo": {
    "userName": "coder1234",
    "fullName": "shaungkou"
  }
}
```

Use `@JsonUnwrapped` flat objects:

```java
@Getter
@Setter
@ToString
public class Account {
    @JsonUnwrapped
    private Location location;
    @JsonUnwrapped
    private PersonInfo personInfo;
    ...
}
```

Flattened JSON structure:

```json
{
  "provinceName": "Hubei",
  "countyName": "Wuhan",
  "userName": "coder1234",
  "fullName": "shaungkou"
}
```

## Test

`@ActiveProfiles` generally acts on test classes and is used to declare effective Spring configuration files.

```java
//Specify to start the application context on RANDOM_PORT and activate the "test" profile
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
@Slf4j
public abstract class TestBase {
    // Common test setup or abstract methods...
}
```

`@Test` is an annotation provided by the JUnit framework (usually JUnit 5 Jupiter), which is used to mark a method as a test method. Although it is not an annotation of Spring itself, it is the basis for executing unit tests and integration tests.

The data of the declared test method with `@Transactional` will be rolled back to avoid polluting the test data.

`@WithMockUser` is an annotation provided by the Spring Security Test module to simulate an authenticated user during testing. You can easily specify usernames, passwords, roles (authorities) and other information to test security-protected endpoints or methods.

```java
public class MyServiceTest extends TestBase { // Assuming TestBase provides Spring context

    @Test
    @Transactional // Test data will be rolled back
    @WithMockUser(username = "test-user", authorities = { "ROLE_TEACHER", "read" }) // Simulate a user named "test-user" who has the TEACHER role and read permissions
    void should_perform_action_requiring_teacher_role() throws Exception {
        // ... test logic ...
        //Here you can call service methods that require "ROLE_TEACHER" permissions
    }
}
```

<!-- @include: @article-footer.snippet.md -->