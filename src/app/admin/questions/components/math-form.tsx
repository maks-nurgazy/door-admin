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
import { MathCalculationContent } from "@/lib/api/questions";

const mathSchema = z.object({
    descriptionLatex: z.string().min(1, "Description LaTeX is required"),
    correctAnswer: z.number().min(1, "Correct answer is required"),
    options: z.array(z.object({
        id: z.number(),
        textLatex: z.string().min(1, "Option LaTeX is required"),
    })).min(2, "At least 2 options are required"),
});

export type MathFormValues = z.infer<typeof mathSchema>;

interface MathFormProps {
    content?: MathCalculationContent;
    onChange: (content: MathCalculationContent) => void;
}

export function MathForm({ content, onChange }: MathFormProps) {
    const form = useForm<MathFormValues>({
        resolver: zodResolver(mathSchema),
        defaultValues: content ? {
            descriptionLatex: content.descriptionLatex,
            correctAnswer: content.correctAnswer,
            options: content.options,
        } : {
            descriptionLatex: "",
            correctAnswer: 1,
            options: [
                { id: 1, textLatex: "" },
                { id: 2, textLatex: "" },
                { id: 3, textLatex: "" },
                { id: 4, textLatex: "" },
                { id: 5, textLatex: "" },
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
                    name="descriptionLatex"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Description LaTeX</FormLabel>
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
                                name={`options.${index}.textLatex`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <div className="flex gap-2">
                                                <span className="py-2 w-6">
                                                    {String.fromCharCode(65 + index)}
                                                </span>
                                                <Input {...field} placeholder="LaTeX expression" />
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
                                            Option {option.id}: {option.textLatex || '(empty)'}
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
