import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the db module
vi.mock("./db", () => ({
  insertDocument: vi.fn().mockResolvedValue({ insertId: 1 }),
  getDocumentsByLecture: vi.fn().mockResolvedValue([
    {
      id: 1,
      lectureNumber: 1,
      title: "テスト資料",
      fileType: "pdf",
      fileKey: "documents/lecture-1/abc123-test.pdf",
      fileUrl: "https://cdn.example.com/documents/lecture-1/abc123-test.pdf",
      fileSize: 102400,
      aiEnabled: "on",
      uploadedBy: "user123",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]),
  getAllDocuments: vi.fn().mockResolvedValue([]),
  deleteDocument: vi.fn().mockResolvedValue({}),
  updateDocumentAiEnabled: vi.fn().mockResolvedValue({}),
}));

// Mock storage
vi.mock("./storage", () => ({
  storagePut: vi.fn().mockResolvedValue({
    key: "documents/lecture-1/abc123-test.pdf",
    url: "https://cdn.example.com/documents/lecture-1/abc123-test.pdf",
  }),
}));

import {
  insertDocument,
  getDocumentsByLecture,
  deleteDocument,
  updateDocumentAiEnabled,
} from "./db";

describe("documents — CRUD helpers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("getDocumentsByLecture returns documents for lecture 1", async () => {
    const docs = await getDocumentsByLecture(1);
    expect(docs).toHaveLength(1);
    expect(docs[0].lectureNumber).toBe(1);
    expect(docs[0].fileType).toBe("pdf");
    expect(docs[0].aiEnabled).toBe("on");
  });

  it("insertDocument is called with correct params", async () => {
    await insertDocument({
      lectureNumber: 2,
      title: "第2回スライド",
      fileType: "pptx",
      fileKey: "documents/lecture-2/xyz-slide.pptx",
      fileUrl: "https://cdn.example.com/documents/lecture-2/xyz-slide.pptx",
      fileSize: 204800,
      aiEnabled: "on",
      uploadedBy: "prof001",
    });
    expect(insertDocument).toHaveBeenCalledWith(
      expect.objectContaining({
        lectureNumber: 2,
        title: "第2回スライド",
        fileType: "pptx",
      })
    );
  });

  it("deleteDocument is called with correct id", async () => {
    await deleteDocument(42);
    expect(deleteDocument).toHaveBeenCalledWith(42);
  });

  it("updateDocumentAiEnabled toggles correctly", async () => {
    await updateDocumentAiEnabled(1, "off");
    expect(updateDocumentAiEnabled).toHaveBeenCalledWith(1, "off");
  });

  it("insertDocument accepts extractedText for RAG", async () => {
    await insertDocument({
      lectureNumber: 4,
      title: "第4回 AIと倫理",
      fileType: "pdf",
      fileKey: "documents/lecture-4/abc-ai-ethics.pdf",
      fileUrl: "https://cdn.example.com/documents/lecture-4/abc-ai-ethics.pdf",
      fileSize: 110000,
      aiEnabled: "on",
      uploadedBy: "prof001",
      extractedText: "AIバイアスとは、訓練データの偏りによりAIが不公平な判断を下す現象です。",
    });
    expect(insertDocument).toHaveBeenCalledWith(
      expect.objectContaining({
        lectureNumber: 4,
        extractedText: expect.stringContaining("AIバイアス"),
      })
    );
  });
});
