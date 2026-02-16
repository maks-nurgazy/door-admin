"use client";

import { useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { TextContent, DisplayType } from "@/lib/api/questions";
import { s3Api } from "@/lib/api/s3";

interface TextContentInputProps {
    value: TextContent;
    onChange: (v: TextContent) => void;
    folder?: string;
    rows?: number;
    placeholder?: string;
}

const TYPE_BUTTONS: { value: DisplayType; label: string }[] = [
    { value: 'TEXT', label: 'Text' },
    { value: 'LATEX', label: 'LaTeX' },
    { value: 'SVG', label: 'SVG' },
    { value: 'IMAGE', label: 'Image' },
    { value: 'NONE', label: 'None' },
];

export function TextContentInput({ value, onChange, folder = 'questions', rows, placeholder }: TextContentInputProps) {
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleTypeChange = (newType: DisplayType) => {
        onChange({ displayType: newType, value: newType === 'NONE' ? '' : value.value });
    };

    const handleValueChange = (newValue: string) => {
        onChange({ ...value, value: newValue });
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        try {
            const url = await s3Api.uploadFile(file, folder);
            onChange({ ...value, value: url });
        } catch (err) {
            console.error('Upload failed:', err);
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    return (
        <div className="flex flex-col gap-2">
            {/* Type switcher — compact pill group */}
            <div className="flex gap-1 flex-wrap">
                {TYPE_BUTTONS.map((btn) => (
                    <button
                        key={btn.value}
                        type="button"
                        onClick={() => handleTypeChange(btn.value)}
                        className={cn(
                            "px-2.5 py-0.5 rounded-full text-xs font-medium border transition-colors",
                            value.displayType === btn.value
                                ? "bg-primary text-primary-foreground border-primary"
                                : "bg-background text-muted-foreground border-border hover:border-muted-foreground/60 hover:text-foreground"
                        )}
                    >
                        {btn.label}
                    </button>
                ))}
            </div>

            {value.displayType === 'NONE' && (
                <span className="text-sm text-muted-foreground italic py-1">(no content)</span>
            )}

            {value.displayType === 'TEXT' && (
                rows ? (
                    <Textarea
                        value={value.value}
                        onChange={(e) => handleValueChange(e.target.value)}
                        rows={rows}
                        placeholder={placeholder}
                        className="resize-none"
                    />
                ) : (
                    <Input
                        value={value.value}
                        onChange={(e) => handleValueChange(e.target.value)}
                        placeholder={placeholder}
                    />
                )
            )}

            {(value.displayType === 'LATEX' || value.displayType === 'SVG') && (
                <Textarea
                    value={value.value}
                    onChange={(e) => handleValueChange(e.target.value)}
                    rows={rows ?? 3}
                    placeholder={placeholder ?? (value.displayType === 'LATEX' ? 'e.g. \\frac{x}{2} + 3 = 0' : 'SVG markup...')}
                    className="font-mono text-sm resize-none"
                />
            )}

            {value.displayType === 'IMAGE' && (
                <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                        <Input
                            value={value.value}
                            onChange={(e) => handleValueChange(e.target.value)}
                            placeholder="Image URL"
                            className="flex-1"
                        />
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploading}
                        >
                            {uploading ? 'Uploading...' : 'Upload'}
                        </Button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleFileUpload}
                        />
                    </div>
                    {value.value && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={value.value} alt="preview" className="max-h-32 rounded-md border object-contain" />
                    )}
                </div>
            )}
        </div>
    );
}
