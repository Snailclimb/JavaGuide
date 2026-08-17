---
title: JWT 是什么？JWT 结构、解析与登录鉴权详解
description: JWT（JSON Web Token）是什么？本文通过示例讲解 Header、Payload、Signature 三段结构、Base64Url 解析、签名验证、过期时间及登录鉴权流程，并说明常见安全风险。
category: 系统设计
tag:
  - 安全
head:
  - - meta
    - name: keywords
      content: JWT是什么,JWT解析,JWT Token,JWT鉴权,JSON Web Token,Token认证,无状态,Header Payload Signature,签名算法,登录鉴权,CSRF
---

<!-- @include: @article-header.snippet.md -->

## JWT 是什么？

JWT（JSON Web Token）是 [RFC 7519](https://datatracker.ietf.org/doc/html/rfc7519) 定义的一种紧凑、URL 安全的声明表示格式。登录成功后，服务端可以把用户标识、权限范围和过期时间等声明写入 JWT；客户端在后续请求中携带它，服务端验证签名和相关声明后再决定是否放行。

JWT 可以承载鉴权所需的声明，因此服务端不一定要像传统 Session 方案那样保存会话状态。不过，撤销令牌、权限变更和主动下线等需求仍可能需要服务端状态，不能仅凭“使用 JWT”就认定系统完全无状态。

JWT 的 Header 和 Payload 只是经过 Base64Url 编码，拿到令牌的人都可以解码，不能把密码、身份证号等敏感信息写入 Payload。签名用于校验内容是否被篡改，并不负责加密内容。

如果客户端把 JWT 作为 Bearer Token 显式放入 `Authorization` Header，浏览器不会像 Cookie 那样自动附带它，因此可以降低传统 CSRF 风险。不过，这取决于凭据的传输和存储方式，而不是 JWT 格式本身；如果把 JWT 放在 Cookie 中，仍然需要 CSRF 防护。

[JWT 优缺点分析](./advantages-and-disadvantages-of-jwt.md)详细介绍了使用 JWT 做身份认证的优势和限制。

下面是 [RFC 7519](https://datatracker.ietf.org/doc/html/rfc7519) 对 JWT 的定义。

> JSON Web Token (JWT) is a compact, URL-safe means of representing claims to be transferred between two parties. The claims in a JWT are encoded as a JSON object that is used as the payload of a JSON Web Signature (JWS) structure or as the plaintext of a JSON Web Encryption (JWE) structure, enabling the claims to be digitally signed or integrity protected with a Message Authentication Code (MAC) and/or encrypted. ——[JSON Web Token (JWT)](https://datatracker.ietf.org/doc/html/rfc7519)

## JWT 由哪些部分组成？

![JWT 组成](https://oss.javaguide.cn/javaguide/system-design/jwt/jwt-composition.png)

JWT 通常由三个使用 `.` 分隔的 Base64Url 编码部分组成：

- **Header（头部）**：描述 JWT 的元数据，包含令牌类型和签名算法。Header 被 Base64Url 编码后成为 JWT 的第一部分。
- **Payload（载荷）**：存放需要传递的声明（Claims），如 `sub`（subject，主题）、`jti`（JWT ID）。Payload 被 Base64Url 编码后成为 JWT 的第二部分。
- **Signature（签名）**：根据编码后的 Header、Payload、签名算法和签名密钥计算。HS256 使用共享密钥，RS256、ES256 等非对称算法使用私钥签名、公钥验证。

JWT 通常是这样的：`xxxxx.yyyyy.zzzzz`。

示例：

```plain
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.
eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.
SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
```

你可以在 [jwt.io](https://jwt.io/) 对示例 JWT 进行解码，解码后可以看到 Header、Payload、Signature 这三部分。生产环境中的真实令牌可能包含用户标识和权限信息，不要复制到第三方在线工具中。

Header 和 Payload 都是 JSON 数据，Signature 则由编码后的 Header、Payload 和签名密钥计算得到。

![](https://oss.javaguide.cn/javaguide/system-design/jwt/jwt.io.png)

### JWT 解析和 JWT 验证有什么区别？

JWT 解析只会对 Header 和 Payload 做 Base64Url 解码，不需要密钥。任何拿到令牌的人都能完成解析，因此解析结果不能证明令牌可信。

JWT 验证会使用指定算法和密钥校验 Signature，还应检查 `exp`、`nbf`、`iss`、`aud` 等声明。只有签名和业务要求的声明全部通过校验，服务端才能信任令牌中的身份与权限信息。

### Header

Header 通常由两部分组成：

- `typ`（Type）：令牌类型，也就是 JWT。
- `alg`（Algorithm）：签名算法，比如 HS256。

示例：

```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

JSON 形式的 Header 经 Base64Url 编码后成为 JWT 的第一部分。

### Payload

Payload 也是 JSON 数据，其中包含 Claims（声明）。

Claims 分为三种类型：

- **Registered Claims（注册声明）**：预定义的一些声明，建议使用，但不是强制性的。
- **Public Claims（公有声明）**：JWT 签发方可以自定义的声明，但是为了避免冲突，应该在 [IANA JSON Web Token Registry](https://www.iana.org/assignments/jwt/jwt.xhtml) 中定义它们。
- **Private Claims（私有声明）**：JWT 签发方因为项目需要而自定义的声明，更符合实际项目场景使用。

下面是一些常见的注册声明：

- `iss`（issuer）：JWT 签发方。
- `iat`（issued at time）：JWT 签发时间。
- `sub`（subject）：JWT 主题。
- `aud`（audience）：JWT 接收方。
- `exp`（expiration time）：JWT 的过期时间。
- `nbf`（not before time）：JWT 生效时间，早于该定义的时间的 JWT 不能被接受处理。
- `jti`（JWT ID）：JWT 唯一标识。

示例：

```json
{
  "uid": "ff1212f5-d8d1-4496-bf41-d2dda73de19a",
  "sub": "1234567890",
  "name": "John Doe",
  "exp": 15323232,
  "iat": 1516239022,
  "scope": ["admin", "user"]
}
```

Payload 部分默认是不加密的，**一定不要将隐私信息存放在 Payload 当中！！！**

JSON 形式的 Payload 经 Base64Url 编码后成为 JWT 的第二部分。

### Signature

Signature 部分是对前两部分的签名，作用是防止 JWT（主要是 payload） 被篡改。

这个签名的生成需要用到：

- Header + Payload。
- 存放在服务端的签名密钥。使用非对称算法时，签名私钥不能泄露。
- 签名算法。

签名的计算公式如下：

```plain
HMACSHA256(
  base64UrlEncode(header) + "." +
  base64UrlEncode(payload),
  secret)
```

算出签名以后，把 Header、Payload、Signature 三个部分拼成一个字符串，每个部分之间用“点”（`.`）分隔，这个字符串就是 JWT。

## 如何基于 JWT 进行身份验证？

在基于 JWT 进行身份验证的应用程序中，服务器通过 Payload、Header 和密钥创建 JWT 并将 JWT 发送给客户端。客户端需要根据应用形态和威胁模型安全地保存令牌，以后发出的请求会携带这个令牌。

![JWT 身份验证示意图](https://oss.javaguide.cn/github/javaguide/system-design/jwt/jwt-authentication%20process.png)

简化后的步骤如下：

1. 用户向服务器发送用户名、密码以及验证码用于登陆系统；
2. 如果用户用户名、密码以及验证码校验正确的话，服务端会返回已经签名的 Token，也就是 JWT；
3. 客户端收到 Token 后安全保存；浏览器应用可以使用 BFF 把令牌保留在服务端，或者根据场景使用受保护的 Cookie；
4. 用户以后每次向后端发请求都在 Header 中带上这个 JWT ；
5. 服务端检查 JWT 并从中获取用户相关信息。

两点建议：

1. 不要默认把 JWT 存放在 `localStorage` 或 `sessionStorage` 中。同源页面中的任意恶意脚本都能读取 Web Storage，一处 XSS 漏洞就可能泄露令牌。使用 Cookie 时，应设置 `HttpOnly`、`Secure` 和合适的 `SameSite` 属性，并同时做好 CSRF 防护。
2. 非 Cookie 方案携带 JWT 的常见做法是将其放在 HTTP Header 的 `Authorization` 字段中（`Authorization: Bearer Token`）。

**[spring-security-jwt-guide](https://github.com/Snailclimb/spring-security-jwt-guide)** 就是一个基于 JWT 来做身份认证的简单案例，感兴趣的可以看看。

## 如何防止 JWT 被篡改？

有了正确校验的签名之后，即使 JWT 被泄露或者截获，攻击者也无法在不知道签名密钥的情况下修改 Header 或 Payload 并生成有效签名。但签名不提供保密性，也不能阻止攻击者直接重放被盗的有效 JWT。

这是为什么呢？因为服务端拿到 JWT 之后，会解析出其中包含的 Header、Payload 以及 Signature 。服务端会根据 Header、Payload、密钥再次生成一个 Signature。拿新生成的 Signature 和 JWT 中的 Signature 作对比，如果一样就说明 Header 和 Payload 没有被修改。

不过，如果服务端的密钥也被泄露，攻击者就可以修改 Header 和 Payload，再重新生成一个有效的 Signature。

签名密钥必须妥善保管，并建立轮换和吊销机制。

## 如何加强 JWT 的安全性？

1. 使用成熟的开源库，不要自己实现 JWT 加解密和校验逻辑。
2. 服务端固定允许的算法集合，不能直接信任 JWT Header 中的 `alg` 选择验证算法；HMAC 密钥要有足够的随机性和长度。
3. 验证所有与当前应用有关的声明，包括 `iss`、`aud`、`exp` 和 `nbf`，并为允许的时钟偏差设置明确上限。
4. 对 ID Token、Access Token 等不同用途的 JWT 使用显式 `typ` 和互斥的校验规则，防止一种令牌被替换到另一种场景。
5. 一定不要将隐私信息存放在未加密的 Payload 当中，也不能把收到但尚未验证的 Claim 当作可信输入。
6. 根据客户端类型选择安全的令牌存储方式，限制令牌有效期、权限范围和接收方；高风险场景还要考虑撤销、重放检测或发送者约束。
7. 密钥必须妥善保管并支持轮换。更完整的安全要求可以参考 [RFC 8725：JSON Web Token Best Current Practices](https://www.rfc-editor.org/rfc/rfc8725.html)。

<!-- @include: @article-footer.snippet.md -->
