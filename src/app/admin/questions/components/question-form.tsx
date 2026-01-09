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
import { Question, AnalogyContent, ComparisonContent, MathCalculationContent, SentenceCompletionContent } from "@/lib/api/questions";
import { TopicShortDto } from "@/lib/api/topics";
import { Test } from "@/lib/api/tests";
import { SectionTemplate } from "@/lib/api/section-templates";
import { TopicSelector } from "./topic-selector";
import { AnalogyForm } from "./analogy-form";
import { ComparisonForm } from "./comparison-form";
import { MathForm } from "./math-form";
import { SentenceForm } from "./sentence-form";
import { ReadingComprehensionForm, ReadingComprehensionContent } from "./reading-comprehension-form";
import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { getQuestionTypes } from "@/lib/question-types";
import { testsApi, TestSection } from "@/lib/api/tests";

const questionSchema = z.object({
    questionText: z.string().min(3, "Question text must be at least 3 characters"),
    type: z.enum(["ANALOGY", "COMPARISON", "MATH_CALCULATION", "SENTENCE_COMPLETION", "READING_COMPREHENSION"]),
    topicIds: z.array(z.number()).min(1, "At least one topic is required"),
    points: z.coerce.number().min(1, "Points must be at least 1"),
    timeLimitSeconds: z.coerce.number().min(1, "Time limit must be at least 1 second"),
    explanation: z.string(),
    content: z.any(), // Will be validated by specific form components
    testId: z.number().optional(),
    sectionTemplateId: z.number().optional(),
});

export type QuestionFormValues = z.infer<typeof questionSchema>;

interface QuestionFormProps {
    mode?: 'create' | 'edit';
    question?: Question;
    topics: TopicShortDto[];
    tests?: Test[];
    onSubmit: (data: QuestionFormValues) => Promise<void>;
    onCancel: () => void;
}

export function QuestionForm({ mode = 'create', question, topics, tests = [], onSubmit, onCancel }: QuestionFormProps) {
    // Extract topic IDs from either topicIds array or topics array
    const getTopicIds = (q?: Question): number[] => {
        if (!q) return [];
        if (q.topicIds && q.topicIds.length > 0) return q.topicIds;
        if (q.topics && q.topics.length > 0) return q.topics.map(t => t.id);
        return [];
    };

    const [selectedTopics, setSelectedTopics] = useState<number[]>(getTopicIds(question));
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [content, setContent] = useState<any>(question?.content);
    const [selectedTestId, setSelectedTestId] = useState<number | undefined>(undefined);
    const [sections, setSections] = useState<TestSection[]>([]);
    const [selectedSectionId, setSelectedSectionId] = useState<number | undefined>(undefined);
    const [loadingSections, setLoadingSections] = useState(false);

    // Load sections when test is selected
    useEffect(() => {
        if (selectedTestId) {
            setLoadingSections(true);
            testsApi.getTestSections(selectedTestId)
                .then(setSections)
                .catch(console.error)
                .finally(() => setLoadingSections(false));
        } else {
            setSections([]);
            setSelectedSectionId(undefined);
        }
    }, [selectedTestId]);

    const form = useForm<QuestionFormValues>({
        resolver: zodResolver(questionSchema),
        defaultValues: question ? {
            questionText: question.questionText,
            type: question.type,
            topicIds: getTopicIds(question),
            points: question.points,
            timeLimitSeconds: question.timeLimitSeconds,
            explanation: question.explanation || "",
            content: question.content,
            testId: undefined,
            sectionTemplateId: undefined,
        } : {
            questionText: "",
            type: "ANALOGY",
            topicIds: [],
            points: 1,
            timeLimitSeconds: 30,
            explanation: "",
            content: null,
            testId: undefined,
            sectionTemplateId: undefined,
        },
    });

    const handleSubmit = async (data: QuestionFormValues) => {
        setIsSubmitting(true);
        try {
            console.log('=== Question Form Submission Debug ===');
            console.log('Form data:', data);
            console.log('Content state:', content);

            // Validate that content exists
            if (!content) {
                const errorMsg = "Please fill in the question content fields";
                console.error('Validation error:', errorMsg);
                toast({
                    title: "Validation Error",
                    description: errorMsg,
                    variant: "destructive",
                });
                throw new Error(errorMsg);
            }

            if (!content.correctAnswer) {
                const errorMsg = "Please select a correct answer";
                console.error('Validation error:', errorMsg);
                toast({
                    title: "Validation Error",
                    description: errorMsg,
                    variant: "destructive",
                });
                throw new Error(errorMsg);
            }

            // Prepare data matching backend DTO structure
            const submitData = {
                ...data,
                content: JSON.stringify(content), // Convert entire content to JSON string (includes correctAnswer)
                correctAnswer: content.correctAnswer, // Also send as separate top-level field
                testId: selectedTestId,
                sectionTemplateId: selectedSectionId,
            };

            console.log('Prepared submit data:', submitData);
            console.log('Content JSON string:', submitData.content);

            await onSubmit(submitData);

            toast({
                title: "Success",
                description: mode === 'edit' ? "Question updated successfully!" : "Question created successfully!",
            });
        } catch (error) {
            console.error('=== Question Form Submission Error ===');
            console.error('Error details:', error);

            // Only show toast if we haven't already shown a validation toast
            if (error instanceof Error && !error.message.includes('Please fill in') && !error.message.includes('Please select')) {
                toast({
                    title: "Error",
                    description: error instanceof Error ? error.message : "Failed to save question. Please try again.",
                    variant: "destructive",
                });
            }

            // Re-throw to prevent form from thinking submission succeeded
            throw error;
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
                                onValueChange={(value) => {
                                    field.onChange(value);
                                    // Reset content when type changes
                                    setContent(null);
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

                {/* Test and Section Assignment (Optional) */}
                {mode === 'create' && tests.length > 0 && (
                    <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
                        <h4 className="font-medium text-sm">Assign to Test & Section (Optional)</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <FormLabel>Test</FormLabel>
                                <Select
                                    value={selectedTestId?.toString() || ""}
                                    onValueChange={(value) => {
                                        setSelectedTestId(value ? parseInt(value) : undefined);
                                        setSelectedSectionId(undefined);
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a test (optional)" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {tests.map((test) => (
                                            <SelectItem key={test.id} value={test.id.toString()}>
                                                {test.title}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <FormLabel>Section</FormLabel>
                                <Select
                                    value={selectedSectionId?.toString() || ""}
                                    onValueChange={(value) => setSelectedSectionId(value ? parseInt(value) : undefined)}
                                    disabled={!selectedTestId || loadingSections}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder={loadingSections ? "Loading..." : "Select a section"} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {sections.map((section) => (
                                            <SelectItem key={section.sectionTemplateId} value={section.sectionTemplateId.toString()}>
                                                {section.title} ({section.questionCount} questions)
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            If you select both a test and section, the question will be automatically assigned to that section.
                        </p>
                    </div>
                )}

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

                {form.watch("type") === "READING_COMPREHENSION" && (
                    <ReadingComprehensionForm
                        content={content as ReadingComprehensionContent}
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