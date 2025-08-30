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
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useState, useEffect } from "react";
import { userTestAccessApi, UserTestAccessCreate } from "@/lib/api/user-test-access";
import { usersApi } from "@/lib/api/users";
import { testsApi } from "@/lib/api/tests";
import { toast } from "@/hooks/use-toast";

const accessSchema = z.object({
    userId: z.number().min(1, "User is required"),
    testId: z.number().min(1, "Test is required"),
});

type AccessFormValues = z.infer<typeof accessSchema>;

interface UserTestAccessFormProps {
    onSuccess?: () => void;
    onCancel?: () => void;
}

export function UserTestAccessForm({ onSuccess, onCancel }: UserTestAccessFormProps) {
    const [users, setUsers] = useState<any[]>([]);
    const [tests, setTests] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<AccessFormValues>({
        resolver: zodResolver(accessSchema),
        defaultValues: {
            userId: 0,
            testId: 0,
        },
    });

    useEffect(() => {
        const loadData = async () => {
            try {
                const [usersData, testsData] = await Promise.all([
                    usersApi.getUsers(0, 100),
                    testsApi.getTests(0, 100)
                ]);
                setUsers(usersData.data);
                setTests(testsData.data);
            } catch (error) {
                console.error('Failed to load data:', error);
                toast({
                    title: "Error",
                    description: "Failed to load users and tests data",
                    variant: "destructive",
                });
            }
        };

        loadData();
    }, []);

    const handleSubmit = async (data: AccessFormValues) => {
        setIsLoading(true);
        try {
            const accessData: UserTestAccessCreate = {
                userId: data.userId,
                testId: data.testId,
                grantedBy: "Admin", // This would come from the current user context
            };

            await userTestAccessApi.grantAccess(accessData);
            
            toast({
                title: "Success",
                description: "Test access granted successfully!",
            });
            
            onSuccess?.();
        } catch (error) {
            console.error('Failed to grant access:', error);
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to grant access",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="userId"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>User</FormLabel>
                            <Select
                                value={field.value?.toString()}
                                onValueChange={(value) => field.onChange(parseInt(value))}
                            >
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a user" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {users.map((user) => (
                                        <SelectItem key={user.id} value={user.id.toString()}>
                                            {user.firstName} {user.lastName} ({user.email})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="testId"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Test</FormLabel>
                            <Select
                                value={field.value?.toString()}
                                onValueChange={(value) => field.onChange(parseInt(value))}
                            >
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a test" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {tests.map((test) => (
                                        <SelectItem key={test.id} value={test.id.toString()}>
                                            {test.title}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex justify-end gap-3">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onCancel}
                        disabled={isLoading}
                    >
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                        {isLoading ? "Granting..." : "Grant Access"}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
