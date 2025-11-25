---
title: Detailed explanation of JWT basic concepts
category: system design
tag:
  - safe
---

<!-- @include: @article-header.snippet.md -->

## What is JWT?

JWT (JSON Web Token) is currently the most popular cross-domain authentication solution and is a Token-based authentication and authorization mechanism. As can be seen from the full name of JWT, JWT itself is also a Token, a Token with a standardized JSON structure.

The JWT itself contains all the information required for authentication, so our server does not need to store Session information. This obviously increases the availability and scalability of the system and greatly reduces the pressure on the server.

It can be seen that **JWT is more in line with the "Stateless" principle** when designing RESTful APIs.

Moreover, using JWT authentication can effectively avoid CSRF attacks, because JWT generally exists in localStorage, and cookies are not involved in the process of using JWT for authentication.

I have introduced in detail the advantages and disadvantages of using JWT for identity authentication in this article [JWT Advantages and Disadvantages Analysis](./advantages-and-disadvantages-of-jwt.md).

The following is a more formal definition of JWT from [RFC 7519](https://tools.ietf.org/html/rfc7519).

> JSON Web Token (JWT) is a compact, URL-safe means of representing claims to be transferred between two parties. The claims in a JWT are encoded as a JSON object that is used as the payload of a JSON Web Signature (JWS) structure or as the plaintext of a JSON Web Encryption (JWE) structure, enabling the claims to be digitally signed or integrity protected with a Message Authentication Code (MAC) and/or encrypted. ——[JSON Web Token (JWT)](https://tools.ietf.org/html/rfc7519)

## What parts does a JWT consist of?

![JWT composition](https://oss.javaguide.cn/javaguide/system-design/jwt/jwt-composition.png)

A JWT is essentially a set of strings, split into three Base64-encoded parts by (`.`):

- **Header**: Describes the metadata of JWT, defines the algorithm for generating signatures and the type of `Token`. The Header is Base64Url encoded and becomes the first part of the JWT.
- **Payload**: Used to store the actual data that needs to be transferred, including claims (Claims), such as `sub` (subject, subject), `jti` (JWT ID). The payload is Base64Url encoded and becomes the second part of the JWT.
- **Signature**: The server generates it through Payload, Header and a secret using the signature algorithm specified in the Header (the default is HMAC SHA256). The generated signature becomes the third part of the JWT.

A JWT usually looks like this: `xxxxx.yyyyy.zzzzz`.

Example:

```plain
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.
eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.
SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
```

You can decode its JWT on the [jwt.io](https://jwt.io/) website. After decoding, you will get the three parts: Header, Payload, and Signature.

Header and Payload are both data in JSON format. Signature is obtained from Payload, Header and Secret (key) through specific calculation formulas and encryption algorithms.

![](https://oss.javaguide.cn/javaguide/system-design/jwt/jwt.io.png)

### Header

Header usually consists of two parts:

- `typ` (Type): Token type, that is, JWT.
- `alg` (Algorithm): Signature algorithm, such as HS256.

Example:

```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

The header in JSON form is converted to Base64 encoding and becomes the first part of the JWT.

### Payload

Payload is also JSON format data, which contains Claims (statements, including JWT related information).

Claims are divided into three types:

- **Registered Claims**: Some predefined claims, recommended but not mandatory.
- **Public Claims**: Claims that can be customized by the JWT issuer, but to avoid conflicts they should be defined in the [IANA JSON Web Token Registry](https://www.iana.org/assignments/jwt/jwt.xhtml).
- **Private Claims**: Claims customized by the JWT issuer due to project needs, which are more in line with actual project scenarios.

The following are some common registration statements:

- `iss` (issuer): JWT issuer.
- `iat` (issued at time): JWT issuance time.
- `sub` (subject): JWT subject.
- `aud` (audience): JWT receiver.
- `exp` (expiration time): The expiration time of JWT.
- `nbf` (not before time): JWT effective time, JWT earlier than the defined time cannot be accepted for processing.
- `jti` (JWT ID): JWT unique identifier.

Example:

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

The Payload part is not encrypted by default. **Be sure not to store private information in the Payload! ! ! **

The payload in the form of JSON is converted into Base64 encoding and becomes the second part of the JWT.

### Signature

The Signature part is a signature of the first two parts, which is used to prevent JWT (mainly payload) from being tampered with.

The generation of this signature requires the use of:

- Header + Payload.
- The key stored on the server (be sure not to leak it).
- Signature algorithm.

The signature calculation formula is as follows:

```plain
HMACSHA256(
  base64UrlEncode(header) + "." +
  base64UrlEncode(payload),
  secret)
```

After calculating the signature, combine the three parts of Header, Payload, and Signature into a string, and separate each part with a "dot" (`.`). This string is JWT.

## How to authenticate based on JWT?

In an application based on JWT authentication, the server creates a JWT with Payload, Header, and Secret (key) and sends the JWT to the client. After the client receives the JWT, it will save it in Cookie or localStorage, and all future requests sent by the client will carry this token.

![JWT authentication diagram](https://oss.javaguide.cn/github/javaguide/system-design/jwt/jwt-authentication%20process.png)

The simplified steps are as follows:

1. The user sends the user name, password and verification code to the server to log in to the system;
2. If the user name, password and verification code are verified correctly, the server will return the signed Token, which is JWT;
3. After receiving the Token, the client saves it (such as the browser's `localStorage`);
4. Every time the user makes a request to the backend in the future, he will bring this JWT in the header;
5. The server checks the JWT and obtains user-related information.

Two suggestions:

1. It is recommended to store JWT in localStorage. Putting it in Cookie will cause CSRF risk.2. A common way to request the server and carry JWT is to put it in the `Authorization` field of the HTTP Header (`Authorization: Bearer Token`).

**[spring-security-jwt-guide](https://github.com/Snailclimb/spring-security-jwt-guide)** is a simple case of identity authentication based on JWT. If you are interested, you can take a look.

## How to prevent JWT from being tampered with?

With the signature, even if the JWT is leaked or intercepted, hackers cannot tamper with the Signature, Header, and Payload at the same time.

Why is this? Because after the server gets the JWT, it will parse out the Header, Payload and Signature contained in it. The server will generate a Signature again based on the Header, Payload, and key. Compare the newly generated Signature with the Signature in the JWT. If they are the same, it means that the Header and Payload have not been modified.

However, if the server's secret key is also leaked, hackers can tamper with the Signature, Header, and Payload at the same time. After hackers directly modify the Header and Payload, they can then regenerate a Signature.

**The key must be kept well and must not be leaked. The core of JWT security lies in the signature, and the core of signature security lies in the key. **

## How to strengthen the security of JWT?

1. Use an encryption algorithm with high security factor.
2. Use mature open source libraries, there is no need to reinvent the wheel.
3. JWT is stored in localStorage instead of Cookie to avoid CSRF risks.
4. Be sure not to store private information in the Payload.
5. The key must be kept well and must not be leaked. The core of JWT security lies in the signature, and the core of signature security lies in the key.
6. Payload needs to add `exp` (expiration time of JWT). A permanently valid JWT is unreasonable. Moreover, the expiration time of JWT should not be too long.
7.…

<!-- @include: @article-footer.snippet.md -->