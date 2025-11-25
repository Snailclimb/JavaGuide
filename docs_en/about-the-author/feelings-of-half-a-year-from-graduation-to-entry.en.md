---
title: Reflections on the Six Months Since Graduation and Starting Work
category: About the Author
tag:
  - Personal Experience
---

If you've read my previous introductions, you'll know I'm one of the millions of fresh graduates from 2019. This article is mainly about my feelings after working for over half a year. It contains many of my own subjective thoughts, so if you disagree with anything, feel free to say so in the comments. I respect others' opinions.

Let me briefly describe my situation. I'm currently working at a foreign company, and my daily job, like most people's, is development. It's been over half a year since I graduated, and I've passed the company's 6-month probation period. I've worked on two business-oriented projects, one of which is ongoing. You might find it hard to imagine that the backends of these two projects don't involve distributed systems or microservices, nor have I had practical experience with "high-end" technologies like Redis or Kafka.

The first project was an internal one—an employee growth system. Beyond the name, the system was essentially for performance appraisals, like evaluating your performance in a project team. The tech stack was Spring Boot, JPA, Spring Security, K8S, Docker, and React. The second project, which I'm currently working on, integrates a game (Cocos), a web admin panel (Spring Boot + Vue), and a mini-program (Taro).

Yes, most of my time at work is related to CRUD, and I also write front-end pages every day. A friend of mine was baffled when he heard that most of my work involves writing business logic. He thought that just writing business code doesn't lead to growth. What? You're a fresh graduate who can't even write business code properly, and you're telling me this! So, **I'm puzzled as to why so many people who can't even write good business code have an aversion to CRUD. At least in my time working, I feel my code quality has improved, my ability to locate problems has greatly enhanced, I have a deeper understanding of the business, and I can now independently handle some front-end development.**

Personally, I don't think writing good business code is that easy. Before complaining about doing CRUD work all day, take a look at whether your own CRUD code is well-written. In other words, while writing CRUD, have you figured out the common annotations or classes you use? It's like someone who only knows the simplest annotations like `@Service`, `@Autowired`, and `@RestController` claiming to have mastered Spring Boot.

I don't know when it started, but everyone seems to think that having practical experience with Redis or MQ is impressive. This might be related to the current interview environment. You need to differentiate yourself from others, and if you want to get into a big tech company, it seems you must be proficient in these technologies. Well, not "seems"—let's be confident and say that for most job seekers, these technologies are considered a prerequisite.

**To be honest, I fell into this "false proposition" in college.** In my sophomore year, I was exposed to Java because I joined a tech-oriented campus media group. At that time, our goal for learning Java was to develop a campus app. As a sophomore with only a beginner's level of programming skills, it took me some time to master the basics of Java. Then, I started learning Android development.

It wasn't until the first semester of my junior year that I truly decided to pursue a career in Java backend development. After about three months of learning the basics of web development, I started studying distributed systems concepts like Redis and Dubbo. I learned through a combination of books, videos, and blogs. During my self-study, I completed two full projects by following video tutorials: one was a regular business system, and the other was a distributed system. **At that time, I thought I was pretty awesome after finishing them. I felt that simple CRUD work was beneath my skill level. Haha! Looking back now, I was so naive!**

And then, problems arose when I worked on a project with a professor during my junior year summer break. The project was a performance appraisal system with moderate business complexity. The tech stack was SSM + Shiro + JSP. At that time, I encountered all sorts of problems. I couldn't write code that I thought I knew how to write. Even a simple CRUD operation took me several days. So, I was reviewing, learning, and coding at the same time. Although it was tiring, I learned a lot and became more grounded in my approach to technology. I think the phrase "**this project is no longer maintainable**" is the biggest negation of the project I worked on.

Technology is ever-changing; mastering the core principles is what matters. A few years ago, we might have been using Spring with traditional XML for development, but now almost everyone uses Spring Boot to speed up development. Similarly, a few years ago, we might have used ActiveMQ for message queuing, but today, it's hardly used. The more common choices are RocketMQ and Kafka. With technology evolving so quickly, you can't possibly learn every single framework or tool.

**Many beginners want to learn by doing projects right away, especially in a company setting. I think this is not advisable.** If your Java or Spring Boot fundamentals are weak, I suggest you study them beforehand before starting a project through videos or other means. **Another point is, I don't know why everyone says that learning while working on a project is the most effective way. I think this requires a prerequisite: you must have a basic understanding of the technology or a certain level of programming knowledge.**

**Key point!!! If your foundation is not solid, simply following along with a video is useless. You'll find that after watching the video, you still can't write the code yourself.**

I don't know what it's like for programmers at other companies. I feel that technical growth largely depends on what you do in your spare time. Relying solely on work, in most cases, will only make you more proficient at completing tasks. Of course, after writing a lot of code, your understanding of code quality will improve to some extent (provided you are conscious of it).

Outside of work, I use my spare time to learn things I'm interested in. For example, in my first project at the company, we used Spring Security + JWT. Since I wasn't familiar with it, I spent about a week of my own time learning it and created a demo to share. GitHub address: <https://github.com/Snailclimb/spring-security-jwt-guide>. This also led me to share:

- ["Distinguishing Between Authentication, Authorization, and Cookie, Session, Token"](https://mp.weixin.qq.com/s?__biz=Mzg2OTA0Njk0OA==&mid=2247485626&idx=1&sn=3247aa9000693dd692de8a04ccffeec1&chksm=cea24771f9d5ce675ea0203633a95b68bfe412dc6a9d05f22d221161147b76161d1b470d54b3&token=684071313&lang=zh_CN&scene=21#wechat_redirect)
- ["Analysis of JWT Authentication Pros and Cons and Common Problem Solutions"](https://mp.weixin.qq.com/s?__biz=Mzg2OTA0Njk0OA==&mid=2247485655&idx=1&sn=583eeeb081ea21a8ec6347c72aa223d6&chksm=cea2471cf9d5ce0aa135f2fb9aa32d98ebb3338292beaccc1aae43d1178b16c0125eb4139ca4&token=1737409938&lang=zh_CN#rd)

Another recent example is that during the time I was at home due to the pandemic, I taught myself Kafka and am preparing a series of introductory articles. I have already completed:

1.  Kafka Introduction in Plain Language;
2.  Kafka Installation and Basic Functionality;
3.  Integrating Kafka with Spring Boot to Send and Receive Messages;
4.  Handling Transactions and Error Messages with Spring Boot and Kafka.

Still to be completed:

1.  Analysis of advanced Kafka features like workflow and why Kafka is fast;
2.  Source code analysis;
3.  ...

**Therefore, I believe that technical accumulation and growth largely depend on the time spent outside of work (experts and exceptionally talented individuals excluded).**

**There is still a long way to go. Even with all the energy in the world, you can't learn every technology you want to. Make appropriate trade-offs, compromises, and have some fun.**
