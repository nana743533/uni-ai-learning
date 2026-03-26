// ============================================================
// Mock Data for UniAI — 大学授業特化型 学習支援AIアプリ
// 授業：情報社会と倫理
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
  { id: 1, number: 1, title: "イントロダクション", subtitle: "1. 情報社会とは何か", status: "completed" },
  { id: 2, number: 2, title: "プライバシーとデータ保護", subtitle: "2. プライバシーとデータ保護", status: "completed" },
  { id: 3, number: 3, title: "著作権とデジタルコンテンツ", subtitle: "3. 著作権とデジタルコンテンツ", status: "completed" },
  { id: 4, number: 4, title: "AIと倫理", subtitle: "4. AIと倫理", status: "completed" },
  { id: 5, number: 5, title: "デジタル市民権とネットリテラシー", subtitle: "5. デジタル市民権とネットリテラシー", status: "current" },
  { id: 6, number: 6, title: "サイバーセキュリティと社会", subtitle: "6. サイバーセキュリティと社会", status: "upcoming" },
  { id: 7, number: 7, title: "ビッグデータと監視社会", subtitle: "7. ビッグデータと監視社会", status: "upcoming" },
  { id: 8, number: 8, title: "デジタルデバイドと情報格差", subtitle: "8. デジタルデバイドと情報格差", status: "upcoming" },
  { id: 9, number: 9, title: "情報倫理の国際比較", subtitle: "9. 情報倫理の国際比較", status: "upcoming" },
  { id: 10, number: 10, title: "情報社会の未来と私たちの責任", subtitle: "10. 情報社会の未来と私たちの責任", status: "upcoming" },
];

// ─── Q&A Threads ────────────────────────────────────────────
export const qaThreads: QAThread[] = [
  {
    id: 1,
    lectureId: 2,
    upvotes: 24,
    relevanceScore: 0.95,
    messages: [
      {
        id: 1,
        role: "student",
        studentId: "Student A",
        content:
          "個人情報保護法とGDPR（EU一般データ保護規則）の最大の違いは何ですか？日本で生活する私たちにGDPRは関係あるのでしょうか？",
        timestamp: "2024-10-08T10:15:00",
      },
      {
        id: 2,
        role: "ai",
        content:
          "第2回の講義資料によると、個人情報保護法は日本国内の個人データを対象とするのに対し、GDPRはEU域内の個人データを扱うすべての組織に適用されます。つまり、日本企業でもEU市民のデータを扱う場合はGDPRの対象になります。また、GDPRは「忘れられる権利」や「データポータビリティ」など、より広範な権利を個人に認めている点が特徴的です。「プライバシーの3つの側面について詳しく教えて」と聞いてみてください！",
        timestamp: "2024-10-08T10:16:30",
      },
      {
        id: 3,
        role: "student",
        studentId: "Student B",
        content: "なるほど、越境データの問題は知らなかった。ありがとう！",
        upvotes: 24,
        timestamp: "2024-10-08T10:20:00",
      },
    ],
  },
  {
    id: 2,
    lectureId: 4,
    upvotes: 18,
    relevanceScore: 0.91,
    messages: [
      {
        id: 4,
        role: "student",
        studentId: "Student C",
        content:
          "AIバイアスの具体的な事例を教えてください。実際にどのような問題が起きていますか？",
        timestamp: "2024-10-22T11:00:00",
      },
      {
        id: 5,
        role: "ai",
        content:
          "第4回の講義資料によると、代表的な事例として、米国の刑事司法で使われたCOMPASシステムが黒人被告に対して再犯リスクを過大評価していた問題や、Amazonの採用AIが女性の応募者を不利に評価していた事例が挙げられています。これらはいずれも学習データに含まれる社会的偏見がAIに反映された結果です。「AIの説明責任（アカウンタビリティ）について教えて」と聞いてみてください！",
        timestamp: "2024-10-22T11:01:15",
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
          "フェアユース（公正利用）と著作権侵害の境界線はどこにありますか？大学のレポートで他人の文章を引用する場合はどうなりますか？",
        timestamp: "2024-10-15T13:30:00",
      },
      {
        id: 7,
        role: "ai",
        content:
          "第3回の講義資料によると、フェアユースの判断には4つの要素（利用の目的・著作物の性質・利用の量・市場への影響）が考慮されます。大学のレポートでの引用は、出典を明記し、引用部分が従であり自分の論述が主であれば、日本の著作権法第32条の「引用」として認められます。ただし、丸写しや大量コピーは引用の範囲を超えるので注意が必要です。「クリエイティブ・コモンズ・ライセンスの種類を教えて」と聞いてみてください！",
        timestamp: "2024-10-15T13:31:40",
      },
    ],
  },
  {
    id: 4,
    lectureId: 5,
    upvotes: 9,
    relevanceScore: 0.85,
    messages: [
      {
        id: 8,
        role: "student",
        studentId: "Student E",
        content: "フィルターバブルとエコーチェンバーの違いは何ですか？SNSを使う上で気をつけるべきことはありますか？",
        timestamp: "2024-10-29T10:00:00",
      },
      {
        id: 9,
        role: "ai",
        content:
          "第5回の講義資料によると、フィルターバブルはアルゴリズムが個人の嗜好に合わせて情報を選別する現象で、エコーチェンバーは同じ意見を持つ人々の間で情報が反響・増幅される現象です。どちらも多様な視点に触れる機会を減少させます。対策としては、意識的に異なる立場のメディアに触れること、ファクトチェックの習慣をつけることが重要です。「デジタルリテラシーを高める具体的な方法を教えて」と聞いてみてください！",
        timestamp: "2024-10-29T10:01:30",
      },
    ],
  },
];

