"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
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

    const handleCorrectChange = (id: number) => {
        setCorrectOptionId(id);
        setOptions(prev => prev.map(opt => ({ ...opt, isCorrect: opt.id === id })));
    };

    return (
        <div className="space-y-4">
            {/* Comparison table */}
            <div className="rounded-lg border overflow-hidden">
                <div className="grid grid-cols-2 divide-x">
                    <div className="bg-muted/50 px-3 py-2 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Column A
                    </div>
                    <div className="bg-muted/50 px-3 py-2 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Column B
                    </div>
                </div>
                <div className="grid grid-cols-2 divide-x border-t">
                    <div className="p-3">
                        <TextContentInput
                            value={{ displayType: columnA.displayType, value: columnA.value }}
                            onChange={(tc) => setColumnA(prev => ({ ...prev, displayType: tc.displayType, value: tc.value }))}
                            rows={3}
                            placeholder="Column A content (LaTeX)"
                        />
                    </div>
                    <div className="p-3">
                        <TextContentInput
                            value={{ displayType: columnB.displayType, value: columnB.value }}
                            onChange={(tc) => setColumnB(prev => ({ ...prev, displayType: tc.displayType, value: tc.value }))}
                            rows={3}
                            placeholder="Column B content (LaTeX)"
                        />
                    </div>
                </div>
            </div>

            {/* Options */}
            <div className="space-y-2">
                <p className="text-xs text-muted-foreground">Click the circle to mark the correct answer</p>
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
        </div>
    );
}
