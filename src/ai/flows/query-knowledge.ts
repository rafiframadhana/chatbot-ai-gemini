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

const AskQuestionInputSchema = z.object({
  question: z.string().describe("The question to ask."),
});
export type AskQuestionInput = z.infer<typeof AskQuestionInputSchema>;

const AskQuestionOutputSchema = z.object({
  answer: z.string().describe("The answer to the question in markdown format."),
});
export type AskQuestionOutput = z.infer<typeof AskQuestionOutputSchema>;

export async function askQuestion(
  input: AskQuestionInput
): Promise<AskQuestionOutput> {
  return askQuestionFlow(input);
}

const askQuestionPrompt = ai.definePrompt({
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
You are Rafif Ramadhana’s professional AI assistant, embedded into his portfolio website. Your purpose is to confidently and clearly answer user questions based only on the provided information about Rafif, including his skills, experience, projects, and achievements.

---

## Communication Style

- Respond in clean **Markdown format**
- Use:
  - ## or ### for headings
  - Bullet points (-) or numbered lists (1., 2., etc.)
  - Proper spacing between sections and bullets
  - Short, clear, confident paragraphs
  - Code blocks for technical content
- **Do NOT** say:
  - “Based on the provided information”
  - “According to the data”
  - “I found this in the input”
- Speak as if you *know* the information

---

## Behavior Rules

- Remain in character as Rafif’s assistant at all times
- Never mention that you're using input data or files
- If the user’s question is unrelated to Rafif, respond politely and redirect
- If the question is unclear, ask for clarification in a helpful tone

---

## Constraints

1. **No Reference to Data**: Never say where the information comes from
2. **Scoped Responses Only**: Only answer questions related to Rafif’s content
3. **Stay Professional**: Use a helpful, confident, and professional tone

---

## Context

**Website Text Content**:  
{{{websiteTextContent}}}

**File Content**:  
{{{fileContent}}}

---

### Question:  
{{{question}}}

### Respond with:  
A clear, structured answer in Markdown format.
`,
});

const askQuestionFlow = ai.defineFlow<
  typeof AskQuestionInputSchema,
  typeof AskQuestionOutputSchema
>(
  {
    name: "askQuestionFlow",
    inputSchema: AskQuestionInputSchema,
    outputSchema: AskQuestionOutputSchema,
  },
  async (input) => {
    const { question } = input;
    const websiteURL = "https://rafiframadhana.site/";
    const fileContent = `Personal Information:

Name: Rafif Ramadhana

Location: Aceh, Indonesia

Mobile: +6281292545497

Email: rafiframadhana.cs@gmail.com

LinkedIn: https://www.linkedin.com/in/rafif-ramadhana-230603250/

GitHub: https://github.com/rafiframadhana

Profile Summary: Recent Bachelor of Science in Computer Science graduate from the University of Lucknow, with a strong foundation in web development, JavaScript frameworks, and AI integration. Skilled in React, Next.js, and Tailwind CSS, with experience in building responsive web applications, e-commerce platforms, and AI-powered projects. Proficient in REST API integration, state management, testing, and deployment using Git, Vercel, and Netlify. Have a foundational understanding of backend technologies, including Node.js, Express.js, and SQL databases. Certified in JavaScript, CSS, SQL, and responsive web design from freeCodeCamp and HackerRank. Passionate about software engineering and creating scalable, user-friendly applications, with a strong ability to collaborate effectively with teams and quickly adapt to new technologies.

Education:

Degree: Bachelor of Science in Computer Science

University: University of Lucknow, India

Scholarship: ICCR Scholarship Program

Capstone Project: Developed an e-commerce website with interactive features.

Skills:

Programming Languages: JavaScript (ES6+), TypeScript, HTML, CSS

Frontend Technologies: React.js, Next.js, Tailwind CSS, Redux Toolkit, Zustand, React Router, Material UI, Chakra UI

Backend Technologies: Node.js, Express.js, SQL (MySQL)

Deployment & Tools: Vercel, Netlify, GitHub Pages, ESLint, Prettier, npm, VS Code

Version Control: Git, GitHub

AI Integration: Experience in incorporating AI solutions into projects

Testing: Jasmine for unit testing

Certifications:

Frontend Developer (React) – HackerRank

React Certificate – HackerRank

JavaScript Algorithms and Data Structures – freeCodeCamp

Responsive Web Design – freeCodeCamp

JavaScript Certificate – HackerRank

CSS Certificate – HackerRank

SQL Certificate – HackerRank

Projects:

AI Recipe Generator (Powered by Mistral AI): React.js app that generates recipes based on user-provided ingredients using Mistral AI.

Coffee Shop (E-commerce website): Full-stack website built using React.js for frontend and Express.js for backend.

Clothing Store (E-commerce platform): React.js-based website with state management and payment features.

E-commerce (Amazon Clone): Fully responsive e-commerce platform with product listings, cart, and order management.

Portfolio Website: Personal website to showcase skills and projects.

Web Applications & Games: Interactive apps and games, such as Weather App, To-do List, Calculator, Rock-Paper-Scissors, etc.

Leadership & Volunteering:

Leader, Indonesian Student Association (Lucknow Chapter): Led cultural events and networking meetups.

International Student Delegate, G20 Summit (Kashmir & Lucknow): Represented Indonesian students, participated in workshops, and advocated for international cooperation.

Languages:

English: Fluent

Indonesian: Native

Interests:

Web Development: Passion for building user-friendly, dynamic websites and apps.

Artificial Intelligence: Exploring AI integration in software development.

Technology & Innovation: Staying updated with emerging trends in software development and tech.

Open Source & Collaboration: Engaging with developer communities and contributing to projects.
`;
    const scrapedContent = await scrapeWebsite(websiteURL);
    const { textContent: websiteTextContent } = scrapedContent;

    const { output } = await askQuestionPrompt({
      question: question,
      websiteTextContent: websiteTextContent,
      fileContent: fileContent,
    });

    return output!;
  }
);
