---
title: Detailed explanation of hot and cold data separation
category: high performance
head:
  - - meta
    - name: keywords
      content: Separation of hot and cold data, cold data migration, cold data storage
  - - meta
    - name: description
      content: Separation of hot and cold data refers to dividing data into cold data and hot data based on the access frequency and business importance of the data. Cold data is generally stored in low-cost, low-performance media, and hot data is stored in high-performance storage media.
---

## What is the separation of hot and cold data?

Separation of hot and cold data refers to dividing data into cold data and hot data based on the access frequency and business importance of the data. Cold data is generally stored in low-cost, low-performance media, and hot data is stored in high-performance storage media.

### Cold data and hot data

Hot data refers to data that is frequently accessed and modified and needs to be accessed quickly. Cold data refers to data that is not accessed frequently and has low value to the current project, but needs to be preserved for a long time.

How to distinguish between hot and cold data? There are two common ways to differentiate:

1. **Time dimension distinction**: According to the creation time, update time, expiration time, etc. of the data, the data within a certain time period is regarded as hot data, and the data beyond this time period is regarded as cold data. For example, the order system can treat order data 1 year ago as cold data and order data within 1 year as hot data. This method is suitable for scenarios where there is a strong correlation between data access frequency and time.
2. **Access frequency differentiation**: Data with high frequency access is regarded as hot data, and data with low frequency access is regarded as cold data. For example, the content system can treat articles with very low page views as cold data and articles with high page views as hot data. This method needs to record the access frequency of the data, which is relatively expensive and is suitable for scenarios where there is a strong correlation between the access frequency and the data itself.

Data from a few years ago is not necessarily cold data. For example, some high-quality articles are still visited by many people a few years after they were published, but most newly published articles by ordinary users are rarely visited by anyone.

These two methods of distinguishing hot and cold data have their own advantages and disadvantages. In actual projects, they can be used in combination.

### The idea of separation of hot and cold

The idea of hot and cold separation is very simple, which is to classify the data and store it separately. The idea of hot and cold separation can be applied to many fields and scenarios, not just data storage, for example:

- In the email system, you can put recent, more important emails in your inbox, and older, less important emails in the archive.
- In daily life, you can place commonly used items in a conspicuous place, and put infrequently used items in the storage room or attic.
- In the library, the most popular and frequently borrowed books can be placed in a conspicuous area alone, and the less frequently borrowed books can be placed in an inconspicuous location.
-…

### Advantages and Disadvantages of Separating Hot and Cold Data

- Advantages: The query performance of hot data is optimized (most users' operating experience will be better), cost saving (the corresponding database type and hardware configuration can be selected according to the different storage requirements of hot and cold data, such as placing hot data on SSD and cold data on HDD)
- Disadvantages: Increased system complexity and risks (hot and cold data need to be separated, increased risk of data errors), low statistical efficiency (cold storage data may be needed for statistics).

## How to migrate cold data?

Cold data migration solution:

1. Business layer code implementation: When there is a write operation on data, the logic of hot and cold separation is triggered to determine whether the data is cold data or hot data. Cold data is put into the cold storage, and hot data is put into the hot storage. This solution will affect performance and the judgment logic of hot and cold data is not easy to determine. It also requires modification of the business layer code, so it is generally not used.
2. Task scheduling: You can use xxl-job or other distributed task scheduling platforms to regularly scan the database to find data that meets the cold data conditions, then copy them to the cold storage in batches and delete them from the hot storage. This method requires very little code modification and is very suitable for scenarios where hot and cold data are distinguished based on time.
3. Monitor the change log binlog of the database: extract the data that meets the cold data conditions from the binlog, then copy it to the cold storage, and delete it from the hot storage. This method does not require modifying the code, but it is not suitable for scenarios where hot and cold data are distinguished based on the time dimension.

If your company has a DBA, you can also ask the DBA to manually migrate the cold data and complete the migration of the cold data to the cold storage in one go. Then, use the solution introduced above to implement subsequent cold data migration.

## How to store cold data?

The storage requirements of cold data are mainly large capacity, low cost, high reliability, and access speed can be appropriately sacrificed.

Cold data storage solution:

- Small and medium-sized factories: Just use MySQL/PostgreSQL directly (do not change the database selection and keep it consistent with the database currently used by the project), such as adding a table to store cold data of a certain business or using a separate cold storage to store cold data (involving cross-database queries, increasing system complexity and maintenance difficulty)
- Major manufacturers: Hbase (commonly used), RocksDB, Doris, Cassandra

If the company's cost budget is sufficient, it can also directly use a distributed relational database such as TiDB to get it done in one step. TiDB 6.0 officially supports the separation of hot and cold data storage, which can reduce the cost of SSD usage. Using the data placement function of TiDB 6.0, you can realize hot and cold storage of massive data in the same cluster, store new hot data in SSD, and store historical cold data in HDD.

## Case sharing

- [How to quickly optimize an order form with tens of millions of data - Programmer Jidian - 2023](https://www.cnblogs.com/fulongyuanjushi/p/17910420.html)
- [Mass data hot and cold separation scheme and practice - ByteDance technical team - 2022](https://mp.weixin.qq.com/s/ZKRkZP6rLHuTE1wvnqmAPQ)