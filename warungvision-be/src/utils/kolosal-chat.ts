export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface ChatCompletionRequest {
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  max_tokens?: number;
}

export interface ChatCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: ChatMessage;
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export class KolosalChatService {
  private apiKey: string;
  private apiUrl: string = "https://api.kolosal.ai";
  private model: string = "Claude Sonnet 4.5";

  constructor() {
    const apiKey = process.env.KOLOSAL_API_KEY;
    if (!apiKey) {
      throw new Error("KOLOSAL_API_KEY environment variable is not set");
    }
    this.apiKey = apiKey;
  }

  /**
   * Send a chat message and get AI response
   * @param messages Array of chat messages
   * @param model Optional model name (default: Claude Sonnet 4.5)
   * @returns ChatCompletionResponse with AI response
   */
  async chat(
    messages: ChatMessage[],
    model?: string
  ): Promise<ChatCompletionResponse> {
    try {
      const requestBody: ChatCompletionRequest = {
        model: model || this.model,
        messages,
        temperature: 0.7,
      };

      console.log("Kolosal Chat Request:", {
        endpoint: `${this.apiUrl}/v1/chat/completions`,
        model: requestBody.model,
        messageCount: messages.length,
      });

      const response = await fetch(`${this.apiUrl}/v1/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error("Kolosal Chat API Error Response:", {
          status: response.status,
          statusText: response.statusText,
          body: errorData,
        });
        throw new Error(
          `Kolosal Chat API error (${response.status}): ${errorData}`
        );
      }

      const data = (await response.json()) as ChatCompletionResponse;
      console.log("Kolosal Chat Success:", {
        model: data.model,
        tokensUsed: data.usage.total_tokens,
      });
      return data;
    } catch (error) {
      console.error("Error calling Kolosal Chat:", error);
      throw error;
    }
  }

  /**
   * Simple convenience method for single user message
   */
  async ask(userMessage: string, model?: string): Promise<string> {
    const response = await this.chat(
      [
        {
          role: "user",
          content: userMessage,
        },
      ],
      model
    );

    return response.choices[0]?.message?.content || "";
  }

  /**
   * Chat with conversation history
   */
  async chatWithHistory(
    userMessage: string,
    history: ChatMessage[],
    model?: string
  ): Promise<{ response: string; updatedHistory: ChatMessage[] }> {
    const messages = [...history, { role: "user" as const, content: userMessage }];
    const response = await this.chat(messages, model);

    const assistantMessage = response.choices[0]?.message;
    const updatedHistory = [...messages];

    if (assistantMessage) {
      updatedHistory.push(assistantMessage);
    }

    return {
      response: assistantMessage?.content || "",
      updatedHistory,
    };
  }
}

export const createKolosalChatService = () => new KolosalChatService();
