---
title: 分布式事务完整解决方案详解
category: 分布式
tag:
  - 分布式事务
  - 微服务
head:
  - - meta
    - name: keywords
      content: 分布式事务,CAP,BASE,2PC,3PC,TCC,Saga,本地消息表,MQ事务消息,Seata
  - - meta
    - name: description
      content: 全面讲解分布式事务的理论基础、常见解决方案和实际应用，包括2PC、3PC、TCC、Saga等模式的详细实现。
---

# 分布式事务完整解决方案详解

在微服务架构中，一个业务操作往往需要跨越多个服务和数据库，如何保证数据的一致性成为了一个核心问题。本文将全面介绍分布式事务的理论基础和实践方案。

## 什么是分布式事务

### 本地事务 vs 分布式事务

**本地事务**：

```java
@Transactional
public void createOrder(Order order) {
    // 在同一个数据库中执行
    orderMapper.insert(order);
    inventoryMapper.decrease(order.getProductId(), order.getQuantity());
    accountMapper.decrease(order.getUserId(), order.getAmount());
    // 要么全部成功，要么全部回滚
}
```

**分布式事务**：

```java
// 订单服务
public void createOrder(Order order) {
    orderService.create(order);           // 订单数据库
    inventoryService.decrease(order);      // 库存数据库
    accountService.decrease(order);        // 账户数据库
    // 跨多个服务和数据库，如何保证一致性？
}
```

### 分布式事务的挑战

1. **网络不可靠**：服务间通信可能失败
2. **服务独立**：每个服务有自己的数据库
3. **性能开销**：协调多个服务的事务成本高
4. **复杂度高**：需要处理各种异常情况

## 理论基础

### CAP 定理

CAP 定理指出，分布式系统最多只能同时满足以下三项中的两项：

- **C (Consistency)** - 一致性：所有节点在同一时间看到相同的数据
- **A (Availability)** - 可用性：每个请求都能得到响应（成功或失败）
- **P (Partition Tolerance)** - 分区容错性：系统在网络分区时仍能继续运行

**重要结论**：
- 网络分区是客观存在的，所以 P 必须保证
- 只能在 C 和 A 之间做权衡
- CP 系统：牺牲可用性保证一致性（如 ZooKeeper）
- AP 系统：牺牲强一致性保证可用性（如 Cassandra）

### BASE 理论

BASE 是对 CAP 中 AP 方案的延伸，核心思想是：

- **BA (Basically Available)** - 基本可用：允许损失部分可用性
- **S (Soft State)** - 软状态：允许系统中的数据存在中间状态
- **E (Eventually Consistent)** - 最终一致性：经过一段时间后，数据最终达到一致

**BASE vs ACID**：

| 特性 | ACID | BASE |
|------|------|------|
| 一致性 | 强一致性 | 最终一致性 |
| 隔离性 | 严格隔离 | 允许中间状态 |
| 可用性 | 可能牺牲 | 优先保证 |
| 适用场景 | 单体应用 | 分布式系统 |

## 分布式事务解决方案

### 1. 两阶段提交（2PC）

#### 原理

2PC 将事务提交分为两个阶段：

**阶段一：准备阶段（Prepare）**

```
协调者                参与者1              参与者2
   |                     |                    |
   |---准备事务--------->|                    |
   |                     |---执行但不提交---->|
   |                     |<---准备完成--------|  
   |<--准备完成----------|                    |
   |                     |                    |
```

**阶段二：提交阶段（Commit）**

```
协调者                参与者1              参与者2
   |                     |                    |
   |---提交事务--------->|                    |
   |                     |---提交------------>|
   |                     |<---提交完成--------|  
   |<--提交完成----------|                    |
```

#### 代码示例

```java
public class TwoPhaseCommitCoordinator {
    private List<Participant> participants;
    
    public boolean executeTransaction(Transaction tx) {
        // 阶段一：准备
        boolean allPrepared = true;
        for (Participant p : participants) {
            if (!p.prepare(tx)) {
                allPrepared = false;
                break;
            }
        }
        
        // 阶段二：提交或回滚
        if (allPrepared) {
            for (Participant p : participants) {
                p.commit(tx);
            }
            return true;
        } else {
            for (Participant p : participants) {
                p.rollback(tx);
            }
            return false;
        }
    }
}

interface Participant {
    boolean prepare(Transaction tx);
    void commit(Transaction tx);
    void rollback(Transaction tx);
}
```

