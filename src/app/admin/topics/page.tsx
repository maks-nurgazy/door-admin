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
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Eye } from "lucide-react";
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

const topicSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(50, "Title must be less than 50 characters"),
});

type TopicFormValues = z.infer<typeof topicSchema>;

// Mock sections data
const mockSections = [
  { id: 1, title: "Mathematics Part 1" },
  { id: 2, title: "Reading Comprehension" },
  { id: 3, title: "Grammar Basics" },
];

const mockTopics = Array.from({ length: 25 }, (_, i) => ({
  id: i + 1,
  title: `Topic ${i + 1}`,
  sections: [Math.floor(Math.random() * 3) + 1],
}));

const ITEMS_PER_PAGE = 10;

export default function TopicsPage() {
  const [topics, setTopics] = useState(mockTopics);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [editingTopic, setEditingTopic] = useState<any>(null);
  const [viewingTopic, setViewingTopic] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const form = useForm<TopicFormValues>({
    resolver: zodResolver(topicSchema),
    defaultValues: {
      title: "",
    },
  });

  const onSubmit = (data: TopicFormValues) => {
    if (editingTopic) {
      setTopics(topics.map(topic =>
        topic.id === editingTopic.id ? { ...topic, ...data } : topic
      ));
    } else {
      setTopics([...topics, { ...data, id: topics.length + 1, sections: [] }]);
    }
    setIsAddDialogOpen(false);
    setEditingTopic(null);
    form.reset();
  };

  const handleEdit = (topic: any) => {
    setEditingTopic(topic);
    form.reset({ title: topic.title });
    setIsAddDialogOpen(true);
  };

  const handleView = (topic: any) => {
    setViewingTopic(topic);
    setIsViewDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    setTopics(topics.filter(topic => topic.id !== id));
  };

  const filteredTopics = topics.filter(topic =>
    topic.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredTopics.length / ITEMS_PER_PAGE);
  const paginatedTopics = filteredTopics.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Topics Management</h1>
        <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
          setIsAddDialogOpen(open);
          if (!open) {
            form.reset();
            setEditingTopic(null);
          }
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Topic
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingTopic ? 'Edit Topic' : 'Add New Topic'}
              </DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Topic Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Algebra" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end gap-3">
                  <Button variant="outline" type="button" onClick={() => {
                    setIsAddDialogOpen(false);
                    form.reset();
                  }}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingTopic ? 'Save Changes' : 'Add Topic'}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-4">
        <Input
          placeholder="Search topics..."
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
          <CardTitle>Topics Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Associated Sections</TableHead>
                <TableHead className="w-[120px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedTopics.map((topic) => (
                <TableRow key={topic.id}>
                  <TableCell className="font-medium">{topic.title}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-2">
                      {topic.sections.map((sectionId) => (
                        <Badge key={sectionId} variant="secondary">
                          {mockSections.find(s => s.id === sectionId)?.title}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleView(topic)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(topic)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(topic.id)}
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

      {/* View Topic Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Topic Details</DialogTitle>
          </DialogHeader>
          {viewingTopic && (
            <div className="space-y-4">
              <div>
                <Label className="text-sm text-muted-foreground">Topic Title</Label>
                <p className="text-lg font-medium">{viewingTopic.title}</p>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Associated Sections</Label>
                <div className="mt-2 space-y-2">
                  {viewingTopic.sections.length > 0 ? (
                    viewingTopic.sections.map((sectionId: number) => {
                      const section = mockSections.find(s => s.id === sectionId);
                      return (
                        <div key={sectionId} className="flex items-center gap-2 p-2 rounded-lg border">
                          <span className="font-medium">{section?.title}</span>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-muted-foreground">No sections associated with this topic</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}