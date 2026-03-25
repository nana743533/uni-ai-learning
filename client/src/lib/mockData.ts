// ============================================================
// Mock Data for UniAI — 大学授業特化型 学習支援AIアプリ
// Design: Academic Clarity (Swiss International Style × Modern EdTech)
// ============================================================

export type LectureStatus = "completed" | "current" | "upcoming";
export type UserRole = "student" | "professor";

export interface Lecture {
  id: number;
  number: number;
  title: string;
  subtitle: string;
  status: LectureStatus;
}

export interface QAMessage {
  id: number;
  role: "student" | "ai";
  studentId?: string;
  content: string;
  upvotes?: number;
  timestamp: string;
}

export interface QAThread {
  id: number;
  lectureId: number;
  messages: QAMessage[];
  upvotes: number;
  relevanceScore: number;
}

export interface RAGDocument {
  id: number;
  lectureId: number;
  type: "pdf" | "doc" | "web" | "other";
  title: string;
  uploadedBy: string;
  aiEnabled: boolean;
}

export interface StudentFeedback {
  id: number;
  lectureId: number;
  studentId: string;
  rating: number;
  comment: string;
  timestamp: string;
}

// ─── Lectures ───────────────────────────────────────────────
export const lectures: Lecture[] = [
  { id: 1, number: 1, title: "ガイダンス", subtitle: "1. ガイダンス", status: "completed" },
  { id: 2, number: 2, title: "心理学の歴史（前編）", subtitle: "2. 心理学の歴史", status: "completed" },
  { id: 3, number: 3, title: "心理学の歴史（後編）", subtitle: "3. 心理学の歴史", status: "completed" },
  { id: 4, number: 4, title: "心理学の変わりゆく潮流", subtitle: "4. 心理学の変わりゆく...", status: "current" },
  { id: 5, number: 5, title: "心理学の歴史とつながり", subtitle: "5. 心理学の歴史とつ...", status: "upcoming" },
  { id: 6, number: 6, title: "心理学の統合を実践する", subtitle: "6. 心理学の統合を実...", status: "upcoming" },
  { id: 7, number: 7, title: "心理学の統合性を探る", subtitle: "7. 心理学の統合性を...", status: "upcoming" },
  { id: 8, number: 8, title: "心理学の実験", subtitle: "8. 心理学の実験", status: "upcoming" },
  { id: 9, number: 9, title: "現代社会とより豊かな生活", subtitle: "9. 現代社会とより豊...", status: "upcoming" },
  { id: 10, number: 10, title: "現代社会と心理学の統合", subtitle: "10. 現代社会と心理学の統合", status: "upcoming" },
];

// ─── Q&A Threads ────────────────────────────────────────────
export const qaThreads: QAThread[] = [
  {
    id: 1,
    lectureId: 1,
    upvotes: 24,
    relevanceScore: 0.95,
    messages: [
      {
        id: 1,
        role: "student",
        studentId: "Student A",
        content:
          "授業で紹介された『社会的比較理論』ですが、SNSが普及した現代において、その影響はポジティブな面とネガティブな面、どちらが優勢だと考えられますか？具体的な事例もあれば教えてください。",
        timestamp: "2024-10-01T10:15:00",
      },
      {
        id: 2,
        role: "ai",
        content:
          "興味深い質問ですね〜社会的比較理論はSNS時代にさらに重要性を増しています。ポジティブな面としては、自己研鑽のモチベーション向上（向上比較）があります。一方で、他者と比較しすぎて自己肯定感が低下する（下降比較の欠如、あるいは他人過剰比較による嫉妬など）ネガティブな影響も指摘されています（例えば、インスタグラムの『いいね』数への執着）。この点について、どう感じますか？",
        timestamp: "2024-10-01T10:16:30",
      },
      {
        id: 3,
        role: "student",
        studentId: "Student B",
        content: "私もネガティブな影響を強く感じる〜ありがとう！",
        upvotes: 24,
        timestamp: "2024-10-01T10:20:00",
      },
    ],
  },
  {
    id: 2,
    lectureId: 2,
    upvotes: 18,
    relevanceScore: 0.91,
    messages: [
      {
        id: 4,
        role: "student",
        studentId: "Student C",
        content:
          "フロイトの精神分析理論は現代心理学でどのように評価されていますか？",
        timestamp: "2024-10-08T11:00:00",
      },
      {
        id: 5,
        role: "ai",
        content:
          "フロイトの理論は現代では「科学的に検証困難」という批判を受けつつも、無意識・防衛機制・発達段階の概念は今も影響力を持っています。今回の資料では第2章でこの点が触れられていますよ。例えば「防衛機制の具体例をもっと教えて」と聞いてみてください！",
        timestamp: "2024-10-08T11:01:15",
      },
    ],
  },
  {
    id: 3,
    lectureId: 3,
    upvotes: 12,
    relevanceScore: 0.88,
    messages: [
      {
        id: 6,
        role: "student",
        studentId: "Student D",
        content:
          "行動主義心理学と認知心理学の最大の違いは何ですか？",
        timestamp: "2024-10-15T13:30:00",
      },
      {
        id: 7,
        role: "ai",
        content:
          "行動主義は「観察可能な行動のみを研究対象」とするのに対し、認知心理学は「内部の思考プロセス・記憶・問題解決」も扱います。ワトソンとスキナーが行動主義の代表、ピアジェやミラーが認知心理学の先駆者です。「認知心理学の具体的な実験例を教えて」と聞いてみてください！",
        timestamp: "2024-10-15T13:31:40",
      },
    ],
  },
  {
    id: 4,
    lectureId: 4,
    upvotes: 9,
    relevanceScore: 0.85,
    messages: [
      {
        id: 8,
        role: "student",
        studentId: "Student E",
        content: "ポジティブ心理学はいつ頃から注目されるようになったのですか？",
        timestamp: "2024-10-22T10:00:00",
      },
      {
        id: 9,
        role: "ai",
        content:
          "ポジティブ心理学は1998年にマーティン・セリグマンがAPA会長就任演説で提唱したことで広まりました。従来の「問題の修正」から「強みの活用・幸福の増進」へのシフトが特徴です。「ウェルビーイングの5要素（PERMAモデル）を説明して」と聞いてみてください！",
        timestamp: "2024-10-22T10:01:30",
      },
    ],
  },
];

