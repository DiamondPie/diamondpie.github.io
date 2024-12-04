---
title: EOY
date: 2024-10-31 14:56:51
tags: Revision
categories: 学习笔记
aside: false
cover: https://s2.loli.net/2024/12/04/xOsiEcVCpXk3UZa.jpg
---

{% tip info %}这是一个高级页面，由 {% label Javascript %} 实时控制，请确保您的电脑时钟准确。{% endtip %}

---

## Timetable

{% note info flat %}**Morning** = 8:40 a.m. Arrive, **Afternoon** = 12:50 p.m. Arrive.{% endnote %}

<!-- | Subject | Time |
|:-------:|:--------------------:|
|  11ESL  | 11.4 Monday, Morning |
|  11PHY  | 11.4 Monday, Afternoon |
|  11CHE  | 11.5 Tuesday, Morning |
|  11CPS  | 11.8 Friday, Morning | -->

{% timeline 2024-11-4 Monday %}
<!-- timeline Morning 11ESL -->
<div class='status' subject="esl" target-date="2024-11-04T09:00:00"></div>
<!-- endtimeline -->
<!-- timeline Afternoon 11PHY -->
<div class='status' subject="phy" target-date="2024-11-04T13:10:00"></div>
<!-- endtimeline -->
{% endtimeline %}
{% timeline 2024-11-5 Tuesday %}
<!-- timeline Morning 11CHE -->
<div class='status' subject="che" target-date="2024-11-05T09:00:00"></div>
<!-- endtimeline -->
{% endtimeline %}
{% timeline 2024-11-8 Friday %}
<!-- timeline Morning 11CPS -->
<div class='status' subject="cps" target-date="2024-11-08T09:00:00"></div>
<!-- endtimeline -->
{% endtimeline %}

<script>
  function loop() {
    currentDate = new Date().getTime();
    contentElements = document.querySelectorAll(".status");
    contentElements.forEach(contentElement => {
      subject = contentElement.getAttribute("subject");
      targetDate = new Date(contentElement.getAttribute("target-date")).getTime();
      if (currentDate < targetDate - 5 * 60 * 1000) {
        // 如果时间未到，以天:时:分:秒的格式计算剩余时间并显示
        timeLeft = Math.floor((targetDate - currentDate) / 1000);
        days = Math.floor(timeLeft / (24 * 60 * 60));
        timeLeft %= 24 * 60 * 60;
        hours = Math.floor(timeLeft / (60 * 60));
        timeLeft %= 60 * 60;
        minutes = Math.floor(timeLeft / 60);
        seconds = timeLeft % 60;
        contentElement.innerHTML = `
        <div class="checkbox yellow"><input type="checkbox">
          <p><strong>距离考试开始剩余 {% span red, ${days}d ${hours}h ${minutes}m ${seconds}s %}</strong></p>
        </div>`
      }
      else if (currentDate < targetDate) {
        timeLeft = (targetDate - currentDate) / 1000;
        // minutes = Math.floor(timeLeft / 60);
        // seconds = timeLeft % 60;
        contentElement.innerHTML = `
        <div class="checkbox yellow minus"><input type="checkbox">
          <p><strong>距离考试开始剩余 {% span red, ${timeLeft.toFixed(2)}s %}</strong></p>
        </div>`
      }
      else if (currentDate < targetDate + 2 * 60 * 60 * 1000) {
        // 如果时间到了但是没超过2小时，计算距离2小时还有多少时间并显示
        timeLeft = (targetDate + 2 * 60 * 60 * 1000 - currentDate) / 1000;
        hours = Math.floor(timeLeft / (60 * 60));
        timeLeft %= 60 * 60;
        minutes = Math.floor(timeLeft / 60);
        seconds = timeLeft % 60;
        contentElement.innerHTML = `
        <div class="checkbox yellow minus"><input type="checkbox" checked>
          <p><strong>本场考试进行中，将于 {% span red, ${hours}h ${minutes}m ${seconds.toFixed(2)}s %} 后结束</strong></p>
        </div>`
      }
      else {
        contentElement.innerHTML = `
        <div class="checkbox green"><input type="checkbox" checked>
          <p>本场考试已结束</p>
        </div>`
      }
    });
  }
  setInterval(loop, 10);
</script>
