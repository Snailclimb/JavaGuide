---
home: true
icon: "mdi:home-outline"
title: JavaGuide (Hệ thống kiến thức phỏng vấn Java & backend)
description: JavaGuide là bộ hướng dẫn hệ thống kiến thức phỏng vấn Java và backend với 156K+ Star trên GitHub, miễn phí mã nguồn mở, bao phủ có hệ thống Java, computer science cơ bản, database, distributed, high concurrency, high availability, system design và AI application development, phù hợp cho tuyển dụng sinh viên, tuyển dụng có kinh nghiệm, nhảy việc và ôn tập năng lực backend một cách hệ thống.
heroImage: /logo.svg
heroText: JavaGuide
tagline: Hệ thống kiến thức phỏng vấn Java và backend với 156K+ Star trên GitHub, bao phủ computer science cơ bản, database, distributed, high concurrency, system design và AI application development
sitemap:
  changefreq: weekly
  priority: 0.9
head:
  - - meta
    - name: keywords
      content: JavaGuide,phỏng vấn Java,hướng dẫn phỏng vấn Java,lý thuyết phỏng vấn Java,phỏng vấn backend,backend development,phỏng vấn database,phỏng vấn MySQL,phỏng vấn Redis,distributed,high concurrency,high performance,high availability,system design,message queue,cache,computer network,Linux,phỏng vấn AI,AI application development,Agent,RAG,MCP,LLM,AI coding
  - - meta
    - property: og:image
      content: https://javaguide.cn/logo.png
actions:
  - text: Bắt đầu đọc
    link: /home.md
    type: primary
  - text: Knowledge Planet
    link: /about-the-author/zhishixingqiu-two-years.md
    type: default
footer: |-
  <a href="https://beian.miit.gov.cn/" target="_blank">鄂ICP备2020015769号-1</a> | Theme: <a href="https://theme-hope.vuejs.press/" target="_blank">VuePress Theme Hope</a>
---

<!-- markdownlint-disable MD033 -->

## Lối vào chính

