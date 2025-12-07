import FormData from "form-data";
import fs from "fs";
import path from "path";

export interface KolosalDetectionResult {
  name: string;
  confidence: number;
  bbox: number[];
  mask?: {
    width: number;
    height: number;
    png_base64: string | null;
  };
}

export interface KolosalResponse {
  success?: boolean;
  results: KolosalDetectionResult[];
  prompts_used?: string[];
  image_size?: number[];
  processing_time_ms: number;
  annotated_image?: string | null;
  // Additional fields that might be returned
  [key: string]: any;
}

export class KolosalService {
  private apiKey: string;
  private apiUrl: string = "https://api.kolosal.ai";
  private defaultPrompts: string[] = [
    "product",
    "item",
    "package",
    "bottle",
    "box",
    "container",
  ];

  constructor() {
    const apiKey = process.env.KOLOSAL_API_KEY;
    if (!apiKey) {
      throw new Error("KOLOSAL_API_KEY environment variable is not set");
    }
    this.apiKey = apiKey;
  }

  /**
   * Detect objects in an image using Kolosal AI's segment endpoint
   * @param imagePath Path to the image file
   * @param prompts Optional custom prompts for detection (default: generic product prompts)
   * @returns KolosalResponse with detected objects
   */
  async detectObjects(
    imagePath: string,
    prompts?: string[]
  ): Promise<KolosalResponse> {
    try {
      // Validate file exists
      if (!fs.existsSync(imagePath)) {
        throw new Error(`Image file not found: ${imagePath}`);
      }

      // Create form data
      const form = new FormData();
      const fileStream = fs.createReadStream(imagePath);

      form.append("file", fileStream);
      form.append("prompts", JSON.stringify(prompts || this.defaultPrompts));
      form.append("return_annotated", "true");
      form.append("return_masks", "false");
      form.append("threshold", "0.3");

      console.log("Kolosal API File Upload Request:", {
        endpoint: `${this.apiUrl}/v1/segment`,
        hasAuth: !!this.apiKey,
        prompts: prompts || this.defaultPrompts,
      });

      // Make request to Kolosal API
      const response = await fetch(`${this.apiUrl}/v1/segment`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          ...form.getHeaders(),
        },
        body: form as any,
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error("Kolosal API Error Response:", {
          status: response.status,
          statusText: response.statusText,
          body: errorData,
        });
        throw new Error(
          `Kolosal API error (${response.status}): ${errorData}`
        );
      }

      const data = (await response.json()) as KolosalResponse;
      console.log("Kolosal API Success:", {
        resultCount: data.results?.length,
        processingTimeMs: data.processing_time_ms,
      });
      return data;
    } catch (error) {
      console.error("Error detecting objects with Kolosal:", error);
      throw error;
    }
  }

  /**
   * Detect objects in an image from base64 data
   * @param base64Image Base64 encoded image string (without "data:image/...;base64," prefix)
   * @param prompts Optional custom prompts for detection
   * @returns KolosalResponse with detected objects
   */
  async detectObjectsFromBase64(
    base64Image: string,
    prompts?: string[]
  ): Promise<KolosalResponse> {
    try {
      // Ensure base64Image doesn't have data URL prefix
      const cleanBase64 = base64Image.includes("base64,")
        ? base64Image.split("base64,")[1]
        : base64Image;

      const requestBody = {
        image: cleanBase64,
        prompts: prompts || this.defaultPrompts,
        return_annotated: true,
        return_masks: false,
        threshold: 0.3,
      };

      console.log("Kolosal API Request:", {
        endpoint: `${this.apiUrl}/v1/segment/base64`,
        hasAuth: !!this.apiKey,
        imageLength: cleanBase64.length,
        prompts: requestBody.prompts,
      });

      const response = await fetch(`${this.apiUrl}/v1/segment/base64`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error("Kolosal API Error Response:", {
          status: response.status,
          statusText: response.statusText,
          body: errorData,
        });
        throw new Error(
          `Kolosal API error (${response.status}): ${errorData}`
        );
      }

      const data = (await response.json()) as KolosalResponse;
      console.log("Kolosal API Success:", {
        resultCount: data.results?.length,
        processingTimeMs: data.processing_time_ms,
      });
      return data;
    } catch (error) {
      console.error("Error detecting objects with Kolosal (base64):", error);
      throw error;
    }
  }

  /**
   * Get detection health status
   */
  async getHealth() {
    try {
      const response = await fetch(`${this.apiUrl}/v1/detect/health`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to get health status: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error getting Kolosal health:", error);
      throw error;
    }
  }

  /**
   * Get detection stats
   */
  async getStats() {
    try {
      const response = await fetch(`${this.apiUrl}/v1/detect/stats`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to get stats: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error getting Kolosal stats:", error);
      throw error;
    }
  }
}

export const createKolosalService = () => new KolosalService();