#### 优缺点

**优点**：
- 强一致性保证
- 实现相对简单

**缺点**：
- 同步阻塞：所有参与者在等待期间都处于阻塞状态
- 单点故障：协调者故障导致整个系统不可用
- 数据不一致：网络分区可能导致部分提交部分回滚
- 性能开销大：需要多次网络通信

### 2. 三阶段提交（3PC）

3PC 是 2PC 的改进版本，增加了超时机制和 CanCommit 阶段。

#### 三个阶段

**阶段一：CanCommit**
- 协调者询问参与者是否可以执行事务
- 参与者返回 Yes 或 No

**阶段二：PreCommit**
- 如果都返回 Yes，发送 PreCommit 请求
- 参与者执行事务但不提交

**阶段三：DoCommit**
- 协调者发送 Commit 或 Abort
- 参与者执行最终操作

#### 改进点

```java
public class ThreePhaseCommitCoordinator {
    private static final long TIMEOUT = 30000; // 30秒超时
    
    public boolean executeTransaction(Transaction tx) {
        // 阶段一：CanCommit
        if (!canCommit(tx)) {
            return false;
        }
        
        // 阶段二：PreCommit
        try {
            if (!preCommit(tx)) {
                abort(tx);
                return false;
            }
        } catch (TimeoutException e) {
            abort(tx);
            return false;
        }
        
        // 阶段三：DoCommit
        try {
            doCommit(tx);
            return true;
        } catch (TimeoutException e) {
            // 超时后参与者会自动提交
            return true;
        }
    }
}
```

### 3. TCC（Try-Confirm-Cancel）

TCC 是一种补偿型事务，将业务逻辑分为三个阶段。

#### 三个阶段

**Try 阶段**：
- 尝试执行业务
- 完成所有业务检查
- 预留必需的业务资源

**Confirm 阶段**：
- 确认执行业务
- 使用 Try 阶段预留的资源
- 不做任何业务检查

**Cancel 阶段**：
- 取消执行业务
- 释放 Try 阶段预留的资源

#### 实现示例

```java
// 订单服务
@Service
public class OrderService {
    
    // Try：创建订单，状态为"处理中"
    @Transactional
    public void tryCreate(Order order) {
        order.setStatus("PROCESSING");
        orderMapper.insert(order);
    }
    
    // Confirm：确认订单
    @Transactional
    public void confirmCreate(String orderId) {
        Order order = orderMapper.selectById(orderId);
        order.setStatus("SUCCESS");
        orderMapper.update(order);
    }
    
    // Cancel：取消订单
    @Transactional
    public void cancelCreate(String orderId) {
        Order order = orderMapper.selectById(orderId);
        order.setStatus("CANCELLED");
        orderMapper.update(order);
    }
}

// 库存服务
@Service
public class InventoryService {
    
    // Try：冻结库存
    @Transactional
    public void tryDecrease(String productId, int quantity) {
        Inventory inventory = inventoryMapper.selectById(productId);
        
        if (inventory.getAvailable() < quantity) {
            throw new InsufficientInventoryException();
        }
        
        // 可用库存减少，冻结库存增加
        inventory.setAvailable(inventory.getAvailable() - quantity);
        inventory.setFrozen(inventory.getFrozen() + quantity);
        inventoryMapper.update(inventory);
    }
    
    // Confirm：扣减库存
    @Transactional
    public void confirmDecrease(String productId, int quantity) {
        Inventory inventory = inventoryMapper.selectById(productId);
        
        // 冻结库存减少
        inventory.setFrozen(inventory.getFrozen() - quantity);
        inventoryMapper.update(inventory);
    }
    
    // Cancel：解冻库存
    @Transactional
    public void cancelDecrease(String productId, int quantity) {
        Inventory inventory = inventoryMapper.selectById(productId);
        
        // 恢复可用库存，减少冻结库存
        inventory.setAvailable(inventory.getAvailable() + quantity);
        inventory.setFrozen(inventory.getFrozen() - quantity);
        inventoryMapper.update(inventory);
    }
}

// TCC 协调器
@Service
public class TCCCoordinator {
    
    @Autowired
    private OrderService orderService;
    
    @Autowired
    private InventoryService inventoryService;
    
    @Autowired
    private AccountService accountService;
    
    public void createOrder(Order order) {
        String txId = UUID.randomUUID().toString();
        
        try {
            // Try 阶段
            orderService.tryCreate(order);
            inventoryService.tryDecrease(order.getProductId(), order.getQuantity());
            accountService.tryDecrease(order.getUserId(), order.getAmount());
            
            // 记录事务日志
            saveTxLog(txId, "TRY", "SUCCESS");
            
            // Confirm 阶段
            orderService.confirmCreate(order.getId());
            inventoryService.confirmDecrease(order.getProductId(), order.getQuantity());
            accountService.confirmDecrease(order.getUserId(), order.getAmount());
            
            saveTxLog(txId, "CONFIRM", "SUCCESS");
            
        } catch (Exception e) {
            // Cancel 阶段
            orderService.cancelCreate(order.getId());
            inventoryService.cancelDecrease(order.getProductId(), order.getQuantity());
            accountService.cancelDecrease(order.getUserId(), order.getAmount());
            
            saveTxLog(txId, "CANCEL", "SUCCESS");
            throw e;
        }
    }
}
```

