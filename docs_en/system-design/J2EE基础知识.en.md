# Servlet 总结

在 Java Web 程序中，**Servlet**主要负责接收用户请求 `HttpServletRequest`,在`doGet()`,`doPost()`中做相应的处理，并将回应`HttpServletResponse`反馈给用户。**Servlet** 可以设置初始化参数，供 Servlet 内部使用。一个 Servlet 类只会有一个实例，在它初始化时调用`init()`方法，销毁时调用`destroy()`方法**。**Servlet 需要在 web.xml 中配置（MyEclipse 中创建 Servlet 会自动配置），**一个 Servlet 可以设置多个 URL 访问**。**Servlet 不是线程安全**，因此要谨慎使用类变量。

## 阐述 Servlet 和 CGI 的区别?

### CGI 的不足之处

1，需要为每个请求启动一个操作 CGI 程序的系统进程。如果请求频繁，这将会带来很大的开销。

2，需要为每个请求加载和运行一个 CGI 程序，这将带来很大的开销

3，需要重复编写处理网络协议的代码以及编码，这些工作都是非常耗时的。

### Servlet 的优点

1，只需要启动一个操作系统进程以及加载一个 JVM，大大降低了系统的开销

2，如果多个请求需要做同样处理的时候，这时候只需要加载一个类，这也大大降低了开销

3，所有动态加载的类可以实现对网络协议以及请求解码的共享，大大降低了工作量。

4，Servlet 能直接和 Web 服务器交互，而普通的 CGI 程序不能。Servlet 还能在各个程序之间共享数据，使数据库连接池之类的功能很容易实现。

补充：Sun Microsystems 公司在 1996 年发布 Servlet 技术就是为了和 CGI 进行竞争，Servlet 是一个特殊的 Java 程序，一个基于 Java 的 Web 应用通常包含一个或多个 Servlet 类。Servlet 不能够自行创建并执行，它是在 Servlet 容器中运行的，容器将用户的请求传递给 Servlet 程序，并将 Servlet 的响应回传给用户。通常一个 Servlet 会关联一个或多个 JSP 页面。以前 CGI 经常因为性能开销上的问题被诟病，然而 Fast CGI 早就已经解决了 CGI 效率上的问题，所以面试的时候大可不必信口开河的诟病 CGI，事实上有很多你熟悉的网站都使用了 CGI 技术。

参考：《javaweb 整合开发王者归来》P7

## Servlet 接口中有哪些方法及 Servlet 生命周期探秘

Servlet 接口定义了 5 个方法，其中**前三个方法与 Servlet 生命周期相关**：

- `void init(ServletConfig config) throws ServletException`
- `void service(ServletRequest req, ServletResponse resp) throws ServletException, java.io.IOException`
- `void destroy()`
- `java.lang.String getServletInfo()`
- `ServletConfig getServletConfig()`

**生命周期：** **Web 容器加载 Servlet 并将其实例化后，Servlet 生命周期开始**，容器运行其**init()方法**进行 Servlet 的初始化；请求到达时调用 Servlet 的**service()方法**，service()方法会根据需要调用与请求对应的**doGet 或 doPost**等方法；当服务器关闭或项目被卸载时服务器会将 Servlet 实例销毁，此时会调用 Servlet 的**destroy()方法**。**init 方法和 destroy 方法只会执行一次，service 方法客户端每次请求 Servlet 都会执行**。Servlet 中有时会用到一些需要初始化与销毁的资源，因此可以把初始化资源的代码放入 init 方法中，销毁资源的代码放入 destroy 方法中，这样就不需要每次处理客户端的请求都要初始化与销毁资源。

参考：《javaweb 整合开发王者归来》P81

## GET 和 POST 的区别

这个问题在知乎上被讨论的挺火热的，地址：<https://www.zhihu.com/question/28586791> 。

