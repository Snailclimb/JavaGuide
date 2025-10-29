---
title: 常见加密算法总结
category: 系统设计
tag:
  - 安全
  - 哈希算法
---

加密算法是一种用数学方法对数据进行变换的技术，目的是保护数据的安全，防止被未经授权的人读取或修改。加密算法可以分为三大类：对称加密算法、非对称加密算法和哈希算法（也叫摘要算法）。

日常开发中常见的需要用到加密算法的场景：

1. 保存在数据库中的密码需要加盐之后使用哈希算法（比如 BCrypt）进行加密。
2. 保存在数据库中的银行卡号、身份号这类敏感数据需要使用对称加密算法（比如 AES）保存。
3. 网络传输的敏感数据比如银行卡号、身份号需要用 HTTPS + 非对称加密算法（如 RSA）来保证传输数据的安全性。
4. ……

ps: 严格上来说，哈希算法其实不属于加密算法，只是可以用到某些加密场景中（例如密码加密），两者可以看作是并列关系。加密算法通常指的是可以将明文转换为密文，并且能够通过某种方式（如密钥）再将密文还原为明文的算法。而哈希算法是一种单向过程，它将输入信息转换成一个固定长度的、看似随机的哈希值，但这个过程是不可逆的，也就是说，不能从哈希值还原出原始信息。

## 哈希算法

哈希算法也叫散列函数或摘要算法，它的作用是对任意长度的数据生成一个固定长度的唯一标识，也叫哈希值、散列值或消息摘要（后文统称为哈希值）。

