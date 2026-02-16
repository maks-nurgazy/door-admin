"use client";

import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { getSession } from "next-auth/react";
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
import { Badge } from "@/components/ui/badge";
import { FileText, Upload, X } from "lucide-react";
import { CreateReadingPassageDto, ReadingPassage } from "@/lib/api/reading-passages";
import { fileUploadApi } from "@/lib/api/file-upload";

const passageSchema = z.object({
    title: z.string().min(1, "Title is required").max(255),
    description: z.string().optional(),
    passageText: z.string().optional(),
    passageFileUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
}).refine(
    (d) => (d.passageText && d.passageText.trim().length > 0) || (d.passageFileUrl && d.passageFileUrl.trim().length > 0),
    { message: "Provide either passage text or a PDF file", path: ["passageText"] }
);

type PassageFormValues = z.infer<typeof passageSchema>;

interface PassageFormProps {
    passage?: ReadingPassage;
    onSubmit: (data: CreateReadingPassageDto) => Promise<void>;
    onCancel: () => void;
    saving: boolean;
}

export function PassageForm({ passage, onSubmit, onCancel, saving }: PassageFormProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);
    const [uploadedFileName, setUploadedFileName] = useState<string>(
        passage?.passageFileUrl ? "Current file" : ""
    );
    const [uploadError, setUploadError] = useState<string>("");

    const form = useForm<PassageFormValues>({
        resolver: zodResolver(passageSchema),
        defaultValues: {
            title: passage?.title ?? "",
            description: passage?.description ?? "",
            passageText: passage?.passageText ?? "",
            passageFileUrl: passage?.passageFileUrl ?? "",
        },
    });

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadError("");

        const validation = fileUploadApi.validateFile(file, 10, ["application/pdf"]);
        if (!validation.valid) {
            setUploadError(validation.error ?? "Invalid file");
            e.target.value = "";
            return;
        }

        setUploading(true);
        try {
            const session = await getSession();
            const token = session?.accessToken ?? "";
            const userId = session?.user?.id;

            const fileUrl = await fileUploadApi.uploadPassagePdf(file, token, userId);

            form.setValue("passageFileUrl", fileUrl, { shouldValidate: true });
            setUploadedFileName(file.name);
        } catch (err) {
            setUploadError(err instanceof Error ? err.message : "Upload failed");
            e.target.value = "";
        } finally {
            setUploading(false);
        }
    };

    const handleClearFile = () => {
        form.setValue("passageFileUrl", "", { shouldValidate: true });
        setUploadedFileName("");
        setUploadError("");
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleSubmit = async (data: PassageFormValues) => {
        const payload: CreateReadingPassageDto = {
            title: data.title.trim(),
        };
        if (data.description && data.description.trim()) {
            payload.description = data.description.trim();
        }
        if (data.passageText && data.passageText.trim()) {
            payload.passageText = data.passageText.trim();
        }
        if (data.passageFileUrl && data.passageFileUrl.trim()) {
            payload.passageFileUrl = data.passageFileUrl.trim();
        }
        await onSubmit(payload);
    };

    const currentFileUrl = form.watch("passageFileUrl");

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

                {/* PDF Upload */}
                <FormField
                    control={form.control}
                    name="passageFileUrl"
                    render={() => (
                        <FormItem>
                            <FormLabel>PDF File (Optional — use instead of text)</FormLabel>

                            {/* Hidden input stores the resolved URL */}
                            <input type="hidden" {...form.register("passageFileUrl")} />

                            {currentFileUrl ? (
                                <div className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm">
                                    <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                                    <span className="flex-1 truncate font-medium">{uploadedFileName || "Uploaded file"}</span>
                                    <a
                                        href={currentFileUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="shrink-0 text-xs text-primary underline"
                                    >
                                        View
                                    </a>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="h-5 w-5 shrink-0"
                                        onClick={handleClearFile}
                                    >
                                        <X className="h-3 w-3" />
                                    </Button>
                                </div>
                            ) : (
                                <FormControl>
                                    <div className="flex items-center gap-2">
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="application/pdf"
                                            className="hidden"
                                            onChange={handleFileChange}
                                            disabled={uploading}
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="gap-2"
                                            disabled={uploading}
                                            onClick={() => fileInputRef.current?.click()}
                                        >
                                            <Upload className="h-4 w-4" />
                                            {uploading ? "Uploading..." : "Choose PDF"}
                                        </Button>
                                        {uploading && (
                                            <Badge variant="secondary" className="animate-pulse">
                                                Uploading...
                                            </Badge>
                                        )}
                                    </div>
                                </FormControl>
                            )}

                            {uploadError && (
                                <p className="text-sm font-medium text-destructive">{uploadError}</p>
                            )}
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex justify-end gap-3 pt-2">
                    <Button type="button" variant="outline" onClick={onCancel} disabled={saving || uploading}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={saving || uploading}>
                        {saving ? "Saving..." : (passage ? "Save Changes" : "Create Passage")}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
