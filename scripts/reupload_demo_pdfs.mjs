/**
 * 修正版PDFをS3に再アップロードしてDBの既存レコードを更新するスクリプト
 * 実行: node scripts/reupload_demo_pdfs.mjs
 */

import { readFileSync, existsSync } from "fs";
import { createConnection } from "mysql2/promise";
import { config } from "dotenv";

config({ path: "/home/ubuntu/uni-ai-learning/.env" });

const FORGE_API_URL = process.env.BUILT_IN_FORGE_API_URL;
const FORGE_API_KEY = process.env.BUILT_IN_FORGE_API_KEY;
const DATABASE_URL = process.env.DATABASE_URL;

if (!FORGE_API_URL || !FORGE_API_KEY || !DATABASE_URL) {
  console.error("❌ 環境変数が不足しています");
  process.exit(1);
}

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

// PDFテキスト抽出（pdf-parseを使用）
async function extractPdfText(buffer) {
  try {
    const { PDFParse } = await import("pdf-parse-new");
    const parser = new PDFParse();
    const result = await parser.parse(buffer);
    return result.text || "";
  } catch (e) {
    console.warn("   ⚠️ テキスト抽出失敗:", e.message);
    return "";
  }
}

const DEMO_MATERIALS = [
  { lectureNumber: 1, fileName: "lecture01_intro.pdf" },
  { lectureNumber: 2, fileName: "lecture02_privacy.pdf" },
  { lectureNumber: 3, fileName: "lecture03_copyright.pdf" },
  { lectureNumber: 4, fileName: "lecture04_ai_ethics.pdf" },
  { lectureNumber: 5, fileName: "lecture05_digital_citizenship.pdf" },
];

const PDF_DIR = "/home/ubuntu/demo_pdfs";

async function main() {
  console.log("=== 修正版PDF S3再アップロード＆DB更新 ===\n");

  const conn = await createConnection(DATABASE_URL);
  console.log("✓ DB接続成功\n");

  for (const material of DEMO_MATERIALS) {
    const filePath = `${PDF_DIR}/${material.fileName}`;
    if (!existsSync(filePath)) {
      console.warn(`⚠️ ファイルが見つかりません: ${filePath}`);
      continue;
    }

    const fileData = readFileSync(filePath);
    const fileSize = fileData.length;
    const randomSuffix = Math.random().toString(36).slice(2, 8);
    const fileKey = `documents/lecture-${material.lectureNumber}/v2-${randomSuffix}-${material.fileName}`;

    console.log(`📤 第${material.lectureNumber}回 再アップロード中...`);
    const { url } = await storagePut(fileKey, fileData, "application/pdf");
    console.log(`   ✓ S3 URL: ${url.slice(0, 80)}...`);

    // テキスト抽出
    console.log(`   📝 テキスト抽出中...`);
    const extractedText = await extractPdfText(fileData);
    console.log(`   ✓ 抽出文字数: ${extractedText.length}`);

    // 既存レコードを更新
    const [result] = await conn.execute(
      `UPDATE documents 
       SET fileKey = ?, fileUrl = ?, fileSize = ?, extractedText = ?, updatedAt = NOW()
       WHERE lectureNumber = ?`,
      [fileKey, url, fileSize, extractedText, material.lectureNumber]
    );
    console.log(`   ✓ DB更新: ${result.affectedRows}件\n`);
  }

  await conn.end();
  console.log("✅ 全5件の再アップロード・DB更新が完了しました！");
}

main().catch((err) => {
  console.error("❌ エラー:", err);
  process.exit(1);
});