#### TCC 的优缺点

**优点**：
- 性能较好，不需要长时间锁定资源
- 可以跨数据库、跨服务
- 业务逻辑清晰

**缺点**：
- 业务侵入性强，需要实现 Try、Confirm、Cancel 三个接口
- 开发成本高
- 需要考虑幂等性

### 4. Saga 模式

Saga 模式将长事务拆分为多个本地短事务，每个短事务都有对应的补偿操作。

#### 两种实现方式

**协同式（Choreography）**：

```java
// 订单服务
@Service
public class OrderSagaService {
    
    @Autowired
    private EventPublisher eventPublisher;
    
    // 步骤1：创建订单
    @Transactional
    public void createOrder(Order order) {
        orderMapper.insert(order);
        
        // 发布订单创建事件
        eventPublisher.publish(new OrderCreatedEvent(order));
    }
    
    // 补偿操作：取消订单
    @Transactional
    @EventListener
    public void cancelOrder(OrderCancelEvent event) {
        Order order = orderMapper.selectById(event.getOrderId());
        order.setStatus("CANCELLED");
        orderMapper.update(order);
    }
}

// 库存服务
@Service
public class InventorySagaService {
    
    @Autowired
    private EventPublisher eventPublisher;
    
    // 步骤2：扣减库存
    @Transactional
    @EventListener
    public void decreaseInventory(OrderCreatedEvent event) {
        try {
            Inventory inventory = inventoryMapper.selectById(event.getProductId());
            inventory.setQuantity(inventory.getQuantity() - event.getQuantity());
            inventoryMapper.update(inventory);
            
            // 发布库存扣减成功事件
            eventPublisher.publish(new InventoryDecreasedEvent(event));
            
        } catch (Exception e) {
            // 发布失败事件，触发补偿
            eventPublisher.publish(new InventoryDecreaseFailedEvent(event));
        }
    }
    
    // 补偿操作：恢复库存
    @Transactional
    @EventListener
    public void restoreInventory(OrderCancelEvent event) {
        Inventory inventory = inventoryMapper.selectById(event.getProductId());
        inventory.setQuantity(inventory.getQuantity() + event.getQuantity());
        inventoryMapper.update(inventory);
    }
}
```

**编排式（Orchestration）**：

```java
@Service
public class OrderSagaOrchestrator {
    
    @Autowired
    private OrderService orderService;
    
    @Autowired
    private InventoryService inventoryService;
    
    @Autowired
    private AccountService accountService;
    
    public void createOrder(Order order) {
        SagaDefinition saga = SagaDefinition.create()
            .step()
                .invoke(() -> orderService.create(order))
                .withCompensation(() -> orderService.cancel(order.getId()))
            .step()
                .invoke(() -> inventoryService.decrease(order))
                .withCompensation(() -> inventoryService.restore(order))
            .step()
                .invoke(() -> accountService.decrease(order))
                .withCompensation(() -> accountService.restore(order))
            .build();
        
        sagaExecutor.execute(saga);
    }
}
```

