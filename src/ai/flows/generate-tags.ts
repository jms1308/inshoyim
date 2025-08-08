// This file uses server-side code.
'use server';

/**
 * @fileOverview Generates tag suggestions based on the content of an essay.
 *
 * - generateTags - A function that takes essay content as input and returns a list of tag suggestions.
 * - GenerateTagsInput - The input type for the generateTags function.
 * - GenerateTagsOutput - The return type for the generateTags function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateTagsInputSchema = z.object({
  content: z
    .string()
    .describe('The content of the essay for which to generate tags.'),
});
export type GenerateTagsInput = z.infer<typeof GenerateTagsInputSchema>;

const GenerateTagsOutputSchema = z.object({
  tags: z
    .array(z.string())
    .describe('An array of suggested tags for the essay.'),
});
export type GenerateTagsOutput = z.infer<typeof GenerateTagsOutputSchema>;

export async function generateTags(input: GenerateTagsInput): Promise<GenerateTagsOutput> {
  return generateTagsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateTagsPrompt',
  input: {schema: GenerateTagsInputSchema},
  output: {schema: GenerateTagsOutputSchema},
  prompt: `You are an expert in categorizing essays.

  Based on the content of the essay below, suggest 5 relevant tags that could be used to categorize it.

  Essay Content: {{{content}}}

  Output the tags as a JSON array of strings.
  Do not include any explanation or introductory text in your response, only the tags array.
  Make sure the tags are appropriate for Medium.
  Make sure the tags are all lowercase.
  Make sure there are no duplicated tags.
  `,
});

const generateTagsFlow = ai.defineFlow(
  {
    name: 'generateTagsFlow',
    inputSchema: GenerateTagsInputSchema,
    outputSchema: GenerateTagsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
