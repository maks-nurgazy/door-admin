"use client";

import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { FormDescription } from "@/components/ui/form";
import { QuestionOption } from "@/lib/api/questions";
import { TextContentInput } from "./text-content-input";

export interface ReadingComprehensionFormData {
    options: QuestionOption[];
    correctOptionId: number;
    readingPassageId?: number;
}

interface ReadingComprehensionFormProps {
    content?: ReadingComprehensionFormData | null;
    passages: { id: number; title: string; description?: string }[];
    onChange: (content: ReadingComprehensionFormData) => void;
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

export function ReadingComprehensionForm({ content, passages, onChange }: ReadingComprehensionFormProps) {
    const [readingPassageId, setReadingPassageId] = useState<number | undefined>(
        content?.readingPassageId
    );
    const [options, setOptions] = useState<QuestionOption[]>(
        content?.options ?? makeDefaultOptions()
    );
    const [correctOptionId, setCorrectOptionId] = useState<number>(
        content?.correctOptionId ?? 1
    );

    useEffect(() => {
        onChange({ options, correctOptionId, readingPassageId });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [options, correctOptionId, readingPassageId]);

    const updateOption = (id: number, updated: Partial<QuestionOption>) => {
        setOptions(prev => prev.map(opt => opt.id === id ? { ...opt, ...updated } : opt));
    };

    const handleCorrectChange = (value: string) => {
        const newId = parseInt(value);
        setCorrectOptionId(newId);
        setOptions(prev => prev.map(opt => ({ ...opt, isCorrect: opt.id === newId })));
    };

    const handlePassageChange = (value: string) => {
        setReadingPassageId(parseInt(value));
    };

    return (
        <div className="space-y-4">
            <div className="space-y-1.5">
                <Label>Reading Passage</Label>
                <Select
                    value={readingPassageId?.toString() ?? ""}
                    onValueChange={handlePassageChange}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Select a reading passage" />
                    </SelectTrigger>
                    <SelectContent>
                        {passages.map((passage) => (
                            <SelectItem key={passage.id} value={passage.id.toString()}>
                                {passage.title}
                                {passage.description && (
                                    <span className="text-xs text-muted-foreground ml-2">
                                        - {passage.description}
                                    </span>
                                )}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <FormDescription>
                    Select the reading passage that students will read before answering this question.
                </FormDescription>
            </div>

            <h3 className="text-sm font-semibold">Options</h3>
            {options.map((opt) => (
                <div key={opt.id} className="flex items-start gap-3">
                    <span className="pt-2 w-5 text-sm font-medium text-muted-foreground">{opt.label}</span>
                    <div className="flex-1">
                        <TextContentInput
                            value={{ displayType: opt.displayType, value: opt.value }}
                            onChange={(tc) => updateOption(opt.id, { displayType: tc.displayType, value: tc.value })}
                            placeholder={`Option ${opt.label}`}
                        />
                    </div>
                </div>
            ))}

            <div className="space-y-1.5">
                <Label>Correct Answer</Label>
                <Select value={correctOptionId.toString()} onValueChange={handleCorrectChange}>
                    <SelectTrigger className="w-48">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {options.map((opt) => (
                            <SelectItem key={opt.id} value={opt.id.toString()}>
                                {opt.label}: {opt.value || '(empty)'}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
}
