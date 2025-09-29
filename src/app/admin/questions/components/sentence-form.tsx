"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { SentenceCompletionContent } from "@/lib/api/questions";

const sentenceSchema = z.object({
    sentence: z.string().min(1, "Sentence is required"),
    correctAnswer: z.number().min(1, "Correct answer is required"),
    options: z.array(z.object({
        id: z.number(),
        text: z.string().min(1, "Option text is required"),
    })).min(2, "At least 2 options are required"),
});

export type SentenceFormValues = z.infer<typeof sentenceSchema>;

interface SentenceFormProps {
    content?: SentenceCompletionContent;
    onChange: (content: SentenceCompletionContent) => void;
}

export function SentenceForm({ content, onChange }: SentenceFormProps) {
    const form = useForm<SentenceFormValues>({
        resolver: zodResolver(sentenceSchema),
        defaultValues: content ? {
            sentence: content.sentence,
            correctAnswer: content.correctAnswer,
            options: content.options,
        } : {
            sentence: "",
            correctAnswer: 1,
            options: [
                { id: 1, text: "" },
                { id: 2, text: "" },
                { id: 3, text: "" },
                { id: 4, text: "" },
            ],
        },
    });

    const handleSubmit = (data: SentenceFormValues) => {
        onChange(data);
    };

    return (
        <Form {...form}>
            <div className="space-y-4">
                <FormField
                    control={form.control}
                    name="sentence"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Sentence (use ___ for blank)</FormLabel>
                            <FormControl>
                                <Textarea {...field} rows={4} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="space-y-2">
                    <FormLabel>Options</FormLabel>
                    <div className="grid grid-cols-2 gap-4">
                        {form.watch("options").map((_, index) => (
                            <FormField
                                key={index}
                                control={form.control}
                                name={`options.${index}.text`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <div className="flex gap-2">
                                                <span className="py-2 w-6">
                                                    {String.fromCharCode(65 + index)}
                                                </span>
                                                <Input {...field} />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        ))}
                    </div>
                </div>

                <FormField
                    control={form.control}
                    name="correctAnswer"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Correct Answer</FormLabel>
                            <Select
                                value={field.value?.toString()}
                                onValueChange={(value) => field.onChange(parseInt(value))}
                            >
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {form.watch("options").map((option) => (
                                        <SelectItem key={option.id} value={option.id.toString()}>
                                            Option {option.id}: {option.text}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button type="button" onClick={form.handleSubmit(handleSubmit)}>Update Sentence Completion</Button>
            </div>
        </Form>
    );
}
