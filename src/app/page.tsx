"use client";
import React, { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  Form,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { apiData } from "./_helper/data";
import { formSchema } from "@/lib/schema";
import RadioFormOptions from "./_components/radio-form-options";
import { randomBetweenRange, slugify } from "@/lib/utils";
import { JSONResponseFromPrompt } from "@/lib/prompt";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, LabelList } from "recharts";

const schema = formSchema;

// Combined schema for final validation (all steps)
// const finalSchema = step1Schema.merge(step2Schema);
type SchemaType = z.infer<typeof schema>;

export default function MultiStepForm() {
  const [step, setStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [chartData, setChartData] = useState<
    {
      characteristic: string;
      percentage: number;
      fill: string;
    }[]
  >([]);
  const [apiRes, setApiRes] = useState<{
    message: string;
    data: JSONResponseFromPrompt;
  }>();

  const [chartConfig, setChartConfig] = useState<ChartConfig>({
    characteristic: {
      label: "Characteristic",
    },
    percentage: {
      label: "Percentage",
    },
  });

  // Initialize form for Step 1
  const form = useForm<SchemaType>({
    resolver: zodResolver(schema),
    mode: "onChange",
  });

  const { handleSubmit, control } = form;

  // Manage the fields array
  const { fields, append } = useFieldArray({
    control,
    name: "qna", // The name of the field array
  });

  useEffect(() => {
    console.log("appended");

    apiData.forEach(
      (e, idx) =>
        fields?.[idx] ??
        append({
          question: e.q,
          answer: "",
          options: e.a,
        })
    );
  });

  // On form submission, advance to the next step or submit
  const onSubmit = async (data: SchemaType) => {
    setIsLoading(true);
    if (step < apiData.length) {
      setStep(step + 1); // Move to Step 2
    } else {
      console.log("Final Form Data:", data);
      try {
        // Submit final form data
        const res = await fetch(
          `${window.location.protocol}//${window.location.host}/generate`,
          {
            method: "POST",
            body: JSON.stringify(data),
          }
        );
        const body = await res.json();
        setApiRes(body);
      } catch (error) {
        console.error(error);
      }
    }
    setIsLoading(false);
  };

  useEffect(() => {
    const chartConfigRaw = chartConfig;
    const chartDataRaw =
      apiRes?.data.statistics?.map((e) => ({
        characteristic: e.key,
        percentage: e.value,
        fill: `var(--color-${e.key})`,
      })) ?? [];

    chartDataRaw?.forEach((e) => {
      chartConfigRaw[e.characteristic] = {
        label: e.characteristic,
        color: `hsl(var(--chart-${randomBetweenRange()}))`,
      };
    });

    setChartData(chartDataRaw);
    setChartConfig(chartConfigRaw);
  }, [apiRes]);

  return (
    <Card className="m-auto md:w-1/2 lg:w-1/2">
      {apiRes ? (
        <>
          <CardHeader>
            <CardTitle>
              <span className="text-primary text-xl capitalize ">
                {`${form.watch("name").toString()}`}
              </span>
              &apos;s Anime Character Personality Match
            </CardTitle>
            <CardDescription>Powered by AI</CardDescription>
          </CardHeader>
          <CardContent className="">
            <h2>{apiRes.data.title}</h2>
            <ChartContainer
              config={chartConfig}
              className="my-4 border border-primary rounded-lg bg-secondary max-w-96"
            >
              <BarChart accessibilityLayer data={chartData} layout="vertical">
                <YAxis
                  dataKey="characteristic"
                  type="category"
                  tickLine={false}
                  tickMargin={0}
                  axisLine={false}
                  hide
                />
                <XAxis dataKey="percentage" type="number" hide />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent />}
                />
                <Bar
                  dataKey="percentage"
                  layout="vertical"
                  radius={5}
                  height={5}
                >
                  <LabelList
                    dataKey="characteristic"
                    position="insideLeft"
                    offset={8}
                    className="fill-[--color-label]"
                    fontSize={12}
                  />
                  <LabelList
                    dataKey="percentage"
                    position="insideRight"
                    offset={8}
                    className="fill-foreground"
                    fontSize={12}
                    formatter={(e: string) => {
                      return `${e}/100`;
                    }}
                  />
                </Bar>
              </BarChart>
            </ChartContainer>
            <ReactMarkdown>{apiRes.data.reasoning}</ReactMarkdown>
          </CardContent>
          <CardFooter></CardFooter>
        </>
      ) : (
        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="w-full">
            <CardHeader>
              <CardTitle>Anime Character Personality Match</CardTitle>
              <CardDescription>Powered by AI</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Step 1 */}
              {step === 0 && (
                <>
                  <h2>Your personal information</h2>
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your name" {...field} />
                        </FormControl>
                        <FormDescription>
                          This is your public display name.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}

              {fields.map((field, index) => (
                <div key={field.id}>
                  {step === index + 1 && (
                    <RadioFormOptions
                      form={form}
                      index={index}
                      key={slugify(field.id)}
                      next={() => {
                        if (step < apiData.length) setStep(step + 1); // Move to Step 2
                      }}
                    />
                  )}
                </div>
              ))}
              {/* Step 2 */}
            </CardContent>
            <CardFooter>
              <div className="grid grid-cols-12 gap-3">
                {step !== 0 && (
                  <Button
                    className="col-span-12 md:col-span-6"
                    type="button"
                    onClick={() => setStep(step - 1)}
                  >
                    Back
                  </Button>
                )}
                <Button
                  isLoading={isLoading}
                  className="col-span-12 md:col-span-6"
                  type="submit"
                >
                  {step > apiData.length - 1 ? "Submit" : "Next"}
                </Button>
                <p className="col-span-12 w-full">
                  {step + 1}/{apiData.length + 1}
                </p>
              </div>
            </CardFooter>
          </form>
        </Form>
      )}
    </Card>
  );
}
