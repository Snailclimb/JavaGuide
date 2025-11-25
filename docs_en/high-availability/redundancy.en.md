---
title: Detailed explanation of redundant design
category: high availability
icon: cluster
---

Redundant design is the most common means to ensure high availability of systems and data.

For services, the idea of ​​redundancy is to deploy multiple copies of the same service. If the service being used suddenly hangs up, the system can quickly switch to the backup service, greatly reducing the system's unavailability time and improving system availability.

For data, the idea of ​​redundancy is to back up multiple copies of the same data, which can easily improve data security.

In fact, there are many applications of redundant ideas in daily life.

For myself, my method of saving important files is the application of redundant thinking. The important files I use daily are synchronized on GitHub and my personal cloud disk. This ensures that even if my computer hard drive is damaged, I can retrieve my important files through GitHub or my personal cloud disk.

High Availability Cluster (HA Cluster for short), same-city disaster recovery, remote disaster recovery, same-city multi-active and remote multi-active are the most typical applications of redundancy ideas in high-availability system design.

- **High Availability Cluster**: Deploy two or more copies of the same service. If the service being used suddenly hangs up, you can switch to another service to ensure high availability of the service.
- **Same-city disaster recovery**: An entire cluster can be deployed in the same computer room, while in same-city disaster recovery the same services are deployed in different computer rooms in the same city. Also, the backup service does not handle requests. This can avoid unexpected situations such as power outages and fires in the computer room.
- **Remote disaster recovery**: Similar to same-city disaster recovery, the difference is that the same service is deployed in different computer rooms in different locations (usually far away, or even in different cities or countries)
- **Multi-active in the same city**: Similar to the same city disaster recovery, but the backup service can handle requests, which can make full use of system resources and improve system concurrency.
- **Multi-Activity in Remote Locations**: Deploy services in different computer rooms in different locations, and they can provide services to the outside world at the same time.

High-availability clusters are purely for service redundancy and do not emphasize geography. Intra-city disaster recovery, remote disaster recovery, same-city multi-activity and remote multi-activity realize geographical redundancy.

The main difference between the same city and another place is the distance between computer rooms. The distance is usually far away, even in different cities or countries.

Compared with the traditional disaster recovery design, the most obvious change between multi-activity in the same city and multi-activity in different places is "multi-activity", that is, all sites provide services to the outside world at the same time. Living more in different places is to cope with emergencies such as fires, earthquakes and other natural or man-made disasters.

Redundancy alone is not enough, it must be coupled with **failover**! The so-called failover simply means the rapid and automatic switching of unavailable services to available services. The entire process does not require human intervention.

For example: In the Sentinel mode Redis cluster, if Sentinel detects that the master node fails, it will help us implement failover and automatically upgrade a slave to the master to ensure the availability of the entire Redis system. The entire process is completely automatic and requires no manual intervention. I have introduced the knowledge points and interview questions related to Redis cluster in detail in the database section of "Technical Interview Questions" in ["Java Interview Guide"](https://www.yuque.com/docs/share/f37fc804-bfe6-4b0d-b373-9c462188fec7). Interested friends can take a look.

Another example: Nginx can be combined with Keepalived to achieve high availability. If the Nginx master server goes down, Keepalived can automatically perform failover and the backup Nginx master server is upgraded to the main service. Moreover, this switch is transparent to the outside world, because the virtual IP used will not change. I introduced the Nginx related knowledge points and interview questions in detail in the "Server" section of the "Technical Interview Questions" of ["Java Interview Guide"](https://www.yuque.com/docs/share/f37fc804-bfe6-4b0d-b373-9c462188fec7). Interested friends can take a look.

It is very difficult to implement a remote multi-active architecture, and there are many factors that need to be considered. I am not talented and have never practiced the remote multi-active architecture in actual projects. My understanding of it is still based on book knowledge.

If you want to learn more about living in a different place, I recommend a few articles that I think are pretty good:

- [To understand how to live in a different place, just read this article - Water Drops and Silver Bullets - 2021](https://mp.weixin.qq.com/s/T6mMDdtTfBuIiEowCpqu6Q)
- [Four steps to build remote multi-activity](https://mp.weixin.qq.com/s/hMD-IS__4JE5_nQhYPYSTg)
- ["Learning Architecture from Scratch" — 28 | Guarantee of high business availability: multi-active remote architecture](http://gk.link/a/10pKZ)

However, most of these articles also introduce conceptual knowledge. At present, there is still a lack of information on the Internet that truly introduces how to implement the multi-active architecture in different locations.

<!-- @include: @article-footer.snippet.md -->