# UniAI 継続開発ロードマップ

> Manus上のデモ版から、Claude Codeによる継続開発を経て、AWS本番環境へ移行するまでの全体計画

---

## 目次

1. [現状の整理](#1-現状の整理)
2. [Phase 1: Manus依存の解消](#2-phase-1-manus依存の解消)
3. [Phase 2: 機能完成](#3-phase-2-機能完成)
4. [Phase 3: AWSデプロイ](#4-phase-3-awsデプロイ)
5. [Phase 4: 本番運用・スケール](#5-phase-4-本番運用スケール)
6. [Claude Code活用ガイド](#6-claude-code活用ガイド)

---

## 1. 現状の整理

### 実装済み機能

| カテゴリ | 機能 | 状態 |
|---|---|---|
| 学生 — AI相談 | RAGチャット（講義資料参照・出典付き回答） | 完了 |
| 学生 — AI相談 | モデル選択UI（Gemini 2.5 Flash アクティブ） | 完了 |
| 学生 — AI相談 | Shift+Enter送信（IME誤送信防止） | 完了 |
| 学生 — 資料閲覧 | 授業回別の資料一覧・外部リンク表示 | 完了 |
| 学生 — Q&A | みんなのQ&A表示（モックデータ） | 完了（DB未連携） |
| 学生 — フィードバック | 授業フィードバック送信（モックデータ） | 完了（DB未連携） |
| 教授 — RAG管理 | S3資料アップロード・AI対象ON/OFF | 完了 |
| 教授 — RAG管理 | PDFテキスト自動抽出・DB保存 | 完了 |
| 教授 — 分析 | 学習分析ダッシュボード（モックデータ） | 完了（DB未連携） |
| 共通 | Gemini → invokeLLM 自動フォールバック | 完了 |
| 共通 | デモ用講義資料5回分（情報社会と倫理） | 完了 |

### Manus依存部分の棚卸し

現在のコードベースには、Manusプラットフォーム固有の依存が以下の4領域に存在します。本番移行にあたっては、これらを標準的なOSSやAWSサービスに置き換える必要があります。

#### 認証（OAuth）

Manus OAuthは、ユーザー認証の全フローを担っています。フロントエンドの `client/src/const.ts` にある `getLoginUrl()` がManus OAuthポータルへのリダイレクトURLを構築し、バックエンドの `server/_core/sdk.ts` がトークン交換・ユーザー情報取得・JWTセッション管理を行い、`server/_core/oauth.ts` が `/api/oauth/callback` でコールバックを処理します。

| ファイル | 依存内容 | 移行先の候補 |
|---|---|---|
| `server/_core/sdk.ts` | Manus OAuth SDK（トークン交換・ユーザー情報取得） | NextAuth.js / Auth.js / Amazon Cognito |
| `server/_core/oauth.ts` | `/api/oauth/callback` ルート | 同上 |
| `client/src/const.ts` | `getLoginUrl()` — VITE_OAUTH_PORTAL_URL依存 | 同上 |
| `client/src/_core/hooks/useAuth.ts` | localStorage key `manus-runtime-user-info` | キー名変更のみ |

JWTセッション署名・検証のロジック（`sdk.ts` 内の `signSession` / `verifySession`）はManus固有ではなく `jose` ライブラリを使った汎用実装のため、認証プロバイダを差し替えた後もそのまま再利用できます。

#### ストレージ（S3プロキシ）

`server/storage.ts` の `storagePut()` / `storageGet()` は、Manus Forge APIをプロキシとしてS3にアクセスしています。

| ファイル | 依存内容 | 移行先 |
|---|---|---|
| `server/storage.ts` | Forge API経由のS3アップロード/ダウンロード | AWS SDK v3 (`@aws-sdk/client-s3`) 直接 |

関数のシグネチャ（`storagePut(key, data, contentType)` → `{ key, url }`）はそのまま維持し、内部実装だけをAWS SDKに差し替えることで、呼び出し側（`server/routers.ts`）の変更を最小限に抑えられます。

#### LLM（AI呼び出し）

`server/_core/llm.ts` の `invokeLLM()` は、Manus Forge APIのOpenAI互換エンドポイントを呼び出しています。`server/routers.ts` の `callGemini()` はGoogle Gemini APIを直接呼び出し、クォータ超過時に `invokeLLM()` へフォールバックする構成です。

| ファイル | 依存内容 | 移行先 |
|---|---|---|
| `server/_core/llm.ts` | Forge API経由のLLM呼び出し | Google AI SDK (`@google/generative-ai`) 直接 |
| `server/routers.ts` | `callGemini()` + `invokeLLM` フォールバック | Gemini直接 + OpenAI SDK フォールバック |

本番ではGemini APIの有料プランを利用することでクォータ制限が大幅に緩和されるため、フォールバック自体が不要になる可能性があります。ただし、可用性のためにOpenAI GPT-4oなどへのフォールバックを残すことを推奨します。

#### 通知

`server/_core/notification.ts` の `notifyOwner()` は、Manus Forge APIの通知エンドポイントを呼び出しています。

| ファイル | 依存内容 | 移行先 |
|---|---|---|
| `server/_core/notification.ts` | Forge API経由の通知送信 | Amazon SES / SendGrid / Slack Webhook |

現在この機能はアプリ内で積極的に使われていないため、移行の優先度は低いです。

---

## 2. Phase 1: Manus依存の解消

**目標:** Manusプラットフォームへの依存をすべて排除し、独立して動作するコードベースにする。

### 1.1 認証の差し替え

最も影響範囲が大きい変更です。以下の手順で進めます。

**ステップ1: 認証プロバイダの選定と導入**

Amazon Cognitoを使う場合、ユーザープールを作成し、Google/GitHub/Emailのサインイン方法を設定します。`server/_core/sdk.ts` のOAuthServiceクラスをCognito SDKに置き換え、`server/_core/oauth.ts` のコールバックルートをCognitoのリダイレクトURIに合わせて修正します。

**ステップ2: フロントエンドの修正**

`client/src/const.ts` の `getLoginUrl()` をCognitoのHosted UIのURLを返すように変更します。環境変数を `VITE_COGNITO_DOMAIN`, `VITE_COGNITO_CLIENT_ID` などに置き換えます。

**ステップ3: セッション管理の維持**

JWTセッション署名・検証は現在の `jose` ベースの実装をそのまま維持します。`JWT_SECRET` 環境変数もそのまま使えます。

### 1.2 ストレージの直接化

`server/storage.ts` の内部実装を AWS SDK v3 に差し替えます。

```typescript
// 移行後のイメージ（server/storage.ts）
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3 = new S3Client({ region: process.env.AWS_REGION });
const BUCKET = process.env.S3_BUCKET_NAME;

export async function storagePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType = "application/octet-stream"
): Promise<{ key: string; url: string }> {
  const key = relKey.replace(/^\/+/, "");
  await s3.send(new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: typeof data === "string" ? Buffer.from(data) : data,
    ContentType: contentType,
  }));
  const url = `https://${BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
  return { key, url };
}
```

呼び出し側の `server/routers.ts` は変更不要です。新しい環境変数として `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `S3_BUCKET_NAME` が必要になります。

### 1.3 LLMの直接化

`server/_core/llm.ts` を Google AI SDK に差し替えるか、既存の `callGemini()` （`server/routers.ts` 内）をメインのLLM呼び出しとして昇格させます。`invokeLLM` フォールバックは OpenAI SDK (`openai` パッケージ) に置き換えます。

### 1.4 環境変数の整理

| 削除する変数 | 追加する変数 |
|---|---|
| `BUILT_IN_FORGE_API_URL` | `AWS_REGION` |
| `BUILT_IN_FORGE_API_KEY` | `AWS_ACCESS_KEY_ID` |
| `VITE_FRONTEND_FORGE_API_KEY` | `AWS_SECRET_ACCESS_KEY` |
| `VITE_FRONTEND_FORGE_API_URL` | `S3_BUCKET_NAME` |
| `VITE_APP_ID` | `COGNITO_USER_POOL_ID` |
| `VITE_OAUTH_PORTAL_URL` | `COGNITO_CLIENT_ID` |
| `OAUTH_SERVER_URL` | `VITE_COGNITO_DOMAIN` |
| `OWNER_OPEN_ID` / `OWNER_NAME` | `VITE_COGNITO_CLIENT_ID` |

`DATABASE_URL`, `JWT_SECRET`, `GEMINI_API_KEY` はそのまま維持します。

---

## 3. Phase 2: 機能完成

**目標:** モックデータで表示している機能をDB連携に切り替え、プロダクトとして完成させる。

### 2.1 みんなのQ&A — DB連携

現在 `client/src/lib/mockData.ts` のハードコードデータを表示しています。以下の実装が必要です。

| タスク | 詳細 |
|---|---|
| DBスキーマ追加 | `questions` テーブル（id, userId, lectureNumber, title, content, createdAt）、`answers` テーブル（id, questionId, userId, content, createdAt）、`likes` テーブル（id, targetType, targetId, userId） |
| tRPCプロシージャ | `qa.list`, `qa.create`, `qa.answer`, `qa.like` |
| フロントエンド | `CommunityQATab.tsx` をtRPCフックに接続、投稿フォーム実装 |

### 2.2 チャット履歴の永続化

現在のチャットセッションはフロントエンドのReact stateに保持されており、リロードで消えます。

| タスク | 詳細 |
|---|---|
| DBスキーマ追加 | `chat_sessions` テーブル（id, userId, title, createdAt）、`chat_messages` テーブル（id, sessionId, role, content, createdAt） |
| tRPCプロシージャ | `chat.listSessions`, `chat.getMessages`, `chat.send`（既存を拡張してDB保存） |
| フロントエンド | セッション一覧のDB読み込み、メッセージのDB保存 |

### 2.3 フィードバック — DB連携

`feedback` テーブルを追加し、学生からの授業フィードバックをDBに保存。教授ダッシュボードで集計表示します。

### 2.4 学習分析ダッシュボード — DB連携

教授向けの分析ダッシュボードを、実際のチャットログ・Q&Aデータから集計するように切り替えます。頻出質問トピック、授業回別の質問数、学生のアクティブ率などを可視化します。

### 2.5 RAGの高度化 — ベクトル検索

現在のRAGは、選択された授業回の全テキストをプロンプトに含める方式です。資料が増えるとトークン制限に達するため、ベクトル検索による関連箇所の抽出が必要になります。

| タスク | 詳細 |
|---|---|
| ベクトルDB導入 | Pinecone / pgvector / Amazon OpenSearch |
| チャンク分割 | 資料テキストを500〜1000トークン単位に分割してembedding生成 |
| 検索統合 | 質問テキストのembeddingで類似チャンクを検索し、上位5件をプロンプトに含める |

### 2.6 マルチ授業対応

現在は「情報社会と倫理」1授業のデモです。本番では複数授業に対応する必要があります。

| タスク | 詳細 |
|---|---|
| DBスキーマ追加 | `courses` テーブル（id, professorId, name, description）、`enrollments` テーブル（id, courseId, userId） |
| 資料の紐付け | `documents` テーブルに `courseId` カラムを追加 |
| UI | 授業選択画面、教授の授業管理画面 |

---

## 4. Phase 3: AWSデプロイ

**目標:** AWS上に本番環境を構築し、CI/CDパイプラインを整備する。

### 推奨インフラ構成

```
                    ┌─────────────┐
                    │ CloudFront  │  ← CDN + SSL終端
                    └──────┬──────┘
                           │
                    ┌──────┴──────┐
                    │     ALB     │  ← ロードバランサー
                    └──────┬──────┘
                           │
                    ┌──────┴──────┐
                    │  ECS Fargate│  ← Express + Vite SSR
                    │  (コンテナ)  │
                    └──────┬──────┘
                      │         │
               ┌──────┴───┐ ┌───┴──────┐
               │ RDS MySQL│ │   S3     │
               │ (Aurora) │ │ (資料)   │
               └──────────┘ └──────────┘
```

| サービス | 用途 | 推奨構成 |
|---|---|---|
| **ECS Fargate** | アプリケーションサーバー | 最小2タスク（オートスケーリング） |
| **RDS Aurora MySQL** | データベース | db.t4g.medium（本番）/ db.t4g.micro（開発） |
| **S3** | 授業資料ストレージ | バケットポリシーで読み取り制限 |
| **CloudFront** | CDN + SSL | S3オリジン + ALBオリジン |
| **Cognito** | 認証 | ユーザープール + アプリクライアント |
| **Secrets Manager** | 環境変数管理 | DB接続文字列、APIキー |
| **ECR** | コンテナレジストリ | GitHub Actions からプッシュ |

### CI/CD パイプライン

GitHub Actionsで以下のワークフローを構築します。

1. `main` ブランチへのプッシュでトリガー
2. `pnpm install` → `pnpm test` → `pnpm build`
3. Dockerイメージをビルドし、ECRにプッシュ
4. ECSサービスを更新（ローリングデプロイ）

### Dockerfile（参考）

```dockerfile
FROM node:22-slim AS builder
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN corepack enable && pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

FROM node:22-slim
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "dist/index.js"]
```

---

## 5. Phase 4: 本番運用・スケール

### モニタリング

CloudWatch Logsでアプリケーションログを収集し、CloudWatch Alarmsで異常検知（エラー率・レイテンシ）を設定します。Gemini APIのレート制限に近づいた場合のアラートも重要です。

### セキュリティ

S3バケットのパブリックアクセスを無効化し、CloudFront経由のみでアクセスを許可します。RDSはVPC内に配置し、セキュリティグループでECSからのみ接続を許可します。環境変数はSecrets Managerで管理し、コードにハードコードしません。

### スケール展望

UniAIの価値は1つの授業で終わりません。マルチ授業対応の後、以下のスケールを想定しています。

**学部レベル** — 同一学部の複数授業でUniAIを導入し、授業横断の知識グラフを構築。「この概念は別の授業でも扱われている」というクロスリファレンスを提供します。

**大学全体** — 講義ごとに収集された学習データをもとに、履修選択のあり方を変革します。文字だけのシラバスからは見えない本当の授業内容、先輩たちが実際にどこで躓き何を得たかというリアルな授業難易度を可視化し、学生がデータに基づいて最適な履修を選べる未来を目指します。

---

## 6. Claude Code活用ガイド

このプロジェクトをClaude Codeで継続開発する際の推奨ワークフローです。

### 初回セットアップ

```bash
# リポジトリをクローン
git clone https://github.com/<your-org>/uni-ai-learning.git
cd uni-ai-learning

# Claude Codeで開く
claude

# コンテキスト共有：以下のファイルを最初に読み込ませる
# 1. README.md — プロジェクト概要
# 2. DEVELOPMENT_ROADMAP.md — このドキュメント
# 3. drizzle/schema.ts — DBスキーマ
# 4. server/routers.ts — バックエンドAPI
# 5. todo.md — 残タスク一覧
```

### 推奨ワークフロー

**機能追加の流れ:** まず `drizzle/schema.ts` でテーブルを定義し、`pnpm db:push` でマイグレーション。次に `server/db.ts` にクエリヘルパーを追加し、`server/routers.ts` にtRPCプロシージャを作成。最後にフロントエンドのコンポーネントからtRPCフックで呼び出します。

**テスト:** `server/*.test.ts` にvitestのテストを書き、`pnpm test` で実行します。`server/auth.logout.test.ts` と `server/documents.test.ts` が参考になります。

**コード規約:** TypeScript strict mode、Tailwind CSS 4のユーティリティクラス、shadcn/uiコンポーネントの活用。インラインスタイルは避け、Tailwindクラスを使います。

### CLAUDE.md の作成

Claude Codeでの開発効率を上げるため、プロジェクトルートに `CLAUDE.md` を作成することを推奨します。以下の内容を含めてください。

```markdown
# CLAUDE.md

## プロジェクト概要
大学授業特化型AI学習支援プラットフォーム。React 19 + Express 4 + tRPC 11 + Drizzle ORM。

## 開発コマンド
- `pnpm dev` — 開発サーバー起動
- `pnpm db:push` — DBマイグレーション
- `pnpm test` — テスト実行
- `pnpm build` — 本番ビルド

## アーキテクチャ
- フロントエンド: client/src/ (React + Tailwind + shadcn/ui)
- バックエンド: server/ (Express + tRPC)
- DB: drizzle/schema.ts (Drizzle ORM + MySQL)
- 型安全: tRPCで型がフロント〜バックエンドで一貫

## 重要な規約
- DBスキーマ変更後は必ず `pnpm db:push`
- tRPCプロシージャは server/routers.ts に集約
- フロントエンドからのAPI呼び出しは必ず trpc.*.useQuery/useMutation
- テストは server/*.test.ts に vitest で記述
```

---

## タスク優先度サマリー

以下の表は、各フェーズのタスクを推奨する実施順序でまとめたものです。

| 優先度 | タスク | フェーズ | 推定工数 |
|---|---|---|---|
| **P0** | 認証の差し替え（Manus OAuth → Cognito） | Phase 1 | 3〜5日 |
| **P0** | ストレージの直接化（Forge → AWS SDK） | Phase 1 | 1日 |
| **P0** | LLMの直接化（Forge → Gemini SDK） | Phase 1 | 1日 |
| **P1** | みんなのQ&A — DB連携 | Phase 2 | 2〜3日 |
| **P1** | チャット履歴の永続化 | Phase 2 | 2〜3日 |
| **P1** | フィードバック — DB連携 | Phase 2 | 1日 |
| **P1** | 学習分析ダッシュボード — DB連携 | Phase 2 | 2〜3日 |
| **P2** | マルチ授業対応 | Phase 2 | 3〜5日 |
| **P2** | RAGベクトル検索 | Phase 2 | 3〜5日 |
| **P3** | AWSインフラ構築（ECS/RDS/S3/CloudFront） | Phase 3 | 3〜5日 |
| **P3** | CI/CDパイプライン | Phase 3 | 1〜2日 |
| **P3** | モニタリング・セキュリティ設定 | Phase 3 | 1〜2日 |
