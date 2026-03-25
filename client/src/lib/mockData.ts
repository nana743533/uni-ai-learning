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
  { id: 2, number: 2, title: "心理学の歴史", subtitle: "2. 心理学の歴史", status: "completed" },
  { id: 3, number: 3, title: "心理学の歴史", subtitle: "3. 心理学の歴史", status: "completed" },
  { id: 4, number: 4, title: "心理学の変わりゆく...", subtitle: "4. 心理学の変わりゆく...", status: "current" },
  { id: 5, number: 5, title: "心理学の歴史とつ...", subtitle: "5. 心理学の歴史とつ...", status: "upcoming" },
  { id: 6, number: 6, title: "心理学の統合を実...", subtitle: "6. 心理学の統合を実...", status: "upcoming" },
  { id: 7, number: 7, title: "心理学の統合性を...", subtitle: "7. 心理学の統合性を...", status: "upcoming" },
  { id: 8, number: 8, title: "心理学の実験", subtitle: "8. 心理学の実験", status: "upcoming" },
  { id: 9, number: 9, title: "現代社会とより豊...", subtitle: "9. 現代社会とより豊...", status: "upcoming" },
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
    lectureId: 1,
    upvotes: 18,
    relevanceScore: 0.91,
    messages: [
      {
        id: 4,
        role: "student",
        studentId: "Student C",
        content:
          "フロイトの精神分析理論は現代心理学でどのように評価されていますか？",
        timestamp: "2024-10-01T11:00:00",
      },
      {
        id: 5,
        role: "ai",
        content:
          "フロイトの理論は現代では「科学的に検証困難」という批判を受けつつも、無意識・防衛機制・発達段階の概念は今も影響力を持っています。今回の資料では第2章でこの点が触れられていますよ。例えば「防衛機制の具体例をもっと教えて」と聞いてみてください！",
        timestamp: "2024-10-01T11:01:15",
      },
    ],
  },
  {
    id: 3,
    lectureId: 1,
    upvotes: 12,
    relevanceScore: 0.88,
    messages: [
      {
        id: 6,
        role: "student",
        studentId: "Student D",
        content:
          "行動主義心理学と認知心理学の最大の違いは何ですか？",
        timestamp: "2024-10-01T13:30:00",
      },
      {
        id: 7,
        role: "ai",
        content:
          "行動主義は「観察可能な行動のみを研究対象」とするのに対し、認知心理学は「内部の思考プロセス・記憶・問題解決」も扱います。ワトソンとスキナーが行動主義の代表、ピアジェやミラーが認知心理学の先駆者です。「認知心理学の具体的な実験例を教えて」と聞いてみてください！",
        timestamp: "2024-10-01T13:31:40",
      },
    ],
  },
];

// ─── RAG Documents ──────────────────────────────────────────
export const ragDocuments: RAGDocument[] = [
  {
    id: 1,
    lectureId: 1,
    type: "pdf",
    title: "第1回 講義スライド（ガイダンス）",
    uploadedBy: "○○教授",
    aiEnabled: true,
  },
  {
    id: 2,
    lectureId: 1,
    type: "doc",
    title: "参考文献：デカルトの省察",
    uploadedBy: "○○教授",
    aiEnabled: true,
  },
  {
    id: 3,
    lectureId: 1,
    type: "web",
    title: "関連サイトリスト",
    uploadedBy: "○○教授",
    aiEnabled: false,
  },
  {
    id: 4,
    lectureId: 1,
    type: "pdf",
    title: "第1回 課題：自己分析レポート",
    uploadedBy: "○○教授",
    aiEnabled: true,
  },
];

// ─── Student Feedback ───────────────────────────────────────
export const studentFeedbacks: StudentFeedback[] = [
  {
    id: 1,
    lectureId: 1,
    studentId: "Student A",
    rating: 5,
    comment: "「導入として分かりやすかったです。」",
    timestamp: "2024-10-01T15:00:00",
  },
  {
    id: 2,
    lectureId: 1,
    studentId: "Student B",
    rating: 4,
    comment: "「AI相談機能で疑問がすぐ解消できてよかった。」",
    timestamp: "2024-10-01T15:30:00",
  },
  {
    id: 3,
    lectureId: 1,
    studentId: "Student C",
    rating: 4,
    comment: "「みんなのQ&Aが参考になりました！」",
    timestamp: "2024-10-01T16:00:00",
  },
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
