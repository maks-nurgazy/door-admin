"use client";

import React from "react";
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

// Content interface for Reading Comprehension
export interface ReadingComprehensionContent {
    questionText: string;
    correctAnswer: number;
    options: { id: number; text: string }[];
}

const readingComprehensionSchema = z.object({
    questionText: z.string().min(1, "Question text is required"),
    correctAnswer: z.number().min(1, "Correct answer is required"),
    options: z.array(z.object({
        id: z.number(),
        text: z.string().min(1, "Option text is required"),
    })).min(2, "At least 2 options are required"),
});

export type ReadingComprehensionFormValues = z.infer<typeof readingComprehensionSchema>;

interface ReadingComprehensionFormProps {
    content?: ReadingComprehensionContent;
    onChange: (content: ReadingComprehensionContent) => void;
}

export function ReadingComprehensionForm({ content, onChange }: ReadingComprehensionFormProps) {
    const form = useForm<ReadingComprehensionFormValues>({
        resolver: zodResolver(readingComprehensionSchema),
        defaultValues: content ? {
            questionText: content.questionText,
            correctAnswer: content.correctAnswer,
            options: content.options,
        } : {
            questionText: "",
            correctAnswer: 1,
            options: [
                { id: 1, text: "" },
                { id: 2, text: "" },
                { id: 3, text: "" },
                { id: 4, text: "" },
            ],
        },
    });

    // Auto-update parent whenever form values change
    const watchedValues = form.watch();
    const prevValuesRef = React.useRef<string>('');

    React.useEffect(() => {
        const currentValues = JSON.stringify(watchedValues);
        if (currentValues !== prevValuesRef.current) {
            prevValuesRef.current = currentValues;
            onChange(watchedValues);
        }
    }, [watchedValues, onChange]);

    return (
        <Form {...form}>
            <div className="space-y-4">
                <FormField
                    control={form.control}
                    name="questionText"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Question Text</FormLabel>
                            <FormControl>
                                <Textarea {...field} rows={4} placeholder="Enter the comprehension question..." />
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
                                                <Input {...field} placeholder="Option text" />
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
                                            Option {option.id}: {option.text || '(empty)'}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
        </Form>
    );
}
