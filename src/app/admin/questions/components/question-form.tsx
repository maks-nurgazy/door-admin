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
import { Label } from "@/components/ui/label";
import { Question, AnalogyContent, ComparisonContent, MathCalculationContent, SentenceCompletionContent } from "@/lib/api/questions";
import { TopicShortDto } from "@/lib/api/topics";
import { TopicSelector } from "./topic-selector";
import { AnalogyForm } from "./analogy-form";
import { ComparisonForm } from "./comparison-form";
import { MathForm } from "./math-form";
import { SentenceForm } from "./sentence-form";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

const questionSchema = z.object({
    questionText: z.string().min(3, "Question text must be at least 3 characters"),
    type: z.enum(["ANALOGY", "COMPARISON", "MATH_CALCULATION", "SENTENCE_COMPLETION"]),
    topicIds: z.array(z.number()).min(1, "At least one topic is required"),
    points: z.number().min(1, "Points must be at least 1"),
    timeLimitSeconds: z.number().min(1, "Time limit must be at least 1 second"),
    explanation: z.string(),
    content: z.any(), // Will be validated by specific form components
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
        question ? question.topicIds : []
    );
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [content, setContent] = useState<any>(question?.content);

    const form = useForm<QuestionFormValues>({
        resolver: zodResolver(questionSchema),
        defaultValues: question ? {
            questionText: question.questionText,
            type: question.type,
            topicIds: question.topicIds,
            points: question.points,
            timeLimitSeconds: question.timeLimitSeconds,
            explanation: question.explanation,
            content: question.content,
        } : {
            questionText: "",
            type: "ANALOGY",
            topicIds: [],
            points: 1,
            timeLimitSeconds: 30,
            explanation: "",
            content: null,
        },
    });

    const handleSubmit = async (data: QuestionFormValues) => {
        setIsSubmitting(true);
        try {
            const submitData = {
                ...data,
                content: content
            };
            await onSubmit(submitData);
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

    const handleContentChange = (newContent: any) => {
        setContent(newContent);
        form.setValue('content', newContent, { shouldValidate: true });
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="questionText"
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
                                    <SelectItem value="ANALOGY">Analogy</SelectItem>
                                    <SelectItem value="COMPARISON">Comparison</SelectItem>
                                    <SelectItem value="MATH_CALCULATION">Math Calculation</SelectItem>
                                    <SelectItem value="SENTENCE_COMPLETION">Sentence Completion</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="points"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Points</FormLabel>
                                <FormControl>
                                    <Input type="number" min="1" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="timeLimitSeconds"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Time Limit (seconds)</FormLabel>
                                <FormControl>
                                    <Input type="number" min="1" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="explanation"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Explanation</FormLabel>
                            <FormControl>
                                <Textarea {...field} rows={3} />
                            </FormControl>
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

                {/* Conditional rendering based on question type */}
                {form.watch("type") === "ANALOGY" && (
                    <AnalogyForm
                        content={content as AnalogyContent}
                        onChange={handleContentChange}
                    />
                )}

                {form.watch("type") === "COMPARISON" && (
                    <ComparisonForm
                        content={content as ComparisonContent}
                        onChange={handleContentChange}
                    />
                )}

                {form.watch("type") === "MATH_CALCULATION" && (
                    <MathForm
                        content={content as MathCalculationContent}
                        onChange={handleContentChange}
                    />
                )}

                {form.watch("type") === "SENTENCE_COMPLETION" && (
                    <SentenceForm
                        content={content as SentenceCompletionContent}
                        onChange={handleContentChange}
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
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Saving..." : (mode === 'edit' ? 'Save Changes' : 'Add Question')}
                    </Button>
                </div>
            </form>
        </Form>
    );
}