"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { questionsApi, QuestionResponseDto, CreateQuestionRequest } from "@/lib/api/questions";
import { Topic } from "@/lib/api/topics";
import { SectionTemplateDto } from "@/lib/api/section-templates";
import { TestPackageListDto } from "@/lib/api/tests";
import { QuestionForm, QuestionFormValues } from "./question-form";

interface QuestionsHeaderProps {
    mode?: 'create' | 'edit';
    question?: QuestionResponseDto;
    onClose?: () => void;
    onSuccess?: () => void;
    topics: Topic[];
    sections: SectionTemplateDto[];
    tests: TestPackageListDto[];
}

export function QuestionsHeader({ mode = 'create', question, onClose, onSuccess, topics = [], sections = [], tests = [] }: QuestionsHeaderProps) {
    const router = useRouter();
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

    const handleSubmit = async (data: CreateQuestionRequest) => {
        if (mode === 'edit' && question) {
            await questionsApi.updateQuestion(question.id, data);
            onSuccess?.();
        } else {
            await questionsApi.createQuestion(data);
            setIsAddDialogOpen(false);
            if (onSuccess) {
                onSuccess();
            } else {
                router.refresh();
            }
        }
    };

    if (mode === 'edit') {
        return (
            <QuestionForm
                mode="edit"
                question={question}
                topics={topics}
                sections={sections}
                tests={tests}
                onSubmit={handleSubmit}
                onCancel={onClose!}
            />
        );
    }

    return (
        <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">Questions Bank</h1>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                    <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Question
                    </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
                    <DialogHeader>
                        <DialogTitle>Add New Question</DialogTitle>
                        <DialogDescription>Create a new question for your question bank</DialogDescription>
                    </DialogHeader>
                    <div className="flex-1 overflow-y-auto px-1">
                        <QuestionForm
                            topics={topics}
                            sections={sections}
                            tests={tests}
                            onSubmit={handleSubmit}
                            onCancel={() => setIsAddDialogOpen(false)}
                        />
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
