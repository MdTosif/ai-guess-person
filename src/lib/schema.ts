import { z } from "zod";

export const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  qna: z.array(
    z.object({
      question: z.string().default("qna"),
      answer: z.string(),
      options: z.array(z.string()),
    })
  ),
});
