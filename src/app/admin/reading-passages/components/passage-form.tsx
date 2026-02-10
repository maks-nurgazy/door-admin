"use client";

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
import { Button } from "@/components/ui/button";
import { CreateReadingPassageDto, ReadingPassage } from "@/lib/api/reading-passages";

const passageSchema = z.object({
    title: z.string().min(1, "Title is required").max(255),
    description: z.string().optional(),
    passageText: z.string().optional(),
    passageFileUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
}).refine(
    (d) => (d.passageText && d.passageText.trim().length > 0) || (d.passageFileUrl && d.passageFileUrl.trim().length > 0),
    { message: "Provide either passage text or a file URL", path: ["passageText"] }
);

type PassageFormValues = z.infer<typeof passageSchema>;

interface PassageFormProps {
    passage?: ReadingPassage;
    onSubmit: (data: CreateReadingPassageDto) => Promise<void>;
    onCancel: () => void;
    saving: boolean;
}

export function PassageForm({ passage, onSubmit, onCancel, saving }: PassageFormProps) {
    const form = useForm<PassageFormValues>({
        resolver: zodResolver(passageSchema),
        defaultValues: {
            title: passage?.title ?? "",
            description: passage?.description ?? "",
            passageText: passage?.passageText ?? "",
            passageFileUrl: passage?.passageFileUrl ?? "",
        },
    });

    const handleSubmit = async (data: PassageFormValues) => {
        await onSubmit({
            title: data.title,
            description: data.description || undefined,
            passageText: data.passageText || undefined,
            passageFileUrl: data.passageFileUrl || undefined,
        });
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Title</FormLabel>
                            <FormControl>
                                <Input {...field} placeholder="Passage title..." />
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
                                <Input {...field} placeholder="Short description..." />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="passageText"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Passage Text</FormLabel>
                            <FormControl>
                                <Textarea
                                    {...field}
                                    rows={8}
                                    placeholder="Enter the reading passage text here..."
                                    className="font-mono text-sm"
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="passageFileUrl"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>File URL (Optional — use instead of text)</FormLabel>
                            <FormControl>
                                <Input {...field} placeholder="https://..." />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex justify-end gap-3 pt-2">
                    <Button type="button" variant="outline" onClick={onCancel} disabled={saving}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={saving}>
                        {saving ? "Saving..." : (passage ? "Save Changes" : "Create Passage")}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
