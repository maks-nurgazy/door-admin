"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Upload, Check } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface QuestionsHeaderProps {
    sections: { id: number; title: string; }[];
    topics: { id: number; title: string; }[];
}

const questionSchema = z.object({
    text: z.string().min(3, "Question text must be at least 3 characters"),
    type: z.enum(["TEXT", "IMAGE"]),
    options: z.array(z.object({
        key: z.number(),
        text: z.string().min(1, "Option text is required")
    })).min(2, "At least 2 options are required"),
    answerKey: z.number().min(1, "Correct answer is required"),
    imageUrl: z.string().optional(),
    topicIds: z.array(z.number()).min(1, "At least one topic is required")
});

type QuestionFormValues = z.infer<typeof questionSchema>;

export function QuestionsHeader({ sections, topics }: QuestionsHeaderProps) {
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [selectedTopics, setSelectedTopics] = useState<number[]>([]);
    const [isTopicsOpen, setIsTopicsOpen] = useState(false);
    const [topicSearch, setTopicSearch] = useState("");
    const router = useRouter();

    const form = useForm<QuestionFormValues>({
        resolver: zodResolver(questionSchema),
        defaultValues: {
            text: "",
            type: "TEXT",
            options: [
                { key: 1, text: "" },
                { key: 2, text: "" },
                { key: 3, text: "" },
                { key: 4, text: "" }
            ],
            topicIds: [],
        },
    });

    // Update form value when selectedTopics changes
    useEffect(() => {
        form.setValue('topicIds', selectedTopics, { shouldValidate: true });
    }, [selectedTopics, form]);

    const onSubmit = async (data: QuestionFormValues) => {
        try {
            await questionsApi.createQuestion({
                ...data,
                topicIds: selectedTopics
            });
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

    const filteredTopics = topics.filter(topic =>
        topic.title.toLowerCase().includes(topicSearch.toLowerCase())
    );

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

                                <FormField
                                    control={form.control}
                                    name="topicIds"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Topics</FormLabel>
                                            <div className="relative">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    role="combobox"
                                                    aria-expanded={isTopicsOpen}
                                                    className="w-full justify-between"
                                                    onClick={() => setIsTopicsOpen(!isTopicsOpen)}
                                                >
                          <span className={selectedTopics.length === 0 ? "text-muted-foreground" : undefined}>
                            {selectedTopics.length > 0
                                ? `${selectedTopics.length} topic${selectedTopics.length === 1 ? "" : "s"} selected`
                                : "Select topics"}
                          </span>
                                                    <Plus className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                </Button>
                                                {isTopicsOpen && (
                                                    <div className="absolute z-10 w-full mt-2 rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in">
                                                        <div className="p-2">
                                                            <Input
                                                                placeholder="Search topics..."
                                                                value={topicSearch}
                                                                onChange={(e) => setTopicSearch(e.target.value)}
                                                                className="h-8"
                                                            />
                                                        </div>
                                                        <ScrollArea className="h-[200px]">
                                                            <div className="p-2">
                                                                {filteredTopics.length === 0 ? (
                                                                    <p className="text-sm text-center py-6 text-muted-foreground">
                                                                        No topics found
                                                                    </p>
                                                                ) : (
                                                                    filteredTopics.map((topic) => (
                                                                        <div
                                                                            key={topic.id}
                                                                            className={cn(
                                                                                "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
                                                                                selectedTopics.includes(topic.id) && "bg-accent"
                                                                            )}
                                                                            onClick={() => toggleTopic(topic.id)}
                                                                        >
                                                                            <Check
                                                                                className={cn(
                                                                                    "mr-2 h-4 w-4",
                                                                                    selectedTopics.includes(topic.id) ? "opacity-100" : "opacity-0"
                                                                                )}
                                                                            />
                                                                            <span>{topic.title}</span>
                                                                        </div>
                                                                    ))
                                                                )}
                                                            </div>
                                                        </ScrollArea>
                                                    </div>
                                                )}
                                            </div>
                                            {selectedTopics.length > 0 && (
                                                <div className="flex gap-1 flex-wrap mt-2">
                                                    {selectedTopics.map((topicId) => {
                                                        const topic = topics.find((t) => t.id === topicId);
                                                        return topic ? (
                                                            <Badge
                                                                key={topic.id}
                                                                variant="secondary"
                                                                className="mr-1"
                                                            >
                                                                {topic.title}
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-4 w-4 ml-1 hover:bg-transparent"
                                                                    onClick={() => toggleTopic(topic.id)}
                                                                >
                                                                    <Plus className="h-3 w-3 rotate-45" />
                                                                </Button>
                                                            </Badge>
                                                        ) : null;
                                                    })}
                                                </div>
                                            )}
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="space-y-2">
                                    <Label>Options</Label>
                                    <div className="grid grid-cols-2 gap-4">
                                        {form.watch("options").map((_, index) => (
                                            <FormField
                                                key={index}
                                                control={form.control}
                                                name={`options.${index}.text`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormControl>
                                                            <div className="flex gap-2">
                                <span className="py-2 w-6">
                                  {String.fromCharCode(65 + index)}
                                </span>
                                                                <Input {...field} />
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
                                                value={field.value?.toString()}
                                                onValueChange={(value) => field.onChange(parseInt(value))}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {form.watch("options")
                                                        .map((option, index) => ({
                                                            key: index + 1,
                                                            text: option.text
                                                        }))
                                                        .filter(option => option.text.trim() !== '')
                                                        .map((option) => (
                                                            <SelectItem key={option.key} value={option.key.toString()}>
                                                                {`${String.fromCharCode(64 + option.key)}: ${option.text}`}
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