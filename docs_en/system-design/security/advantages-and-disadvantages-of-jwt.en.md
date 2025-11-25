---
title: JWT 身份认证优缺点分析
category: 系统设计
tag:
  - 安全
---

校招面试中，遇到大部分的候选者认证登录这块用的都是 JWT。提问 JWT 的概念性问题以及使用 JWT 的原因，基本都能回答一些，但当问到 JWT 存在的一些问题和解决方案时，只有一小部分候选者回答的还可以。

JWT 不是银弹，也有很多缺陷，很多时候并不是最优的选择。这篇文章，我们一起探讨一下 JWT 身份认证的优缺点以及常见问题的解决办法，来看看为什么很多人不再推荐使用 JWT 了。

关于 JWT 的基本概念介绍请看我写的这篇文章： [JWT 基本概念详解](https://javaguide.cn/system-design/security/jwt-intro.html)。

## JWT 的优势

相比于 Session 认证的方式来说，使用 JWT 进行身份认证主要有下面 4 个优势。

### 无状态

JWT 自身包含了身份验证所需要的所有信息，因此，我们的服务器不需要存储 JWT 信息。这显然增加了系统的可用性和伸缩性，大大减轻了服务端的压力。

不过，也正是由于 JWT 的无状态，也导致了它最大的缺点：**不可控！**

就比如说，我们想要在 JWT 有效期内废弃一个 JWT 或者更改它的权限的话，并不会立即生效，通常需要等到有效期过后才可以。再比如说，当用户 Logout 的话，JWT 也还有效。除非，我们在后端增加额外的处理逻辑比如将失效的 JWT 存储起来，后端先验证 JWT 是否有效再进行处理。具体的解决办法，我们会在后面的内容中详细介绍到，这里只是简单提一下。

### 有效避免了 CSRF 攻击

**CSRF（Cross Site Request Forgery）** 一般被翻译为 **跨站请求伪造**，属于网络攻击领域范围。相比于 SQL 脚本注入、XSS 等安全攻击方式，CSRF 的知名度并没有它们高。但是，它的确是我们开发系统时必须要考虑的安全隐患。就连业内技术标杆 Google 的产品 Gmail 也曾在 2007 年的时候爆出过 CSRF 漏洞，这给 Gmail 的用户造成了很大的损失。

**那么究竟什么是跨站请求伪造呢？** 简单来说就是用你的身份去做一些不好的事情（发送一些对你不友好的请求比如恶意转账）。

举个简单的例子：小壮登录了某网上银行，他来到了网上银行的帖子区，看到一个帖子下面有一个链接写着“科学理财，年盈利率过万”，小壮好奇的点开了这个链接，结果发现自己的账户少了 10000 元。这是这么回事呢？原来黑客在链接中藏了一个请求，这个请求直接利用小壮的身份给银行发送了一个转账请求，也就是通过你的 Cookie 向银行发出请求。

```html
<a src="http://www.mybank.com/Transfer?bankId=11&money=10000"
  >科学理财，年盈利率过万</a
>
```

CSRF 攻击需要依赖 Cookie ，Session 认证中 Cookie 中的 `SessionID` 是由浏览器发送到服务端的，只要发出请求，Cookie 就会被携带。借助这个特性，即使黑客无法获取你的 `SessionID`，只要让你误点攻击链接，就可以达到攻击效果。

另外，并不是必须点击链接才可以达到攻击效果，很多时候，只要你打开了某个页面，CSRF 攻击就会发生。

```html
<img src="http://www.mybank.com/Transfer?bankId=11&money=10000" />
```

**那为什么 JWT 不会存在这种问题呢？**

一般情况下我们使用 JWT 的话，在我们登录成功获得 JWT 之后，一般会选择存放在 localStorage 中。前端的每一个请求后续都会附带上这个 JWT，整个过程压根不会涉及到 Cookie。因此，即使你点击了非法链接发送了请求到服务端，这个非法请求也是不会携带 JWT 的，所以这个请求将是非法的。

总结来说就一句话：**使用 JWT 进行身份验证不需要依赖 Cookie ，因此可以避免 CSRF 攻击。**

不过，这样也会存在 XSS 攻击的风险。为了避免 XSS 攻击，你可以选择将 JWT 存储在标记为`httpOnly` 的 Cookie 中。但是，这样又导致了你必须自己提供 CSRF 保护，因此，实际项目中我们通常也不会这么做。

常见的避免 XSS 攻击的方式是过滤掉请求中存在 XSS 攻击风险的可疑字符串。

在 Spring 项目中，我们一般是通过创建 XSS 过滤器来实现的。

```java
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class XSSFilter implements Filter {

    @Override
    public void doFilter(ServletRequest request, ServletResponse response,
      FilterChain chain) throws IOException, ServletException {
        XSSRequestWrapper wrappedRequest =
          new XSSRequestWrapper((HttpServletRequest) request);
        chain.doFilter(wrappedRequest, response);
    }

    // other methods
}
```

### 适合移动端应用

使用 Session 进行身份认证的话，需要保存一份信息在服务器端，而且这种方式会依赖到 Cookie（需要 Cookie 保存 `SessionId`），所以不适合移动端。

但是，使用 JWT 进行身份认证就不会存在这种问题，因为只要 JWT 可以被客户端存储就能够使用，而且 JWT 还可以跨语言使用。

> 为什么使用 Session 进行身份认证的话不适合移动端 ？
>
> 1. 状态管理: Session 基于服务器端的状态管理，而移动端应用通常是无状态的。移动设备的连接可能不稳定或中断，因此难以维护长期的会话状态。如果使用 Session 进行身份认证，移动应用需要频繁地与服务器进行会话维护，增加了网络开销和复杂性;
> 2. 兼容性: 移动端应用通常会面向多个平台，如 iOS、Android 和 Web。每个平台对于 Session 的管理和存储方式可能不同，可能导致跨平台兼容性的问题;
> 3. 安全性: 移动设备通常处于不受信任的网络环境，存在数据泄露和攻击的风险。将敏感的会话信息存储在移动设备上增加了被攻击的潜在风险。

### 单点登录友好

使用 Session 进行身份认证的话，实现单点登录，需要我们把用户的 Session 信息保存在一台电脑上，并且还会遇到常见的 Cookie 跨域的问题。但是，使用 JWT 进行认证的话， JWT 被保存在客户端，不会存在这些问题。

## JWT 身份认证常见问题及解决办法

### 注销登录等场景下 JWT 还有效

与之类似的具体相关场景有：

- 退出登录;
- 修改密码;
- 服务端修改了某个用户具有的权限或者角色；
- 用户的帐户被封禁/删除；
- 用户被服务端强制注销；
- 用户被踢下线；
- ……

这个问题不存在于 Session 认证方式中，因为在 Session 认证方式中，遇到这种情况的话服务端删除对应的 Session 记录即可。但是，使用 JWT 认证的方式就不好解决了。我们也说过了，JWT 一旦派发出去，如果后端不增加其他逻辑的话，它在失效之前都是有效的。

那我们如何解决这个问题呢？查阅了很多资料，我简单总结了下面 4 种方案：

**1、将 JWT 存入数据库**

将有效的 JWT 存入数据库中，更建议使用内存数据库比如 Redis。如果需要让某个 JWT 失效就直接从 Redis 中删除这个 JWT 即可。但是，这样会导致每次使用 JWT 都要先从 Redis 中查询 JWT 是否存在的步骤，而且违背了 JWT 的无状态原则。

**2、黑名单机制**

和上面的方式类似，使用内存数据库比如 Redis 维护一个黑名单，如果想让某个 JWT 失效的话就直接将这个 JWT 加入到 **黑名单** 即可。然后，每次使用 JWT 进行请求的话都会先判断这个 JWT 是否存在于黑名单中。

前两种方案的核心在于将有效的 JWT 存储起来或者将指定的 JWT 拉入黑名单。

虽然这两种方案都违背了 JWT 的无状态原则，但是一般实际项目中我们通常还是会使用这两种方案。

**3、修改密钥 (Secret)** :

我们为每个用户都创建一个专属密钥，如果我们想让某个 JWT 失效，我们直接修改对应用户的密钥即可。但是，这样相比于前两种引入内存数据库带来了危害更大：

- 如果服务是分布式的，则每次发出新的 JWT 时都必须在多台机器同步密钥。为此，你需要将密钥存储在数据库或其他外部服务中，这样和 Session 认证就没太大区别了。
- 如果用户同时在两个浏览器打开系统，或者在手机端也打开了系统，如果它从一个地方将账号退出，那么其他地方都要重新进行登录，这是不可取的。

**4. Keep token validity periods short and rotate them frequently**

A very simple way. However, the user's login status will not be recorded persistently, and the user will be required to log in frequently.

In addition, it is relatively easy to solve the problem that JWT is still valid after changing the password. Let me talk about a way that I think is better: ** Use the hash value of the user's password to sign the JWT. Therefore, if the password is changed, any previous tokens will automatically become unverifiable. **

### JWT renewal issue

It is generally recommended that the JWT validity period be set not too long, so how to authenticate the JWT after it expires, and how to dynamically refresh the JWT to avoid the need for users to log in again?

Let's first take a look at the general approach in Session authentication: **If the Session is valid for 30 minutes, and if the user accesses within 30 minutes, the Session validity period will be extended by 30 minutes. **

For JWT authentication, how should we solve the renewal problem? After consulting a lot of information, I briefly summarized the following 4 options:

**1. Similar to the approach in Session authentication (not recommended)**

This solution is suitable for most scenarios. Assume that the validity period of the JWT given by the server is set to 30 minutes. Every time the server performs verification, if it finds that the validity period of the JWT is about to expire, the server will regenerate the JWT to the client. The client checks the old and new JWT for each request, and if they are inconsistent, updates the local JWT. The problem with this approach is that the JWT will only be updated when the request is about to expire, which is not very friendly to the client.

**2. Return a new JWT for each request (not recommended)**

The idea of this solution is very simple, but the overhead will be relatively large, especially when the server needs to store and maintain JWT.

**3. The JWT validity period is set to midnight (not recommended)**

This solution is a compromise solution that ensures that most users can log in normally during the day and is suitable for systems that do not have high security requirements.

**4. User login returns two JWT (recommended)**

The first one is accessJWT, and its expiration time is the expiration time of JWT itself, such as half an hour. The other one is refreshJWT, whose expiration time is longer, such as 1 day. refreshJWT is only used to obtain accessJWT and is not easily leaked.

After the client logs in, accessJWT and refreshJWT are saved locally, and accessJWT is passed to the server for each visit. The server verifies the validity of accessJWT. If it expires, it passes refreshJWT to the server. If valid, the server generates a new accessJWT to the client. Otherwise, the client can log in again.

The disadvantages of this solution are:

- Requires client cooperation;
- When the user logs out, it is necessary to ensure that both JWTs are invalid at the same time;
- During the process of re-requesting to obtain JWT, there may be a situation where the JWT is temporarily unavailable (you can set a timer on the client, and when the accessJWT is about to expire, use refreshJWT to obtain a new accessJWT in advance);
- There is a security issue. As long as you get the unexpired refreshJWT, you can always get the accessJWT. However, since refreshJWT is only used to obtain accessJWT, it is not easily leaked.

### JWT is too large

The JWT structure is complex (Header, Payload and Signature), contains more additional information, and requires Base64Url encoding, which makes the JWT larger in size and increases network transmission overhead.

JWT composition:

![JWT composition](https://oss.javaguide.cn/javaguide/system-design/jwt/jwt-composition.png)

JWT example:

```plain
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.
eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.
SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
```

Solution:

- Minimize the information in the JWT Payload and keep only the necessary user and permission information.
- Compress the JWT using a compression algorithm such as GZIP to reduce the size before transmitting it.
- In some cases, using traditional Tokens may be more appropriate. A traditional Token is usually just a unique identifier, and the corresponding information (such as user ID, Token expiration time, permission information) is stored on the server, usually saved through Redis.

## Summary

One of the important advantages of JWT is that it is stateless, but in fact, if we want to use JWT reasonably for authentication and login in actual projects, we still need to save JWT information.

JWT is not a silver bullet and has many flaws. Whether to choose the JWT or Session solution depends on the specific needs of the project. Never brag about JWT and look down on other identity authentication solutions.

In addition, it is also possible to directly use ordinary Token (randomly generated ID, which does not contain specific information) without JWT and combine it with Redis for identity authentication.

## Reference

- JWT ultra-detailed analysis: <https://learnku.com/articles/17883>
- How to log out when using JWT: <https://medium.com/devgorilla/how-to-log-out-when-using-jwt-a8c7823e8a6>
- CSRF protection with JSON Web JWTs: <https://medium.com/@agungsantoso/csrf-protection-with-json-web-JWTs-83e0f2fcbcc>
- Invalidating JSON Web JWTs: <https://stackoverflow.com/questions/21978658/invalidating-json-web-JWTs>

<!-- @include: @article-footer.snippet.md -->