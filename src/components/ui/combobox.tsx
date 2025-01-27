"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

export interface ComboboxItem {
    value: string;
    label: string;
}

interface ComboboxProps {
    items: ComboboxItem[];
    value?: string;
    onValueChange: (value: string) => void;
    placeholder?: string;
    searchPlaceholder?: string;
    emptyText?: string;
    className?: string;
    onSearch?: (value: string) => void;
    onScrollEnd?: () => void;
    loading?: boolean;
}

export function Combobox({
                             items = [],
                             value,
                             onValueChange,
                             placeholder = "Select an item",
                             searchPlaceholder = "Search items...",
                             emptyText = "No items found.",
                             className,
                             onSearch,
                             onScrollEnd,
                             loading = false,
                         }: ComboboxProps) {
    const [open, setOpen] = React.useState(false);
    const commandRef = React.useRef<HTMLDivElement>(null);

    const handleScroll = React.useCallback(() => {
        if (!commandRef.current || !onScrollEnd) return;

        const { scrollTop, scrollHeight, clientHeight } = commandRef.current;
        if (scrollTop + clientHeight >= scrollHeight - 10 && !loading) {
            onScrollEnd();
        }
    }, [onScrollEnd, loading]);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn("justify-between", className)}
                >
                    {value
                        ? items.find((item) => item.value === value)?.label || placeholder
                        : placeholder}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0" align="start">
                <Command shouldFilter={false}>
                    <CommandInput
                        placeholder={searchPlaceholder}
                        onValueChange={onSearch}
                    />
                    <div
                        className="max-h-[200px] overflow-y-auto"
                        onScroll={handleScroll}
                        ref={commandRef}
                    >
                        <CommandEmpty>{emptyText}</CommandEmpty>
                        <CommandGroup>
                            {items.map((item) => (
                                <CommandItem
                                    key={item.value}
                                    value={item.value}
                                    onSelect={() => {
                                        onValueChange(item.value);
                                        setOpen(false);
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            value === item.value ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    {item.label}
                                </CommandItem>
                            ))}
                            {loading && (
                                <div className="py-2 px-3 text-sm text-muted-foreground text-center">
                                    Loading more...
                                </div>
                            )}
                        </CommandGroup>
                    </div>
                </Command>
            </PopoverContent>
        </Popover>
    );
}