### 5. 本地消息表

本地消息表方案通过在业务数据库中增加消息表来保证最终一致性。

#### 实现步骤

```java
// 消息表
@Table(name = "local_message")
public class LocalMessage {
    private String id;
    private String content;
    private String status;  // PENDING, SENT, CONFIRMED
    private int retryCount;
    private Date createTime;
    private Date updateTime;
}

// 订单服务
@Service
public class OrderService {
    
    @Autowired
    private OrderMapper orderMapper;
    
    @Autowired
    private LocalMessageMapper messageMapper;
    
    @Autowired
    private MessageProducer messageProducer;
    
    // 步骤1：在本地事务中保存业务数据和消息
    @Transactional
    public void createOrder(Order order) {
        // 保存订单
        orderMapper.insert(order);
        
        // 保存本地消息
        LocalMessage message = new LocalMessage();
        message.setId(UUID.randomUUID().toString());
        message.setContent(JSON.toJSONString(order));
        message.setStatus("PENDING");
        messageMapper.insert(message);
    }
    
    // 步骤2：定时任务发送消息
    @Scheduled(fixedDelay = 5000)
    public void sendPendingMessages() {
        List<LocalMessage> messages = messageMapper.selectPending();
        
        for (LocalMessage message : messages) {
            try {
                // 发送消息到MQ
                messageProducer.send("order-topic", message.getContent());
                
                // 更新消息状态
                message.setStatus("SENT");
                messageMapper.update(message);
                
            } catch (Exception e) {
                // 增加重试次数
                message.setRetryCount(message.getRetryCount() + 1);
                messageMapper.update(message);
                
                if (message.getRetryCount() > 3) {
                    // 告警
                    alertService.alert("消息发送失败: " + message.getId());
                }
            }
        }
    }
}

// 库存服务
@Service
public class InventoryService {
    
    @Autowired
    private InventoryMapper inventoryMapper;
    
    @Autowired
    private MessageProducer messageProducer;
    
    // 步骤3：消费消息并执行业务
    @RabbitListener(queues = "order-topic")
    public void handleOrderCreated(String message) {
        Order order = JSON.parseObject(message, Order.class);
        
        try {
            // 扣减库存
            Inventory inventory = inventoryMapper.selectById(order.getProductId());
            inventory.setQuantity(inventory.getQuantity() - order.getQuantity());
            inventoryMapper.update(inventory);
            
            // 发送确认消息
            messageProducer.send("order-confirm-topic", order.getId());
            
        } catch (Exception e) {
            // 消费失败，消息会重新入队
            throw new RuntimeException("库存扣减失败", e);
        }
    }
}
```

### 6. MQ 事务消息

以 RocketMQ 为例，支持事务消息来保证分布式事务。

#### 实现流程

```java
@Service
public class OrderService {
    
    @Autowired
    private TransactionMQProducer producer;
    
    @Autowired
    private OrderMapper orderMapper;
    
    public void createOrder(Order order) {
        // 发送半消息
        Message message = new Message("order-topic", 
            JSON.toJSONString(order).getBytes());
        
        TransactionSendResult result = producer.sendMessageInTransaction(
            message, order);
        
        if (result.getLocalTransactionState() == LocalTransactionState.COMMIT_MESSAGE) {
            log.info("订单创建成功: {}", order.getId());
        }
    }
    
    // 本地事务执行器
    @Component
    public class OrderTransactionListener implements TransactionListener {
        
        @Autowired
        private OrderMapper orderMapper;
        
        // 执行本地事务
        @Override
        public LocalTransactionState executeLocalTransaction(
                Message msg, Object arg) {
            try {
                Order order = (Order) arg;
                orderMapper.insert(order);
                return LocalTransactionState.COMMIT_MESSAGE;
            } catch (Exception e) {
                return LocalTransactionState.ROLLBACK_MESSAGE;
            }
        }
        
        // 事务状态回查
        @Override
        public LocalTransactionState checkLocalTransaction(
                MessageExt msg) {
            String orderId = msg.getKeys();
            Order order = orderMapper.selectById(orderId);
            
            if (order != null) {
                return LocalTransactionState.COMMIT_MESSAGE;
            } else {
                return LocalTransactionState.ROLLBACK_MESSAGE;
            }
        }
    }
}
```