// ─── RAG Documents ──────────────────────────────────────────
export const ragDocuments: RAGDocument[] = [
  // 第1回
  { id: 1, lectureId: 1, type: "pdf", title: "第1回 講義スライド（ガイダンス）", uploadedBy: "○○教授", aiEnabled: true },
  { id: 2, lectureId: 1, type: "doc", title: "参考文献：デカルトの省察", uploadedBy: "○○教授", aiEnabled: true },
  { id: 3, lectureId: 1, type: "web", title: "関連サイトリスト", uploadedBy: "○○教授", aiEnabled: false },
  { id: 4, lectureId: 1, type: "pdf", title: "第1回 課題：自己分析レポート", uploadedBy: "○○教授", aiEnabled: true },
  // 第2回
  { id: 5, lectureId: 2, type: "pdf", title: "第2回 講義スライド（心理学の歴史・前編）", uploadedBy: "○○教授", aiEnabled: true },
  { id: 6, lectureId: 2, type: "doc", title: "ヴントと構成主義の概要", uploadedBy: "○○教授", aiEnabled: true },
  { id: 7, lectureId: 2, type: "web", title: "心理学史タイムライン（外部サイト）", uploadedBy: "○○教授", aiEnabled: false },
  // 第3回
  { id: 8, lectureId: 3, type: "pdf", title: "第3回 講義スライド（心理学の歴史・後編）", uploadedBy: "○○教授", aiEnabled: true },
  { id: 9, lectureId: 3, type: "pdf", title: "行動主義と認知心理学の比較資料", uploadedBy: "○○教授", aiEnabled: true },
  // 第4回
  { id: 10, lectureId: 4, type: "pdf", title: "第4回 講義スライド（変わりゆく潮流）", uploadedBy: "○○教授", aiEnabled: true },
  { id: 11, lectureId: 4, type: "doc", title: "ポジティブ心理学入門", uploadedBy: "○○教授", aiEnabled: true },
  { id: 12, lectureId: 4, type: "web", title: "PERMAモデル解説サイト", uploadedBy: "○○教授", aiEnabled: false },
];

// ─── Student Feedback ───────────────────────────────────────
export const studentFeedbacks: StudentFeedback[] = [
  { id: 1, lectureId: 1, studentId: "Student A", rating: 5, comment: "「導入として分かりやすかったです。」", timestamp: "2024-10-01T15:00:00" },
  { id: 2, lectureId: 1, studentId: "Student B", rating: 4, comment: "「AI相談機能で疑問がすぐ解消できてよかった。」", timestamp: "2024-10-01T15:30:00" },
  { id: 3, lectureId: 1, studentId: "Student C", rating: 4, comment: "「みんなのQ&Aが参考になりました！」", timestamp: "2024-10-01T16:00:00" },
  { id: 4, lectureId: 2, studentId: "Student D", rating: 5, comment: "「心理学の歴史が面白かった！」", timestamp: "2024-10-08T15:00:00" },
  { id: 5, lectureId: 2, studentId: "Student E", rating: 3, comment: "「少し難しかったです。」", timestamp: "2024-10-08T15:30:00" },
  { id: 6, lectureId: 3, studentId: "Student F", rating: 4, comment: "「資料が分かりやすかった。」", timestamp: "2024-10-15T15:00:00" },
  { id: 7, lectureId: 4, studentId: "Student G", rating: 5, comment: "「AIのサポートが助かりました！」", timestamp: "2024-10-22T15:00:00" },
];

// ─── Stats ──────────────────────────────────────────────────
export const lectureStats = {
  accessStudents: 95,
  totalEnrolled: 97,
  aiQuestions: 120,
  topQuestions: [
    { topic: "履修方法について", count: 45 },
    { topic: "心理学の定義", count: 25 },
    { topic: "課題の提出期限", count: 20 },
  ],
};
