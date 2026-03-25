/**
 * デモ用PDFをS3にアップロードしてDBに登録するスクリプト
 * 実行: node scripts/upload_demo_pdfs.mjs
 */

import { readFileSync, existsSync } from "fs";
import { basename } from "path";
import { createConnection } from "mysql2/promise";
import { config } from "dotenv";

// .envを読み込む
config({ path: "/home/ubuntu/uni-ai-learning/.env" });

const FORGE_API_URL = process.env.BUILT_IN_FORGE_API_URL;
const FORGE_API_KEY = process.env.BUILT_IN_FORGE_API_KEY;
const DATABASE_URL = process.env.DATABASE_URL;

if (!FORGE_API_URL || !FORGE_API_KEY) {
  console.error("❌ BUILT_IN_FORGE_API_URL / BUILT_IN_FORGE_API_KEY が設定されていません");
  process.exit(1);
}

if (!DATABASE_URL) {
  console.error("❌ DATABASE_URL が設定されていません");
  process.exit(1);
}

// ── S3アップロード関数 ────────────────────────────────────────
async function storagePut(relKey, data, contentType = "application/pdf") {
  const baseUrl = FORGE_API_URL.replace(/\/+$/, "");
  const key = relKey.replace(/^\/+/, "");
  const uploadUrl = new URL("v1/storage/upload", baseUrl + "/");
  uploadUrl.searchParams.set("path", key);

  const blob = new Blob([data], { type: contentType });
  const form = new FormData();
  form.append("file", blob, key.split("/").pop() ?? key);

  const response = await fetch(uploadUrl, {
    method: "POST",
    headers: { Authorization: `Bearer ${FORGE_API_KEY}` },
    body: form,
  });

  if (!response.ok) {
    const msg = await response.text().catch(() => response.statusText);
    throw new Error(`Storage upload failed (${response.status}): ${msg}`);
  }
  const result = await response.json();
  return { key, url: result.url };
}

// ── デモデータ定義 ────────────────────────────────────────────
const DEMO_MATERIALS = [
  {
    lectureNumber: 1,
    title: "第1回 イントロダクション — 情報社会とは何か",
    fileName: "lecture01_intro.pdf",
    aiEnabled: "on",
  },
  {
    lectureNumber: 2,
    title: "第2回 プライバシーとデータ保護",
    fileName: "lecture02_privacy.pdf",
    aiEnabled: "on",
  },
  {
    lectureNumber: 3,
    title: "第3回 著作権とデジタルコンテンツ",
    fileName: "lecture03_copyright.pdf",
    aiEnabled: "on",
  },
  {
    lectureNumber: 4,
    title: "第4回 AIと倫理",
    fileName: "lecture04_ai_ethics.pdf",
    aiEnabled: "on",
  },
  {
    lectureNumber: 5,
    title: "第5回 デジタル市民権とネットリテラシー",
    fileName: "lecture05_digital_citizenship.pdf",
    aiEnabled: "on",
  },
];

const PDF_DIR = "/home/ubuntu/demo_pdfs";

// ── メイン処理 ────────────────────────────────────────────────
async function main() {
  console.log("=== デモ用PDF S3アップロード開始 ===\n");

  // DB接続
  const conn = await createConnection(DATABASE_URL);
  console.log("✓ DB接続成功\n");

  for (const material of DEMO_MATERIALS) {
    const filePath = `${PDF_DIR}/${material.fileName}`;
    if (!existsSync(filePath)) {
      console.warn(`⚠️  ファイルが見つかりません: ${filePath}`);
      continue;
    }

    const fileData = readFileSync(filePath);
    const fileSize = fileData.length;
    const randomSuffix = Math.random().toString(36).slice(2, 8);
    const fileKey = `documents/lecture-${material.lectureNumber}/${randomSuffix}-${material.fileName}`;

    console.log(`📤 アップロード中: ${material.title}`);
    const { url } = await storagePut(fileKey, fileData, "application/pdf");
    console.log(`   ✓ S3 URL: ${url.slice(0, 80)}...`);

    // DBに既存エントリがないか確認
    const [existing] = await conn.execute(
      "SELECT id FROM documents WHERE lectureNumber = ? AND title = ?",
      [material.lectureNumber, material.title]
    );
    if (existing.length > 0) {
      console.log(`   ⏭  既存エントリあり、スキップ`);
      continue;
    }

    // DBに登録
    await conn.execute(
      `INSERT INTO documents (lectureNumber, title, fileType, fileKey, fileUrl, fileSize, aiEnabled, uploadedBy, createdAt, updatedAt)
       VALUES (?, ?, 'pdf', ?, ?, ?, 'on', 'demo_professor', NOW(), NOW())`,
      [material.lectureNumber, material.title, fileKey, url, fileSize]
    );
    console.log(`   ✓ DB登録完了\n`);
  }

  await conn.end();
  console.log("✅ 全ファイルのアップロード・DB登録が完了しました！");
}

main().catch((err) => {
  console.error("❌ エラー:", err);
  process.exit(1);
});
