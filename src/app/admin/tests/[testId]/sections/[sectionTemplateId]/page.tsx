"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, Plus, Trash2, Clock, BookOpen, FileQuestion } from "lucide-react";
import { testsApi, Test, TestSection, TestSectionQuestion } from "@/lib/api/tests";
import { questionsApi, Question } from "@/lib/api/questions";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";

interface PageProps {
    params: Promise<{
        testId: string;
        sectionTemplateId: string;
    }>;
}

export default function TestSectionQuestionsPage({ params }: PageProps) {
    const resolvedParams = use(params);
    const testId = parseInt(resolvedParams.testId);
    const sectionTemplateId = parseInt(resolvedParams.sectionTemplateId);

    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [test, setTest] = useState<Test | null>(null);
    const [section, setSection] = useState<TestSection | null>(null);
    const [questions, setQuestions] = useState<TestSectionQuestion[]>([]);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [availableQuestions, setAvailableQuestions] = useState<Question[]>([]);
    const [selectedQuestionIds, setSelectedQuestionIds] = useState<number[]>([]);
    const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);

    useEffect(() => {
        loadData();
    }, [testId, sectionTemplateId]);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const [testData, sectionsData, questionsData] = await Promise.all([
                testsApi.getTest(testId),
                testsApi.getTestSections(testId),
                testsApi.getTestSectionQuestions(testId, sectionTemplateId)
            ]);

            setTest(testData);
            const currentSection = sectionsData.find(s => s.sectionTemplateId === sectionTemplateId);
            setSection(currentSection || null);
            setQuestions(questionsData);
        } catch (error) {
            console.error('Failed to load data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenAddDialog = async () => {
        setIsLoadingQuestions(true);
        setIsAddDialogOpen(true);
        try {
            const response = await questionsApi.getQuestions({ size: 100 });
            // Filter out questions already in this section
            const existingIds = questions.map(q => q.id);
            const available = response.data.filter(q => !existingIds.includes(q.id));
            setAvailableQuestions(available);
        } catch (error) {
            console.error('Failed to load available questions:', error);
        } finally {
            setIsLoadingQuestions(false);
        }
    };

    const toggleQuestionSelection = (questionId: number) => {
        setSelectedQuestionIds(prev =>
            prev.includes(questionId)
                ? prev.filter(id => id !== questionId)
                : [...prev, questionId]
        );
    };

    const handleAddQuestions = async () => {
        if (selectedQuestionIds.length === 0) return;

        try {
            await testsApi.updateTestSectionQuestions(testId, sectionTemplateId, selectedQuestionIds, 'assign');
            setIsAddDialogOpen(false);
            setSelectedQuestionIds([]);
            loadData();
        } catch (error) {
            console.error('Failed to add questions:', error);
        }
    };

    const handleRemoveQuestion = async (questionId: number) => {
        if (!confirm("Are you sure you want to remove this question from this section?")) return;

        try {
            await testsApi.updateTestSectionQuestions(testId, sectionTemplateId, [questionId], 'remove');
            loadData();
        } catch (error) {
            console.error('Failed to remove question:', error);
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-8 w-[200px]" />
                <Skeleton className="h-[400px] w-full" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.push('/admin/tests')}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold">{section?.title || 'Section'}</h1>
                    <p className="text-muted-foreground">
                        {test?.title} - Manage questions for this section
                    </p>
                </div>
            </div>

            {/* Section Info Card */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <BookOpen className="h-5 w-5" />
                                {section?.title}
                            </CardTitle>
                            <CardDescription>{section?.description || 'No description'}</CardDescription>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Clock className="h-4 w-4" />
                                <span>{section?.durationMinutes} minutes</span>
                            </div>
                            <Badge variant="outline">
                                <FileQuestion className="h-3 w-3 mr-1" />
                                {questions.length} questions
                            </Badge>
                        </div>
                    </div>
                </CardHeader>
            </Card>

            {/* Questions Table */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Questions</CardTitle>
                        <Button onClick={handleOpenAddDialog}>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Questions
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {questions.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <FileQuestion className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>No questions added to this section yet.</p>
                            <p className="text-sm">Click "Add Questions" to assign questions to this section.</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[50px]">#</TableHead>
                                    <TableHead>Question</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Topics</TableHead>
                                    <TableHead className="w-[100px]">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {questions.map((question, index) => (
                                    <TableRow key={question.id}>
                                        <TableCell className="font-medium">{index + 1}</TableCell>
                                        <TableCell className="max-w-[400px]">
                                            <p className="truncate">{question.questionText || 'Question text not available'}</p>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{question.type}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex gap-1 flex-wrap">
                                                {question.topics?.slice(0, 2).map(topic => (
                                                    <Badge key={topic.id} variant="secondary" className="text-xs">
                                                        {topic.title}
                                                    </Badge>
                                                ))}
                                                {question.topics?.length > 2 && (
                                                    <Badge variant="secondary" className="text-xs">
                                                        +{question.topics.length - 2}
                                                    </Badge>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleRemoveQuestion(question.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* Add Questions Dialog */}
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogContent className="max-w-3xl max-h-[80vh]">
                    <DialogHeader>
                        <DialogTitle>Add Questions to Section</DialogTitle>
                        <DialogDescription>
                            Select questions to add to "{section?.title}"
                        </DialogDescription>
                    </DialogHeader>
                    <ScrollArea className="h-[400px] rounded-md border p-4">
                        {isLoadingQuestions ? (
                            <div className="space-y-3">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <Skeleton key={i} className="h-16 w-full" />
                                ))}
                            </div>
                        ) : availableQuestions.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                No available questions to add. All questions are already assigned to this section.
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {availableQuestions.map((question) => (
                                    <div
                                        key={question.id}
                                        className={cn(
                                            "flex items-start gap-3 p-3 rounded-lg border cursor-pointer hover:bg-accent",
                                            selectedQuestionIds.includes(question.id) && "bg-accent border-primary"
                                        )}
                                        onClick={() => toggleQuestionSelection(question.id)}
                                    >
                                        <Checkbox
                                            checked={selectedQuestionIds.includes(question.id)}
                                            onCheckedChange={() => toggleQuestionSelection(question.id)}
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium truncate">{question.questionText || 'No question text'}</p>
                                            <div className="flex gap-2 mt-1">
                                                <Badge variant="outline" className="text-xs">{question.type}</Badge>
                                                {question.topics?.slice(0, 2).map(topic => (
                                                    <Badge key={topic.id} variant="secondary" className="text-xs">
                                                        {topic.title}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </ScrollArea>
                    <div className="flex justify-between items-center pt-4 border-t">
                        <p className="text-sm text-muted-foreground">
                            {selectedQuestionIds.length} questions selected
                        </p>
                        <div className="flex gap-3">
                            <Button variant="outline" onClick={() => {
                                setIsAddDialogOpen(false);
                                setSelectedQuestionIds([]);
                            }}>
                                Cancel
                            </Button>
                            <Button onClick={handleAddQuestions} disabled={selectedQuestionIds.length === 0}>
                                Add Selected Questions
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
