"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { TestPackageDto, testsApi, TestStatus, TestType } from "@/lib/api/tests";
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

const testSchema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters").max(100, "Title must be less than 100 characters"),
    description: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    status: z.enum(["ACTIVE", "IN_ACTIVE"]),
    testType: z.enum(["FREE", "PAID"]),
});

type TestFormValues = z.infer<typeof testSchema>;

interface TestFormProps {
    form: ReturnType<typeof useForm<TestFormValues>>;
    onSubmit: (data: TestFormValues) => Promise<void>;
    onCancel: () => void;
    isEdit: boolean;
}

function TestForm({ form, onSubmit, onCancel, isEdit }: TestFormProps) {
    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Test Title</FormLabel>
                            <FormControl>
                                <Input placeholder="e.g., ORT 2024 Variant 1" {...field} />
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
                                    placeholder="Enter test description..."
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
                        name="testType"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Test Type</FormLabel>
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
                                        <SelectItem value="FREE">Free</SelectItem>
                                        <SelectItem value="PAID">Paid</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="status"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Status</FormLabel>
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
                                        <SelectItem value="ACTIVE">Active</SelectItem>
                                        <SelectItem value="IN_ACTIVE">Inactive</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="startDate"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Start Date (Optional)</FormLabel>
                                <FormControl>
                                    <Input type="date" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="endDate"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>End Date (Optional)</FormLabel>
                                <FormControl>
                                    <Input type="date" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <div className="flex justify-end gap-3">
                    <Button variant="outline" type="button" onClick={onCancel}>
                        Cancel
                    </Button>
                    <Button type="submit">
                        {isEdit ? "Save Changes" : "Add Test"}
                    </Button>
                </div>
            </form>
        </Form>
    );
}

interface TestsHeaderProps {
    test?: TestPackageDto;
    onClose?: () => void;
}

export function TestsHeader({ test, onClose }: TestsHeaderProps) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const router = useRouter();

    const form = useForm<TestFormValues>({
        resolver: zodResolver(testSchema),
        defaultValues: test ? {
            title: test.title,
            description: test.description || "",
            startDate: test.startDate || "",
            endDate: test.endDate || "",
            status: test.status,
            testType: test.testType,
        } : {
            title: "",
            description: "",
            startDate: "",
            endDate: "",
            status: "IN_ACTIVE",
            testType: "FREE",
        },
    });

    const onSubmit = async (data: TestFormValues) => {
        try {
            const payload = {
                title: data.title,
                description: data.description || undefined,
                status: data.status as TestStatus,
                testType: data.testType as TestType,
                startDate: data.startDate || undefined,
                endDate: data.endDate || undefined,
            };

            if (test) {
                await testsApi.updateTest(test.id, payload);
            } else {
                await testsApi.createTest(payload);
            }
            setIsDialogOpen(false);
            form.reset();
            if (onClose) {
                onClose();
            }
            router.refresh();
        } catch (error) {
            console.error('Failed to handle test:', error);
        }
    };

    const handleCancel = () => {
        if (test) {
            onClose?.();
        } else {
            setIsDialogOpen(false);
            form.reset();
        }
    };

    if (test) {
        return (
            <TestForm
                form={form}
                onSubmit={onSubmit}
                onCancel={handleCancel}
                isEdit={true}
            />
        );
    }

    return (
        <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">Tests Management</h1>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                    <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Test
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add New Test</DialogTitle>
                        <DialogDescription>Create a new test package with details and settings</DialogDescription>
                    </DialogHeader>
                    <TestForm
                        form={form}
                        onSubmit={onSubmit}
                        onCancel={handleCancel}
                        isEdit={false}
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
}
