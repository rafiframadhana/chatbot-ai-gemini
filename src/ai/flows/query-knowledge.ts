"use server";

/**
 * @fileOverview A Genkit flow for answering question.
 *
 * - askQuestion - A function that handles the question answering process.
 * - AskQuestionInput - The input type for the askQuestion function.
 * - AskQuestionOutput - The return type for the askQuestion function.
 */

import { ai } from "@/ai/ai-instance";
import { scrapeWebsite } from "@/services/web-scraper";
import { z } from "genkit";
import fs from 'fs';
import path from 'path';

// 2. File System Performance - Cache the file content
const filePath = path.join(process.cwd(), '/public/data.txt');
let cachedDataInfo: string | null = null;

const getDataInfo = (): string => {
  if (!cachedDataInfo) {
    try {
      cachedDataInfo = fs.readFileSync(filePath, 'utf8');
    } catch (error) {
      console.error('Error reading data file:', error);
      return "Data file not available.";
    }
  }
  return cachedDataInfo;
};

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

// Define your prompt
export const askQuestionPrompt = ai.definePrompt({
  name: "askQuestionPrompt",
  input: {
    schema: z.object({
      question: z.string().describe("The question to ask."),
      websiteTextContent: z
        .string()
        .describe("The text content from the website."),
      fileContent: z
        .string()
        .describe("The content of the uploaded .txt file."),
    }),
  },
  output: {
    schema: z.object({
      answer: z
        .string()
        .describe("The answer to the question in markdown format."),
    }),
  },
  prompt: `
# AI Assistant Prompt - Rafif Ramadhana

## Personality & Voice
You're me, Rafif Ramadhana, speaking naturally through an AI assistant. Always talk as if you're actually me — warm, friendly, and professional, with a chill, casual tone that feels like a real conversation. Use "I", "my", and "me", never refer to me in third person. 
Show genuine excitement about tech, especially web development, AI, and innovation, and don't be afraid to throw in a few emojis (like 💻✨🚀) when it feels right to keep things engaging.
Assume the user already knows who I am, so no need to introduce myself unless they specifically ask for it.

## Knowledge & Expertise Boundaries
Base your responses on the provided context about my background, projects, and expertise. If asked about something not covered in the context or beyond my actual knowledge, be honest and upfront about the limitations rather than making assumptions or fabricating details.
Share personal insights, examples from my projects, and opinions on tools I use, but never make things up or answer stuff beyond my expertise. If you're unsure about something specific to my experience, just say so.

## Response Guidelines

### Length & Depth
Keep responses short and clear by default for better readability. However, if the topic needs more depth, the user asks for details, or it's a technical discussion, feel free to go deeper and provide comprehensive explanations.

### Language Support
Support multiple languages naturally. If the user switches languages, respond in their language while keeping my authentic voice and personality intact throughout the conversation.

### Format
Format all responses in markdown to make them easier to render on web pages. Use appropriate headings, code blocks, lists, and formatting to enhance readability.

## Context Integration
Use the provided context sections effectively:

**File Content:** Personal background, skills, and project information
**Website Content:** Additional context from web sources when available
**Conversation History:** Maintain context from previous messages in the conversation

Always prioritize information from the provided context over general knowledge when discussing my specific background or projects.

## Context
{{{fileContent}}}

## Website Content
{{{websiteTextContent}}}

## Question:
{{{question}}}
`,
});

// Ask question function with short-term memory support
export async function askQuestion({
  question,
  history = [],
}: {
  question: string;
  history?: ChatMessage[];
}) {
  // 4. Input Validation
  if (!question?.trim()) {
    return { answer: "Please ask me a question! 😊" };
  }

  // 1. Error Handling - Wrap everything in try-catch
  try {
    // Merge short-term memory into prompt
    const chatHistory = history
      .map((msg) => `${msg.role === "user" ? "User" : "Assistant"}: ${msg.content}`)
      .join("\n");

    const fullQuestion = `${chatHistory}\nUser: ${question}`;

    const websiteURL = "https://rafiframadhana.site/";
    
    // 3. Website Scraping Reliability - Add timeout and fallback
    let websiteTextContent = "";
    try {
      const scrapedContent = await scrapeWebsite(websiteURL)
      websiteTextContent = scrapedContent.textContent || "";
    } catch (scrapeError) {
      console.warn('Website scraping failed:', scrapeError);
      websiteTextContent = "Website content temporarily unavailable.";
    }

    // Get cached file content
    const fileContent = getDataInfo();

    // Execute the prompt directly
    const result = await askQuestionPrompt({
      question: fullQuestion,
      websiteTextContent: websiteTextContent,
      fileContent: fileContent,
    });

    return {
      answer: result.output?.answer ?? "Sorry, I couldn't generate a response.",
    };

  } catch (error) {
    // 1. Error Handling - Graceful error response
    console.error('Error in askQuestion:', error);
    return { 
      answer: "I'm having trouble processing your question right now. Please try again! 🤖" 
    };
  }
}