"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { paymentsApi } from "@/lib/api/payments";
import { usersApi, User } from "@/lib/api/users";
import { s3Api } from "@/lib/api/s3";
import { toast } from "@/hooks/use-toast";
import { Upload, X, FileText, Loader2, Search } from "lucide-react";

const currencies = ["KGS", "USD"];

export default function ManualPaymentPage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [searchResults, setSearchResults] = useState<User[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);

    const [amount, setAmount] = useState("");
    const [currency, setCurrency] = useState("KGS");
    const [receiptUrl, setReceiptUrl] = useState("");
    const [receiptFileName, setReceiptFileName] = useState("");
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Close search dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
                setShowResults(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleUserSearch = async (value: string) => {
        setSearchTerm(value);
        setSelectedUser(null);
        if (value.length >= 2) {
            setIsSearching(true);
            setShowResults(true);
            try {
                const response = await usersApi.getUsers({ search: value, size: 10 });
                setSearchResults(response.content);
            } catch (error) {
                console.error("Failed to search users:", error);
                setSearchResults([]);
            } finally {
                setIsSearching(false);
            }
        } else {
            setSearchResults([]);
            setShowResults(false);
        }
    };

    const selectUser = (user: User) => {
        setSelectedUser(user);
        setSearchTerm(user.username);
        setShowResults(false);
    };

    const clearUser = () => {
        setSelectedUser(null);
        setSearchTerm("");
        setSearchResults([]);
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const allowed = ["image/jpeg", "image/png", "image/jpg", "application/pdf"];
        if (!allowed.includes(file.type)) {
            toast({ title: "Invalid file", description: "Please upload an image (JPG, PNG) or PDF.", variant: "destructive" });
            return;
        }
        if (file.size > 10 * 1024 * 1024) {
            toast({ title: "File too large", description: "Maximum file size is 10MB.", variant: "destructive" });
            return;
        }

        setIsUploading(true);
        try {
            const url = await s3Api.uploadFile(file, "receipts");
            setReceiptUrl(url);
            setReceiptFileName(file.name);
            toast({ title: "Uploaded", description: "Receipt uploaded successfully." });
        } catch (error) {
            console.error("Upload failed:", error);
            toast({ title: "Upload failed", description: error instanceof Error ? error.message : "Failed to upload file.", variant: "destructive" });
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const clearReceipt = () => {
        setReceiptUrl("");
        setReceiptFileName("");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedUser) {
            toast({ title: "No user selected", description: "Please search and select a user.", variant: "destructive" });
            return;
        }
        if (!amount || parseFloat(amount) <= 0) {
            toast({ title: "Invalid amount", description: "Please enter a valid amount.", variant: "destructive" });
            return;
        }
        if (!receiptUrl) {
            toast({ title: "No receipt", description: "Please upload a receipt file.", variant: "destructive" });
            return;
        }

        setIsSubmitting(true);
        try {
            await paymentsApi.createManualPayment({
                userId: selectedUser.id,
                amount: parseFloat(amount),
                currency,
                receiptUrl,
            });
            toast({ title: "Payment created", description: "Manual payment created successfully." });
            router.push("/admin/payments");
        } catch (error) {
            console.error("Failed to create payment:", error);
            toast({ title: "Error", description: error instanceof Error ? error.message : "Failed to create payment.", variant: "destructive" });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto py-8">
            <Card>
                <CardHeader>
                    <CardTitle>Create Manual Payment</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* User Search */}
                        <div className="space-y-2" ref={searchRef}>
                            <Label>User</Label>
                            {selectedUser ? (
                                <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/50">
                                    <div>
                                        <p className="font-medium text-sm">
                                            {selectedUser.firstName} {selectedUser.lastName}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            @{selectedUser.username}
                                            {selectedUser.phone && ` · ${selectedUser.phone}`}
                                        </p>
                                    </div>
                                    <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={clearUser}>
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            ) : (
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        value={searchTerm}
                                        onChange={(e) => handleUserSearch(e.target.value)}
                                        onFocus={() => searchResults.length > 0 && setShowResults(true)}
                                        placeholder="Search by username, name, or phone..."
                                        className="pl-9"
                                    />
                                    {showResults && (
                                        <div className="absolute z-10 w-full mt-1 border rounded-md bg-popover shadow-md max-h-60 overflow-y-auto">
                                            {isSearching ? (
                                                <div className="flex items-center justify-center py-4 text-sm text-muted-foreground">
                                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                    Searching...
                                                </div>
                                            ) : searchResults.length === 0 ? (
                                                <div className="py-4 text-center text-sm text-muted-foreground">
                                                    No users found
                                                </div>
                                            ) : (
                                                searchResults.map((user) => (
                                                    <button
                                                        key={user.id}
                                                        type="button"
                                                        className="w-full text-left px-3 py-2 hover:bg-accent transition-colors"
                                                        onClick={() => selectUser(user)}
                                                    >
                                                        <p className="text-sm font-medium">
                                                            {user.firstName} {user.lastName}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            @{user.username}
                                                            {user.phone && ` · ${user.phone}`}
                                                        </p>
                                                    </button>
                                                ))
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Amount & Currency */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Amount</Label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    min="0.01"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="0.00"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Currency</Label>
                                <Select value={currency} onValueChange={setCurrency}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {currencies.map((c) => (
                                            <SelectItem key={c} value={c}>{c}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Receipt Upload */}
                        <div className="space-y-2">
                            <Label>Receipt (image or PDF)</Label>
                            {receiptUrl ? (
                                <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/50">
                                    <div className="flex items-center gap-2 min-w-0">
                                        <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                                        <span className="text-sm truncate">{receiptFileName}</span>
                                    </div>
                                    <Button type="button" variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={clearReceipt}>
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            ) : (
                                <div className="relative">
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/jpeg,image/png,image/jpg,application/pdf"
                                        onChange={handleFileUpload}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        disabled={isUploading}
                                    />
                                    <div className="flex items-center justify-center gap-2 p-6 border-2 border-dashed rounded-lg text-sm text-muted-foreground hover:border-foreground/30 transition-colors">
                                        {isUploading ? (
                                            <>
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                Uploading...
                                            </>
                                        ) : (
                                            <>
                                                <Upload className="h-4 w-4" />
                                                Click to upload receipt
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end gap-3 pt-2">
                            <Button type="button" variant="outline" onClick={() => router.push("/admin/payments")}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmitting || isUploading}>
                                {isSubmitting ? "Creating..." : "Create Payment"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
