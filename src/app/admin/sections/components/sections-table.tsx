"use client";

import { useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Pencil, Trash2, Eye, ListPlus } from "lucide-react";
import { Section, SectionsResponse, sectionsApi } from "@/lib/api/sections";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
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
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Question, questionsApi } from "@/lib/api/questions";
import { TopicShortDto } from "@/lib/api/topics";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

const sectionSchema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters").max(50, "Title must be less than 50 characters"),
    durationMinutes: z.coerce.number().min(1, "Duration must be at least 1 minute").max(240, "Duration cannot exceed 240 minutes"),
});

type SectionFormValues = z.infer<typeof sectionSchema>;

interface SectionsTableProps {
    initialData: SectionsResponse;
    topics: TopicShortDto[];
}

export function SectionsTable({ initialData, topics }: SectionsTableProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isLoading, setIsLoading] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
    const [isQuestionsDialogOpen, setIsQuestionsDialogOpen] = useState(false);
    const [selectedSection, setSelectedSection] = useState<Section | null>(null);
    const [selectedQuestions, setSelectedQuestions] = useState<number[]>([]);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [questionSearch, setQuestionSearch] = useState("");
    const [questionsPage, setQuestionsPage] = useState(0);
    const [totalQuestionPages, setTotalQuestionPages] = useState(1);
    const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
    const [selectedTopic, setSelectedTopic] = useState<string>("all");
    const [sectionQuestions, setSectionQuestions] = useState<Question[]>([]);

    const currentPage = searchParams.get("page")
        ? parseInt(searchParams.get("page")!) - 1
        : 0;

    const form = useForm<SectionFormValues>({
        resolver: zodResolver(sectionSchema),
    });

    const loadQuestions = async (page: number, search?: string, topicId?: string) => {
        setIsLoadingQuestions(true);
        try {
            const response = await questionsApi.getQuestions({
                page,
                search,
                topicId: topicId === "all" ? undefined : Number(topicId),
            });

            // If we're on the first page, prepend section questions
            if (page === 0 && selectedSection) {
                const currentSectionQuestions = sectionQuestions.filter(q =>
                    !response.data.some(newQ => newQ.id === q.id)
                );
                setQuestions([...currentSectionQuestions, ...response.data]);
            } else {
                setQuestions(response.data);
            }

            setTotalQuestionPages(response.totalPages);
        } catch (error) {
            console.error('Failed to load questions:', error);
        } finally {
            setIsLoadingQuestions(false);
        }
    };

    const handleAssignQuestions = async (section: Section) => {
        setSelectedSection(section);
        setIsLoadingQuestions(true);
        try {
            // Load section's current questions
            const sectionQuestionsData = await sectionsApi.getSectionQuestions(section.id);
            setSectionQuestions(sectionQuestionsData);
            setSelectedQuestions(sectionQuestionsData.map(q => q.id));

            // Load all questions for the first page
            await loadQuestions(0, questionSearch, selectedTopic);
        } catch (error) {
            console.error('Failed to load section questions:', error);
        } finally {
            setIsLoadingQuestions(false);
        }
        setIsQuestionsDialogOpen(true);
    };

    const handleQuestionSearch = (value: string) => {
        setQuestionSearch(value);
        setQuestionsPage(0);
        loadQuestions(0, value, selectedTopic);
    };

    const handleTopicChange = (value: string) => {
        setSelectedTopic(value);
        setQuestionsPage(0);
        loadQuestions(0, questionSearch, value);
    };

    const handleQuestionPageChange = (newPage: number) => {
        setQuestionsPage(newPage);
        loadQuestions(newPage, questionSearch, selectedTopic);
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

    const handleView = (section: Section) => {
        setSelectedSection(section);
        setIsViewDialogOpen(true);
    };

    const handleEdit = (section: Section) => {
        setSelectedSection(section);
        form.reset({
            title: section.title,
            durationMinutes: section.durationMinutes,
        });
        setIsEditDialogOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (confirm("Are you sure you want to delete this section?")) {
            try {
                await sectionsApi.deleteSection(id);
                router.refresh();
            } catch (error) {
                console.error('Failed to delete section:', error);
            }
        }
    };

    const toggleQuestionSelection = (questionId: number) => {
        setSelectedQuestions(prev =>
            prev.includes(questionId)
                ? prev.filter(id => id !== questionId)
                : [...prev, questionId]
        );
    };

    const handleSaveQuestions = async () => {
        if (!selectedSection) return;

        try {
            // Get the current section's questions
            const currentQuestions = selectedSection.questionIds || [];

            // Determine which questions to assign and which to remove
            const questionsToAssign = selectedQuestions.filter(id => !currentQuestions.includes(id));
            const questionsToRemove = currentQuestions.filter(id => !selectedQuestions.includes(id));

            // Update questions in sequence
            if (questionsToAssign.length > 0) {
                await sectionsApi.updateSectionQuestions(selectedSection.id, questionsToAssign, 'assign');
            }

            if (questionsToRemove.length > 0) {
                await sectionsApi.updateSectionQuestions(selectedSection.id, questionsToRemove, 'remove');
            }

            setIsQuestionsDialogOpen(false);
            setSelectedSection(null);
            setSelectedQuestions([]);
            router.refresh();
        } catch (error) {
            console.error('Failed to update section questions:', error);
        }
    };

    const onSubmit = async (data: SectionFormValues) => {
        if (!selectedSection) return;

        try {
            await sectionsApi.updateSection(selectedSection.id, data);
            setIsEditDialogOpen(false);
            setSelectedSection(null);
            form.reset();
            router.refresh();
        } catch (error) {
            console.error('Failed to update section:', error);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Sections Overview</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead>Duration</TableHead>
                            <TableHead>Questions</TableHead>
                            <TableHead className="w-[120px]">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            Array.from({ length: 10 }).map((_, index) => (
                                <TableRow key={index}>
                                    <TableCell><Skeleton className="h-4 w-[200px]" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                                    <TableCell>
                                        <div className="flex gap-2">
                                            <Skeleton className="h-8 w-8 rounded-md" />
                                            <Skeleton className="h-8 w-8 rounded-md" />
                                            <Skeleton className="h-8 w-8 rounded-md" />
                                            <Skeleton className="h-8 w-8 rounded-md" />
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            initialData.data.map((section) => (
                                <TableRow key={section.id}>
                                    <TableCell className="font-medium">{section.title}</TableCell>
                                    <TableCell>{section.durationMinutes} min</TableCell>
                                    <TableCell>{section.numberOfQuestions}</TableCell>
                                    <TableCell>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleView(section)}
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleAssignQuestions(section)}
                                            >
                                                <ListPlus className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleEdit(section)}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDelete(section.id)}
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

                {/* View Section Details Dialog */}
                <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Section Details</DialogTitle>
                        </DialogHeader>
                        {selectedSection && (
                            <div className="space-y-4">
                                <div>
                                    <Label className="text-sm text-muted-foreground">Section Title</Label>
                                    <p className="text-lg font-medium">{selectedSection.title}</p>
                                </div>
                                <div>
                                    <Label className="text-sm text-muted-foreground">Duration</Label>
                                    <p className="text-lg font-medium">{selectedSection.durationMinutes} minutes</p>
                                </div>
                                <div>
                                    <Label className="text-sm text-muted-foreground">Number of Questions</Label>
                                    <p className="text-lg font-medium">{selectedSection.numberOfQuestions}</p>
                                </div>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>

                {/* Edit Section Dialog */}
                <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Edit Section</DialogTitle>
                        </DialogHeader>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="title"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Section Title</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="durationMinutes"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Duration (minutes)</FormLabel>
                                            <FormControl>
                                                <Input type="number" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <div className="flex justify-end gap-3">
                                    <Button variant="outline" type="button" onClick={() => {
                                        setIsEditDialogOpen(false);
                                        setSelectedSection(null);
                                        form.reset();
                                    }}>
                                        Cancel
                                    </Button>
                                    <Button type="submit">
                                        Save Changes
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    </DialogContent>
                </Dialog>

                {/* Question Assignment Dialog */}
                <Dialog open={isQuestionsDialogOpen} onOpenChange={setIsQuestionsDialogOpen}>
                    <DialogContent className="max-w-3xl">
                        <DialogHeader>
                            <DialogTitle>Assign Questions to {selectedSection?.title}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="flex-1">
                                    <Input
                                        placeholder="Search questions..."
                                        value={questionSearch}
                                        onChange={(e) => handleQuestionSearch(e.target.value)}
                                    />
                                </div>
                                <Select
                                    value={selectedTopic}
                                    onValueChange={handleTopicChange}
                                >
                                    <SelectTrigger className="w-[200px]">
                                        <SelectValue placeholder="Filter by topic" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Topics</SelectItem>
                                        {questions[0]?.topics.map((topic) => (
                                            <SelectItem key={topic.id} value={topic.id.toString()}>
                                                {topic.title}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <ScrollArea className="h-[400px] rounded-md border p-4">
                                {isLoadingQuestions ? (
                                    Array.from({ length: 5 }).map((_, index) => (
                                        <div key={index} className="mb-4">
                                            <Skeleton className="h-6 w-full mb-2" />
                                            <Skeleton className="h-4 w-20" />
                                        </div>
                                    ))
                                ) : questions.length === 0 ? (
                                    <div className="text-center py-8 text-muted-foreground">
                                        No questions found
                                    </div>
                                ) : (
                                    questions.map((question) => (
                                        <div
                                            key={question.id}
                                            className={cn(
                                                "flex items-center justify-between p-2 rounded-lg hover:bg-accent cursor-pointer mb-2",
                                                selectedQuestions.includes(question.id) && "bg-accent"
                                            )}
                                            onClick={() => toggleQuestionSelection(question.id)}
                                        >
                                            <div className="flex-1">
                                                <p className="font-medium">{question.questionText}</p>
                                                <div className="flex gap-2 mt-1">
                                                    <Badge variant="outline">{question.type}</Badge>
                                                    {question.topicIds?.map((topicId) => {
                                                        const topic = topics.find(t => t.id === topicId);
                                                        return topic ? (
                                                            <Badge key={topicId} variant="secondary">
                                                                {topic.title}
                                                            </Badge>
                                                        ) : null;
                                                    })}
                                                </div>
                                            </div>
                                            <input
                                                type="checkbox"
                                                checked={selectedQuestions.includes(question.id)}
                                                onChange={() => toggleQuestionSelection(question.id)}
                                                className="ml-4"
                                            />
                                        </div>
                                    ))
                                )}
                            </ScrollArea>
                            {totalQuestionPages > 1 && (
                                <div className="flex justify-center gap-2">
                                    <Button
                                        variant="outline"
                                        onClick={() => handleQuestionPageChange(questionsPage - 1)}
                                        disabled={questionsPage === 0}
                                    >
                                        Previous
                                    </Button>
                                    <span className="py-2 px-4">
                    Page {questionsPage + 1} of {totalQuestionPages}
                  </span>
                                    <Button
                                        variant="outline"
                                        onClick={() => handleQuestionPageChange(questionsPage + 1)}
                                        disabled={questionsPage === totalQuestionPages - 1}
                                    >
                                        Next
                                    </Button>
                                </div>
                            )}
                            <div className="flex justify-between items-center">
                                <p className="text-sm text-muted-foreground">
                                    {selectedQuestions.length} questions selected
                                </p>
                                <div className="flex gap-3">
                                    <Button variant="outline" onClick={() => {
                                        setIsQuestionsDialogOpen(false);
                                        setSelectedSection(null);
                                        setSelectedQuestions([]);
                                        setQuestionSearch("");
                                        setQuestionsPage(0);
                                    }}>
                                        Cancel
                                    </Button>
                                    <Button onClick={handleSaveQuestions}>
                                        Save Questions
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </CardContent>
        </Card>
    );
}