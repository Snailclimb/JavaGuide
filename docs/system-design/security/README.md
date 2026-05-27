---
title: 认证授权与数据安全专题：JWT、SSO、权限系统、加密、脱敏与数据校验
description: 认证授权与数据安全面试学习路线，涵盖 Session、Token、OAuth2、JWT、SSO、RBAC、加密算法、数据脱敏、数据校验和密码安全。
category: 系统设计
tag:
  - 认证授权
  - 数据安全
  - 后端面试
sitemap:
  changefreq: weekly
  priority: 0.9
head:
  - - meta
    - name: keywords
      content: 认证授权,Authentication,Authorization,Session,Token,OAuth2,JWT,SSO,RBAC,权限系统,加密算法,敏感词过滤,数据脱敏,数据校验,密码安全,后端面试
---

认证授权与数据安全专题关注后端系统里非常基础、但出错成本很高的一条链路：用户如何登录、身份如何传递、权限如何判断、敏感数据如何保护、输入数据如何校验。

安全不是某一个框架或某一个注解能兜住的事情。它需要从认证、授权、传输、存储、展示、输入校验和审计等多个环节一起设计。

## 适合谁看

- 正在学习登录鉴权、权限系统和数据安全的后端开发者。
- 准备认证授权、JWT、SSO、RBAC、数据脱敏相关面试题的同学。
- 项目中需要设计后台权限、用户体系、敏感数据展示或数据校验方案的工程师。
- 已经用过 Spring Security、Sa-Token、Shiro 等框架，但想补齐底层概念的读者。

## 学习重点

- 认证解决“你是谁”，授权解决“你能做什么”，两者不能混为一谈。
- Session、Token、JWT、OAuth2、SSO 适合的场景不同，不能只用“无状态”判断优劣。
- JWT 的优势和问题都很明显，重点在失效控制、续期、泄露风险和服务端治理。
- 权限系统通常要从用户、角色、权限、资源、组织、数据范围等维度建模。
- 数据安全既包括加密存储，也包括脱敏展示、输入校验、敏感词过滤和密码安全。
- 安全方案必须考虑落地成本、用户体验、可审计性和事故处置能力。

## 建议阅读顺序

1. [认证授权基础概念详解](./basis-of-authority-certification.md)：先区分认证、授权、Session、Token、OAuth2 等概念。
2. [JWT 基础概念详解](./jwt-intro.md) 和 [JWT 身份认证优缺点分析](./advantages-and-disadvantages-of-jwt.md)：理解 JWT 的工作方式、优势和局限。
3. [SSO 单点登录详解](./sso-intro.md)：理解统一认证中心、跨系统登录和登录态同步。
4. [权限系统设计详解](./design-of-authority-system.md)：把认证授权落到 RBAC 权限系统设计。
5. [常见加密算法总结](./encryption-algorithms.md)、[数据脱敏方案总结](./data-desensitization.md)、[为什么前后端都要做数据校验？](./data-validation.md)：补齐数据安全基础。
6. 再根据业务场景阅读 [敏感词过滤方案总结](./sentive-words-filter.md) 和 [为什么忘记密码时只能重置，不能告诉你原密码？](./why-password-reset-instead-of-retrieval.md)。

## 核心文章

### 认证授权

- [认证授权基础概念详解](./basis-of-authority-certification.md)：讲解 Authentication、Authorization、Session、Token、OAuth2 等核心知识。
- [JWT 基础概念详解](./jwt-intro.md)：讲解 JSON Web Token 的组成结构、签名算法、工作原理及登录鉴权应用。
- [JWT 身份认证优缺点分析](./advantages-and-disadvantages-of-jwt.md)：分析 JWT 无法主动失效、Token 续期等问题及解决方案。
- [SSO 单点登录详解](./sso-intro.md)：讲解统一认证中心、CAS 协议、跨域登录实现及登录态同步机制。
- [权限系统设计详解](./design-of-authority-system.md)：基于 RBAC 讲解权限系统建模、访问控制和后台管理设计。

### 数据安全

- [常见加密算法总结](./encryption-algorithms.md)：梳理 AES、RSA、MD5、SHA 等算法的原理与应用场景。
- [敏感词过滤方案总结](./sentive-words-filter.md)：从暴力匹配到 Trie 树、AC 自动机，讲解敏感词过滤算法演进和工程实践。
- [数据脱敏方案总结](./data-desensitization.md)：讲解手机号、身份证、银行卡等敏感数据脱敏规则和实现方法。
- [为什么前后端都要做数据校验？](./data-validation.md)：解释参数校验、权限校验的重要性，以及如何防止绕过前端校验。
- [为什么忘记密码时只能重置，不能告诉你原密码？](./why-password-reset-instead-of-retrieval.md)：解释密码哈希、加盐、Bcrypt 和密码传输安全。

## 高频问题

- 认证和授权有什么区别？
- Session 和 Token 有什么区别？
- JWT 由哪几部分组成？签名解决了什么问题？
- JWT 为什么无法天然主动失效？有哪些解决方案？
- OAuth2 和 JWT 是什么关系？
- SSO 单点登录的核心流程是什么？
- RBAC 权限模型如何设计？用户、角色、权限、资源之间是什么关系？
- 对称加密、非对称加密和哈希算法分别适合什么场景？
- 为什么密码不能明文存储？为什么忘记密码只能重置？
- 数据脱敏应该在存储层、服务层还是展示层做？
- 为什么后端必须做数据校验？
- 敏感词过滤有哪些常见实现方案？

## 相关专题

- [系统设计知识体系](../)
- [系统设计基础专题](../basis/)
- [Spring & Spring Boot 专题](../framework/spring/)
- [高可用系统知识体系](../../high-availability/)
- [计算机网络安全](../../cs-basics/network/network-attack-means.md)

<!-- @include: @article-footer.snippet.md -->
