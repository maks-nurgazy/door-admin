"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Eye, FileText, Link } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ReadingPassage, ReadingPassageListItem, readingPassagesApi, UpdateReadingPassageDto } from "@/lib/api/reading-passages";
import { PassageForm } from "./passage-form";
import { toast } from "@/hooks/use-toast";

interface PassagesTableProps {
    initialData: ReadingPassageListItem[];
}

export function PassagesTable({ initialData }: PassagesTableProps) {
    const router = useRouter();
    const [editPassage, setEditPassage] = useState<ReadingPassage | null>(null);
    const [viewPassage, setViewPassage] = useState<ReadingPassageListItem | null>(null);
    const [viewDetail, setViewDetail] = useState<ReadingPassage | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<ReadingPassageListItem | null>(null);
    const [saving, setSaving] = useState(false);

    const handleView = async (item: ReadingPassageListItem) => {
        setViewPassage(item);
        try {
            const detail = await readingPassagesApi.getPassageById(item.id);
            setViewDetail(detail);
        } catch {
            setViewDetail(null);
        }
    };

    const handleEdit = async (item: ReadingPassageListItem) => {
        try {
            const detail = await readingPassagesApi.getPassageById(item.id);
            setEditPassage(detail);
        } catch (err) {
            toast({ title: "Error", description: "Failed to load passage", variant: "destructive" });
        }
    };

    const handleUpdate = async (data: UpdateReadingPassageDto) => {
        if (!editPassage) return;
        setSaving(true);
        try {
            await readingPassagesApi.updatePassage(editPassage.id, data);
            toast({ title: "Success", description: "Passage updated successfully" });
            setEditPassage(null);
            router.refresh();
        } catch (err) {
            toast({ title: "Error", description: err instanceof Error ? err.message : "Failed to update passage", variant: "destructive" });
        } finally {
            setSaving(false);
        }
    };

    const confirmDelete = async () => {
        if (!deleteTarget) return;
        try {
            await readingPassagesApi.deletePassage(deleteTarget.id);
            toast({ title: "Success", description: "Passage deleted" });
            router.refresh();
        } catch (err) {
            toast({ title: "Error", description: err instanceof Error ? err.message : "Failed to delete", variant: "destructive" });
        } finally {
            setDeleteTarget(null);
        }
    };

    const fmt = (iso: string) => new Date(iso).toLocaleDateString();

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle>Reading Passages ({initialData.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    {initialData.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8">No passages yet. Click "Add Passage" to create one.</p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Title</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead>Content</TableHead>
                                    <TableHead>Questions</TableHead>
                                    <TableHead>Created</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {initialData.map((passage) => (
                                    <TableRow key={passage.id}>
                                        <TableCell className="font-medium">{passage.title}</TableCell>
                                        <TableCell className="text-muted-foreground max-w-xs truncate">
                                            {passage.description || <span className="italic">—</span>}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex gap-1">
                                                {passage.hasText && (
                                                    <Badge variant="secondary" className="gap-1">
                                                        <FileText className="h-3 w-3" /> Text
                                                    </Badge>
                                                )}
                                                {passage.hasFile && (
                                                    <Badge variant="outline" className="gap-1">
                                                        <Link className="h-3 w-3" /> File
                                                    </Badge>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{passage.questionCount}</Badge>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground text-sm">
                                            {fmt(passage.createdAt)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-1">
                                                <Button variant="ghost" size="icon" onClick={() => handleView(passage)}>
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" onClick={() => handleEdit(passage)}>
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-destructive hover:text-destructive"
                                                    onClick={() => setDeleteTarget(passage)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* View dialog */}
            <Dialog open={!!viewPassage} onOpenChange={(o) => { if (!o) { setViewPassage(null); setViewDetail(null); } }}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{viewPassage?.title}</DialogTitle>
                    </DialogHeader>
                    {viewDetail ? (
                        <div className="space-y-3 text-sm">
                            {viewDetail.description && (
                                <p className="text-muted-foreground">{viewDetail.description}</p>
                            )}
                            {viewDetail.passageFileUrl && (
                                <p>
                                    <span className="font-medium">File URL: </span>
                                    <a href={viewDetail.passageFileUrl} target="_blank" rel="noreferrer" className="underline text-primary break-all">
                                        {viewDetail.passageFileUrl}
                                    </a>
                                </p>
                            )}
                            {viewDetail.passageText && (
                                <pre className="whitespace-pre-wrap font-sans bg-muted p-3 rounded text-sm leading-relaxed max-h-96 overflow-y-auto">
                                    {viewDetail.passageText}
                                </pre>
                            )}
                        </div>
                    ) : (
                        <p className="text-muted-foreground">Loading...</p>
                    )}
                </DialogContent>
            </Dialog>

            {/* Edit dialog */}
            <Dialog open={!!editPassage} onOpenChange={(o) => { if (!o) setEditPassage(null); }}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Edit Passage</DialogTitle>
                    </DialogHeader>
                    {editPassage && (
                        <PassageForm
                            passage={editPassage}
                            onSubmit={handleUpdate}
                            onCancel={() => setEditPassage(null)}
                            saving={saving}
                        />
                    )}
                </DialogContent>
            </Dialog>

            {/* Delete confirmation */}
            <AlertDialog open={!!deleteTarget} onOpenChange={(o) => { if (!o) setDeleteTarget(null); }}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Passage?</AlertDialogTitle>
                        <AlertDialogDescription>
                            "{deleteTarget?.title}" will be permanently deleted.
                            {(deleteTarget?.questionCount ?? 0) > 0 && (
                                <span className="block mt-1 font-medium text-destructive">
                                    This passage has {deleteTarget?.questionCount} linked question(s) — deleting it will unlink them.
                                </span>
                            )}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
