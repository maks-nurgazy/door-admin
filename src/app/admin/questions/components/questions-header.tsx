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

    const onSubmit = async (data: QuestionFormValues) => {
        try {
            await questionsApi.createQuestion(data);
            setIsAddDialogOpen(false);
            form.reset();
            router.refresh();
        } catch (error) {
            console.error('Failed to create question:', error);
        }
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

                                <FormField
                                    control={form.control}
                                    name="topicIds"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Topics</FormLabel>
                                            <Select
                                                value={field.value.toString()}
                                                onValueChange={(value) => field.onChange([parseInt(value)])}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {topics.map((topic) => (
                                                        <SelectItem key={topic.id} value={topic.id.toString()}>
                                                            {topic.title}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
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