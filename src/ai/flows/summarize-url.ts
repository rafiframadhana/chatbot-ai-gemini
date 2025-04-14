'use server';

/**
 * @fileOverview Summarizes the content of a URL using a web scraper and an AI model.
 *
 * - summarizeUrl - A function that takes a URL and returns a summary of the content.
 * - SummarizeUrlInput - The input type for the summarizeUrl function.
 * - SummarizeUrlOutput - The return type for the summarizeUrl function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';
import {scrapeWebsite} from '@/services/web-scraper';

const SummarizeUrlInputSchema = z.object({
  url: z.string().describe('The URL to summarize.'),
});
export type SummarizeUrlInput = z.infer<typeof SummarizeUrlInputSchema>;

const SummarizeUrlOutputSchema = z.object({
  summary: z.string().describe('A summary of the content at the URL.'),
});
export type SummarizeUrlOutput = z.infer<typeof SummarizeUrlOutputSchema>;

export async function summarizeUrl(input: SummarizeUrlInput): Promise<SummarizeUrlOutput> {
  return summarizeUrlFlow(input);
}

const summarizeUrlPrompt = ai.definePrompt({
  name: 'summarizeUrlPrompt',
  input: {
    schema: z.object({
      url: z.string().describe('The URL to summarize.'),
      textContent: z.string().describe('The text content to summarize.'),
    }),
  },
  output: {
    schema: z.object({
      summary: z.string().describe('A summary of the content at the URL.'),
    }),
  },
  prompt: `You are an expert summarizer.

  Please summarize the following text content from the URL: {{{url}}}.

  Text content: {{{textContent}}}`,
});

const summarizeUrlFlow = ai.defineFlow<
  typeof SummarizeUrlInputSchema,
  typeof SummarizeUrlOutputSchema
>(
  {
    name: 'summarizeUrlFlow',
    inputSchema: SummarizeUrlInputSchema,
    outputSchema: SummarizeUrlOutputSchema,
  },
  async input => {
    const {url} = input;
    const scrapedContent = await scrapeWebsite(url);
    const {textContent} = scrapedContent;

    const {output} = await summarizeUrlPrompt({
      url: url,
      textContent: textContent,
    });

    return output!;
  }
);

