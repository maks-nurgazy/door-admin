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
import { QuestionOption, ComparisonColumn, ComparisonTable } from "@/lib/api/questions";
import { TextContentInput } from "./text-content-input";

export interface ComparisonSubFormData {
    options: QuestionOption[];
    correctOptionId: number;
    comparisonTable: ComparisonTable;
}

interface ComparisonFormProps {
    content?: ComparisonSubFormData | null;
    onChange: (content: ComparisonSubFormData) => void;
}

// Cyrillic labels for comparison options
const DEFAULT_LABELS = ['А', 'Б', 'В', 'Г'];

function makeDefaultOptions(): QuestionOption[] {
    return DEFAULT_LABELS.map((label, i) => ({
        id: i + 1,
        label,
        value: label,
        displayType: 'TEXT',
        isCorrect: i === 0,
    }));
}

const DEFAULT_COLUMN_A: ComparisonColumn = { label: 'A', value: '', displayType: 'LATEX' };
const DEFAULT_COLUMN_B: ComparisonColumn = { label: 'B', value: '', displayType: 'LATEX' };

export function ComparisonForm({ content, onChange }: ComparisonFormProps) {
    const [columnA, setColumnA] = useState<ComparisonColumn>(
        content?.comparisonTable?.columnA ?? DEFAULT_COLUMN_A
    );
    const [columnB, setColumnB] = useState<ComparisonColumn>(
        content?.comparisonTable?.columnB ?? DEFAULT_COLUMN_B
    );
    const [options, setOptions] = useState<QuestionOption[]>(
        content?.options ?? makeDefaultOptions()
    );
    const [correctOptionId, setCorrectOptionId] = useState<number>(
        content?.correctOptionId ?? 1
    );

    useEffect(() => {
        onChange({
            options,
            correctOptionId,
            comparisonTable: { columnA, columnB },
        });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [options, correctOptionId, columnA, columnB]);

    const updateOption = (id: number, updated: Partial<QuestionOption>) => {
        setOptions(prev => prev.map(opt => opt.id === id ? { ...opt, ...updated } : opt));
    };

    const handleCorrectChange = (value: string) => {
        const newId = parseInt(value);
        setCorrectOptionId(newId);
        setOptions(prev => prev.map(opt => ({ ...opt, isCorrect: opt.id === newId })));
    };

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <Label>Column A</Label>
                    <TextContentInput
                        value={{ displayType: columnA.displayType, value: columnA.value }}
                        onChange={(tc) => setColumnA(prev => ({ ...prev, displayType: tc.displayType, value: tc.value }))}
                        rows={3}
                        placeholder="Column A content (LaTeX)"
                    />
                </div>
                <div className="space-y-1.5">
                    <Label>Column B</Label>
                    <TextContentInput
                        value={{ displayType: columnB.displayType, value: columnB.value }}
                        onChange={(tc) => setColumnB(prev => ({ ...prev, displayType: tc.displayType, value: tc.value }))}
                        rows={3}
                        placeholder="Column B content (LaTeX)"
                    />
                </div>
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
