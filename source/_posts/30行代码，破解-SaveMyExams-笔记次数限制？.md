---
title: 30行代码，破解 SaveMyExams 笔记次数限制？
tags: 
  - Hacking
  - RE
  - Javascript
  - Tampermonkey
categories: 项目开发
cover: 'https://s2.loli.net/2025/07/21/RWkQhrbdOwKXT9f.webp'
abbrlink: de8b9337
date: 2025-07-20 18:36:23
---

## 引子 - 万恶之源

最近也是到 CIE 复习周了，发现周围不少同学都在用 [SaveMyExams](https://www.savemyexams.com/) 这个网站来复习，听说里边还有大佬亲自撰写的笔记

我一看，欸！我的 CPC 这不有救了！遂立即打开此网站，开工！

该说不说，这笔记质量挺不错，全程干货无尿点。

刚读完一篇笔记呢，网站提示我要注册。我寻思人家做*公益*的也不容易，防人机来爬自己的网站开个登录功能也无可厚非

在一通翻爬滚打之后，也是终于配置好了自己所有的科目。回主页一看，一排大字映入眼帘：

`You've read 0 of your 5 free revision notes this week.`

当时就顿感不妙，上了这家伙的当了！一周只能看五篇，这不明摆着看各位同学复习周**急用笔记**，所以搁这圈钱呢！

又翻了几篇笔记，果然，一个升级广告直接糊在我脸上，真的是**演都不演了**！

{% image https://s2.loli.net/2025/07/21/RWkQhrbdOwKXT9f.webp, height=400px, alt=免费（存疑） %}

## 破解 - 逆向大法

破解的切入点其实很好找，原理很简单：网站会先读取你的笔记访问次数，然后将其显示出来，类似上图

通过 **F12 大法**，我们很轻松地找到了切入点，也就是这一段元素：

```html
<span class="JoinCTA_pronouncedText__gnYeK">2 of your 5</span>
```

接着，我们只需要反向找到其读取访问次数的逻辑，就可以基本确认破解的难度。至于怎么搜索？很简单：**对页面抓包，接着全局搜索你能看到的任何关键字**

{% note primary simple %}当你在凝视深渊时，深渊也在凝视你{% endnote %}

经过一些合理溯源，再让左右脑互搏一阵子，最终的线索指向了这里：

```javascript
title: (0,
i.jsxs)("div", {
    className: G().titleWrapper,
    children: [!h && (0,
    i.jsxs)("h4", {
        className: G().subtitle,
        children: ["You've read", " ", (0,
        i.jsxs)("span", {
            className: G().pronouncedText,
            children: [p.usage, " of your ", p.limit.registered] // 注意这一行！
        }), " ", "free ", m, "week" === p.resetFrequency && " this week"]
    }), (0,
    i.jsx)("h3", {
        className: G().titleMain,
        children: r ? "Get unlimited access" : A
    })]
}),
```

根据常理推测，`" of your "`这个字符串左边的，就是读取访问次数的代码部分了！

## 最终决战

随着逆向的深入，**静态分析**（看代码读代码）已经不能满足我们的需求了，这时候就需要打断点进行**动态分析**

动态分析的好处就在于，我们可以*视奸*程序每一步运行的过程，以及他们返回的结果

{% image https://s2.loli.net/2025/07/21/ECMBUHm9nAPhTxp.webp %}

非常好！看来我们离真相近在咫尺！这里返回的 `2`，不就是已经阅读过笔记的数量吗？

让我们来分析最后一层函数，即这个 `a.Gq()` 方法...

{% image https://s2.loli.net/2025/07/21/lt4XE9sTQzjIOMG.webp %}

答案已经水落石出：**网站从键名为 `SME.revision-note-views` 的本地存储中，提取出了我阅读过的笔记信息**

## 信息整理

至此，局部笔记访问限制的实现逻辑已经理清：

{% mermaid %}
graph TD
    A1[用户访问笔记页面] --> A2[前端检测 localStorage 中的访问记录]
    A2 --> A3{是否超过限制}
    A3 -- 否 --> A4[正常显示笔记]
    A3 -- 是 --> A5[拒绝提供笔记]

    A1 --> B1[本地抓取 SME.revision-note-views 的值]
    A4 --> B2[新状态写入 SME.revision-note-views]

    C6[持续清除 SME.revision-note-views] --> A2

    classDef hack stroke:#F1C40F,stroke-width:2px;

    class C6 hack;
{% endmermaid %}

## 理论存在，实践开始！

综上所述，只需要我们不间断修改这块本地存储，如将其**一直写空值**，就可以绕过这些访问限制啦

废话不多说，上代码...

```javascript
const keysToMonitor = ["SME.revision-note-views"]; // 如果需要屏蔽更多的键，可以在这里直接方便地添加
const originalSetItem = Storage.prototype.setItem; // 保留原本的 Storage.setItem 方法，留存一份干净的副本

// 覆写 Storage.setItem 方法，检测写入的对象是否为特定键
Storage.prototype.setItem = function(key, value) {
    if (keysToMonitor.includes(key)) {
        originalSetItem.apply(this, arguments);
        // 如果是，删除此项目
        this.removeItem(key);
    } else {
        originalSetItem.apply(this, arguments);
    }
};

// 监测本地存储写入事件
window.addEventListener('storage', function(e) {
    if (keysToMonitor.includes(e.key)) {
        localStorage.removeItem(e.key);
    }
});

// 循环检测 localStorage 中是否具有笔记计数项，如果是，删除该项，轮询周期为3秒
function pollLocalStorage() {
    keysToMonitor.forEach(key => {
        if (localStorage.getItem(key) !== null) {
            localStorage.removeItem(key);
        }
    });
}
setInterval(pollLocalStorage, 3000);
```

这就是插件中的核心代码。算上注释和空行，仅**30行**。至于插件中其他的代码，是用来删除页面上留着的那些牛皮癣广告的 ^w^

## 小结

这次的 Hacking 虽然看似很顺利，但其实也具有很大一部分的运气成分

就以这种情况进行举例，只需要服务端根据用户的 cookie 对他们的笔记访问数量进行跟踪，并在服务端进行数据的处理，那就基本上是**坚不可摧**啦！

