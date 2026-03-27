# Synkie Web Chat

> 与正在浏览同一网页的人聊天。你从不是一个人在浏览。

[![Chrome Web Store](https://img.shields.io/badge/Chrome%20应用商店-立即体验-4285F4?style=flat-square&logo=googlechrome&logoColor=white)](https://chromewebstore.google.com/detail/synkie-web-chat-you're-ne/aaeoljpeoalinfngkkdenhnehochdpad)

> 🚀 **[前往 Chrome 应用商店体验完整版 →](https://chromewebstore.google.com/detail/synkie-web-chat-you're-ne/aaeoljpeoalinfngkkdenhnehochdpad)**

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black)
![CSS](https://img.shields.io/badge/CSS-1572B6?style=flat-square&logo=css3&logoColor=white)

开源浏览器扩展 UI。此**本地模式**版本将所有数据存储在浏览器的 `localStorage` 中——无需后端、无需账户、不追踪任何信息。

[English](./README.md) | 简体中文 | [日本語](./README.ja.md)

## 这是什么

Synkie 是一个浏览器扩展，它在任意网页上叠加一个聊天小部件，让访客可以实时互相交流。

此开源版本提供**完整的 UI/UX**——每个界面、每个动效和交互——完全在客户端运行。适合以下开发者使用：

- 使用 Synkie 的 UI，对接自己的实时后端（WebSocket、Supabase、Firebase 等）
- 了解扩展的代码结构
- 贡献新功能或修复问题

## 功能特性

- 💬 页面聊天 — 与访问同一 URL 的其他用户发送消息
- 📝 页面评论 & 贴纸 — 将评论悬浮固定在页面特定位置
- 💩❤️ 表情反应 — 在任意页面发送动态表情
- 👤 本地资料 — 姓名、头像、简介存储在 `localStorage`
- 🌙 深色 / 浅色主题，支持透明度调节
- 🔍 评论嵌套回复、点赞、投诉标记

## 快速开始

```bash
npm install
npm run dev
```

在 Chrome 中加载未打包的扩展（`chrome://extensions` → 开启开发者模式 → 加载已解压的扩展），路径为 `.plasmo/chrome-mv3-dev/`。

## 项目结构

```
src/
├── services/
│   ├── LocalStorage.ts      ← 核心数据层（替换此文件以接入自己的后端）
│   ├── ChatService.ts       ← 消息发送/接收/订阅
│   ├── CommentService.ts    ← 评论、反应、点赞
│   ├── UserService.ts       ← 用户资料
│   └── PresenceService.ts   ← 在线状态（桩实现）
├── hooks/                   ← 消费服务层的 React Hooks
├── components/              ← 所有 UI 组件
└── types/                   ← 共享 TypeScript 类型
```

## 接入自定义后端

每个服务通过 `window.dispatchEvent(new CustomEvent('synkie:messages', { detail }))` 实现响应式更新。接入实时后端只需三步：

1. 将 `LocalStorage.ts` 中的实现替换为你的 API/WebSocket 调用
2. 在数据变更时触发相同的 `synkie:messages`、`synkie:comments`、`synkie:user` 事件
3. Hooks 和组件无需任何修改

## 许可证

MIT
