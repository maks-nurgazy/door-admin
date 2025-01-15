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
import { Plus, Upload, Eye, Pencil, Trash2 } from "lucide-react";
import { format } from "date-fns";

// Mock data
const mockQuestions = [
  {
    id: 1,
    text: "What is the capital of France?",
    section: "Geography",
    topic: "Capitals",
    type: "text",
    options: ["London", "Paris", "Berlin", "Madrid"],
    correctAnswer: "Paris",
    image: null,
    createdAt: "2024-03-20",
    status: "active"
  }
];

const sections = ["Mathematics", "Geography", "Grammar", "Science"];
const topics = ["Algebra", "Capitals", "Vocabulary", "Physics"];
const questionTypes = ["text", "image"];

export default function QuestionsPage() {
  const [questions, setQuestions] = useState(mockQuestions);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<any | null>(null);
  const [newQuestion, setNewQuestion] = useState<any>({
    text: "",
    section: "",
    topic: "",
    type: "text",
    options: ["", "", "", ""],
    correctAnswer: "",
    image: null,
    createdAt: new Date().toISOString().split('T')[0],
    status: "active"
  });

  const handleAddQuestion = () => {
    if (!newQuestion.text || !newQuestion.section || !newQuestion.topic || !newQuestion.correctAnswer) {
      return;
    }
    const question: any = {
      ...newQuestion,
      id: questions.length + 1,
      createdAt: new Date(),
    };
    setQuestions([...questions, question]);
    setIsAddDialogOpen(false);
    setNewQuestion({
      type: "text",
      text: "",
      section: "",
      topic: "",
      options: ["Option A", "Option B", "Option C", "Option D"],
      correctAnswer: "",
      image: null,
    });
  };

  const handleEditQuestion = () => {
    if (!selectedQuestion) return;
    setQuestions(questions.map(q => 
      q.id === selectedQuestion.id ? selectedQuestion : q
    ));
    setIsEditDialogOpen(false);
    setSelectedQuestion(null);
  };

  const handleDeleteQuestion = () => {
    if (!selectedQuestion) return;
    setQuestions(questions.filter(q => q.id !== selectedQuestion.id));
    setIsDeleteDialogOpen(false);
    setSelectedQuestion(null);
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...newQuestion.options];
    newOptions[index] = value;
    setNewQuestion({ ...newQuestion, options: newOptions });
  };

  const handleStatusChange = (id: number, newStatus: string) => {
    setQuestions(questions.map(q => 
      q.id === id ? { ...q, status: newStatus } : q
    ));
  };

  const QuestionForm = ({ question, onSave, isEdit = false }: { 
    question: any, 
    onSave: () => void,
    isEdit?: boolean 
  }) => (
    <div className="grid gap-4 py-4">
      <div className="grid gap-2">
        <Label>Question Type</Label>
        <Select
          value={question.type}
          onValueChange={(value: any) =>
            isEdit 
              ? setSelectedQuestion({ ...selectedQuestion, type: value } as any)
              : setNewQuestion({ ...newQuestion, type: value })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select question type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="text">Regular Text Question</SelectItem>
            <SelectItem value="image">Image Question</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="question">Question Text</Label>
        <Input
          id="question"
          value={question.text}
          onChange={(e) =>
            isEdit
              ? setSelectedQuestion({ ...selectedQuestion, text: e.target.value } as any)
              : setNewQuestion({ ...newQuestion, text: e.target.value })
          }
        />
      </div>

      {question.type === "image" && (
        <div className="grid gap-2">
          <Label>Question Image</Label>
          <Input 
            type="file" 
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const reader = new FileReader();
                reader.onloadend = () => {
                  const base64 = reader.result as string;
                  isEdit
                    ? setSelectedQuestion({ ...selectedQuestion, image: base64 } as any)
                    : setNewQuestion({ ...newQuestion, image: base64 });
                };
                reader.readAsDataURL(file);
              }
            }}
          />
          {question.image && (
            <img 
              src={question.image} 
              alt="Question" 
              className="mt-2 max-h-40 object-contain"
            />
          )}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label>Section</Label>
          <Select
            value={question.section}
            onValueChange={(value) =>
              isEdit
                ? setSelectedQuestion({ ...selectedQuestion, section: value } as any)
                : setNewQuestion({ ...newQuestion, section: value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select section" />
            </SelectTrigger>
            <SelectContent>
              {sections.map((section) => (
                <SelectItem key={section} value={section}>
                  {section}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label>Topic</Label>
          <Select
            value={question.topic}
            onValueChange={(value) =>
              isEdit
                ? setSelectedQuestion({ ...selectedQuestion, topic: value } as any)
                : setNewQuestion({ ...newQuestion, topic: value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select topic" />
            </SelectTrigger>
            <SelectContent>
              {topics.map((topic) => (
                <SelectItem key={topic} value={topic}>
                  {topic}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-2">
        <Label>Options</Label>
        <div className="grid grid-cols-2 gap-4">
          {question.options.map((option: string, index: number) => (
            <div key={index} className="flex gap-2">
              <Label className="w-6 py-2">{String.fromCharCode(65 + index)}</Label>
              <Input
                value={option}
                onChange={(e) => {
                  const newOptions = [...question.options];
                  newOptions[index] = e.target.value || `Option ${String.fromCharCode(65 + index)}`;
                  isEdit
                    ? setSelectedQuestion({ ...selectedQuestion, options: newOptions } as any)
                    : setNewQuestion({ ...newQuestion, options: newOptions });
                }}
                placeholder={`Option ${String.fromCharCode(65 + index)}`}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-2">
        <Label>Correct Answer</Label>
        <Select
          value={question.correctAnswer}
          onValueChange={(value) =>
            isEdit
              ? setSelectedQuestion({ ...selectedQuestion, correctAnswer: value } as any)
              : setNewQuestion({ ...newQuestion, correctAnswer: value })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select correct answer" />
          </SelectTrigger>
          <SelectContent>
            {question.options.filter((option: string) => option.trim() !== '').map((option: string, index: number) => (
              <SelectItem key={index} value={option}>
                {String.fromCharCode(65 + index)}: {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={() => {
          isEdit ? setIsEditDialogOpen(false) : setIsAddDialogOpen(false);
          if (isEdit) setSelectedQuestion(null);
        }}>
          Cancel
        </Button>
        <Button onClick={onSave}>
          {isEdit ? "Save Changes" : "Add Question"}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Questions Bank</h1>
        <div className="flex gap-3">
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Import CSV
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Question
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Question</DialogTitle>
              </DialogHeader>
              <QuestionForm question={newQuestion} onSave={handleAddQuestion} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-6">
        <div className="flex gap-4">
          <Input placeholder="Search questions..." className="max-w-sm" />
          <Select>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by section" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sections</SelectItem>
              {sections.map((section) => (
                <SelectItem key={section} value={section}>
                  {section}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by topic" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Topics</SelectItem>
              {topics.map((topic) => (
                <SelectItem key={topic} value={topic}>
                  {topic}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Question</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Section</TableHead>
              <TableHead>Topic</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {questions.map((question) => (
              <TableRow key={question.id}>
                <TableCell className="font-medium">{question.text}</TableCell>
                <TableCell>{question.type}</TableCell>
                <TableCell>{question.section}</TableCell>
                <TableCell>{question.topic}</TableCell>
                <TableCell>{question.createdAt}</TableCell>
                <TableCell>
                  <Select
                    value={question.status}
                    onValueChange={(value) => handleStatusChange(question.id, value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Dialog open={isViewDialogOpen && selectedQuestion?.id === question.id} onOpenChange={(open) => {
                      setIsViewDialogOpen(open);
                      if (!open) setSelectedQuestion(null);
                    }}>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setSelectedQuestion(question)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>View Question</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div>
                            <Label className="font-semibold">Type</Label>
                            <p>{question.type === "image" ? "Image Question" : "Text Question"}</p>
                          </div>
                          <div>
                            <Label className="font-semibold">Question</Label>
                            <p>{question.text}</p>
                          </div>
                          {question.type === "image" && question.image && (
                            <div>
                              <Label className="font-semibold">Image</Label>
                              <img 
                                src={question.image} 
                                alt="Question" 
                                className="mt-2 max-h-40 object-contain"
                              />
                            </div>
                          )}
                          <div>
                            <Label className="font-semibold">Options</Label>
                            <div className="grid grid-cols-2 gap-2">
                              {question.options.map((option, index) => (
                                <div key={index} className="flex gap-2">
                                  <span className="font-semibold">{String.fromCharCode(65 + index)}:</span>
                                  <span>{option}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div>
                            <Label className="font-semibold">Correct Answer</Label>
                            <p>{question.correctAnswer}</p>
                          </div>
                          <div>
                            <Label className="font-semibold">Created At</Label>
                            <p>{format(question.createdAt, "PPP")}</p>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>

                    <Dialog open={isEditDialogOpen && selectedQuestion?.id === question.id} onOpenChange={(open) => {
                      setIsEditDialogOpen(open);
                      if (!open) setSelectedQuestion(null);
                    }}>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setSelectedQuestion(question)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Edit Question</DialogTitle>
                        </DialogHeader>
                        {selectedQuestion && (
                          <QuestionForm 
                            question={selectedQuestion} 
                            onSave={handleEditQuestion}
                            isEdit
                          />
                        )}
                      </DialogContent>
                    </Dialog>

                    <Dialog open={isDeleteDialogOpen && selectedQuestion?.id === question.id} onOpenChange={(open) => {
                      setIsDeleteDialogOpen(open);
                      if (!open) setSelectedQuestion(null);
                    }}>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setSelectedQuestion(question)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Delete Question</DialogTitle>
                        </DialogHeader>
                        <div className="py-4">
                          <p>Are you sure you want to delete this question? This action cannot be undone.</p>
                          <div className="flex justify-end gap-3 mt-4">
                            <Button variant="outline" onClick={() => {
                              setIsDeleteDialogOpen(false);
                              setSelectedQuestion(null);
                            }}>
                              Cancel
                            </Button>
                            <Button variant="destructive" onClick={handleDeleteQuestion}>
                              Delete
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}