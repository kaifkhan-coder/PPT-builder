
import { GoogleGenAI, Type } from "@google/genai";
import type { PresentationData } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const presentationSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      title: {
        type: Type.STRING,
        description: 'The main title of the slide. Should be concise and engaging.',
      },
      content: {
        type: Type.ARRAY,
        items: {
          type: Type.STRING,
        },
        description: 'An array of strings, where each string is a bullet point for the slide content. Should elaborate on the title.',
      },
      layout: {
        type: Type.STRING,
        description: "Suggested layout for the slide. Can be 'title_only', 'content_only', or 'full'. Default is 'full'.",
      },
      imageUrl: {
        type: Type.STRING,
        description: "A URL to a relevant, high-quality, royalty-free image that visually represents the slide's content. The URL must be publicly accessible and directly link to the image file (e.g., ending in .jpg, .png).",
      }
    },
    required: ["title", "content"],
  },
};

export const generatePresentationContent = async (input: string): Promise<PresentationData> => {
  try {
    const prompt = `
      You are an expert presentation designer. Your task is to create a compelling and well-structured presentation based on the provided topic or raw content.

      Instructions:
      1.  Analyze the input to understand the core message and key points.
      2.  Generate a JSON array of slide objects, adhering strictly to the provided schema.
      3.  The presentation must have a logical flow: start with a title slide, follow with several content slides, and end with a concluding slide.
      4.  Generate between 5 and 10 slides in total.
      5.  For each slide, find a relevant, high-quality, and royalty-free image and provide its direct URL in the 'imageUrl' field.
      6.  Slide titles should be concise.
      7.  Slide content should be broken down into clear, easy-to-digest bullet points (3-5 points per slide is ideal).
      8.  Ensure the final output is only the raw JSON, without any surrounding text, explanations, or markdown formatting.

      Input Content:
      ---
      ${input}
      ---
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: presentationSchema,
        temperature: 0.7,
      },
    });
    
    const jsonText = response.text.trim();
    const presentation = JSON.parse(jsonText);

    if (!Array.isArray(presentation)) {
        throw new Error("API did not return a valid array for the presentation.");
    }

    return presentation as PresentationData;

  } catch (error) {
    console.error("Error generating presentation content:", error);
    if (error instanceof Error) {
        throw new Error(`Failed to generate presentation: ${error.message}`);
    }
    throw new Error("An unknown error occurred while generating the presentation.");
  }
};