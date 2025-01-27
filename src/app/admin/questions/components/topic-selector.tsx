"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Check, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { TopicShortDto } from "@/lib/api/topics";

interface TopicSelectorProps {
    topics: TopicShortDto[];
    selectedTopics: number[];
    onChange: (topics: number[]) => void;
    onTopicsChange: (topics: number[]) => void;
}

export function TopicSelector({ topics, selectedTopics, onChange, onTopicsChange }: TopicSelectorProps) {
    const [isTopicsOpen, setIsTopicsOpen] = useState(false);
    const [topicSearch, setTopicSearch] = useState("");

    const toggleTopic = (topicId: number) => {
        const newTopics = selectedTopics.includes(topicId)
            ? selectedTopics.filter(id => id !== topicId)
            : [...selectedTopics, topicId];

        onChange(newTopics);
        onTopicsChange(newTopics);
    };

    const filteredTopics = topics.filter(topic =>
        topic.title.toLowerCase().includes(topicSearch.toLowerCase())
    );

    return (
        <div className="space-y-2">
            <div className="relative">
                <Button
                    type="button"
                    variant="outline"
                    role="combobox"
                    aria-expanded={isTopicsOpen}
                    className="w-full justify-between"
                    onClick={() => setIsTopicsOpen(!isTopicsOpen)}
                >
          <span className={selectedTopics.length === 0 ? "text-muted-foreground" : undefined}>
            {selectedTopics.length > 0
                ? `${selectedTopics.length} topic${selectedTopics.length === 1 ? "" : "s"} selected`
                : "Select topics"}
          </span>
                    <Plus className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
                {isTopicsOpen && (
                    <div className="absolute z-10 w-full mt-2 rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in">
                        <div className="p-2">
                            <Input
                                placeholder="Search topics..."
                                value={topicSearch}
                                onChange={(e) => setTopicSearch(e.target.value)}
                                className="h-8"
                            />
                        </div>
                        <ScrollArea className="h-[200px]">
                            <div className="p-2">
                                {filteredTopics.length === 0 ? (
                                    <p className="text-sm text-center py-6 text-muted-foreground">
                                        No topics found
                                    </p>
                                ) : (
                                    filteredTopics.map((topic) => (
                                        <div
                                            key={topic.id}
                                            className={cn(
                                                "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
                                                selectedTopics.includes(topic.id) && "bg-accent"
                                            )}
                                            onClick={() => toggleTopic(topic.id)}
                                        >
                                            <Check
                                                className={cn(
                                                    "mr-2 h-4 w-4",
                                                    selectedTopics.includes(topic.id) ? "opacity-100" : "opacity-0"
                                                )}
                                            />
                                            <span>{topic.title}</span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </ScrollArea>
                    </div>
                )}
            </div>
            {selectedTopics.length > 0 && (
                <div className="flex gap-1 flex-wrap mt-2">
                    {selectedTopics.map((topicId) => {
                        const topic = topics.find((t) => t.id === topicId);
                        return topic ? (
                            <Badge
                                key={topic.id}
                                variant="secondary"
                                className="mr-1"
                            >
                                {topic.title}
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-4 w-4 ml-1 hover:bg-transparent"
                                    onClick={() => toggleTopic(topic.id)}
                                >
                                    <Plus className="h-3 w-3 rotate-45" />
                                </Button>
                            </Badge>
                        ) : null;
                    })}
                </div>
            )}
        </div>
    );
}