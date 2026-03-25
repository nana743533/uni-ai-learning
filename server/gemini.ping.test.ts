import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => {} } as unknown as TrpcContext["res"],
  };
}

describe("chat.ping — Gemini API connectivity", () => {
  it("returns ok:true when GEMINI_API_KEY is valid", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.chat.ping();
    console.log("[Gemini ping]", result);
    expect(result.ok).toBe(true);
  }, 15_000);
});
