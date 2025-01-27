"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Upload } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import { Question, questionsApi } from "@/lib/api/questions";
import { TopicShortDto } from "@/lib/api/topics";
import { QuestionForm, QuestionFormValues } from "./question-form";

interface QuestionsHeaderProps {
    mode?: 'create' | 'edit';
    question?: Question;
    onClose?: () => void;
    onSuccess?: () => void;
    topics: TopicShortDto[];
}

export function QuestionsHeader({ mode = 'create', question, onClose, onSuccess, topics = [] }: QuestionsHeaderProps) {
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const router = useRouter();

    const handleSubmit = async (data: QuestionFormValues) => {
        try {
            if (mode === 'edit' && question) {
                await questionsApi.updateQuestion(question.id, data);
                onSuccess?.();
            } else {
                await questionsApi.createQuestion(data);
                setIsAddDialogOpen(false);
                router.refresh();
            }
        } catch (error) {
            console.error('Failed to handle question:', error);
        }
    };

    if (mode === 'edit') {
        return (
            <QuestionForm
                mode="edit"
                question={question}
                topics={topics}
                onSubmit={handleSubmit}
                onCancel={onClose!}
            />
        );
    }

    return (
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
                        <QuestionForm
                            topics={topics}
                            onSubmit={handleSubmit}
                            onCancel={() => setIsAddDialogOpen(false)}
                        />
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}