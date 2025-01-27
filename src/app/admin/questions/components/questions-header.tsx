"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Upload } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { questionsApi } from "@/lib/api/questions";
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
import { Section } from "@/lib/api/sections";
import { Topic } from "@/lib/api/topics";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";

const questionSchema = z.object({
    text: z.string().min(3, "Question text must be at least 3 characters"),
    type: z.enum(["TEXT", "IMAGE"]),
    options: z.array(z.string()).min(4, "All 4 options are required"),
    answerKey: z.number().min(1).max(4),
    imageUrl: z.string().nullable().optional(),
    topicIds: z.array(z.number()).min(1, "At least one topic is required"),
});

type QuestionFormValues = z.infer<typeof questionSchema>;

interface QuestionsHeaderProps {
    sections: Section[];
    topics: Topic[];
}

export function QuestionsHeader({ sections, topics }: QuestionsHeaderProps) {
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [selectedTopics, setSelectedTopics] = useState<number[]>([]);
    const router = useRouter();

    const form = useForm<QuestionFormValues>({
        resolver: zodResolver(questionSchema),
        defaultValues: {
            text: "",
            type: "TEXT",
            options: ["", "", "", ""],
            answerKey: 1,
            imageUrl: null,
            topicIds: [],
        },
    });

    const onSubmit = async (data: QuestionFormValues) => {
        try {
            // Transform options array into required format with keys
            const formattedOptions = data.options.map((text, index) => ({
                key: index + 1,
                text: text.trim()
            }));

            const questionData = {
                text: data.text,
                type: data.type,
                options: formattedOptions,
                answerKey: data.answerKey,
                imageUrl: data.type === "IMAGE" ? data.imageUrl : null,
                topicIds: selectedTopics,
            };

            await questionsApi.createQuestion(questionData);
            setIsAddDialogOpen(false);
            form.reset();
            setSelectedTopics([]);
            router.refresh();
        } catch (error) {
            console.error('Failed to create question:', error);
        }
    };

    const toggleTopic = (topicId: number) => {
        setSelectedTopics(prev =>
            prev.includes(topicId)
                ? prev.filter(id => id !== topicId)
                : [...prev, topicId]
        );
    };

    return (
        <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">Questions Bank</h1>
            <div className="flex gap-3">
                <Button variant="outline">
                    <Upload className="h-4 w-4 mr-2" />
                    Import CSV
                </Button>
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Question
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Add New Question</DialogTitle>
                        </DialogHeader>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="text"
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
                                                onValueChange={field.onChange}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="TEXT">Text</SelectItem>
                                                    <SelectItem value="IMAGE">Image</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div>
                                    <Label>Topics</Label>
                                    <ScrollArea className="h-[200px] border rounded-md p-4 mt-2">
                                        <div className="space-y-2">
                                            {topics.map((topic) => (
                                                <div key={topic.id} className="flex items-center space-x-2">
                                                    <Checkbox
                                                        checked={selectedTopics.includes(topic.id)}
                                                        onCheckedChange={() => toggleTopic(topic.id)}
                                                    />
                                                    <Label className="text-sm font-normal">{topic.title}</Label>
                                                </div>
                                            ))}
                                        </div>
                                    </ScrollArea>
                                    {selectedTopics.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-2">
                                            {selectedTopics.map((topicId) => {
                                                const topic = topics.find(t => t.id === topicId);
                                                return topic ? (
                                                    <Badge key={topic.id} variant="secondary">
                                                        {topic.title}
                                                    </Badge>
                                                ) : null;
                                            })}
                                        </div>
                                    )}
                                    {form.formState.errors.topicIds && (
                                        <p className="text-sm font-medium text-destructive mt-2">
                                            {form.formState.errors.topicIds.message}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label>Options</Label>
                                    <div className="grid grid-cols-2 gap-4">
                                        {form.watch("options").map((_, index) => (
                                            <FormField
                                                key={index}
                                                control={form.control}
                                                name={`options.${index}`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormControl>
                                                            <div className="flex gap-2">
                                <span className="py-2 w-6">
                                  {String.fromCharCode(65 + index)}
                                </span>
                                                                <Input {...field} placeholder={`Option ${index + 1}`} />
                                                            </div>
                                                        </FormControl>
                                                    </FormItem>
                                                )}
                                            />
                                        ))}
                                    </div>
                                </div>

                                <FormField
                                    control={form.control}
                                    name="answerKey"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Correct Answer</FormLabel>
                                            <Select
                                                value={field.value.toString()}
                                                onValueChange={(value) => field.onChange(parseInt(value))}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {form.watch("options").map((option, index) => (
                                                        <SelectItem key={index + 1} value={(index + 1).toString()}>
                                                            {`${String.fromCharCode(65 + index)}: ${option || `Option ${index + 1}`}`}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {form.watch("type") === "IMAGE" && (
                                    <FormField
                                        control={form.control}
                                        name="imageUrl"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Image URL</FormLabel>
                                                <FormControl>
                                                    <Input {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                )}

                                <div className="flex justify-end gap-3">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => {
                                            setIsAddDialogOpen(false);
                                            form.reset();
                                            setSelectedTopics([]);
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                    <Button type="submit">
                                        Add Question
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}