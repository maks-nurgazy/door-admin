"use client";

import { useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { paymentsApi } from "@/lib/api/payments";
import { usersApi } from "@/lib/api/users";

const paymentMethods = [
    "Bank Transfer",
    "Cash",
    "Credit Card",
    "Mobile Payment",
];

const currencies = ["USD", "KGS"];

export default function ManualPaymentPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [formData, setFormData] = useState({
        amount: "",
        currency: "USD",
        paymentMethod: "Bank Transfer",
        notes: "",
    });

    const handleUserSearch = async (value: string) => {
        setSearchTerm(value);
        if (value.length >= 3) {
            try {
                const response = await usersApi.getUsers({ name: value });
                setSearchResults(response.data);
            } catch (error) {
                console.error('Failed to search users:', error);
            }
        } else {
            setSearchResults([]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedUser) return;

        setIsLoading(true);
        try {
            await paymentsApi.createPayment({
                userId: selectedUser.id,
                amount: parseFloat(formData.amount),
                currency: formData.currency,
                paymentMethod: formData.paymentMethod,
                notes: formData.notes,
            });
            router.push("/admin/payments");
        } catch (error) {
            console.error('Failed to create payment:', error);
        } finally {
            setIsLoading(false);
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
                        <div className="space-y-2">
                            <Label>Search User</Label>
                            <Input
                                value={searchTerm}
                                onChange={(e) => handleUserSearch(e.target.value)}
                                placeholder="Search by name..."
                            />
                            {searchResults.length > 0 && !selectedUser && (
                                <div className="mt-2 border rounded-md divide-y">
                                    {searchResults.map((user) => (
                                        <div
                                            key={user.id}
                                            className="p-2 hover:bg-gray-50 cursor-pointer"
                                            onClick={() => {
                                                setSelectedUser(user);
                                                setSearchTerm(`${user.firstName} ${user.lastName}`);
                                                setSearchResults([]);
                                            }}
                                        >
                                            <div className="font-medium">{`${user.firstName} ${user.lastName}`}</div>
                                            <div className="text-sm text-gray-500">{user.phone}</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {selectedUser && (
                            <>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Amount</Label>
                                        <Input
                                            type="number"
                                            value={formData.amount}
                                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                            placeholder="Enter amount"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Currency</Label>
                                        <Select
                                            value={formData.currency}
                                            onValueChange={(value) => setFormData({ ...formData, currency: value })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {currencies.map((currency) => (
                                                    <SelectItem key={currency} value={currency}>
                                                        {currency}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Payment Method</Label>
                                    <Select
                                        value={formData.paymentMethod}
                                        onValueChange={(value) => setFormData({ ...formData, paymentMethod: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {paymentMethods.map((method) => (
                                                <SelectItem key={method} value={method}>
                                                    {method}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Notes</Label>
                                    <Textarea
                                        value={formData.notes}
                                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                        placeholder="Add any additional notes..."
                                    />
                                </div>

                                <div className="flex justify-end gap-3">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => router.push("/admin/payments")}
                                    >
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={isLoading}>
                                        {isLoading ? "Creating..." : "Create Payment"}
                                    </Button>
                                </div>
                            </>
                        )}
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}