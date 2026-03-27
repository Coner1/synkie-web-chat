# Synkie Web Chat

> Chat with people browsing the same webpage. You're never browsing alone.

English | [简体中文](./README.zh-CN.md) | [日本語](./README.ja.md)

Open-source browser extension UI. This **local mode** version stores all data in the browser's `localStorage` — no backend, no accounts, no tracking.

## What this is

Synkie is a browser extension that overlays a chat widget on any webpage, letting visitors chat with each other in real time.

This open-source version ships the **complete UI/UX** — every screen, animation, and interaction — running purely client-side. It's designed for developers who want to:

- Build on Synkie's UI with their own real-time backend (WebSocket, Supabase, Firebase, etc.)
- Study how the extension is structured
- Contribute features or improvements

## Features

- 💬 Page chat — message other visitors on the same URL
- 📝 Page comments & stickers — floating comments pinned to page positions
- 💩❤️ Reaction emojis — animated reactions on any page
- 👤 Local profile — name, avatar, bio stored in `localStorage`
- 🌙 Dark / light theme with adjustable opacity
- 🔍 Comment threading, likes, complaint flags

## Getting started

```bash
npm install
npm run dev
```

Load the unpacked extension from `.plasmo/chrome-mv3-dev/` in Chrome (`chrome://extensions` → Developer mode → Load unpacked).

## Project structure

```
src/
├── services/
│   ├── LocalStorage.ts      ← core data store (swap this for your backend)
│   ├── ChatService.ts       ← message send/receive/subscribe
│   ├── CommentService.ts    ← comments, reactions, likes
│   ├── UserService.ts       ← user profile
│   └── PresenceService.ts   ← online presence (stub)
├── hooks/                   ← React hooks consuming the services
├── components/              ← all UI components
└── types/                   ← shared TypeScript types
```

## Connecting your own backend

Each service uses `window.dispatchEvent(new CustomEvent('synkie:messages', { detail }))` for reactivity. To plug in a real-time backend:

1. Replace `LocalStorage.ts` with calls to your API/WebSocket
2. Fire the same `synkie:messages`, `synkie:comments`, `synkie:user` events when data changes
3. The hooks and components need no modification

## License

MIT
