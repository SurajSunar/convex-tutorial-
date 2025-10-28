import { type Config } from "@convex-dev/agent";
import { rawRequestResponseHandler } from "./rawRequestResponseHandler";
import { languageModel, textEmbeddingModel } from "./models";

export const defaultConfig = {
  languageModel,
  rawRequestResponseHandler,
  //usageHandler,
  callSettings: {
    temperature: 1.0,
  },
  // If you want to use vector search, you need to set this.
  //textEmbeddingModel,
} satisfies Config;
