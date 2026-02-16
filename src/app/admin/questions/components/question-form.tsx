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
import { SectionTemplateDto } from "@/lib/api/section-templates";
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
    sectionId: z.number().optional(),
});

export type QuestionFormValues = z.infer<typeof questionSchema>;

interface QuestionFormProps {
    mode?: 'create' | 'edit';
    question?: QuestionResponseDto;
    topics: Topic[];
    sections: SectionTemplateDto[];
    onSubmit: (data: CreateQuestionRequest) => Promise<void>;
    onCancel: () => void;
}

export function QuestionForm({ mode = 'create', question, topics, sections, onSubmit, onCancel }: QuestionFormProps) {
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
            sectionId: question.section?.id,
        } : {
            questionText: { displayType: 'TEXT', value: "" },
            type: "ANALOGY",
            topicIds: [],
            explanation: "",
            passageId: undefined,
            sectionId: undefined,
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
                sectionId: data.sectionId,
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
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">



                {/* Section 2: Configuration */}
                <div className="rounded-lg border bg-card p-4 space-y-4">
                    <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Configuration</p>
                    <div className="grid grid-cols-2 gap-4">
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
                            name="sectionId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Section</FormLabel>
                                    <Select
                                        value={field.value?.toString() ?? "none"}
                                        onValueChange={(value) => field.onChange(value === "none" ? undefined : parseInt(value))}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select section..." />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="none">No section</SelectItem>
                                            {sections.map((s) => (
                                                <SelectItem key={s.id} value={s.id.toString()}>
                                                    {s.title}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <div>
                        <FormLabel>Topics</FormLabel>
                        <div className="mt-2">
                            <TopicSelector
                                topics={topics}
                                selectedTopics={selectedTopics}
                                onChange={setSelectedTopics}
                                onTopicsChange={(topicIds) => {
                                    form.setValue('topicIds', topicIds, { shouldValidate: true });
                                }}
                            />
                        </div>
                        {form.formState.errors.topicIds && (
                            <p className="text-sm font-medium text-destructive mt-1">
                                {form.formState.errors.topicIds.message}
                            </p>
                        )}
                    </div>
                </div>

                {/* Section 1: Question Content */}
                <div className="rounded-lg border bg-card p-4 space-y-4">
                    <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Question Content</p>
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
                                        rows={3}
                                        placeholder="Enter question text..."
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="explanation"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Explanation <span className="text-muted-foreground font-normal">(optional)</span></FormLabel>
                                <FormControl>
                                    <Textarea {...field} rows={2} placeholder="Explain the correct answer..." />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {/* Section 3: Answer Options */}
                <div className="rounded-lg border bg-card p-4 space-y-4">
                    <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Answer Options</p>
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
                </div>

                <div className="flex justify-end gap-3 pt-1">
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
