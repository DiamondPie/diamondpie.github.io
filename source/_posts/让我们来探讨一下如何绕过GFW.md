---
title: 让我们来探讨一下如何绕过GFW
tags:
  - Tutorial
  - GFW
  - CyberSecurity
categories: 学习笔记
copyright: true
copyright_author: 二叉树树
copyright_author_href: 'https://2x.nz/about/'
copyright_url: 'https://2x.nz/posts/bypass-gfw/'
copyright_info: 此文章转载至 <a href="https://2x.nz/posts/bypass-gfw/">二叉树树</a> 的博客，遵守 <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/">CC BY-NC-SA 4.0</a> 许可协议
copyright_author_avatar: 'https://q2.qlogo.cn/headimg_dl?dst_uin=2726730791&spec=5'
cover: 'https://2x.nz/_astro/Snipaste_2024-10-21_19-36-34.BsCH6WiV_DEWmW.webp'
abbrlink: 67e3fb05
date: 2025-08-07 16:47:36
---

## 首先，我们要知道GFW是如何封锁我们的流量的

1. IP黑洞：目前无解，但仅对部分服务黑洞，如谷歌系（谷歌、推特、YouTube等）

2. DNS污染：为域名返回一个假的IP。使用hosts文件强制指定域名对应ip或者使用加密的DNS（DoH、DNS 签名等）就可以解决

3. HTTP劫持：因为流量不是加密的，GFW作为天然的中间人可以直接进行篡改（如：重定向到404页面、劫持到反诈页面等）。可以使用HTTPS连接规避，但你可能会遇到SNI阻断

