# AI数学超入門

AIを支える数学を、インタラクティブな図解とコードで学ぶサイトです。

## サイトURL

**https://p-united.github.io/ai-math-introduction/**

## コンテンツ

| ページ | 説明 | URL |
|--------|------|-----|
| ホーム | カテゴリ一覧 | [/](https://p-united.github.io/ai-math-introduction/) |
| ソフトマックス関数 | 確率分布への変換、単純比率との比較 | [/softmax](https://p-united.github.io/ai-math-introduction/softmax) |
| Sparsemax関数 | スパースな確率分布、Softmaxとの比較 | [/sparsemax](https://p-united.github.io/ai-math-introduction/sparsemax) |

## 技術スタック

- **フレームワーク**: React 18 + Vite
- **スタイリング**: Tailwind CSS
- **グラフ**: Recharts
- **ルーティング**: React Router
- **ホスティング**: GitHub Pages

## ローカル開発

```bash
# 依存関係のインストール
npm install

# 開発サーバー起動
npm run dev

# ビルド
npm run build

# プレビュー
npm run preview
```

## ディレクトリ構成

```
src/
├── App.jsx              # ルーティング設定
├── main.jsx             # エントリーポイント
└── pages/
    ├── Home.jsx         # トップページ
    ├── softmax/
    │   └── SoftmaxComparison.jsx
    └── sparsemax/
        └── SparsemaxExplanation.jsx

docs/
└── ml/
    └── sparsemax.md     # Sparsemax技術ドキュメント

internal/
└── foo/
    ├── mod.ts           # エクスポート
    ├── internal/
    │   └── sparsemax.ts # Sparsemax実装
    └── test/
        └── sparsemax.test.ts
```

## デプロイ

mainブランチへのプッシュで自動的にGitHub Pagesにデプロイされます。

## ライセンス

© 2024 Potential United Co., Ltd.
