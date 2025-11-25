---
title: Summary of common HTTP status codes (application layer)
category: Computer Basics
tag:
  - computer network
head:
  - - meta
    - name: keywords
      content: HTTP status code, 2xx, 3xx, 4xx, 5xx, redirection, error code, 201 Created, 204 No Content
  - - meta
    - name: description
      content: Summarizes the meanings and usage scenarios of common HTTP status codes, emphasizing confusion points such as 201/204 to improve interface design and debugging efficiency.
---

HTTP status codes are used to describe the results of HTTP requests. For example, 2xx means that the request was successfully processed.

![Common HTTP status codes](https://oss.javaguide.cn/github/javaguide/cs-basics/network/http-status-code.png)

### 1xx Informational (informational status code)

Compared with other types of status codes, you will most likely not encounter 1xx, so you can skip it here.

### 2xx Success (success status code)

- **200 OK**: The request was successfully processed. For example, send an HTTP request to query user data to the server, and the server returns the user data correctly. This is the most common HTTP status code we usually have.
- **201 Created**: The request was successfully processed and a new resource was created on the server. For example, create a new user via a POST request.
- **202 Accepted**: The server has received the request, but has not yet processed it. For example, if you send a request that takes a long time to be processed by the server (such as report generation, Excel export), the server receives the request but has not yet completed the processing.
- **204 No Content**: The server has successfully processed the request, but did not return any content. For example, a request is sent to delete a user, and the server successfully handles the deletion but returns nothing.

🐛 Correction (see: [issue#2458](https://github.com/Snailclimb/JavaGuide/issues/2458)): The 201 Created status code is more precisely the creation of one or more new resources, please refer to: <https://httpwg.org/specs/rfc9110.html#status.201>.

![](https://oss.javaguide.cn/github/javaguide/cs-basics/network/rfc9110-201-created.png)

Here is a special mention of the 204 status code, which is not seen many times in study/work.

[HTTP RFC 2616 description of 204 status code](https://tools.ietf.org/html/rfc2616#section-10.2.5) is as follows:

> The server has fulfilled the request but does not need to return an
> entity-body, and might want to return updated metainformation. The
> response MAY include new or updated metainformation in the form of
> entity-headers, which if present SHOULD be associated with the
> requested variant.
>
> If the client is a user agent, it SHOULD NOT change its document view
> from that which caused the request to be sent. This response is
> primarily intended to allow input for actions to take place without
> causing a change to the user agent's active document view, although
> any new or updated metainformation SHOULD be applied to the document
> currently in the user agent's active view.
>
> The 204 response MUST NOT include a message-body, and thus is always
> terminated by the first empty line after the header fields.

Simply put, the 204 status code describes a scenario where after we send an HTTP request to the server, we only focus on whether the processing result is successful. In other words, what we need is a result: true/false.

For example: you want to chase a girl, you ask the girl: "Can I chase you?", the girl replies: "Okay!". We can easily understand the 204 status code by treating this girl as a server.

### 3xx Redirection (redirect status code)

- **301 Moved Permanently**: The resource has been permanently redirected. For example, the URL of your website has been changed.
- **302 Found**: The resource was temporarily redirected. For example, some resources on your website are temporarily transferred to another URL.

### 4xx Client Error (client error status code)

- **400 Bad Request**: There was a problem with the HTTP request sent. For example, the request parameters are illegal and the request method is wrong.
- **401 Unauthorized**: Unauthenticated but requesting resources that require authentication before accessing.
- **403 Forbidden**: Directly reject the HTTP request and do not process it. Generally used for illegal requests.
- **404 Not Found**: The resource you requested was not found on the server. For example, if you request information about a certain user, the server does not find the specified user.
- **409 Conflict**: Indicates that the requested resource conflicts with the current status of the server and the request cannot be processed.

### 5xx Server Error (server error status code)

- **500 Internal Server Error**: There is a problem on the server side (usually there is a bug on the server side). For example, your server suddenly throws an exception when processing a request, but the exception is not handled correctly on the server.
- **502 Bad Gateway**: Our gateway forwards the request to the server, but the server returns an error response.

### Reference

- <https://www.restapitutorial.com/httpstatuscodes.html>
- <https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Status>
- <https://en.wikipedia.org/wiki/List_of_HTTP_status_codes>
- <https://segmentfault.com/a/1190000018264501>

<!-- @include: @article-footer.snippet.md -->