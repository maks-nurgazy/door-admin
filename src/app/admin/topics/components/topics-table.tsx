"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { Pencil, Trash2, Eye } from "lucide-react";
import { Topic, topicsApi } from "@/lib/api/topics";
import {
    Dialog,
    DialogContent,
    DialogDescription,
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
import { Label } from "@/components/ui/label";

const topicSchema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters").max(255, "Title must be less than 255 characters"),
    description: z.string().optional(),
});

type TopicFormValues = z.infer<typeof topicSchema>;

interface TopicEditFormProps {
    form: ReturnType<typeof useForm<TopicFormValues>>;
    onSubmit: (data: TopicFormValues) => Promise<void>;
    onCancel: () => void;
}

function TopicEditForm({ form, onSubmit, onCancel }: TopicEditFormProps) {
    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Topic Title</FormLabel>
                            <FormControl>
                                <Input {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Description (Optional)</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Enter topic description..."
                                    className="resize-none"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="flex justify-end gap-3">
                    <Button variant="outline" type="button" onClick={onCancel}>
                        Cancel
                    </Button>
                    <Button type="submit">
                        Save Changes
                    </Button>
                </div>
            </form>
        </Form>
    );
}

interface TopicsTableProps {
    initialData: Topic[];
}

export function TopicsTable({ initialData }: TopicsTableProps) {
    const router = useRouter();
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
    const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [topicToDelete, setTopicToDelete] = useState<Topic | null>(null);

    const form = useForm<TopicFormValues>({
        resolver: zodResolver(topicSchema),
        defaultValues: { title: "", description: "" },
    });

    const handleView = (topic: Topic) => {
        setSelectedTopic(topic);
        setIsViewDialogOpen(true);
    };

    const handleEdit = (topic: Topic) => {
        setSelectedTopic(topic);
        form.reset({ title: topic.title, description: topic.description ?? "" });
        setIsEditDialogOpen(true);
    };

    const handleDelete = (topic: Topic) => {
        setTopicToDelete(topic);
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!topicToDelete) return;
        try {
            await topicsApi.deleteTopic(topicToDelete.id);
            router.refresh();
        } catch (error) {
            console.error('Failed to delete topic:', error);
        } finally {
            setIsDeleteDialogOpen(false);
            setTopicToDelete(null);
        }
    };

    const onSubmit = async (data: TopicFormValues) => {
        if (!selectedTopic) return;
        try {
            await topicsApi.updateTopic(selectedTopic.id, {
                title: data.title,
                description: data.description || undefined,
            });
            setIsEditDialogOpen(false);
            setSelectedTopic(null);
            form.reset();
            router.refresh();
        } catch (error) {
            console.error('Failed to update topic:', error);
        }
    };

    const handleEditCancel = () => {
        setIsEditDialogOpen(false);
        setSelectedTopic(null);
        form.reset();
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Topics Overview</CardTitle>
            </CardHeader>
            <CardContent>
                {initialData.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        No topics found. Create your first topic to get started.
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Title</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead className="w-[120px]">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {initialData.map((topic) => (
                                <TableRow key={topic.id}>
                                    <TableCell className="font-medium">{topic.title}</TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {topic.description || "—"}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleView(topic)}
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleEdit(topic)}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDelete(topic)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}

                {/* Delete Confirmation Dialog */}
                <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the topic
                                <span className="font-medium"> {topicToDelete?.title}</span>.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel onClick={() => setTopicToDelete(null)}>
                                Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                                onClick={confirmDelete}
                                className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                            >
                                Delete Topic
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                {/* View Topic Details Dialog */}
                <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Topic Details</DialogTitle>
                            <DialogDescription>
                                View the details of this topic.
                            </DialogDescription>
                        </DialogHeader>
                        {selectedTopic && (
                            <div className="space-y-4">
                                <div>
                                    <Label className="text-sm text-muted-foreground">Topic Title</Label>
                                    <p className="text-lg font-medium">{selectedTopic.title}</p>
                                </div>
                                <div>
                                    <Label className="text-sm text-muted-foreground">Description</Label>
                                    <p className="text-lg">{selectedTopic.description || "No description"}</p>
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
                            <DialogDescription>
                                Update the topic details.
                            </DialogDescription>
                        </DialogHeader>
                        <TopicEditForm
                            form={form}
                            onSubmit={onSubmit}
                            onCancel={handleEditCancel}
                        />
                    </DialogContent>
                </Dialog>
            </CardContent>
        </Card>
    );
}
