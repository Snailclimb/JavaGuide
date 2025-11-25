---
title: Docker核心概念总结
category: 开发工具
tag:
  - Docker
head:
  - - meta
    - name: keywords
      content: Docker,容器,镜像,仓库,引擎,隔离,虚拟机对比,部署
  - - meta
    - name: description
      content: 梳理 Docker 的核心概念与容器/虚拟机差异，掌握镜像、容器与仓库的关系及在交付部署中的实际价值。
---

本文只是对 Docker 的概念做了较为详细的介绍，并不涉及一些像 Docker 环境的安装以及 Docker 的一些常见操作和命令。

## 容器介绍

**Docker 是世界领先的软件容器平台**，所以想要搞懂 Docker 的概念我们必须先从容器开始说起。

### 什么是容器?

#### 先来看看容器较为官方的解释

**一句话概括容器：容器就是将软件打包成标准化单元，以用于开发、交付和部署。**

- **容器镜像是轻量的、可执行的独立软件包** ，包含软件运行所需的所有内容：代码、运行时环境、系统工具、系统库和设置。
- **容器化软件适用于基于 Linux 和 Windows 的应用，在任何环境中都能够始终如一地运行。**
- **容器赋予了软件独立性**，使其免受外在环境差异（例如，开发和预演环境的差异）的影响，从而有助于减少团队间在相同基础设施上运行不同软件时的冲突。

#### 再来看看容器较为通俗的解释

如果需要通俗地描述容器的话，我觉得容器就是一个存放东西的地方，就像书包可以装各种文具、衣柜可以放各种衣服、鞋架可以放各种鞋子一样。我们现在所说的容器存放的东西可能更偏向于应用比如网站、程序甚至是系统环境。