![哈希算法效果演示](https://oss.javaguide.cn/github/javaguide/system-design/security/encryption-algorithms/hash-function-effect-demonstration.png)

哈希算法的是不可逆的，你无法通过哈希之后的值再得到原值。

哈希值的作用是可以用来验证数据的完整性和一致性。

举两个实际的例子：

- 保存密码到数据库时使用哈希算法进行加密，可以通过比较用户输入密码的哈希值和数据库保存的哈希值是否一致，来判断密码是否正确。
- 我们下载一个文件时，可以通过比较文件的哈希值和官方提供的哈希值是否一致，来判断文件是否被篡改或损坏；

这种算法的特点是不可逆：

- 不能从哈希值还原出原始数据。
- 原始数据的任何改变都会导致哈希值的巨大变化。

哈希算法可以简单分为两类：

1. **加密哈希算法**：安全性较高的哈希算法，它可以提供一定的数据完整性保护和数据防篡改能力，能够抵御一定的攻击手段，安全性相对较高，但性能较差，适用于对安全性要求较高的场景。例如 SHA2、SHA3、SM3、RIPEMD-160、BLAKE2、SipHash 等等。
2. **非加密哈希算法**：安全性相对较低的哈希算法，易受到暴力破解、冲突攻击等攻击手段的影响，但性能较高，适用于对安全性没有要求的业务场景。例如 CRC32、MurMurHash3、SipHash 等等。

除了这两种之外，还有一些特殊的哈希算法，例如安全性更高的**慢哈希算法**。

常见的哈希算法有：

- MD（Message Digest，消息摘要算法）：MD2、MD4、MD5 等，已经不被推荐使用。
- SHA（Secure Hash Algorithm，安全哈希算法）：SHA-1 系列安全性低，SHA2，SHA3 系列安全性较高。
- 国密算法：例如 SM2、SM3、SM4，其中 SM2 为非对称加密算法，SM4 为对称加密算法，SM3 为哈希算法（安全性及效率和 SHA-256 相当，但更适合国内的应用环境）。
- Bcrypt（密码哈希算法）：基于 Blowfish 加密算法的密码哈希算法，专门为密码加密而设计，安全性高，属于慢哈希算法。
- MAC（Message Authentication Code，消息认证码算法）：HMAC 是一种基于哈希的 MAC，可以与任何安全的哈希算法结合使用，例如 SHA-256。
- CRC：（Cyclic Redundancy Check，循环冗余校验）：CRC32 是一种 CRC 算法，它的特点是生成 32 位的校验值，通常用于数据完整性校验、文件校验等场景。
- SipHash：加密哈希算法，它的设计目的是在速度和安全性之间达到一个平衡，用于防御[哈希泛洪 DoS 攻击](https://aumasson.jp/siphash/siphashdos_29c3_slides.pdf)。Rust 默认使用 SipHash 作为哈希算法，从 Redis4.0 开始，哈希算法被替换为 SipHash。
- MurMurHash：经典快速的非加密哈希算法，目前最新的版本是 MurMurHash3，可以生成 32 位或者 128 位哈希值；
- ……

哈希算法一般是不需要密钥的，但也存在部分特殊哈希算法需要密钥。例如，MAC 和 SipHash 就是一种基于密钥的哈希算法，它在哈希算法的基础上增加了一个密钥，使得只有知道密钥的人才能验证数据的完整性和来源。

### MD

MD 算法有多个版本，包括 MD2、MD4、MD5 等，其中 MD5 是最常用的版本，它可以生成一个 128 位（16 字节）的哈希值。从安全性上说：MD5 > MD4 > MD2。除了这些版本，还有一些基于 MD4 或 MD5 改进的算法，如 RIPEMD、HAVAL 等。

即使是最安全 MD 算法 MD5 也存在被破解的风险，攻击者可以通过暴力破解或彩虹表攻击等方式，找到与原始数据相同的哈希值，从而破解数据。

为了增加破解难度，通常可以选择加盐。盐（Salt）在密码学中，是指通过在密码任意固定位置插入特定的字符串，让哈希后的结果和使用原始密码的哈希结果不相符，这种过程称之为“加盐”。

加盐之后就安全了吗？并不一定，这只是增加了破解难度，不代表无法破解。而且，MD5 算法本身就存在弱碰撞（Collision）问题，即多个不同的输入产生相同的 MD5 值。

因此，MD 算法已经不被推荐使用，建议使用更安全的哈希算法比如 SHA-2、Bcrypt。

Java 提供了对 MD 算法系列的支持，包括 MD2、MD5。

MD5 代码示例（未加盐）：

```java
String originalString = "Java学习 + 面试指南：javaguide.cn";
// 创建MD5摘要对象
MessageDigest messageDigest = MessageDigest.getInstance("MD5");
messageDigest.update(originalString.getBytes(StandardCharsets.UTF_8));
// 计算哈希值
byte[] result = messageDigest.digest();
// 将哈希值转换为十六进制字符串
String hexString = new HexBinaryAdapter().marshal(result);
System.out.println("Original String: " + originalString);
System.out.println("MD5 Hash: " + hexString.toLowerCase());
```

输出：

```bash
Original String: Java学习 + 面试指南：javaguide.cn
MD5 Hash: fb246796f5b1b60d4d0268c817c608fa
```

### SHA

SHA（Secure Hash Algorithm）系列算法是一组密码哈希算法，用于将任意长度的数据映射为固定长度的哈希值。SHA 系列算法由美国国家安全局（NSA）于 1993 年设计，目前共有 SHA-1、SHA-2、SHA-3 三种版本。

SHA-1 算法将任意长度的数据映射为 160 位的哈希值。然而，SHA-1 算法存在一些严重的缺陷，比如安全性低，容易受到碰撞攻击和长度扩展攻击。因此，SHA-1 算法已经不再被推荐使用。 SHA-2 家族（如 SHA-256、SHA-384、SHA-512 等）和 SHA-3 系列是 SHA-1 算法的替代方案，它们都提供了更高的安全性和更长的哈希值长度。

SHA-2 家族是在 SHA-1 算法的基础上改进而来的，它们采用了更复杂的运算过程和更多的轮次，使得攻击者更难以通过预计算或巧合找到碰撞。

为了寻找一种更安全和更先进的密码哈希算法，美国国家标准与技术研究院（National Institute of Standards and Technology，简称 NIST）在 2007 年公开征集 SHA-3 的候选算法。NIST 一共收到了 64 个算法方案，经过多轮的评估和筛选，最终在 2012 年宣布 Keccak 算法胜出，成为 SHA-3 的标准算法（SHA-3 与 SHA-2 算法没有直接的关系）。 Keccak 算法具有与 MD 和 SHA-1/2 完全不同的设计思路，即海绵结构（Sponge Construction），使得传统攻击方法无法直接应用于 SHA-3 的攻击中（能够抵抗目前已知的所有攻击方式包括碰撞攻击、长度扩展攻击、差分攻击等）。

由于 SHA-2 算法还没有出现重大的安全漏洞，而且在软件中的效率更高，所以大多数人还是倾向于使用 SHA-2 算法。

相比 MD5 算法，SHA-2 算法之所以更强，主要有两个原因：

- 哈希值长度更长：例如 SHA-256 算法的哈希值长度为 256 位，而 MD5 算法的哈希值长度为 128 位，这就提高了攻击者暴力破解或者彩虹表攻击的难度。
- 更强的碰撞抗性：SHA 算法采用了更复杂的运算过程和更多的轮次，使得攻击者更难以通过预计算或巧合找到碰撞。目前还没有找到任何两个不同的数据，它们的 SHA-256 哈希值相同。

当然，SHA-2 也不是绝对安全的，也有被暴力破解或者彩虹表攻击的风险，所以，在实际的应用中，加盐还是必不可少的。

Java 提供了对 SHA 算法系列的支持，包括 SHA-1、SHA-256、SHA-384 和 SHA-512。

SHA-256 代码示例（未加盐）：

```java
String originalString = "Java学习 + 面试指南：javaguide.cn";
// 创建SHA-256摘要对象
MessageDigest messageDigest = MessageDigest.getInstance("SHA-256");
messageDigest.update(originalString.getBytes());
// 计算哈希值
byte[] result = messageDigest.digest();
// 将哈希值转换为十六进制字符串
String hexString = new HexBinaryAdapter().marshal(result);
System.out.println("Original String: " + originalString);
System.out.println("SHA-256 Hash: " + hexString.toLowerCase());
```

输出：

```bash
Original String: Java学习 + 面试指南：javaguide.cn
SHA-256 Hash: 184eb7e1d7fb002444098c9bde3403c6f6722c93ecfac242c0e35cd9ed3b41cd
```

### Bcrypt

Bcrypt 算法是一种基于 Blowfish 加密算法的密码哈希算法，专门为密码加密而设计，安全性高。

由于 Bcrypt 采用了 salt（盐） 和 cost（成本） 两种机制，它可以有效地防止彩虹表攻击和暴力破解攻击，从而保证密码的安全性。salt 是一个随机生成的字符串，用于和密码混合，增加密码的复杂度和唯一性。cost 是一个数值参数，用于控制 Bcrypt 算法的迭代次数，增加密码哈希的计算时间和资源消耗。

Bcrypt 算法可以根据实际情况进行调整加密的复杂度，可以设置不同的 cost 值和 salt 值，从而满足不同的安全需求，灵活性很高。

Java 应用程序的安全框架 Spring Security 支持多种密码编码器，其中 `BCryptPasswordEncoder` 是官方推荐的一种，它使用 BCrypt 算法对用户的密码进行加密存储。

```java
@Bean
public PasswordEncoder passwordEncoder(){
    return new BCryptPasswordEncoder();
}
```

## 对称加密

对称加密算法是指加密和解密使用同一个密钥的算法，也叫共享密钥加密算法。

![对称加密](https://oss.javaguide.cn/github/javaguide/system-design/security/encryption-algorithms/symmetric-encryption.png)

常见的对称加密算法有 DES、3DES、AES 等。

### DES 和 3DES

DES（Data Encryption Standard）使用 64 位的密钥(有效秘钥长度为 56 位,8 位奇偶校验位)和 64 位的明文进行加密。

虽然 DES 一次只能加密 64 位，但我们只需要把明文划分成 64 位一组的块，就可以实现任意长度明文的加密。如果明文长度不是 64 位的倍数，必须进行填充，常用的模式有 PKCS5Padding, PKCS7Padding, NOPADDING。

DES 加密算法的基本思想是将 64 位的明文分成两半，然后对每一半进行多轮的变换，最后再合并成 64 位的密文。这些变换包括置换、异或、选择、移位等操作，每一轮都使用了一个子密钥，而这些子密钥都是由同一个 56 位的主密钥生成的。DES 加密算法总共进行了 16 轮变换，最后再进行一次逆置换，得到最终的密文。

![DES（Data Encryption Standard）](https://oss.javaguide.cn/github/javaguide/system-design/security/des-steps.jpg)

这是一个经典的对称加密算法，但也有明显的缺陷，即 56 位的密钥安全性不足，已被证实可以在短时间内破解。

为了提高 DES 算法的安全性，人们提出了一些变种或者替代方案，例如 3DES（Triple DES）。

3DES（Triple DES）是 DES 向 AES 过渡的加密算法，它使用 2 个或者 3 个 56 位的密钥对数据进行三次加密。3DES 相当于是对每个数据块应用三次 DES 的对称加密算法。

为了兼容普通的 DES，3DES 并没有直接使用 加密->加密->加密 的方式，而是采用了加密->解密->加密 的方式。当三种密钥均相同时，前两步相互抵消，相当于仅实现了一次加密，因此可实现对普通 DES 加密算法的兼容。3DES 比 DES 更为安全，但其处理速度不高。

### AES

AES（Advanced Encryption Standard）算法是一种更先进的对称密钥加密算法，它使用 128 位、192 位或 256 位的密钥对数据进行加密或解密，密钥越长，安全性越高。

AES 也是一种分组(或者叫块)密码，分组长度只能是 128 位，也就是说，每个分组为 16 个字节。AES 加密算法有多种工作模式（mode of operation），如：ECB、CBC、OFB、CFB、CTR、XTS、OCB、GCM（目前使用最广泛的模式）。不同的模式参数和加密流程不同，但是核心仍然是 AES 算法。

和 DES 类似，对于不是 128 位倍数的明文需要进行填充，常用的填充模式有 PKCS5Padding, PKCS7Padding, NOPADDING。不过，AES-GCM 是流加密算法，可以对任意长度的明文进行加密，所以对应的填充模式为 NoPadding，即无需填充。

AES 的速度比 3DES 快，而且更安全。

![AES（Advanced Encryption Standard）](https://oss.javaguide.cn/github/javaguide/system-design/security/aes-steps.jpg)

DES 算法和 AES 算法简单对比（图片来自于：[RSA vs. AES Encryption: Key Differences Explained](https://cheapsslweb.com/blog/rsa-vs-aes-encryption)）：

![DES 和 AES 对比](https://oss.javaguide.cn/github/javaguide/system-design/security/des-vs-aes.png)

基于 Java 实现 AES 算法代码示例：

```java
private static final String AES_ALGORITHM = "AES";
// AES密钥
private static final String AES_SECRET_KEY = "4128D9CDAC7E2F82951CBAF7FDFE675B";
// AES加密模式为GCM，填充方式为NoPadding
// AES-GCM 是流加密（Stream cipher）算法，所以对应的填充模式为 NoPadding，即无需填充。
private static final String AES_TRANSFORMATION = "AES/GCM/NoPadding";
// 加密器
private static Cipher encryptionCipher;
// 解密器
private static Cipher decryptionCipher;

/**
 * 完成一些初始化工作
 */
public static void init() throws Exception {
    // 将AES密钥转换为SecretKeySpec对象
    SecretKeySpec secretKeySpec = new SecretKeySpec(AES_SECRET_KEY.getBytes(), AES_ALGORITHM);
    // 使用指定的AES加密模式和填充方式获取对应的加密器并初始化
    encryptionCipher = Cipher.getInstance(AES_TRANSFORMATION);
    encryptionCipher.init(Cipher.ENCRYPT_MODE, secretKeySpec);
    // 使用指定的AES加密模式和填充方式获取对应的解密器并初始化
    decryptionCipher = Cipher.getInstance(AES_TRANSFORMATION);
    decryptionCipher.init(Cipher.DECRYPT_MODE, secretKeySpec, new GCMParameterSpec(128, encryptionCipher.getIV()));
}

/**
 * 加密
 */
public static String encrypt(String data) throws Exception {
    byte[] dataInBytes = data.getBytes();
    // 加密数据
    byte[] encryptedBytes = encryptionCipher.doFinal(dataInBytes);
    return Base64.getEncoder().encodeToString(encryptedBytes);
}

/**
 * 解密
 */
public static String decrypt(String encryptedData) throws Exception {
    byte[] dataInBytes = Base64.getDecoder().decode(encryptedData);
    // 解密数据
    byte[] decryptedBytes = decryptionCipher.doFinal(dataInBytes);
    return new String(decryptedBytes, StandardCharsets.UTF_8);
}

public static void main(String[] args) throws Exception {
    String originalString = "Java学习 + 面试指南：javaguide.cn";
    init();
    String encryptedData = encrypt(originalString);
    String decryptedData = decrypt(encryptedData);
    System.out.println("Original String: " + originalString);
    System.out.println("AES Encrypted Data : " + encryptedData);
    System.out.println("AES Decrypted Data : " + decryptedData);
}
```

输出：

```bash
Original String: Java学习 + 面试指南：javaguide.cn
AES Encrypted Data : E1qTkK91suBqToag7WCyoFP9uK5hR1nSfM6p+oBlYj71bFiIVnk5TsQRT+zpjv8stha7oyKi3jQ=
AES Decrypted Data : Java学习 + 面试指南：javaguide.cn
```

## 非对称加密

非对称加密算法是指加密和解密使用不同的密钥的算法，也叫公开密钥加密算法。这两个密钥互不相同，一个称为公钥，另一个称为私钥。公钥可以公开给任何人使用，私钥则要保密。

如果用公钥加密数据，只能用对应的私钥解密（加密）；如果用私钥加密数据，只能用对应的公钥解密（签名）。这样就可以实现数据的安全传输和身份认证。

![非对称加密](https://oss.javaguide.cn/github/javaguide/system-design/security/encryption-algorithms/asymmetric-encryption.png)

常见的非对称加密算法有 RSA、DSA、ECC 等。

### RSA

RSA（Rivest–Shamir–Adleman algorithm）算法是一种基于大数分解的困难性的非对称加密算法，它需要选择两个大素数作为私钥的一部分，然后计算出它们的乘积作为公钥的一部分（寻求两个大素数比较简单，而将它们的乘积进行因式分解却极其困难）。RSA 算法原理的详细介绍，可以参考这篇文章：[你真的了解 RSA 加密算法吗？ - 小傅哥](https://www.cnblogs.com/xiaofuge/p/16954187.html)。

RSA 算法的安全性依赖于大数分解的难度，目前已经有 512 位和 768 位的 RSA 公钥被成功分解，因此建议使用 2048 位或以上的密钥长度。

RSA 算法的优点是简单易用，可以用于数据加密和数字签名；缺点是运算速度慢，不适合大量数据的加密。

RSA 算法是是目前应用最广泛的非对称加密算法，像 SSL/TLS、SSH 等协议中就用到了 RSA 算法。

![HTTPS 证书签名算法中带RSA 加密的SHA-256 ](https://oss.javaguide.cn/github/javaguide/system-design/security/encryption-algorithms/https-rsa-sha-256.png)

基于 Java 实现 RSA 算法代码示例：

```java
private static final String RSA_ALGORITHM = "RSA";

/**
 * 生成RSA密钥对
 */
public static KeyPair generateKeyPair() throws NoSuchAlgorithmException {
    KeyPairGenerator keyPairGenerator = KeyPairGenerator.getInstance(RSA_ALGORITHM);
    // 密钥大小为2048位
    keyPairGenerator.initialize(2048);
    return keyPairGenerator.generateKeyPair();
}

/**
 * 使用公钥加密数据
 */
public static String encrypt(String data, PublicKey publicKey) throws Exception {
    Cipher cipher = Cipher.getInstance(RSA_ALGORITHM);
    cipher.init(Cipher.ENCRYPT_MODE, publicKey);
    byte[] encryptedData = cipher.doFinal(data.getBytes(StandardCharsets.UTF_8));
    return Base64.getEncoder().encodeToString(encryptedData);
}

/**
 * 使用私钥解密数据
 */
public static String decrypt(String encryptedData, PrivateKey privateKey) throws Exception {
    byte[] decodedData = Base64.getDecoder().decode(encryptedData);
    Cipher cipher = Cipher.getInstance(RSA_ALGORITHM);
    cipher.init(Cipher.DECRYPT_MODE, privateKey);
    byte[] decryptedData = cipher.doFinal(decodedData);
    return new String(decryptedData, StandardCharsets.UTF_8);
}

public static void main(String[] args) throws Exception {
    KeyPair keyPair = generateKeyPair();
    PublicKey publicKey = keyPair.getPublic();
    PrivateKey privateKey = keyPair.getPrivate();
    String originalString = "Java学习 + 面试指南：javaguide.cn";
    String encryptedData = encrypt(originalString, publicKey);
    String decryptedData = decrypt(encryptedData, privateKey);
    System.out.println("Original String: " + originalString);
    System.out.println("RSA Encrypted Data : " + encryptedData);
    System.out.println("RSA Decrypted Data : " + decryptedData);
}
```

输出：

```bash
Original String: Java学习 + 面试指南：javaguide.cn
RSA Encrypted Data : T9ey/CEPUAhZm4UJjuVNIg8RPd1fQ32S9w6+rvOKxmuMumkJY2daFfWuCn8A73Mk5bL6TigOJI0GHfKOt/W2x968qLM3pBGCcPX17n4pR43f32IIIz9iPdgF/INOqDxP5ZAtCDvTiuzcSgDHXqiBSK5TDjtj7xoGjfudYAXICa8pWitnqDgJYoo2J0F8mKzxoi8D8eLE455MEx8ZT1s7FUD/z7/H8CfShLRbO9zq/zFI06TXn123ufg+F4lDaq/5jaIxGVEUB/NFeX4N6OZCFHtAV32mw71BYUadzI9TgvkkUr1rSKmQ0icNhnRdKedJokGUh8g9QQ768KERu92Ibg==
RSA Decrypted Data : Java学习 + 面试指南：javaguide.cn
```

### DSA

DSA（Digital Signature Algorithm）算法是一种基于离散对数的困难性的非对称加密算法，它需要选择一个素数 q 和一个 q 的倍数 p 作为私钥的一部分，然后计算出一个模 p 的原根 g 和一个模 q 的整数 y 作为公钥的一部分。DSA 算法的安全性依赖于离散对数的难度，目前已经有 1024 位的 DSA 公钥被成功破解，因此建议使用 2048 位或以上的密钥长度。

DSA 算法的优点是数字签名速度快，适合生成数字证书；缺点是不能用于数据加密，且签名过程需要随机数。

DSA 算法签名过程：

1. 使用消息摘要算法对要发送的数据进行加密，生成一个信息摘要，也就是一个短的、唯一的、不可逆的数据表示。
2. 发送方用自己的 DSA 私钥对信息摘要再进行加密，形成一个数字签名，也就是一个可以证明数据来源和完整性的数据附加。
3. 将原始数据和数字签名一起通过互联网传送给接收方。
4. 接收方用发送方的公钥对数字签名进行解密，得到信息摘要。同时，接收方也用消息摘要算法对收到的原始数据进行加密，得到另一个信息摘要。接收方将两个信息摘要进行比较，如果两者一致，则说明在传送过程中数据没有被篡改或损坏；否则，则说明数据已经失去了安全性和保密性。

![DSA 算法签名过程](https://oss.javaguide.cn/github/javaguide/system-design/security/encryption-algorithms/dsa-algorithm-signing-process.png)

## 总结

这篇文章介绍了三种加密算法：哈希算法、对称加密算法和非对称加密算法。

- 哈希算法是一种用数学方法对数据生成一个固定长度的唯一标识的技术，可以用来验证数据的完整性和一致性，常见的哈希算法有 MD、SHA、MAC 等。
- 对称加密算法是一种加密和解密使用同一个密钥的算法，可以用来保护数据的安全性和保密性，常见的对称加密算法有 DES、3DES、AES 等。
- 非对称加密算法是一种加密和解密使用不同的密钥的算法，可以用来实现数据的安全传输和身份认证，常见的非对称加密算法有 RSA、DSA、ECC 等。

## 参考

- 深入理解完美哈希 - 腾讯技术工程：<https://mp.weixin.qq.com/s/M8Wcj8sZ7UF1CMr887Puog>
- 写给开发人员的实用密码学（二）—— 哈希函数：<https://thiscute.world/posts/practical-cryptography-basics-2-hash/>
- 奇妙的安全旅行之 DSA 算法：<https://zhuanlan.zhihu.com/p/347025157>
- AES-GCM 加密简介：<https://juejin.cn/post/6844904122676690951>
- Java AES 256 GCM Encryption and Decryption Example | JCE Unlimited Strength：<https://www.javainterviewpoint.com/java-aes-256-gcm-encryption-and-decryption/>

<!-- @include: @article-footer.snippet.md -->
