"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Pencil, Trash2, ListPlus } from "lucide-react";
import { cn } from "@/libs/utils";

const ITEMS_PER_PAGE = 10;

// Mock sections data
const mockSections = [
  {
    id: 1,
    title: "Mathematics Part 1",
    duration: 60,
    topics: ["Algebra"],
    questionCount: 10,
  },
  {
    id: 2,
    title: "Reading Comprehension",
    duration: 45,
    topics: ["Grammar"],
    questionCount: 15,
  },
];

// Mock tests data with consistent frequency limits
const mockTests = Array.from({ length: 25 }, (_, i) => ({
  id: i + 1,
  title: `Test ${i + 1}`,
  createdAt: new Date(2024, 2, i + 1).toISOString().split('T')[0],
  status: i % 3 === 0 ? "active" : "inactive",
  sections: [1],
  frequencyLimit: {
    type: "none",
    attempts: 1
  },
  totalDuration: 60,
  totalQuestions: 10
}));

const frequencyTypes = [
  { value: "none", label: "No limit" },
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" }
];

export default function TestsPage() {
  const [tests, setTests] = useState(mockTests);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isSectionsDialogOpen, setIsSectionsDialogOpen] = useState(false);
  const [editingTest, setEditingTest] = useState<any>(null);
  const [selectedSections, setSelectedSections] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [newTest, setNewTest] = useState({
    title: "",
    status: "inactive",
    sections: [] as number[],
    frequencyLimit: {
      type: "none",
      attempts: 1
    },
    totalDuration: 0,
    totalQuestions: 0
  });

  const handleAddTest = () => {
    const currentDate = new Date().toISOString().split('T')[0];
    
    if (editingTest) {
      setTests(tests.map(test => 
        test.id === editingTest.id ? { ...newTest, id: editingTest.id, createdAt: test.createdAt } : test
      ));
    } else {
      setTests([...tests, { ...newTest, id: tests.length + 1, createdAt: currentDate }]);
    }
    setIsAddDialogOpen(false);
    setEditingTest(null);
    resetNewTest();
  };

  const resetNewTest = () => {
    setNewTest({
      title: "",
      status: "inactive",
      sections: [],
      frequencyLimit: {
        type: "none",
        attempts: 1
      },
      totalDuration: 0,
      totalQuestions: 0
    });
  };

  const handleEdit = (test: any) => {
    setEditingTest(test);
    setNewTest(test);
    setIsAddDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    setTests(tests.filter(test => test.id !== id));
  };

  const filteredTests = tests.filter(test =>
    test.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredTests.length / ITEMS_PER_PAGE);
  const paginatedTests = filteredTests.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleAssignSections = (testId: number) => {
    const test = tests.find(t => t.id === testId);
    if (test) {
      setEditingTest(test);
      setSelectedSections(test.sections);
      setIsSectionsDialogOpen(true);
    }
  };

  const handleSaveSections = () => {
    if (editingTest) {
      const selectedSectionsData = mockSections.filter(section => 
        selectedSections.includes(section.id)
      );
      
      const totalDuration = selectedSectionsData.reduce((sum, section) => 
        sum + section.duration, 0
      );
      
      const totalQuestions = selectedSectionsData.reduce((sum, section) => 
        sum + section.questionCount, 0
      );

      setTests(tests.map(test =>
        test.id === editingTest.id
          ? {
              ...test,
              sections: selectedSections,
              totalDuration,
              totalQuestions
            }
          : test
      ));
    }
    setIsSectionsDialogOpen(false);
    setEditingTest(null);
    setSelectedSections([]);
  };

  const toggleSectionSelection = (sectionId: number) => {
    setSelectedSections(prev =>
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500">Active</Badge>;
      case "inactive":
        return <Badge variant="secondary">Inactive</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Tests Management</h1>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Test
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingTest ? 'Edit Test' : 'Add New Test'}
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Test Title</Label>
                <Input
                    id="title"
                    value={newTest.title}
                    onChange={(e) =>
                        setNewTest({...newTest, title: e.target.value})
                    }
                    placeholder="e.g., Weekly Assessment Test"
                />
              </div>
              <div className="grid gap-2">
                <Label>Status</Label>
                <Select
                    value={newTest.status}
                    onValueChange={(value) =>
                        setNewTest({...newTest, status: value})
                    }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status"/>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Frequency Limit</Label>
                <Select
                    value={newTest.frequencyLimit.type}
                    onValueChange={(value) =>
                        setNewTest({
                          ...newTest,
                          frequencyLimit: { ...newTest.frequencyLimit, type: value }
                        })
                    }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select frequency"/>
                  </SelectTrigger>
                  <SelectContent>
                    {frequencyTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => {
                setIsAddDialogOpen(false);
                setEditingTest(null);
                resetNewTest();
              }}>
                Cancel
              </Button>
              <Button onClick={handleAddTest}>
                {editingTest ? 'Save Changes' : 'Add Test'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-4">
        <Input
            placeholder="Search tests..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tests Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Created Date</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Questions</TableHead>
                <TableHead>Frequency Limit</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedTests.map((test) => (
                <TableRow key={test.id}>
                  <TableCell className="font-medium">{test.title}</TableCell>
                  <TableCell>{test.createdAt}</TableCell>
                  <TableCell>{test.totalDuration} min</TableCell>
                  <TableCell>{test.totalQuestions}</TableCell>
                  <TableCell>
                    {test.frequencyLimit.type === 'none' 
                      ? 'No limit'
                      : `${test.frequencyLimit.attempts} per ${test.frequencyLimit.type}`}
                  </TableCell>
                  <TableCell>{getStatusBadge(test.status)}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleAssignSections(test.id)}
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
              ))}
            </TableBody>
          </Table>

          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-4">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="py-2 px-4">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Section Assignment Dialog */}
      <Dialog open={isSectionsDialogOpen} onOpenChange={setIsSectionsDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Assign Sections to {editingTest?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <ScrollArea className="h-[400px] rounded-md border p-4">
              {mockSections.map((section) => (
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
                      <Badge variant="outline">{section.duration} min</Badge>
                      <Badge variant="outline">{section.questionCount} questions</Badge>
                      {section.topics.map(topic => (
                        <Badge key={topic} variant="outline">{topic}</Badge>
                      ))}
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={selectedSections.includes(section.id)}
                    onChange={() => toggleSectionSelection(section.id)}
                    className="ml-4"
                  />
                </div>
              ))}
            </ScrollArea>
            <div className="flex justify-end gap-3 mt-4">
              <Button variant="outline" onClick={() => setIsSectionsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveSections}>
                Save Sections
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}