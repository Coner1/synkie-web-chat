# Synkie Web Chat

> 同じウェブページを閲覧している人とチャットしよう。あなたは一人でブラウジングしていない。

[![Chrome Web Store](https://img.shields.io/badge/Chrome%20ウェブストア-今すぐ試す-4285F4?style=flat-square&logo=googlechrome&logoColor=white)](https://chromewebstore.google.com/detail/synkie-web-chat-you're-ne/aaeoljpeoalinfngkkdenhnehochdpad)

> 🚀 **[Chrome ウェブストアでライブ版を試す →](https://chromewebstore.google.com/detail/synkie-web-chat-you're-ne/aaeoljpeoalinfngkkdenhnehochdpad)**

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black)
![CSS](https://img.shields.io/badge/CSS-1572B6?style=flat-square&logo=css3&logoColor=white)

オープンソースのブラウザ拡張 UI です。この**ローカルモード**版はすべてのデータをブラウザの `localStorage` に保存します——バックエンド不要、アカウント不要、トラッキングなし。

[English](./README.md) | [简体中文](./README.zh-CN.md) | 日本語

## これは何ですか

Synkie は任意のウェブページにチャットウィジェットを重ねて表示するブラウザ拡張機能で、同じページを訪れた人同士がリアルタイムで会話できます。

このオープンソース版は**完全な UI/UX**——すべての画面、アニメーション、インタラクション——をクライアントサイドのみで動作させています。以下の開発者を対象としています：

- Synkie の UI を使って独自のリアルタイムバックエンド（WebSocket、Supabase、Firebase など）を接続したい方
- 拡張機能の構造を学びたい方
- 機能の追加や改善に貢献したい方

## 機能

- 💬 ページチャット — 同じ URL を訪れた他のユーザーにメッセージを送る
- 📝 ページコメント & ステッカー — ページ上の特定の位置にコメントを固定表示
- 💩❤️ リアクション絵文字 — 任意のページにアニメーション絵文字を送る
- 👤 ローカルプロフィール — 名前・アバター・自己紹介を `localStorage` に保存
- 🌙 ダーク / ライトテーマ、透明度調整対応
- 🔍 コメントのスレッド返信、いいね、クレームフラグ

## はじめ方

```bash
npm install
npm run dev
```

Chrome で未パッケージの拡張機能を読み込みます（`chrome://extensions` → デベロッパーモードを有効化 → パッケージ化されていない拡張機能を読み込む）。パスは `.plasmo/chrome-mv3-dev/` です。

## プロジェクト構成

```
src/
├── services/
│   ├── LocalStorage.ts      ← コアデータ層（独自バックエンドに差し替え可能）
│   ├── ChatService.ts       ← メッセージの送受信・購読
│   ├── CommentService.ts    ← コメント・リアクション・いいね
│   ├── UserService.ts       ← ユーザープロフィール
│   └── PresenceService.ts   ← オンライン状態（スタブ実装）
├── hooks/                   ← サービス層を利用する React Hooks
├── components/              ← すべての UI コンポーネント
└── types/                   ← 共有 TypeScript 型定義
```

## 独自バックエンドの接続

各サービスは `window.dispatchEvent(new CustomEvent('synkie:messages', { detail }))` でリアクティブな更新を実現しています。リアルタイムバックエンドを接続するには：

1. `LocalStorage.ts` の実装を独自の API/WebSocket 呼び出しに置き換える
2. データが変更された際に同じ `synkie:messages`、`synkie:comments`、`synkie:user` イベントを発火する
3. Hooks とコンポーネントの変更は不要

## ライセンス

MIT
