"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { UserTestAccessForm } from "./user-test-access-form";

interface UserTestAccessHeaderProps {
    onSuccess?: () => void;
}

export function UserTestAccessHeader({ onSuccess }: UserTestAccessHeaderProps) {
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

    return (
        <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">User Test Access Management</h1>
            <div className="flex gap-3">
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Grant Access
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
                        <DialogHeader>
                            <DialogTitle>Grant Test Access to User</DialogTitle>
                        </DialogHeader>
                        <div className="flex-1 overflow-y-auto px-1">
                            <UserTestAccessForm
                                onSuccess={() => {
                                    setIsAddDialogOpen(false);
                                    onSuccess?.();
                                }}
                                onCancel={() => setIsAddDialogOpen(false)}
                            />
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}
