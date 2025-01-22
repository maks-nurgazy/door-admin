"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { UserFilters } from "@/lib/api/users";

interface UsersFiltersProps {
    onFiltersChange: (filters: UserFilters) => void;
}

export function UsersFilters({ onFiltersChange }: UsersFiltersProps) {
    const [name, setName] = useState("");
    const [status, setStatus] = useState("all");
    const [paymentStatus, setPaymentStatus] = useState("all");

    useEffect(() => {
        const filters: UserFilters = {};

        if (name) filters.name = name;
        if (status !== "all") filters.status = status as UserFilters["status"];
        if (paymentStatus !== "all") filters.paymentStatus = paymentStatus as UserFilters["paymentStatus"];

        onFiltersChange(filters);
    }, [name, status, paymentStatus, onFiltersChange]);

    return (
        <div className="flex gap-4 flex-wrap">
            <Input
                placeholder="Search by name..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="max-w-xs"
            />
            <Select
                value={status}
                onValueChange={setStatus}
            >
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="APPROVED">Approved</SelectItem>
                    <SelectItem value="BANNED">Banned</SelectItem>
                </SelectContent>
            </Select>
            <Select
                value={paymentStatus}
                onValueChange={setPaymentStatus}
            >
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by payment" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Payments</SelectItem>
                    <SelectItem value="PAID">Paid</SelectItem>
                    <SelectItem value="UNPAID">Unpaid</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                </SelectContent>
            </Select>
        </div>
    );
}