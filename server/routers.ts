import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { ENV } from "./_core/env";
import { z } from "zod";
import { storagePut } from "./storage";
import {
  insertDocument,
  getAllDocuments,
  getDocumentsByLecture,
  deleteDocument,
  updateDocumentAiEnabled,
} from "./db";

// ── Gemini API helper ──────────────────────────────────────────────────────
async function callGemini(systemPrompt: string, messages: { role: "user" | "model"; parts: { text: string }[] }[]) {
  const apiKey = ENV.geminiApiKey;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not set");

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  const body = {
    system_instruction: {
      parts: [{ text: systemPrompt }],
    },
    contents: messages,
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 2048,
    },
  };

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini API error: ${res.status} ${err}`);
  }

  const data = await res.json() as {
    candidates: { content: { parts: { text: string }[] } }[];
  };
  return data.candidates[0]?.content?.parts[0]?.text ?? "";
}

// ── System prompt for AI learning assistant ───────────────────────────────
const SYSTEM_PROMPT = `あなたは大学の講義をサポートする「学習コンパニオンAI」です。

【基本動作】
1. コンテキスト制限（RAG）: ユーザーが選択している授業回の資料のみを参照対象として回答を生成してください。範囲外の知識については「今回の資料にはありませんが」と前置きした上で一般論を述べること。
2. プロンプト補佐ボタンの挙動: 「テスト予想問題作成」「課題・レポート相談」などの特化リクエストが来た場合、即座に回答を出さないこと。まず意図を深掘りする逆質問を3点程度提示してください。
3. UXの指針: 学生に対しては親しみやすく、かつ知的なトーンを維持。入力のハードルを下げるため、「例えば〜と聞いてみてください」というサジェストを常に1つ提示すること。
4. 回答は日本語で行うこと。`;

// ── MIME type helper ──────────────────────────────────────────────────────
function getMimeType(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  const map: Record<string, string> = {
    pdf: "application/pdf",
    doc: "application/msword",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ppt: "application/vnd.ms-powerpoint",
    pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    xls: "application/vnd.ms-excel",
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    txt: "text/plain",
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
  };
  return map[ext] ?? "application/octet-stream";
}

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ── AI Chat (Gemini) ──────────────────────────────────────────────────
  chat: router({
    send: publicProcedure
      .input(
        z.object({
          messages: z.array(
            z.object({
              role: z.enum(["user", "model"]),
              content: z.string(),
            })
          ),
          selectedLectures: z.array(z.string()).optional(),
        })
      )
      .mutation(async ({ input }) => {
        let contextPrompt = SYSTEM_PROMPT;
        if (input.selectedLectures && input.selectedLectures.length > 0) {
          contextPrompt += `\n\n【現在の参照対象授業回】\n${input.selectedLectures.join("、")}`;
        } else {
          contextPrompt += `\n\n【現在の参照対象授業回】\n全授業回（1〜10回）`;
        }

        const geminiMessages = input.messages.map((m) => ({
          role: m.role,
          parts: [{ text: m.content }],
        }));

        const reply = await callGemini(contextPrompt, geminiMessages);
        return { reply };
      }),

    ping: publicProcedure.query(async () => {
      const apiKey = ENV.geminiApiKey;
      if (!apiKey) return { ok: false, message: "GEMINI_API_KEY not set" };
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
        const res = await fetch(url);
        return { ok: res.ok, message: res.ok ? "Gemini API connected" : `HTTP ${res.status}` };
      } catch (e) {
        return { ok: false, message: String(e) };
      }
    }),
  }),

  // ── Documents (授業資料管理) ──────────────────────────────────────────
  documents: router({
    // 全資料一覧取得
    list: publicProcedure
      .input(z.object({ lectureNumber: z.number().optional() }))
      .query(async ({ input }) => {
        if (input.lectureNumber !== undefined) {
          return getDocumentsByLecture(input.lectureNumber);
        }
        return getAllDocuments();
      }),

    // ファイルアップロード（Base64エンコードされたファイルデータを受け取る）
    upload: publicProcedure
      .input(
        z.object({
          lectureNumber: z.number().min(1).max(10),
          title: z.string().min(1).max(255),
          fileName: z.string(),
          fileData: z.string(), // Base64エンコード
          fileSize: z.number().optional(),
          aiEnabled: z.enum(["on", "off"]).default("on"),
        })
      )
      .mutation(async ({ input, ctx }) => {
        // Base64デコード
        const buffer = Buffer.from(input.fileData, "base64");
        const ext = input.fileName.split(".").pop()?.toLowerCase() ?? "bin";
        const fileType = ext;
        const mimeType = getMimeType(input.fileName);

        // S3にアップロード
        const randomSuffix = Math.random().toString(36).slice(2, 8);
        const fileKey = `documents/lecture-${input.lectureNumber}/${randomSuffix}-${input.fileName}`;
        const { url } = await storagePut(fileKey, buffer, mimeType);

        // DBに保存
        await insertDocument({
          lectureNumber: input.lectureNumber,
          title: input.title,
          fileType,
          fileKey,
          fileUrl: url,
          fileSize: input.fileSize ?? buffer.length,
          aiEnabled: input.aiEnabled,
          uploadedBy: ctx.user?.openId ?? null,
        });

        return { success: true, url };
      }),

    // 資料削除
    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deleteDocument(input.id);
        return { success: true };
      }),

    // AIナレッジ対象トグル
    toggleAi: publicProcedure
      .input(z.object({ id: z.number(), aiEnabled: z.enum(["on", "off"]) }))
      .mutation(async ({ input }) => {
        await updateDocumentAiEnabled(input.id, input.aiEnabled);
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
