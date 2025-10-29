import { GoogleGenAI } from "@google/genai";
import { api, components, internal } from "./_generated/api";
import { internalAction, mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { listMessages, saveMessage } from "@convex-dev/agent";
import { agent } from "./agent/simple";
import { paginationOptsValidator } from "convex/server";
import { authorizeThreadAccess } from "./thread";

const GEMINI_API_KEY = process.env.GOOGLE_API_KEY;

const ai = new GoogleGenAI({
  apiKey: GEMINI_API_KEY,
});

export const sendMessage = mutation({
  args: {
    user: v.string(),
    body: v.string(),
  },
  handler: async (ctx, args) => {
    console.log("This TypeScript function is running on the server.");
    await ctx.db.insert("messages", {
      user: args.user,
      body: args.body,
    });

    if (args.body.startsWith("/wiki")) {
      // Get the string after the first space
      const topic = args.body.slice(args.body.indexOf(" ") + 1);
      await ctx.scheduler.runAfter(0, internal.chat.getWikipediaSummary, {
        topic,
      });
    }

    if (args.body.startsWith("/ai")) {
      // Get the string after the first space
      const topic = args.body.slice(args.body.indexOf(" ") + 1);
      await ctx.scheduler.runAfter(0, internal.chat.getGeminiResponse, {
        topic,
      });
    }
  },
});

export const getMessages = query({
  args: {},
  handler: async (ctx) => {
    // Get most recent messages first
    const messages = await ctx.db.query("messages").order("desc").take(50);
    // Reverse the list so that it's in a chronological order.
    return messages.reverse();
  },
});

export const getWikipediaSummary = internalAction({
  args: { topic: v.string() },
  handler: async (ctx, args) => {
    console.log("wiki 1 =", args.topic);
    const response = await fetch(process.env.WIKI_API + args.topic);

    console.log("wiki 2 =", response);

    const summary = getSummaryFromJSON(await response.json());
    await ctx.scheduler.runAfter(0, api.chat.sendMessage, {
      user: "Wikipedia",
      body: summary,
    });
  },
});

function getSummaryFromJSON(data: any) {
  const firstPageId = Object.keys(data.query.pages)[0];
  return data.query.pages[firstPageId].extract;
}

export const getGeminiResponse = internalAction({
  args: { topic: v.string() },
  handler: async (ctx, args) => {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: args.topic,
    });

    await ctx.scheduler.runAfter(0, api.chat.sendMessage, {
      user: "Gemini",
      body: response?.text || "",
    });
  },
});

export const sendThreadMessage = mutation({
  args: { prompt: v.string(), threadId: v.string() },
  handler: async (ctx, { prompt, threadId }) => {
    await authorizeThreadAccess(ctx, threadId);

    const { messageId } = await saveMessage(ctx, components.agent, {
      threadId,
      prompt,
    });

    await ctx.scheduler.runAfter(0, internal.chat.generateResponse, {
      threadId,
      promptMessageId: messageId,
    });
  },
});

// Generate a response to a user message.
// Any clients listing the messages will automatically get the new message.
export const generateResponse = internalAction({
  args: { promptMessageId: v.string(), threadId: v.string() },
  handler: async (ctx, { promptMessageId, threadId }) => {
    const data = await agent.generateText(
      ctx,
      { threadId },
      { promptMessageId }
    );
    return data.response.body?.candidates[0].content.parts[0].text;
  },
});

export const listThreadMessages = query({
  args: {
    threadId: v.string(),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const { threadId, paginationOpts } = args;
    await authorizeThreadAccess(ctx, threadId);
    const messages = await listMessages(ctx, components.agent, {
      threadId,
      paginationOpts,
    });
    // You could add more fields here, join with other tables, etc.
    return messages;
  },
});
