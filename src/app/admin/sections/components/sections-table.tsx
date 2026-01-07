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
import { Pencil, Trash2, Eye } from "lucide-react";
import { SectionTemplateListDto, SectionTemplatesResponse, sectionTemplatesApi } from "@/lib/api/section-templates";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Dialog,
    DialogContent,
    DialogDescription,
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
    FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

const sectionTemplateSchema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters").max(50, "Title must be less than 50 characters"),
    description: z.string().max(500, "Description must be less than 500 characters").optional(),
    durationMinutes: z.coerce.number().min(1, "Duration must be at least 1 minute").max(240, "Duration cannot exceed 240 minutes"),
    displayOrder: z.coerce.number().min(1, "Display order must be at least 1").max(10, "Display order cannot exceed 10").optional(),
    shuffleQuestions: z.boolean().optional(),
    numberOfQuestions: z.coerce.number().min(0, "Number of questions must be at least 0").optional(),
});

type SectionTemplateFormValues = z.infer<typeof sectionTemplateSchema>;

interface SectionsTableProps {
    initialData: SectionTemplatesResponse;
}

export function SectionsTable({ initialData }: SectionsTableProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isLoading, setIsLoading] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState<SectionTemplateListDto | null>(null);

    const currentPage = searchParams.get("page")
        ? parseInt(searchParams.get("page")!) - 1
        : 0;

    const form = useForm<SectionTemplateFormValues>({
        resolver: zodResolver(sectionTemplateSchema),
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

    const handleView = async (template: SectionTemplateListDto) => {
        try {
            const fullTemplate = await sectionTemplatesApi.getSectionTemplate(template.id);
            setSelectedTemplate(fullTemplate);
            setIsViewDialogOpen(true);
        } catch (error) {
            console.error('Failed to fetch template details:', error);
        }
    };

    const handleEdit = async (template: SectionTemplateListDto) => {
        try {
            const fullTemplate = await sectionTemplatesApi.getSectionTemplate(template.id);
            setSelectedTemplate(fullTemplate);
            form.reset({
                title: fullTemplate.title,
                description: fullTemplate.description || "",
                durationMinutes: fullTemplate.durationMinutes,
                displayOrder: fullTemplate.displayOrder,
                shuffleQuestions: fullTemplate.shuffleQuestions,
                numberOfQuestions: fullTemplate.numberOfQuestions,
            });
            setIsEditDialogOpen(true);
        } catch (error) {
            console.error('Failed to fetch template details:', error);
        }
    };

    const handleDelete = async (id: number) => {
        if (confirm("Are you sure you want to delete this section template? This will not affect sections already created for existing tests.")) {
            try {
                await sectionTemplatesApi.deleteSectionTemplate(id);
                router.refresh();
            } catch (error) {
                console.error('Failed to delete section template:', error);
            }
        }
    };

    const onSubmit = async (data: SectionTemplateFormValues) => {
        if (!selectedTemplate) return;

        try {
            await sectionTemplatesApi.updateSectionTemplate(selectedTemplate.id, data);
            setIsEditDialogOpen(false);
            setSelectedTemplate(null);
            form.reset();
            router.refresh();
        } catch (error) {
            console.error('Failed to update section template:', error);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Section Templates Overview</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[60px]">Order</TableHead>
                            <TableHead>Title</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Duration</TableHead>
                            <TableHead>Questions</TableHead>
                            <TableHead className="w-[100px]">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            Array.from({ length: 5 }).map((_, index) => (
                                <TableRow key={index}>
                                    <TableCell><Skeleton className="h-4 w-[40px]" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-[200px]" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-[60px]" /></TableCell>
                                    <TableCell>
                                        <div className="flex gap-2">
                                            <Skeleton className="h-8 w-8 rounded-md" />
                                            <Skeleton className="h-8 w-8 rounded-md" />
                                            <Skeleton className="h-8 w-8 rounded-md" />
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : initialData.data.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                    No section templates found. Create your first template to get started.
                                </TableCell>
                            </TableRow>
                        ) : (
                            initialData.data.map((template) => (
                                <TableRow key={template.id}>
                                    <TableCell>
                                        <Badge variant="outline">{template.displayOrder}</Badge>
                                    </TableCell>
                                    <TableCell className="font-medium">{template.title}</TableCell>
                                    <TableCell className="max-w-[200px] truncate">
                                        {template.description || <span className="text-muted-foreground">-</span>}
                                    </TableCell>
                                    <TableCell>{template.durationMinutes} min</TableCell>
                                    <TableCell>{template.numberOfQuestions}</TableCell>
                                    <TableCell>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleView(template)}
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleEdit(template)}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDelete(template.id)}
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

                {/* View Template Details Dialog */}
                <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Section Template Details</DialogTitle>
                            <DialogDescription>
                                View the details of this section template.
                            </DialogDescription>
                        </DialogHeader>
                        {selectedTemplate && (
                            <div className="space-y-4">
                                <div>
                                    <Label className="text-sm text-muted-foreground">Title</Label>
                                    <p className="text-lg font-medium">{selectedTemplate.title}</p>
                                </div>
                                {selectedTemplate.description && (
                                    <div>
                                        <Label className="text-sm text-muted-foreground">Description</Label>
                                        <p className="text-base">{selectedTemplate.description}</p>
                                    </div>
                                )}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-sm text-muted-foreground">Duration</Label>
                                        <p className="text-lg font-medium">{selectedTemplate.durationMinutes} minutes</p>
                                    </div>
                                    <div>
                                        <Label className="text-sm text-muted-foreground">Display Order</Label>
                                        <p className="text-lg font-medium">{selectedTemplate.displayOrder}</p>
                                    </div>
                                </div>
                                <div>
                                    <Label className="text-sm text-muted-foreground">Expected Questions</Label>
                                    <p className="text-lg font-medium">{selectedTemplate.numberOfQuestions}</p>
                                </div>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>

                {/* Edit Template Dialog */}
                <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                    <DialogContent className="max-w-lg">
                        <DialogHeader>
                            <DialogTitle>Edit Section Template</DialogTitle>
                            <DialogDescription>
                                Update the section template. Changes will only affect new tests created after this update.
                            </DialogDescription>
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
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Description (Optional)</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    className="resize-none"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <div className="grid grid-cols-2 gap-4">
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
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="numberOfQuestions"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Expected Questions</FormLabel>
                                                <FormControl>
                                                    <Input type="number" {...field} />
                                                </FormControl>
                                                <FormDescription>
                                                    Number of questions per section
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="shuffleQuestions"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-col">
                                                <FormLabel>Shuffle Questions</FormLabel>
                                                <FormControl>
                                                    <Switch
                                                        checked={field.value}
                                                        onCheckedChange={field.onChange}
                                                    />
                                                </FormControl>
                                                <FormDescription>
                                                    Randomize question order
                                                </FormDescription>
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <div className="flex justify-end gap-3">
                                    <Button variant="outline" type="button" onClick={() => {
                                        setIsEditDialogOpen(false);
                                        setSelectedTemplate(null);
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
