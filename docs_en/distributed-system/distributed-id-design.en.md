---
title: 分布式ID设计指南
category: 分布式
---

::: tip

看到百度 Geek 说的一篇结合具体场景聊分布式 ID 设计的文章，感觉挺不错的。于是，我将这篇文章的部分内容整理到了这里。原文传送门：[分布式 ID 生成服务的技术原理和项目实战](https://mp.weixin.qq.com/s/bFDLb6U6EgI-DvCdLTq_QA) 。

:::

网上绝大多数的分布式 ID 生成服务，一般着重于技术原理剖析，很少见到根据具体的业务场景去选型 ID 生成服务的文章。

本文结合一些使用场景，进一步探讨业务场景中对 ID 有哪些具体的要求。

## 场景一：订单系统

我们在商场买东西一码付二维码，下单生成的订单号，使用到的优惠券码，联合商品兑换券码，这些是在网上购物经常使用到的单号，那么为什么有些单号那么长，有些只有几位数？有些单号一看就知道年月日的信息，有些却看不出任何意义？下面展开分析下订单系统中不同场景的 id 服务的具体实现。

### 1、一码付

我们常见的一码付，指的是一个二维码可以使用支付宝或者微信进行扫码支付。

二维码的本质是一个字符串。聚合码的本质就是一个链接地址。用户使用支付宝微信直接扫一个码付钱，不用担心拿支付宝扫了微信的收款码或者用微信扫了支付宝的收款码，这极大减少了用户扫码支付的时间。

实现原理是当客户用 APP 扫码后，网站后台就会判断客户的扫码环境。（微信、支付宝、QQ 钱包、京东支付、云闪付等）。

判断扫码环境的原理就是根据打开链接浏览器的 HTTP header。任何浏览器打开 http 链接时，请求的 header 都会有 User-Agent(UA、用户代理)信息。

UA 是一个特殊字符串头，服务器依次可以识别出客户使用的操作系统及版本、CPU 类型、浏览器及版本、浏览器渲染引擎、浏览器语言、浏览器插件等很多信息。

各渠道对应支付产品的名称不一样，一定要仔细看各支付产品的 API 介绍。

1. 微信支付：JSAPI 支付支付
2. 支付宝：手机网站支付
3. QQ 钱包：公众号支付

其本质均为在 APP 内置浏览器中实现 HTML5 支付。

![文库会员支付示例](https://oss.javaguide.cn/github/javaguide/system-design/distributed-system/distributed-id-design-pay-one-card.png)

文库的研发同学在这个思路上，做了优化迭代。动态生成一码付的二维码预先绑定用户所选的商品信息和价格，根据用户所选的商品动态更新。这样不仅支持一码多平台调起支付，而且不用用户选择商品输入金额，即可完成订单支付的功能，很丝滑。用户在真正扫码后，服务端才通过前端获取用户 UID，结合二维码绑定的商品信息，真正的生成订单，发送支付信息到第三方（qq、微信、支付宝），第三方生成支付订单推给用户设备，从而调起支付。

区别于固定的一码付，在文库的应用中，使用到了动态二维码，二维码本质是一个短网址，ID 服务提供短网址的唯一标志参数。唯一的短网址映射的 ID 绑定了商品的订单信息，技术和业务的深度结合，缩短了支付流程，提升用户的支付体验。

### 2、订单号

订单号在实际的业务过程中作为一个订单的唯一标识码存在，一般实现以下业务场景：

1. 用户订单遇到问题，需要找客服进行协助；
2. 对订单进行操作，如线下收款，订单核销；
3. 下单，改单，成单，退单，售后等系统内部的订单流程处理和跟进。

很多时候搜索订单相关信息的时候都是以订单 ID 作为唯一标识符，这是由于订单号的生成规则的唯一性决定的。从技术角度看，除了 ID 服务必要的特性之外，在订单号的设计上需要体现几个特性：

**（1）信息安全**

编号不能透露公司的运营情况，比如日销、公司流水号等信息，以及商业信息和用户手机号，身份证等隐私信息。并且不能有明显的整体规律（可以有局部规律），任意修改一个字符就能查询到另一个订单信息，这也是不允许的。

类比于我们高考时候的考生编号的生成规则，一定不能是连号的，否则只需要根据顺序往下查询就能搜索到别的考生的成绩，这是绝对不可允许。

**（2）部分可读**

位数要便于操作，因此要求订单号的位数适中，且局部有规律。这样可以方便在订单异常，或者退货时客服查询。

过长的订单号或易读性差的订单号会导致客服输入困难且易错率较高，影响用户体验的售后体验。因此在实际的业务场景中，订单号的设计通常都会适当携带一些允许公开的对使用场景有帮助的信息，如时间，星期，类型等等，这个主要根据所涉及的编号对应的使用场景来。

而且像时间、星期这些自增长的属于作为订单号的设计的一部分元素，有助于解决业务累积而导致的订单号重复的问题。

**（3）查询效率**

常见的电商平台订单号大多是纯数字组成，兼具可读性的同时，int 类型相对 varchar 类型的查询效率更高，对在线业务更加友好。

### 3、优惠券和兑换券

优惠券、兑换券是运营推广最常用的促销工具之一，合理使用它们，可以让买家得到实惠，商家提升商品销量。常见场景有：

1. 在文库购买【文库 VIP+QQ 音乐年卡】联合商品，支付成功后会得到 QQ 音乐年卡的兑换码，可以去 QQ 音乐 App 兑换音乐会员年卡；
2. 疫情期间，部分地方政府发放的消费券；
3. 瓶装饮料经常会出现输入优惠编码兑换奖品。

![优惠编码兑换奖品](https://oss.javaguide.cn/github/javaguide/system-design/distributed-system/distributed-id-design-coupon.png)

从技术角度看，有些场景适合 ID 即时生成，比如电商平台购物领取的优惠券，只需要在用户领取时分配优惠券信息即可。有些线上线下结合的场景，比如疫情优惠券，瓶盖开奖，京东卡，超市卡这种，则需要预先生成，预先生成的券码具备以下特性：

1.预先生成，在活动正式开始前提供出来进行活动预热；

2.优惠券体量大，以万为单位，通常在 10 万级别以上；

3.不可破解、仿制券码；

4.支持用后核销；

5.优惠券、兑换券属于广撒网的策略，所以利用率低，也就不适合使用数据库进行存储 **（占空间，有效的数据又少）**。

设计思路上，需要设计一种有效的兑换码生成策略，支持预先生成，支持校验，内容简洁，生成的兑换码都具有唯一性，那么这种策略就是一种特殊的编解码策略，按照约定的编解码规则支撑上述需求。

既然是一种编解码规则，那么需要约定编码空间(也就是用户看到的组成兑换码的字符)，编码空间由字符 a-z,A-Z,数字 0-9 组成，为了增强兑换码的可识别度，剔除大写字母 O 以及 I,可用字符如下所示，共 60 个字符：

abcdefghijklmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXZY0123456789

之前说过，兑换码要求尽可能简洁，那么设计时就需要考虑兑换码的字符数，假设上限为 12 位，而字符空间有 60 位，那么可以表示的空间范围为 60^12=130606940160000000000000(也就是可以 12 位的兑换码可以生成天量,应该够运营同学挥霍了)，转换成 2 进制：

1001000100000000101110011001101101110011000000000000000000000(61 位)

**兑换码组成成分分析**

兑换码可以预先生成，并且不需要额外的存储空间保存这些信息，每一个优惠方案都有独立的一组兑换码(指运营同学组织的每一场运营活动都有不同的兑换码,不能混合使用, 例如双 11 兑换码不能使用在双 12 活动上)，每个兑换码有自己的编号，防止重复，为了保证兑换码的有效性，对兑换码的数据需要进行校验，当前兑换码的数据组成如下所示：

优惠方案 ID + 兑换码序列号 i + 校验码

**编码方案**

1. 兑换码序列号 i，代表当前兑换码是当前活动中第 i 个兑换码，兑换码序列号的空间范围决定了优惠活动可以发行的兑换码数目，当前采用 30 位 bit 位表示，可表示范围：1073741824（10 亿个券码）。
2. 优惠方案 ID, 代表当前优惠方案的 ID 号，优惠方案的空间范围决定了可以组织的优惠活动次数，当前采用 15 位表示，可以表示范围：32768（考虑到运营活动的频率，以及 ID 的初始值 10000，15 位足够，365 天每天有运营活动，可以使用 54 年）。
3. 校验码，校验兑换码是否有效，主要为了快捷的校验兑换码信息的是否正确，其次可以起到填充数据的目的，增强数据的散列性，使用 13 位表示校验位，其中分为两部分，前 6 位和后 7 位。

深耕业务还会有区分通用券和单独券的情况，分别具备以下特点，技术实现需要因地制宜地思考。

1. 通用券：多个玩家都可以输入兑换，然后有总量限制，期限限制。
2. 单独券：运营同学可以在后台设置兑换码的奖励物品、期限、个数，然后由后台生成兑换码的列表，兑换之后核销。

## 场景二：Tracing

### 1、日志跟踪

在分布式服务架构下，一个 Web 请求从网关流入，有可能会调用多个服务对请求进行处理，拿到最终结果。这个过程中每个服务之间的通信又是单独的网络请求，无论请求经过的哪个服务出了故障或者处理过慢都会对前端造成影响。

To process multiple services called by a Web request, in order to more conveniently query which link of the service has a problem, a common solution now is to introduce distributed link tracking into the entire system.

![In distributed link tracing](https://oss.javaguide.cn/github/javaguide/system-design/distributed-system/distributed-id-design-tracing.png)

There are two important concepts in distributed link tracing: trace and span. Trace is the view of the entire link in the distributed system requested, and span represents the internal view of different services in the entire link. The span combined together is the view of the entire trace.

In the entire request call chain, the request will always carry the traceid and be passed to the downstream service. Each service will also generate its own spanid internally to generate its own internal call view, and pass it to the downstream service together with the traceid.

### 2. TraceId generation rules

In this scenario, the generated ID must not only be unique, but also must be generated with high efficiency and high throughput. The traceid needs to have the ability to be generated independently by the server instance of the access layer. If the ID in each trace needs to be generated by requesting a public ID service, it will be a pure waste of network bandwidth resources. And it will block the transmission of user requests to downstream, increase the response time, and increase unnecessary risks. Therefore, if a server instance is required, it is best to calculate tracid and spanid by itself to avoid relying on external services.

Generation rules: server IP + ID generation time + auto-increment sequence + current process number, for example:

0ad1348f1403169275002100356696

The first 8 digits 0ad1348f are the IP of the machine that generated the TraceId. This is a hexadecimal number. Each two digits represents a segment of the IP. We convert this number into decimal for each digit to get the common IP address representation 10.209.52.143. You can also use this rule to find the first server that the request passes through.

The following 13 bits 1403169275002 are the time when the TraceId was generated. The next four digits 1003 are a self-increasing sequence, rising from 1000 to 9000. After reaching 9000, it returns to 1000 and starts to rise again. The last 5 digits 56696 are the current process ID. In order to prevent TraceId conflicts in single-machine multiple processes, the current process ID is added at the end of TraceId.

### 3. SpanId generation rules

span means layer. For example, the first instance is considered the first layer, and the request is proxied or offloaded to the next instance for processing, which is the second layer, and so on. By layer, SpanId represents the position of this call in the entire call link tree.

Assume that a server instance A receives a user request, which represents the root node of the entire call. Then the spanid value of the non-service call log record generated by layer A when processing this request is all 0. Layer A needs to call three server instances B, C, and D in sequence through RPC. Then in the log of A, the SpanId is 0.1, 0.2, and 0.3 respectively. In B, C, and D, the SpanId is also respectively. 0.1, 0.2 and 0.3; if system C calls two server instances of E and F when processing the request, then the corresponding spanids in system C are 0.2.1 and 0.2.2, and the corresponding logs of systems E and F are also 0.2.1 and 0.2.2.

According to the above description, we can know that if all the SpanIds in a call are collected, a complete link tree can be formed.

The essence of **spanid generation: it is achieved by controlling the automatic increment of the size and version numbers while transmitting transparently across layers. **

## Scenario 3: Short URL

The main functions of short URL include URL shortening and restoration. Compared with long URLs, short URLs can be spread more easily on emails, social networks, Weibo, and mobile phones. For example, a URL that was originally very long can be generated into a corresponding short URL through a URL shortening service to avoid line breaks or exceeding character limits.

![Short URL function](https://oss.javaguide.cn/github/javaguide/system-design/distributed-system/distributed-id-design-short-url.png)

Commonly used ID generation services such as: MySQL ID auto-increment, Redis key auto-increment, number segment mode, the generated IDs are all a string of numbers. The URL shortening service converts the customer's long URL into a short URL.

In fact, the newly generated numeric ID is spliced after the dwz.cn domain name, and the numeric ID is used directly. The length of the URL is also a bit long. The service can compress the length by converting the numeric ID to a higher base. This algorithm is increasingly used in the technical implementation of short URLs, and it can further compress the URL length. The hexadecimal compression algorithm has a wide range of application scenarios in life, for example:

- Customer's long URL: <https://wenku.baidu.com/ndbusiness/browse/wenkuvipcashier?cashier_code=PCoperatebanner>
- ID mapped short URL: <https://dwz.cn/2047601319t66> (for demonstration use, may not open correctly)
- Shortened URL after conversion: <https://dwz.cn/2ezwDJ0> (for demonstration use, it may not open correctly)

<!-- @include: @article-footer.snippet.md -->