![认识容器](https://oss.javaguide.cn/github/javaguide/tools/docker/container.png)

### 图解物理机,虚拟机与容器

关于虚拟机与容器的对比在后面会详细介绍到，这里只是通过网上的图片加深大家对于物理机、虚拟机与容器这三者的理解(下面的图片来源于网络)。

**物理机：**

![物理机](https://oss.javaguide.cn/github/javaguide/tools/docker/%E7%89%A9%E7%90%86%E6%9C%BA%E5%9B%BE%E8%A7%A3.jpeg)

**虚拟机：**

![虚拟机](https://oss.javaguide.cn/github/javaguide/tools/docker/%E8%99%9A%E6%8B%9F%E6%9C%BA%E5%9B%BE%E8%A7%A3.jpeg)

**容器：**

![](https://oss.javaguide.cn/javaguide/image-20211110104003678.png)

通过上面这三张抽象图，我们可以大概通过类比概括出：**容器虚拟化的是操作系统而不是硬件，容器之间是共享同一套操作系统资源的。虚拟机技术是虚拟出一套硬件后，在其上运行一个完整操作系统。因此容器的隔离级别会稍低一些。**

### 容器 VS 虚拟机

每当说起容器，我们不得不将其与虚拟机做一个比较。就我而言，对于两者无所谓谁会取代谁，而是两者可以和谐共存。

简单来说：**容器和虚拟机具有相似的资源隔离和分配优势，但功能有所不同，因为容器虚拟化的是操作系统，而不是硬件，因此容器更容易移植，效率也更高。**

传统虚拟机技术是虚拟出一套硬件后，在其上运行一个完整操作系统，在该系统上再运行所需应用进程；而容器内的应用进程直接运行于宿主的内核，容器内没有自己的内核，而且也没有进行硬件虚拟。因此容器要比传统虚拟机更为轻便。

![](https://oss.javaguide.cn/javaguide/2e2b95eebf60b6d03f6c1476f4d7c697.png)

**容器和虚拟机的对比**：

![](https://oss.javaguide.cn/javaguide/4ef8691d67eb1eb53217099d0a691eb5.png)

- 容器是一个应用层抽象，用于将代码和依赖资源打包在一起。 多个容器可以在同一台机器上运行，共享操作系统内核，但各自作为独立的进程在用户空间中运行 。与虚拟机相比， **容器占用的空间较少**（容器镜像大小通常只有几十兆），**瞬间就能完成启动** 。

- 虚拟机 (VM) 是一个物理硬件层抽象，用于将一台服务器变成多台服务器。管理程序允许多个 VM 在一台机器上运行。每个 VM 都包含一整套操作系统、一个或多个应用、必要的二进制文件和库资源，因此 **占用大量空间** 。而且 VM **启动也十分缓慢** 。

通过 Docker 官网，我们知道了这么多 Docker 的优势，但是大家也没有必要完全否定虚拟机技术，因为两者有不同的使用场景。**虚拟机更擅长于彻底隔离整个运行环境**。例如，云服务提供商通常采用虚拟机技术隔离不同的用户。而 **Docker 通常用于隔离不同的应用** ，例如前端，后端以及数据库。

就我而言，对于两者无所谓谁会取代谁，而是两者可以和谐共存。

![](https://oss.javaguide.cn/javaguide/056c87751b9dd7b56f4264240fe96d00.png)

## Docker 介绍

### 什么是 Docker?

说实话关于 Docker 是什么并不太好说，下面我通过四点向你说明 Docker 到底是个什么东西。

- **Docker 是世界领先的软件容器平台。**
- **Docker** 使用 Google 公司推出的 **Go 语言** 进行开发实现，基于 **Linux 内核** 提供的 CGroup 功能和 namespace 来实现的，以及 AUFS 类的 **UnionFS** 等技术，**对进程进行封装隔离，属于操作系统层面的虚拟化技术。** 由于隔离的进程独立于宿主和其它的隔离的进程，因此也称其为容器。
- Docker 能够自动执行重复性任务，例如搭建和配置开发环境，从而解放了开发人员以便他们专注在真正重要的事情上：构建杰出的软件。
- 用户可以方便地创建和使用容器，把自己的应用放入容器。容器还可以进行版本管理、复制、分享、修改，就像管理普通的代码一样。

**Docker 思想**：

- **集装箱**：就像海运中的集装箱一样，Docker 容器包含了应用程序及其所有依赖项，确保在任何环境中都能以相同的方式运行。
- **标准化**：运输方式、存储方式、API 接口。
- **隔离**：每个 Docker 容器都在自己的隔离环境中运行，与宿主机和其他容器隔离。

### Docker 容器的特点

- **轻量** : 在一台机器上运行的多个 Docker 容器可以共享这台机器的操作系统内核；它们能够迅速启动，只需占用很少的计算和内存资源。镜像是通过文件系统层进行构造的，并共享一些公共文件。这样就能尽量降低磁盘用量，并能更快地下载镜像。
- **标准** : Docker 容器基于开放式标准，能够在所有主流 Linux 版本、Microsoft Windows 以及包括 VM、裸机服务器和云在内的任何基础设施上运行。
- **安全** : Docker 赋予应用的隔离性不仅限于彼此隔离，还独立于底层的基础设施。Docker 默认提供最强的隔离，因此应用出现问题，也只是单个容器的问题，而不会波及到整台机器。

### 为什么要用 Docker ?

- Docker 的镜像提供了除内核外完整的运行时环境，确保了应用运行环境一致性，从而不会再出现 “这段代码在我机器上没问题啊” 这类问题；——一致的运行环境
- 可以做到秒级、甚至毫秒级的启动时间。大大的节约了开发、测试、部署的时间。——更快速的启动时间
- 避免公用的服务器，资源会容易受到其他用户的影响。——隔离性
- 善于处理集中爆发的服务器使用压力；——弹性伸缩，快速扩展
- 可以很轻易的将在一个平台上运行的应用，迁移到另一个平台上，而不用担心运行环境的变化导致应用无法正常运行的情况。——迁移方便
- 使用 Docker 可以通过定制应用镜像来实现持续集成、持续交付、部署。——持续交付和部署

---

## Docker 基本概念

Docker 中有非常重要的三个基本概念：镜像（Image）、容器（Container）和仓库（Repository）。

理解了这三个概念，就理解了 Docker 的整个生命周期。

![](https://oss.javaguide.cn/github/javaguide/tools/docker/docker-build-run.jpeg)

### 镜像(Image):一个特殊的文件系统

**操作系统分为内核和用户空间**。对于 Linux 而言，内核启动后，会挂载 root 文件系统为其提供用户空间支持。而 Docker 镜像（Image），就相当于是一个 root 文件系统。

**Docker 镜像是一个特殊的文件系统，除了提供容器运行时所需的程序、库、资源、配置等文件外，还包含了一些为运行时准备的一些配置参数（如匿名卷、环境变量、用户等）。** 镜像不包含任何动态数据，其内容在构建之后也不会被改变。

Docker 设计时，就充分利用 **Union FS** 的技术，将其设计为**分层存储的架构** 。镜像实际是由多层文件系统联合组成。

**镜像构建时，会一层层构建，前一层是后一层的基础。每一层构建完就不会再发生改变，后一层上的任何改变只发生在自己这一层。** 比如，删除前一层文件的操作，实际不是真的删除前一层的文件，而是仅在当前层标记为该文件已删除。在最终容器运行的时候，虽然不会看到这个文件，但是实际上该文件会一直跟随镜像。因此，在构建镜像的时候，需要额外小心，每一层尽量只包含该层需要添加的东西，任何额外的东西应该在该层构建结束前清理掉。

分层存储的特征还使得镜像的复用、定制变的更为容易。甚至可以用之前构建好的镜像作为基础层，然后进一步添加新的层，以定制自己所需的内容，构建新的镜像。

### 容器(Container):镜像运行时的实体

镜像（Image）和容器（Container）的关系，就像是面向对象程序设计中的 类 和 实例 一样，镜像是静态的定义，**容器是镜像运行时的实体。容器可以被创建、启动、停止、删除、暂停等** 。

**容器的实质是进程，但与直接在宿主执行的进程不同，容器进程运行于属于自己的独立的 命名空间。前面讲过镜像使用的是分层存储，容器也是如此。**

**容器存储层的生存周期和容器一样，容器消亡时，容器存储层也随之消亡。因此，任何保存于容器存储层的信息都会随容器删除而丢失。**

按照 Docker 最佳实践的要求，**容器不应该向其存储层内写入任何数据** ，容器存储层要保持无状态化。**所有的文件写入操作，都应该使用数据卷（Volume）、或者绑定宿主目录**，在这些位置的读写会跳过容器存储层，直接对宿主(或网络存储)发生读写，其性能和稳定性更高。数据卷的生存周期独立于容器，容器消亡，数据卷不会消亡。因此， **使用数据卷后，容器可以随意删除、重新 run ，数据却不会丢失。**

### 仓库(Repository):集中存放镜像文件的地方

镜像构建完成后，可以很容易的在当前宿主上运行，但是， **如果需要在其它服务器上使用这个镜像，我们就需要一个集中的存储、分发镜像的服务，Docker Registry 就是这样的服务。**

一个 Docker Registry 中可以包含多个仓库（Repository）；每个仓库可以包含多个标签（Tag）；每个标签对应一个镜像。所以说：**镜像仓库是 Docker 用来集中存放镜像文件的地方类似于我们之前常用的代码仓库。**

通常，**一个仓库会包含同一个软件不同版本的镜像**，而**标签就常用于对应该软件的各个版本** 。我们可以通过`<仓库名>:<标签>`的格式来指定具体是这个软件哪个版本的镜像。如果不给出标签，将以 latest 作为默认标签.。

**这里补充一下 Docker Registry 公开服务和私有 Docker Registry 的概念：**

**Docker Registry 公开服务** 是开放给用户使用、允许用户管理镜像的 Registry 服务。一般这类公开服务允许用户免费上传、下载公开的镜像，并可能提供收费服务供用户管理私有镜像。

最常使用的 Registry 公开服务是官方的 **Docker Hub** ，这也是默认的 Registry，并拥有大量的高质量的官方镜像，网址为：[https://hub.docker.com/](https://hub.docker.com/ "https://hub.docker.com/") 。官方是这样介绍 Docker Hub 的：

> Docker Hub 是 Docker 官方提供的一项服务，用于与您的团队查找和共享容器镜像。

比如我们想要搜索自己想要的镜像：

![利用Docker Hub 搜索镜像](https://oss.javaguide.cn/github/javaguide/tools/docker/Screen%20Shot%202019-11-04%20at%208.21.39%20PM.png)

在 Docker Hub 的搜索结果中，有几项关键的信息有助于我们选择合适的镜像：

- **OFFICIAL Image**：代表镜像为 Docker 官方提供和维护，相对来说稳定性和安全性较高。
- **Stars**：和点赞差不多的意思，类似 GitHub 的 Star。
- **Downloads**：代表镜像被拉取的次数，基本上能够表示镜像被使用的频度。

当然，除了直接通过 Docker Hub 网站搜索镜像这种方式外，我们还可以通过 `docker search` 这个命令搜索 Docker Hub 中的镜像，搜索的结果是一致的。

```bash
➜  ~ docker search mysql
NAME                              DESCRIPTION                                     STARS               OFFICIAL            AUTOMATED
mysql                             MySQL is a widely used, open-source relation…   8763                [OK]
mariadb                           MariaDB is a community-developed fork of MyS…   3073                [OK]
mysql/mysql-server                Optimized MySQL Server Docker images. Create…   650                                     [OK]
```

在国内访问 **Docker Hub** 可能会比较慢国内也有一些云服务商提供类似于 Docker Hub 的公开服务。比如 [时速云镜像库](https://www.tenxcloud.com/ "时速云镜像库")、[网易云镜像服务](https://www.163yun.com/product/repo "网易云镜像服务")、[DaoCloud 镜像市场](https://www.daocloud.io/ "DaoCloud 镜像市场")、[阿里云镜像库](https://www.aliyun.com/product/containerservice?utm_content=se_1292836 "阿里云镜像库")等。

除了使用公开服务外，用户还可以在 **本地搭建私有 Docker Registry** 。Docker 官方提供了 Docker Registry 镜像，可以直接使用做为私有 Registry 服务。开源的 Docker Registry 镜像只提供了 Docker Registry API 的服务端实现，足以支持 Docker 命令，不影响使用。但不包含图形界面，以及镜像维护、用户管理、访问控制等高级功能。

### Image、Container 和 Repository 的关系

下面这一张图很形象地展示了 Image、Container、Repository 和 Registry/Hub 这四者的关系：

![Docker 架构](https://oss.javaguide.cn/github/javaguide/tools/docker/docker-regitstry.png)

- Dockerfile 是一个文本文件，包含了一系列的指令和参数，用于定义如何构建一个 Docker 镜像。运行 `docker build`命令并指定一个 Dockerfile 时，Docker 会读取 Dockerfile 中的指令，逐步构建一个新的镜像，并将其保存在本地。
- `docker pull` 命令可以从指定的 Registry/Hub 下载一个镜像到本地，默认使用 Docker Hub。
- `docker run` 命令可以从本地镜像创建一个新的容器并启动它。如果本地没有镜像，Docker 会先尝试从 Registry/Hub 拉取镜像。
- `docker push` 命令可以将本地的 Docker 镜像上传到指定的 Registry/Hub。

上面涉及到了一些 Docker 的基本命令，后面会详细介绍大。

### Build Ship and Run

Docker 的概念基本上已经讲完，我们再来谈谈：Build, Ship, and Run。

如果你搜索 Docker 官网，会发现如下的字样：**“Docker - Build, Ship, and Run Any App, Anywhere”**。那么 Build, Ship, and Run 到底是在干什么呢？

![](https://oss.javaguide.cn/github/javaguide/tools/docker/docker-build-ship-run.jpg)

- **Build（构建镜像）**：镜像就像是集装箱包括文件以及运行环境等等资源。
- **Ship（运输镜像）**：主机和仓库间运输，这里的仓库就像是超级码头一样。
- **Run （运行镜像）**：运行的镜像就是一个容器，容器就是运行程序的地方。

Docker 运行过程也就是去仓库把镜像拉到本地，然后用一条命令把镜像运行起来变成容器。所以，我们也常常将 Docker 称为码头工人或码头装卸工，这和 Docker 的中文翻译搬运工人如出一辙。

## Docker 常见命令

### 基本命令

```bash
docker version # 查看docker版本
docker images # 查看所有已下载镜像，等价于：docker image ls 命令
docker container ls # 查看所有容器
docker ps #查看正在运行的容器
docker image prune # 清理临时的、没有被使用的镜像文件。-a, --all: 删除所有没有用的镜像，而不仅仅是临时文件；
```

### 拉取镜像

`docker pull` 命令默认使用的 Registry/Hub 是 Docker Hub。当你执行 docker pull 命令而没有指定任何 Registry/Hub 的地址时，Docker 会从 Docker Hub 拉取镜像。

```bash
docker search mysql # 查看mysql相关镜像
docker pull mysql:5.7 # 拉取mysql镜像
docker image ls # 查看所有已下载镜像
```

### 构建镜像

运行 `docker build`命令并指定一个 Dockerfile 时，Docker 会读取 Dockerfile 中的指令，逐步构建一个新的镜像，并将其保存在本地。

```bash
#
# imageName 是镜像名称，1.0.0 是镜像的版本号或标签
docker build -t imageName:1.0.0 .
```

需要注意：Dockerfile 的文件名不必须为 Dockerfile，也不一定要放在构建上下文的根目录中。使用 `-f` 或 `--file` 选项，可以指定任何位置的任何文件作为 Dockerfile。当然，一般大家习惯性的会使用默认的文件名 `Dockerfile`，以及会将其置于镜像构建上下文目录中。

### 删除镜像

比如我们要删除我们下载的 mysql 镜像。

通过 `docker rmi [image]` （等价于`docker image rm [image]`）删除镜像之前首先要确保这个镜像没有被容器引用（可以通过标签名称或者镜像 ID 删除）。通过我们前面讲的`docker ps`命令即可查看。

```shell
➜  ~ docker ps
CONTAINER ID        IMAGE               COMMAND                  CREATED             STATUS              PORTS                               NAMES
c4cd691d9f80        mysql:5.7           "docker-entrypoint.s…"   7 weeks ago         Up 12 days          0.0.0.0:3306->3306/tcp, 33060/tcp   mysql
```

可以看到 mysql 正在被 id 为 c4cd691d9f80 的容器引用，我们需要首先通过 `docker stop c4cd691d9f80` 或者 `docker stop mysql`暂停这个容器。

然后查看 mysql 镜像的 id

```shell
➜  ~ docker images
REPOSITORY              TAG                 IMAGE ID            CREATED             SIZE
mysql                   5.7                 f6509bac4980        3 months ago        373MB
```

通过 IMAGE ID 或者 REPOSITORY 名字即可删除

```shell
docker rmi f6509bac4980 #  或者 docker rmi mysql
```

### 镜像推送

`docker push` 命令用于将本地的 Docker 镜像上传到指定的 Registry/Hub。

```bash
# 将镜像推送到私有镜像仓库 Harbor
# harbor.example.com是私有镜像仓库的地址，ubuntu是镜像的名称，18.04是镜像的版本标签
docker push harbor.example.com/ubuntu:18.04
```

镜像推送之前，要确保本地已经构建好需要推送的 Docker 镜像。另外，务必先登录到对应的镜像仓库。

## Docker 数据管理

在容器中管理数据主要有两种方式：

1. 数据卷（Volumes）
2. 挂载主机目录 (Bind mounts)

![Docker 数据管理](https://oss.javaguide.cn/github/javaguide/tools/docker/docker-data-management.png)

数据卷是由 Docker 管理的数据存储区域，有如下这些特点：

- 可以在容器之间共享和重用。
- 即使容器被删除，数据卷中的数据也不会被自动删除，从而确保数据的持久性。
- 对数据卷的修改会立马生效。
- 对数据卷的更新，不会影响镜像。

```bash
# 创建一个数据卷
docker volume create my-vol
# 查看所有的数据卷
docker volume ls
# 查看数据卷的具体信息
docker inspect web
# 删除指定的数据卷
docker volume rm my-vol
```

在用 `docker run` 命令的时候，使用 `--mount` 标记来将一个或多个数据卷挂载到容器里。

还可以通过 `--mount` 标记将宿主机上的文件或目录挂载到容器中，这使得容器可以直接访问宿主机的文件系统。Docker 挂载主机目录的默认权限是读写，用户也可以通过增加 `readonly` 指定为只读。

## Docker Compose

### 什么是 Docker Compose？有什么用？

Docker Compose 是 Docker 官方编排（Orchestration）项目之一，基于 Python 编写，负责实现对 Docker 容器集群的快速编排。通过 Docker Compose，开发者可以使用 YAML 文件来配置应用的所有服务，然后只需一个简单的命令即可创建和启动所有服务。

Docker Compose 是开源项目，地址：<https://github.com/docker/compose>。

Docker Compose 的核心功能：

- **多容器管理**：允许用户在一个 YAML 文件中定义和管理多个容器。
- **服务编排**：配置容器间的网络和依赖关系。
- **一键部署**：通过简单的命令，如`docker-compose up`和`docker-compose down`，可以轻松地启动和停止整个应用程序。

Docker Compose 简化了多容器应用程序的开发、测试和部署过程，提高了开发团队的生产力，同时降低了应用程序的部署复杂度和管理成本。

### Docker Compose 文件基本结构

Docker Compose 文件是 Docker Compose 工具的核心，用于定义和配置多容器 Docker 应用。这个文件通常命名为 `docker-compose.yml`，采用 YAML（YAML Ain't Markup Language）格式编写。

Docker Compose 文件基本结构如下：

- **版本（version）：** 指定 Compose 文件格式的版本。版本决定了可用的配置选项。
- **服务（services）：** 定义了应用中的每个容器（服务）。每个服务可以使用不同的镜像、环境设置和依赖关系。
  - **镜像（image）：** 从指定的镜像中启动容器，可以是存储仓库、标签以及镜像 ID。
  - **命令（command）：** 可选，覆盖容器启动后默认执行的命令。在启动服务时运行特定的命令或脚本，常用于启动应用程序、执行初始化脚本等。
  - **端口（ports）：** 可选，映射容器和宿主机的端口。
  - **依赖（depends_on）：** 依赖配置的选项，意思是如果服务启动是如果有依赖于其他服务的，先启动被依赖的服务，启动完成后在启动该服务。
  - **环境变量（environment）：** 可选，设置服务运行所需的环境变量。
  - **重启（restart）:** 可选，控制容器的重启策略。在容器退出时，根据指定的策略自动重启容器。
  - **服务卷（volumes）:** 可选，定义服务使用的卷，用于数据持久化或在容器之间共享数据。
  - **构建（build）：** 指定构建镜像的 dockerfile 的上下文路径，或者详细配置对象。
- **Networks:** Defines network connections between containers.
- **Volumes:** Data volume definitions used for data persistence and sharing. Commonly used for database storage, configuration files, logs and other data persistence.

```yaml
version: "3.8" # Define version, indicating the version of docker-compose syntax currently used
services: # Services, there can be multiple
    servicename1: # Service name, which is also the DNS name that can be used by the internal bridge network. If it is not in cluster mode, it is equivalent to a name specified when docker run.
   #Cluster (Swarm) mode is a logical abstraction of multiple containers
        image: # The name of the image
        command: # Optional, if set, it will override the CMD command in the default image
        environment: # Optional, equivalent to setting environment variables with the --env option in docker container run
        volumes: # Optional, equivalent to the -v option in docker container run to bind data volumes
        networks: # Optional, equivalent to the --network option in docker container run to specify the network
        ports: # Optional, equivalent to the -p option in docker container run to specify port mapping
        restart: # Optional, control the restart strategy of the container
        build: #Build directory
        depends_on: #Service dependency configuration
    servicename2:
        image:
        command:
        networks:
    	ports:
    servicename3:
    #...
volumes: # Optional, the data volume to be created, similar to docker volume create
  db_data:
networks: # Optional, equivalent to docker network create
```

### Docker Compose common commands

#### Start

`docker-compose up` will create and start containers based on the services defined in the `docker-compose.yml` file and connect them to the default network.

```bash
# Find the docker-compose.yml file in the current directory and start the application based on the services defined in it
docker-compose up
#Background startup
docker-compose up -d
# Force all containers to be recreated, even if they already exist
docker-compose up --force-recreate
# Rebuild the image
docker-compose up --build
#Specify the service name to start instead of starting all services
# Multiple services can be specified at the same time, separated by spaces.
docker-compose up service_name
```

In addition, if the name of the Compose file is not `docker-compose.yml`, there is no problem. You can specify it through the `-f` parameter.

```bash
docker-compose -f docker-compose.prod.yml up
```

#### Pause

`docker-compose down` is used to stop and remove containers and networks started by `docker-compose up`.

```bash
# Find the docker-compose.yml file in the current directory
# Remove all started containers, networks and volumes as defined there.
docker-compose down
# Stop the container but don't remove it
docker-compose down --stop
# Specify specific services to stop and remove instead of stopping and removing all services
# Multiple services can be specified at the same time, separated by spaces.
docker-compose down service_name
```

Similarly, if the name of the Compose file is not `docker-compose.yml`, there is no problem, it can be specified through the `-f` parameter.

```bash
docker-compose -f docker-compose.prod.yml down
```

#### View

`docker-compose ps` is used to view the status information of all containers started by `docker-compose up`.

```bash
# View status information of all containers
docker-compose ps
# Show only service names
docker-compose ps --services
# View the container of the specified service
docker-compose ps service_name
```

#### Others

| Commands | Introduction |
|---------------------|----------------------|
| `docker-compose version` | View version |
| `docker-compose images` | List images used by all containers |
| `docker-compose kill` | Force the container to stop the service |
| `docker-compose exec` | Execute commands in the container |
| `docker-compose logs` | View logs |
| `docker-compose pause` | Pause service |
| `docker-compose unpause` | Restore service |
| `docker-compose push` | Push service image |
| `docker-compose start` | Start a currently stopped container |
| `docker-compose stop` | Stop a currently running container |
| `docker-compose rm` | Delete containers with stopped services |
| `docker-compose top` | View processes |

## Docker underlying principles

First of all, Docker is software based on lightweight virtualization technology. So what is virtualization technology?

To put it simply, virtualization technology can be defined like this:

> Virtualization technology is a resource management technology that combines various physical resources of the computer ([CPU](https://zh.wikipedia.org/wiki/CPU "CPU"), [Memory](https://zh.wikipedia.org/wiki/Memory "Memory"), [Disk Space](https://zh.wikipedia.org/wiki/Disk Space "Disk space"), [Network Adapter](https://zh.wikipedia.org/wiki/Network Adapter "Network Adapter"), etc.), are abstracted, converted and presented, and can be divided and combined into one or more computer configuration environments. As a result, the inseparable barriers between physical structures are broken, allowing users to utilize these computer hardware resources in a better way than the original configuration. These new virtual portions of resources are not limited by how existing resources are deployed, geographically or physically configured. Generally referred to as virtualization resources include computing power and data storage.

Docker technology is based on LXC (Linux container-Linux container) virtual container technology.

> LXC, whose name comes from the abbreviation of Linux Containers, is an operating system-level virtualization technology and is a user space interface for the Linux kernel container function. It packages the application software system into a software container (Container), which contains the code of the application software itself, as well as the required operating system core and libraries. Allocate available hardware resources of different software containers through a unified namespace and shared API, creating an independent sandbox running environment for applications, allowing Linux users to easily create and manage system or application containers.

LXC technology is mainly implemented with the help of the CGroup function and namespace provided in the Linux kernel. LXC can provide an independent operating system running environment for software.

**Introduction to cgroup and namespace:**

- **namespace is the way the Linux kernel uses to isolate kernel resources. ** Through namespace, some processes can only see a part of the resources related to themselves, while other processes can only see some resources related to themselves. These two processes cannot feel the existence of each other at all. The specific implementation method is to specify the related resources of one or more processes in the same namespace. Linux namespaces are a kind of encapsulation and isolation of global system resources, so that processes in different namespaces have independent global system resources. Changing system resources in a namespace will only affect processes in the current namespace and has no impact on processes in other namespaces.

  (The above introduction to namespace comes from <https://www.cnblogs.com/sparkdev/p/9365405.html>. For more information about namespace, please check this article).- **CGroup is the abbreviation of Control Groups. It is a mechanism provided by the Linux kernel that can limit, record, and isolate the physical resources (such as cpu memory I/O, etc.) used by process groups (process groups). **

  (The above introduction to CGroup comes from <https://www.ibm.com/developerworks/cn/linux/1506_cgroup/index.html>. For more information about CGroup, please check this article).

**Comparison between cgroup and namespace:**

Both group processes, but their functions are essentially different. Namespace is used to isolate resources between process groups, while cgroup is used to uniformly monitor and limit resources for a group of processes.

## Summary

This article mainly explains in detail some common concepts and commands in Docker. From scratch to getting started, you can read this article [Docker from getting started to getting started](https://javaguide.cn/tools/docker/docker-in-action.html), the content is very detailed!

In addition, I would like to recommend a very high-quality open source book ["Docker from Getting Started to Practice"](https://yeasy.gitbook.io/docker_practice/introduction/why ""Docker from Getting Started to Practice""). The content of this book is very new. After all, the content of the book is open source and can be improved at any time.

!["Docker from getting started to practice" website homepage](https://oss.javaguide.cn/github/javaguide/tools/docker/docker-getting-started-practice-website-homepage.png)

## Reference

- [Docker Compose: A comprehensive guide from zero foundation to practical application](https://juejin.cn/post/7306756690727747610)
- [Linux Namespace and Cgroup](https://segmentfault.com/a/1190000009732550 "Linux Namespace and Cgroup")
- [LXC vs Docker: Why Docker is Better](https://www.upguard.com/articles/docker-vs-lxc "LXC vs Docker: Why Docker is Better")
- [CGroup introduction, application examples and principle description](https://www.ibm.com/developerworks/cn/linux/1506_cgroup/index.html "CGroup introduction, application examples and principle description")

<!-- @include: @article-footer.snippet.md -->