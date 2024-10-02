import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { z } from "zod";
import { formSchema } from "./schema";
const genAI = new GoogleGenerativeAI(process.env?.GEMINI_API_KEY ?? "");
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
});

export async function basicPrompt(prompt: string) {
  const result = await model.generateContent(prompt);
  const resPrompt = result.response.text();

  return resPrompt;
}

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 8192,
  responseMimeType: "application/json",
  responseSchema: {
    type: SchemaType.OBJECT,
    properties: {
      title: {
        type: SchemaType.STRING,
      },
      statistics: {
        type: SchemaType.ARRAY,
        items: {
          type: SchemaType.OBJECT,
          properties: {
            key: {
              type: SchemaType.STRING,
            },
            value: {
              type: SchemaType.INTEGER,
            },
          },
        },
      },
      reasoning: {
        type: SchemaType.STRING,
      },
    },
  },
};

export interface JSONResponseFromPrompt {
  title: string;
  reasoning: string;
  statistics?: {
    key: string;
    value: number;
  }[];
}

export async function jsonPrompt(
  prompt: string
): Promise<JSONResponseFromPrompt> {
  const chatSession = model.startChat({
    generationConfig,
    // safetySettings: Adjust safety settings
    // See https://ai.google.dev/gemini-api/docs/safety-settings
    history: [],
  });

  const result = await chatSession.sendMessage(prompt);
  return JSON.parse(result.response.text());
}

export function promptCreation({
  formData,
}: {
  formData: z.infer<typeof formSchema>;
}) {
  return `Based on the following questions and responses:
${formData.qna
  .map(
    (e) =>
      `Question: "${e.question}" | ${formData.name} chose: "${
        e.answer
      }" | Other options were: "${e.options.join(", ")}".`
  )
  .join("\n")}

Now, using this information, guess which anime character most closely resembles ${
    formData.name
  }. Please provide only **one** anime character as your guess. Explain in **more than 50 but fewer than 100 words** why there is a similarity between ${
    formData.name
  } and this character. Focus on positive, quirky, and unique traits only.

Please ensure your reasoning is in 100-200 words. statistics contains keys like Persuasion, Humor, Intelligence, Optimism, Kindness & Strength their value will be in percentage, please include all keys. just add any random values if not able to calculate. title should be <10 words and only consist anime name & anime character
`;
}
