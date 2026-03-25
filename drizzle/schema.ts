import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// TODO: Add your tables here

/**
 * 授業資料テーブル
 * 教授がアップロードしたファイルのメタデータを管理する
 */
export const documents = mysqlTable("documents", {
  id: int("id").autoincrement().primaryKey(),
  /** 授業回番号 (1〜10) */
  lectureNumber: int("lectureNumber").notNull(),
  /** ファイル表示名 */
  title: varchar("title", { length: 255 }).notNull(),
  /** ファイルの種類 (pdf, doc, ppt, etc.) */
  fileType: varchar("fileType", { length: 32 }).notNull(),
  /** S3上のファイルキー */
  fileKey: varchar("fileKey", { length: 512 }).notNull(),
  /** S3の公開URL */
  fileUrl: text("fileUrl").notNull(),
  /** ファイルサイズ (bytes) */
  fileSize: int("fileSize"),
  /** AIナレッジ対象かどうか */
  aiEnabled: mysqlEnum("aiEnabled", ["on", "off"]).default("on").notNull(),
  /** アップロードしたユーザーのopenId */
  uploadedBy: varchar("uploadedBy", { length: 64 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Document = typeof documents.$inferSelect;
export type InsertDocument = typeof documents.$inferInsert;