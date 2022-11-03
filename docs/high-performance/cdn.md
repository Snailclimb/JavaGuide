---
title: CDN（内容分发网络）详解
category: 高性能
head:
  - - meta
    - name: keywords
      content: CDN,内容分发网络
  - - meta
    - name: description
      content: CDN 就是将静态资源分发到多个不同的地方以实现就近访问，进而加快静态资源的访问速度，减轻服务器以及带宽的负担。
---

## 什么是 CDN ？

**CDN** 全称是 Content Delivery Network/Content Distribution Network，翻译过的意思是 **内容分发网络** 。

我们可以将内容分发网络拆开来看：

- 内容 ：指的是静态资源比如图片、视频、文档、JS、CSS、HTML。
- 分发网络 ：指的是将这些静态资源分发到位于多个不同的地理位置机房中的服务器上，这样，就可以实现静态资源的就近访问比如北京的用户直接访问北京机房的数据。

所以，简单来说，**CDN 就是将静态资源分发到多个不同的地方以实现就近访问，进而加快静态资源的访问速度，减轻服务器以及带宽的负担。**

类似于京东建立的庞大的仓储运输体系，京东物流在全国拥有非常多的仓库，仓储网络几乎覆盖全国所有区县。这样的话，用户下单的第一时间，商品就从距离用户最近的仓库，直接发往对应的配送站，再由京东小哥送到你家。

