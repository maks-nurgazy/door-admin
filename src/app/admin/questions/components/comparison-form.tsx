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
import { ComparisonContent } from "@/lib/api/questions";
import { ImageUpload } from "./image-upload";
import { useState } from "react";

const comparisonSchema = z.object({
    columnALatex: z.string().min(1, "Column A LaTeX is required"),
    columnBLatex: z.string().min(1, "Column B LaTeX is required"),
    correctAnswer: z.number().min(1, "Correct answer is required"),
    infoText: z.string().optional(),
    imageUrl: z.string().optional(),
    options: z.array(z.object({
        id: z.number(),
        text: z.string().min(1, "Option text is required"),
    })).min(2, "At least 2 options are required"),
});

export type ComparisonFormValues = z.infer<typeof comparisonSchema>;

interface ComparisonFormProps {
    content?: ComparisonContent;
    onChange: (content: ComparisonContent) => void;
}

export function ComparisonForm({ content, onChange }: ComparisonFormProps) {
    const [isUploading, setIsUploading] = useState(false);

    const form = useForm<ComparisonFormValues>({
        resolver: zodResolver(comparisonSchema),
        defaultValues: content ? {
            columnALatex: content.columnALatex,
            columnBLatex: content.columnBLatex,
            correctAnswer: content.correctAnswer,
            infoText: content.infoText || "",
            imageUrl: content.imageUrl || "",
            options: content.options,
        } : {
            columnALatex: "",
            columnBLatex: "",
            correctAnswer: 1,
            infoText: "",
            imageUrl: "",
            options: [
                { id: 1, text: "A" },
                { id: 2, text: "Б" },
                { id: 3, text: "В" },
                { id: 4, text: "Г" },
            ],
        },
    });

    const handleSubmit = (data: ComparisonFormValues) => {
        onChange(data);
    };

    return (
        <Form {...form}>
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="columnALatex"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Column A LaTeX</FormLabel>
                                <FormControl>
                                    <Textarea {...field} rows={3} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="columnBLatex"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Column B LaTeX</FormLabel>
                                <FormControl>
                                    <Textarea {...field} rows={3} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="infoText"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Info Text (Optional)</FormLabel>
                            <FormControl>
                                <Textarea {...field} rows={2} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="imageUrl"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Image (Optional)</FormLabel>
                            <FormControl>
                                <ImageUpload
                                    value={field.value}
                                    onChange={field.onChange}
                                    onUploading={setIsUploading}
                                />
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

                <Button type="button" onClick={form.handleSubmit(handleSubmit)} disabled={isUploading}>
                    Update Comparison
                </Button>
            </div>
        </Form>
    );
}