![](https://static001.geekbang.org/infoq/04/0454a5fff1437c32754f1dfcc3881148.png)

GET 和 POST 是 HTTP 协议中两种常用的请求方法，它们在不同的场景和目的下有不同的特点和用法。一般来说，可以从以下几个方面来区分它们：

- 语义上的区别：GET 通常用于获取或查询资源，而 POST 通常用于创建或修改资源。GET 请求应该是幂等的，即多次重复执行不会改变资源的状态，而 POST 请求则可能有副作用，即每次执行可能会产生不同的结果或影响资源的状态。
- 格式上的区别：GET 请求的参数通常放在 URL 中，形成查询字符串（querystring），而 POST 请求的参数通常放在请求体（body）中，可以有多种编码格式，如 application/x-www-form-urlencoded、multipart/form-data、application/json 等。GET 请求的 URL 长度受到浏览器和服务器的限制，而 POST 请求的 body 大小则没有明确的限制。
- 缓存上的区别：由于 GET 请求是幂等的，它可以被浏览器或其他中间节点（如代理、网关）缓存起来，以提高性能和效率。而 POST 请求则不适合被缓存，因为它可能有副作用，每次执行可能需要实时的响应。
- 安全性上的区别：GET 请求和 POST 请求都不是绝对安全的，因为 HTTP 协议本身是明文传输的，无论是 URL、header 还是 body 都可能被窃取或篡改。为了保证安全性，必须使用 HTTPS 协议来加密传输数据。不过，在一些场景下，GET 请求相比 POST 请求更容易泄露敏感数据，因为 GET 请求的参数会出现在 URL 中，而 URL 可能会被记录在浏览器历史、服务器日志、代理日志等地方。因此，一般情况下，私密数据传输应该使用 POST + body。

重点搞清了，两者在语义上的区别即可。不过，也有一些项目所有的请求都用 POST，这个并不是固定的，项目组达成共识即可。

## 什么情况下调用 doGet()和 doPost()

Form 标签里的 method 的属性为 get 时调用 doGet()，为 post 时调用 doPost()。

## 转发(Forward)和重定向(Redirect)的区别

**转发是服务器行为，重定向是客户端行为。**

**转发（Forward）**
通过 RequestDispatcher 对象的 forward（HttpServletRequest request,HttpServletResponse response）方法实现的。RequestDispatcher 可以通过 HttpServletRequest 的 getRequestDispatcher()方法获得。例如下面的代码就是跳转到 login_success.jsp 页面。

```java
     request.getRequestDispatcher("login_success.jsp").forward(request, response);
```

**重定向（Redirect）** 是利用服务器返回的状态码来实现的。客户端浏览器请求服务器的时候，服务器会返回一个状态码。服务器通过 `HttpServletResponse` 的 `setStatus(int status)` 方法设置状态码。如果服务器返回 301 或者 302，则浏览器会到新的网址重新请求该资源。

1. **从地址栏显示来说**

   forward 是服务器请求资源,服务器直接访问目标地址的 URL,把那个 URL 的响应内容读取过来,然后把这些内容再发给浏览器.浏览器根本不知道服务器发送的内容从哪里来的,所以它的地址栏还是原来的地址.
   redirect 是服务端根据逻辑,发送一个状态码,告诉浏览器重新去请求那个地址.所以地址栏显示的是新的 URL.

2. **从数据共享来说**

   forward:转发页面和转发到的页面可以共享 request 里面的数据.
   redirect:不能共享数据.

3. **从运用地方来说**

   forward:一般用于用户登陆的时候,根据角色转发到相应的模块.
   redirect:一般用于用户注销登陆时返回主页面和跳转到其它的网站等

4. 从效率来说

   forward:高.
   redirect:低.

## 自动刷新(Refresh)

自动刷新不仅可以实现一段时间之后自动跳转到另一个页面，还可以实现一段时间之后自动刷新本页面。Servlet 中通过 HttpServletResponse 对象设置 Header 属性实现自动刷新例如：

```java
Response.setHeader("Refresh","5;URL=http://localhost:8080/servlet/example.htm");
```

其中 5 为时间，单位为秒。URL 指定就是要跳转的页面（如果设置自己的路径，就会实现每过 5 秒自动刷新本页面一次）

## Servlet 与线程安全

**Servlet 不是线程安全的，多线程并发的读写会导致数据不同步的问题。** 解决的办法是尽量不要定义 name 属性，而是要把 name 变量分别定义在 doGet()和 doPost()方法内。虽然使用 synchronized(name){}语句块可以解决问题，但是会造成线程的等待，不是很科学的办法。
注意：多线程的并发的读写 Servlet 类属性会导致数据不同步。但是如果只是并发地读取属性而不写入，则不存在数据不同步的问题。因此 Servlet 里的只读属性最好定义为 final 类型的。

参考：《javaweb 整合开发王者归来》P92

## JSP 和 Servlet 是什么关系

其实这个问题在上面已经阐述过了，Servlet 是一个特殊的 Java 程序，它运行于服务器的 JVM 中，能够依靠服务器的支持向浏览器提供显示内容。JSP 本质上是 Servlet 的一种简易形式，JSP 会被服务器处理成一个类似于 Servlet 的 Java 程序，可以简化页面内容的生成。Servlet 和 JSP 最主要的不同点在于，Servlet 的应用逻辑是在 Java 文件中，并且完全从表示层中的 HTML 分离开来。而 JSP 的情况是 Java 和 HTML 可以组合成一个扩展名为.jsp 的文件。有人说，Servlet 就是在 Java 中写 HTML，而 JSP 就是在 HTML 中写 Java 代码，当然这个说法是很片面且不够准确的。JSP 侧重于视图，Servlet 更侧重于控制逻辑，在 MVC 架构模式中，JSP 适合充当视图（view）而 Servlet 适合充当控制器（controller）。

## JSP 工作原理

JSP 是一种 Servlet，但是与 HttpServlet 的工作方式不太一样。HttpServlet 是先由源代码编译为 class 文件后部署到服务器下，为先编译后部署。而 JSP 则是先部署后编译。JSP 会在客户端第一次请求 JSP 文件时被编译为 HttpJspPage 类（接口 Servlet 的一个子类）。该类会被服务器临时存放在服务器工作目录里面。下面通过实例给大家介绍。
工程 JspLoginDemo 下有一个名为 login.jsp 的 Jsp 文件，把工程第一次部署到服务器上后访问这个 Jsp 文件，我们发现这个目录下多了下图这两个东东。
.class 文件便是 JSP 对应的 Servlet。编译完毕后再运行 class 文件来响应客户端请求。以后客户端访问 login.jsp 的时候，Tomcat 将不再重新编译 JSP 文件，而是直接调用 class 文件来响应客户端请求。

![JSP工作原理](https://oss.javaguide.cn/github/javaguide/1.jpeg)

由于 JSP 只会在客户端第一次请求的时候被编译 ，因此第一次请求 JSP 时会感觉比较慢，之后就会感觉快很多。如果把服务器保存的 class 文件删除，服务器也会重新编译 JSP。

开发 Web 程序时经常需要修改 JSP。Tomcat 能够自动检测到 JSP 程序的改动。如果检测到 JSP 源代码发生了改动。Tomcat 会在下次客户端请求 JSP 时重新编译 JSP，而不需要重启 Tomcat。这种自动检测功能是默认开启的，检测改动会消耗少量的时间，在部署 Web 应用的时候可以在 web.xml 中将它关掉。

参考：《javaweb 整合开发王者归来》P97

## JSP 有哪些内置对象、作用分别是什么

[JSP 内置对象 - CSDN 博客](http://blog.csdn.net/qq_34337272/article/details/64310849)

JSP 有 9 个内置对象：

- request：封装客户端的请求，其中包含来自 GET 或 POST 请求的参数；
- response：封装服务器对客户端的响应；
- pageContext：通过该对象可以获取其他对象；
- session：封装用户会话的对象；
- application：封装服务器运行环境的对象；
- out：输出服务器响应的输出流对象；
- config：Web 应用的配置对象；
- page：JSP 页面本身（相当于 Java 程序中的 this）；
- exception：封装页面抛出异常的对象。

## Request 对象的主要方法有哪些

- `setAttribute(String name,Object)`：设置名字为 name 的 request 的参数值
- `getAttribute(String name)`：返回由 name 指定的属性值
- `getAttributeNames()`：返回 request 对象所有属性的名字集合，结果是一个枚举的实例
- `getCookies()`：返回客户端的所有 Cookie 对象，结果是一个 Cookie 数组
- `getCharacterEncoding()`：返回请求中的字符编码方式 = getContentLength()`：返回请求的 Body 的长度
- `getHeader(String name)`：获得 HTTP 协议定义的文件头信息
- `getHeaders(String name)`：返回指定名字的 request Header 的所有值，结果是一个枚举的实例
- `getHeaderNames()`：返回所以 request Header 的名字，结果是一个枚举的实例
- `getInputStream()`：返回请求的输入流，用于获得请求中的数据
- `getMethod()`：获得客户端向服务器端传送数据的方法
- `getParameter(String name)`：获得客户端传送给服务器端的有 name 指定的参数值
- `getParameterNames()`：获得客户端传送给服务器端的所有参数的名字，结果是一个枚举的实例
- `getParameterValues(String name)`：获得有 name 指定的参数的所有值
- `getProtocol()`：获取客户端向服务器端传送数据所依据的协议名称
- `getQueryString()`：获得查询字符串
- `getRequestURI()`：获取发出请求字符串的客户端地址
- `getRemoteAddr()`：获取客户端的 IP 地址
- `getRemoteHost()`：获取客户端的名字
- `getSession([Boolean create])`：返回和请求相关 Session
- `getServerName()`：获取服务器的名字
- `getServletPath()`：获取客户端所请求的脚本文件的路径
- `getServerPort()`：获取服务器的端口号
- `removeAttribute(String name)`：删除请求中的一个属性

## request.getAttribute()和 request.getParameter()有何区别

**从获取方向来看：**

`getParameter()`是获取 POST/GET 传递的参数值；

`getAttribute()`是获取对象容器中的数据值；

**从用途来看：**

`getParameter()`用于客户端重定向时，即点击了链接或提交按扭时传值用，即用于在用表单或 url 重定向传值时接收数据用。

`getAttribute()` 用于服务器端重定向时，即在 sevlet 中使用了 forward 函数,或 struts 中使用了
mapping.findForward。 getAttribute 只能收到程序用 setAttribute 传过来的值。

另外，可以用 `setAttribute()`,`getAttribute()` 发送接收对象.而 `getParameter()` 显然只能传字符串。
`setAttribute()` 是应用服务器把这个对象放在该页面所对应的一块内存中去，当你的页面服务器重定向到另一个页面时，应用服务器会把这块内存拷贝另一个页面所对应的内存中。这样`getAttribute()`就能取得你所设下的值，当然这种方法可以传对象。session 也一样，只是对象在内存中的生命周期不一样而已。`getParameter()`只是应用服务器在分析你送上来的 request 页面的文本时，取得你设在表单或 url 重定向时的值。

**总结：**

`getParameter()`返回的是 String,用于读取提交的表单中的值;（获取之后会根据实际需要转换为自己需要的相应类型，比如整型，日期类型啊等等）

`getAttribute()`返回的是 Object，需进行转换,可用`setAttribute()`设置成任意对象，使用很灵活，可随时用

## include 指令 include 的行为的区别

**include directive:** JSP can include other files through the include directive. Included files can be JSP files, HTML files, or text files. The included files act as if they were part of the JSP file and will be compiled and executed at the same time. The syntax format is as follows:
<%@ include file="File relative url address" %>

i**nclude action:** The `<jsp:include>` action element is used to include static and dynamic files. This action inserts the specified file into the page being generated. The syntax format is as follows:
<jsp:include page="Relative URL address" flush="true" />

## JSP has nine built-in objects, seven actions, and three instructions.

[JSP nine built-in objects, seven actions, three instructions summary](http://blog.csdn.net/qq_34337272/article/details/64310849)

## Explain the four scopes in JSP

The four scopes in JSP include page, request, session and application, specifically:

- **page** represents objects and properties related to a page.
- **request** represents objects and properties related to a request issued by the Web client. A request may span multiple pages and involve multiple web components; temporary data that needs to be displayed on the page can be placed in this scope.
- **session** represents objects and attributes related to a session established by a user with the server. Data related to a user should be placed in the user's own session.
- **application** represents objects and properties related to the entire web application. It is essentially a global scope that spans the entire web application, including multiple pages, requests, and sessions.

## How to implement single-threaded mode of JSP or Servlet

For JSP pages, it can be set through the page directive.
`<%@page isThreadSafe="false"%>`

For Servlets, you can let your custom Servlets implement the SingleThreadModel identification interface.

Note: If JSP or Servlet is set to single-threaded working mode, it will cause each request to create a Servlet instance. This practice will cause serious performance problems (the server's memory pressure is very high and it will also cause frequent garbage collection), so it is not usually done.

## What are the technologies to implement session tracking?

1. **Use Cookies**

   Send cookie to client

   ```java
   Cookie c =new Cookie("name","value"); //Create Cookie
   c.setMaxAge(60*60*24); //Set the maximum age. The maximum age set here is one day.
   response.addCookie(c); //Put Cookie into HTTP response
   ```

   Read cookies from client

   ```java
   String name="name";
   Cookie[]cookies =request.getCookies();
   if(cookies !=null){
      for(int i= 0;i<cookies.length;i++){
       Cookie cookie =cookies[i];
       if(name.equals(cookis.getName()))
       //something is here.
       //you can get the value
       cookie.getValue();

      }
    }

   ```

   **Advantages:** Data can be saved persistently, no server resources are required, simple, text-based Key-Value

   **Disadvantages:** The size is limited and the user can disable the cookie function. Since it is saved locally, there is a certain security risk.

2. URL rewriting

   Add user session information to the URL as a parameter to the request, or add a unique session ID to the end of the URL to identify a session.

   **Advantages:** Can still be used when cookies are disabled

   **Disadvantages:** The URL of the website must be encoded, all pages must be generated dynamically, and cannot be accessed with pre-recorded URLs.

3. Hidden form fields

   ```html
   <input type="hidden" name="session" value="..." />
   ```

   **Advantages:** Can be used when cookies are banned

   **Disadvantages:** All pages must be the result of form submission.

4.HttpSession

   Of all session tracking technologies, the HttpSession object is the most powerful and versatile. An HttpSession is automatically created when a user visits a website for the first time, and each user can access his own HttpSession. The HttpSession can be obtained through the getSession method of the HttpServletRequest object. A value can be placed in the HttpSession through the setAttribute method of the HttpSession. By calling the getAttribute method of the HttpSession object and passing in the attribute name, the object stored in the HttpSession can be obtained. Different from the above three methods, HttpSession is placed in the server's memory, so do not place overly large objects in it. Even if the current Servlet container can move the objects in the HttpSession to other storage devices when the memory is full, this will inevitably affect performance. The value added to HttpSession can be any Java object. This object should preferably implement the Serializable interface so that the Servlet container can serialize it into a file when necessary, otherwise an exception will occur during serialization.

## The difference between Cookie and Session

Cookies and Sessions are both session methods used to track the identity of browser users, but their application scenarios are different.

**Cookies are generally used to save user information** For example, ① We save the logged-in user information in Cookie, and the page can automatically fill in some basic information for you to log in the next time you visit the website; ② General websites will have a "keep logged in" function, which means that you do not need to log in again the next time you visit the website. This is because when the user logs in, we can store a Token in the Cookie. The next time you log in, you only need to find the user based on the Token value (for security reasons, logging in again generally requires Token rewriting); ③ After logging into the website once, you do not need to log in again to access other pages of the website. **The main function of Session is to record the user's status through the server. ** A typical scenario is a shopping cart. When you add items to the shopping cart, the system does not know which user operates it because the HTTP protocol is stateless. After the server creates a specific Session for a specific user, it can identify the user and track the user.

Cookie data is stored on the client side (browser side), and Session data is stored on the server side.

Cookies are stored on the client, while Sessions are stored on the server. Relatively speaking, Sessions are more secure. If you use cookies and do not write some sensitive information into cookies, it is best to encrypt the cookie information and then decrypt it on the server side when it is used.

<!-- @include: @article-footer.snippet.md -->