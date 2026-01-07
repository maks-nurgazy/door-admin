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
    DialogDescription,
} from "@/components/ui/dialog";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Pencil, Trash2, Eye, ListPlus, ChevronRight, BookOpen, Clock, FileQuestion } from "lucide-react";
import { Test, TestSection, TestsResponse, testsApi } from "@/lib/api/tests";
import { sectionsApi, SectionQuestion } from "@/lib/api/sections";
import { Question } from "@/lib/api/questions";
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

    // New state for accordion view
    const [expandedTest, setExpandedTest] = useState<string | undefined>(undefined);
    const [testSectionsData, setTestSectionsData] = useState<Record<number, TestSection[]>>({});
    const [sectionQuestions, setSectionQuestions] = useState<Record<number, SectionQuestion[]>>({});
    const [loadingSections, setLoadingSections] = useState<Record<number, boolean>>({});
    const [loadingQuestions, setLoadingQuestions] = useState<Record<number, boolean>>({});

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

            // Convert SectionShortDto to TestSection format for consistency
            const convertedSections = allSectionsData.map(section => ({
                id: section.id,
                title: section.title,
                durationMinutes: 0,
                numberOfQuestions: 0
            }));
            setAllSections(convertedSections);
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

    // Load sections for a test when accordion is expanded
    const handleTestExpand = async (testId: string) => {
        const id = parseInt(testId);
        if (expandedTest === testId) {
            setExpandedTest(undefined);
            return;
        }

        setExpandedTest(testId);

        if (!testSectionsData[id]) {
            setLoadingSections(prev => ({ ...prev, [id]: true }));
            try {
                const sections = await testsApi.getTestSections(id);
                setTestSectionsData(prev => ({ ...prev, [id]: sections }));
            } catch (error) {
                console.error('Failed to load test sections:', error);
            } finally {
                setLoadingSections(prev => ({ ...prev, [id]: false }));
            }
        }
    };

    // Load questions for a section
    const handleSectionExpand = async (sectionId: number) => {
        if (sectionQuestions[sectionId]) return;

        setLoadingQuestions(prev => ({ ...prev, [sectionId]: true }));
        try {
            const questions = await sectionsApi.getSectionQuestions(sectionId);
            setSectionQuestions(prev => ({ ...prev, [sectionId]: questions }));
        } catch (error) {
            console.error('Failed to load section questions:', error);
        } finally {
            setLoadingQuestions(prev => ({ ...prev, [sectionId]: false }));
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
                {isLoading ? (
                    <div className="space-y-4">
                        {Array.from({ length: 5 }).map((_, index) => (
                            <div key={index} className="border rounded-lg p-4">
                                <Skeleton className="h-6 w-[300px] mb-2" />
                                <Skeleton className="h-4 w-[200px]" />
                            </div>
                        ))}
                    </div>
                ) : initialData.data.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        No tests found. Create your first test to get started.
                    </div>
                ) : (
                    <Accordion
                        type="single"
                        collapsible
                        value={expandedTest}
                        onValueChange={handleTestExpand}
                        className="space-y-4"
                    >
                        {initialData.data.map((test) => (
                            <AccordionItem
                                key={test.id}
                                value={test.id.toString()}
                                className="border rounded-lg px-4"
                            >
                                <AccordionTrigger className="hover:no-underline">
                                    <div className="flex items-center justify-between w-full pr-4">
                                        <div className="flex items-center gap-4">
                                            <div className="text-left">
                                                <h3 className="font-semibold text-lg">{test.title}</h3>
                                                <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="h-3 w-3" />
                                                        {test.durationMinutes} min
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <FileQuestion className="h-3 w-3" />
                                                        {test.questions} questions
                                                    </span>
                                                    <span>
                                                        {format(new Date(test.createdAt), "MMM dd, yyyy")} - {format(new Date(test.endDate), "MMM dd, yyyy")}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            {getStatusBadge(test.status)}
                                            <div className="flex gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleView(test);
                                                    }}
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleAssignSections(test);
                                                    }}
                                                >
                                                    <ListPlus className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleEdit(test);
                                                    }}
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDelete(test.id);
                                                    }}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent>
                                    <div className="pl-4 border-l-2 border-muted ml-2">
                                        <h4 className="font-medium mb-3 text-sm text-muted-foreground">Sections</h4>
                                        {loadingSections[test.id] ? (
                                            <div className="space-y-2">
                                                {Array.from({ length: 3 }).map((_, i) => (
                                                    <Skeleton key={i} className="h-12 w-full" />
                                                ))}
                                            </div>
                                        ) : testSectionsData[test.id]?.length === 0 ? (
                                            <p className="text-sm text-muted-foreground py-4">
                                                No sections found for this test.
                                            </p>
                                        ) : (
                                            <Accordion type="single" collapsible className="space-y-2">
                                                {testSectionsData[test.id]?.map((section) => (
                                                    <AccordionItem
                                                        key={section.id}
                                                        value={`section-${section.id}`}
                                                        className="border rounded-md"
                                                    >
                                                        <AccordionTrigger
                                                            className="px-4 py-2 hover:no-underline"
                                                            onClick={() => handleSectionExpand(section.id)}
                                                        >
                                                            <div className="flex items-center justify-between w-full pr-4">
                                                                <div className="flex items-center gap-3">
                                                                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                                                                    <span className="font-medium">{section.title}</span>
                                                                </div>
                                                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                                    <span>{section.durationMinutes} min</span>
                                                                    <Badge variant="outline">{section.numberOfQuestions} questions</Badge>
                                                                </div>
                                                            </div>
                                                        </AccordionTrigger>
                                                        <AccordionContent className="px-4">
                                                            <div className="pl-4 border-l-2 border-muted ml-2 py-2">
                                                                <h5 className="font-medium mb-2 text-sm text-muted-foreground">Questions</h5>
                                                                {loadingQuestions[section.id] ? (
                                                                    <div className="space-y-2">
                                                                        {Array.from({ length: 3 }).map((_, i) => (
                                                                            <Skeleton key={i} className="h-8 w-full" />
                                                                        ))}
                                                                    </div>
                                                                ) : sectionQuestions[section.id]?.length === 0 ? (
                                                                    <p className="text-sm text-muted-foreground">
                                                                        No questions assigned to this section.
                                                                    </p>
                                                                ) : (
                                                                    <div className="space-y-2">
                                                                        {sectionQuestions[section.id]?.map((question, index) => (
                                                                            <div
                                                                                key={question.id}
                                                                                className="flex items-start gap-3 p-2 rounded-md bg-muted/50"
                                                                            >
                                                                                <span className="text-sm font-medium text-muted-foreground min-w-[24px]">
                                                                                    {index + 1}.
                                                                                </span>
                                                                                <div className="flex-1">
                                                                                    <p className="text-sm">{question.text || 'Question text not available'}</p>
                                                                                    <div className="flex gap-2 mt-1">
                                                                                        <Badge variant="outline" className="text-xs">
                                                                                            {question.type}
                                                                                        </Badge>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </AccordionContent>
                                                    </AccordionItem>
                                                ))}
                                            </Accordion>
                                        )}
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                )}

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
                            <DialogDescription>View complete information about this test</DialogDescription>
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
                            <DialogDescription>Update test details and settings</DialogDescription>
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
                            <DialogDescription>Assign or remove sections for this test</DialogDescription>
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
