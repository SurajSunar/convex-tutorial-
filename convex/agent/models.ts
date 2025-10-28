import type { EmbeddingModelV2, LanguageModelV2 } from "@ai-sdk/provider";
import { mockModel } from "@convex-dev/agent";
import { google } from "@ai-sdk/google";

let languageModel: LanguageModelV2;
let textEmbeddingModel: EmbeddingModelV2<string>;

if (process.env.GOOGLE_API_KEY) {
  languageModel = google.chat("gemini-2.5-flash");
  textEmbeddingModel = google.textEmbeddingModel("gemini-embedding-001");
}

// If you want to use different models for examples, you can change them here.
export { languageModel, textEmbeddingModel };
