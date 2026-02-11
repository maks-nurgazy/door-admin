"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { sectionTemplatesApi } from "@/lib/api/section-templates";
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
    FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

const MAX_SECTION_TEMPLATES = 10;

const sectionTemplateSchema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters").max(50, "Title must be less than 50 characters"),
    titleKg: z.string().max(50, "Title must be less than 50 characters").optional(),
    description: z.string().max(500, "Description must be less than 500 characters").optional(),
    durationMinutes: z.coerce.number().min(1, "Duration must be at least 1 minute").max(240, "Duration cannot exceed 240 minutes"),
    displayOrder: z.coerce.number().min(1, "Display order must be at least 1").max(10, "Display order cannot exceed 10").optional(),
    questionCount: z.coerce.number().min(0, "Number of questions must be at least 0").optional(),
});

type SectionTemplateFormValues = z.infer<typeof sectionTemplateSchema>;

interface SectionsHeaderProps {
    currentCount: number;
}

export function SectionsHeader({ currentCount }: SectionsHeaderProps) {
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const router = useRouter();

    const form = useForm<SectionTemplateFormValues>({
        resolver: zodResolver(sectionTemplateSchema),
        defaultValues: {
            title: "",
            titleKg: "",
            description: "",
            durationMinutes: 60,
            displayOrder: currentCount + 1,
            questionCount: 0,
        },
    });

    const onSubmit = async (data: SectionTemplateFormValues) => {
        try {
            await sectionTemplatesApi.createSectionTemplate(data);
            setIsAddDialogOpen(false);
            form.reset();
            router.refresh();
        } catch (error) {
            console.error("Failed to create section template:", error);
        }
    };

    const isMaxReached = currentCount >= MAX_SECTION_TEMPLATES;

    return (
        <div className="flex justify-between items-center">
            <div>
                <h1 className="text-3xl font-bold">Section Templates</h1>
                <p className="text-muted-foreground mt-1">
                    Predefined sections that will be automatically created for each new test
                </p>
                <Badge variant={isMaxReached ? "destructive" : "secondary"} className="mt-2">
                    {currentCount} / {MAX_SECTION_TEMPLATES} templates
                </Badge>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                    <Button disabled={isMaxReached}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Template
                    </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Add New Section Template</DialogTitle>
                        <DialogDescription>
                            Create a predefined section template. When a test is created, sections will be automatically generated from all templates.
                        </DialogDescription>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="title"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Title (RU)</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g., Математика" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="titleKg"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Title (KG)</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g., Математика" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Description (Optional)</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Brief description of this section..."
                                                className="resize-none"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="grid grid-cols-3 gap-4">
                                <FormField
                                    control={form.control}
                                    name="durationMinutes"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Duration (min)</FormLabel>
                                            <FormControl>
                                                <Input type="number" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="displayOrder"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Display Order</FormLabel>
                                            <FormControl>
                                                <Input type="number" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="questionCount"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Questions</FormLabel>
                                            <FormControl>
                                                <Input type="number" {...field} />
                                            </FormControl>
                                            <FormDescription>Per section</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div className="flex justify-end gap-3">
                                <Button variant="outline" type="button" onClick={() => {
                                    setIsAddDialogOpen(false);
                                    form.reset();
                                }}>
                                    Cancel
                                </Button>
                                <Button type="submit">Add Template</Button>
                            </div>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
