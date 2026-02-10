"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, Pencil, Trash2, Calendar } from "lucide-react";
import {
    QuestionListDto,
    QuestionResponseDto,
    QuestionsResponse,
    questionsApi,
} from "@/lib/api/questions";
import { Topic } from "@/lib/api/topics";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { QuestionsHeader } from "./questions-header";
import { formatDateBeautiful } from "@/lib/utils";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Label } from "@/components/ui/label";

interface QuestionsTableProps {
    initialData: QuestionsResponse;
    topics: Topic[];
}

export function QuestionsTable({ initialData, topics }: QuestionsTableProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [questionsData, setQuestionsData] = useState(initialData);
    const [isLoading, setIsLoading] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedQuestion, setSelectedQuestion] = useState<QuestionListDto | null>(null);
    const [questionDetail, setQuestionDetail] = useState<QuestionResponseDto | null>(null);
    const [isLoadingDetail, setIsLoadingDetail] = useState(false);

    const currentPage = searchParams.get("page")
        ? parseInt(searchParams.get("page")!) - 1
        : 0;

    const refreshData = async () => {
        setIsLoading(true);
        try {
            const filters = {
                search: searchParams.get("search") || undefined,
                page: currentPage,
                topicId: searchParams.get("topic") && searchParams.get("topic") !== "all"
                    ? parseInt(searchParams.get("topic")!)
                    : undefined,
            };
            const updatedData = await questionsApi.getQuestions(filters);
            setQuestionsData(updatedData);
        } catch (error) {
            console.error('Failed to refresh questions:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handlePageChange = (newPage: number) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("page", (newPage + 1).toString());
        router.push(`${pathname}?${params.toString()}`);
    };

    const handleView = async (question: QuestionListDto) => {
        setSelectedQuestion(question);
        setIsViewDialogOpen(true);
        setIsLoadingDetail(true);
        setQuestionDetail(null);
        try {
            const detail = await questionsApi.getQuestionById(question.id);
            setQuestionDetail(detail);
        } catch (error) {
            console.error('Failed to fetch question details:', error);
        } finally {
            setIsLoadingDetail(false);
        }
    };

    const handleEdit = (question: QuestionListDto) => {
        setSelectedQuestion(question);
        setIsEditDialogOpen(true);
    };

    const handleDelete = (question: QuestionListDto) => {
        setSelectedQuestion(question);
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!selectedQuestion) return;
        try {
            await questionsApi.deleteQuestion(selectedQuestion.id);
            setIsDeleteDialogOpen(false);
            setSelectedQuestion(null);
            await refreshData();
        } catch (error) {
            console.error('Failed to delete question:', error);
        }
    };

    useEffect(() => {
        setQuestionsData(initialData);
    }, [initialData]);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Questions Overview</CardTitle>
            </CardHeader>
            <CardContent>
                <TooltipProvider>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[80px]">ID</TableHead>
                                <TableHead>Question Preview</TableHead>
                                <TableHead className="w-[160px]">Type</TableHead>
                                <TableHead className="w-[200px]">Topics</TableHead>
                                <TableHead className="w-[120px]">Section</TableHead>
                                <TableHead className="w-[140px]">Created</TableHead>
                                <TableHead className="w-[120px]">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                Array.from({ length: 10 }).map((_, index) => (
                                    <TableRow key={index}>
                                        <TableCell><Skeleton className="h-4 w-[60px]" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-[300px]" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
                                        <TableCell>
                                            <div className="flex gap-2">
                                                <Skeleton className="h-8 w-8 rounded-md" />
                                                <Skeleton className="h-8 w-8 rounded-md" />
                                                <Skeleton className="h-8 w-8 rounded-md" />
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                questionsData.content.map((question) => (
                                    <TableRow key={question.id}>
                                        <TableCell className="font-mono text-sm text-muted-foreground">
                                            #{question.id}
                                        </TableCell>
                                        <TableCell className="font-medium max-w-md">
                                            <div className="truncate">{question.questionPreview || 'No preview'}</div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{question.type}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-wrap gap-1">
                                                {question.topics.length > 0 ? (
                                                    question.topics.slice(0, 2).map((topic) => (
                                                        <Badge key={topic.id} variant="secondary" className="text-xs">
                                                            {topic.title}
                                                        </Badge>
                                                    ))
                                                ) : (
                                                    <span className="text-xs text-muted-foreground">No topics</span>
                                                )}
                                                {question.topics.length > 2 && (
                                                    <Badge variant="outline" className="text-xs">
                                                        +{question.topics.length - 2}
                                                    </Badge>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {question.sectionName || '—'}
                                        </TableCell>
                                        <TableCell>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <div className="text-sm text-muted-foreground flex items-center gap-1 cursor-help">
                                                        <Calendar className="h-3 w-3" />
                                                        <span suppressHydrationWarning>{formatDateBeautiful(question.createdAt)}</span>
                                                    </div>
                                                </TooltipTrigger>
                                                <TooltipContent suppressHydrationWarning>
                                                    <p>{new Date(question.createdAt).toLocaleDateString('en-US', {
                                                        weekday: 'long',
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric'
                                                    })}</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex gap-2">
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button variant="ghost" size="icon" onClick={() => handleView(question)}>
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>View details</TooltipContent>
                                                </Tooltip>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button variant="ghost" size="icon" onClick={() => handleEdit(question)}>
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>Edit question</TooltipContent>
                                                </Tooltip>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => handleDelete(question)}
                                                            className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>Delete question</TooltipContent>
                                                </Tooltip>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TooltipProvider>

                {questionsData.totalPages > 1 && (
                    <div className="flex justify-center gap-2 mt-4">
                        <Button
                            variant="outline"
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={questionsData.first}
                        >
                            Previous
                        </Button>
                        <span className="py-2 px-4">
                            Page {questionsData.page + 1} of {questionsData.totalPages}
                        </span>
                        <Button
                            variant="outline"
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={questionsData.last}
                        >
                            Next
                        </Button>
                    </div>
                )}

                {/* View Dialog */}
                <Dialog open={isViewDialogOpen} onOpenChange={(open) => {
                    setIsViewDialogOpen(open);
                    if (!open) setQuestionDetail(null);
                }}>
                    <DialogContent className="max-w-[95vw] sm:max-w-3xl max-h-[90vh] flex flex-col">
                        <DialogHeader>
                            <DialogTitle>Question Details</DialogTitle>
                            <DialogDescription>View complete information about this question</DialogDescription>
                        </DialogHeader>
                        <ScrollArea className="flex-1 overflow-y-auto">
                            <div className="space-y-4 p-4 pr-6">
                                {isLoadingDetail ? (
                                    <div className="space-y-4">
                                        <Skeleton className="h-20 w-full" />
                                        <Skeleton className="h-40 w-full" />
                                    </div>
                                ) : questionDetail && (
                                    <>
                                        <div className="flex items-center justify-between border-b pb-4">
                                            <div>
                                                <h3 className="text-sm font-medium text-muted-foreground mb-1">Question ID</h3>
                                                <p className="text-lg font-mono">#{questionDetail.id}</p>
                                            </div>
                                            <div className="text-right" suppressHydrationWarning>
                                                <h3 className="text-sm font-medium text-muted-foreground mb-1">Created</h3>
                                                <p className="text-sm text-muted-foreground">{formatDateBeautiful(questionDetail.createdAt)}</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label className="text-sm text-muted-foreground">Type</Label>
                                                <div className="mt-1"><Badge variant="outline">{questionDetail.type}</Badge></div>
                                            </div>
                                            {questionDetail.section && (
                                                <div>
                                                    <Label className="text-sm text-muted-foreground">Section</Label>
                                                    <p className="text-sm mt-1">{questionDetail.section.name}</p>
                                                </div>
                                            )}
                                            {questionDetail.passage && (
                                                <div>
                                                    <Label className="text-sm text-muted-foreground">Passage</Label>
                                                    <p className="text-sm mt-1">{questionDetail.passage.title}</p>
                                                </div>
                                            )}
                                        </div>

                                        <div>
                                            <Label className="text-sm text-muted-foreground">Question Text</Label>
                                            <p className="text-lg p-3 bg-muted rounded-md mt-1">
                                                {questionDetail.content?.questionText?.value || 'No text'}
                                            </p>
                                        </div>

                                        {questionDetail.explanation && (
                                            <div>
                                                <Label className="text-sm text-muted-foreground">Explanation</Label>
                                                <p className="text-sm p-3 bg-muted rounded-md mt-1">{questionDetail.explanation}</p>
                                            </div>
                                        )}

                                        {questionDetail.topics.length > 0 && (
                                            <div>
                                                <Label className="text-sm text-muted-foreground">Topics</Label>
                                                <div className="flex flex-wrap gap-1 mt-1">
                                                    {questionDetail.topics.map((topic) => (
                                                        <Badge key={topic.id} variant="secondary">{topic.title}</Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {questionDetail.content?.options?.length > 0 && (
                                            <div>
                                                <Label className="text-sm text-muted-foreground">Options</Label>
                                                <div className="space-y-1 mt-1">
                                                    {questionDetail.content.options.map((opt) => (
                                                        <div
                                                            key={opt.id}
                                                            className={`p-2 rounded text-sm border ${opt.id === questionDetail.content.correctOptionId ? 'border-green-500 bg-green-50 dark:bg-green-950' : 'border-border'}`}
                                                        >
                                                            <span className="font-medium mr-2">{opt.label}.</span>
                                                            {opt.value}
                                                            {opt.id === questionDetail.content.correctOptionId && (
                                                                <span className="ml-2 text-green-600 text-xs font-medium">✓ Correct</span>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </ScrollArea>
                    </DialogContent>
                </Dialog>

                {/* Edit Dialog */}
                <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                    <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
                        <DialogHeader>
                            <DialogTitle>Edit Question</DialogTitle>
                            <DialogDescription>Update the question details</DialogDescription>
                        </DialogHeader>
                        <div className="flex-1 overflow-y-auto px-1">
                            {selectedQuestion && questionDetail && (
                                <QuestionsHeader
                                    mode="edit"
                                    question={questionDetail}
                                    topics={topics}
                                    onClose={() => {
                                        setIsEditDialogOpen(false);
                                        setSelectedQuestion(null);
                                        setQuestionDetail(null);
                                    }}
                                    onSuccess={() => {
                                        setIsEditDialogOpen(false);
                                        setSelectedQuestion(null);
                                        setQuestionDetail(null);
                                        refreshData();
                                    }}
                                />
                            )}
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Delete Dialog */}
                <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Delete Question</AlertDialogTitle>
                            <div className="text-sm text-muted-foreground">
                                Are you sure you want to delete this question? This action cannot be undone.
                            </div>
                        </AlertDialogHeader>
                        {selectedQuestion && (
                            <div className="mt-4 p-4 rounded-lg bg-muted">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-xs font-mono text-muted-foreground">#{selectedQuestion.id}</span>
                                    <Badge variant="outline">{selectedQuestion.type}</Badge>
                                </div>
                                <div className="text-sm font-medium">{selectedQuestion.questionPreview}</div>
                            </div>
                        )}
                        <AlertDialogFooter>
                            <AlertDialogCancel onClick={() => setSelectedQuestion(null)}>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={confirmDelete}
                                className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                            >
                                Delete Question
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </CardContent>
        </Card>
    );
}
