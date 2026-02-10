"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { Topic } from "@/lib/api/topics";
import { getQuestionTypes } from "@/lib/question-types";

interface QuestionsFiltersProps {
    topics: Topic[];
}

export function QuestionsFilters({ topics }: QuestionsFiltersProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [, startTransition] = useTransition();

    const [search, setSearch] = useState(searchParams.get("search") || "");
    const [topic, setTopic] = useState(searchParams.get("topic") || "all");
    const [questionType, setQuestionType] = useState(searchParams.get("questionType") || "all");

    const updateFilters = useCallback(
        (params: Record<string, string | null>) => {
            const newSearchParams = new URLSearchParams(searchParams.toString());
            let somethingChanged = false;

            for (const [key, value] of Object.entries(params)) {
                if (value === null || value === "all") {
                    if (newSearchParams.has(key)) {
                        newSearchParams.delete(key);
                        somethingChanged = true;
                    }
                } else {
                    if (newSearchParams.get(key) !== value) {
                        newSearchParams.set(key, value);
                        somethingChanged = true;
                    }
                }
            }

            if (somethingChanged) {
                if (!Object.keys(params).includes("page")) {
                    newSearchParams.delete("page");
                }
                startTransition(() => {
                    router.push(`?${newSearchParams.toString()}`);
                });
            }
        },
        [router, searchParams]
    );

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            updateFilters({ search: search || null });
        }, 300);
        return () => clearTimeout(timeoutId);
    }, [search, updateFilters]);

    const clearAllFilters = () => {
        setSearch("");
        setTopic("all");
        setQuestionType("all");
        updateFilters({ search: null, topic: null, questionType: null });
    };

    const hasActiveFilters = search || topic !== "all" || questionType !== "all";

    return (
        <div className="flex gap-4 flex-wrap items-center">
            <Input
                placeholder="Search questions..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="max-w-sm"
            />
            <Select
                value={topic}
                onValueChange={(value) => {
                    setTopic(value);
                    updateFilters({ topic: value });
                }}
            >
                <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Filter by topic" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Topics</SelectItem>
                    {topics.map((t) => (
                        <SelectItem key={t.id} value={t.id.toString()}>
                            {t.title}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <Select
                value={questionType}
                onValueChange={(value) => {
                    setQuestionType(value);
                    updateFilters({ questionType: value });
                }}
            >
                <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {getQuestionTypes().map((config) => (
                        <SelectItem key={config.type} value={config.type}>
                            {config.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            {hasActiveFilters && (
                <Button
                    variant="outline"
                    size="sm"
                    onClick={clearAllFilters}
                    className="flex items-center gap-2"
                >
                    <X className="h-4 w-4" />
                    Clear Filters
                </Button>
            )}
        </div>
    );
}
