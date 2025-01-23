"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, ListPlus } from "lucide-react";
import { cn } from "@/lib/utils";

const ITEMS_PER_PAGE = 10;

// Mock questions data with consistent data
const mockQuestions = [
  {
    id: 1,
    text: "What is the capital of France?",
    topic: "Geography",
    type: "text",
  },
  {
    id: 2,
    text: "Solve for x: 2x + 5 = 13",
    topic: "Algebra",
    type: "text",
  },
];

// Mock sections data with consistent data
const mockSections = Array.from({ length: 25 }, (_, i) => ({
  id: i + 1,
  title: `Section ${i + 1}`,
  duration: 60,
  topics: ["Topic 1"],
  questions: [],
  questionCount: 10, // Fixed value instead of random
}));

const availableTopics = ["Algebra", "Geometry", "Grammar", "Vocabulary", "Physics", "Chemistry"];

export default function SectionsPage() {
  const [sections, setSections] = useState<any>(mockSections);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isQuestionDialogOpen, setIsQuestionDialogOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedQuestions, setSelectedQuestions] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [newSection, setNewSection] = useState({
    title: "",
    duration: 0,
    topics: [] as string[],
    questions: [] as number[],
    questionCount: 0,
  });

  const handleAddSection = () => {
    if (editingSection) {
      setSections(sections.map((section:any) =>
        section.id === editingSection.id ? { ...newSection, id: editingSection.id } : section
      ));
    } else {
      setSections([...sections, { ...newSection, id: sections.length + 1 }]);
    }
    setIsAddDialogOpen(false);
    setEditingSection(null);
    setNewSection({
      title: "",
      duration: 0,
      topics: [],
      questions: [],
      questionCount: 0,
    });
  };

  const handleEdit = (section: any) => {
    setEditingSection(section);
    setNewSection(section);
    setIsAddDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    setSections(sections.filter((section:any) => section.id !== id));
  };

  const handleAssignQuestions = (sectionId: number) => {
    const section = sections.find((s:any) => s.id === sectionId);
    if (section) {
      setEditingSection(section);
      setSelectedQuestions(section.questions);
      setIsQuestionDialogOpen(true);
    }
  };

  const handleSaveQuestions = () => {
    if (editingSection) {
      setSections(sections.map((section:any) =>
        section.id === editingSection.id
          ? {
              ...section,
              questions: selectedQuestions,
              questionCount: selectedQuestions.length,
            }
          : section
      ));
    }
    setIsQuestionDialogOpen(false);
    setEditingSection(null);
    setSelectedQuestions([]);
  };

  const toggleQuestionSelection = (questionId: number) => {
    setSelectedQuestions(prev =>
      prev.includes(questionId)
        ? prev.filter(id => id !== questionId)
        : [...prev, questionId]
    );
  };

  const filteredQuestions = mockQuestions.filter(question =>
    question.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
    question.topic.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter sections based on search query
  const filteredSections = sections.filter((section:any) =>
    section.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate pagination
  const totalPages = Math.ceil(filteredSections.length / ITEMS_PER_PAGE);
  const paginatedSections = filteredSections.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="space-y-6">
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
              <DialogTitle>
                {editingSection ? 'Edit Section' : 'Add New Section'}
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Section Title</Label>
                <Input
                  id="title"
                  value={newSection.title}
                  onChange={(e) =>
                    setNewSection({ ...newSection, title: e.target.value })
                  }
                  placeholder="e.g., Mathematics Part 1"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={newSection.duration}
                  onChange={(e) =>
                    setNewSection({ ...newSection, duration: parseInt(e.target.value) || 0 })
                  }
                  placeholder="e.g., 60"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddSection}>
                {editingSection ? 'Save Changes' : 'Add Section'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-4">
        <Input
          placeholder="Search sections..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setCurrentPage(1);
          }}
          className="max-w-sm"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sections Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Duration (min)</TableHead>
                <TableHead>Questions</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedSections.map((section:any) => (
                <TableRow key={section.id}>
                  <TableCell className="font-medium">{section.title}</TableCell>
                  <TableCell>{section.duration}</TableCell>
                  <TableCell>{section.questionCount}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleAssignQuestions(section.id)}
                      >
                        <ListPlus className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(section)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(section.id)}
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

      {/* Question Assignment Dialog */}
      <Dialog open={isQuestionDialogOpen} onOpenChange={setIsQuestionDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Assign Questions to {editingSection?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Search questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="mb-4"
            />
            <ScrollArea className="h-[400px] rounded-md border p-4">
              {filteredQuestions.map((question) => (
                <div
                  key={question.id}
                  className={cn(
                    "flex items-center justify-between p-2 rounded-lg hover:bg-accent cursor-pointer",
                    selectedQuestions.includes(question.id) && "bg-accent"
                  )}
                  onClick={() => toggleQuestionSelection(question.id)}
                >
                  <div className="flex-1">
                    <p className="font-medium">{question.text}</p>
                    <div className="flex gap-2 mt-1">
                      <Badge variant="outline">{question.topic}</Badge>
                      <Badge variant="outline">{question.type}</Badge>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={selectedQuestions.includes(question.id)}
                    onChange={() => toggleQuestionSelection(question.id)}
                    className="ml-4"
                  />
                </div>
              ))}
            </ScrollArea>
            <div className="flex justify-end gap-3 mt-4">
              <Button variant="outline" onClick={() => setIsQuestionDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveQuestions}>
                Save Questions
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}