- **Tuyến chính phỏng vấn backend**: [Hướng dẫn phỏng vấn backend](./home.md) (⭐ lõi của website): tổng hợp có hệ thống lý thuyết phỏng vấn Java và các câu hỏi phỏng vấn backend tần suất cao, bao phủ Java Basics, Collection, Concurrency, JVM, Spring, MySQL, Redis, distributed, high concurrency, high availability và system design.
- **Computer science cơ bản**: [Hướng dẫn phỏng vấn kiến thức nền tảng](./cs-basics/): hệ thống hóa computer network, operating system, data structure và algorithm — nền tảng của phỏng vấn backend, phù hợp để bù đắp lỗ hổng kiến thức cơ bản.
- **AI application development**: [Hướng dẫn phỏng vấn AI application development](./ai/) (⭐ mới): dành cho backend developer, hệ thống hóa kiến thức tần suất cao về nền tảng LLM, Prompt, Agent, RAG, MCP, kỹ thuật LLM API và AI system design; nếu muốn học bài bản, có thể kết hợp với [Lộ trình học AI application development và Agent (bản mới nhất 2026)](./roadmap/java-to-ai-roadmap.md) và [Gợi ý học chuyển hướng từ backend sang AI Agent (bản mới nhất 2026)](./roadmap/backend-to-ai-agent-roadmap.md).
- **AI coding thực chiến**: [Hướng dẫn thực hành AI coding](./ai-coding/) (⭐ mới): tập trung vào Claude Code, Codex, AI IDE, CLI Agent, quản lý context và workflow phát triển có AI hỗ trợ, giúp bạn thực sự đưa AI vào công việc code hằng ngày.
- **Lộ trình học**: [Tổng hợp lộ trình học (bản mới nhất 2026)](./roadmap/): tổng hợp gợi ý học tập có hệ thống cho các hướng Java backend, AI application development, AI Agent và full-stack.
- **Tài liệu mở rộng**:
  - [《Java Interview Guide》](https://javaguide.cn/zhuanlan/java-mian-shi-zhi-bei.html): bốn năm mài giũa, bổ sung cho nội dung bản mã nguồn mở JavaGuide, đưa bạn chuẩn bị phỏng vấn backend có hệ thống từ con số không!
  - [《Câu hỏi system design & tình huống tần suất cao trong phỏng vấn backend》](https://javaguide.cn/zhuanlan/back-end-interview-high-frequency-system-design-and-scenario-questions.html): 30+ câu hỏi system design và tình huống tần suất cao, giúp bạn ứng phó với xu hướng phỏng vấn hiện nay ở các công ty lớn và vừa.
  - [⭐ Nền tảng hỗ trợ phỏng vấn thông minh AI + RAG Knowledge Base](https://javaguide.cn/zhuanlan/interview-guide.html): project thực chiến LLM dựa trên Spring Boot 4.0 + Java 21 + Spring AI 2.0, phù hợp làm project học tập và project ghi vào CV.

## Bài viết chọn lọc

- **Lộ trình phỏng vấn backend**: [Kế hoạch vượt qua phỏng vấn Java backend](./interview-preparation/backend-interview-plan.md), [Lộ trình học Java (bản mới nhất 2026)](./interview-preparation/java-roadmap.md), [Tổng hợp trọng điểm phỏng vấn Java backend](./interview-preparation/key-points-of-interview.md). Khi chưa biết bắt đầu ôn từ đâu, hãy ưu tiên xem nhóm này.
- **Câu hỏi tần suất cao về Java và database**: [Java Basics](./java/basis/java-basic-questions-01.md), [Java Collection](./java/collection/java-collection-questions-01.md), [Java Concurrency](./java/concurrent/java-concurrent-questions-01.md), [JVM](./java/jvm/README.md), [MySQL](./database/mysql/mysql-questions-01.md), [Redis](./database/redis/redis-questions-01.md). Phù hợp để luyện tập trung các vấn đề cốt lõi về ngôn ngữ, runtime và lưu trữ dữ liệu.
- **Câu hỏi tần suất cao về kiến trúc và middleware**: [Distributed](./distributed-system/distributed-system-interview-questions.md), [Microservice](./distributed-system/microservices-interview-questions.md), [Message queue](./high-performance/message-queue/message-queue-interview-questions.md), [High performance](./high-performance/high-performance-system-interview-questions.md), [High availability](./high-availability/high-availability-system-interview-questions.md), [System design](./system-design/system-design-questions.md). Phù hợp để chuẩn bị tuyển dụng có kinh nghiệm, vị trí trung–cao cấp và các câu hỏi đào sâu tình huống project.
- **Củng cố kiến thức nền tảng**: [Computer network](./cs-basics/network/other-network-questions.md), [Operating system](./cs-basics/operating-system/operating-system-basic-questions-01.md), [Process và thread](./cs-basics/operating-system/process-and-thread.md), [Data structure và algorithm](./cs-basics/algorithms/). Phù hợp để bù đắp năng lực nền tảng mà tuyển dụng sinh viên, tuyển dụng có kinh nghiệm và phỏng vấn công ty lớn đều không thể né tránh.
- **Nâng cao AI application development**: [Lộ trình học AI application development và Agent (bản mới nhất 2026)](./roadmap/java-to-ai-roadmap.md), [Gợi ý học chuyển hướng từ backend sang AI Agent (bản mới nhất 2026)](./roadmap/backend-to-ai-agent-roadmap.md), [Hệ thống kiến thức AI application development](./ai/), [Thực hành kỹ thuật LLM API](./ai/llm-basis/llm-api-engineering.md), [Khái niệm cơ bản về RAG](./ai/rag/rag-basis.md), [System design cho ứng dụng AI](./ai/system-design/ai-application-architecture.md). Phù hợp để backend developer xác định rõ lộ trình học trước, rồi đi từ việc gọi model đến ứng dụng AI có thể đưa lên production.
- **Tăng hiệu suất bằng AI coding**: [Hướng dẫn AI coding thực chiến](./ai-coding/), [Hướng dẫn sử dụng Claude Code](./ai-coding/practices/claudecode-tips.md), [Hướng dẫn sử dụng Codex](./ai-coding/practices/codex-best-practices.md), [Lựa chọn và thực hành AI IDE](./ai-coding/practices/ai-ide.md). Phù hợp để đưa công cụ AI coding thực sự vào quy trình phát triển, refactor và xử lý sự cố hằng ngày.

## Về JavaGuide

JavaGuide là một kho kiến thức mã nguồn mở dành cho Java và backend developer, đã đạt **156K+ Star** trên GitHub. Project khởi đầu từ việc ôn tập phỏng vấn Java, dần mở rộng thành bộ hướng dẫn học tập có hệ thống bao phủ công nghệ backend cốt lõi, thực hành kỹ thuật và AI application development.

JavaGuide được duy trì liên tục từ khi mã nguồn mở năm 2018, tích lũy **6200+** commit, với hơn **640+** người đóng góp cùng tham gia duy trì và hoàn thiện.

![Tình hình Star, Fork, Issue và PR hiện tại của JavaGuide](https://oss.javaguide.cn/github/javaguide/intro/javaguide-star-issue-pr.png)

Nội dung website bao phủ:

- **Phỏng vấn backend**: kiến thức cốt lõi về Java Basics, Collection, Concurrency, JVM, MySQL, Redis, distributed, system design.
- **AI application development**: công nghệ tiên tiến như nền tảng LLM, Agent, RAG, giao thức MCP.

Thực lòng mong làm tốt project này, để nó thực sự giúp được những bạn đang cần!

Nếu thấy nội dung của JavaGuide hữu ích với bạn, hãy tặng một Star miễn phí (hoàn toàn không ép, thấy nội dung tốt và có thu hoạch rồi hãy thích), đó là sự khích lệ lớn nhất với tôi. Cảm ơn mọi người đã đồng hành, cùng cố gắng! Đường dẫn: [GitHub](https://github.com/Snailclimb/JavaGuide) | [Gitee](https://gitee.com/SnailClimb/JavaGuide).

- [Giới thiệu project](./javaguide/intro.md) (sự ra đời của JavaGuide)
- [Hướng dẫn đóng góp](./javaguide/contribution-guideline.md) (mong chờ đóng góp của bạn, phần thưởng phong phú)
- [Câu hỏi thường gặp](./javaguide/faq.md) (trả lời chung một số thắc mắc của mọi người)

## Bản PDF & liên hệ WeChat

- Nếu bạn thích bản **PDF** hơn (ví dụ để đọc khi đi lại / đọc offline / in ra học), hãy quét mã QR bên dưới và nhắn "**PDF**" để nhận bản mới nhất (cập nhật liên tục, xem giới thiệu chi tiết tại: **[Tài liệu PDF phỏng vấn backend mới nhất 2026](./interview-preparation/pdf-interview-javaguide.md)**).
- Nếu bạn muốn kết bạn WeChat với tôi, hãy quét mã QR bên dưới và nhắn "**微信**" (WeChat). Tôi sẽ chia sẻ một số nội dung kỹ thuật chất lượng, tài liệu học tập và cập nhật project trên trang cá nhân.

<img src="https://oss.javaguide.cn/github/javaguide/gongzhonghao-javaguide.png" alt="Tài khoản công khai JavaGuide" style="zoom: 43%; display: block; margin: 0 auto;" />
