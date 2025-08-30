"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Combobox } from "@/components/ui/combobox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ArrowUp, ArrowDown, X } from "lucide-react";

interface QuestionsFiltersProps {
    sections: { id: number; title: string; }[];
    topics: { id: number; title: string; }[];
}

export function QuestionsFilters({ sections, topics }: QuestionsFiltersProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [, startTransition] = useTransition();

    const [search, setSearch] = useState(searchParams.get("search") || "");
    const [section, setSection] = useState(searchParams.get("section") || "all");
    const [topic, setTopic] = useState(searchParams.get("topic") || "all");
    const [sortBy, setSortBy] = useState(searchParams.get("sortBy") || "createdAt");
    const [sortOrder, setSortOrder] = useState(searchParams.get("sortOrder") || "desc");

    const updateFilters = useCallback(
        (params: Record<string, string | null>) => {
            const newSearchParams = new URLSearchParams(searchParams.toString());
            let somethingChanged = false;

            for (const [key, value] of Object.entries(params)) {
                const oldValue = newSearchParams.get(key) || "all";
                const normalized = (oldValue === "all") ? null : oldValue;

                if (value === null || value === "all") {
                    if (normalized !== null) {
                        newSearchParams.delete(key);
                        somethingChanged = true;
                    }
                } else {
                    if (value !== normalized) {
                        newSearchParams.set(key, value);
                        somethingChanged = true;
                    }
                }
            }

            if (somethingChanged) {
                if (Object.keys(params).some((key) => key !== "page")) {
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
            if (search) {
                updateFilters({ search });
            } else {
                updateFilters({ search: null });
            }
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [search, updateFilters]);

    const sectionsItems = [
        { value: "all", label: "All Sections" },
        ...sections.map(section => ({
            value: section.id.toString(),
            label: section.title
        }))
    ];

    const topicsItems = [
        { value: "all", label: "All Topics" },
        ...topics.map(topic => ({
            value: topic.id.toString(),
            label: topic.title
        }))
    ];

    const sortOptions = [
        { value: "createdAt", label: "Created Date" },
        { value: "id", label: "ID" },
        { value: "text", label: "Question Text" },
    ];

    const handleSortChange = (newSortBy: string) => {
        setSortBy(newSortBy);
        updateFilters({ sortBy: newSortBy });
    };

    const handleSortOrderChange = () => {
        const newSortOrder = sortOrder === "asc" ? "desc" : "asc";
        setSortOrder(newSortOrder);
        updateFilters({ sortOrder: newSortOrder });
    };

    const getSortIcon = () => {
        if (sortOrder === "asc") {
            return <ArrowUp className="h-4 w-4" />;
        }
        return <ArrowDown className="h-4 w-4" />;
    };

    const clearAllFilters = () => {
        setSearch("");
        setSection("all");
        setTopic("all");
        setSortBy("createdAt");
        setSortOrder("desc");
        updateFilters({ 
            search: null, 
            section: null, 
            topic: null, 
            sortBy: null, 
            sortOrder: null 
        });
    };

    const hasActiveFilters = search || section !== "all" || topic !== "all" || sortBy !== "createdAt" || sortOrder !== "desc";

    return (
        <div className="flex gap-4 flex-wrap items-center">
            <Input
                placeholder="Search questions..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="max-w-sm"
            />
            <Combobox
                items={sectionsItems}
                value={section}
                onValueChange={(value) => {
                    setSection(value);
                    updateFilters({ section: value });
                }}
                placeholder="Filter by section"
                className="w-[200px]"
            />
            <Combobox
                items={topicsItems}
                value={topic}
                onValueChange={(value) => {
                    setTopic(value);
                    updateFilters({ topic: value });
                }}
                placeholder="Filter by topic"
                className="w-[200px]"
            />
            <Select value={sortBy} onValueChange={handleSortChange}>
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                    {sortOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                            {option.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <Button
                variant="outline"
                size="icon"
                onClick={handleSortOrderChange}
                className="w-10"
            >
                {getSortIcon()}
            </Button>
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