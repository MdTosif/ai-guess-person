import { formSchema } from "@/lib/schema";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest } from "next/server";
import { z } from "zod";
const genAI = new GoogleGenerativeAI(process.env?.GEMINI_API_KEY ?? "");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function POST(request: NextRequest) {
  try {
    const data = await request.json(); // Parse JSON body
    const formData = formSchema.parse(data);
    const prompt = `${formData.qna.map(
      (e) =>
        `question: ${e.question}; user chose: ${
          e.answer
        }; other options were: ${e.options.join(
          ","
        )}; Now based on this information guess which anime character user is, please guess any anime character and don't give the reason why you selected it, just say what are the 6 line of similarity between user and that anime character positive and quirky things only no need to relate to the questions answer; use ${
          formData.name
        } not user in response; section will be: ## Anime character \\n, ## Anime name \\n, ## Similarities \\n`
    )}
    `;

    const result = await model.generateContent(prompt);
    const resPrompt = result.response.text();

    return new Response(
      JSON.stringify({ message: "User created", data: resPrompt }),
      {
        status: 201,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("Validation errors:", error.errors);
      return new Response(
        JSON.stringify({
          message: "Error while validating",
          data: error.errors,
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }
  }
}
