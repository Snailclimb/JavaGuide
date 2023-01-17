---
title:  HTTP 常见状态码总结（应用层）
category: 计算机基础
tag:
  - 计算机网络
---

HTTP 状态码用于描述 HTTP 请求的结果，比如2xx 就代表请求被成功处理。

![状态码](https://my-blog-to-use.oss-cn-beijing.aliyuncs.com/2019/7/%E7%8A%B6%E6%80%81%E7%A0%81.png)

### 1xx Informational（信息性状态码）

相比于其他类别状态码来说，1xx 你平时你大概率不会碰到，所以这里直接跳过。

### 2xx Success（成功状态码）

- **200 OK** ：请求被成功处理。比如我们发送一个查询用户数据的HTTP 请求到服务端，服务端正确返回了用户数据。这个是我们平时最常见的一个 HTTP 状态码。
- **201 Created** ：请求被成功处理并且在服务端创建了一个新的资源。比如我们通过 POST 请求创建一个新的用户。
- **202 Accepted** ：服务端已经接收到了请求，但是还未处理。
-  **204 No Content** ： 服务端已经成功处理了请求，但是没有返回任何内容。

这里格外提一下 204 状态码，平时学习/工作中见到的次数并不多。

[HTTP RFC 2616对204状态码的描述](https://tools.ietf.org/html/rfc2616#section-10.2.5)如下：

>    The server has fulfilled the request but does not need to return an
>    entity-body, and might want to return updated metainformation. The
>    response MAY include new or updated metainformation in the form of
>    entity-headers, which if present SHOULD be associated with the
>    requested variant.
>
>    If the client is a user agent, it SHOULD NOT change its document view
>    from that which caused the request to be sent. This response is
>    primarily intended to allow input for actions to take place without
>    causing a change to the user agent's active document view, although
>    any new or updated metainformation SHOULD be applied to the document
>    currently in the user agent's active view.
>
>    The 204 response MUST NOT include a message-body, and thus is always
>    terminated by the first empty line after the header fields.

简单来说，204状态码描述的是我们向服务端发送 HTTP 请求之后，只关注处理结果是否成功的场景。也就是说我们需要的就是一个结果：true/false。

举个例子：你要追一个女孩子，你问女孩子：“我能追你吗？”，女孩子回答：“好！”。我们把这个女孩子当做是服务端就很好理解 204 状态码了。

### 3xx Redirection（重定向状态码）

- **301 Moved Permanently** ： 资源被永久重定向了。比如你的网站的网址更换了。
- **302 Found** ：资源被临时重定向了。比如你的网站的某些资源被暂时转移到另外一个网址。

### 4xx Client Error（客户端错误状态码）

- **400 Bad Request** ： 发送的HTTP请求存在问题。比如请求参数不合法、请求方法错误。
- **401 Unauthorized** ： 未认证却请求需要认证之后才能访问的资源。
-  **403 Forbidden** ：直接拒绝HTTP请求，不处理。一般用来针对非法请求。
- **404 Not Found** ： 你请求的资源未在服务端找到。比如你请求某个用户的信息，服务端并没有找到指定的用户。
- **409 Conflict** ： 表示请求的资源与服务端当前的状态存在冲突，请求无法被处理。

### 5xx Server Error（服务端错误状态码）

- **500 Internal Server Error** ： 服务端出问题了（通常是服务端出Bug了）。比如你服务端处理请求的时候突然抛出异常，但是异常并未在服务端被正确处理。
- **502 Bad Gateway** ：我们的网关将请求转发到服务端，但是服务端返回的却是一个错误的响应。

### 参考

- https://www.restapitutorial.com/httpstatuscodes.html
- https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Status
- https://en.wikipedia.org/wiki/List_of_HTTP_status_codes
- https://segmentfault.com/a/1190000018264501

