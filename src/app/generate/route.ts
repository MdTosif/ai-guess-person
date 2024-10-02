import { jsonPrompt, promptCreation } from "@/lib/prompt";
import { formSchema } from "@/lib/schema";
import { NextRequest } from "next/server";
import { z } from "zod";

export async function POST(request: NextRequest) {
  try {
    const data = await request.json(); // Parse JSON body
    const formData = formSchema.parse(data);
    const prompt = await promptCreation({ formData });

    const resPrompt = await jsonPrompt(prompt);
    console.log(JSON.stringify({ prompt, resPrompt }));

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
    return new Response(
      JSON.stringify({
        message: "Error while validating",
        data: error,
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