## 分布式事务框架

### Seata

Seata 是阿里开源的分布式事务解决方案，支持 AT、TCC、Saga、XA 四种模式。

#### AT 模式示例

```java
// 配置
@Configuration
public class SeataConfig {
    @Bean
    public GlobalTransactionScanner globalTransactionScanner() {
        return new GlobalTransactionScanner(
            "order-service", "default");
    }
}

// 使用
@Service
public class OrderService {
    
    @Autowired
    private OrderMapper orderMapper;
    
    @Autowired
    private InventoryFeignClient inventoryClient;
    
    @Autowired
    private AccountFeignClient accountClient;
    
    @GlobalTransactional(name = "create-order", rollbackFor = Exception.class)
    public void createOrder(Order order) {
        // 本地事务
        orderMapper.insert(order);
        
        // 远程调用
        inventoryClient.decrease(order.getProductId(), order.getQuantity());
        accountClient.decrease(order.getUserId(), order.getAmount());
        
        // 任何一步失败都会自动回滚
    }
}
```

## 方案对比与选择

| 方案 | 一致性 | 性能 | 复杂度 | 适用场景 |
|------|--------|------|--------|----------|
| 2PC/3PC | 强一致 | 低 | 中 | 金融核心系统 |
| TCC | 最终一致 | 高 | 高 | 对性能要求高的场景 |
| Saga | 最终一致 | 高 | 中 | 长流程业务 |
| 本地消息表 | 最终一致 | 中 | 低 | 通用场景 |
| MQ事务消息 | 最终一致 | 高 | 低 | 异步场景 |
| Seata AT | 强一致 | 中 | 低 | 快速接入 |

## 最佳实践

### 1. 幂等性设计

```java
@Service
public class IdempotentService {
    
    @Autowired
    private RedisTemplate<String, String> redis;
    
    public boolean processOrder(String orderId) {
        String key = "order:" + orderId;
        
        // 使用 Redis SETNX 保证幂等
        Boolean success = redis.opsForValue()
            .setIfAbsent(key, "1", 24, TimeUnit.HOURS);
        
        if (Boolean.TRUE.equals(success)) {
            // 首次处理
            doProcess(orderId);
            return true;
        } else {
            // 重复请求
            return false;
        }
    }
}
```

### 2. 超时控制

```java
@Service
public class TimeoutService {
    
    @HystrixCommand(
        commandProperties = {
            @HystrixProperty(name = "execution.isolation.thread.timeoutInMilliseconds", 
                           value = "3000")
        },
        fallbackMethod = "fallback"
    )
    public String callRemoteService() {
        return remoteService.call();
    }
    
    public String fallback() {
        return "服务降级";
    }
}
```

### 3. 补偿机制

```java
@Service
public class CompensationService {
    
    @Scheduled(fixedDelay = 60000)
    public void compensate() {
        // 查询超时未完成的事务
        List<Transaction> timeoutTxs = txMapper.selectTimeout();
        
        for (Transaction tx : timeoutTxs) {
            try {
                // 执行补偿逻辑
                compensate(tx);
            } catch (Exception e) {
                log.error("补偿失败: {}", tx.getId(), e);
            }
        }
    }
}
```

## 总结

分布式事务没有银弹，需要根据具体业务场景选择合适的方案：

1. **金融核心系统**：使用 2PC/XA 保证强一致性
2. **电商订单系统**：使用 TCC 或 Saga 保证最终一致性
3. **消息通知系统**：使用本地消息表或 MQ 事务消息
4. **快速接入**：使用 Seata AT 模式

关键是要理解 CAP 和 BASE 理论，在一致性、可用性和性能之间做出合理的权衡。

<!-- @include: @article-footer.snippet.md -->
