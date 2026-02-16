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
import { Eye, Pencil, Trash2, BookOpen, ChevronLeft, ChevronRight } from "lucide-react";
import {
    QuestionListDto,
    QuestionResponseDto,
    QuestionsResponse,
    QuestionType,
    questionsApi,
} from "@/lib/api/questions";
import { Topic } from "@/lib/api/topics";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { QuestionsHeader } from "./questions-header";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface QuestionsTableProps {
    initialData: QuestionsResponse;
    topics: Topic[];
}

const TYPE_LABELS: Record<QuestionType, { label: string; color: string }> = {
    ANALOGY: { label: "Analogy", color: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300" },
    ALGEBRAIC_EXPRESSION: { label: "Algebra", color: "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300" },
    MATH_COMPARISON: { label: "Comparison", color: "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300" },
    SENTENCE_COMPLETION: { label: "Sentence", color: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300" },
    READING_COMPREHENSION: { label: "Reading", color: "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300" },
};

function getPageNumbers(current: number, total: number): (number | '...')[] {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i);
    if (current <= 3) return [0, 1, 2, 3, 4, '...', total - 1];
    if (current >= total - 4) return [0, '...', total - 5, total - 4, total - 3, total - 2, total - 1];
    return [0, '...', current - 1, current, current + 1, '...', total - 1];
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

    const loadDetail = async (id: number) => {
        setIsLoadingDetail(true);
        setQuestionDetail(null);
        try {
            const detail = await questionsApi.getQuestionById(id);
            setQuestionDetail(detail);
        } catch (error) {
            console.error('Failed to fetch question details:', error);
        } finally {
            setIsLoadingDetail(false);
        }
    };

    const handleView = (question: QuestionListDto) => {
        setSelectedQuestion(question);
        setIsViewDialogOpen(true);
        loadDetail(question.id);
    };

    const handleEdit = (question: QuestionListDto) => {
        setSelectedQuestion(question);
        setIsEditDialogOpen(true);
        loadDetail(question.id);
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

    const { content, page, size, totalElements, totalPages, first, last } = questionsData;
    const showingFrom = totalElements === 0 ? 0 : page * size + 1;
    const showingTo = Math.min(page * size + size, totalElements);
    const pageNumbers = getPageNumbers(page, totalPages);

    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle>Questions</CardTitle>
                    <span className="text-sm text-muted-foreground">
                        {totalElements} question{totalElements !== 1 ? 's' : ''} total
                    </span>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <TooltipProvider>
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent">
                                <TableHead className="pl-6 w-[100px]">Type</TableHead>
                                <TableHead>Question</TableHead>
                                <TableHead className="w-[220px]">Topics</TableHead>
                                <TableHead className="w-[100px] pr-6 text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                Array.from({ length: 10 }).map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell className="pl-6"><Skeleton className="h-5 w-20 rounded-full" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-full max-w-sm" /></TableCell>
                                        <TableCell><Skeleton className="h-5 w-28 rounded-full" /></TableCell>
                                        <TableCell className="pr-6">
                                            <div className="flex justify-end gap-1">
                                                <Skeleton className="h-8 w-8 rounded-md" />
                                                <Skeleton className="h-8 w-8 rounded-md" />
                                                <Skeleton className="h-8 w-8 rounded-md" />
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : content.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="py-16 text-center">
                                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                            <BookOpen className="h-8 w-8 opacity-40" />
                                            <p className="text-sm">No questions found</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                content.map((question) => {
                                    const typeConfig = TYPE_LABELS[question.type];
                                    return (
                                        <TableRow key={question.id} className="group">
                                            <TableCell className="pl-6">
                                                <span className={cn(
                                                    "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                                                    typeConfig.color
                                                )}>
                                                    {typeConfig.label}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm line-clamp-2 leading-snug">
                                                        {question.questionPreview || <span className="text-muted-foreground italic">No preview</span>}
                                                    </span>
                                                    {question.hasPassage && (
                                                        <span className="shrink-0 text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                                                            passage
                                                        </span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-wrap gap-1">
                                                    {question.topics.length === 0 ? (
                                                        <span className="text-xs text-muted-foreground">—</span>
                                                    ) : (
                                                        <>
                                                            {question.topics.slice(0, 2).map((t) => (
                                                                <Badge key={t.id} variant="secondary" className="text-xs font-normal">
                                                                    {t.title}
                                                                </Badge>
                                                            ))}
                                                            {question.topics.length > 2 && (
                                                                <Badge variant="outline" className="text-xs">
                                                                    +{question.topics.length - 2}
                                                                </Badge>
                                                            )}
                                                        </>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="pr-6">
                                                <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleView(question)}>
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>View</TooltipContent>
                                                    </Tooltip>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(question)}>
                                                                <Pencil className="h-4 w-4" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>Edit</TooltipContent>
                                                    </Tooltip>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                                                onClick={() => handleDelete(question)}
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>Delete</TooltipContent>
                                                    </Tooltip>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </TooltipProvider>

                {/* Pagination */}
                {totalPages > 0 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t">
                        <p className="text-sm text-muted-foreground">
                            {totalElements === 0 ? 'No results' : `Showing ${showingFrom}–${showingTo} of ${totalElements}`}
                        </p>
                        <div className="flex items-center gap-1">
                            <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handlePageChange(page - 1)}
                                disabled={first}
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            {pageNumbers.map((p, i) =>
                                p === '...' ? (
                                    <span key={`dots-${i}`} className="px-1 text-muted-foreground text-sm">…</span>
                                ) : (
                                    <Button
                                        key={p}
                                        variant={p === page ? "default" : "outline"}
                                        size="icon"
                                        className="h-8 w-8 text-sm"
                                        onClick={() => handlePageChange(p as number)}
                                    >
                                        {(p as number) + 1}
                                    </Button>
                                )
                            )}
                            <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handlePageChange(page + 1)}
                                disabled={last}
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )}

                {/* View Dialog */}
                <Dialog open={isViewDialogOpen} onOpenChange={(open) => {
                    setIsViewDialogOpen(open);
                    if (!open) setQuestionDetail(null);
                }}>
                    <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
                        <DialogHeader>
                            <DialogTitle>Question Details</DialogTitle>
                            <DialogDescription>Full question information</DialogDescription>
                        </DialogHeader>
                        <ScrollArea className="flex-1 overflow-y-auto">
                            <div className="space-y-4 p-1 pr-4">
                                {isLoadingDetail ? (
                                    <div className="space-y-3">
                                        <Skeleton className="h-6 w-1/3" />
                                        <Skeleton className="h-16 w-full" />
                                        <Skeleton className="h-32 w-full" />
                                    </div>
                                ) : questionDetail && (
                                    <>
                                        <div className="flex items-center gap-2">
                                            {(() => {
                                                const t = TYPE_LABELS[questionDetail.type];
                                                return (
                                                    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium", t.color)}>
                                                        {t.label}
                                                    </span>
                                                );
                                            })()}
                                            {questionDetail.passage && (
                                                <Badge variant="outline" className="text-xs">Passage: {questionDetail.passage.title}</Badge>
                                            )}
                                        </div>

                                        <div className="rounded-lg bg-muted p-4">
                                            <Label className="text-xs uppercase tracking-wide text-muted-foreground">Question Text</Label>
                                            <p className="mt-2 text-base leading-relaxed">
                                                {questionDetail.content?.questionText?.value || 'No text'}
                                            </p>
                                        </div>

                                        {questionDetail.content?.options?.length > 0 && (
                                            <div className="space-y-2">
                                                <Label className="text-xs uppercase tracking-wide text-muted-foreground">Options</Label>
                                                {questionDetail.content.options.map((opt) => {
                                                    const correct = opt.id === questionDetail.content.correctOptionId;
                                                    return (
                                                        <div
                                                            key={opt.id}
                                                            className={cn(
                                                                "flex items-center gap-3 p-3 rounded-lg border-2 text-sm",
                                                                correct
                                                                    ? "border-green-500 bg-green-50 dark:bg-green-950/20"
                                                                    : "border-border"
                                                            )}
                                                        >
                                                            <div className={cn(
                                                                "w-6 h-6 shrink-0 rounded-full flex items-center justify-center text-xs font-bold",
                                                                correct ? "bg-green-500 text-white" : "bg-muted text-muted-foreground"
                                                            )}>
                                                                {opt.label}
                                                            </div>
                                                            <span className="flex-1">{opt.value}</span>
                                                            {correct && (
                                                                <span className="text-xs font-medium text-green-600">✓ Correct</span>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}

                                        {questionDetail.explanation && (
                                            <div className="rounded-lg border p-4">
                                                <Label className="text-xs uppercase tracking-wide text-muted-foreground">Explanation</Label>
                                                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{questionDetail.explanation}</p>
                                            </div>
                                        )}

                                        {questionDetail.topics.length > 0 && (
                                            <div>
                                                <Label className="text-xs uppercase tracking-wide text-muted-foreground">Topics</Label>
                                                <div className="flex flex-wrap gap-1 mt-2">
                                                    {questionDetail.topics.map((t) => (
                                                        <Badge key={t.id} variant="secondary">{t.title}</Badge>
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
                <Dialog open={isEditDialogOpen} onOpenChange={(open) => {
                    setIsEditDialogOpen(open);
                    if (!open) { setSelectedQuestion(null); setQuestionDetail(null); }
                }}>
                    <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
                        <DialogHeader>
                            <DialogTitle>Edit Question</DialogTitle>
                            <DialogDescription>Update the question details</DialogDescription>
                        </DialogHeader>
                        <div className="flex-1 overflow-y-auto px-1">
                            {isLoadingDetail ? (
                                <div className="space-y-3 py-4">
                                    <Skeleton className="h-24 w-full" />
                                    <Skeleton className="h-12 w-full" />
                                    <Skeleton className="h-40 w-full" />
                                </div>
                            ) : selectedQuestion && questionDetail && (
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
                            <div className="mt-2 p-3 rounded-lg bg-muted text-sm">
                                {(() => {
                                    const t = TYPE_LABELS[selectedQuestion.type];
                                    return (
                                        <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mr-2", t.color)}>
                                            {t.label}
                                        </span>
                                    );
                                })()}
                                {selectedQuestion.questionPreview}
                            </div>
                        )}
                        <AlertDialogFooter>
                            <AlertDialogCancel onClick={() => setSelectedQuestion(null)}>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={confirmDelete}
                                className="bg-destructive hover:bg-destructive/90"
                            >
                                Delete
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </CardContent>
        </Card>
    );
}
