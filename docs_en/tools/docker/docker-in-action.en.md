---
title: Docker实战
category: 开发工具
tag:
  - Docker
head:
  - - meta
    - name: keywords
      content: Docker 实战,镜像构建,容器管理,环境一致性,部署,性能
  - - meta
    - name: description
      content: 通过实战理解 Docker 的镜像与容器管理，解决环境一致性与交付效率问题，提升开发测试部署的协同效率。
---

## Docker 介绍

开始之前，还是简单介绍一下 Docker，更多 Docker 概念介绍可以看前一篇文章[Docker 核心概念总结](./docker-intro.md)。

### 什么是 Docker？

说实话关于 Docker 是什么并不太好说，下面我通过四点向你说明 Docker 到底是个什么东西。

- Docker 是世界领先的软件容器平台，基于 **Go 语言** 进行开发实现。
- Docker 能够自动执行重复性任务，例如搭建和配置开发环境，从而解放开发人员。
- 用户可以方便地创建和使用容器，把自己的应用放入容器。容器还可以进行版本管理、复制、分享、修改，就像管理普通的代码一样。
- Docker 可以**对进程进行封装隔离，属于操作系统层面的虚拟化技术。** 由于隔离的进程独立于宿主和其它的隔离的进程，因此也称其为容器。

官网地址：<https://www.docker.com/> 。