![京东仓配系统](https://guide-blog-images.oss-cn-shenzhen.aliyuncs.com/github/javaguide/high-performance/cdn/jingdong-wuliu-cangpei.png)

你可以将 CDN 看作是服务上一层的特殊缓存服务，分布在全国各地，主要用来处理静态资源的请求。

![CDN 简易示意图](https://guide-blog-images.oss-cn-shenzhen.aliyuncs.com/github/javaguide/high-performance/cdn/cdn-101.png)

我们经常拿全站加速和内容分发网络做对比，不要把两者搞混了！全站加速（不同云服务商叫法不同，腾讯云叫 ECDN、阿里云叫 DCDN）既可以加速静态资源又可以加速动态资源，内容分发网络（CDN）主要针对的是 **静态资源** 。

![阿里云文档：https://help.aliyun.com/document_detail/64836.html](https://guide-blog-images.oss-cn-shenzhen.aliyuncs.com/github/javaguide/high-performance/cdn/cdn-aliyun-dcdn.png)

绝大部分公司都会在项目开发中交使用 CDN 服务，但很少会有自建 CDN 服务的公司。基于成本、稳定性和易用性考虑，建议直接选择专业的云厂商（比如阿里云、腾讯云、华为云、青云）或者 CDN 厂商（比如网宿、蓝汛）提供的开箱即用的 CDN 服务。

很多朋友可能要问了：**既然是就近访问，为什么不直接将服务部署在多个不同的地方呢？**

- 成本太高，需要部署多份相同的服务。
- 静态资源通常占用空间比较大且经常会被访问到，如果直接使用服务器或者缓存来处理静态资源请求的话，对系统资源消耗非常大，可能会影响到系统其他服务的正常运行。

同一个服务在在多个不同的地方部署多份（比如同城灾备、异地灾备、同城多活、异地多活）是为了实现系统的高可用而不是就近访问。

## CDN 工作原理是什么？

搞懂下面 3 个问题也就搞懂了 CDN 的工作原理：

1. 静态资源是如何被缓存到 CDN 节点中的？
2. 如何找到最合适的 CDN 节点？
3. 如何防止静态资源被盗用？

### 静态资源是如何被缓存到 CDN 节点中的？

你可以通过预热的方式将源站的资源同步到 CDN 的节点中。这样的话，用户首次请求资源可以直接从 CDN 节点中取，无需回源。这样可以降低源站压力，提升用户体验。

如果不预热的话，你访问的资源可能不再 CDN 节点中，这个时候 CDN 节点将请求源站获取资源，这个过程是大家经常说的 **回源**。

**命中率** 和 **回源率** 是衡量 CDN 服务质量两个重要指标。命中率越高越好，回源率越低越好。

如果资源有更新的话，你也可以对其 **刷新** ，删除 CDN 节点上缓存的资源，当用户访问对应的资源时直接回源获取最新的资源，并重新缓存。

### 如何找到最合适的 CDN 节点？

GSLB （Global Server Load Balance，全局负载均衡）是 CDN 的大脑，负责多个CDN节点之间相互协作，最常用的是基于 DNS 的 GSLB。

CDN 会通过 GSLB 找到最合适的 CDN 节点，更具体点来说是下面这样的：

1. 浏览器向 DNS 服务器发送域名请求；
2. DNS 服务器向根据 CNAME( Canonical Name ) 别名记录向 GSLB 发送请求；
3. GSLB 返回性能最好（通常距离请求地址最近）的 CDN 节点（边缘服务器，真正缓存内容的地方）的地址给浏览器；
4. 浏览器直接访问指定的 CDN 节点。

![CDN 原理示意图](https://guide-blog-images.oss-cn-shenzhen.aliyuncs.com/github/javaguide/high-performance/cdn/cdn-overview.png)

为了方便理解，上图其实做了一点简化。GSLB 内部可以看作是 CDN 专用 DNS 服务器和负载均衡系统组合。CDN 专用 DNS 服务器会返回负载均衡系统 IP 地址给浏览器，浏览器使用 IP 地址请求负载均衡系统进而找到对应的 CDN 节点。

**GSLB 是如何选择出最合适的 CDN 节点呢？** GSLB 会根据请求的 IP 地址、CDN 节点状态（比如负载情况、性能、响应时间、带宽）等指标来综合判断具体返回哪一个 CDN 节点的地址。

### 如何防止资源被盗刷？

如果我们的资源被其他用户或者网站非法盗刷的话，将会是一笔不小的开支。

解决这个问题最常用最简单的办法设置 **Referer 防盗链**，具体来说就是根据 HTTP 请求的头信息里面的 Referer 字段对请求进行限制。我们可以通过 Referer 字段获取到当前请求页面的来源页面的网站地址，这样我们就能确定请求是否来自合法的网站。

CDN 服务提供商几乎都提供了这种比较基础的防盗链机制。

![腾讯云 CDN Referer 防盗链配置](https://guide-blog-images.oss-cn-shenzhen.aliyuncs.com/github/javaguide/high-performance/cdn/cnd-tencent-cloud-anti-theft.png)

不过，如果站点的防盗链配置允许 Referer 为空的话，通过隐藏 Referer，可以直接绕开防盗链。

通常情况下，我们会配合其他机制来确保静态资源被盗用，一种常用的机制是 **时间戳防盗链** 。相比之下，**时间戳防盗链** 的安全性更强一些。时间戳防盗链加密的 URL 具有时效性，过期之后就无法再被允许访问。

时间戳防盗链的 URL 通常会有两个参数一个是签名字符串，一个是过期时间。签名字符串一般是通过对用户设定的加密字符串、请求路径、过期时间通过  MD5 哈希算法取哈希的方式获得。

时间戳防盗链 URL示例：

```
http://cdn.wangsu.com/4/123.mp3? wsSecret=79aead3bd7b5db4adeffb93a010298b5&wsTime=1601026312
```

-  `wsSecret` ：签名字符串。
- `wsTime`: 过期时间。

![](https://guide-blog-images.oss-cn-shenzhen.aliyuncs.com/github/javaguide/high-performance/cdn/timestamp-anti-theft.png)

时间戳防盗链的实现也比较简单，并且可靠性较高，推荐使用。并且，绝大部分 CDN 服务提供商都提供了开箱即用的时间戳防盗链机制。

![七牛云时间戳防盗链配置](https://guide-blog-images.oss-cn-shenzhen.aliyuncs.com/github/javaguide/high-performance/cdn/qiniuyun-timestamp-anti-theft.png)

除了 Referer 防盗链和时间戳防盗链之外，你还可以 IP 黑白名单配置、IP 访问限频配置等机制来防盗刷。

## 总结

- CDN 就是将静态资源分发到多个不同的地方以实现就近访问，进而加快静态资源的访问速度，减轻服务器以及带宽的负担。
- 基于成本、稳定性和易用性考虑，建议直接选择专业的云厂商（比如阿里云、腾讯云、华为云、青云）或者 CDN 厂商（比如网宿、蓝汛）提供的开箱即用的 CDN 服务。
- GSLB （Global Server Load Balance，全局负载均衡）是 CDN 的大脑，负责多个 CDN 节点之间相互协作，最常用的是基于 DNS 的 GSLB。CDN 会通过 GSLB 找到最合适的 CDN 节点。
- 为了防止静态资源被盗用，我们可以利用 **Referer 防盗链** + **时间戳防盗链** 。

## 参考

- 时间戳防盗链 - 七牛云 CDN：https://developer.qiniu.com/fusion/kb/1670/timestamp-hotlinking-prevention
- CDN是个啥玩意？一文说个明白：https://mp.weixin.qq.com/s/Pp0C8ALUXsmYCUkM5QnkQw
- 《透视 HTTP 协议》- 37 | CDN：加速我们的网络服务：http://gk.link/a/11yOG



