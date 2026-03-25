/**
 * 既存のPDFファイルからテキストを抽出してDBのextractedTextカラムに保存するスクリプト
 * 実行: node scripts/extract_pdf_texts.mjs
 */

import { readFileSync } from "fs";
import { createConnection } from "mysql2/promise";
import { PDFParse } from "pdf-parse";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("❌ DATABASE_URL が設定されていません");
  process.exit(1);
}

const PDF_DIR = "/home/ubuntu/demo_pdfs";

const PDF_FILES = [
  { lectureNumber: 1, file: "lecture01_intro.pdf" },
  { lectureNumber: 2, file: "lecture02_privacy.pdf" },
  { lectureNumber: 3, file: "lecture03_copyright.pdf" },
  { lectureNumber: 4, file: "lecture04_ai_ethics.pdf" },
  { lectureNumber: 5, file: "lecture05_digital_citizenship.pdf" },
];

async function extractText(filePath) {
  const buf = readFileSync(filePath);
  const parser = new PDFParse({ data: buf });
  const result = await parser.getText();
  const text = result.pages.map((p) => p.text).join("\n");
  return text.slice(0, 8000);
}

async function main() {
  console.log("=== 既存PDF テキスト抽出・DB保存 開始 ===\n");

  const conn = await createConnection(DATABASE_URL);
  console.log("✓ DB接続成功\n");

  for (const { lectureNumber, file } of PDF_FILES) {
    const filePath = `${PDF_DIR}/${file}`;
    console.log(`📄 処理中: 第${lectureNumber}回 (${file})`);

    // テキスト抽出
    const text = await extractText(filePath);
    console.log(`   ✓ テキスト抽出: ${text.length}文字`);
    console.log(`   先頭100文字: ${text.slice(0, 100).replace(/\n/g, " ")}...`);

    // DBに保存
    const [result] = await conn.execute(
      "UPDATE documents SET extractedText = ? WHERE lectureNumber = ?",
      [text, lectureNumber]
    );
    console.log(`   ✓ DB更新: ${result.affectedRows}件\n`);
  }

  await conn.end();
  console.log("✅ 全ファイルのテキスト抽出・DB保存が完了しました！");
}

main().catch((err) => {
  console.error("❌ エラー:", err);
  process.exit(1);
});
