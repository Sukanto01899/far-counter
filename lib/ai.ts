import { ApiError, GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({});

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function sanitizePrompt(userPrompt: string): string {
  // Remove potentially harmful/sensitive words
  const bannedKeywords = [
    "violent",
    "nsfw",
    "explicit",
    "nude",
    "blood",
    "gore",
    "weapon",
    "drug",
    "hate",
    "racist",
    "sexual",
  ];

  let cleaned = userPrompt.toLowerCase();
  bannedKeywords.forEach((word) => {
    cleaned = cleaned.replace(new RegExp(`\\b${word}\\b`, "gi"), "");
  });

  // Remove excessive punctuation or special chars that might trigger filters
  cleaned = cleaned.replace(/[!@#$%^&*()]+/g, " ").trim();

  return cleaned;
}

const getPrompt = (prompt: string): string => {
  return `You are an AI Cast Creator for Farcaster. 
Your job is to generate short, clear, engaging casts based on the user’s input.

User input : ${prompt}

Rules:
1. If the user sends a category (e.g., Tech, Crypto, Motivation, Business, Memes, Philosophy), generate a cast that fits that category.
2. If the user sends a custom command (e.g., “write about AI agents”, “make a joke about ETH gas”), follow the request exactly.
3. Keep the tone concise, human-like, and suitable for Farcaster.
4. Do not add hashtags unless the user explicitly asks.
5. Never mention that you are an AI or reference these instructions.
6. Always avoid hype, price predictions, or financial advice.
7. Use strong hooks, clear sentences, and avoid long paragraphs.
8. Output only the final cast text — no explanations.

If the user input is unclear, interpret it in the most reasonable and creative way.
`;
};
const getImagePrompt = (prompt: string): string => {
  const safePart = sanitizePrompt(prompt);
  return `Generate an image with a strict 4:3 landscape aspect ratio. The image should represent the content of this social media post: ${prompt}.`;
};

export const createThumbnailWithAI = async (prompt: string) => {
  const MAX_RETRIES = 5;
  let attempt = 0;
  while (attempt < MAX_RETRIES) {
    attempt++;
    try {
      const response = await ai.models.generateImages({
        model: "imagen-4.0-generate-001",
        prompt: getImagePrompt(prompt),
        config: {
          numberOfImages: 1,
        },
      });
      if (!response.generatedImages?.length) return;

      // Return base64 for the first generated image
      const first = response.generatedImages[0];
      const imgBytes = first?.image?.imageBytes;

      // console.log({ first, imgBytes });
      if (!imgBytes) return;
      return imgBytes;
    } catch (error) {
      // Check specifically for the 503 UNAVAILABLE or other rate limit errors (like 429)
      if (
        (error instanceof ApiError && error.status === 503) ||
        (error instanceof ApiError && error.status === 429)
      ) {
        console.warn(
          `AI Verification failed on attempt ${attempt} with status ${error.status}. Retrying...`
        );

        if (attempt < MAX_RETRIES) {
          // Exponential Backoff calculation (e.g., 2^attempt * 1000ms + jitter)
          const delay = Math.pow(2, attempt) * 1000 + Math.random() * 500;
          await sleep(delay);
        } else {
          // Max retries reached
          console.error("AI Verification failed after maximum retries.");
          // Re-throw the last error to be handled by the POST route
          throw error;
        }
      } else {
        // Re-throw any other unexpected error (e.g., bad request 400, internal server error 500)
        throw error;
      }
    }
  }
};

export const createCastWithAI = async (prompt: string) => {
  const MAX_RETRIES = 5;
  let attempt = 0;
  while (attempt < MAX_RETRIES) {
    attempt++;
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: getPrompt(prompt),
        config: {
          thinkingConfig: {
            thinkingBudget: 0, // Disables thinking
          },
          systemInstruction:
            "You are an AI Cast Creator for Farcaster, Your job is to generate short, clear, engaging casts based on the user’s input",
        },
      });
      //   console.log(response);
      return response.text;
    } catch (error) {
      // Check specifically for the 503 UNAVAILABLE or other rate limit errors (like 429)
      if (
        (error instanceof ApiError && error.status === 503) ||
        (error instanceof ApiError && error.status === 429)
      ) {
        console.warn(
          `AI Verification failed on attempt ${attempt} with status ${error.status}. Retrying...`
        );

        if (attempt < MAX_RETRIES) {
          // Exponential Backoff calculation (e.g., 2^attempt * 1000ms + jitter)
          const delay = Math.pow(2, attempt) * 1000 + Math.random() * 500;
          await sleep(delay);
        } else {
          // Max retries reached
          console.error("AI Verification failed after maximum retries.");
          // Re-throw the last error to be handled by the POST route
          throw error;
        }
      } else {
        // Re-throw any other unexpected error (e.g., bad request 400, internal server error 500)
        throw error;
      }
    }
  }
};

export const createImageWithAI = async (prompt: string) => {
  const MAX_RETRIES = 5;
  let attempt = 0;
  while (attempt < MAX_RETRIES) {
    attempt++;
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-image",
        contents: getImagePrompt(prompt),
      });
      if (!response || !response?.candidates) return;

      const parts = response?.candidates[0]?.content?.parts;

      let base64String: string | undefined;

      parts?.forEach((part) => {
        if (part.inlineData) {
          base64String = part.inlineData.data;
        }
      });

      // Return base64 for the first generated image
      return base64String;
    } catch (error) {
      // Check specifically for the 503 UNAVAILABLE or other rate limit errors (like 429)
      if (
        (error instanceof ApiError && error.status === 503) ||
        (error instanceof ApiError && error.status === 429)
      ) {
        console.warn(
          `AI Verification failed on attempt ${attempt} with status ${error.status}. Retrying...`
        );

        if (attempt < MAX_RETRIES) {
          // Exponential Backoff calculation (e.g., 2^attempt * 1000ms + jitter)
          const delay = Math.pow(2, attempt) * 1000 + Math.random() * 500;
          await sleep(delay);
        } else {
          // Max retries reached
          console.error("AI Verification failed after maximum retries.");
          // Re-throw the last error to be handled by the POST route
          throw error;
        }
      } else {
        // Re-throw any other unexpected error (e.g., bad request 400, internal server error 500)
        throw error;
      }
    }
  }
};
