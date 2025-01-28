"use client";

import { useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Pencil, Trash2, Eye, ListPlus } from "lucide-react";
import { Test, TestSection, TestsResponse, testsApi } from "@/lib/api/tests";
import { sectionsApi } from "@/lib/api/sections";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { TestsHeader } from "./tests-header";
import { format } from "date-fns";

interface TestsTableProps {
    initialData: TestsResponse;
}

export function TestsTable({ initialData }: TestsTableProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isLoading, setIsLoading] = useState(false);
    const [selectedTest, setSelectedTest] = useState<Test | null>(null);
    const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isSectionsDialogOpen, setIsSectionsDialogOpen] = useState(false);
    const [allSections, setAllSections] = useState<TestSection[]>([]);
    const [testSections, setTestSections] = useState<TestSection[]>([]);
    const [selectedSections, setSelectedSections] = useState<number[]>([]);
    const [isLoadingSections, setIsLoadingSections] = useState(false);

    const currentPage = searchParams.get("page")
        ? parseInt(searchParams.get("page")!) - 1
        : 0;

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

    const handleDelete = async (id: number) => {
        if (confirm("Are you sure you want to delete this test?")) {
            try {
                await testsApi.deleteTest(id);
                router.refresh();
            } catch (error) {
                console.error('Failed to delete test:', error);
            }
        }
    };

    const handleView = (test: Test) => {
        setSelectedTest(test);
        setIsViewDialogOpen(true);
    };

    const handleEdit = (test: Test) => {
        setSelectedTest(test);
        setIsEditDialogOpen(true);
    };

    const handleAssignSections = async (test: Test) => {
        setSelectedTest(test);
        setIsLoadingSections(true);
        try {
            const [allSectionsData, testSectionsData] = await Promise.all([
                sectionsApi.getAllSections(),
                testsApi.getTestSections(test.id)
            ]);

            setAllSections(allSectionsData);
            setTestSections(testSectionsData);
            setSelectedSections(testSectionsData.map(s => s.id));
            setIsSectionsDialogOpen(true);
        } catch (error) {
            console.error('Failed to load sections:', error);
        } finally {
            setIsLoadingSections(false);
        }
    };

    const toggleSectionSelection = (sectionId: number) => {
        setSelectedSections(prev =>
            prev.includes(sectionId)
                ? prev.filter(id => id !== sectionId)
                : [...prev, sectionId]
        );
    };

    const handleSaveSections = async () => {
        if (!selectedTest) return;

        try {
            const currentSections = testSections.map(s => s.id);

            // Determine which sections to assign and which to remove
            const sectionsToAssign = selectedSections.filter(id => !currentSections.includes(id));
            const sectionsToRemove = currentSections.filter(id => !selectedSections.includes(id));

            // Update sections in sequence
            if (sectionsToAssign.length > 0) {
                await testsApi.updateTestSections(selectedTest.id, sectionsToAssign, 'assign');
            }

            if (sectionsToRemove.length > 0) {
                await testsApi.updateTestSections(selectedTest.id, sectionsToRemove, 'remove');
            }

            setIsSectionsDialogOpen(false);
            setSelectedTest(null);
            setSelectedSections([]);
            router.refresh();
        } catch (error) {
            console.error('Failed to update sections:', error);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "ACTIVE":
                return <Badge className="bg-green-500">Active</Badge>;
            default:
                return <Badge variant="secondary">Inactive</Badge>;
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Tests Overview</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead>Duration</TableHead>
                            <TableHead>Questions</TableHead>
                            <TableHead>Frequency Limit</TableHead>
                            <TableHead>Date Range</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            Array.from({ length: 10 }).map((_, index) => (
                                <TableRow key={index}>
                                    <TableCell><Skeleton className="h-4 w-[200px]" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-[200px]" /></TableCell>
                                    <TableCell><Skeleton className="h-6 w-[80px]" /></TableCell>
                                    <TableCell>
                                        <div className="flex gap-2">
                                            <Skeleton className="h-8 w-8 rounded-md" />
                                            <Skeleton className="h-8 w-8 rounded-md" />
                                            <Skeleton className="h-8 w-8 rounded-md" />
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            initialData.data.map((test) => (
                                <TableRow key={test.id}>
                                    <TableCell className="font-medium">{test.title}</TableCell>
                                    <TableCell>{test.durationMinutes} min</TableCell>
                                    <TableCell>{test.questions}</TableCell>
                                    <TableCell>{test.attemptLimitPerWeek} per week</TableCell>
                                    <TableCell>
                                        <div className="text-sm">
                                            {format(new Date(test.createdAt), "MMM dd, yyyy")} - {format(new Date(test.endDate), "MMM dd, yyyy")}
                                        </div>
                                    </TableCell>
                                    <TableCell>{getStatusBadge(test.status)}</TableCell>
                                    <TableCell>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleView(test)}
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleAssignSections(test)}
                                            >
                                                <ListPlus className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleEdit(test)}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDelete(test.id)}
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

                {/* View Test Details Dialog */}
                <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Test Details</DialogTitle>
                        </DialogHeader>
                        {selectedTest && (
                            <div className="space-y-4">
                                <div>
                                    <Label className="text-sm text-muted-foreground">Title</Label>
                                    <p className="text-lg font-medium">{selectedTest.title}</p>
                                </div>
                                <div>
                                    <Label className="text-sm text-muted-foreground">Description</Label>
                                    <p className="text-lg">{selectedTest.description}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-sm text-muted-foreground">Duration</Label>
                                        <p className="text-lg font-medium">{selectedTest.durationMinutes} minutes</p>
                                    </div>
                                    <div>
                                        <Label className="text-sm text-muted-foreground">Questions</Label>
                                        <p className="text-lg font-medium">{selectedTest.questions}</p>
                                    </div>
                                </div>
                                <div>
                                    <Label className="text-sm text-muted-foreground">Weekly Attempt Limit</Label>
                                    <p className="text-lg font-medium">{selectedTest.attemptLimitPerWeek} attempts</p>
                                </div>
                                <div>
                                    <Label className="text-sm text-muted-foreground">Date Range</Label>
                                    <p className="text-lg font-medium">
                                        {format(new Date(selectedTest.createdAt), "MMM dd, yyyy")} - {format(new Date(selectedTest.endDate), "MMM dd, yyyy")}
                                    </p>
                                </div>
                                <div>
                                    <Label className="text-sm text-muted-foreground">Status</Label>
                                    <div className="mt-1">{getStatusBadge(selectedTest.status)}</div>
                                </div>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>

                {/* Edit Test Dialog */}
                <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Edit Test</DialogTitle>
                        </DialogHeader>
                        {selectedTest && (
                            <TestsHeader
                                test={selectedTest}
                                onClose={() => {
                                    setIsEditDialogOpen(false);
                                    setSelectedTest(null);
                                }}
                            />
                        )}
                    </DialogContent>
                </Dialog>

                {/* Assign Sections Dialog */}
                <Dialog open={isSectionsDialogOpen} onOpenChange={setIsSectionsDialogOpen}>
                    <DialogContent className="max-w-3xl">
                        <DialogHeader>
                            <DialogTitle>Manage Test Sections</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            <ScrollArea className="h-[400px] rounded-md border p-4">
                                {isLoadingSections ? (
                                    Array.from({ length: 5 }).map((_, index) => (
                                        <div key={index} className="mb-4">
                                            <Skeleton className="h-6 w-full mb-2" />
                                            <Skeleton className="h-4 w-20" />
                                        </div>
                                    ))
                                ) : allSections.length === 0 ? (
                                    <div className="text-center py-8 text-muted-foreground">
                                        No sections available
                                    </div>
                                ) : (
                                    allSections.map((section) => (
                                        <div
                                            key={section.id}
                                            className={cn(
                                                "flex items-center justify-between p-4 rounded-lg hover:bg-accent cursor-pointer mb-2",
                                                selectedSections.includes(section.id) && "bg-accent"
                                            )}
                                            onClick={() => toggleSectionSelection(section.id)}
                                        >
                                            <div className="flex-1">
                                                <p className="font-medium">{section.title}</p>
                                                <div className="flex gap-2 mt-1">
                                                    <Badge variant="outline">{section.durationMinutes} min</Badge>
                                                    <Badge variant="outline">{section.numberOfQuestions} questions</Badge>
                                                </div>
                                            </div>
                                            <input
                                                type="checkbox"
                                                checked={selectedSections.includes(section.id)}
                                                onChange={() => toggleSectionSelection(section.id)}
                                                className="ml-4"
                                            />
                                        </div>
                                    ))
                                )}
                            </ScrollArea>
                            <div className="flex justify-between items-center">
                                <p className="text-sm text-muted-foreground">
                                    {selectedSections.length} sections selected
                                </p>
                                <div className="flex gap-3">
                                    <Button variant="outline" onClick={() => {
                                        setIsSectionsDialogOpen(false);
                                        setSelectedTest(null);
                                        setSelectedSections([]);
                                    }}>
                                        Cancel
                                    </Button>
                                    <Button onClick={handleSaveSections}>
                                        Save Sections
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </CardContent>
        </Card>
    );
}