"use client";

import { useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Pencil, Trash2, Eye } from "lucide-react";
import { Question, QuestionsResponse, questionsApi } from "@/lib/api/questions";
import { Skeleton } from "@/components/ui/skeleton";
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
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import {format} from "date-fns";

interface QuestionsTableProps {
    initialData: QuestionsResponse;
}

export function QuestionsTable({ initialData }: QuestionsTableProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isLoading, setIsLoading] = useState(false);
    const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);

    const currentPage = searchParams.get("page")
        ? parseInt(searchParams.get("page")!) - 1
        : 0;

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

    const handleDelete = (question: Question) => {
        setSelectedQuestion(question);
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!selectedQuestion) return;

        try {
            await questionsApi.deleteQuestion(selectedQuestion.id);
            router.refresh();
        } catch (error) {
            console.error('Failed to delete question:', error);
        } finally {
            setIsDeleteDialogOpen(false);
            setSelectedQuestion(null);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Questions Overview</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
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
                                    <TableCell><Skeleton className="h-4 w-[300px]" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-[200px]" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
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
                            initialData.data.map((question) => (
                                <TableRow key={question.id}>
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
                                    <TableCell>{format(new Date(question.createdAt), "MMM dd, yyyy")}</TableCell>
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
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDelete(question)}
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

                {initialData.totalPages > 1 && (
                    <div className="flex justify-center gap-2 mt-4">
                        <Button
                            variant="outline"
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 0}
                        >
                            Previous
                        </Button>
                        <span className="py-2 px-4">
              Page {currentPage + 1} of {initialData.totalPages}
            </span>
                        <Button
                            variant="outline"
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === initialData.totalPages - 1}
                        >
                            Next
                        </Button>
                    </div>
                )}

                {/* View Question Dialog */}
                <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
                    <DialogContent className="max-w-3xl">
                        <DialogHeader>
                            <DialogTitle>Question Details</DialogTitle>
                        </DialogHeader>
                        {selectedQuestion && (
                            <div className="space-y-4">
                                <div>
                                    <Label className="text-sm text-muted-foreground">Question Text</Label>
                                    <p className="text-lg font-medium">{selectedQuestion.text}</p>
                                </div>
                                {selectedQuestion.imageUrl && (
                                    <div>
                                        <Label className="text-sm text-muted-foreground">Question Image</Label>
                                        <img
                                            src={selectedQuestion.imageUrl}
                                            alt="Question"
                                            className="mt-2 max-h-40 object-contain rounded-lg border"
                                        />
                                    </div>
                                )}
                                <div>
                                    <Label className="text-sm text-muted-foreground">Topics</Label>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        {selectedQuestion.topics.map((topic) => (
                                            <Badge key={topic.id} variant="secondary">
                                                {topic.title}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <Label className="text-sm text-muted-foreground">Created At</Label>
                                    <p className="font-medium">
                                        {format(new Date(selectedQuestion.createdAt), "MMM dd, yyyy")}
                                    </p>
                                </div>
                                <div>
                                    <Label className="text-sm text-muted-foreground">Options</Label>
                                    <div className="grid grid-cols-2 gap-2 mt-2">
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
                            </div>
                        )}
                    </DialogContent>
                </Dialog>

                {/* Delete Confirmation Dialog */}
                <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete this question
                                and remove it from our servers.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
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