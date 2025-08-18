"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Combobox } from "@/components/ui/combobox";

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

    return (
        <div className="flex gap-4">
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
        </div>
    );
}