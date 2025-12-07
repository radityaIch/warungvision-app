import Elysia, { t } from "elysia";
import { KolosalChatService } from "../../utils/kolosal-chat";

let chatService: KolosalChatService;

try {
  chatService = new KolosalChatService();
} catch (error) {
  console.warn("Warning: Kolosal Chat service not fully configured:", error);
}

export const aiModule = new Elysia({
  prefix: "/api/v1/ai",
})
  .post(
    "/chat",
    async ({ body, query }) => {
      if (!chatService) {
        return { error: "AI chat service not configured" };
      }

      const { message, history, model } = body;

      try {
        if (history && history.length > 0) {
          const result = await chatService.chatWithHistory(message, history, model);
          return result;
        } else {
          const response = await chatService.ask(message, model);
          return {
            response,
            updatedHistory: [
              { role: "user", content: message },
              { role: "assistant", content: response },
            ],
          };
        }
      } catch (error) {
        console.error("Chat error:", error);
        return {
          error:
            error instanceof Error
              ? error.message
              : "Failed to process chat request",
        };
      }
    },
    {
      body: t.Object({
        message: t.String({ minLength: 1 }),
        history: t.Optional(
          t.Array(
            t.Object({
              role: t.Union([t.Literal("user"), t.Literal("assistant"), t.Literal("system")]),
              content: t.String(),
            })
          )
        ),
        model: t.Optional(t.String()),
      }),
    }
  )
  .get("/health", async () => {
    if (!chatService) {
      return { status: "unavailable", reason: "Service not configured" };
    }
    return { status: "ok" };
  });
