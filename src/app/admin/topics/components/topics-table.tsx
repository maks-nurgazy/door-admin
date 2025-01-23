"use client";

import {useState} from "react";
import {usePathname, useRouter, useSearchParams} from "next/navigation";
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow,} from "@/components/ui/table";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Eye, Pencil, Trash2} from "lucide-react";
import {Topic, topicsApi, TopicsResponse} from "@/lib/api/topics";
import {Skeleton} from "@/components/ui/skeleton";
import {Dialog, DialogContent, DialogHeader, DialogTitle,} from "@/components/ui/dialog";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import * as z from "zod";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage,} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";

const topicSchema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters").max(50, "Title must be less than 50 characters"),
});

type TopicFormValues = z.infer<typeof topicSchema>;

interface TopicsTableProps {
    initialData: TopicsResponse;
}

// Mock sections data for demonstration
const mockSections = [
    {id: 1, title: "Mathematics Part 1"},
    {id: 2, title: "Reading Comprehension"},
    {id: 3, title: "Grammar Basics"},
];

export function TopicsTable({initialData}: TopicsTableProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isLoading, setIsLoading] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
    const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);

    const currentPage = searchParams.get("page")
        ? parseInt(searchParams.get("page")!) - 1
        : 0;

    const form = useForm<TopicFormValues>({
        resolver: zodResolver(topicSchema),
    });

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

    const handleView = (topic: Topic) => {
        setSelectedTopic(topic);
        setIsViewDialogOpen(true);
    };

    const handleEdit = (topic: Topic) => {
        setSelectedTopic(topic);
        form.reset({title: topic.title});
        setIsEditDialogOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (confirm("Are you sure you want to delete this topic?")) {
            try {
                await topicsApi.deleteTopic(id);
                router.refresh();
            } catch (error) {
                console.error('Failed to delete topic:', error);
            }
        }
    };

    const onSubmit = async (data: TopicFormValues) => {
        if (!selectedTopic) return;

        try {
            await topicsApi.updateTopic(selectedTopic.id, data);
            setIsEditDialogOpen(false);
            setSelectedTopic(null);
            form.reset();
            router.refresh();
        } catch (error) {
            console.error('Failed to update topic:', error);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Topics Overview</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead>Associated Sections</TableHead>
                            <TableHead className="w-[120px]">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            Array.from({length: 10}).map((_, index) => (
                                <TableRow key={index}>
                                    <TableCell><Skeleton className="h-4 w-[200px]"/></TableCell>
                                    <TableCell><Skeleton className="h-4 w-[300px]"/></TableCell>
                                    <TableCell>
                                        <div className="flex gap-2">
                                            <Skeleton className="h-8 w-8 rounded-md"/>
                                            <Skeleton className="h-8 w-8 rounded-md"/>
                                            <Skeleton className="h-8 w-8 rounded-md"/>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            initialData.data.map((topic) => (
                                <TableRow key={topic.id}>
                                    <TableCell className="font-medium">{topic.title}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-wrap gap-2">
                                            {topic.sections.map((sectionId) => (
                                                <Badge key={sectionId} variant="secondary">
                                                    {mockSections.find(s => s.id === sectionId)?.title || `Section ${sectionId}`}
                                                </Badge>
                                            ))}
                                            {topic.sections.length === 0 && (
                                                <span
                                                    className="text-muted-foreground text-sm">No sections assigned</span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleView(topic)}
                                            >
                                                <Eye className="h-4 w-4"/>
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleEdit(topic)}
                                            >
                                                <Pencil className="h-4 w-4"/>
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDelete(topic.id)}
                                            >
                                                <Trash2 className="h-4 w-4"/>
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

                {/* View Topic Details Dialog */}
                <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Topic Details</DialogTitle>
                        </DialogHeader>
                        {selectedTopic && (
                            <div className="space-y-4">
                                <div>
                                    <Label className="text-sm text-muted-foreground">Topic Title</Label>
                                    <p className="text-lg font-medium">{selectedTopic.title}</p>
                                </div>
                                <div>
                                    <Label className="text-sm text-muted-foreground">Associated Sections</Label>
                                    <div className="mt-2 space-y-2">
                                        {selectedTopic.sections.length > 0 ? (
                                            selectedTopic.sections.map((sectionId) => {
                                                const section = mockSections.find(s => s.id === sectionId);
                                                return (
                                                    <div key={sectionId}
                                                         className="flex items-center gap-2 p-2 rounded-lg border">
                                                        <span
                                                            className="font-medium">{section?.title || `Section ${sectionId}`}</span>
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <p className="text-muted-foreground">No sections associated with this
                                                topic</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>

                {/* Edit Topic Dialog */}
                <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Edit Topic</DialogTitle>
                        </DialogHeader>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="title"
                                    render={({field}) => (
                                        <FormItem>
                                            <FormLabel>Topic Title</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage/>
                                        </FormItem>
                                    )}
                                />
                                <div className="flex justify-end gap-3">
                                    <Button variant="outline" type="button" onClick={() => {
                                        setIsEditDialogOpen(false);
                                        setSelectedTopic(null);
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
            </CardContent>
        </Card>
    );
}