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

/* import fs from 'fs';                       //not working on production 
import path from 'path';

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
}; */

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

export async function askQuestion({
  question,
  history = [],
}: {
  question: string;
  history?: ChatMessage[];
}) {
  if (!question?.trim()) {
    return { answer: "Please ask me a question! 😊" };
  }

  try {
    const chatHistory = history
      .map((msg) => `${msg.role === "user" ? "User" : "Assistant"}: ${msg.content}`)
      .join("\n");

    const fullQuestion = `${chatHistory}\nUser: ${question}`;

    const websiteURL = "https://rafiframadhana.site/";
    
    let websiteTextContent = "";
    try {
      const scrapedContent = await scrapeWebsite(websiteURL)
      websiteTextContent = scrapedContent.textContent || "";
    } catch (scrapeError) {
      console.warn('Website scraping failed:', scrapeError);
      websiteTextContent = "Website content temporarily unavailable.";
    }

    const fileContent = `
Personal Information:

- Name: Rafif Ramadhana
- Location: Aceh, Indonesia
- Mobile: +6281292545497
- Email: rafiframadhana.cs@gmail.com
- LinkedIn: https://www.linkedin.com/in/rafif-ramadhana-230603250/
- GitHub: https://github.com/rafiframadhana
- Profile Summary: Recent Bachelor of Science in Computer Science graduate from the University of Lucknow with a strong foundation in software engineering. Skilled in full-stack web development using **MERN stack** (MongoDB, Express.js, React, Node.js) and **Next.js**. Experienced in building responsive web applications, e-commerce platforms, and AI-powered projects. Familiar with SQL and NoSQL databases, and experienced in deploying apps with Vercel, Netlify, and Railway.

Education:

- Degree: Bachelor of Science in Computer Science
- University: University of Lucknow, India
- Scholarship: ICCR Scholarship Program
- Capstone Project: Developed a responsive e-commerce website with interactive features.

Skills:

- Programming Languages: JavaScript, TypeScript, HTML, CSS
- Frontend: Next.js, React, Redux Toolkit, Zustand, React Router, Tailwind CSS, MUI, Chakra UI, shadcn
- Backend: Node.js, Express.js 
- Databases: MongoDB (NoSQL), MySQL (SQL)
- Testing & Code Quality: Jest, Jasmine, ESLint, Prettier
- Tools & Deployment: Git, GitHub, Vercel, Netlify, GitHub Pages, Railway, Vite, npm, VS Code
- Other Skills: REST API (Axios, Fetch), Figma to Code, Responsive Design, AI Integration

Certifications:

- Frontend Developer (React) – HackerRank
- React Certificate – HackerRank
- JavaScript Algorithms and Data Structures – freeCodeCamp
- Responsive Web Design – freeCodeCamp
- JavaScript Certificate – HackerRank
- CSS Certificate – HackerRank
- SQL Certificate – HackerRank

Top Projects:

- FounderHub – Startup Directory Web App: Built a YC-style startup directory using Next.js, Tailwind CSS, and Auth.js. Deployed on Vercel with responsive design, dynamic routing, and real-time founder profile management. Link: https://founder-hub.vercel.app/
- Coffee Shop (Full-Stack E-commerce): Developed a full-stack e-commerce site using React and Express.js. Features include a product cart, user authentication, checkout, and dynamic menu. Utilized React Router and Context API. Link: https://coffeeculture-id.netlify.app/
- AI Chatbot: Built a modern, responsive chat interface with Next.js and Google's Gemini AI that helps users learn more about me by answering questions about my portfolio. Features a beautiful UI with typing animations, code snippet support, and mobile responsiveness. Link: https://rafif-ai.vercel.app/
- AI Recipe Generator (Powered by Mistral AI): Built a recipe-generating app using React and Mistral AI (via Hugging Face). UI created with Material UI and enhanced with third-party libraries. Link: https://recipebot-ai.netlify.app/
- Portfolio Website: Personal portfolio built with React and Framer Motion, featuring responsive design and modern UI/UX to showcase projects and experience. Link: https://rafiframadhana.site/

Languages:

- English: Fluent
- Indonesian: Native

Interests:
- Web Development: Passion for building user-friendly, dynamic websites and apps.
- Artificial Intelligence: Exploring AI integration in software development.
- Technology & Innovation: Staying updated with emerging trends in software development and tech.
- Open Source & Collaboration: Engaging with developer communities and contributing to projects.

Leadership & Volunteering

- Leader, Indonesian Student Association (Lucknow Chapter): Led cultural events and networking meetups.  
- International Student Delegate, G20 Summit (Kashmir & Lucknow): Represented Indonesian students and participated in international workshops.
`;

    const result = await askQuestionPrompt({
      question: fullQuestion,
      websiteTextContent: websiteTextContent,
      fileContent: fileContent,
    });

    return {
      answer: result.output?.answer ?? "Sorry, I couldn't generate a response.",
    };

  } catch (error) {
    console.error('Error in askQuestion:', error);
    return { 
      answer: "I'm having trouble processing your question right now. Please try again! 🤖" 
    };
  }
}