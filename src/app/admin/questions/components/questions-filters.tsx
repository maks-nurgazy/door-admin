"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Section, sectionsApi } from "@/lib/api/sections";
import { Topic, topicsApi } from "@/lib/api/topics";
import { Combobox, ComboboxItem } from "@/components/ui/combobox";

interface QuestionsFiltersProps {
    sections: Section[];
    topics: Topic[];
}

export function QuestionsFilters({ sections: initialSections, topics: initialTopics }: QuestionsFiltersProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();

    const [search, setSearch] = useState(searchParams.get("search") || "");
    const [section, setSection] = useState(searchParams.get("section") || "all");
    const [topic, setTopic] = useState(searchParams.get("topic") || "all");

    // State for sections
    const [sections, setSections] = useState<Section[]>(initialSections || []);
    const [sectionsPage, setSectionsPage] = useState(0);
    const [hasMoreSections, setHasMoreSections] = useState(true);
    const [loadingSections, setLoadingSections] = useState(false);
    const [sectionSearch, setSectionSearch] = useState("");

    // State for topics
    const [topics, setTopics] = useState<Topic[]>(initialTopics || []);
    const [topicsPage, setTopicsPage] = useState(0);
    const [hasMoreTopics, setHasMoreTopics] = useState(true);
    const [loadingTopics, setLoadingTopics] = useState(false);
    const [topicSearch, setTopicSearch] = useState("");

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

    // Load more sections
    const loadMoreSections = useCallback(async () => {
        if (!hasMoreSections || loadingSections) return;

        setLoadingSections(true);
        try {
            const response = await sectionsApi.getSections({
                page: sectionsPage + 1,
                search: sectionSearch,
                size: 10
            });

            if (response.data.length > 0) {
                setSections(prev => [...prev, ...response.data]);
                setSectionsPage(prev => prev + 1);
            }
            setHasMoreSections(response.currentPage < response.totalPages - 1);
        } catch (error) {
            console.error('Failed to load more sections:', error);
        } finally {
            setLoadingSections(false);
        }
    }, [sectionsPage, sectionSearch, hasMoreSections, loadingSections]);

    // Load more topics
    const loadMoreTopics = useCallback(async () => {
        if (!hasMoreTopics || loadingTopics) return;

        setLoadingTopics(true);
        try {
            const response = await topicsApi.getTopics({
                page: topicsPage + 1,
                search: topicSearch,
                size: 10
            });

            if (response.data.length > 0) {
                setTopics(prev => [...prev, ...response.data]);
                setTopicsPage(prev => prev + 1);
            }
            setHasMoreTopics(response.currentPage < response.totalPages - 1);
        } catch (error) {
            console.error('Failed to load more topics:', error);
        } finally {
            setLoadingTopics(false);
        }
    }, [topicsPage, topicSearch, hasMoreTopics, loadingTopics]);

    // Handle section search
    const handleSectionSearch = useCallback(async (value: string) => {
        setSectionSearch(value);
        setLoadingSections(true);
        try {
            const response = await sectionsApi.getSections({
                search: value,
                page: 0,
                size: 10
            });
            setSections(response.data);
            setSectionsPage(0);
            setHasMoreSections(response.currentPage < response.totalPages - 1);
        } catch (error) {
            console.error('Failed to search sections:', error);
        } finally {
            setLoadingSections(false);
        }
    }, []);

    // Handle topic search
    const handleTopicSearch = useCallback(async (value: string) => {
        setTopicSearch(value);
        setLoadingTopics(true);
        try {
            const response = await topicsApi.getTopics({
                search: value,
                page: 0,
                size: 10
            });
            setTopics(response.data);
            setTopicsPage(0);
            setHasMoreTopics(response.currentPage < response.totalPages - 1);
        } catch (error) {
            console.error('Failed to search topics:', error);
        } finally {
            setLoadingTopics(false);
        }
    }, []);

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

    const sectionsItems: ComboboxItem[] = [
        { value: "all", label: "All Sections" },
        ...(sections || []).map(section => ({
            value: section.title,
            label: section.title
        }))
    ];

    const topicsItems: ComboboxItem[] = [
        { value: "all", label: "All Topics" },
        ...(topics || []).map(topic => ({
            value: topic.title,
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
                searchPlaceholder="Search sections..."
                onSearch={handleSectionSearch}
                onScrollEnd={loadMoreSections}
                loading={loadingSections}
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
                searchPlaceholder="Search topics..."
                onSearch={handleTopicSearch}
                onScrollEnd={loadMoreTopics}
                loading={loadingTopics}
                className="w-[200px]"
            />
        </div>
    );
}