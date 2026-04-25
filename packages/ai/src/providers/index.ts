/**
 * Vercel AI SDK Provider Configuration
 *
 * Unified provider setup using Vercel AI SDK
 */

import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createGroq } from "@ai-sdk/groq";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { experimental_createProviderRegistry as createProviderRegistry } from "ai";

export const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const anthropic = createAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
});

export const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export const registry = createProviderRegistry({
  openai,
  anthropic,
  groq,
  google,
});
