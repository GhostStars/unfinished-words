# 未尽之言

> 帮助临终失语患者家属，从微末信号中读懂亲人最后想表达的话。

## 核心场景

针对因脑梗等疾病导致失语的临终患者，家属难以通过眨眼、手势等微弱信号理解患者真实意图的痛点，本产品提供一套辅助猜测与校准工具，帮助家属在有限时间内减少沟通遗憾。

## 线上体验

**Demo 地址**：https://unfinished-words.vercel.app

**仓库地址**：https://github.com/GhostStars/unfinished-words

## 本地运行

```bash
npm install
npm run dev
```

## Demo 主流程（9 页）

| 页面 | 简述 |
|------|------|
| 首页 | 产品介绍与开始入口 |
| 输入线索 | 记录患者当下的具体行为信号 |
| 生命线索 | 整理患者长期的生活习惯与偏好 |
| 候选含义 | AI 根据线索给出可能的表达含义 |
| 信号校准 | 设定信号阈值，过滤有效信号 |
| 问题链 | 分支式提问，逐步缩窄真实意图 |
| 暂停猜测 | 保存当前进度，稍后继续 |
| 猜测记录 | 查看历史猜测过程与结果 |
| 表达记录 | 最终确认的表达归档 |

## 技术栈

- Vite
- React
- JavaScript
- localStorage（数据持久化）

## TRAE 使用记录

本项目完全使用 TRAE 辅助开发，以下为关键开发步骤：

| 步骤 | Session ID | 内容简述 |
|------|------------|----------|
| step-00 | 6a4335110cc4129725ede5c9 | 项目初始化，创建 Vite + React 骨架与工程纪律 |
| step-01 | 6a434aa40cc4129725edea0b | 添加全局视觉系统，暖色纸张与星空背景 |
| step-02 | 6a434d890cc4129725edeaa4 | 实现首页与输入线索页，支持示例体验 |
| step-05 | 6a4353bb0cc4129725edec2d | 实现分支式问题链，支持逐步缩窄跳转 |
| step-09 | 6a4358460cc4129725ededde | 部署上线与提交材料整理 |

### 使用心得

- TRAE 的上下文保持能力非常适合多步骤增量开发，每步只需描述当前目标即可自动衔接已有代码
- 通过 `PROJECT_RULES.md` 约束工程纪律，能有效避免 TRAE 重写无关文件的问题
- 纯前端 + localStorage 的策略在 TRAE 辅助下可快速落地，无需后端即可展示完整闭环

## 初赛提交材料清单

- [x] 产品说明文档（本文档）
- [x] 演示视频（线上 Demo 可交互体验）
- [x] 可访问的线上 Demo：https://unfinished-words.vercel.app
- [x] 源代码仓库：https://github.com/GhostStars/unfinished-words
- [x] 产品截图 5 张（位于 screenshots/ 目录）
- [x] TRAE 过程截图与 Session ID 记录（见上表）
