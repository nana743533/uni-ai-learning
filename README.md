# UniAI — 講義特化型AIで大学教育に革命を起こす

> 教授が資料をアップロードするだけで、学生はゼロ準備で講義内容に基づいたAI相談ができる。  
> 大学の授業に完全最適化された学習支援プラットフォーム。

**デモ:** [team-i-uni-ai.manus.space](https://team-i-uni-ai.manus.space/)

---

## 課題背景

大学生がAIを学習に活用しようとすると、3つの壁に直面します。

**準備の壁** — LMSからPDFをダウンロードし、AIにアップロードし、前提条件を一から説明する。勉強を始める前の準備だけで時間を奪われてしまいます。

**一般論リスク** — 汎用AIは資料を読み込ませても、インターネット上の一般知識を混ぜた回答を返します。教授独自の定義や授業固有の文脈とズレた回答は、テストで減点される原因になりかねません。

**知の分断** — 学生同士の質問や気づきは個人のチャット履歴に閉じてしまい、クラス全体の学びとして共有されません。

UniAIはこれら3つの壁を、**講義資料だけを参照するRAG（検索拡張生成）** と **クラス全体のQ&A共有** で解決します。

---

## 主な機能

### 学生向け

| 機能 | 説明 |
|---|---|
| **AI相談** | 講義資料のみを参照するRAGチャット。資料の出典（第何回・タイトル）付きで回答 |
| **講義資料閲覧** | 教授がアップロードした資料を授業回ごとに一覧表示。外部リンクで直接閲覧 |
| **みんなのQ&A** | クラス全体で質問・回答・いいねを共有するフォーラム |
| **フィードバック** | 授業への匿名フィードバック送信 |

### 教授向け

| 機能 | 説明 |
|---|---|
| **RAG管理** | PDF・DOC・PPTなどの授業資料をS3にアップロード。AIナレッジ対象のON/OFFを資料単位で制御 |
| **学習分析** | 学生のAI相談利用状況（質問数・頻出トピック）を可視化するダッシュボード |
| **資料テキスト抽出** | アップロード時にPDFからテキストを自動抽出し、RAGコンテキストとしてDBに保存 |

---

## 技術スタック

| レイヤー | 技術 |
|---|---|
| **Frontend** | React 19, Tailwind CSS 4, shadcn/ui, Wouter (ルーティング) |
| **Backend** | Express 4, tRPC 11 (型安全RPC), Superjson |
| **Database** | MySQL / TiDB, Drizzle ORM |
| **AI** | Gemini 2.5 Flash (Google AI), invokeLLM フォールバック |
| **Storage** | AWS S3 (Manus Forge プロキシ経由) |
| **PDF処理** | pdf-parse v2 (テキスト抽出 → RAG) |
| **認証** | Manus OAuth (デモ版), JWT セッション |
| **ビルド** | Vite 6, esbuild, TypeScript 5.9 |

---

## アーキテクチャ

```
┌─────────────┐     ┌──────────────────────────────────────────────┐
│   教授       │     │                  サーバー                     │
│  (ブラウザ)  │────▶│  tRPC: documents.upload                      │
└─────────────┘     │    ├─ S3にファイルアップロード (storagePut)    │
                    │    ├─ PDFテキスト抽出 (pdf-parse)             │
                    │    └─ メタデータ + テキストをDBに保存          │
                    │                                              │
┌─────────────┐     │  tRPC: chat.send                             │
│   学生       │     │    ├─ DBから該当回のRAGコンテキスト取得       │
│  (ブラウザ)  │────▶│    ├─ システムプロンプト + 資料テキスト構築   │
└─────────────┘     │    ├─ Gemini 2.5 Flash に送信                │
                    │    │   └─ 429エラー時: invokeLLMフォールバック │
                    │    └─ 出典付き回答を返却                      │
                    └──────────────────────────────────────────────┘
                              │                    │
                         ┌────┴────┐          ┌────┴────┐
                         │  MySQL  │          │   S3    │
                         │ (TiDB)  │          │ Storage │
                         └─────────┘          └─────────┘
```

---

## ディレクトリ構成

```
uni-ai-learning/
├── client/
│   └── src/
│       ├── components/
│       │   ├── student/          # 学生向けUI（AIChatTab, LectureDocsTab, CommunityQATab）
│       │   ├── professor/        # 教授向けUI（RAGManagementTab, AnalyticsTab）
│       │   ├── ui/               # shadcn/ui コンポーネント
│       │   └── AppLayout.tsx     # アプリシェル（ヘッダー・ロール切替）
│       ├── lib/
│       │   ├── mockData.ts       # デモ用モックデータ（情報社会と倫理）
│       │   └── trpc.ts           # tRPCクライアント
│       └── pages/
│           └── Home.tsx          # メインページ
├── server/
│   ├── _core/                    # フレームワーク基盤（OAuth, LLM, 環境変数）
│   ├── routers.ts                # tRPCプロシージャ（auth, documents, chat）
│   ├── db.ts                     # DBクエリヘルパー
│   └── storage.ts                # S3ストレージヘルパー
├── drizzle/
│   └── schema.ts                 # DBスキーマ（users, documents）
├── shared/
│   ├── const.ts                  # 共有定数
│   └── types.ts                  # 共有型定義
└── scripts/                      # デモデータ投入スクリプト
```

---

## ローカルセットアップ

### 前提条件

Node.js 22 以上、pnpm がインストールされていること。

### 手順

```bash
# 1. リポジトリをクローン
git clone https://github.com/<your-org>/uni-ai-learning.git
cd uni-ai-learning

# 2. 依存パッケージをインストール
pnpm install

# 3. 環境変数を設定（.envファイルを作成）
cp .env.example .env
# .env を編集して各値を設定

# 4. データベースマイグレーション
pnpm db:push

# 5. 開発サーバー起動
pnpm dev
```

### 環境変数

| 変数名 | 説明 | 必須 |
|---|---|---|
| `DATABASE_URL` | MySQL接続文字列 | Yes |
| `JWT_SECRET` | セッション署名キー | Yes |
| `GEMINI_API_KEY` | Google Gemini API Key | Yes |
| `BUILT_IN_FORGE_API_URL` | Manus Forge API URL（デモ版） | デモ時のみ |
| `BUILT_IN_FORGE_API_KEY` | Manus Forge API Key（デモ版） | デモ時のみ |
| `VITE_APP_ID` | Manus OAuth App ID（デモ版） | デモ時のみ |
| `OAUTH_SERVER_URL` | Manus OAuth Server URL（デモ版） | デモ時のみ |
| `VITE_OAUTH_PORTAL_URL` | Manus OAuth Portal URL（デモ版） | デモ時のみ |

本番環境ではManus固有の環境変数を独自認証・AWS SDKに置き換えます。詳細は [DEVELOPMENT_ROADMAP.md](./DEVELOPMENT_ROADMAP.md) を参照してください。

---

## 現在の状態

UniAIは現在 **デモ版** として [Manus](https://manus.im) 上でホスティングされています。認証・ストレージ・LLMフォールバックの一部がManusプラットフォームに依存しており、本番リリースに向けてはこれらを独自インフラに移行する必要があります。

継続開発の計画と移行手順については **[DEVELOPMENT_ROADMAP.md](./DEVELOPMENT_ROADMAP.md)** にまとめています。

---

## ライセンス

MIT License
