"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
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
import { Question, QuestionsResponse, questionsApi } from "@/lib/api/questions";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TopicShortDto } from "@/lib/api/topics";
import { QuestionsHeader } from "./questions-header";
import { formatDateBeautiful } from "@/lib/utils";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

interface QuestionsTableProps {
    initialData: QuestionsResponse;
    topics: TopicShortDto[];
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
    const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);

    const currentPage = searchParams.get("page")
        ? parseInt(searchParams.get("page")!) - 1
        : 0;

    const refreshData = async () => {
        setIsLoading(true);
        try {
            const filters = {
                search: searchParams.get("search") || undefined,
                page: currentPage,
            };
            const updatedData = await questionsApi.getQuestions(filters);
            setQuestionsData(updatedData);
        } catch (error) {
            console.error('Failed to refresh questions:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handlePageChange = async (newPage: number) => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams(searchParams.toString());
            params.set("page", (newPage + 1).toString());
            router.push(`${pathname}?${params.toString()}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleView = (question: Question) => {
        setSelectedQuestion(question);
        setIsViewDialogOpen(true);
    };

    const handleEdit = (question: Question) => {
        setSelectedQuestion(question);
        setIsEditDialogOpen(true);
    };

    const handleDelete = (question: Question) => {
        setSelectedQuestion(question);
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!selectedQuestion) return;

        try {
            await questionsApi.deleteQuestion(selectedQuestion.id);
            setIsDeleteDialogOpen(false);
            setSelectedQuestion(null);
            await refreshData(); // Refresh data after successful deletion
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
                            <TableHead>ID</TableHead>
                            <TableHead>Question</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Topics</TableHead>
                            <TableHead>Created At</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            Array.from({ length: 10 }).map((_, index) => (
                                <TableRow key={index}>
                                    <TableCell><Skeleton className="h-4 w-[60px]" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-[300px]" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-[200px]" /></TableCell>
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
                            questionsData.data.map((question) => (
                                <TableRow key={question.id}>
                                    <TableCell className="font-mono text-sm text-muted-foreground">
                                        #{question.id}
                                    </TableCell>
                                    <TableCell className="font-medium max-w-md">
                                        <div className="truncate">{question.text}</div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{question.type}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-wrap gap-1">
                                            {question.topics.map((topic) => (
                                                <Badge key={topic.id} variant="secondary">
                                                    {topic.title}
                                                </Badge>
                                            ))}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <div className="text-sm text-muted-foreground flex items-center gap-1 cursor-help">
                                                    <Calendar className="h-3 w-3" />
                                                    {formatDateBeautiful(question.createdAt)}
                                                </div>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>{new Date(question.createdAt).toLocaleString('en-US', {
                                                    weekday: 'long',
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric',
                                                    hour: 'numeric',
                                                    minute: '2-digit',
                                                    hour12: true
                                                })}</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleView(question)}
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleEdit(question)}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDelete(question)}
                                                className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
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
                            disabled={currentPage === 0}
                        >
                            Previous
                        </Button>
                        <span className="py-2 px-4">
              Page {currentPage + 1} of {questionsData.totalPages}
            </span>
                        <Button
                            variant="outline"
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === questionsData.totalPages - 1}
                        >
                            Next
                        </Button>
                    </div>
                )}

                <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
                    <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
                        <DialogHeader>
                            <DialogTitle>Question Details</DialogTitle>
                        </DialogHeader>
                        <ScrollArea className="flex-1">
                            <div className="space-y-4 p-4">
                                {selectedQuestion && (
                                    <>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className="text-sm font-medium text-muted-foreground mb-1">Question ID</h3>
                                                <p className="text-lg font-mono">#{selectedQuestion.id}</p>
                                            </div>
                                            <div className="text-right">
                                                <h3 className="text-sm font-medium text-muted-foreground mb-1">Created</h3>
                                                <p className="text-sm text-muted-foreground">{formatDateBeautiful(selectedQuestion.createdAt)}</p>
                                            </div>
                                        </div>
                                        
                                        <div>
                                            <h3 className="text-sm font-medium text-muted-foreground mb-1">Question Text</h3>
                                            <p className="text-lg">{selectedQuestion.text}</p>
                                        </div>

                                        {selectedQuestion.imageUrl && (
                                            <div>
                                                <h3 className="text-sm font-medium text-muted-foreground mb-1">Question Image</h3>
                                                <div className="relative h-40 rounded-lg border overflow-hidden">
                                                    <Image
                                                        src={selectedQuestion.imageUrl}
                                                        alt="Question"
                                                        fill
                                                        className="object-contain"
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        <div>
                                            <h3 className="text-sm font-medium text-muted-foreground mb-1">Topics</h3>
                                            <div className="flex flex-wrap gap-1">
                                                {selectedQuestion.topics.map((topic) => (
                                                    <Badge key={topic.id} variant="secondary">
                                                        {topic.title}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <h3 className="text-sm font-medium text-muted-foreground mb-1">Options</h3>
                                            <div className="grid grid-cols-2 gap-2">
                                                {selectedQuestion.options.map((option) => (
                                                    <div
                                                        key={option.key}
                                                        className={`p-2 rounded-lg border ${
                                                            option.key === selectedQuestion.answerKey
                                                                ? "border-green-500 bg-green-50"
                                                                : ""
                                                        }`}
                                                    >
                            <span className="font-semibold mr-2">
                              {String.fromCharCode(64 + option.key)}:
                            </span>
                                                        {option.text}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </ScrollArea>
                    </DialogContent>
                </Dialog>

                <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                    <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
                        <DialogHeader>
                            <DialogTitle>Edit Question</DialogTitle>
                        </DialogHeader>
                        <div className="flex-1 overflow-y-auto px-1">
                            {selectedQuestion && (
                                <QuestionsHeader
                                    mode="edit"
                                    question={selectedQuestion}
                                    topics={topics}
                                    onClose={() => {
                                        setIsEditDialogOpen(false);
                                        setSelectedQuestion(null);
                                    }}
                                    onSuccess={() => {
                                        setIsEditDialogOpen(false);
                                        setSelectedQuestion(null);
                                        refreshData();
                                    }}
                                />
                            )}
                        </div>
                    </DialogContent>
                </Dialog>

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
                                </div>
                                <div className="text-sm font-medium">
                                    {selectedQuestion.text}
                                </div>
                            </div>
                        )}
                        <AlertDialogFooter>
                            <AlertDialogCancel onClick={() => setSelectedQuestion(null)}>
                                Cancel
                            </AlertDialogCancel>
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