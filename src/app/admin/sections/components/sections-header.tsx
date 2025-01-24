"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { sectionsApi } from "@/lib/api/sections";
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

const sectionSchema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters").max(50, "Title must be less than 50 characters"),
    durationMinutes: z.coerce.number().min(1, "Duration must be at least 1 minute").max(240, "Duration cannot exceed 240 minutes"),
});

type SectionFormValues = z.infer<typeof sectionSchema>;

export function SectionsHeader() {
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const router = useRouter();

    const form = useForm<SectionFormValues>({
        resolver: zodResolver(sectionSchema),
        defaultValues: {
            title: "",
            durationMinutes: 60,
        },
    });

    const onSubmit = async (data: SectionFormValues) => {
        try {
            await sectionsApi.createSection(data);
            setIsAddDialogOpen(false);
            form.reset();
            router.refresh();
        } catch (error) {
            console.error('Failed to create section:', error);
        }
    };

    return (
        <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">Sections Management</h1>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                    <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Section
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add New Section</DialogTitle>
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
                                            <Input placeholder="e.g., Mathematics Part 1" {...field} />
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
                                    setIsAddDialogOpen(false);
                                    form.reset();
                                }}>
                                    Cancel
                                </Button>
                                <Button type="submit">
                                    Add Section
                                </Button>
                            </div>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </div>
    );
}