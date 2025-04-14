'use server';
/**
 * @fileOverview Defines a Genkit flow for ingesting a .txt file and making its contents available as context for the chatbot.
 *
 * - ingestTextFile - A function that handles the text file ingestion process.
 * - IngestTextFileInput - The input type for the ingestTextFile function, requiring a file content string.
 * - IngestTextFileOutput - The return type for the ingestTextFile function, returns the file content.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const IngestTextFileInputSchema = z.object({
  fileContent: z.string().describe('The content of the uploaded .txt file.'),
});
export type IngestTextFileInput = z.infer<typeof IngestTextFileInputSchema>;

const IngestTextFileOutputSchema = z.object({
  fileContent: z.string().describe('The content of the uploaded .txt file.'),
});
export type IngestTextFileOutput = z.infer<typeof IngestTextFileOutputSchema>;

export async function ingestTextFile(input: IngestTextFileInput): Promise<IngestTextFileOutput> {
  return ingestTextFileFlow(input);
}

const ingestTextFileFlow = ai.defineFlow<
  typeof IngestTextFileInputSchema,
  typeof IngestTextFileOutputSchema
>(
  {
    name: 'ingestTextFileFlow',
    inputSchema: IngestTextFileInputSchema,
    outputSchema: IngestTextFileOutputSchema,
  },
  async input => {
    // Simply return the file content as the output.
    return {fileContent: input.fileContent};
  }
);
