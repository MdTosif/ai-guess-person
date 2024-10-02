import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { cn, slugify } from "@/lib/utils";
import { UseFormReturn } from "react-hook-form";
import { apiData } from "../_helper/data";
import { z } from "zod";
import { formSchema } from "@/lib/schema";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

type SchemaType = z.infer<typeof formSchema>;

export default function RadioFormOptions({
  form,
  index,
  next,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: UseFormReturn<SchemaType, any, undefined>;
  index: number;
  next: () => void;
}): React.ReactNode {
  console.log({ index });

  return (
    <>
      <h2>Answer the question</h2>
      <FormField
        control={form.control}
        name={`qna.${index}.answer`}
        render={({ field }) => (
          <FormItem className="space-y-3">
            <FormLabel>{apiData?.[index]?.q}</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={(...rest) => {
                  field.onChange(...rest);
                  next();
                }}
                defaultValue={field.value}
                className="flex flex-col space-y-1"
              >
                {apiData?.[index]?.a.map((e) => (
                  <FormItem
                    key={slugify(e)}
                    className="flex items-center space-x-3 space-y-0"
                  >
                    <FormLabel
                      className={cn(
                        "flex items-center gap-2 font-normal border border-primary p-2 rounded-xl w-full",
                        { "bg-accent": field.value === e }
                      )}
                    >
                      <FormControl>
                        <RadioGroupItem value={e} />
                      </FormControl>
                      <span>{e}</span>
                    </FormLabel>
                  </FormItem>
                ))}
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}
