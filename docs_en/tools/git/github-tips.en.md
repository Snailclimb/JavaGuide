---
title: Summary of Github practical tips
category: development tools
tag:
  - Git
head:
  - - meta
    - name: keywords
      content: Github skills, personal homepage, README, statistics, open source contributions, resume
  - - meta
    - name: description
      content: A summary of tips for efficient use of Github, including personalized homepage, automatic resume and statistical display, to enhance personal branding and open source collaboration experience.
---

I have been using Github for more than 6 years. Today, I will give the Github tips that I find useful without reservation to all the friends who follow JavaGuide.

## Generate Github resume & Github annual report with one click

Through [https://resume.github.io/](https://resume.github.io/) you can generate an online Github resume with one click.

When the school I attended was recruiting, an online Github resume was placed in my personal information. I think this will make the interviewer feel that you are an expert and will improve some impression points.

However, if you don’t have any projects on Github, don’t put it in your resume. The generated effect is shown in the figure below.

![Github resume](https://oss.javaguide.cn/2020-11/image-20201108192205620.png)

Through the <https://www.githubtrends.io/wrapped> website, you can generate a Github personal annual report. This annual report will list your project contributions during the year, the most commonly used programming languages, and detailed contribution information.

![](https://oss.javaguide.cn/github/dootask/image-20211226144607457.png)

## Personalized Github homepage

Github currently supports custom display of some content on personal homepages. The display effect is shown in the figure below.

![Personalized homepage display effect](https://oss.javaguide.cn/java-guide-blog/image-20210616221212259.png)

It's very easy to do this, you just need to create a repository with the same name as your Github account, and then customize the contents of `README.md`.

The custom content displayed on your homepage is the content of `README.md` (_Friends who don’t know Markdown syntax will face the wall for 5 minutes_).

![Create a warehouse with the same name as your Github account](https://oss.javaguide.cn/java-guide-blog/image-20201107110309341.png)

This can also be played with flowers! For example: through the open source project [github-readme-stats](https://hellogithub.com/periodical/statistics/click/?target=https://github.com/anuraghazra/github-readme-stats), you can display dynamically generated GitHub statistics in the README. The display effect is shown in the figure below.

![Dynamicly generate GitHub statistics through github-readme-stats](https://oss.javaguide.cn/java-guide-blog/image-20210616221312426.png)

I won’t go into detail about the personalized homepage. Interested friends can research it on their own.

## Custom project badge

The project badges you see on Github are all generated through the website [https://shields.io/](https://shields.io/). The badge for my JavaGuide project is shown below.

![Project Badge](https://oss.javaguide.cn/2020-11/image-20201107143136559.png)

Moreover, not only can you generate static badges, shield.io can also dynamically read the status of your project and generate corresponding badges.

![Customized project badge](https://oss.javaguide.cn/2020-11/image-20201107143502356.png)

The generated badge effect describing the project status is shown in the figure below.

![Badge describing project status](https://oss.javaguide.cn/2020-11/image-20201107143752642.png)

## Automatically add a contribution icon to the project

Through the repobeats tool, you can add a basic project contribution chart to the Github project as shown below, which is quite good 👍

![](https://oss.javaguide.cn/github/dootask/repobeats.png)

Address: <https://repobeats.axiom.co/>.

## Github Emoticons

![Github emoticon](https://oss.javaguide.cn/2020-11/image-20201107162254582.png)

If you want to use emoticons on Github, you can find them here: [www.webfx.com/tools/emoji-cheat-sheet/](https://www.webfx.com/tools/emoji-cheat-sheet/).

![Online Github Expression](https://oss.javaguide.cn/2020-11/image-20201107162432941.png)

## Efficiently read the source code of Github projects

Codespaces launched by Github some time ago can provide an online IDE similar to VS Code, but it has not yet been fully developed and used.

Let me briefly introduce some of my most commonly used ways to read the source code of Github projects.

### Chrome plugin Octotree

This is a cliché and one of my favorite methods. After using Octotree, the sidebar of the web page will display projects in a tree structure, giving us an IDE-like experience of reading source code.

![Chrome plug-in Octotree](https://oss.javaguide.cn/2020-11/image-20201107144944798.png)

### Chrome Plugin SourceGraph

I usually use this method to read the project source code when I don't want to clone the project locally. SourceGraph not only allows us to view code elegantly on Github, it also supports some cool operations, such as jumping between classes, code search and other functions.

After you download this plug-in, there will be a small icon on your project homepage as shown below. Click this small icon to read the project source code online.

![](https://oss.javaguide.cn/2020-11/image-20201107145749659.png)

Using SourceGraph to read the code is as follows. The code is also displayed in a tree structure, but I personally feel that it is not as comfortable as Octotree. However, SourceGraph has many built-in plug-ins, and it also supports jumping between classes!

![](https://oss.javaguide.cn/2020-11/image-20201107150307314.png)

### Clone the project locally

First clone the project locally, and then use your favorite IDE to read it. It can be said to be the most sour and refreshing way!

This is the preferred method if you want to learn more about a project. A `git clone` and you're done.

## Extend the functionality of Github

**Enhanced GitHub** can make your Github better to use. This Chrome extension visualizes the size of your Github repository, the size of each file and allows you to quickly download individual files.

![](https://oss.javaguide.cn/2020-11/image-20201107160817672.png)

## Automatically generate a directory for Markdown files

If you want to generate a directory for Markdown files on Github, you can use the **Markdown Preview Enhanced** plugin of VS Code.

The generated directory effect is shown in the figure below. You can directly click on the link in the table of contents to jump to the corresponding position of the article, which can optimize the reading experience.

![](<https://oss.javaguide.cn/2020-11/iShot2020-11-07%2016.14.14%20(1).png>)

However, currently Github has automatically generated a directory for Markdown files, which only needs to be displayed by clicking.

![](https://oss.javaguide.cn/github/cosy/image-20211227093215005.png)

## Make good use of Github Explore

In fact, Github's own Explore is a very powerful and easy-to-use function. However, according to my observation, many Github users in China do not know what this is for.

Simply put, Github Explore can bring you the following services:

1. Can recommend projects to you based on your personal interests;2. Githunb Topics categorizes and summarizes some projects according to categories/topics. For example, [Data visualization](https://github.com/topics/data-visualization) summarizes some open source projects related to data visualization, and [Awesome Lists](https://github.com/topics/awesome) summarizes the warehouses of the Awesome series;
3. Through Github Trending, we can see some of the more popular open source projects recently, and we can filter projects according to language type and time dimension;
4. Github Collections is similar to a collection of favorites. For example, [Teaching materials for computational social science](https://github.com/collections/teaching-computational-social-science) is a collection of open source resources related to computer courses, and [Learn to Code](https://github.com/collections/learn-to-code) is a collection of warehouses that are helpful for you to learn programming;
5.…

![](https://oss.javaguide.cn/github/javaguide/github-explore.png)

## GitHub Actions is powerful

You can simply think of GitHub Actions as Github's own CI/CD. Through GitHub Actions, you can build, test, and deploy code directly on GitHub. You can also review code, manage APIs, and analyze project dependencies. In short, GitHub Actions can automate a lot of things for you.

For a detailed introduction to GitHub Actions, it is recommended to read [GitHub Actions Getting Started Tutorial] (https://www.ruanyifeng.com/blog/2019/09/getting-started-with-github-actions.html) written by teacher Ruan Yifeng.

GitHub Actions has an official market, where there are many Actions submitted by others, and you can use them directly.

![](https://oss.javaguide.cn/github/javaguide/image-20211227100147433.png)

## Postscript

In this article, I unreservedly share the Github tips I have accumulated over the years. I sincerely hope it will be helpful to everyone. I sincerely hope that everyone will make good use of Github, a treasure trove exclusively for programmers.

In addition, I did not mention Github search skills in this article. In my opinion, Github search skills do not require memorizing the various commands mentioned in articles on the Internet, it is really useless. You will find that what you use most is keyword search and Github’s built-in filtering function.

<!-- @include: @article-footer.snippet.md -->