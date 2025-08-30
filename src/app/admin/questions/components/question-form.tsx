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
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Question } from "@/lib/api/questions";
import { TopicShortDto } from "@/lib/api/topics";
import { TopicSelector } from "./topic-selector";
import { ImageUpload } from "./image-upload";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

const questionSchema = z.object({
    text: z.string().min(3, "Question text must be at least 3 characters"),
    type: z.enum(["TEXT", "IMAGE"]),
    options: z.array(z.object({
        key: z.number(),
        text: z.string().min(1, "Option text is required")
    })).min(2, "At least 2 options are required"),
    answerKey: z.number().min(1, "Correct answer is required"),
    imageUrl: z.string().optional(),
    topicIds: z.array(z.number()).min(1, "At least one topic is required")
});

export type QuestionFormValues = z.infer<typeof questionSchema>;

interface QuestionFormProps {
    mode?: 'create' | 'edit';
    question?: Question;
    topics: TopicShortDto[];
    onSubmit: (data: QuestionFormValues) => Promise<void>;
    onCancel: () => void;
}

export function QuestionForm({ mode = 'create', question, topics, onSubmit, onCancel }: QuestionFormProps) {
    const [selectedTopics, setSelectedTopics] = useState<number[]>(
        question ? question.topics.map(t => t.id) : []
    );
    const [isUploading, setIsUploading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<QuestionFormValues>({
        resolver: zodResolver(questionSchema),
        defaultValues: question ? {
            text: question.text,
            type: question.type,
            options: question.options,
            answerKey: question.answerKey,
            imageUrl: question.imageUrl || '',
            topicIds: question.topics.map(t => t.id),
        } : {
            text: "",
            type: "TEXT",
            options: [
                { key: 1, text: "" },
                { key: 2, text: "" },
                { key: 3, text: "" },
                { key: 4, text: "" }
            ],
            topicIds: [],
        },
    });

    const handleSubmit = async (data: QuestionFormValues) => {
        setIsSubmitting(true);
        try {
            await onSubmit(data);
            toast({
                title: "Success",
                description: mode === 'edit' ? "Question updated successfully!" : "Question created successfully!",
            });
        } catch (error) {
            console.error('Failed to submit question:', error);
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to save question. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="text"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Question Text</FormLabel>
                            <FormControl>
                                <Input {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Question Type</FormLabel>
                            <Select
                                value={field.value}
                                onValueChange={field.onChange}
                            >
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="TEXT">Text</SelectItem>
                                    <SelectItem value="IMAGE">Image</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <TopicSelector
                    topics={topics}
                    selectedTopics={selectedTopics}
                    onChange={setSelectedTopics}
                    onTopicsChange={(topicIds) => {
                        form.setValue('topicIds', topicIds, { shouldValidate: true });
                    }}
                />

                <div className="space-y-2">
                    <Label>Options</Label>
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
                    name="answerKey"
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
                                    {form.watch("options")
                                        .map((option, index) => ({
                                            key: index + 1,
                                            text: option.text
                                        }))
                                        .filter(option => option.text.trim() !== '')
                                        .map((option) => (
                                            <SelectItem key={option.key} value={option.key.toString()}>
                                                {`${String.fromCharCode(64 + option.key)}: ${option.text}`}
                                            </SelectItem>
                                        ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {form.watch("type") === "IMAGE" && (
                    <FormField
                        control={form.control}
                        name="imageUrl"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Question Image</FormLabel>
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
                )}

                <div className="flex justify-end gap-3">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onCancel}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isUploading || isSubmitting}>
                        {isSubmitting ? "Saving..." : (mode === 'edit' ? 'Save Changes' : 'Add Question')}
                    </Button>
                </div>
            </form>
        </Form>
    );
}