// ─── RAG Documents ──────────────────────────────────────────
export const ragDocuments: RAGDocument[] = [
  // 第1回
  { id: 1, lectureId: 1, type: "pdf", title: "第1回 講義スライド（情報社会とは何か）", uploadedBy: "○○教授", aiEnabled: true },
  { id: 2, lectureId: 1, type: "doc", title: "参考文献：情報社会論の系譜", uploadedBy: "○○教授", aiEnabled: true },
  { id: 3, lectureId: 1, type: "web", title: "総務省 情報通信白書（外部リンク）", uploadedBy: "○○教授", aiEnabled: false },
  { id: 4, lectureId: 1, type: "pdf", title: "第1回 課題：情報社会の身近な事例レポート", uploadedBy: "○○教授", aiEnabled: true },
  // 第2回
  { id: 5, lectureId: 2, type: "pdf", title: "第2回 講義スライド（プライバシーとデータ保護）", uploadedBy: "○○教授", aiEnabled: true },
  { id: 6, lectureId: 2, type: "doc", title: "個人情報保護法とGDPRの比較資料", uploadedBy: "○○教授", aiEnabled: true },
  { id: 7, lectureId: 2, type: "web", title: "個人情報保護委員会（外部サイト）", uploadedBy: "○○教授", aiEnabled: false },
  // 第3回
  { id: 8, lectureId: 3, type: "pdf", title: "第3回 講義スライド（著作権とデジタルコンテンツ）", uploadedBy: "○○教授", aiEnabled: true },
  { id: 9, lectureId: 3, type: "pdf", title: "フェアユースとクリエイティブ・コモンズ解説資料", uploadedBy: "○○教授", aiEnabled: true },
  // 第4回
  { id: 10, lectureId: 4, type: "pdf", title: "第4回 講義スライド（AIと倫理）", uploadedBy: "○○教授", aiEnabled: true },
  { id: 11, lectureId: 4, type: "doc", title: "AIバイアスの事例集", uploadedBy: "○○教授", aiEnabled: true },
  { id: 12, lectureId: 4, type: "web", title: "EU AI規制法の概要（外部サイト）", uploadedBy: "○○教授", aiEnabled: false },
];

// ─── Student Feedback ───────────────────────────────────────
export const studentFeedbacks: StudentFeedback[] = [
  { id: 1, lectureId: 1, studentId: "Student A", rating: 5, comment: "「情報社会の全体像がよく分かりました。」", timestamp: "2024-10-01T15:00:00" },
  { id: 2, lectureId: 1, studentId: "Student B", rating: 4, comment: "「AI相談機能で疑問がすぐ解消できてよかった。」", timestamp: "2024-10-01T15:30:00" },
  { id: 3, lectureId: 1, studentId: "Student C", rating: 4, comment: "「みんなのQ&Aで他の学生の視点が参考になりました！」", timestamp: "2024-10-01T16:00:00" },
  { id: 4, lectureId: 2, studentId: "Student D", rating: 5, comment: "「プライバシーの3つの側面が整理されて理解しやすかった！」", timestamp: "2024-10-08T15:00:00" },
  { id: 5, lectureId: 2, studentId: "Student E", rating: 3, comment: "「GDPRの部分が少し難しかったです。」", timestamp: "2024-10-08T15:30:00" },
  { id: 6, lectureId: 3, studentId: "Student F", rating: 4, comment: "「著作権の具体例が分かりやすかった。」", timestamp: "2024-10-15T15:00:00" },
  { id: 7, lectureId: 4, studentId: "Student G", rating: 5, comment: "「AIバイアスの事例が衝撃的でした。」", timestamp: "2024-10-22T15:00:00" },
];

// ─── Stats ──────────────────────────────────────────────────
export const lectureStats = {
  accessStudents: 95,
  totalEnrolled: 97,
  aiQuestions: 120,
  topQuestions: [
    { topic: "個人情報保護法とGDPR", count: 45 },
    { topic: "AIバイアスの事例", count: 25 },
    { topic: "著作権とフェアユース", count: 20 },
  ],
};
