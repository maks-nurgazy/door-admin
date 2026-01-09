"use client";

import {useState, useEffect} from "react";
import {Button} from "@/components/ui/button";
import {Plus, Upload} from "lucide-react";
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger,} from "@/components/ui/dialog";
import {useRouter} from "next/navigation";
import {Question, questionsApi} from "@/lib/api/questions";
import {TopicShortDto} from "@/lib/api/topics";
import {Test, testsApi} from "@/lib/api/tests";
import {QuestionForm, QuestionFormValues} from "./question-form";

interface QuestionsHeaderProps {
    mode?: 'create' | 'edit';
    question?: Question;
    onClose?: () => void;
    onSuccess?: () => void;
    topics: TopicShortDto[];
}

export function QuestionsHeader({mode = 'create', question, onClose, onSuccess, topics = []}: QuestionsHeaderProps) {
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [tests, setTests] = useState<Test[]>([]);
    useRouter();

    // Load tests for the test/section selector
    useEffect(() => {
        testsApi.getTests({ size: 100 })
            .then(response => setTests(response.data))
            .catch(console.error);
    }, []);

    const handleSubmit = async (data: QuestionFormValues) => {
        try {
            if (mode === 'edit' && question) {
                await questionsApi.updateQuestion(question.id, data);
                onSuccess?.();
            } else {
                await questionsApi.createQuestion(data);
                setIsAddDialogOpen(false);
                // Instead of router.refresh(), call onSuccess to trigger data refresh
                onSuccess?.();
            }
        } catch (error) {
            console.error('Failed to handle question:', error);
            throw error; // Re-throw to let the form handle the error
        }
    };

    if (mode === 'edit') {
        return (
            <QuestionForm
                mode="edit"
                question={question}
                topics={topics}
                tests={tests}
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
                    <Upload className="h-4 w-4 mr-2"/>
                    Import CSV
                </Button>
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="h-4 w-4 mr-2"/>
                            Add Question
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
                        <DialogHeader>
                            <DialogTitle>Add New Question</DialogTitle>
                            <DialogDescription>Create a new question for your question bank</DialogDescription>
                        </DialogHeader>
                        <div className="flex-1 overflow-y-auto px-1">
                            <QuestionForm
                                topics={topics}
                                tests={tests}
                                onSubmit={handleSubmit}
                                onCancel={() => setIsAddDialogOpen(false)}
                            />
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}