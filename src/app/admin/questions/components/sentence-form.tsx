"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import { QuestionOption } from "@/lib/api/questions";
import { TextContentInput } from "./text-content-input";

export interface SentenceSubFormData {
    options: QuestionOption[];
    correctOptionId: number;
}

interface SentenceFormProps {
    content?: SentenceSubFormData | null;
    onChange: (content: SentenceSubFormData) => void;
}

const DEFAULT_LABELS = ['A', 'B', 'C', 'D'];

function makeDefaultOptions(): QuestionOption[] {
    return DEFAULT_LABELS.map((label, i) => ({
        id: i + 1,
        label,
        value: "",
        displayType: 'TEXT',
        isCorrect: i === 0,
    }));
}

export function SentenceForm({ content, onChange }: SentenceFormProps) {
    const [options, setOptions] = useState<QuestionOption[]>(
        content?.options ?? makeDefaultOptions()
    );
    const [correctOptionId, setCorrectOptionId] = useState<number>(
        content?.correctOptionId ?? 1
    );

    useEffect(() => {
        onChange({ options, correctOptionId });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [options, correctOptionId]);

    const updateOption = (id: number, updated: Partial<QuestionOption>) => {
        setOptions(prev => prev.map(opt => opt.id === id ? { ...opt, ...updated } : opt));
    };

    const handleCorrectChange = (id: number) => {
        setCorrectOptionId(id);
        setOptions(prev => prev.map(opt => ({ ...opt, isCorrect: opt.id === id })));
    };

    return (
        <div className="space-y-2">
            <p className="text-xs text-muted-foreground mb-3">Click the circle to mark the correct answer</p>
            {options.map((opt) => {
                const isCorrect = correctOptionId === opt.id;
                return (
                    <div
                        key={opt.id}
                        className={cn(
                            "flex items-start gap-3 p-3 rounded-lg border-2 transition-all",
                            isCorrect
                                ? "border-green-500 bg-green-50 dark:bg-green-950/20"
                                : "border-border hover:border-muted-foreground/40"
                        )}
                    >
                        <button
                            type="button"
                            onClick={() => handleCorrectChange(opt.id)}
                            className="mt-2 shrink-0 focus:outline-none"
                            title="Mark as correct"
                        >
                            {isCorrect
                                ? <CheckCircle2 className="h-5 w-5 text-green-500" />
                                : <Circle className="h-5 w-5 text-muted-foreground/50 hover:text-muted-foreground transition-colors" />
                            }
                        </button>
                        <div className={cn(
                            "w-7 h-7 mt-1.5 shrink-0 rounded-full flex items-center justify-center text-xs font-bold",
                            isCorrect ? "bg-green-500 text-white" : "bg-muted text-muted-foreground"
                        )}>
                            {opt.label}
                        </div>
                        <div className="flex-1">
                            <TextContentInput
                                value={{ displayType: opt.displayType, value: opt.value }}
                                onChange={(tc) => updateOption(opt.id, { displayType: tc.displayType, value: tc.value })}
                                placeholder={`Option ${opt.label}`}
                            />
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
