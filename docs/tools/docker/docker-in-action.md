---
title:  Docker从入门到上手干事
category: 开发工具
tag:
  - Docker
---

## Docker介绍

### 什么是 Docker？

说实话关于 Docker 是什么并不太好说，下面我通过四点向你说明 Docker 到底是个什么东西。

- Docker 是世界领先的软件容器平台，基于 **Go 语言** 进行开发实现。
- Docker 能够自动执行重复性任务，例如搭建和配置开发环境，从而解放开发人员。
- 用户可以方便地创建和使用容器，把自己的应用放入容器。容器还可以进行版本管理、复制、分享、修改，就像管理普通的代码一样。
- Docker 可以**对进程进行封装隔离，属于操作系统层面的虚拟化技术。** 由于隔离的进程独立于宿主和其它的隔离的进程，因此也称其为容器。

官网地址：https://www.docker.com/ 。

![认识容器](https://my-blog-to-use.oss-cn-beijing.aliyuncs.com/2019-7/container.png)

### 为什么要用 Docker?

Docker 可以让开发者打包他们的应用以及依赖包到一个轻量级、可移植的容器中，然后发布到任何流行的 Linux 机器上，也可以实现虚拟化。

容器是完全使用沙箱机制，相互之间不会有任何接口（类似 iPhone 的 app），更重要的是容器性能开销极低。

传统的开发流程中，我们的项目通常需要使用 MySQL、Redis、FastDFS 等等环境，这些环境都是需要我们手动去进行下载并配置的，安装配置流程极其复杂，而且不同系统下的操作也不一样。

Docker 的出现完美地解决了这一问题，我们可以在容器中安装 MySQL、Redis 等软件环境，使得应用和环境架构分开，它的优势在于：

1. 一致的运行环境，能够更轻松地迁移
2. 对进程进行封装隔离，容器与容器之间互不影响，更高效地利用系统资源
3. 可以通过镜像复制多个一致的容器

另外，[《Docker 从入门到实践》](https://yeasy.gitbook.io/docker_practice/introduction/why) 这本开源书籍中也已经给出了使用 Docker 的原因。

![](https://img-blog.csdnimg.cn/20210412220015698.png)

## Docker 的安装

### Windows

接下来对 Docker 进行安装，以 Windows 系统为例，访问 Docker 的官网：

![](https://oscimg.oschina.net/oscnet/up-4e3146984adaee0067bdc5e9b1d757bb479.png)

然后点击`Get Started`：

![](https://oscimg.oschina.net/oscnet/up-96adfbfebe3e59097c8ba25e55f68ba7908.png)

在此处点击`Download for Windows`即可进行下载。

如果你的电脑是`Windows 10 64位专业版`的操作系统，则在安装 Docker 之前需要开启一下`Hyper-V`，开启方式如下。打开控制面板，选择程序：

![](https://oscimg.oschina.net/oscnet/up-73ce678240826de0f49225250a970b4d205.png)

点击`启用或关闭Windows功能`：

![](https://oscimg.oschina.net/oscnet/up-9c7a96c332e56b9506325a1f1fdb608a659.png)

勾选上`Hyper-V`，点击确定即可：

![](https://oscimg.oschina.net/oscnet/up-aad4a58c5e917f7185908d6320d7fb06861.png)

完成更改后需要重启一下计算机。

开启了`Hyper-V`后，我们就可以对 Docker 进行安装了，打开安装程序后，等待片刻点击`Ok`即可：

![](https://oscimg.oschina.net/oscnet/up-62ac3c9184bdc21387755294613ff5054c6.png)

安装完成后，我们仍然需要重启计算机，重启后，若提示如下内容：

![](https://oscimg.oschina.net/oscnet/up-3585c7d6a4632134ed925493a7d43e14a43.png)

它的意思是询问我们是否使用 WSL2，这是基于 Windows 的一个 Linux 子系统，这里我们取消即可，它就会使用我们之前勾选的`Hyper-V`虚拟机。

因为是图形界面的操作，这里就不介绍 Docker Desktop 的具体用法了。

### Mac

直接使用 Homebrew 安装即可

```shell
brew install --cask docker
```

### Linux

下面来看看 Linux 中如何安装 Docker，这里以 CentOS7 为例。

在测试或开发环境中，Docker 官方为了简化安装流程，提供了一套便捷的安装脚本，执行这个脚本后就会自动地将一切准备工作做好，并且把 Docker 的稳定版本安装在系统中。

```shell
curl -fsSL get.docker.com -o get-docker.sh
```

```shell
sh get-docker.sh --mirror Aliyun
```

安装完成后直接启动服务：

```shell
systemctl start docker
```

推荐设置开机自启，执行指令：

```shell
systemctl enable docker
```

## Docker 中的几个概念

在正式学习 Docker 之前，我们需要了解 Docker 中的几个核心概念：

### 镜像

镜像就是一个只读的模板，镜像可以用来创建 Docker 容器，一个镜像可以创建多个容器

### 容器

容器是用镜像创建的运行实例，Docker 利用容器独立运行一个或一组应用。它可以被启动、开始、停止、删除，每个容器都是相互隔离的、保证安全的平台。 可以把容器看作是一个简易的 Linux 环境和运行在其中的应用程序。容器的定义和镜像几乎一模一样，也是一堆层的统一视角，唯一区别在于容器的最上面那一层是可读可写的

### 仓库

仓库是集中存放镜像文件的场所。仓库和仓库注册服务器是有区别的，仓库注册服务器上往往存放着多个仓库，每个仓库中又包含了多个镜像，每个镜像有不同的标签。 仓库分为公开仓库和私有仓库两种形式，最大的公开仓库是 DockerHub，存放了数量庞大的镜像供用户下载，国内的公开仓库有阿里云、网易云等

### 总结

通俗点说，一个镜像就代表一个软件；而基于某个镜像运行就是生成一个程序实例，这个程序实例就是容器；而仓库是用来存储 Docker 中所有镜像的。

其中仓库又分为远程仓库和本地仓库，和 Maven 类似，倘若每次都从远程下载依赖，则会大大降低效率，为此，Maven 的策略是第一次访问依赖时，将其下载到本地仓库，第二次、第三次使用时直接用本地仓库的依赖即可，Docker 的远程仓库和本地仓库的作用也是类似的。

## Docker 初体验

下面我们来对 Docker 进行一个初步的使用，这里以下载一个 MySQL 的镜像为例`(在CentOS7下进行)`。

和 GitHub 一样，Docker 也提供了一个 DockerHub 用于查询各种镜像的地址和安装教程，为此，我们先访问 DockerHub：[https://hub.docker.com/](https://hub.docker.com/)

![](https://oscimg.oschina.net/oscnet/up-37d083cc92fe36aad829e975646b9d27fa0.png)

在左上角的搜索框中输入`MySQL`并回车：

![](https://oscimg.oschina.net/oscnet/up-ced37002391a059754def9b3a6c2aa4e342.png)

可以看到相关 MySQL 的镜像非常多，若右上角有`OFFICIAL IMAGE`标识，则说明是官方镜像，所以我们点击第一个 MySQL 镜像：

![](https://oscimg.oschina.net/oscnet/up-48ba3fdc99c93a96e18b929195ca8e93c6c.png)

右边提供了下载 MySQL 镜像的指令为`docker pull MySQL`，但该指令始终会下载 MySQL 镜像的最新版本。

若是想下载指定版本的镜像，则点击下面的`View Available Tags`：

![](https://oscimg.oschina.net/oscnet/up-ed601649275c6cfe65bbe422b463c263a64.png)

这里就可以看到各种版本的镜像，右边有下载的指令，所以若是想下载 5.7.32 版本的 MySQL 镜像，则执行：

```shell
docker pull MySQL:5.7.32
```

然而下载镜像的过程是非常慢的，所以我们需要配置一下镜像源加速下载，访问`阿里云`官网：

![](https://oscimg.oschina.net/oscnet/up-0a46effd262d3db1b613a0db597efa31f34.png)

点击控制台：

![](https://oscimg.oschina.net/oscnet/up-60f198e0106be6b43044969d2900272504f.png)

然后点击左上角的菜单，在弹窗的窗口中，将鼠标悬停在产品与服务上，并在右侧搜索容器镜像服务，最后点击容器镜像服务：

![](https://oscimg.oschina.net/oscnet/up-2f6706a979b405dab01bc44a29bb6b26fc4.png)

点击左侧的镜像加速器，并依次执行右侧的配置指令即可。

```shell
sudo mkdir -p /etc/docker
sudo tee /etc/docker/daemon.json <<-'EOF'
{
  "registry-mirrors": ["https://679xpnpz.mirror.aliyuncs.com"]
}
EOF
sudo systemctl daemon-reload
sudo systemctl restart docker
```

## Docker 镜像指令

Docker 需要频繁地操作相关的镜像，所以我们先来了解一下 Docker 中的镜像指令。

若想查看 Docker 中当前拥有哪些镜像，则可以使用 `docker images` 命令。

```shell
[root@izrcf5u3j3q8xaz ~]# docker images
REPOSITORY    TAG       IMAGE ID       CREATED         SIZE
MySQL         5.7.32    f07dfa83b528   11 days ago     448MB
tomcat        latest    feba8d001e3f   2 weeks ago     649MB
nginx         latest    ae2feff98a0c   2 weeks ago     133MB
hello-world   latest    bf756fb1ae65   12 months ago   13.3kB
```

其中`REPOSITORY`为镜像名，`TAG`为版本标志，`IMAGE ID`为镜像 id(唯一的)，`CREATED`为创建时间，注意这个时间并不是我们将镜像下载到 Docker 中的时间，而是镜像创建者创建的时间，`SIZE`为镜像大小。

该指令能够查询指定镜像名：

```shell
docker image MySQL
```

若如此做，则会查询出 Docker 中的所有 MySQL 镜像：

```shell
[root@izrcf5u3j3q8xaz ~]# docker images MySQL
REPOSITORY   TAG       IMAGE ID       CREATED         SIZE
MySQL        5.6       0ebb5600241d   11 days ago     302MB
MySQL        5.7.32    f07dfa83b528   11 days ago     448MB
MySQL        5.5       d404d78aa797   20 months ago   205MB
```

该指令还能够携带`-q`参数：`docker images -q` ， `-q`表示仅显示镜像的 id：

```shell
[root@izrcf5u3j3q8xaz ~]# docker images -q
0ebb5600241d
f07dfa83b528
feba8d001e3f
d404d78aa797
```

若是要下载镜像，则使用：

```shell
docker pull MySQL:5.7
```

`docker pull`是固定的，后面写上需要下载的镜像名及版本标志；若是不写版本标志，而是直接执行`docker pull MySQL`，则会下载镜像的最新版本。

一般在下载镜像前我们需要搜索一下镜像有哪些版本才能对指定版本进行下载，使用指令：

```shell
docker search MySQL
```

![](https://oscimg.oschina.net/oscnet/up-559083ae80e7501e86e95fbbad25b6d571a.png)

不过该指令只能查看 MySQL 相关的镜像信息，而不能知道有哪些版本，若想知道版本，则只能这样查询：

```shell
docker search MySQL:5.5
```

![](https://oscimg.oschina.net/oscnet/up-68394e25f652964bb042571151c5e0fd2e9.png)

若是查询的版本不存在，则结果为空：

![](https://oscimg.oschina.net/oscnet/up-abfdd51b9ad2ced3711268369f52b077b12.png)

删除镜像使用指令：

```shell
docker image rm MySQL:5.5
```

若是不指定版本，则默认删除的也是最新版本。

还可以通过指定镜像 id 进行删除：

```shell
docker image rm bf756fb1ae65
```

然而此时报错了：

```shell
[root@izrcf5u3j3q8xaz ~]# docker image rm bf756fb1ae65
Error response from daemon: conflict: unable to delete bf756fb1ae65 (must be forced) - image is being used by stopped container d5b6c177c151
```

这是因为要删除的`hello-world`镜像正在运行中，所以无法删除镜像，此时需要强制执行删除：

```shell
docker image rm -f bf756fb1ae65
```

该指令会将镜像和通过该镜像执行的容器全部删除，谨慎使用。

Docker 还提供了删除镜像的简化版本：`docker rmi 镜像名:版本标志` 。

此时我们即可借助`rmi`和`-q`进行一些联合操作，比如现在想删除所有的 MySQL 镜像，那么你需要查询出 MySQL 镜像的 id，并根据这些 id 一个一个地执行`docker rmi`进行删除，但是现在，我们可以这样：

```shell
docker rmi -f $(docker images MySQL -q)
```

首先通过`docker images MySQL -q`查询出 MySQL 的所有镜像 id，`-q`表示仅查询 id，并将这些 id 作为参数传递给`docker rmi -f`指令，这样所有的 MySQL 镜像就都被删除了。

## Docker 容器指令

掌握了镜像的相关指令之后，我们需要了解一下容器的指令，容器是基于镜像的。

若需要通过镜像运行一个容器，则使用：

```shell
docker run tomcat:8.0-jre8
```

当然了，运行的前提是你拥有这个镜像，所以先下载镜像：

```shell
docker pull tomcat:8.0-jre8
```

下载完成后就可以运行了，运行后查看一下当前运行的容器：`docker ps` 。

![](https://oscimg.oschina.net/oscnet/up-bd48e20ef07b7c91ad16f92821a3dbca5b5.png)

其中`CONTAINER_ID`为容器的 id，`IMAGE`为镜像名，`COMMAND`为容器内执行的命令，`CREATED`为容器的创建时间，`STATUS`为容器的状态，`PORTS`为容器内服务监听的端口，`NAMES`为容器的名称。

通过该方式运行的 tomcat 是不能直接被外部访问的，因为容器具有隔离性，若是想直接通过 8080 端口访问容器内部的 tomcat，则需要对宿主机端口与容器内的端口进行映射：

```shell
docker run -p 8080:8080 tomcat:8.0-jre8
```

解释一下这两个端口的作用(`8080:8080`)，第一个 8080 为宿主机端口，第二个 8080 为容器内的端口，外部访问 8080 端口就会通过映射访问容器内的 8080 端口。

此时外部就可以访问 Tomcat 了：

![](https://oscimg.oschina.net/oscnet/up-16d9ff4d29094681f51424ea8d0ee4fd73e.png)

若是这样进行映射：

```shell
docker run -p 8088:8080 tomcat:8.0-jre8
```

则外部需访问 8088 端口才能访问 tomcat，需要注意的是，每次运行的容器都是相互独立的，所以同时运行多个 tomcat 容器并不会产生端口的冲突。

容器还能够以后台的方式运行，这样就不会占用终端：

```shell
docker run -d -p 8080:8080 tomcat:8.0-jre8
```

启动容器时默认会给容器一个名称，但这个名称其实是可以设置的，使用指令：

```shell
docker run -d -p 8080:8080 --name tomcat01 tomcat:8.0-jre8
```

此时的容器名称即为 tomcat01，容器名称必须是唯一的。

再来引申一下`docker ps`中的几个指令参数，比如`-a`：

```shell
docker ps -a
```

该参数会将运行和非运行的容器全部列举出来：

![](https://oscimg.oschina.net/oscnet/up-16d9ff4d29094681f51424ea8d0ee4fd73e.png)

`-q`参数将只查询正在运行的容器 id：`docker ps -q` 。

```shell
[root@izrcf5u3j3q8xaz ~]# docker ps -q
f3aac8ee94a3
074bf575249b
1d557472a708
4421848ba294
```

若是组合使用，则查询运行和非运行的所有容器 id：`docker ps -qa` 。

```shell
[root@izrcf5u3j3q8xaz ~]# docker ps -aq
f3aac8ee94a3
7f7b0e80c841
074bf575249b
a1e830bddc4c
1d557472a708
4421848ba294
b0440c0a219a
c2f5d78c5d1a
5831d1bab2a6
d5b6c177c151
```

接下来是容器的停止、重启指令，因为非常简单，就不过多介绍了。

```shell
docker start c2f5d78c5d1a
```

通过该指令能够将已经停止运行的容器运行起来，可以通过容器的 id 启动，也可以通过容器的名称启动。

```shell
docker restart c2f5d78c5d1a
```

该指令能够重启指定的容器。

```shell
docker stop c2f5d78c5d1a
```

该指令能够停止指定的容器。

```shell
docker kill c2f5d78c5d1a
```

该指令能够直接杀死指定的容器。

以上指令都能够通过容器的 id 和容器名称两种方式配合使用。

---

当容器被停止之后，容器虽然不再运行了，但仍然是存在的，若是想删除它，则使用指令：

```shell
docker rm d5b6c177c151
```

需要注意的是容器的 id 无需全部写出来，只需唯一标识即可。

若是想删除正在运行的容器，则需要添加`-f`参数强制删除：

```shell
docker rm -f d5b6c177c151
```

若是想删除所有容器，则可以使用组合指令：

```shell
docker rm -f $(docker ps -qa)
```

先通过`docker ps -qa`查询出所有容器的 id，然后通过`docker rm -f`进行删除。

---

当容器以后台的方式运行时，我们无法知晓容器的运行状态，若此时需要查看容器的运行日志，则使用指令：

```shell
docker logs 289cc00dc5ed
```

这样的方式显示的日志并不是实时的，若是想实时显示，需要使用`-f`参数：

```shell
docker logs -f 289cc00dc5ed
```

通过`-t`参数还能够显示日志的时间戳，通常与`-f`参数联合使用：

```shell
docker logs -ft 289cc00dc5ed
```

---

查看容器内运行了哪些进程，可以使用指令：

```shell
docker top 289cc00dc5ed
```

![](https://oscimg.oschina.net/oscnet/up-7ec71a682712e56e90490f55c32cf660fd3.png)

若是想与容器进行交互，则使用指令：

```shell
docker exec -it 289cc00dc5ed bash
```

![](https://oscimg.oschina.net/oscnet/up-fd17796322f833685ca8ead592d38581898.png)

此时终端将会进入容器内部，执行的指令都将在容器中生效，在容器内只能执行一些比较简单的指令，如：ls、cd 等，若是想退出容器终端，重新回到 CentOS 中，则执行`exit`即可。

现在我们已经能够进入容器终端执行相关操作了，那么该如何向 tomcat 容器中部署一个项目呢？

```shell
docker cp ./test.html 289cc00dc5ed:/usr/local/tomcat/webapps
```

通过`docker cp`指令能够将文件从 CentOS 复制到容器中，`./test.html`为 CentOS 中的资源路径，`289cc00dc5ed`为容器 id，`/usr/local/tomcat/webapps`为容器的资源路径，此时`test.html`文件将会被复制到该路径下。

```shell
[root@izrcf5u3j3q8xaz ~]# docker exec -it 289cc00dc5ed bash
root@289cc00dc5ed:/usr/local/tomcat# cd webapps
root@289cc00dc5ed:/usr/local/tomcat/webapps# ls
test.html
root@289cc00dc5ed:/usr/local/tomcat/webapps#
```

若是想将容器内的文件复制到 CentOS 中，则反过来写即可：

```shell
docker cp 289cc00dc5ed:/usr/local/tomcat/webapps/test.html ./
```

所以现在若是想要部署项目，则先将项目上传到 CentOS，然后将项目从 CentOS 复制到容器内，此时启动容器即可。

---

虽然使用 Docker 启动软件环境非常简单，但同时也面临着一个问题，我们无法知晓容器内部具体的细节，比如监听的端口、绑定的 ip 地址等等，好在这些 Docker 都帮我们想到了，只需使用指令：

```shell
docker inspect 923c969b0d91
```

![](https://oscimg.oschina.net/oscnet/up-fca74d4350cdfebfc2b06101e1cab411619.png)

## Docker 数据卷

学习了容器的相关指令之后，我们来了解一下 Docker 中的数据卷，它能够实现宿主机与容器之间的文件共享，它的好处在于我们对宿主机的文件进行修改将直接影响容器，而无需再将宿主机的文件再复制到容器中。

现在若是想将宿主机中`/opt/apps`目录与容器中`webapps`目录做一个数据卷，则应该这样编写指令：

```shell
docker run -d -p 8080:8080 --name tomcat01 -v /opt/apps:/usr/local/tomcat/webapps tomcat:8.0-jre8
```

然而此时访问 tomcat 会发现无法访问：

![](https://oscimg.oschina.net/oscnet/up-8fa1b23f6ea2567b5938370e7d7f636533f.png)

这就说明我们的数据卷设置成功了，Docker 会将容器内的`webapps`目录与`/opt/apps`目录进行同步，而此时`/opt/apps`目录是空的，导致`webapps`目录也会变成空目录，所以就访问不到了。

此时我们只需向`/opt/apps`目录下添加文件，就会使得`webapps`目录也会拥有相同的文件，达到文件共享，测试一下：

```shell
[root@centos-7 opt]# cd apps/
[root@centos-7 apps]# vim test.html
[root@centos-7 apps]# ls
test.html
[root@centos-7 apps]# cat test.html
<h1>This is a test html!</h1>
```

在`/opt/apps`目录下创建了一个 `test.html` 文件，那么容器内的`webapps`目录是否会有该文件呢？进入容器的终端：

```shell
[root@centos-7 apps]# docker exec -it tomcat01 bash
root@115155c08687:/usr/local/tomcat# cd webapps/
root@115155c08687:/usr/local/tomcat/webapps# ls
test.html
```

容器内确实已经有了该文件，那接下来我们编写一个简单的 Web 应用：

```java
public class HelloServlet extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        resp.getWriter().println("Hello World!");
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        doGet(req,resp);
    }
}
```

这是一个非常简单的 Servlet，我们将其打包上传到`/opt/apps`中，那么容器内肯定就会同步到该文件，此时进行访问：

![](https://oscimg.oschina.net/oscnet/up-712716a8c8c444ba3a77ade8ff27e7c6cf5.png)

这种方式设置的数据卷称为自定义数据卷，因为数据卷的目录是由我们自己设置的，Docker 还为我们提供了另外一种设置数据卷的方式：

```shell
docker run -d -p 8080:8080 --name tomcat01 -v aa:/usr/local/tomcat/webapps tomcat:8.0-jre8
```

此时的`aa`并不是数据卷的目录，而是数据卷的别名，Docker 会为我们自动创建一个名为`aa`的数据卷，并且会将容器内`webapps`目录下的所有内容复制到数据卷中，该数据卷的位置在`/var/lib/docker/volumes`目录下：

```shell
[root@centos-7 volumes]# pwd
/var/lib/docker/volumes
[root@centos-7 volumes]# cd aa/
[root@centos-7 aa]# ls
_data
[root@centos-7 aa]# cd _data/
[root@centos-7 _data]# ls
docs  examples  host-manager  manager  ROOT
```

此时我们只需修改该目录的内容就能能够影响到容器。

---

最后再介绍几个容器和镜像相关的指令：

```shell
docker commit -m "描述信息" -a "镜像作者" tomcat01 my_tomcat:1.0
```

该指令能够将容器打包成一个镜像，此时查询镜像：

```shell
[root@centos-7 _data]# docker images
REPOSITORY          TAG                 IMAGE ID            CREATED             SIZE
my_tomcat           1.0                 79ab047fade5        2 seconds ago       463MB
tomcat              8                   a041be4a5ba5        2 weeks ago         533MB
MySQL               latest              db2b37ec6181        2 months ago        545MB
```

若是想将镜像备份出来，则可以使用指令：

```shell
docker save my_tomcat:1.0 -o my-tomcat-1.0.tar
```

```shell
[root@centos-7 ~]# docker save my_tomcat:1.0 -o my-tomcat-1.0.tar
[root@centos-7 ~]# ls
anaconda-ks.cfg  initial-setup-ks.cfg  公共  视频  文档  音乐
get-docker.sh    my-tomcat-1.0.tar     模板  图片  下载  桌面
```

若是拥有`.tar`格式的镜像，该如何将其加载到 Docker 中呢？执行指令：

```shell
docker load -i my-tomcat-1.0.tar
```

```shell
root@centos-7 ~]# docker load -i my-tomcat-1.0.tar
b28ef0b6fef8: Loading layer [==================================================>]  105.5MB/105.5MB
0b703c74a09c: Loading layer [==================================================>]  23.99MB/23.99MB
......
Loaded image: my_tomcat:1.0
[root@centos-7 ~]# docker images
REPOSITORY          TAG                 IMAGE ID            CREATED             SIZE
my_tomcat           1.0                 79ab047fade5        7 minutes ago       463MB
```