![认识容器](https://oss.javaguide.cn/github/javaguide/tools/docker/container.png)

### 为什么要用 Docker?

Docker 可以让开发者打包他们的应用以及依赖包到一个轻量级、可移植的容器中，然后发布到任何流行的 Linux 机器上，也可以实现虚拟化。

容器是完全使用沙箱机制，相互之间不会有任何接口（类似 iPhone 的 app），更重要的是容器性能开销极低。

传统的开发流程中，我们的项目通常需要使用 MySQL、Redis、FastDFS 等等环境，这些环境都是需要我们手动去进行下载并配置的，安装配置流程极其复杂，而且不同系统下的操作也不一样。

Docker 的出现完美地解决了这一问题，我们可以在容器中安装 MySQL、Redis 等软件环境，使得应用和环境架构分开，它的优势在于：

1. 一致的运行环境，能够更轻松地迁移
2. 对进程进行封装隔离，容器与容器之间互不影响，更高效地利用系统资源
3. 可以通过镜像复制多个一致的容器

另外，[《Docker 从入门到实践》](https://yeasy.gitbook.io/docker_practice/introduction/why) 这本开源书籍中也已经给出了使用 Docker 的原因。

![](https://oss.javaguide.cn/github/javaguide/tools/docker/20210412220015698.png)

## Docker 的安装

### Windows

接下来对 Docker 进行安装，以 Windows 系统为例，访问 Docker 的官网：

![安装 Docker](https://oss.javaguide.cn/github/javaguide/tools/docker/docker-install-windows.png)

然后点击`Get Started`：

![安装 Docker](https://oss.javaguide.cn/github/javaguide/tools/docker/docker-install-windows-download.png)

在此处点击`Download for Windows`即可进行下载。

如果你的电脑是`Windows 10 64位专业版`的操作系统，则在安装 Docker 之前需要开启一下`Hyper-V`，开启方式如下。打开控制面板，选择程序：

![开启 Hyper-V](https://oss.javaguide.cn/github/javaguide/tools/docker/docker-windows-hyperv.png)

点击`启用或关闭Windows功能`：

![开启 Hyper-V](https://oss.javaguide.cn/github/javaguide/tools/docker/docker-windows-hyperv-enable.png)

勾选上`Hyper-V`，点击确定即可：

![开启 Hyper-V](https://oss.javaguide.cn/github/javaguide/tools/docker/docker-windows-hyperv-check.png)

完成更改后需要重启一下计算机。

开启了`Hyper-V`后，我们就可以对 Docker 进行安装了，打开安装程序后，等待片刻点击`Ok`即可：

![安装 Docker](https://oss.javaguide.cn/github/javaguide/tools/docker/docker-windows-hyperv-install.png)

安装完成后，我们仍然需要重启计算机，重启后，若提示如下内容：

![安装 Docker](https://oss.javaguide.cn/github/javaguide/tools/docker/docker-windows-hyperv-wsl2.png)

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

![DockerHub](https://oss.javaguide.cn/github/javaguide/tools/docker/dockerhub-com.png)

在左上角的搜索框中输入`MySQL`并回车：

![DockerHub 搜索 MySQL](https://oss.javaguide.cn/github/javaguide/tools/docker/dockerhub-mysql.png)

You can see that there are many related MySQL images. If there is an `OFFICIAL IMAGE` logo in the upper right corner, it means it is an official image, so we click on the first MySQL image:

![MySQL official image](https://oss.javaguide.cn/github/javaguide/tools/docker/dockerhub-mysql-official-image.png)

The command to download the MySQL image is `docker pull MySQL` on the right, but this command will always download the latest version of the MySQL image.

If you want to download the specified version of the image, click `View Available Tags` below:

![View other versions of MySQL](https://oss.javaguide.cn/github/javaguide/tools/docker/dockerhub-mysql-view-available-tags.png)

Here you can see various versions of the image, and there are download instructions on the right, so if you want to download the 5.7.32 version of the MySQL image, execute:

```shell
docker pull MySQL:5.7.32
```

However, the process of downloading the image is very slow, so we need to configure the image source to speed up the download. Visit the official website of `Alibaba Cloud` and click on the console:

![Alibaba Cloud Mirror Acceleration](https://oss.javaguide.cn/github/javaguide/tools/docker/docker-aliyun-mirror-admin.png)

Then click the menu in the upper left corner, in the pop-up window, hover the mouse over Products and Services, search for Container Image Service on the right, and finally click Container Image Service:

![Alibaba Cloud Mirror Acceleration](https://oss.javaguide.cn/github/javaguide/tools/docker/docker-aliyun-mirror-admin-accelerator.png)

Click on the image accelerator on the left and execute the configuration instructions on the right.

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

## Docker image instructions

Docker needs to frequently operate related images, so let's first understand the image instructions in Docker.

If you want to see what images are currently available in Docker, you can use the `docker images` command.

```shell
[root@izrcf5u3j3q8xaz ~]# docker images
REPOSITORY TAG IMAGE ID CREATED SIZE
MySQL 5.7.32 f07dfa83b528 11 days ago 448MB
tomcat latest feba8d001e3f 2 weeks ago 649MB
nginx latest ae2feff98a0c 2 weeks ago 133MB
hello-world latest bf756fb1ae65 12 months ago 13.3kB
```

Among them, `REPOSITORY` is the image name, `TAG` is the version mark, `IMAGE ID` is the image id (unique), and `CREATED` is the creation time. Note that this time is not the time when we download the image into Docker, but the time when the image creator created it. `SIZE` is the image size.

This command can query the specified image name:

```shell
docker image MySQL
```

If you do this, all MySQL images in Docker will be queried:

```shell
[root@izrcf5u3j3q8xaz ~]# docker images MySQL
REPOSITORY TAG IMAGE ID CREATED SIZE
MySQL 5.6 0ebb5600241d 11 days ago 302MB
MySQL 5.7.32 f07dfa83b528 11 days ago 448MB
MySQL 5.5 d404d78aa797 20 months ago 205MB
```

This command can also carry the `-q` parameter: `docker images -q`, `-q` means only displaying the id of the image:

```shell
[root@izrcf5u3j3q8xaz ~]# docker images -q
0ebb5600241d
f07dfa83b528
feba8d001e3f
d404d78aa797
```

If you want to download the image, use:

```shell
docker pull MySQL:5.7
```

`docker pull` is fixed, followed by the image name and version mark that need to be downloaded; if you do not write the version mark, but directly execute `docker pull MySQL`, the latest version of the image will be downloaded.

Generally before downloading the image, we need to search for which versions of the image are available to download the specified version. Use the command:

```shell
docker search MySQL
```

![](https://oss.javaguide.cn/github/javaguide/tools/docker/docker-search-mysql-terminal.png)

However, this command can only view MySQL-related image information, but cannot know which versions there are. If you want to know the version, you can only query like this:

```shell
docker search MySQL:5.5
```

If the queried version does not exist, the result will be empty:

![](https://oss.javaguide.cn/github/javaguide/tools/docker/docker-search-mysql-404-terminal.png)

Instructions for deleting images:

```shell
docker image rm MySQL:5.5
```

If you do not specify a version, the latest version will be deleted by default.

You can also delete it by specifying the image id:

```shell
docker image rm bf756fb1ae65
```

However, an error was reported at this time:

```shell
[root@izrcf5u3j3q8xaz ~]# docker image rm bf756fb1ae65
Error response from daemon: conflict: unable to delete bf756fb1ae65 (must be forced) - image is being used by stopped container d5b6c177c151
```

This is because the `hello-world` image to be deleted is running, so the image cannot be deleted. At this time, the deletion needs to be forced:

```shell
docker image rm -f bf756fb1ae65
```

This command will delete all the image and the containers executed through the image, so use it with caution.

Docker also provides a simplified version of deleting an image: `docker rmi image name:version flag`.

At this point we can use `rmi` and `-q` to perform some joint operations. For example, if you want to delete all MySQL images, you need to query the IDs of the MySQL images and execute `docker rmi` one by one based on these IDs to delete them. But now, we can do this:

```shell
docker rmi -f $(docker images MySQL -q)
```

First, query all MySQL image IDs through `docker images MySQL -q`. `-q` means querying only the ids, and pass these ids as parameters to the `docker rmi -f` command, so that all MySQL images will be deleted.

## Docker container instructions

After mastering the instructions related to the image, we need to understand the instructions of the container. The container is based on the image.

If you need to run a container through an image, use:

```shell
docker run tomcat:8.0-jre8
```

Of course, the prerequisite for running is that you have this image, so download the image first:

```shell
docker pull tomcat:8.0-jre8
```

After the download is completed, you can run it. After running, check the currently running container: `docker ps`.

![](https://oss.javaguide.cn/github/javaguide/tools/docker/docker-ps-terminal.png)

Among them, `CONTAINER_ID` is the id of the container, `IMAGE` is the image name, `COMMAND` is the command executed in the container, `CREATED` is the creation time of the container, `STATUS` is the status of the container, `PORTS` is the port that the service in the container listens to, and `NAMES` is the name of the container.Tomcat running in this way cannot be directly accessed from the outside because the container is isolated. If you want to directly access tomcat inside the container through port 8080, you need to map the host port and the port in the container:

```shell
docker run -p 8080:8080 tomcat:8.0-jre8
```

Explain the role of these two ports (`8080:8080`). The first 8080 is the host port, and the second 8080 is the port in the container. External access to port 8080 will access port 8080 in the container through mapping.

At this point, Tomcat can be accessed externally:

![](https://oss.javaguide.cn/github/javaguide/tools/docker/docker-run-tomact-8080.png)

If mapped like this:

```shell
docker run -p 8088:8080 tomcat:8.0-jre8
```

The outside world needs to access port 8088 to access tomcat. It should be noted that each running container is independent of each other, so running multiple tomcat containers at the same time will not cause port conflicts.

Containers can also run in the background so that they do not occupy the terminal:

```shell
docker run -d -p 8080:8080 tomcat:8.0-jre8
```

When starting a container, the container will be given a name by default, but this name can actually be set using the command:

```shell
docker run -d -p 8080:8080 --name tomcat01 tomcat:8.0-jre8
```

The container name at this time is tomcat01, and the container name must be unique.

Let’s extend some of the command parameters in `docker ps`, such as `-a`:

```shell
docker ps -a
```

This parameter will list all running and non-running containers.

The `-q` parameter will only query the running container id: `docker ps -q`.

```shell
[root@izrcf5u3j3q8xaz ~]# docker ps -q
f3aac8ee94a3
074bf575249b
1d557472a708
4421848ba294
```

If used in combination, query all running and non-running container IDs: `docker ps -qa`.

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

Next are the instructions to stop and restart the container. Because it is very simple, I will not introduce it in detail.

```shell
docker start c2f5d78c5d1a
```

This command can be used to start a stopped container. It can be started by the container id or the container name.

```shell
docker restart c2f5d78c5d1a
```

This command can restart the specified container.

```shell
docker stop c2f5d78c5d1a
```

This command can stop the specified container.

```shell
docker kill c2f5d78c5d1a
```

This command can directly kill the specified container.

The above commands can be used in conjunction with the container id and container name.

---

When the container is stopped, although the container is no longer running, it still exists. If you want to delete it, use the command:

```shell
docker rm d5b6c177c151
```

It should be noted that the ID of the container does not need to be written out in full, it only needs to be uniquely identified.

If you want to delete a running container, you need to add the `-f` parameter to force deletion:

```shell
docker rm -f d5b6c177c151
```

If you want to delete all containers, you can use the combined command:

```shell
docker rm -f $(docker ps -qa)
```

First query the IDs of all containers through `docker ps -qa`, and then delete them through `docker rm -f`.

---

When the container is running in the background, we cannot know the running status of the container. If we need to view the running log of the container at this time, use the command:

```shell
docker logs 289cc00dc5ed
```

The logs displayed in this way are not real-time. If you want to display them in real time, you need to use the `-f` parameter:

```shell
docker logs -f 289cc00dc5ed
```

The timestamp of the log can also be displayed through the `-t` parameter, which is usually used in conjunction with the `-f` parameter:

```shell
docker logs -ft 289cc00dc5ed
```

---

To see which processes are running in the container, you can use the command:

```shell
docker top 289cc00dc5ed
```

If you want to interact with the container, use the command:

```shell
docker exec -it 289cc00dc5ed bash
```

At this time, the terminal will enter the container, and the executed instructions will take effect in the container. Only some relatively simple instructions can be executed in the container, such as: ls, cd, etc. If you want to exit the container terminal and return to CentOS, just execute `exit`.

Now that we can enter the container terminal to perform relevant operations, how do we deploy a project to the tomcat container?

```shell
docker cp ./test.html 289cc00dc5ed:/usr/local/tomcat/webapps
```

Files can be copied from CentOS to the container through the `docker cp` command. `./test.html` is the resource path in CentOS, `289cc00dc5ed` is the container id, and `/usr/local/tomcat/webapps` is the resource path of the container. At this time, the `test.html` file will be copied to this path.

```shell
[root@izrcf5u3j3q8xaz ~]# docker exec -it 289cc00dc5ed bash
root@289cc00dc5ed:/usr/local/tomcat# cd webapps
root@289cc00dc5ed:/usr/local/tomcat/webapps# ls
test.html
root@289cc00dc5ed:/usr/local/tomcat/webapps#
```

If you want to copy the files in the container to CentOS, just write the opposite:

```shell
docker cp 289cc00dc5ed:/usr/local/tomcat/webapps/test.html ./
```

So now if you want to deploy the project, first upload the project to CentOS, then copy the project from CentOS to the container, and then start the container.

---

Although it is very simple to start the software environment using Docker, it also faces a problem. We cannot know the specific details inside the container, such as the listening port, the bound IP address, etc. Fortunately, Docker has helped us think of these, just use the command:

```shell
docker inspect 923c969b0d91
```

![](https://oss.javaguide.cn/github/javaguide/tools/docker/docker-inspect-terminal.png)

## Docker data volume

After learning the relevant instructions of the container, let's take a look at the data volume in Docker, which can realize file sharing between the host and the container. Its advantage is that our modifications to the host's files will directly affect the container, without the need to copy the host's files to the container.

Now if you want to make a data volume between the `/opt/apps` directory in the host and the `webapps` directory in the container, you should write the command like this:

```shell
docker run -d -p 8080:8080 --name tomcat01 -v /opt/apps:/usr/local/tomcat/webapps tomcat:8.0-jre8
```

However, when accessing tomcat at this time, you will find that you cannot access:

![](https://oss.javaguide.cn/github/javaguide/tools/docker/docker-data-volume-webapp-8080.png)

This means that our data volume setting is successful. Docker will synchronize the `webapps` directory in the container with the `/opt/apps` directory. At this time, the `/opt/apps` directory is empty, causing the `webapps` directory to become an empty directory, so it cannot be accessed.

At this point we only need to add files to the `/opt/apps` directory, which will make the `webapps` directory also have the same files, achieving file sharing. Test it:

```shell
[root@centos-7 opt]# cd apps/
[root@centos-7 apps]# vim test.html
[root@centos-7 apps]# ls
test.html
[root@centos-7 apps]# cat test.html
<h1>This is a test html!</h1>
```A `test.html` file is created in the `/opt/apps` directory. Will the `webapps` directory in the container have this file? Enter the container's terminal:

```shell
[root@centos-7 apps]# docker exec -it tomcat01 bash
root@115155c08687:/usr/local/tomcat# cd webapps/
root@115155c08687:/usr/local/tomcat/webapps# ls
test.html
```

The file does already exist in the container, so let's write a simple web application:

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

This is a very simple Servlet. We package it and upload it to `/opt/apps`, then the file will definitely be synchronized in the container. At this time, access:

![](https://oss.javaguide.cn/github/javaguide/tools/docker/docker-data-volume-webapp-8080-hello-world.png)

The data volume set in this way is called a custom data volume, because the directory of the data volume is set by ourselves. Docker also provides us with another way to set the data volume:

```shell
docker run -d -p 8080:8080 --name tomcat01 -v aa:/usr/local/tomcat/webapps tomcat:8.0-jre8
```

At this time, `aa` is not the directory of the data volume, but the alias of the data volume. Docker will automatically create a data volume named `aa` for us, and will copy all the contents of the `webapps` directory in the container to the data volume. The location of the data volume is in the `/var/lib/docker/volumes` directory:

```shell
[root@centos-7 volumes]# pwd
/var/lib/docker/volumes
[root@centos-7 volumes]# cd aa/
[root@centos-7 aa]# ls
_data
[root@centos-7 aa]# cd _data/
[root@centos-7 _data]# ls
docs examples host-manager manager ROOT
```

At this point we only need to modify the contents of the directory to affect the container.

---

Finally, we will introduce some instructions related to containers and images:

```shell
docker commit -m "Description information" -a "Mirror author" tomcat01 my_tomcat:1.0
```

This command can package the container into an image. At this time, query the image:

```shell
[root@centos-7 _data]# docker images
REPOSITORY TAG IMAGE ID CREATED SIZE
my_tomcat 1.0 79ab047fade5 2 seconds ago 463MB
tomcat 8 a041be4a5ba5 2 weeks ago 533MB
MySQL latest db2b37ec6181 2 months ago 545MB
```

If you want to back up the image, you can use the command:

```shell
docker save my_tomcat:1.0 -o my-tomcat-1.0.tar
```

```shell
[root@centos-7 ~]# docker save my_tomcat:1.0 -o my-tomcat-1.0.tar
[root@centos-7 ~]# ls
anaconda-ks.cfg initial-setup-ks.cfg public video document music
get-docker.sh my-tomcat-1.0.tar Template Image Download Desktop
```

If you have an image in `.tar` format, how to load it into Docker? Execution instructions:

```shell
docker load -i my-tomcat-1.0.tar
```

```shell
root@centos-7 ~]# docker load -i my-tomcat-1.0.tar
b28ef0b6fef8: Loading layer [==================================================>] 105.5MB/105.5MB
0b703c74a09c: Loading layer [==================================================>] 23.99MB/23.99MB
...
Loaded image: my_tomcat:1.0
[root@centos-7 ~]# docker images
REPOSITORY TAG IMAGE ID CREATED SIZE
my_tomcat 1.0 79ab047fade5 7 minutes ago 463MB
```

<!-- @include: @article-footer.snippet.md -->