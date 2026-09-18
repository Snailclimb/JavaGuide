---
title: Lộ trình học Java backend (bản mới nhất 2026)
description: Lộ trình học Java backend bản mới nhất 2026, bao phủ Java Basics, database, framework, công cụ, JVM, concurrency, distributed, high concurrency, high availability, microservice, AI application development và thực chiến project, phù hợp để học Java backend có hệ thống và chuẩn bị tìm việc.
category: Lộ trình học
head:
  - - meta
    - name: keywords
      content: lộ trình học Java,lộ trình học Java backend,lộ trình học Java 2026,Java backend,phỏng vấn Java,Spring Boot,MySQL,Redis,JVM,Java concurrency,distributed,microservice,AI application development
---

Đây là bản mới nhất 2026 của lộ trình học Java, mỗi năm đều được tối ưu và cải tiến toàn diện theo yêu cầu tuyển dụng Java backend mới nhất.

Bài viết này có thể là lộ trình học Java backend tâm huyết và đầy đủ nhất bạn từng thấy, tổng cộng hơn 4w chữ. Tuy nhiên đừng lo nội dung quá nhiều không học nổi, tôi sẽ chia theo độ khó: phần bắt buộc phải học để tìm được việc ở công ty nhỏ, và lộ trình nâng dần năng lực Java backend một cách tuần tự.

Với người mới, bạn có thể học có hệ thống theo lộ trình và tài liệu mà bài viết này gợi ý; với developer đã có kinh nghiệm, bạn có thể dựa vào bài viết này để đào sâu hơn về Java backend, nâng cao năng lực cạnh tranh cá nhân.

Để nội dung không quá tạp, bài viết này sẽ không nói về phương pháp học và lời khuyên phát triển bản thân, phần đó bạn có thể xem vài bài trong mục "Đời lập trình viên" của JavaGuide:

