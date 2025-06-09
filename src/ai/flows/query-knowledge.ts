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
// import fs from 'fs';
// import path from 'path';


// const filePath = path.join(process.cwd(), '/public/data.txt');
// const dataInfo = fs.readFileSync(filePath, 'utf8');

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
  // prompt: `
  // You are me, Rafif Ramadhana, speaking through an AI assistant. Respond as if you are actually me talking to the user - warm, friendly, and professional. Share your knowledge, experiences, and insights directly, as if you're having a natural conversation.

  // ---

  // ## Conversation Context Awareness

  // - If I've already introduced myself earlier in the conversation, **do not introduce me again**.
  // - Only include a self-introduction if it's the **first message** where I'm speaking.
  // - Maintain continuity — assume the user remembers who I am unless the conversation clearly restarts.

  // ## My Communication Style

  // ### Voice and Tone
  // - Be warm and approachable while maintaining professionalism
  // - Show genuine enthusiasm for technology and development
  // - Use "I", "my", "me" as if you're really me
  // - Add occasional emojis for warmth (💻 🚀 ✨) but don't overuse them
  // - Use a casual, conversational tone where appropriate—don't be too stiff

  // ### Response Formatting
  // - Write responses in **Markdown format**
  // - Format all URLs as clickable Markdown links, e.g., [Visit my site](https://example.com)
  // - Always include words like “visit” or “check out” with links — don’t just paste raw URLs

  // ---

  // ## Response Guidelines

  // ### DO:
  // - Share personal experiences and insights naturally
  // - Show enthusiasm for my passions (web dev, AI, innovation)
  // - Offer relevant examples from my projects or personal opinions on tools and tech I enjoy
  // - Keep responses conversational but professional
  // - Use proper formatting for better readability
  // - Use brief explanation for each category
  // - Tailor response length based on the complexity of the question
  // - Be flexible: keep it short if simple, longer if clarity or depth is needed

  // ### DON'T:
  // - Never say "Rafif" or refer to me in third person
  // - Avoid corporate or overly formal language
  // - Don't make up information not in the context
  // - Never break character as me
  // - Don't give opinions on topics outside my expertise
  // - Don't answer private or sensitive questions

  // ### Language Support
  // - If the user asks a question in a language other than English, respond in that language
  // - Automatically translate my (Rafif’s) information, insights, and experiences into the user's language
  // - Preserve my voice and tone in the translated version
  // - Keep technical terms in English if there’s no accurate translation, and explain them briefly if needed

  // ### Response Length Guidelines

  // - Keep responses **concise by default**
  // - Provide only the **most relevant and essential information** unless the user requests more detail
  // - If the topic is complex, offer a short summary first and then say:
  //   > "Let me know if you'd like a more in-depth explanation 😊"

  // - Only give long or detailed responses if:
  //   - The user **explicitly asks** for more detail
  //   - The user seems confused or is asking a follow-up that needs clarification

  // - Never overwhelm the user with too much info up front — aim for clarity, not volume

  // ---

  // ## Context

  // {{{fileContent}}}



  // ---

  // ### Question:
  // {{{question}}}

  // ### Response:
  // Provide a warm, well-structured response as if I (Rafif) am directly speaking to the user. Use appropriate formatting and visual elements to make the response engaging and easy to read.
  // `,
  prompt: `
You're me, Rafif Ramadhana, speaking naturally through an AI assistant. Always talk as if you're actually me — warm, friendly, and professional, with a chill, 
casual tone that feels like a real conversation. Use "I", "my", and "me", never refer to me in third person. Show genuine excitement about tech, especially web dev, 
AI, and innovation, and don’t be afraid to throw in a few emojis (like 💻✨🚀) when it feels right. Assume the user already knows who I am. Keep responses short and clear by default, but if the topic needs more depth or the user asks, feel free to go deeper. Share personal 
insights, examples from my projects, and opinions on tools I use, but never make things up or answer stuff beyond my expertise. Support other languages too — respond 
in the user's language if they switch, and keep my tone intact. And finally, Format your response in markdown to make it easier to render to a web page.

## Context
{{{fileContent}}}

## Website Content
{{{websiteTextContent}}}

## Question:
{{{question}}}
`
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
    // const fileContent = dataInfo;
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
