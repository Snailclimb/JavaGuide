---
title: Detailed explanation of SSO single sign-on
category: system design
tag:
  - safe
---

> This article is reproduced with permission from: <https://ken.io/note/sso-design-implement> Author: ken.io

## Introduction to SSO

### What is SSO?

The full English name of SSO is Single Sign On. SSO is in multiple application systems. Users only need to log in once to access all mutually trusted application systems.

For example, after you log in to the NetEase account center (<https://reg.163.com/>) and then visit the following sites, you will be logged in.

- NetEase Live [https://v.163.com](https://v.163.com/)
- NetEase Blog [https://blog.163.com](https://blog.163.com/)
- NetEase Huatian [https://love.163.com](https://love.163.com/)
- NetEase Kaola [https://www.kaola.com](https://www.kaola.com/)
- NetEase Lofter [http://www.lofter.com](http://www.lofter.com/)

### What are the benefits of SSO?

1. **User Perspective**: Users can log in once and use it multiple times without having to record multiple sets of user names and passwords, which saves worry.
2. **System administrator’s perspective**: The administrator only needs to maintain a unified account center, which is convenient.
3. **New system development perspective:** When developing a new system, you only need to directly connect to the unified account center, which simplifies the development process and saves time.

## SSO design and implementation

This article is also mainly to discuss how to design & implement an SSO system

The following are the core functions that need to be implemented:

- Single sign-on
- Single sign-out
- Support cross-domain single sign-on
- Support cross-domain single sign-out

### Core applications and dependencies

![Single sign-on (SSO) design](https://oss.javaguide.cn/github/javaguide/system-design/security/sso/sso-system.png-kblb.png)

| application/module/object | description |
| ------------------ | ---------------------------------- |
| Front-end site | Site that requires login |
| SSO Site-Login | Page that provides login |
| SSO site-logout | Provides a logout entrance |
| SSO Service-Login | Provide login service |
| SSO Service-Login Status | Provides login status verification/login information query services |
| SSO service-logout | Provides user logout and login services |
| Database | Stores user account information |
| Cache | Stores user login information, usually using Redis |

### Storage and verification of user login status

Common web frameworks' implementation of Session generates a SessionId and stores it in the browser Cookie. Then the Session content is stored in the server-side memory. This [ken.io](https://ken.io/) was also mentioned in the previous [Session Working Principle](https://ken.io/note/session-principle-skill). The whole thing also draws on this idea.

After the user successfully logs in, the AuthToken is generated and handed over to the client for storage. If it is a browser, it is stored in a cookie. If it is a mobile app, it is saved in the local cache of the app. This article mainly discusses SSO based on Web sites.

When the user browses a page that requires login, the client submits the AuthToken to the SSO service to verify the login status/obtain the user login information.

For the storage of login information, it is recommended to use Redis and use a Redis cluster to store login information, which can ensure high availability and linear expansion. At the same time, the SSO service can also meet load balancing/scalability requirements.

| Object | Description |
| --------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| AuthToken | Just use UUID/GUID directly. If there is a need to verify the legitimacy of AuthToken, you can encrypt and generate the UserName + timestamp, and then decrypt it on the server side to verify the legitimacy |
| Login information | Usually UserId, UserName is cached |

### User login/login verification

**Login sequence diagram**

![SSO system design-login sequence diagram](https://oss.javaguide.cn/github/javaguide/system-design/security/sso/sso-login-sequence.png-kbrb.png)

As shown above, after the user logs in, the AuthToken is saved in the cookie. domain=test.com
The browser will set the domain to .test.com,

In this way, accessing all \*.test.com web sites will carry the AuthToken to the server.
Then use the SSO service to complete the verification of the user status/obtain the user login information.

**Login information acquisition/login status verification**

![SSO system design-login information acquisition/login status verification](https://oss.javaguide.cn/github/javaguide/system-design/security/sso/sso-logincheck-sequence.png-kbrb.png)

### User logout

What the user has to do when logging out is simple:

1. Clear the login status in the cache (Redis) on the server side
2. The client clears the stored AuthToken

**Logout timing diagram**

![SSO system design-user logout](https://oss.javaguide.cn/github/javaguide/system-design/security/sso/sso-logout-sequence.png-kbrb.png)

### Cross-domain login and logout

As mentioned earlier, the core idea is that the client stores AuthToken, and the server stores login information through Redis. Because the client stores the AuthToken in Cookie. Therefore, the problem to be solved in cross-domain is how to solve the cross-domain reading and writing problem of Cookie.

The core idea to solve cross-domain issues is:

- After the login is completed, the AuthToken is passed to the site outside the main domain name through a callback, and the site saves the AuthToken in the cookie under the current domain.
- After the logout is completed, call the logout page of the non-primary domain name site through a callback to complete the operation of setting the expiration of the AuthToken in the cookie.

**Cross-domain login (main domain name already logged in)**

![SSO system design-cross-domain login (the main domain name has been logged in)](https://oss.javaguide.cn/github/javaguide/system-design/security/sso/sso-crossdomain-login-loggedin-sequence.png-kbrb.png)

**Cross-domain login (main domain name is not logged in)**

![SSO system design-cross-domain login (main domain name is not logged in)](https://oss.javaguide.cn/github/javaguide/system-design/security/sso/sso-crossdomain-login-unlogin-sequence.png-kbrb.png)

**Cross domain logout**

![SSO system design-cross-domain logout](https://oss.javaguide.cn/github/javaguide/system-design/security/sso/sso-crossdomain-logout-sequence.png-kbrb.png)

## Description

- About the plan: This time the design plan is more about providing implementation ideas. If it involves APP user login and other situations, it would be good to add signature verification to the APP when accessing the SSO service. Of course, if you have a wireless gateway, verifying the signature is not a problem.
- Regarding the sequence diagram: The sequence diagram does not include all scenarios, only the core/main scenarios are listed. In addition, some messages that do not affect the understanding of ideas can be omitted.

<!-- @include: @article-footer.snippet.md -->