- [Lập trình viên học công nghệ mới nhanh như thế nào](https://javaguide.cn/high-quality-technical-articles/advanced-programmer/programmer-quickly-learn-new-technology.html)
- [Chiến lược phát triển kỹ thuật của lập trình viên](https://javaguide.cn/high-quality-technical-articles/advanced-programmer/the-growth-strategy-of-the-technological-giant.html)
- [Bảy lời khuyên cho bạn muốn trở thành developer cấp cao](https://javaguide.cn/high-quality-technical-articles/advanced-programmer/seven-tips-for-becoming-an-advanced-programmer.html)

Bài viết này cũng không đề cập đến phần computer science cơ bản; về kiến thức nền tảng bạn có thể tham khảo phần chia sẻ trên website của tôi: [Gợi ý sách computer science cơ bản](https://javaguide.cn/books/cs-basics.html).

Nói thêm một câu: với người mới bắt đầu lập trình, tôi không khuyến khích lao vào học qua việc làm project ngay. Thực hành đúng là rất quan trọng, nhưng nếu bạn chưa có nền tảng lập trình mà nhảy thẳng vào thực chiến thì rất dễ học thành "nửa nạc nửa mỡ". Khuyên bạn trong giai đoạn đầu học lập trình nên xem nhiều video chất lượng. Đi theo video từng bước sẽ giúp bạn tránh được rất nhiều cạm bẫy, và sự tự tin khi học lập trình cũng tăng lên.

## Tổng quan lộ trình học Java backend

Tôi đã vẽ một sơ đồ, trước hết cùng xem qua toàn cảnh lộ trình học Java backend và thứ tự học mà tôi khuyến nghị.

Mỗi điểm kiến thức trong sơ đồ bên dưới đều sẽ được giới thiệu chi tiết ở phần sau (kèm gợi ý tài liệu học).

![Tổng quan lộ trình học Java backend](https://oss.javaguide.cn/github/javaguide/interview-preparation/java-learning-route/java-learning-route-2024.png)

Bản gốc + bản PDF của ảnh trên có thể lấy bằng cách nhắn "**学习路线**" (lộ trình học) cho tài khoản công khai **「JavaGuide」**.

![Tài khoản công khai chính thức JavaGuide](https://oss.javaguide.cn/github/javaguide/gongzhonghaoxuanchuan.png)

**Nội dung hơi nhiều? Thấy nản?** Nếu bạn chỉ muốn tìm một công việc developer ở công ty nhỏ, hãy tập trung vào Java Basics, database, các framework thường dùng và các công cụ thường dùng.

Còn những điểm kiến thức như JVM, distributed, high concurrency, high availability, microservice, nếu bạn muốn vào công ty lớn hoặc muốn cạnh tranh tốt hơn khi tìm việc thì cũng cần bỏ thêm thời gian học.

Phỏng vấn bây giờ rất cạnh tranh, muốn tìm được công việc tốt thì bạn cần học nhiều hơn, luyện nhiều hơn. Tuy nhiều kiến thức bạn học hiện tại có thể sẽ không dùng đến khi đi làm, nhưng vòng sàng lọc phỏng vấn lại đòi hỏi bạn phải biết. Suy cho cùng, nhiều vị trí có rất nhiều người cùng cạnh tranh, để đạt hiệu quả sàng lọc thì độ khó phỏng vấn thường khá cao. Đây chính là cái gọi là: "phỏng vấn thì chế tên lửa, vào làm thì vặn ốc vít".

## Những công nghệ Java đã bị đào thải

Bài viết [Những công nghệ Java đã bị đào thải, đừng học nữa!](https://javaguide.cn/about-the-author/deprecated-java-technologies.html) đề cập đến các công nghệ đã bị đào thải trong lĩnh vực Java, nhất định nhất định nhất định đừng học nữa! Ai khuyên bạn học những công nghệ dưới đây thì cứ tát cho hai cái.

**JSP**

- **Lý do**: JSP đã lỗi thời, không đáp ứng được nhu cầu Web development hiện đại; tách frontend-backend đã trở thành xu hướng chính.
- **Giải pháp thay thế**: template engine (như Thymeleaf, Freemarker) phổ biến hơn trong full-stack truyền thống; còn trong kiến trúc tách frontend-backend, các framework frontend hiện đại như React, Vue, Angular đã thay thế vai trò của JSP.
- **Lưu ý**: một số project cũ của doanh nghiệp nhà nước có thể vẫn dùng JSP, nhưng trường hợp này ngày càng hiếm.

**Struts (đặc biệt là 1.x)**

- **Lý do**: cấu hình rườm rà, hiệu suất phát triển thấp, và tồn tại lỗ hổng bảo mật nghiêm trọng (như lỗ hổng Apache Struts 2 nổi tiếng thế giới). Ngoài ra, cộng đồng duy trì không đủ, hệ sinh thái dần teo tóp.
- **Giải pháp thay thế**: Spring MVC và Spring WebFlux mang lại trải nghiệm phát triển gọn gàng hơn, tính năng mạnh hơn và hỗ trợ cộng đồng hoàn thiện, đã thay thế hoàn toàn Struts.

**EJB (Enterprise JavaBeans)**

- **Lý do**: EJB quá phức tạp, chi phí phát triển cao, đường cong học tập dốc, dần bị thay thế bởi các framework nhẹ hơn trong project thực tế.
- **Giải pháp thay thế**: Spring/Spring Boot cung cấp giải pháp phát triển cấp doanh nghiệp gọn gàng và mạnh mẽ hơn, gần như đã trở thành tiêu chuẩn thực tế của Java enterprise development. Ngoài ra, các framework như Solon (nội địa Trung Quốc) và Quarkus (thân thiện với cloud native) cũng rất tốt.

**Java Applets**

- **Lý do**: các trình duyệt hiện đại (Chrome, Firefox, Edge) đã gỡ bỏ hoàn toàn hỗ trợ Java Applets từ lâu, đồng thời Applets tồn tại vấn đề bảo mật nghiêm trọng.
- **Giải pháp thay thế**: HTML5, WebAssembly cùng các framework JavaScript hiện đại (như React, Vue) có thể mang lại trải nghiệm tương tác an toàn và hiệu quả hơn, không cần plugin.

**SOAP / JAX-WS**

- **Lý do**: SOAP và JAX-WS quá phức tạp, định dạng dữ liệu dài dòng (XML), không thân thiện với hiệu suất phát triển và performance.
- **Giải pháp thay thế**: RESTful API và RPC nhẹ hơn, hiệu quả hơn, là lựa chọn hàng đầu của kiến trúc microservice hiện đại.

**RMI (Remote Method Invocation)**

- **Lý do**: RMI là công nghệ gọi từ xa đời đầu của Java, nhưng tính tương thích kém, cấu hình rườm rà và performance khá tệ.
- **Giải pháp thay thế**: RESTful API và RPC cung cấp giải pháp gọi từ xa đơn giản, hiệu quả hơn, đã thay thế hoàn toàn RMI.

**Swing / JavaFX**

- **Lý do**: ứng dụng desktop giảm mạnh thị phần trong lĩnh vực phát triển, Web và mobile trở thành xu hướng chính. Hệ sinh thái của Swing và JavaFX không phong phú bằng các framework đa nền tảng hiện đại.
- **Giải pháp thay thế**: các framework desktop đa nền tảng (như Flutter Desktop, Electron) mang lại trải nghiệm hiện đại hơn.
- **Lưu ý**: một số project cũ của doanh nghiệp nhà nước có thể vẫn dùng Swing / JavaFX, nhưng trường hợp này ngày càng hiếm.

**Ant**

- **Lý do**: Ant là công cụ build dựa trên cấu hình XML, thiếu tính dễ dùng, cấu hình rườm rà.
- **Giải pháp thay thế**: Maven và Gradle cung cấp khả năng quản lý dependency và build project hiệu quả hơn, trở thành lựa chọn hàng đầu trong các công cụ build hiện đại.

## Tự kiểm tra bằng câu hỏi phỏng vấn

Học trên giấy rốt cuộc vẫn nông cạn, muốn hiểu thấu phải tự tay làm. Để giúp bạn nội hóa kiến thức tốt hơn, tôi đã chuẩn bị riêng một bộ câu hỏi phỏng vấn tần suất cao khớp hoàn toàn với lộ trình học này: [Bộ câu hỏi phỏng vấn tần suất cao đi kèm lộ trình học Java backend](https://t.zsxq.com/0eM78gbAr) (dành riêng cho [JavaGuide Knowledge Planet](https://javaguide.cn/about-the-author/zhishixingqiu-two-years.html)).

**Tài nguyên này giúp bạn:**

- **Tự kiểm tra:** kiểm chứng có hệ thống mức độ nắm vững từng điểm kiến thức.
- **Tìm và bù lỗ hổng:** kịp thời phát hiện điểm yếu của mình để củng cố có trọng tâm.
- **Phỏng vấn mô phỏng:** làm quen trước với nhịp độ phỏng vấn và các điểm thi tần suất cao.

Rất khuyến khích mọi người đẩy việc học lên mức sâu hơn bằng cách tự kiểm tra.

## Java core

### Java Basics

Nếu trước đây bạn chưa từng học lập trình, tôi khuyên bạn nên xem video hướng dẫn. Ví dụ [《Series giáo trình Java Basics》](https://www.bilibili.com/video/BV1PY411e7J6/) của Shang Silicon Valley và [《Học Java trong 30 ngày từ con số không》](https://www.bilibili.com/video/BV1fh411y7R8) của thầy Hàn Thuận Bình đều rất tốt.

![](https://oss.javaguide.cn/github/javaguide/interview-preparation/java-learning-route/20210409143842888.png)

👉 Tôi đã tổng hợp trọn bộ video hướng dẫn & tài liệu series học Java backend mới nhất của Shang Silicon Valley, bạn nào thích xem video có thể tải tại link này: [【Tổng hợp mới nhất】Trọn bộ giáo trình Java backend & project thực chiến của Shang Silicon Valley](https://mp.weixin.qq.com/s/jkZthmOSDgTF1PrCeNus_A) (khuyến nghị).

![](https://oss.javaguide.cn/github/javaguide/books/88714e9becd0485aae247772b6ed9949.png)

Vừa xem video vừa kèm một cuốn sách hay cũng rất có tác dụng.

Sách Java Basics chất lượng rất nhiều, ở đây tôi chỉ giới thiệu 3 cuốn.

**1. 《Head First Java》**

![《Head First Java》 - Douban](https://oss.javaguide.cn/github/javaguide/books/image-20220424103035793.png)

Nội dung cuốn 《Head First Java》 rất nhẹ nhàng thú vị, có thể nói là một trong những cuốn sách tôi thích nhất giai đoạn đầu học lập trình. Đồng thời đây cũng là cuốn sách khai tâm Java của tôi. Giai đoạn đầu học Java, nhờ cuốn sách này mà tôi mới bước được vào cánh cửa ngôn ngữ Java. Việc tôi trụ được với Java có công lớn của cuốn sách này. Rất nhiều bạn bè xung quanh tôi giai đoạn đầu học Java cũng đọc cuốn này.

Nhiều bạn sẽ hỏi: **cuốn này có phù hợp cho người mới học lập trình không?**

Cá nhân tôi thấy cuốn này khá phù hợp cho người mới học lập trình, dù sao cũng thuộc series "Head First".

**2. 《Java Core Technology tập 1 + tập 2》**

![《Java Core Technology tập 1》 - Douban](https://oss.javaguide.cn/github/javaguide/books/image-20220424101217849.png)

Hai cuốn 《Java Core Technology tập 1 + tập 2》 nội dung rất nhiều, đọc hết thì khá tốn thời gian, phù hợp làm sách tra cứu khi làm việc. Hồi đại học tôi mua hai cuốn để trong ký túc xá, rảnh thì giở ra xem. Cá nhân khuyên nên có chút nền tảng Java rồi hãy đọc hai cuốn này, chúng giới thiệu khá sâu và toàn diện.

**3. 《Logic của lập trình Java》**

《Logic của lập trình Java》 là một cuốn sách hay nhưng khá kín tiếng, so với sách nhập môn thì nội dung có chiều sâu hơn. Phù hợp cho người mới, đồng thời cũng phù hợp để mọi người ôn lại kiến thức Java Basics. Bài viết này có gợi ý cách đọc cuốn sách đó: [Chiêu trò lý thuyết phỏng vấn về Java Basics](https://mp.weixin.qq.com/s/UceEYGWM9qq9WvntV7y-Aw).

![《Logic của lập trình Java》](https://oss.javaguide.cn/github/javaguide/books/image-20230721153650488.png)

Sau khi học xong Java Basics, bạn có thể dùng những gì đã học để viết một chương trình Java đơn giản, hoặc thử dùng Java giải một số bài toán lập trình, qua đó đưa kiến thức đã học vào thực hành.

Không khuyến khích củng cố kiến thức bằng cách làm game sau khi học Java Basics. Tại sao các trung tâm đào tạo lại thích cách này? Nói thẳng ra là để đánh trúng điểm hưng phấn của bạn. Người mới học xong Java Basics mà làm game thì thường không thực tế lắm, chi bằng tìm vài bài toán lập trình đơn giản để giải, ví dụ các bài algorithm đơn giản.

Nhớ tổng kết nhiều! Xây nền cho chắc! Ghi lại những thứ quan trọng với mình. Để tài liệu API ở nơi mình nhìn thấy được để có thể tra cứu bất cứ lúc nào. Để viết được code tốt hơn, hai cuốn 《Effective Java》 và 《Refactoring》 rảnh cũng nên xem.

Sau khi học xong phần này, nhất định phải đảm bảo bạn nắm được các điểm kiến thức sau:

- Cú pháp cơ bản, kiểu dữ liệu cơ bản
- Object, class, interface
- Inheritance, generic
- Method
- Exception, assertion
- Collection
- ……

Trong quá trình học, rất khuyến khích kết hợp với phần tổng hợp các câu hỏi thường gặp và điểm kiến thức quan trọng của tôi (tiện thể còn chuẩn bị luôn được các câu hỏi phỏng vấn thường gặp):

- **Java Basics**:

  - [Tổng hợp câu hỏi phỏng vấn Java Basics thường gặp (phần 1)](https://javaguide.cn/java/basis/java-basic-questions-01.html) (khái niệm cơ bản của ngôn ngữ Java, cú pháp, kiểu dữ liệu, biến, method, v.v.)

  - [Tổng hợp câu hỏi phỏng vấn Java Basics thường gặp (phần 2)](https://javaguide.cn/java/basis/java-basic-questions-02.html) (nền tảng OOP, string, so sánh và copy object, v.v.)

  - [Tổng hợp câu hỏi phỏng vấn Java Basics thường gặp (phần 3)](https://javaguide.cn/java/basis/java-basic-questions-03.html) (exception, generic, reflection, SPI, serialization, annotation, v.v.)

- **Java Collection**:

  - [Tổng hợp câu hỏi phỏng vấn Java Collection thường gặp (phần 1)](https://javaguide.cn/java/collection/java-collection-questions-01.html) (nền tảng Java Collection, `ArrayList`, `LinkedList`, `HashSet`, `ArrayDeque`, `PriorityQueue`, `BlockingQueue`, v.v.)
  - [Tổng hợp câu hỏi phỏng vấn Java Collection thường gặp (phần 2)](https://javaguide.cn/java/collection/java-collection-questions-02.html) (`HashMap`, `ConcurrentHashMap`, v.v.)

### Java Concurrency (nâng cao)

Phần concurrency hay nói cách khác là multithreading sẽ hơi khó hiểu và khó thực hành một chút. Nếu bạn vừa học xong Java Basics, tôi khuyên khi học phần concurrency bạn có thể tìm hiểu sơ qua kiến thức cơ bản trước, ví dụ so sánh thread và process. Về sau, khi bạn hiểu Java sâu hơn rồi hãy quay lại xem kỹ phần này.

Về sách Java concurrency, có khá nhiều cuốn viết tốt, ví dụ 《Thực chiến thiết kế chương trình Java high concurrency》, 《Cái đẹp của lập trình concurrent Java》, 《Nguyên lý hiện thực concurrency trong Java: mổ xẻ source code JDK》.

![《Thực chiến thiết kế chương trình Java high concurrency》 - Douban](https://oss.javaguide.cn/github/javaguide/books/image-20220424112554830.png)

![《Cái đẹp của lập trình concurrent Java》 - Douban](https://oss.javaguide.cn/github/javaguide/books/image-20220424112413660.png)

![《Nguyên lý hiện thực concurrency trong Java: mổ xẻ source code JDK》 - Douban](https://oss.javaguide.cn/github/javaguide/books/0b1b046af81f4c94a03e292e66dd6f7d.png)

Muốn học có hệ thống thì vẫn nên chọn ra một cuốn trong số đó để đọc nghiêm túc. Tất nhiên, bạn cũng có thể chọn nhiều cuốn kết hợp đọc cùng nhau, gặp điểm kiến thức không hiểu thì xem giải thích ở sách khác hoặc tìm bài blog tương ứng.

Về video, vẫn khuyến nghị bài giảng của thầy Chu Dương ở Shang Silicon Valley: [Video giáo trình lập trình concurrent Java](https://www.bilibili.com/video/BV1ar4y1x727/).

👉 Tôi đã tổng hợp trọn bộ video hướng dẫn & tài liệu series học Java backend mới nhất của Shang Silicon Valley, bạn nào thích xem video có thể tải tại link này: [【Tổng hợp mới nhất】Trọn bộ giáo trình Java backend & project thực chiến của Shang Silicon Valley](https://mp.weixin.qq.com/s/jkZthmOSDgTF1PrCeNus_A) (khuyến nghị).

![](https://oss.javaguide.cn/github/javaguide/books/88714e9becd0485aae247772b6ed9949.png)

Trong quá trình học, rất khuyến khích kết hợp với phần tổng hợp các câu hỏi thường gặp và điểm kiến thức quan trọng của tôi:

- [Tổng hợp câu hỏi phỏng vấn Java Concurrency thường gặp (phần 1)](https://javaguide.cn/java/concurrent/java-concurrent-questions-01.html) (kiến thức multithreading cơ bản, ví dụ khái niệm thread và process, deadlock)
- [Tổng hợp câu hỏi phỏng vấn Java Concurrency thường gặp (phần 2)](https://javaguide.cn/java/concurrent/java-concurrent-questions-02.html) (các loại lock, ví dụ optimistic lock và pessimistic lock, keyword `synchronized`, `ReentrantLock`)
- [Tổng hợp câu hỏi phỏng vấn Java Concurrency thường gặp (phần 3)](https://javaguide.cn/java/concurrent/java-concurrent-questions-03.html) (`ThreadLocal`, thread pool, `Future`, AQS, virtual thread, v.v.)

### JVM (nâng cao)

JVM thuộc nội dung cao cấp hơn concurrency một bậc, thứ tự học có thể lùi lại một chút, ví dụ bạn có thể quay lại xem JVM sau khi học xong phần framework. Ngoài ra, các điểm kiến thức liên quan đến JVM thường chỉ được hỏi khi phỏng vấn công ty lớn (ví dụ Meituan, Alibaba) và một số công ty tầm trung tốt (ví dụ Ctrip, SF Express, CMB Network); phỏng vấn doanh nghiệp nhà nước, công ty tầm trung yếu hơn và công ty nhỏ thì không cần chuẩn bị.

Tuy nhiên, cá nhân tôi khuyên nếu bạn còn dư sức thì vẫn nên dành thời gian học, vẫn có ích. Đúng như câu nói, chỉ khi hiểu rõ JVM bạn mới có khả năng thực sự "thấm" được ngôn ngữ Java.

Trong công việc thực tế, công ty vừa và nhỏ thường không làm JVM tuning, nhưng lỡ gặp vấn đề kiểu OOM, nếu bạn biết cách truy vết và xử lý thì chẳng phải tốt hơn sao?

Học phần JVM này nhất định phải chú ý kết hợp thực chiến với lý thuyết.

Về sách, 《Hiểu sâu về Java Virtual Machine》 là cuốn đầu tiên cần giới thiệu.

![《Hiểu sâu về Java Virtual Machine》 - Douban](https://oss.javaguide.cn/github/javaguide/books/20210710104655705.png)

Cuốn sách này chỉ cần một câu để mô tả: **hàng khủng trong các sách nội địa, xuất sắc thực sự!** (thực lòng mong trong nước có thêm nhiều sách chất lượng như vậy! Cố lên! 💪)

Phiên bản thứ ba của cuốn này đã ra khá lâu, bổ sung nhiều nội dung hay ví dụ như phân tích nguyên lý của thế hệ GC mới như ZGC.

Dù bạn đi phỏng vấn hay muốn học sâu hơn trong lĩnh vực Java, bạn đều không thể thiếu cuốn sách này. Cuốn này không chỉ cần đọc mà còn nên đọc nhiều lần, bên trong toàn nội dung giá trị. Trong sách còn có một số thứ cần tự thực hành, tôi khuyên bạn cũng nên thực hành theo.

Các cuốn tương tự còn có 《Thực chiến Java Virtual Machine》, 《Thiết kế và hiện thực virtual machine: lấy JVM làm ví dụ》, cả hai đều rất tốt!

![《Thực chiến Java Virtual Machine》 - Douban](https://oss.javaguide.cn/github/javaguide/books/image-20220424113158144.png)

![《Thiết kế và hiện thực virtual machine: lấy JVM làm ví dụ》 - Douban](https://oss.javaguide.cn/github/javaguide/books/image-20220424113210153.png)

Nếu bạn hứng thú với thực chiến, muốn tự tay viết một JVM đơn giản, có thể xem cuốn 《Tự tay viết Java Virtual Machine》.

![《Tự tay viết Java Virtual Machine》 - Douban](https://oss.javaguide.cn/github/javaguide/books/image-20220424113445246.png)

Code trong sách được hiện thực bằng ngôn ngữ Go; sau khi hiểu nguyên lý, bạn có thể dùng Java mô phỏng viết lại một bản, cũng coi như luyện tay! Nếu hiện tại bạn chưa đủ khả năng tự mình dùng Java viết lại, bạn cũng có thể tìm trên mạng rất nhiều bản hiện thực bằng Java, ví dụ [《Series tự viết JVM của zachaxy》](https://zachaxy.github.io/tags/JVM/).

Ngoài ra, bài viết [《Học hiện thực JVM từ ngoài vào trong》](https://www.douban.com/doulist/2545443/) mà R đại đăng trên Douban cũng giới thiệu rất nhiều sách hay về JVM, khuyến khích mọi người xem thử.

Về video, [《Trọn bộ giáo trình JVM》](https://www.bilibili.com/video/BV1PJ411n7xZ) do thầy Tống Hồng Khang của Shang Silicon Valley giảng có nội dung rất chắc, tổng cộng gần 400 phần nhỏ (bản cô đọng tương ứng: [《Giáo trình giảng sâu JVM và GC tuning của Shang Silicon Valley》](https://www.bilibili.com/video/BV1Dz4y1A7FB/)).

Nội dung khóa học chia làm 3 phần:

1. 《Bộ nhớ và garbage collection》
2. 《Bytecode và class loading》
3. 《Giám sát performance và tuning》

![](https://oss.javaguide.cn/github/javaguide/interview-preparation/java-learning-route/20210409181534319.png)

👉 Tôi đã tổng hợp trọn bộ video hướng dẫn & tài liệu series học Java backend mới nhất của Shang Silicon Valley, bạn nào thích xem video có thể tải tại link này: [【Tổng hợp mới nhất】Trọn bộ giáo trình Java backend & project thực chiến của Shang Silicon Valley](https://mp.weixin.qq.com/s/jkZthmOSDgTF1PrCeNus_A) (khuyến nghị).

![](https://oss.javaguide.cn/github/javaguide/books/88714e9becd0485aae247772b6ed9949.png)

Trong quá trình học, rất khuyến khích kết hợp với phần tổng hợp các câu hỏi thường gặp và điểm kiến thức quan trọng của tôi:

- [Giải thích chi tiết vùng nhớ Java (trọng điểm)](https://javaguide.cn/java/jvm/memory-area.html)
- [Giải thích chi tiết garbage collection trong JVM (trọng điểm)](https://javaguide.cn/java/jvm/jvm-garbage-collection.html)
- [Giải thích chi tiết cấu trúc file class](https://javaguide.cn/java/jvm/class-file-structure.html)
- [Giải thích chi tiết quá trình class loading](https://javaguide.cn/java/jvm/class-loading-process.html)
- [Giải thích chi tiết class loader (trọng điểm)](https://javaguide.cn/java/jvm/classloader.html)

## Database

### Cơ bản (tùy chọn)

Kiến thức cơ bản về database thực ra có thể học tùy chọn. Với sinh viên ngành máy tính, hồi đại học chắc cũng đã học rồi. Tuy nhiên, đa phần học xong cũng như không, ai chưa học cũng không cần lo!

Ở đây vẫn cung cấp một số tài liệu học cho các bạn muốn học kiến thức cơ bản về database.

Về sách, rất khuyến nghị 《Database System Concepts》, cuốn này bao phủ trọn bộ khái niệm của database system, hệ thống kiến thức rõ ràng, là giáo trình kinh điển để học database system! Không phải sách tham khảo!

![](https://oss.javaguide.cn/github/javaguide/booksimage-20220409150441742.png)

Nếu bạn thấy sách hơi khô khan, tự mình không kiên trì nổi, tôi khuyên bạn nên xem một số video tốt trước. Ví dụ [《Nguyên lý database system》](https://www.icourse163.org/course/BNU-1002842007) của Đại học Sư phạm Bắc Kinh rất hay.

Giảng viên khóa này giảng rất chi tiết, bài tập mỗi phần nhỏ cũng bám sát kiến thức đã dạy, phía sau còn có nhiều bài thực hành đi kèm.

![](https://oss.javaguide.cn/github/javaguide/books/up-e113c726a41874ef5fb19f7ac14e38e16ce.png)

Nếu bạn thích thực hành, khá dị ứng với lý thuyết, tôi khuyên bạn xem [《Làm thế nào để phát triển một database đơn giản》](https://cstack.github.io/db_tutorial/), project này sẽ hướng dẫn bạn từng bước viết một database đơn giản.

![](https://oss.javaguide.cn/github/javaguide/books/up-11de8cb239aa7201cc8d78fa28928b9ec7d.png)

Học trên giấy rốt cuộc vẫn nông cạn, muốn hiểu thấu phải tự tay làm! Rất khuyến khích các bạn ngành CS nhất định phải thực hành thật nhiều!!!

### MySQL

Với Java development, tuy PostgreSQL cũng khá hot, nhưng MySQL mới là chủ đạo, đa phần doanh nghiệp trong nước vẫn dùng MySQL.

Nhập môn MySQL có thể tìm vài video xem, ví dụ [《MySQL Database từ nhập môn đến tinh thông》](https://www.bilibili.com/video/BV1Kr4y1i7ru/) của Heima. Trong lúc xem video, có thể kèm một cuốn sách nhập môn MySQL ví dụ [《MySQL Crash Course》](https://book.douban.com/subject/3354490/).

Giai đoạn đầu không cần học quá sâu, nắm được các điểm kiến thức sau là được:

1. Các lệnh thường dùng của MySQL:

   - Bảo mật: đăng nhập, thêm/xóa user, backup và restore dữ liệu
   - Thao tác database: tạo/xóa database và table, phân quyền user
   - ……

2. Các kiểu dữ liệu và character set encoding thường dùng trong MySQL
3. Truy vấn đơn giản, truy vấn có điều kiện, truy vấn mờ, truy vấn nhiều table cũng như cách sắp xếp, lọc, gom nhóm kết quả truy vấn……
4. Dùng index, view, stored procedure, cursor, trigger trong MySQL
5. ……

Đi xa hơn nữa, có thể tìm vài cuốn sách hay để học nguyên lý bên trong và tối ưu performance, ví dụ [《High Performance MySQL》](https://book.douban.com/subject/23008813/) và [《MySQL Technology Insider》](https://book.douban.com/subject/24708143/).

![](https://oss.javaguide.cn/github/javaguide/books/up-3d31e762933f9e50cc7170b2ebd8433917b.png)

Ngoài ra, giới thiệu mạnh cuốn [《MySQL vận hành như thế nào》](https://book.douban.com/subject/35231266/), nội dung rất phù hợp để chuẩn bị phỏng vấn. Giảng rất chi tiết nhưng không khô khan, nội dung rất tâm huyết!

![](https://oss.javaguide.cn/github/javaguide/csdn/20210703120643370.png)

Nếu bạn muốn hiểu MySQL nhiều hơn, đồng thời cũng để chuẩn bị phỏng vấn, các điểm kiến thức sau cần đặc biệt lưu ý:

1. Index: ưu/nhược điểm của index, B tree và B+ tree, clustered index và non-clustered index, covering index
2. Transaction: transaction, database transaction, ACID, concurrent transaction, isolation level
3. Storage engine (MyISAM và InnoDB)
4. Cơ chế lock và thuật toán lock của InnoDB

Trong quá trình học, rất khuyến khích kết hợp với phần tổng hợp các câu hỏi thường gặp và điểm kiến thức quan trọng của tôi:

- [Tổng hợp câu hỏi phỏng vấn MySQL thường gặp](https://javaguide.cn/database/mysql/mysql-questions-01.html) (MySQL cơ bản, storage engine, transaction, index, lock, tối ưu performance, v.v.)
- [Giải thích chi tiết index trong MySQL](https://javaguide.cn/database/mysql/mysql-index.html)
- [Giải thích chi tiết ba loại log của MySQL (binlog, redo log và undo log)](https://javaguide.cn/database/mysql/mysql-logs.html)
- [Giải thích chi tiết isolation level của transaction MySQL](https://javaguide.cn/database/mysql/transaction-isolation-level.html)
- [Cách storage engine InnoDB hiện thực MVCC](https://javaguide.cn/database/mysql/innodb-implementation-of-mvcc.html)
- [Quá trình thực thi câu lệnh SQL trong MySQL](https://javaguide.cn/database/mysql/how-sql-executed-in-mysql.html)

### PostgreSQL (tùy chọn)

Giống MySQL, PostgreSQL cũng là relational database mã nguồn mở, miễn phí và mạnh mẽ. Slogan của PostgreSQL là "**relational database mã nguồn mở tiên tiến nhất thế giới**".

![](https://oss.javaguide.cn/github/javaguide/books/image-20220702144954370.png)

Khách quan mà nói, PostgreSQL đúng là ưu việt hơn MySQL. Tuy nhiên, hiện tại ở Trung Quốc MySQL vẫn là chủ đạo, PostgreSQL thuộc diện học tùy chọn.

Tài liệu tiếng Trung của PostgreSQL nên xem: [Tài liệu tiếng Trung PostgreSQL 14](http://www.postgres.cn/docs/14/index.html). Ngoài ra, về sách PostgreSQL, xem gợi ý tại đây là được: [Gợi ý sách database: PostgreSQL](https://javaguide.cn/books/database.html#postgresql).

### Redis

Nếu project backend có dùng distributed cache thì thường là dùng Redis. Tuy nhiên, Redis không chỉ làm được cache, nó còn dùng làm distributed lock, delay queue, message queue, v.v.

Về video miễn phí, khuyến nghị [Giáo trình Redis một giờ](https://www.imooc.com/learn/839) của GeekHour (rất khuyến nghị, dễ hiểu, giới thiệu ngắn gọn phần lớn điểm kiến thức của Redis) và [《Series video Redis 7 mới nhất》](https://www.bilibili.com/video/BV13R4y1v7sP/) của Shang Silicon Valley (do thầy Dương làm, nội dung toàn diện hơn, phiên bản Redis mới hơn, rất khuyến nghị).

Về sách, rất khuyến nghị hai cuốn [《Thiết kế và hiện thực Redis》](https://book.douban.com/subject/25900156/) và 《Nguyên lý cốt lõi và thực hành Redis》. Cuốn [《Nguyên lý cốt lõi và thực hành Redis》](https://book.douban.com/subject/26612779/) có ngày xuất bản tương đối gần đây hơn, chủ yếu kết hợp source code để phân tích các điểm kiến thức quan trọng của Redis như các cấu trúc dữ liệu và tính năng nâng cao.

![《Thiết kế và hiện thực Redis》 và 《Thiết kế và hiện thực Redis》](https://oss.javaguide.cn/github/javaguide/books/redis-books.png)

Về chuyên mục trả phí, khuyến nghị [《Công nghệ cốt lõi và thực chiến Redis》](https://time.geekbang.org/column/intro/100056701?utm_campaign=geektime_search&utm_content=geektime_search&utm_medium=geektime_search&utm_source=geektime_search&utm_term=geektime_search) của Geek Time. Tuy chưa đề cập nhiều nội dung của Redis phiên bản mới, nhưng thắng ở chỗ nội dung toàn diện và rõ ràng dễ hiểu. Hồi đó tôi xem chuyên mục này đúng là học được không ít, nhất là khu bình luận có rất nhiều bình luận hay từ các cao thủ.

Trong quá trình học, rất khuyến khích kết hợp với phần tổng hợp các câu hỏi thường gặp và điểm kiến thức quan trọng của tôi:

- [Tổng hợp câu hỏi phỏng vấn cache cơ bản thường gặp](https://javaguide.cn/database/redis/cache-basics.html)
- [Tổng hợp câu hỏi phỏng vấn Redis thường gặp (phần 1)](https://javaguide.cn/database/redis/redis-questions-01.html)
- [Tổng hợp câu hỏi phỏng vấn Redis thường gặp (phần 2)](https://javaguide.cn/database/redis/redis-questions-01.html)
- [Giải thích chi tiết 5 kiểu dữ liệu cơ bản của Redis](https://javaguide.cn/database/redis/redis-data-structures-01.html)
- [Giải thích chi tiết 3 kiểu dữ liệu đặc biệt của Redis](https://javaguide.cn/database/redis/redis-data-structures-02.html)
- [Giải thích chi tiết cơ chế persistence của Redis](https://javaguide.cn/database/redis/redis-persistence.html)
- [Giải thích chi tiết memory fragmentation trong Redis](https://javaguide.cn/database/redis/redis-memory-fragmentation.html)

### MongoDB (tùy chọn)

Với Java backend development, MongoDB thuộc diện học tùy chọn, ít dùng, phỏng vấn thường cũng không hỏi, trừ khi project của bạn có dùng MongoDB.

Ở đây không giới thiệu video hay sách, chỉ giới thiệu hai bài viết tôi viết:

- [Tổng hợp câu hỏi phỏng vấn MongoDB thường gặp (phần 1)](https://javaguide.cn/database/mongodb/mongodb-questions-01.html)
- [Tổng hợp câu hỏi phỏng vấn MongoDB thường gặp (phần 2)](https://javaguide.cn/database/mongodb/mongodb-questions-02.html)

## Công cụ phát triển thường dùng

Rất quan trọng! Rất quan trọng! Đặc biệt là Git và Docker.

Ngoài các công cụ bên dưới, tôi rất khuyến khích bạn nhất định phải nắm được cách dùng GitHub. Một số mẹo nhỏ khi dùng GitHub, bạn có thể xem bài [Mẹo nhỏ với GitHub](https://javaguide.cn/tools/git/github-tips.html).

### IDEA

Người ta nói: "muốn làm tốt việc, trước hết phải mài sắc công cụ!". Chọn được công cụ phát triển tốt rất có ích cho việc code hiệu suất cao!

Công cụ phát triển Java thường dùng chỉ có Eclipse và IDEA. Cá nhân tôi thấy IDEA là IDE phù hợp nhất cho Java developer, không có cái thứ hai (đừng cãi, cái bạn thích chính là cái tốt nhất).

Ngoài việc bản thân IDEA hỗ trợ code rất tốt (ví dụ gợi ý theo ngữ cảnh thông minh), trong IDEA còn có rất nhiều plugin giúp chúng ta phát triển hiệu quả.

Vài năm gần đây, các AI coding IDE như Cursor nổi lên, đúng là có tác động nhất định đến IDEA. Nhưng nhìn tổng thể, IDEA vẫn khó bị thay thế. Dù là trải nghiệm phát triển hay khả năng refactor code, IDEA đều có ưu thế không gì sánh bằng. Tất nhiên, ở mảng AI hỗ trợ code, IDEA thể hiện đúng là có phần tụt lại. Phải biết rằng trước đây gợi ý code thông minh vốn là sở trường của nó.

[Tài liệu tiếng Trung chính thức của IntelliJ IDEA năm nay đã chính thức lên sóng](https://mp.weixin.qq.com/s/GT-zQHLOBB25ZRf1nyyt2Q), rất khuyến nghị lấy đây làm tài liệu gốc.

**Lối vào tài liệu tiếng Trung chính thức của IDEA**: **<https://www.jetbrains.com/zh-cn/help/idea/getting-started.html>**

Ngoài ra, [「Hướng dẫn sử dụng IDEA hiệu quả」](https://idea.javaguide.cn/) là một website tôi tạo ra, bên trên có các nội dung sau:

- Mẹo sử dụng IDEA
- Plugin IDEA cần có
- Nhập môn phát triển plugin IDEA
- Mẹo refactor bằng IDEA
- Mẹo đọc source code bằng IDEA

![Trang chủ website 「Hướng dẫn sử dụng IDEA hiệu quả」](https://oss.javaguide.cn/github/awesome-idea-tutorial/awesome-idea-tutorial-website-homepage%20%20%20%20%20%20.png)

### Maven

Maven thực ra dùng khá đơn giản, một hai ngày là nhập môn được cách dùng cơ bản. Tuy nhiên, muốn dùng cho giỏi thì khá khó, giai đoạn đầu chỉ cần biết dùng cơ bản là được.

Nói thêm một câu: trước khi học các framework thường dùng, có thể bỏ thời gian học trước cách dùng Maven, tuyệt đối đừng đi tìm và tải Jar khắp nơi (nếu project bạn đang làm không dùng công cụ quản lý package thì hãy nhanh chóng đổi sang giáo trình mới hơn).

Phần Maven này không cần giới thiệu video hay sách gì, xem trực tiếp mấy bài dưới đây là được:

- [Tổng hợp khái niệm cốt lõi của Maven](https://javaguide.cn/tools/maven/maven-core-concepts.html)
- [Best practice cho Maven](https://javaguide.cn/tools/maven/maven-best-practices.html)
- [Bốn mươi lăm hình, mười lăm nghìn chữ! Một bài giúp bạn thoát mê cung và làm chủ Maven!](https://juejin.cn/post/7238823745828405308)

Sau khi học xong, nhất định phải hiểu được các câu hỏi sau (người mới hiểu hai câu đầu là được):

1. Project Maven tạo thế nào? Thêm dependency thế nào?
2. Xung đột dependency của Maven giải quyết thế nào?
3. Project Maven nhiều module thì build, chạy, đóng gói thế nào?
4. Private repository của Maven dựng thế nào?

### Git

Kỹ năng Git cũng là thứ bắt buộc phải có với lập trình viên! Hãy thử host code của mình lên GitHub trong quá trình học, có một trang GitHub đẹp sẽ cộng điểm rất nhiều khi phỏng vấn xin việc. Hơn nữa, các doanh nghiệp hiện nay đều làm version control dựa trên Git trên nền tảng GitHub hoặc GitLab.

Về học Git, rất khuyến nghị website học Git tương tác [Learn Git Branching](https://learngitbranching.js.org/ "Learn Git Branching"). Hiệu quả thực sự rất rất tốt, cho bạn học các thao tác Git thường gặp theo kiểu chơi game.

Toàn bộ giáo trình chia thành nhiều màn, mỗi màn đều có hướng dẫn rất chi tiết, còn có ảnh động minh họa kết quả chi tiết. Hơn nữa, làm sai rồi bạn vẫn có thể dùng lệnh `reset` để bắt đầu lại từ đầu.

![](https://oss.javaguide.cn/github/javaguide/interview-preparation/java-learning-route/20210423182350378.png)

Nếu bạn thực sự không biết đáp án, còn có thể dùng lệnh `show solution` để xem đáp án.

![](https://oss.javaguide.cn/github/javaguide/interview-preparation/java-learning-route/20210423181725451.png)

Kiểu học có phản hồi tức thì này làm quá trình học trở nên thú vị! Thực lòng cảm ơn tác giả website này, quá thích!

Ngoài ra, bạn có thể xem bài [Nhập môn Git cực gọn](https://javaguide.cn/tools/git/git-intro.html), các khái niệm về version control và Git, các thao tác Git thường gặp đều được giới thiệu trong bài này.

Nếu muốn tìm hiểu Git chi tiết, bạn có thể xem cuốn [《Pro Git》](https://www.progit.cn/ "《Pro Git》"), giới thiệu rất toàn diện, miễn phí, hỗ trợ đọc online và có bản tiếng Trung!

![](https://oss.javaguide.cn/github/javaguide/interview-preparation/java-learning-route/20210423183640734.png)

![](https://oss.javaguide.cn/github/javaguide/interview-preparation/java-learning-route/20210423183749743.png)

Đây là một địa chỉ đọc online khác của cuốn sách này: <https://git-scm.com/book/zh/v2>.

Nếu bạn thích xem video hướng dẫn hơn, có thể xem [《Làm chủ bộ ba Git》](http://gk.link/a/10qcT) của Geek Time, tác giả khóa học là Tô Linh, phụ trách nền tảng code của Ctrip, giảng khá tốt!

### Docker

Trong quy trình phát triển truyền thống, project của chúng ta thường cần các môi trường như MySQL, Redis, FastDFS, v.v., những môi trường này đều phải tự tay tải về và cấu hình, quy trình cài đặt cấu hình cực kỳ phức tạp, mà thao tác trên các hệ điều hành khác nhau cũng không giống nhau.

Sự xuất hiện của Docker đã giải quyết hoàn hảo vấn đề này, chúng ta có thể cài các phần mềm như MySQL, Redis trong container, tách ứng dụng ra khỏi kiến trúc môi trường. Ưu thế của nó là:

1. Môi trường chạy nhất quán, dễ dàng di chuyển hơn
2. Đóng gói và cô lập process, các container không ảnh hưởng lẫn nhau, tận dụng tài nguyên hệ thống hiệu quả hơn
3. Có thể sao chép ra nhiều container giống hệt nhau thông qua image

Về giải thích các khái niệm Docker thường gặp, có thể xem bài [Giải thích khái niệm cơ bản về Docker](https://javaguide.cn/tools/docker/docker-intro.html) của JavaGuide; từ con số không đến thực chiến có thể xem bài [Docker từ nhập môn đến làm việc thật](https://javaguide.cn/tools/docker/docker-in-action.html), nội dung rất chi tiết!

Ngoài ra, giới thiệu thêm một cuốn sách mã nguồn mở chất lượng rất cao [《Docker từ nhập môn đến thực hành》](https://yeasy.gitbook.io/docker_practice/introduction/why), nội dung cuốn này rất mới, dù sao nội dung sách là mã nguồn mở nên có thể cải tiến bất cứ lúc nào.

![Trang chủ website 《Docker từ nhập môn đến thực hành》](https://oss.javaguide.cn/github/javaguide/tools/docker/docker-getting-started-practice-website-homepage.png)

Nếu muốn xem video, khuyến nghị cái này: [Giáo trình Docker nhập môn nhanh trong 1 giờ](https://www.bilibili.com/video/BV11L411g7U1/), không có lời thừa, nội dung giá trị khá nhiều. Hơn nữa, slide bài giảng cũng được chia sẻ miễn phí: [Slide giáo trình Docker 1 giờ](https://docker.easydoc.net/doc/81170005/cCewZWoN/lTKfePfP).

![Giáo trình Docker nhập môn nhanh trong 1 giờ](https://oss.javaguide.cn/github/javaguide/interview-preparation/java-learning-route/docker-1-hour-quick-start-guide.png)

Cuối cùng, sau khi học xong các thao tác Docker thường gặp, khuyên mọi người lấy một project tách frontend-backend làm ví dụ để thực hành deploy. Ví dụ, bạn có thể chọn deploy chính project CV của mình, như vậy phần kinh nghiệm project có thể đính kèm địa chỉ trải nghiệm online, cũng là một điểm cộng!

## Design pattern

Trong phát triển phần mềm có một khái niệm gọi là "**tái sử dụng phần mềm**". Nói đơn giản, tái sử dụng phần mềm là khi xây dựng một phần mềm mới, chúng ta không cần bắt đầu từ con số không; bằng cách tái sử dụng các bánh xe có sẵn (framework, thư viện bên thứ ba, v.v.), **design pattern**, nguyên tắc thiết kế và các vật liệu có sẵn khác, chúng ta có thể xây dựng nhanh hơn một phần mềm đáp ứng yêu cầu.

Tái sử dụng phần mềm cần sự trợ giúp của design pattern. Bởi vì trong phát triển phần mềm, design pattern có thể nâng cao khả năng mở rộng và khả năng bảo trì của code thông qua việc đóng gói phần thay đổi!

Trong công việc phát triển nghiệp vụ hằng ngày, nếu bạn không biết design pattern, có lẽ bạn vẫn hoàn thành được yêu cầu chức năng của project. Nhưng! Chỉ CRUD thuần túy thì chán biết bao nhiêu! Chúng ta cần suy nghĩ cách viết code nghiệp vụ chất lượng cao hơn. Ngoài ra, các framework như Spring, MyBatis đều dùng rất nhiều design pattern. Nếu bạn muốn hiểu nguyên lý của chúng, design pattern cũng là vũ khí bắt buộc phải có.

Design pattern không chỉ cần học mà quan trọng nhất là phải liên tục thực hành và cảm nhận. Nhưng! Design pattern không phải viên đạn bạc, **đừng dùng design pattern chỉ để dùng design pattern**.

Nếu muốn học design pattern qua sách, ưu tiên hàng đầu là 《Học lại Java Design Pattern》. Ví dụ thú vị, kèm hình ảnh sinh động, cách giảng design pattern qua case thực chiến tuyệt vời! Mỗi chi tiết trong sách đều toát lên sự tâm huyết của tác giả! Thực ra mỗi design pattern đều không khó hiểu, thứ đa số độc giả cần nhất là kinh nghiệm thực chiến với design pattern. Nếu bạn có thể tỉ mỉ suy nghĩ và thực hành từng case trong 《Học lại Java Design Pattern》, tôi tin hiểu biết của bạn về design pattern nhất định sẽ lên một tầm cao mới!

![](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/b4da6f8cc0cf4a8e8238d3d8671e0462~tplv-k3u1fbpfcp-watermark.image)

Nếu muốn học qua video, ưu tiên hàng đầu là video [《Java Design Pattern của Shang Silicon Valley (giải thích bằng hình + mổ xẻ source code framework)》](https://www.bilibili.com/video/BV1G4411c7N4).

![](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/029687d24c7b4882ba81b5b629c323a1~tplv-k3u1fbpfcp-watermark.image)

Video này giảng toàn diện các nội dung liên quan đến design pattern thông qua cách giải thích bằng hình + phân tích source code framework, bao gồm bảy nguyên tắc lớn của design pattern, sơ đồ lớp UML - sáu quan hệ lớn giữa các class, 23 design pattern và cách phân loại chúng.

## Linux

Với lập trình viên Java, chúng ta cần nắm được cách dùng Linux cơ bản, đặc biệt là các lệnh thường dùng như: lệnh chuyển thư mục, lệnh thao tác thư mục, lệnh thao tác file, lệnh nén hoặc giải nén file, v.v. Còn các nội dung tầng dưới như kiến trúc kernel Linux, nguyên lý bên trong thì không bắt buộc, có thể tùy tình hình bản thân mà quyết định học hay không.

Với các bạn muốn nhập môn Linux nhanh, khuyên đọc bài [Tổng hợp kiến thức cơ bản về Linux](https://javaguide.cn/cs-basics/operating-system/linux-intro.html) tôi viết, trong đó giới thiệu một số khái niệm Linux mà lập trình viên Java phải biết cùng các lệnh thường gặp.

Về video, tôi khuyến nghị [Giáo trình nhập môn Linux 30 phút](https://www.bilibili.com/video/BV1cq421w72c) của GeekHour, dễ hiểu, giảng theo hướng thực chiến! Tuy nhiên, nội dung tương đối thiên về cơ bản, phù hợp cho bạn nào muốn nhập môn nhanh.

Với các bạn muốn học có hệ thống, vẫn khuyên xem sách, ví dụ series 《Bếp riêng Linux của anh Chim》 khá tốt. Tuy nhiên, nội dung hơi quá nhiều, cá nhân tôi khuyên nên xem như sách tra cứu hoặc chọn các chương nội dung mình quan tâm để học.

![](https://oss.javaguide.cn/github/javaguide/books/linux-private-kitchen-basic-learning.png)

Đừng quên học Shell programming, đây cũng là thứ bắt buộc phải nắm; nhập môn nhanh có thể đọc bài [Tổng hợp kiến thức cơ bản về Shell programming](https://javaguide.cn/cs-basics/operating-system/shell-intro.html) tôi viết, tổng hợp các điểm kiến thức quan trọng như biến Shell, toán tử cơ bản, điều khiển luồng, function.

## Nền tảng frontend

Tác giả chủ yếu làm Java backend, hiểu biết về frontend chỉ ở mức sơ sài, vừa mới nhập môn (từng làm full-stack một năm), ở đây chỉ chia sẻ đơn giản quan điểm của mình.

Framework frontend thay đổi rất nhanh, hiện tại khá phổ biến là Vue và React. Với các bạn ở Trung Quốc, Vue phù hợp hơn để bỏ công sức học, vì công ty trong nước dùng Vue nhiều hơn. Tuy nhiên, framework frontend không bắt buộc phải học, có thể tùy tình hình bản thân mà quyết định.

Nhưng dù công nghệ frontend thay đổi thế nào, bộ ba frontend (HTML, CSS, JavaScript) sẽ không đổi, và cũng bắt buộc phải học.

HTML và CSS so với JS thì đơn giản hơn. Bạn có thể học một số kiến thức cơ bản về HTML, CSS, JS trên [W3school](http://www.w3school.com.cn/). Sau đó thực hành qua một project frontend đơn giản. Ví dụ bạn có thể làm một CV cá nhân hoặc mô phỏng trang chủ chính thức nào đó để viết một trang web tương tự.

JavaScript thì sâu hơn nhiều, cũng là trọng tâm trong phỏng vấn frontend.

Học JS thì nội dung liên quan đến JS trên [MDN](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript) là bắt buộc phải xem! Nội dung trên đó rất toàn diện, chất lượng rất cao!

Ngoài ra, giáo trình JS mã nguồn mở [《The Modern JavaScript Tutorial》](https://javascript.info/) rất tuyệt! Hiện tại, series giáo trình này còn được dịch ra nhiều thứ tiếng.

![](https://oss.javaguide.cn/github/javaguide/interview-preparation/java-learning-route/20210409151045407.png)

Nội dung giáo trình này chia làm 3 phần:

1. Ngôn ngữ lập trình JavaScript: nhập môn JavaScript, còn giới thiệu các khái niệm nâng cao như OOP.
2. Trình duyệt (document, event, interface): học cách quản lý trang trên trình duyệt.
3. Các bài khác: học các kiến thức JavaScript nâng cao khác theo nhu cầu.

Ngoài ra, ngoại trừ một số project cũ, hiện nay thường là phát triển tách frontend-backend, tức frontend và backend có thể phát triển, test và deploy độc lập, hai bên giao tiếp với nhau qua API. Do đó, lập trình viên backend còn cần nắm:

- Giao thức HTTP (nội dung thuộc phần computer network, ở đây nhắc thêm)
- Thiết kế và sử dụng RESTful API
- Các cách giao tiếp frontend-backend thường gặp: ví dụ Ajax (kết nối ngắn), WebSocket (kết nối dài, hai chiều)

## Nền tảng J2EE

### Servlet

`Servlet` thuộc công nghệ khá cũ, hiện nay bạn gần như sẽ không trực tiếp dùng các API liên quan đến `Servlet`. Tuy nhiên, học `Servlet` giúp chúng ta hiểu rõ nguyên lý của các Web framework được đóng gói tốt, ví dụ `Spring MVC` chẳng qua là lớp đóng gói của `Servlet`, tầng dưới của nó vẫn phụ thuộc vào `Servlet`.

Trong chương trình Java Web, `Servlet` chủ yếu chịu trách nhiệm nhận request `HttpServletRequest` của user, xử lý tương ứng trong `doGet()`, `doPost()`, rồi trả response `HttpServletResponse` về cho user.

Bạn có thể học kiến thức cơ bản về Servlet qua sách 《Head First Servlets & JSP (bản tiếng Trung)》 hoặc 《Hướng dẫn học Servlet và JSP》.

**Lưu ý**: JSP thì đừng học nữa, công nghệ lỗi thời, đã bị đào thải rồi!

### Web server

Tomcat là một project thuộc quỹ Apache, chủ yếu dùng làm Web server.

Nếu bạn học thẳng Spring Boot thì không học Tomcat cũng không ảnh hưởng gì (vẫn khuyên nên học). Vì Spring Boot (`spring-boot-starter-web`) dùng Tomcat làm embedded `Servlet` container mặc định, bạn dùng mà không hề cảm nhận được.

Nói đơn giản, Tomcat chủ yếu hiện thực 2 chức năng cốt lõi:

1. Xử lý kết nối `Socket`, chịu trách nhiệm chuyển đổi giữa network byte stream và các object `Request`, `Response`.
2. Load và quản lý `Servlet`, cũng như xử lý cụ thể request `Request`.

Nếu bạn muốn nghiên cứu sâu Tomcat, lựa chọn hàng đầu là chuyên mục [《Mổ xẻ sâu Tomcat & Jetty》](http://gk.link/a/10r1C) của Geek Time. Đây là tài liệu giảng về nguyên lý bên trong Tomcat hay nhất tôi từng xem, rất khuyến nghị!

Chuyên mục này không chỉ giúp bạn hiểu sâu hơn về Tomcat, mà còn nâng cao tư duy của bạn về kiến trúc hệ thống, tối ưu performance và các lĩnh vực khác.

![](https://oss.javaguide.cn/github/javaguide/interview-preparation/java-learning-route/20210512202540785.png)

Ngoài Tomcat, Nginx cũng bắt buộc phải học!

Nginx là một HTTP server và reverse proxy server hiệu năng cao, thường được dùng làm reverse proxy và load balancing.

Nếu bạn muốn học Nginx, có thể xem [《150 bài giảng kiến thức cốt lõi Nginx》](http://gk.link/a/10r1D). Nội dung rất toàn diện, từ khái niệm, code cho đến thực chiến, từ HTTP đến OpenResty.

## Framework thường dùng

Trong phỏng vấn thực tế, kiến thức về framework ít được hỏi; học các framework thường dùng chủ yếu là để đáp ứng nhu cầu phát triển project và yêu cầu công việc.

### Spring/SpringBoot

**Chưa học Spring có thể bắt tay học thẳng SpringBoot không?**

Nói rõ là hoàn toàn được! Hiện đa số doanh nghiệp đều dùng SpringBoot, và Spring cũng không phải nền tảng bắt buộc trước khi học Spring Boot; so với Spring thì Spring Boot dễ bắt đầu hơn! Nếu bạn chỉ muốn dùng Spring Boot để làm project thì học thẳng Spring Boot là được.

Tuy nhiên, cá nhân tôi vẫn khuyên nên hiểu trước hai khái niệm khá quan trọng là Spring AOP và IoC rồi hãy học SpringBoot. Ngoài ra, nếu chuẩn bị phỏng vấn thì các điểm kiến thức như scope và vòng đời của bean trong Spring, giải thích chi tiết nguyên lý làm việc của SpringMVC, v.v. đều rất quan trọng, nhất định phải hiểu. Khuyến nghị đọc bài này: [Tổng hợp câu hỏi phỏng vấn Spring thường gặp](https://javaguide.cn/system-design/framework/spring/spring-knowledge-and-questions-summary.html).

Học Spring Boot thì vẫn khuyên nên xem nhiều [**《Tài liệu chính thức của Spring Boot》**](https://spring.io/projects/spring-boot#learn), viết rất chi tiết.

Việc tích hợp SpringBoot với một số công nghệ thường gặp bạn cũng cần biết cách làm, ví dụ SpringBoot tích hợp MyBatis, ElasticSearch, SpringSecurity, Redis, v.v. Cố gắng thực hành, viết vài Demo. Đến giai đoạn sau, thậm chí có thể tự làm vài project nhỏ để áp dụng hết những kiến thức này.

Về sách, cá nhân tôi thực ra không có gợi ý nào đặc biệt hay, dù sao đây là kiến thức framework, thay đổi khá nhanh, nội dung nhiều cuốn sách đã lỗi thời.

Cân nhắc nhiều bạn khá thích đọc sách, ở đây tôi vẫn giới thiệu sơ vài cuốn!

Với các bạn muốn thực chiến, tôi rất không khuyến khích xem sách, xem thẳng project thực chiến của Shang Silicon Valley là được. Bài này có thể lấy video mới nhất và đã giới thiệu về project thực chiến của Shang Silicon Valley: [【Tổng hợp mới nhất】Trọn bộ giáo trình Java backend & project thực chiến của Shang Silicon Valley](https://mp.weixin.qq.com/s/jkZthmOSDgTF1PrCeNus_A) (khuyến nghị).

![](https://oss.javaguide.cn/github/javaguide/books/88714e9becd0485aae247772b6ed9949.png)

Với các bạn nghiên cứu sâu nguyên lý bên trong Spring Boot, có thể xem **[《Tư tưởng lập trình Spring Boot (phần cốt lõi)》](https://book.douban.com/subject/33390560/)**.

![《Tư tưởng lập trình Spring Boot (phần cốt lõi)》 - Douban](https://oss.javaguide.cn/github/javaguide/books/image-20220424113546513.png)

Cuốn này hơi dài dòng một chút, tuy nhiên giới thiệu nguyên lý khá rõ ràng (không phù hợp cho người mới).

Nếu bạn thích xem video hơn, khuyến nghị [**《Spring Boot3 nhập môn từ con số không bản 2023》**](https://www.bilibili.com/video/BV1Es4y1q7Bf/) của thầy Lôi thuộc Shang Silicon Valley. Đây có thể là giáo trình Spring Boot chất lượng cao nhất và miễn phí trên toàn mạng, đánh giá cực tốt!

Ngoài ra, mảng Spring Boot còn có rất nhiều giáo trình mã nguồn mở chất lượng, tôi đã tổng hợp và đưa vào [Giáo trình kỹ thuật mã nguồn mở Java chất lượng](https://javaguide.cn/open-source-project/tutorial.html#springboot).

![](https://oss.javaguide.cn/github/javaguide/open-source-project/open-source-project-springboot-technical-course.png)

### MyBatis

MyBatis là ORM framework được dùng nhiều nhất ở Trung Quốc. Khi học Spring/Spring Boot, bạn nên học luôn MyBatis, điều này tôi cũng đã nhắc ở trên.

Ngoài ra, khuyên bạn nên nắm ít nhất một framework tăng cường cho MyBatis, ở đây giới thiệu hai cái do Trung Quốc phát triển:

1. [MyBatis-Plus](https://baomidou.com/): gọi tắt là MP, trên nền MyBatis chỉ tăng cường chứ không thay đổi, sinh ra để đơn giản hóa phát triển và nâng cao hiệu suất.
2. [MyBatis-Flex](https://mybatis-flex.com/): framework tăng cường MyBatis rất nhẹ, đồng thời có performance và tính linh hoạt cực cao.

Với các bạn làm project, cũng có thể chọn học và dùng thẳng framework tăng cường MyBatis.

### Unit test

Về unit test, các framework unit test thường dùng hiện nay có: JUnit, Mockito, Spock, PowerMock, JMockit, TestableMock, v.v.

JUnit gần như là lựa chọn mặc định, nhưng nó không hỗ trợ Mock, do đó chúng ta còn cần chọn thêm một công cụ Mock. Mockito và Spock là hai công cụ Mock chủ đạo nhất, thường thì chọn một trong hai.

Rốt cuộc nên chọn Mockito hay Spock? Ở đây tôi làm vài so sánh đơn giản:

1. Spock không thể Mock static method và private method; từ Mockito 3.4.0 trở đi đã hỗ trợ Mock static method, chi tiết xem issue này: [mockito/mockito#1013](https://github.com/mockito/mockito/issues/1013), hướng dẫn cụ thể xem bài này: [Mocking Static Methods With Mockito](https://www.baeldung.com/mockito-mock-static-methods).
2. Spock dựa trên Groovy, code test viết ra rõ ràng dễ đọc hơn, khá chuẩn mực (tự mang theo cấu trúc test given-when-then thường dùng). Mockito không có quy chuẩn cấu trúc cụ thể, cần nhóm project tự thống nhất một quy ước hoặc tuân theo các thực hành code test tốt. Thông thường, với cùng một test case, code của Spock sẽ gọn hơn.
3. Mockito có lượng người dùng rộng rãi hơn, ổn định đáng tin cậy. Hơn nữa, Mockito là công cụ Mock được SpringBoot Test tích hợp sẵn mặc định.

Mockito và Spock đều là công cụ Mock rất tốt; tương đối mà nói, tính ứng dụng của Mockito rộng hơn một chút.

Ở đây tiện thể giới thiệu một số tài liệu học liên quan đến testing:

1. [Giáo trình đào tạo unit test nội bộ Alibaba](https://mp.weixin.qq.com/s/wzGxqNv58Zig9_Izi3VhDg)
2. [Unit test rốt cuộc là gì? Nên làm thế nào?](https://javaguide.cn/system-design/basis/unit-test.html)
3. [Integration Testing in Spring](https://www.baeldung.com/integration-testing-in-spring)
4. [Testing the Web Layer](https://spring.io/guides/gs/testing-web/)
5. [Có lẽ là bài nhập môn unit test Spock hay nhất toàn mạng](https://mp.weixin.qq.com/s/axNE8OjFh9V9SGgaCZVgOw)
6. [Chia sẻ thực hành triển khai framework unit test Mockito](https://mp.weixin.qq.com/s/6s_5XSzKp8fckKuojSvXUw)
7. [Làm sao viết được unit test hiệu quả](https://mp.weixin.qq.com/s/Y75fSX92kysSmYrhEH6QFQ)

### Netty (tùy chọn)

Netty là framework hot nhất trong lập trình network với Java, mọi người có thể tùy nhu cầu cá nhân mà quyết định có học hay không, trong phát triển doanh nghiệp thực tế dùng không nhiều.

Tuy nhiên, cá nhân tôi khuyên bạn nào còn dư sức thì vẫn nên dành thời gian học nghiêm túc, rất có ích cho việc nâng cao năng lực phát triển cá nhân.

1. Netty dựa trên NIO (NIO là một I/O model đồng bộ non-blocking, được đưa vào Java 1.4). Dùng Netty có thể đơn giản hóa rất nhiều việc lập trình network như TCP và UDP socket server, đồng thời performance cũng như bảo mật và nhiều mặt khác đều rất xuất sắc.
2. Các project mã nguồn mở hot mà chúng ta thường tiếp xúc như Dubbo, RocketMQ, Elasticsearch, gRPC, Spark, v.v. đều dùng đến Netty.
3. Phần lớn framework microservice ở tầng dưới, phần liên quan đến giao tiếp network, đều làm dựa trên Netty, ví dụ như gateway Spring Cloud Gateway trong hệ sinh thái Spring Cloud.

Dưới đây là một số sách/chuyên mục khá đáng giới thiệu.

[《Netty in Action》](https://book.douban.com/subject/27038538/)

![《Netty in Action》 - Douban](https://oss.javaguide.cn/github/javaguide/books/image-20220424113715369.png)

Cuốn này có thể dùng để nhập môn Netty, nội dung đi từ BIO đến NIO, sau đó mới giới thiệu chi tiết tại sao có Netty, tại sao Netty dễ dùng và giảng các điểm kiến thức quan trọng của Netty.

Cuốn này về cơ bản đã giới thiệu hết các điểm kiến thức quan trọng của Netty, và phần lớn đều giảng theo hình thức thực chiến.

[《Con đường nâng cao Netty: học Netty qua case》](https://book.douban.com/subject/30381214/)

![《Con đường nâng cao Netty: học Netty qua case》 - Douban](https://oss.javaguide.cn/github/javaguide/books/image-20220424113747345.png)

Nội dung đều là các case thực hành về việc dùng Netty, ví dụ memory leak. Nếu bạn thấy mình đã nhập môn Netty hoàn toàn và muốn nắm Netty sâu hơn, khuyên bạn xem cuốn này.

**[《Học Netty cùng Flash: thực chiến chat real-time với Netty và nguyên lý bên trong》](https://book.douban.com/subject/35752082/)**

![](https://oss.javaguide.cn/github/javaguide/open-source-project/image-20220503085034268.png)

Cuốn này chia làm hai phần: phần trên đưa bạn nhập môn Netty qua case thực chiến hệ thống chat real-time, phần dưới đưa bạn hiểu rõ các nguyên lý bên trong khá quan trọng của Netty thông qua phân tích source code Netty.

Về video, [Trọn bộ giáo trình Netty của Heima Programmer](https://www.bilibili.com/video/BV1py4y1E7oA) khá tốt, bắt đầu từ kiến thức nền tảng NIO của Netty nên tương đối dễ tiếp thu.

![](https://oss.javaguide.cn/github/javaguide/open-source-project/image-20220503115418795.png)

### Workflow (tùy chọn)

Workflow engine mã nguồn mở được dùng nhiều ở Trung Quốc là Flowable và Activiti, tài liệu tham khảo cũng khá nhiều. Camunda cũng tốt, nhẹ hơn, chức năng cũng rất hoàn thiện, performance và độ ổn định cũng rất tốt. Về việc chọn process engine mã nguồn mở, có thể tham khảo bài này: [Tham khảo lựa chọn process engine mã nguồn mở](https://zhuanlan.zhihu.com/p/369761832).

Ghi chú: Flowable và Camunda đều phát triển từ một nhánh của Activiti5, triết lý của ba cái có khác biệt.

Workflow engine [LiteFlow](https://liteflow.cc/) khá hot ở Trung Quốc chỉ làm luồng dựa trên logic, chứ không làm luồng dựa trên task theo role. Nếu bạn muốn làm luồng dựa trên task theo role, khuyên dùng hai framework Flowable và Activiti. Tức là, luồng phê duyệt (A duyệt xong thì đến B duyệt, rồi chuyển tiếp đến role C) thì LiteFlow không phù hợp. LiteFlow phù hợp với nghiệp vụ có logic phức tạp, ví dụ price engine, luồng đặt hàng; các nghiệp vụ này thường có rất nhiều bước, và các bước này hoàn toàn có thể tách theo độ mịn nghiệp vụ thành từng component độc lập để lắp ráp, tái sử dụng, thay đổi.

Ở đây không giới thiệu tài liệu học, bạn nào quan tâm có thể tự tìm.

## Search engine

Search engine dùng để nâng cao hiệu quả tìm kiếm, chức năng tương tự search engine của trình duyệt. Search engine khá thường gặp là Elasticsearch (khuyến nghị) và Solr.

Nếu bạn muốn học Elasticsearch, [Cộng đồng Elastic tiếng Trung](http://www.elasticsearch.cn/) cùng [Blog chính thức của Elastic](https://www.elastic.co/cn/blog/) đều là tài nguyên rất tốt, trên đó chia sẻ rất nhiều case thực hành cụ thể.

Về video hướng dẫn, có thể xem [《ElasticSearch từ nhập môn đến tinh thông》](https://www.bilibili.com/video/BV1hh411D7sb/) của Shang Silicon Valley, phần đầu giảng dựa trên ElasticSearch 7.x, phần sau bổ sung thêm tính năng mới của Elasticsearch 8.x.

Về sách, có thể xem 《Một cuốn sách giảng thấu Elasticsearch: nguyên lý, nâng cao và thực hành kỹ thuật》. Cuốn này viết dựa trên phiên bản 8.x, hiện là sách giảng về Elasticsearch mới nhất toàn mạng. Nội dung bao phủ các điểm kiến thức cốt lõi của chứng chỉ Elastic chính thức, xuất phát từ case project thật và lời giải cho các vấn đề cấp doanh nghiệp.

![](https://oss.javaguide.cn/github/javaguide/books/one-book-guide-to-elasticsearch.png)

Cuối cùng, giới thiệu thêm một số bài viết và tuyển tập xuất sắc về ElasticSearch để giúp bạn học và dùng ElasticSearch tốt hơn:

- [Tổng hợp câu hỏi phỏng vấn Elasticsearch thường gặp - JavaGuide](https://javaguide.cn/database/elasticsearch/elasticsearch-questions-01.html)
- [Bài chi tiết nhập môn cơ bản Elasticsearch - Tencent Technology Engineering](https://mp.weixin.qq.com/s/GG_zrQlaiP2nfPOxzx_j9w)
- [Một số quy chuẩn sử dụng ElasticSearch trong công việc](https://juejin.cn/post/7244819106343518268)
- [《Series ES của Didi Technology》](https://mp.weixin.qq.com/mp/appmsgalbum?__biz=MzU1ODEzNjI2NA==&action=getalbum&album_id=3044498415449210882&scene=173&from_msgid=2247560768&from_itemidx=1&count=3&nolastread=1#wechat_redirect)
- [《Series cày nát Elasticsearch》](https://mp.weixin.qq.com/mp/appmsgalbum?__biz=MzI2NDY1MTA3OQ==&action=getalbum&album_id=1340073242396114944&scene=173&from_msgid=2247487667&from_itemidx=1&count=3&nolastread=1#wechat_redirect) (hàng trăm bài lý thuyết + thực chiến về ES, giáo trình ES toàn diện nhất toàn mạng. Video hướng dẫn tương ứng cho một phần nội dung: <https://space.bilibili.com/471049389>)

## Distributed & microservice (nâng cao)

Phần này liên quan đến khá nhiều điểm kiến thức, ở đây tôi chỉ liệt kê các phần tương đối quan trọng như thuật toán và giao thức distributed, configuration center, distributed transaction.

Để học kiến thức distributed, cá nhân tôi khá khuyến khích đọc sách và blog. Tất nhiên, nếu bạn thích xem video hơn thì cũng có thể tìm vài video hướng dẫn hoặc khóa học mở tốt để xem, học theo cách phù hợp với mình là được!

**Gợi ý sách (thiên lý thuyết)**:

《Hiểu sâu về distributed system》 rất tốt. Tác giả cuốn này dành rất nhiều dung lượng để giới thiệu consensus algorithm — thứ cực kỳ quan trọng trong lĩnh vực distributed, và còn dựa trên ngôn ngữ Go dẫn bạn hiện thực từ con số không thuật toán Paxos, tổ tiên của các consensus algorithm.

![](https://oss.javaguide.cn/github/javaguide/books/deep-understanding-of-distributed-system.png)

《Học kiến trúc từ con số không》 có nội dung khá toàn diện, distributed, microservice, high concurrency, high availability đều có đề cập. Cuốn này tương ứng với chuyên mục [《Học kiến trúc từ con số không》](http://gk.link/a/10pKZ) trên Geek Time, rất nhiều nội dung trong sách đến từ chuyên mục này, chọn một trong hai để đọc là được.

![](https://oss.javaguide.cn/github/javaguide/books/20210412224443177.png)

Cuốn [《Thiết kế kiến trúc phần mềm: con đường dung hợp kiến trúc kỹ thuật và kiến trúc nghiệp vụ của website lớn》](https://book.douban.com/subject/30443578/) của thầy Dư tương tự 《Học kiến trúc từ con số không》, nội dung cũng khá toàn diện và cũng rất tốt.

![img](https://oss.javaguide.cn/github/javaguide/books/20210412232441459.png)

**Gợi ý khóa học mở (thiên lý thuyết)**:

MIT6.824: Distributed System là khóa học mở khá kinh điển. Mỗi buổi học của khóa này đều đọc kỹ một bài báo kinh điển trong lĩnh vực distributed system, từ đó truyền đạt các nguyên tắc quan trọng và kỹ thuật then chốt trong thiết kế và hiện thực distributed system.

- [Làm sao học tốt hơn khóa distributed system MIT6.824?](https://www.zhihu.com/question/29597104)
- [MIT6.824: Distributed System (wiki bản dịch tiếng Trung)](https://mit-public-courses-cn-translatio.gitbook.io/mit6-824/)
- [MIT6.824: Distributed System - Hướng dẫn tự học CS](https://csdiy.wiki/%E5%B9%B6%E8%A1%8C%E4%B8%8E%E5%88%86%E5%B8%83%E5%BC%8F%E7%B3%BB%E7%BB%9F/MIT6.824/)

**Gợi ý video (thiên thực chiến)**:

Video có thể học thẳng [Giáo trình Spring Cloud bản mới nhất 2024](https://www.bilibili.com/video/BV1gW421P7RD/) của Shang Silicon Valley, khóa này giới thiệu các component chủ đạo nhất hiện nay trong SpringCloud và SpringCloud Alibaba. Sau khi học xong khóa này, bạn có thể bắt tay ngay vào thực chiến phát triển project microservice.

![](https://oss.javaguide.cn/github/javaguide/interview-preparation/java-learning-route/shangguigu-springcloud.png)

### Lý thuyết & thuật toán & giao thức

Các lý thuyết & thuật toán & giao thức distributed tương đối quan trọng gồm: lý thuyết CAP, lý thuyết BASE, thuật toán Paxos, giao thức Gossip, thuật toán Raft, v.v.

**Gợi ý bài viết**:

- [Giải thích chi tiết lý thuyết CAP & BASE](https://javaguide.cn/distributed-system/protocol/cap-and-base-theorem.html)
- [Giải thích chi tiết thuật toán Paxos](https://javaguide.cn/distributed-system/protocol/paxos-algorithm.html)
- [Giải thích chi tiết thuật toán Raft](https://javaguide.cn/distributed-system/protocol/raft-algorithm.html)
- [Giải thích chi tiết giao thức Gossip](https://javaguide.cn/distributed-system/protocol/gossip-protocol.html)

### Gọi từ xa

Việc gọi giữa các service khác nhau thường có hai cách:

- RPC: RPC (Remote Procedure Call) tức gọi thủ tục từ xa; qua RPC, chúng ta có thể gọi method của một service nào đó trên máy tính từ xa, quá trình này đơn giản như gọi method cục bộ. Dubbo là RPC framework do Trung Quốc phát triển, Alibaba mã nguồn mở, được dùng nhiều nhất trong nước.
- HTTP client: gọi RESTful API của service khác thông qua giao thức HTTP. Feign và OpenFeign (do Spring Cloud chính thức phát triển dựa trên Feign, dùng để thay thế Feign vốn đã vào trạng thái ngừng cập nhật) là những HTTP client thường dùng nhất hiện nay.

OpenFeign và Dubbo đều là framework gọi từ xa được ứng dụng rộng rãi trong kiến trúc microservice hiện nay, nhưng cách hiện thực khác nhau (OpenFeign dựa trên giao thức HTTP, Dubbo hỗ trợ nhiều giao thức và còn có thể tự định nghĩa giao thức), tình huống phù hợp cũng hơi khác. Project microservice Spring Cloud hiện dùng khá nhiều OpenFeign theo phong cách Rest, cá nhân tôi khuyên học cái này.

Tuy nhiên, nếu project bạn làm theo giáo trình dùng Dubbo hoặc công việc cần dùng Dubbo, thì bạn có thể tập trung học Dubbo. Giới thiệu phần tổng hợp tôi viết:

- [Tổng hợp kiến thức cơ bản về RPC](https://javaguide.cn/distributed-system/rpc/rpc-intro.html)
- [Tổng hợp các vấn đề thường gặp về Dubbo](https://javaguide.cn/distributed-system/rpc/dubbo.html)

Ngoài ra, tài liệu chính thức của Dubbo nhất định phải xem, địa chỉ: <https://cn.dubbo.apache.org/zh-cn/overview/home/>.

### Service registry & discovery

Eureka, Zookeeper, Consul, Nacos đều có thể cung cấp chức năng service registry & discovery.

Cá nhân tôi khuyên học Nacos, ở Trung Quốc dùng khá nhiều, chức năng cũng mạnh hơn! Ngoài cung cấp chức năng service registry & discovery, nó còn có thể dùng làm configuration center.

Học Nacos thì tài liệu chính thức nhất định phải xem: <https://nacos.io/zh-cn/docs/v2/quickstart/quick-start.html>.

Ngoài ra, giới thiệu thêm một số tài liệu học tôi thấy khá tốt:

- [Kiến trúc & nguyên lý Nacos - Alibaba Tàng Kinh Các](https://developer.aliyun.com/ebook/36) (khuyến nghị, gồm thiết kế kernel Nacos, nguyên lý bên trong, best practice)

- [55 hình hiểu thấu Nacos - Bất Tài Trần Mỗ](https://www.cnblogs.com/cbvlog/p/15636683.html)

- [Phân tích bằng hình cách hiện thực configuration center Nacos - Juejin](https://juejin.cn/post/6844904050840993805) (không dán quá nhiều code, nguyên lý giảng rất rõ)

- [Nacos giúp chúng ta giải quyết vấn đề gì? — Phần quản lý cấu hình - Alibaba Middleware](https://nacos.io/zh-cn/blog/5w1h-what.html)

### API Gateway

Gateway có thể cung cấp cho chúng ta các chức năng như chuyển tiếp request, xác thực bảo mật (authentication/authorization), kiểm soát lưu lượng, load balancing, degradation & circuit breaker, log, monitoring, validate tham số, chuyển đổi giao thức, v.v.

Về kiến thức cơ bản và lựa chọn công nghệ cho API gateway, khuyến nghị đọc bài [Tổng hợp kiến thức cơ bản về API gateway](https://javaguide.cn/distributed-system/api-gateway.html) tôi viết.

Project microservice Spring Cloud khá khuyến nghị dùng Spring Cloud Gateway làm API gateway, đây là một project hoàn toàn mới của Spring Cloud, nhằm thay thế Netflix Zuul. Để nâng cao performance của gateway, SpringCloud Gateway được hiện thực dựa trên WebFlux. Mục tiêu của Spring Cloud Gateway không chỉ là cung cấp cách routing thống nhất, mà còn cung cấp các chức năng cơ bản của gateway theo kiểu chuỗi Filter, ví dụ: bảo mật, monitoring/metrics và rate limiting.

Dưới đây là những tài liệu học tôi thấy khá tốt:

- [Tổng hợp các vấn đề thường gặp về Spring Cloud Gateway - JavaGuide](https://javaguide.cn/distributed-system/spring-cloud-gateway-questions.html)
- [6000 chữ | 16 hình | Hiểu sâu nguyên lý của Spring Cloud Gateway - Ngộ Không bàn kiến trúc](https://mp.weixin.qq.com/s/XjFYsP1IUqNzWqXZdJn-Aw)
- [Spring Cloud Gateway 10 câu hỏi liên hoàn chí mạng? - Bất Tài Trần Mỗ](https://www.cnblogs.com/cbvlog/p/15493160.html)
- [Thực chiến tích hợp Spring Cloud Gateway với Sentinel của Alibaba để rate limiting ở gateway! - Bất Tài Trần Mỗ](https://www.cnblogs.com/cbvlog/p/15512189.html)
- [Thực chiến Spring Cloud Gateway phần rate limiting - aneasystone](https://www.aneasystone.com/archives/2020/08/spring-cloud-gateway-current-limiting.html) (có giới thiệu các thuật toán và component rate limiting thường gặp)

### Configuration center

Trong microservice, sự phát triển của nghiệp vụ thường dẫn đến số lượng service tăng lên, kéo theo cấu hình chương trình (địa chỉ service, tham số database, v.v.) cũng tăng.

Cách dùng file cấu hình truyền thống đã không đáp ứng được nhu cầu hiện tại, chủ yếu vì hai lý do: một là tính bảo mật không được đảm bảo (cấu hình đặt trong code repository dễ bị lộ); hai là tính kịp thời không ổn (sửa cấu hình phải restart service mới có hiệu lực).

Spring Cloud Config, Nacos, Apollo, K8s ConfigMap đều có thể dùng làm configuration center.

Cá nhân tôi thích Apollo và Nacos hơn. Nacos dùng thuận tay hơn, còn có thể tiện thể dùng làm registry center; Apollo làm tốt hơn ở mảng quản lý cấu hình.

Cá nhân vẫn khuyên học Nacos, tài liệu học đã giới thiệu ở phần service registry & discovery bên trên.

### Distributed ID

ID là định danh duy nhất của dữ liệu, distributed ID là ID trong distributed system.

Giải pháp cho distributed ID có rất nhiều, ví dụ:

- Thuật toán: UUID, Snowflake
- Framework mã nguồn mở: UidGenerator (Baidu), Leaf (Meituan), Tinyid (Didi), IdGenerator (cá nhân)

Phần này tương đối đơn giản, khuyến nghị đọc hai bài sau để học:

- [Giới thiệu distributed ID & tổng hợp giải pháp hiện thực](https://javaguide.cn/distributed-system/distributed-id.html)
- [Hướng dẫn thiết kế distributed ID](https://javaguide.cn/distributed-system/distributed-id-design.html)

### Distributed transaction

Trong kiến trúc microservice, một hệ thống được tách thành nhiều microservice nhỏ.

Mỗi microservice đều có thể được deploy trên máy khác nhau, và mỗi microservice có thể có một database riêng cho mình dùng. Trong trường hợp này, một nhóm thao tác có thể liên quan đến nhiều microservice cũng như nhiều database.

Lấy ví dụ: trong hệ thống thương mại điện tử, khi bạn tạo một đơn hàng thường sẽ liên quan đến order service (số đơn hàng cộng một), inventory service (tồn kho trừ một), v.v., các service này sẽ có database riêng cho mình dùng.

![Sơ đồ minh họa distributed transaction](https://cdn.jsdelivr.net/gh/javaguide-tech/blog-images-6@main/12-04-1/%E5%88%86%E5%B8%83%E5%BC%8F%E4%BA%8B%E5%8A%A1%E7%A4%BA%E6%84%8F%E5%9B%BE.png)

**Vậy làm sao đảm bảo nhóm thao tác này hoặc là đều thực thi thành công, hoặc là đều thất bại?**

Lúc này chỉ dựa vào database transaction là không đủ! Chúng ta cần đưa vào khái niệm **distributed transaction**!

Giải pháp distributed transaction thường dùng có Seata và Hmily.

1. [Seata](https://seata.io/zh-cn/index.html "Seata"): Seata là giải pháp distributed transaction mã nguồn mở, hướng tới cung cấp dịch vụ distributed transaction hiệu năng cao và dễ dùng trong kiến trúc microservice.
2. [Hmily](https://gitee.com/shuaiqiyu/hmily "Hmily"): giải pháp distributed transaction cấp tài chính.

Hiện ở Trung Quốc dùng nhiều là Seata, khuyên học cái này.

### Distributed tracing

Khác với kiến trúc monolith, trong kiến trúc distributed, request cần được gọi qua nhiều service, việc truy vết vấn đề sẽ rất phiền. Chúng ta cần hệ thống distributed tracing để giải quyết điểm đau này.

Hiện các hệ thống distributed tracing về cơ bản đều phát triển từ bài báo 《Dapper, a Large-Scale Distributed Systems Tracing Infrastructure》 của Google; các hệ chủ đạo có Pinpoint, Skywalking, CAT (tất nhiên cũng có sản phẩm khác như Zipkin, Jaeger, nhưng nhìn chung độ hoàn thiện không bằng 3 cái được chọn ở trên).

Zipkin là công cụ distributed tracing mã nguồn mở của Twitter, Spring Cloud Sleuth thực chất dựa trên Zipkin.

SkyWalking là công cụ tracing, phân tích, cảnh báo phân tán mã nguồn mở do Ngô Thịnh (Huawei) người Trung Quốc phát triển, hiện là project mã nguồn mở thuộc Apache.

Hiện ở Trung Quốc dùng nhiều là SkyWalking, khuyên học cái này.

## High performance (nâng cao)

### CDN (chỉ cần nắm khái niệm và nguyên lý)

CDN là việc phân phối tài nguyên tĩnh đến nhiều nơi khác nhau để truy cập từ nơi gần nhất, qua đó tăng tốc độ truy cập tài nguyên tĩnh, giảm gánh nặng cho server cũng như băng thông.

Chúng ta chỉ cần nắm khái niệm cơ bản, nguyên lý của CDN và biết dùng dịch vụ CDN có sẵn của các nhà cung cấp cloud là được, không tốn quá nhiều thời gian. Khuyến nghị đọc bài [Tổng hợp các vấn đề thường gặp về CDN](https://javaguide.cn/high-performance/cdn.html) tôi viết.

### Message queue

Message queue trong distributed system chủ yếu dùng để bất đồng bộ hóa, giảm phụ thuộc và san tải đỉnh.

Các message queue thường dùng như sau:

1. [RocketMQ](https://github.com/apache/rocketmq "RocketMQ"): distributed message middleware hiệu năng cao, throughput cao do Alibaba mã nguồn mở.
2. [Kafka](https://github.com/apache/kafka "Kafaka"): Kafka là hệ thống message phân tán dựa trên mô hình publish/subscribe.
3. [RabbitMQ](https://github.com/rabbitmq "RabbitMQ"): message queue phát triển bằng Erlang, hiện thực dựa trên giao thức AMQP (Advanced Message Queue).
4. [Pulsar](https://github.com/apache/pulsar): nền tảng message streaming phân tán cloud native thế hệ mới.

Khuyên chọn một trong RocketMQ và Kafka để học sâu, các message queue khác chỉ cần biết sơ.

Về giới thiệu khái niệm cơ bản và lựa chọn công nghệ message queue, khuyến nghị đọc bài [Tổng hợp kiến thức cơ bản về message queue](https://javaguide.cn/high-performance/message-queue/message-queue.html) tôi viết.

Gợi ý tài nguyên học Kafka, RocketMQ, RabbitMQ xem bài đăng này của [Knowledge Planet](https://javaguide.cn/about-the-author/zhishixingqiu-two-years.html): <https://t.zsxq.com/0bEDFwgon>.

### Read/write splitting & sharding (chỉ cần nắm khái niệm và nguyên lý)

Read/write splitting chủ yếu là để phân bổ thao tác đọc và ghi của database sang các node database khác nhau. Master server chịu trách nhiệm ghi, slave server chịu trách nhiệm đọc. Ngoài ra, một master một slave hoặc một master nhiều slave đều được.

Read/write splitting có thể tăng mạnh performance đọc, tăng nhẹ performance ghi. Do đó, read/write splitting phù hợp hơn với tình huống một máy có nhiều request đọc đồng thời.

![Sơ đồ minh họa read/write splitting](https://oss.javaguide.cn/github/javaguide/high-performance/read-and-write-separation-and-library-subtable/read-and-write-separation.png)

Sharding là để giải quyết vấn đề performance database liên tục giảm do lượng dữ liệu trong database và table quá lớn.

Các công cụ sharding thường gặp: sharding-jdbc (Dangdang), TSharding (Mogujie), MyCAT (dựa trên Cobar), Cobar (Alibaba)... Khuyến nghị dùng sharding-jdbc, vì sharding-jdbc là framework Java nhẹ, cung cấp dịch vụ dưới dạng jar, không cần chúng ta làm thêm việc vận hành, và tính tương thích cũng rất tốt.

![Sharding](https://oss.javaguide.cn/java-guide-blog/662ea3bda90061d0b40177e3a46fefc3.jpg)

Hiện nay nhiều công ty dùng relational database phân tán kiểu như TiDB, không cần chúng ta tự tay sharding, do đó chúng ta chỉ cần nắm các khái niệm và nguyên lý thường gặp về read/write splitting & sharding là được, không cần bỏ quá nhiều thời gian thực hành. Khuyến nghị đọc bài [Tổng hợp các vấn đề thường gặp về read/write splitting & sharding](https://javaguide.cn/high-performance/read-and-write-separation-and-library-subtable.html) tôi viết.

### Load balancing

Hệ thống load balancing thường dùng để phân bổ các task như xử lý request của user sang nhiều server xử lý nhằm nâng cao performance và độ tin cậy của website, ứng dụng hoặc database.

Trong quá trình phát triển, load balancing mà chúng ta tiếp xúc có thể chia đơn giản thành **server-side load balancing** và **client-side load balancing**. Server-side load balancing có thể hiện thực bằng phần cứng (như F5, A10, Array) hoặc phần mềm (như LVS, Nginx, HAproxy). Các framework microservice chủ đạo trong lĩnh vực Java như Dubbo, Spring Cloud đều tích hợp sẵn client-side load balancing dùng được ngay. Dubbo mặc định đã mang theo chức năng load balancing, Spring Cloud hiện thực load balancing dưới dạng component, thuộc diện tùy chọn; thường dùng là Spring Cloud Load Balancer (chính thức, khuyến nghị) và Ribbon (Netflix, đã bị deprecated).

Cá nhân tôi khuyên học Nginx và Spring Cloud Load Balancer.

Các khái niệm, thuật toán và giải pháp kỹ thuật thường gặp về load balancing có thể xem bài này: [Tổng hợp các vấn đề thường gặp về load balancing](https://javaguide.cn/high-performance/load-balancing.html).

## High availability (nâng cao)

High availability mô tả việc một hệ thống trong phần lớn thời gian đều khả dụng, có thể phục vụ chúng ta. High availability nghĩa là ngay cả khi xảy ra lỗi phần cứng hoặc khi nâng cấp hệ thống, dịch vụ vẫn khả dụng.

### Rate limiting & degradation & circuit breaker

Rate limiting là cách ứng phó với sự cố hệ thống từ góc độ áp lực truy cập của user. Rate limiting nhằm giới hạn tần suất API phía server nhận request, tránh cho service bị sập. Ví dụ giới hạn một API chỉ nhận 100 request mỗi giây, các request vượt giới hạn thì bỏ qua hoặc đưa vào queue chờ xử lý. Rate limiting có thể ứng phó hiệu quả với lượng request đột biến quá lớn.

Về giới thiệu rate limiting cho service, khuyến nghị đọc bài [Giải thích chi tiết rate limiting cho service](https://javaguide.cn/high-availability/limit-request.html) tôi viết, trong đó có giới thiệu các thuật toán rate limiting thường gặp cũng như giải pháp rate limiting đơn máy và phân tán.

Degradation là cách ứng phó với sự cố hệ thống từ góc độ mức độ ưu tiên của chức năng. Service degradation nghĩa là khi áp lực server tăng đột biến, dựa theo tình hình nghiệp vụ và lưu lượng hiện tại mà giảm cấp có chiến lược một số service và trang, qua đó giải phóng tài nguyên server để đảm bảo các task cốt lõi chạy bình thường.

Circuit breaker và degradation là hai khái niệm khá dễ nhầm lẫn, ý nghĩa của chúng không giống nhau. Mục đích của degradation là ứng phó với sự cố của chính hệ thống mình, còn mục đích của circuit breaker là ứng phó với sự cố của hệ thống bên ngoài hoặc hệ thống bên thứ ba mà hệ thống hiện tại phụ thuộc.

[Hystrix](https://github.com/Netflix/Hystrix "Hystrix") do Netflix mã nguồn mở và [Sentinel](https://github.com/alibaba/Sentinel "Sentinel") do Alibaba mã nguồn mở đều hiện thực được rate limiting, degradation, circuit breaker. Tuy nhiên, Hystrix đã ngừng bảo trì, khuyến nghị dùng Sentinel với tính năng mạnh hơn. Ngoài ra, Wiki của Sentinel có so sánh các component rate limiting và degradation thường dùng, bạn nào quan tâm có thể xem, đường dẫn: [So sánh các component rate limiting và degradation thường dùng](https://github.com/alibaba/Sentinel/wiki/常用限流降级组件对比).

[Wiki của Sentinel đã mô tả chi tiết khác biệt giữa nó và Hystrix](https://github.com/alibaba/Sentinel/wiki/Sentinel-与-Hystrix-的对比), bạn có thể xem thử.

Học Sentinel thì tài liệu chính thức nhất định phải xem: <https://sentinelguard.io/zh-cn/docs/introduction.html>.

Ngoài ra, giới thiệu thêm một số tài liệu học tôi thấy khá tốt:

- [Sentinel — thần khí rate limiting của Alibaba, 17 câu hỏi liên hoàn chí mạng? - Bất Tài Trần Mỗ](https://mp.weixin.qq.com/s/w8lhJfhLdh7POpPw2MyPwA)
- [Sentinel tại sao mạnh thế, tôi đã moi ra nguyên lý hiện thực phía sau - Nhật ký java của Tam Hữu](https://mp.weixin.qq.com/s/FewOTrevjiCfooVIVwo4Xg)
- [Thiết kế thuật toán sliding window trong flow control của Sentinel - Lão Chu bàn kiến trúc](https://mp.weixin.qq.com/s/Q3C3DxtCJvTE5CCl3EWF9w)

### Xếp hàng

Một dạng rate limiting khác, tương tự như xếp hàng ngoài đời thực. Bạn nào chơi Liên Minh Huyền Thoại chắc có trải nghiệm này, mỗi lần có sự kiện là phải xếp hàng một lúc mới vào được game.

Có nhiều cách hiện thực xếp hàng, ví dụ chúng ta có thể nhờ message queue, các blocking queue trong JDK.

### Cluster

Triển khai nhiều bản của cùng một service, tránh single point of failure.

### Cơ chế timeout và retry

**Một khi request của user quá một khoảng thời gian nào đó mà không nhận được phản hồi thì kết thúc request đó và ném exception.** Nếu không đặt timeout có thể dẫn đến tốc độ phản hồi request chậm, thậm chí khiến request dồn ứ và làm hệ thống không xử lý được request nữa.

Ngoài ra, số lần retry thường đặt là 3 lần, retry nhiều hơn nữa không có lợi mà ngược lại còn làm nặng thêm áp lực cho server (một số tình huống dùng cơ chế retry khi thất bại sẽ không phù hợp lắm).

## Cloud native (tùy chọn)

> **Gợi ý**: phát triển cloud native đòi hỏi năng lực khá cao, vị trí Java backend thường cũng không yêu cầu kỹ năng phát triển cloud native. Do đó, phần nội dung này không khuyến nghị cho các bạn không hứng thú hoặc không hiểu về phát triển cloud native, có thể bỏ qua.

Cloud native là một bộ hệ thống kỹ thuật và phương pháp luận hoàn chỉnh để xây dựng, chạy ứng dụng trên cloud. Hệ thống kỹ thuật và phương pháp luận ở đây, tính đến hiện tại, chỉ microservice + DevOps + continuous delivery + container hóa.

Ngày càng nhiều ngôn ngữ lập trình, framework bắt đầu đón nhận cloud native, ví dụ Spring đưa ra công nghệ hướng cloud native là Spring Native, RedHat mã nguồn mở framework service cloud native cho Java là Quarkus.

Nếu bạn khá hứng thú với lĩnh vực cloud native, khuyên bạn tập trung vào các công nghệ sau:

1. Microservice: SpringCloud hay SpringCloud Alibaba thực ra không cần học, trong cloud native thường xây dựng microservice dựa trên Kubernetes được nhắc phía sau.
2. Gateway: gateway là cửa ngõ lưu lượng của toàn bộ kiến trúc microservice, chịu trách nhiệm authentication & authorization, phân phối request, rate limiting, quản lý API, load balancing, là một component rất quan trọng trong kiến trúc microservice. Do đó, tôi tách riêng gateway ra để nhắc đến ở đây.
3. Log và monitoring cảnh báo: Metrics (nhờ nó chúng ta có thể vẽ ra các bảng điều khiển trực quan trong Grafana, hiểu toàn diện hơn trạng thái vận hành của hệ thống), Trace (nhờ nó chúng ta có thể dựng ra toàn cảnh việc gọi của hệ thống), Logs (một số log cần thiết).
4. Container: công nghệ container là nền tảng phát triển của cloud native, các công cụ container đứng đầu là Docker đã đưa ra khẩu hiệu "build một lần, chạy mọi nơi".
5. Kubernetes: K8s được gọi là hệ điều hành của thời đại cloud native, ưu thế của ứng dụng cloud native gắn liền với các chức năng mà nó cung cấp.
6. DevOps: DevOps quan tâm đến việc tự động hóa quản lý toàn bộ vòng đời ứng dụng (phát triển, test, vận hành), từ đó đạt được việc giao phần mềm nhanh hơn, chất lượng hơn, thường xuyên hơn và ổn định hơn. Nhóm DevOps thường dùng kiến trúc microservice để xây dựng ứng dụng, nhờ continuous integration và continuous deployment (CI/CD) để triển khai DevOps.
7. ServiceMesh: bạn có thể xem Service Mesh như một tầng được trừu tượng hóa riêng để đơn giản hóa công việc phát triển, thường được tích hợp như một tầng trong suốt vào ứng dụng phân tán hiện có.
8. ……

Trong đó, quan trọng hơn cả là Kubernetes. Nếu bạn làm project, khuyên ưu tiên cân nhắc các project liên quan đến Kubernetes.

Trước đây tôi có viết một bài giới thiệu về cloud native, bạn có thể xem: [Thời đại cloud native, lập trình viên nên nắm những năng lực nào?](https://mp.weixin.qq.com/s/ZVbwNnvRwXxQqk7A-OA27g).

Ngoài ra, còn khuyến nghị xem bài này: [Kiến trúc cloud native năm 2024 cần những tech stack nào](https://crossoverjie.top/2024/04/11/ob/2024-cloud-native/).

## AI application development (lộ trình mở rộng)

AI đã trở thành một phần trong hệ thống năng lực của Java backend, nhưng không khuyến nghị ngay từ đầu nhét nó vào tuyến chính Java rồi học gồng. Nhịp độ chắc chắn hơn là: xây vững Java Basics, Spring, database, cache, distributed và thực chiến project trước, rồi theo lộ trình dưới đây bổ sung AI application development một cách có hệ thống.

- [Lộ trình học AI application development và Agent cho developer Java/Go (bản mới nhất 2026)](./java-to-ai-roadmap.md): dành cho backend developer, chia nhỏ lộ trình học theo nền tảng LLM, LLM API, Prompt, RAG, Agent, kỹ thuật hóa và thực chiến project.
- [Gợi ý học chuyển hướng từ backend sang AI Agent (bản mới nhất 2026)](./backend-to-ai-agent-roadmap.md): nếu bạn chưa chắc có nên chuyển sang AI không, chọn Java AI hay Python AI, có thể ứng tuyển vị trí nào, hãy xem bài này trước.
- [Hệ thống kiến thức AI application development](../ai/): lối vào các bài viết hệ thống ngoài lộ trình học, bao phủ nền tảng LLM, Agent, RAG, MCP, Prompt engineering, đánh giá và AI system design.
- [Hướng dẫn thực hành AI coding](../ai-coding/): lộ trình tăng hiệu suất code hằng ngày, tập trung vào Claude Code, Codex, AI IDE, CLI Agent, quản lý context và workflow phát triển có AI hỗ trợ.

Nếu bạn chỉ đang chuẩn bị phỏng vấn Java backend, phần AI này có thể tìm hiểu khái niệm cơ bản trước; nếu mục tiêu là AI application development hay Agent engineer, khuyên đi thẳng theo lộ trình học AI application development ở trên.

## Tổng kết

Đây là một lộ trình học rất chi tiết; học xong những nội dung trên, tìm được một công việc tương đối tốt đã khá dễ dàng.

Ngoài ra, như tôi đã nói ở trên, nếu bạn thấy nội dung hơi nhiều không học nổi, hoặc nếu bạn chỉ muốn tìm một công việc ở công ty nhỏ, hãy tập trung vào Java Basics, database, các framework thường dùng và các công cụ thường dùng.

Còn những điểm kiến thức như JVM, distributed, high concurrency, high availability, microservice, nếu bạn muốn vào công ty lớn hoặc muốn cạnh tranh tốt hơn khi tìm việc thì cũng cần bỏ thêm thời gian học.

Phỏng vấn bây giờ rất cạnh tranh, muốn tìm được công việc tốt thì bạn cần học nhiều hơn, luyện nhiều hơn. Tuy nhiều kiến thức bạn học hiện tại có thể sẽ không dùng đến khi đi làm, nhưng vòng sàng lọc phỏng vấn lại đòi hỏi bạn phải biết. Suy cho cùng, nhiều vị trí có rất nhiều người cùng cạnh tranh, để đạt hiệu quả sàng lọc thì độ khó phỏng vấn thường khá cao. Đây chính là cái gọi là: "phỏng vấn thì chế tên lửa, vào làm thì vặn ốc vít".

## Tài khoản công khai (khuyến nghị)

Bản cập nhật mới nhất của lộ trình học sẽ được đồng bộ sớm nhất lên tài khoản công khai, khuyến nghị mọi người theo dõi!

![Tài khoản công khai chính thức JavaGuide](https://oss.javaguide.cn/github/javaguide/gongzhonghaoxuanchuan.png)

## Knowledge Planet

Để giúp nhiều bạn hơn chuẩn bị phỏng vấn Java cũng như học Java, tôi đã tạo một [Knowledge Planet về phỏng vấn Java](https://javaguide.cn/about-the-author/zhishixingqiu-two-years.html) thuần túy. Tuy học phí chỉ bằng một phần trăm lớp đào tạo/bootcamp, nhưng nội dung trong Knowledge Planet chất lượng cao hơn, dịch vụ cũng toàn diện hơn, rất phù hợp cho các bạn đang chuẩn bị phỏng vấn và học Java.

**Hoan nghênh các bạn đang chuẩn bị phỏng vấn Java và học Java tham gia [Knowledge Planet](https://javaguide.cn/about-the-author/zhishixingqiu-two-years.html) của tôi, nội dung giá trị rất nhiều, không khí học tập cũng rất tốt! Tuy giá rẻ nhưng nội dung trong đó có thể còn chất lượng hơn lớp đào tạo hàng chục nghìn tệ bạn tham gia.**

[![Dịch vụ của Knowledge Planet](https://oss.javaguide.cn/xingqiu/xingqiufuwu.png)](https://javaguide.cn/about-the-author/zhishixingqiu-two-years.html)