4. SNI阻断：在客户端与服务器建立加密连接前，客户端会发送 `Client Hello` 报文，而这个报文是明文，并且一般都会携带 `server_name` ，GFW可以知道你要访问哪个网站，对不在白名单（如：[discord.com](https://discord.com)）的域名进行阻断。因为 `server_name` 实际上是一个扩展，并不强制，你可以不发送它来规避SNI阻断

## 那么，让我们分析一下GFW对于不同网站的封锁情况

我们使用 WireShark 进行抓包

- 首先尝试访问 `www.baidu.com` 这是一个没有被GFW封锁的域名

  1. 我们先 ping 一下
    ![](https://2x.nz/_astro/2024-10-21-20-16-48-image.DRI4bICM_Z26nFLP.webp)

  2. 得到ip： `2408:873d:22:18ac:0:ff:b021:1393`

  3. 通过Hosts强制绑定
    ![](https://2x.nz/_astro/2024-10-21-20-18-10-image.CnFjFLyi_TNStB.webp)

  4. 通过WireShark进行抓包，可以看到，客户端发送的 `Client Hello` 可以清晰地看到 `Server Name` 字段，并且也能正常收到 `Server Hello` 然后双方便开始通信
    ![](https://2x.nz/_astro/2024-10-21-20-24-03-image.D7cq7Mey_gRvtM.webp)

  5. 查看浏览器，网站正常访问
    ![](https://2x.nz/_astro/2024-10-21-20-35-29-image.BC6hKeJb_2vta4j.webp)

- 让我们试试访问 `discord.com`

  1. 我们先ping一下，可以发现，域名和解析到的IP均不通
    ![](https://2x.nz/_astro/2024-10-21-20-27-57-image.KsqI3XU5_22YTfF.webp)

  2. 此时我们尝试使用 `itdog.cn` 进行v4 ping，并且依次对解析出的域名进行 ping
    ![](https://2x.nz/_astro/2024-10-21-20-28-51-image.Bay-jQDz_hcokq.webp)

  3. 可见，第一个 IP 通
    ![](https://2x.nz/_astro/2024-10-21-20-29-40-image.BnYbfXtD_Z6ez59.webp)

  4. 强制绑定 Hosts，尝试抓包
    ![](https://2x.nz/_astro/2024-10-21-20-35-58-image.Cfnt3X6h_APbtj.webp)

    ![](https://2x.nz/_astro/2024-10-21-20-31-49-image._XdT9unx_3cNPo.webp)

  5. 可见，在通过强制Hosts绑定后，在客户端发送 `Client Hello` 后被 GFW 检测到 `Server Name` 字段，然后GFW向客户端发送一个 `RST` 报文，即要求重置客户端连接。在客户端侧，则会收到 `ERR_CONNECTION_RESET` 即：连接已重置。用户无法访问网页。
    ![](https://2x.nz/_astro/2024-10-21-20-33-23-image.DByf70iA_1Xzknw.webp)

## 继续，尝试发送空 `Server Name` 报文

![](https://2x.nz/_astro/2024-10-21-20-41-37-image.9fxLpYtV_Zyr5Co.webp)

![](https://2x.nz/_astro/2024-10-21-20-41-54-image.D42Hc-Dd_1c4hVK.webp)

成功访问。在 WireShark 中并未发现 `Server Name` 字段

那么，有没有什么软件可以帮我们不发送 `Server Name` 呢？有的，兄弟有的

## 方法一：ECH

> 注意：本方法实际上是启用一个尚未普及的技术：加密SNI。该方法并不能让所有明确被SNI阻断的网站恢复正常访问。尽管客户端（你）支持ECH，若服务器不支持，则在服务器看来那就是一个非法请求，不予受理 如果想要本方法奏效，你需要确保：
> 
> 1. 网站托管在Cloudflare或者托管商声明支持ECH
> 2. 网站域名被SNI阻断，客户端被发RST包

首先我提供一个网站：https://www.cloudflare-cn.com/ssl/encrypted-sni/#results 这个网站可以查询你的浏览器是否正在使用ECH。进入网站点击 `检查我的浏览器` ，待检查完毕后，检查 `安全 SNI` 一项是否为 `√` 如果你为 `×` ，也不要气馁，我们现在来解决

### Edge浏览器

右键桌面的快捷方式点击属性，在目标一栏中添加 `--enable-features=EncryptedClientHello` 打开设置，搜索DNS，找到 `使用安全的 DNS 指定如何查找网站的网络地址` （当前版本我叫这个。反正就是配置DoH的地方） 选择`Cloudflare （1.1.1.1）` 再次测试即可 （其他浏览器我没测试，应该大同小异，网上搜索一下XX浏览器开启ECH就行） 接下来尝试访问：https://iwara.tv 。你应该能直连了

## 方法二：Accesser

> 本方法采用一个神奇的方法来绕过SNI阻断，域前置。原理为客户端先找网站要一张SSL证书，然后再用这个通用证书写好要访问的网站发给服务器，这样，GFW也就看不见你要访问的网站，也就没法进行SNI阻断。 注意：本方法需要在本地运行一个程序并且劫持所有HTTP流量，可能会导致某些正常上网情况下不会出现的问题，请酌情使用

https://github.com/URenko/Accesser

Accesser 是一个 HTTP 代理。它通过中间人的身份处理终端的 HTTP 出口流量，以绕过 SNI 阻断。我们正常访问网站时，客户端会发送 `Client Hello` ，而这个报文是明文，并且通常会携带 `ServerName`，这个时候 GFW 就能通过检测 `ServerName` 来进行阻断，代替网站向客户端发送一个 `RST` 报文重置连接，做到网站被“墙”的效果

而通过 Accesser 代理后，它会抹掉 `ServerName` 然后发送`Client Hello`。这个时候，如果服务端支持域前置，则会返回客户端一个默认的 SSL 证书（公钥），然后客户端就能使用这个公钥再次发送一个加密的 `Client Hello`，此时携带上 `ServerName` 就不会被 GFW 阻断了。但是，如果客户端在第一次我们拿公钥的时候拒绝了空 `ServerName` 的 `Client Hello`，那这个办法就失效了，不过大部分网站是支持这样做的

### Windows

- 前往开头的的Github仓库

- 下载最新的 Release。一般有一个 `accesser.exe`

- 直接打开这个软件，看到这个画面即可
  ![](https://2x.nz/_astro/c2eed28c-6e5d-43a3-a016-8f1a38a53cbd.C9_-hA9W_Z1ItpqE.webp)

- 它的原理是自动设置系统代理，如果你使用了一些别的代理软件，会被覆盖
  ![](https://2x.nz/_astro/d0d8fac1-a2e5-4db2-8e25-ca5e04eb9951.Cy5JX5T2_uBPK1.webp)

### Linux（以Debian12为例）

- 安装 Python：`apt install python3`

- （可选）创建虚拟环境：`python -m venv venv`

- （可选）进入虚拟环境：`source venv/bin/activate`

- 安装 Accesser：`python3 -m pip install -U accesser`

- 运行：`accesser`

- 它会提示你需要信任 `root.crt` 。关闭Accesser

- 我的证书文件在 `/root/Accesser/venv/lib/python3.11/site-packages/accesser/CERT/root.crt`

- cd到你的证书目录：`cd /root/Accesser/venv/lib/python3.11/site-packages/accesser/CERT`

- 信任证书：`sudo cp root.crt /usr/local/share/ca-certificates/`

- 更新证书存储：`sudo update-ca-certificates`

- 设置全局代理：`sudo nano /etc/environment`
```bash
http_proxy="http://127.0.0.1:7654"
https_proxy="http://127.0.0.1:7654"
no_proxy="localhost,127.0.0.1"
```

- 重启即可

- 测试连通性：`curl -x https://discord.com`