"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Calendar } from "lucide-react";
import { UserTestAccess, UserTestAccessResponse, userTestAccessApi } from "@/lib/api/user-test-access";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDateBeautiful } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

interface UserTestAccessTableProps {
    initialData: UserTestAccessResponse;
    onSuccess?: () => void;
}

export function UserTestAccessTable({ initialData, onSuccess }: UserTestAccessTableProps) {
    const [accessData, setAccessData] = useState(initialData);
    const [isLoading, setIsLoading] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedAccess, setSelectedAccess] = useState<UserTestAccess | null>(null);

    const refreshData = async () => {
        setIsLoading(true);
        try {
            const updatedData = await userTestAccessApi.getAllAccess(0, 10);
            setAccessData(updatedData);
        } catch (error) {
            console.error('Failed to refresh access data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = (access: UserTestAccess) => {
        setSelectedAccess(access);
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!selectedAccess) return;

        try {
            await userTestAccessApi.revokeAccess(selectedAccess.userId, selectedAccess.testId);
            setIsDeleteDialogOpen(false);
            setSelectedAccess(null);
            toast({
                title: "Success",
                description: "Access revoked successfully!",
            });
            onSuccess?.();
        } catch (error) {
            console.error('Failed to revoke access:', error);
            toast({
                title: "Error",
                description: "Failed to revoke access",
                variant: "destructive",
            });
        }
    };

    // Update local state when initialData changes
    useEffect(() => {
        setAccessData(initialData);
    }, [initialData]);

    return (
        <Card>
            <CardHeader>
                <CardTitle>User Test Access Records</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead>Test</TableHead>
                            <TableHead>Granted At</TableHead>
                            <TableHead>Granted By</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            Array.from({ length: 5 }).map((_, index) => (
                                <TableRow key={index}>
                                    <TableCell><Skeleton className="h-4 w-[200px]" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                                    <TableCell><Skeleton className="h-8 w-8 rounded-md" /></TableCell>
                                </TableRow>
                            ))
                        ) : (
                            accessData.data.map((access) => (
                                <TableRow key={access.id}>
                                    <TableCell>
                                        <div>
                                            <div className="font-medium">{access.userName}</div>
                                            <div className="text-sm text-muted-foreground">{access.userEmail}</div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-medium">{access.testTitle}</TableCell>
                                    <TableCell>
                                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                                            <Calendar className="h-3 w-3" />
                                            {formatDateBeautiful(access.grantedAt)}
                                        </div>
                                    </TableCell>
                                    <TableCell>{access.grantedBy || "System"}</TableCell>
                                    <TableCell>
                                        <Badge variant={access.isActive ? "default" : "secondary"}>
                                            {access.isActive ? "Active" : "Inactive"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDelete(access)}
                                                className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                                disabled={!access.isActive}
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

                {accessData.totalPages > 1 && (
                    <div className="flex justify-center gap-2 mt-4">
                        <span className="py-2 px-4">
                            Showing {accessData.data.length} of {accessData.totalItems} records
                        </span>
                    </div>
                )}

                <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Revoke Test Access</AlertDialogTitle>
                            <div className="text-sm text-muted-foreground">
                                Are you sure you want to revoke this user's access to the test? This action cannot be undone.
                            </div>
                        </AlertDialogHeader>
                        {selectedAccess && (
                            <div className="mt-4 p-4 rounded-lg bg-muted">
                                <div className="text-sm font-medium">
                                    {selectedAccess.userName} → {selectedAccess.testTitle}
                                </div>
                                <div className="text-xs text-muted-foreground mt-1">
                                    Granted on {formatDateBeautiful(selectedAccess.grantedAt)}
                                </div>
                            </div>
                        )}
                        <AlertDialogFooter>
                            <AlertDialogCancel onClick={() => setSelectedAccess(null)}>
                                Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                                onClick={confirmDelete}
                                className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                            >
                                Revoke Access
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </CardContent>
        </Card>
    );
}
