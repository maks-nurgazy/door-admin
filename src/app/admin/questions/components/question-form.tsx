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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    QuestionResponseDto,
    CreateQuestionRequest,
    QuestionContent,
    QuestionType,
} from "@/lib/api/questions";
import { Topic } from "@/lib/api/topics";
import { TopicSelector } from "./topic-selector";
import { AnalogyForm } from "./analogy-form";
import { ComparisonForm } from "./comparison-form";
import { MathForm } from "./math-form";
import { SentenceForm } from "./sentence-form";
import { ReadingComprehensionForm, ReadingComprehensionFormData } from "./reading-comprehension-form";
import { TextContentInput } from "./text-content-input";
import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { getQuestionTypes } from "@/lib/question-types";
import { readingPassagesApi, ReadingPassageListItem } from "@/lib/api/reading-passages";

const DISPLAY_TYPES = ['TEXT', 'LATEX', 'SVG', 'IMAGE', 'NONE'] as const;

const questionSchema = z.object({
    questionText: z.object({
        displayType: z.enum(DISPLAY_TYPES),
        value: z.string().min(1, "Question text value is required"),
    }),
    type: z.enum(["ANALOGY", "ALGEBRAIC_EXPRESSION", "MATH_COMPARISON", "SENTENCE_COMPLETION", "READING_COMPREHENSION"]),
    topicIds: z.array(z.number()).min(1, "At least one topic is required"),
    explanation: z.string().optional(),
    passageId: z.number().optional(),
});

export type QuestionFormValues = z.infer<typeof questionSchema>;

interface QuestionFormProps {
    mode?: 'create' | 'edit';
    question?: QuestionResponseDto;
    topics: Topic[];
    onSubmit: (data: CreateQuestionRequest) => Promise<void>;
    onCancel: () => void;
}

export function QuestionForm({ mode = 'create', question, topics, onSubmit, onCancel }: QuestionFormProps) {
    const getTopicIds = (q?: QuestionResponseDto): number[] => {
        if (!q?.topics) return [];
        return q.topics.map(t => t.id);
    };

    const [selectedTopics, setSelectedTopics] = useState<number[]>(getTopicIds(question));
    const [isSubmitting, setIsSubmitting] = useState(false);
    // Content built by the sub-form (options, correctOptionId, type-specific fields)
    const [subFormContent, setSubFormContent] = useState<any>(
        question?.content ? {
            options: question.content.options,
            correctOptionId: question.content.correctOptionId,
            comparisonTable: (question.content as any).comparisonTable,
            readingPassageId: question.passage?.id,
        } : null
    );
    const [passages, setPassages] = useState<ReadingPassageListItem[]>([]);
    const [loadingPassages, setLoadingPassages] = useState(false);

    useEffect(() => {
        setLoadingPassages(true);
        readingPassagesApi.getAllPassagesForDropdown()
            .then(setPassages)
            .catch((error) => {
                console.error('Failed to load reading passages:', error);
            })
            .finally(() => setLoadingPassages(false));
    }, []);

    const form = useForm<QuestionFormValues>({
        resolver: zodResolver(questionSchema),
        defaultValues: question ? {
            questionText: {
                displayType: question.content?.questionText?.displayType ?? 'TEXT',
                value: question.content?.questionText?.value ?? "",
            },
            type: question.type,
            topicIds: getTopicIds(question),
            explanation: question.explanation ?? "",
            passageId: question.passage?.id,
        } : {
            questionText: { displayType: 'TEXT', value: "" },
            type: "ANALOGY",
            topicIds: [],
            explanation: "",
            passageId: undefined,
        },
    });

    const handleSubmit = async (data: QuestionFormValues) => {
        setIsSubmitting(true);
        try {
            if (!subFormContent) {
                toast({ title: "Validation Error", description: "Please fill in the question content fields", variant: "destructive" });
                throw new Error("Content is required");
            }

            // Build the backend-compatible content object with the Jackson discriminator
            const content: QuestionContent = {
                questionType: data.type as QuestionType,
                questionText: data.questionText,
                options: subFormContent.options ?? [],
                correctOptionId: subFormContent.correctOptionId,
                ...(data.type === 'MATH_COMPARISON' && subFormContent.comparisonTable
                    ? { comparisonTable: subFormContent.comparisonTable }
                    : {}),
            };

            const request: CreateQuestionRequest = {
                type: data.type as QuestionType,
                content,
                explanation: data.explanation || undefined,
                passageId: data.passageId,
                topicIds: data.topicIds,
            };

            await onSubmit(request);

            toast({
                title: "Success",
                description: mode === 'edit' ? "Question updated successfully!" : "Question created successfully!",
            });
        } catch (error) {
            if (error instanceof Error && !error.message.includes('Content is required')) {
                toast({
                    title: "Error",
                    description: error.message || "Failed to save question. Please try again.",
                    variant: "destructive",
                });
            }
            throw error;
        } finally {
            setIsSubmitting(false);
        }
    };

    const questionType = form.watch("type");

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
                                <TextContentInput
                                    value={field.value}
                                    onChange={field.onChange}
                                    rows={2}
                                    placeholder="Enter question text..."
                                />
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
                                onValueChange={(value) => {
                                    field.onChange(value);
                                    setSubFormContent(null);
                                }}
                            >
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {getQuestionTypes().map((config) => (
                                        <SelectItem key={config.type} value={config.type}>
                                            {config.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="explanation"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Explanation (Optional)</FormLabel>
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

                {/* Sub-forms for each question type */}
                {questionType === "ANALOGY" && (
                    <AnalogyForm content={subFormContent} onChange={setSubFormContent} />
                )}
                {questionType === "ALGEBRAIC_EXPRESSION" && (
                    <MathForm content={subFormContent} onChange={setSubFormContent} />
                )}
                {questionType === "MATH_COMPARISON" && (
                    <ComparisonForm content={subFormContent} onChange={setSubFormContent} />
                )}
                {questionType === "SENTENCE_COMPLETION" && (
                    <SentenceForm content={subFormContent} onChange={setSubFormContent} />
                )}
                {questionType === "READING_COMPREHENSION" && (
                    <ReadingComprehensionForm
                        content={subFormContent as ReadingComprehensionFormData}
                        passages={passages}
                        onChange={(newContent) => {
                            if (newContent?.readingPassageId) {
                                form.setValue('passageId', newContent.readingPassageId, { shouldValidate: true });
                            }
                            setSubFormContent(newContent);
                        }}
                    />
                )}

                <div className="flex justify-end gap-3">
                    <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
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
