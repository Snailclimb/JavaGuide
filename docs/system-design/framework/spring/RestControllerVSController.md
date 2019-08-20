周末的时候分享了一个技术session，讲到了@RestController 和 @Controller，当时没有太讲清楚，因为 team 里很多同事之前不是做 Java的，所以对这两个东西不太熟悉，于是写了篇文章整理了一下。

## @RestController vs @Controller

### Controller 返回一个页面

单独使用 `@Controller` 不加 `@ResponseBody`的话一般使用在要返回一个视图的情况，这种情况属于比较传统的Spring MVC 的应用，对应于前后端不分离的情况。

![SpringMVC 传统工作流程](https://my-blog-to-use.oss-cn-beijing.aliyuncs.com/2019-7/SpringMVC传统工作流程.png)

### @RestController 返回JSON 或 XML 形式数据

但`@RestController`只返回对象，对象数据直接以 JSON 或 XML 形式写入 HTTP 响应(Response)中，这种情况属于 RESTful Web服务，这也是目前日常开发所接触的最常用的情况（前后端分离）。

![SpringMVC+RestController](https://my-blog-to-use.oss-cn-beijing.aliyuncs.com/2019-7/SpringMVCRestController.png)

### @Controller +@ResponseBody 返回JSON 或 XML 形式数据

如果你需要在Spring4之前开发 RESTful Web服务的话，你需要使用`@Controller` 并结合`@ResponseBody`注解，也就是说`@Controller` +`@ResponseBody`= `@RestController`（Spring 4 之后新加的注解）。

> `@ResponseBody` 注解的作用是将 `Controller` 的方法返回的对象通过适当的转换器转换为指定的格式之后，写入到HTTP 响应(Response)对象的 body 中，通常用来返回 JSON 或者 XML 数据，返回 JSON 数据的情况比较多。

![Spring3.xMVC RESTfulWeb服务工作流程](https://my-blog-to-use.oss-cn-beijing.aliyuncs.com/2019-7/Spring3.xMVCRESTfulWeb服务工作流程.png)

Reference:

- https://dzone.com/articles/spring-framework-restcontroller-vs-controller（图片来源）
- https://javarevisited.blogspot.com/2017/08/difference-between-restcontroller-and-controller-annotations-spring-mvc-rest.html?m=1

### 示例1:  @Controller 返回一个页面

当我们需要直接在后端返回一个页面的时候，Spring 推荐使用 Thymeleaf 模板引擎。Spring MVC中`@Controller`中的方法可以直接返回模板名称，接下来 Thymeleaf 模板引擎会自动进行渲染,模板中的表达式支持Spring表达式语言（Spring EL)。**如果需要用到 Thymeleaf 模板引擎，注意添加依赖！不然会报错。**

Gradle:

```groovy
 compile 'org.springframework.boot:spring-boot-starter-thymeleaf'
```

Maven:

```xml
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-thymeleaf</artifactId>
</dependency>
```

`src/main/java/com/example/demo/controller/HelloController.java`

```java
@Controller
public class HelloController {
    @GetMapping("/hello")
    public String greeting(@RequestParam(name = "name", required = false, defaultValue = "World") String name, Model model) {
        model.addAttribute("name", name);
        return "hello";
    }
}
```
`src/main/resources/templates/hello.html`

Spring 会去 resources 目录下 templates 目录下找，所以建议把页面放在 resources/templates 目录下

```html
<!DOCTYPE HTML>
<html xmlns:th="http://www.thymeleaf.org">
<head>
    <title>Getting Started: Serving Web Content</title>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>
</head>
<body>
<p th:text="'Hello, ' + ${name} + '!'"/>
</body>
</html>
```

访问：http://localhost:8999/hello?name=team-c ，你将看到下面的内容

```
Hello, team-c!
```

如果要对页面在templates目录下的hello文件夹中的话，返回页面的时候像下面这样写就可以了。

`src/main/resources/templates/hello/hello.html`

```java
   return "hello/hello";
```

### 示例2:  @Controller+@ResponseBody 返回 JSON 格式数据

**SpringBoot 默认集成了 jackson ,对于此需求你不需要添加任何相关依赖。**

`src/main/java/com/example/demo/controller/Person.java`

```java
public class Person {
    private String name;
    private Integer age;
    ......
    省略getter/setter ，有参和无参的construtor方法
}

```

`src/main/java/com/example/demo/controller/HelloController.java`

```java
@Controller
public class HelloController {
    @PostMapping("/hello")
    @ResponseBody
    public Person greeting(@RequestBody Person person) {
        return person;
    }

}
```

使用 post 请求访问 http://localhost:8080/hello ，body 中附带以下参数,后端会以json 格式将 person 对象返回。

```json
{
    "name": "teamc",
    "age": 1
}
```

### 示例3:  @RestController 返回 JSON 格式数据

只需要将`HelloController`改为如下形式：

```java
@RestController
public class HelloController {
    @PostMapping("/hello")
    public Person greeting(@RequestBody Person person) {
        return person;
    }

}
```

