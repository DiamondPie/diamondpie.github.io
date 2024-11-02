---
title: EOY Timetable
date: 2024-10-31 14:56:51
tags: Revision
categories: 学习笔记
comments: false
cover: https://ice.frostsky.com/2024/11/01/957575d98a5282973ae874c9fd4ca6b0.jpeg
---

## Timetable

{% note info flat %}**Morning** = 8:40 a.m. Arrive, **Afternoon** = 12:50 p.m. Arrive.{% endnote %}

| Subject | Time |
|:-------:|:--------------------:|
|  11ESL  | 11.4 Monday, Morning |
|  11PHY  | 11.4 Monday, Afternoon |
|  11CHE  | 11.5 Tuesday, Morning |
|  11CPS  | 11.8 Friday, Morning |

## Status

<div class='status' subject="esl" target-date="2024-11-04T08:40:00Z"></div>
<div class='status' subject="phy" target-date="2024-11-04T12:50:00Z"></div>
<div class='status' subject="che" target-date="2024-11-05T08:40:00Z"></div>
<div class='status' subject="cps" target-date="2024-11-08T08:40:00Z"></div>

<script>
  currentDate = new Date();
  contentElements = document.querySelectorAll(".status");
  contentElements.forEach(contentElement => {
    subject = contentElement.getAttribute("subject");
    targetDate = new Date(contentElement.getAttribute("target-date"));
    if (currentDate < targetDate) {
      contentElement.innerHTML = `{% checkbox green, 11${subject.toUpperCase()} %}`
    }
    else {
      contentElement.innerHTML = `{% checkbox green checked, 11${subject.toUpperCase()} %}`
    }
  });
</script>
