"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { PassageForm } from "./passage-form";
import { readingPassagesApi, CreateReadingPassageDto } from "@/lib/api/reading-passages";
import { toast } from "@/hooks/use-toast";

export function PassagesHeader() {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [saving, setSaving] = useState(false);

    const handleCreate = async (data: CreateReadingPassageDto) => {
        setSaving(true);
        try {
            await readingPassagesApi.createPassage(data);
            toast({ title: "Success", description: "Passage created successfully" });
            setOpen(false);
            router.refresh();
        } catch (err) {
            console.error("Create passage error:", err);
            toast({ title: "Error", description: err instanceof Error ? err.message : "Failed to create passage", variant: "destructive" });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Reading Passages</h1>
                <p className="text-muted-foreground text-sm">Manage reading passages for comprehension questions</p>
            </div>
            <Button onClick={() => setOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Passage
            </Button>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Add Reading Passage</DialogTitle>
                    </DialogHeader>
                    <PassageForm
                        onSubmit={handleCreate}
                        onCancel={() => setOpen(false)}
                        saving={saving}
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
}
