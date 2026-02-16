"use client";

import { useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CheckCircle2, XCircle, ExternalLink } from "lucide-react";
import { Payment, PaymentStatus, PaymentsResponse, paymentsApi } from "@/lib/api/payments";
import { format } from "date-fns";
import { TablePagination } from "@/components/table-pagination";

interface PaymentsTableProps {
    initialData: PaymentsResponse;
}

const STATUS_BADGE: Record<PaymentStatus, { label: string; className: string }> = {
    PENDING:    { label: "Pending",    className: "bg-yellow-100 text-yellow-800 border-yellow-200" },
    SUBMITTED:  { label: "Submitted",  className: "bg-blue-100 text-blue-800 border-blue-200" },
    PROCESSING: { label: "Processing", className: "bg-purple-100 text-purple-800 border-purple-200" },
    APPROVED:   { label: "Approved",   className: "bg-emerald-100 text-emerald-800 border-emerald-200" },
    COMPLETED:  { label: "Completed",  className: "bg-green-100 text-green-800 border-green-200" },
    FAILED:     { label: "Failed",     className: "bg-red-100 text-red-800 border-red-200" },
    REJECTED:   { label: "Rejected",   className: "bg-rose-100 text-rose-800 border-rose-200" },
    REFUNDED:   { label: "Refunded",   className: "bg-slate-100 text-slate-700 border-slate-200" },
};

function StatusBadge({ status }: { status: PaymentStatus }) {
    const cfg = STATUS_BADGE[status] ?? { label: status, className: "bg-gray-100 text-gray-700 border-gray-200" };
    return (
        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${cfg.className}`}>
            {cfg.label}
        </span>
    );
}

function formatName(payment: Payment) {
    const first = payment.userFirstName ?? "";
    const last = payment.userLastName ?? "";
    const full = `${first} ${last}`.trim();
    return full || payment.userUsername;
}

function formatDate(iso: string | null) {
    if (!iso) return "—";
    try { return format(new Date(iso), "MMM dd, yyyy"); } catch { return iso; }
}

const APPROVABLE: PaymentStatus[] = ["SUBMITTED", "PROCESSING"];
const REJECTABLE: PaymentStatus[] = ["SUBMITTED", "PROCESSING", "PENDING"];

export function PaymentsTable({ initialData }: PaymentsTableProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [data, setData] = useState<PaymentsResponse>(initialData);

    // Approve dialog
    const [approveTarget, setApproveTarget] = useState<Payment | null>(null);
    const [approveNotes, setApproveNotes] = useState("");
    const [approving, setApproving] = useState(false);

    // Reject dialog
    const [rejectTarget, setRejectTarget] = useState<Payment | null>(null);
    const [rejectReason, setRejectReason] = useState("");
    const [rejecting, setRejecting] = useState(false);

    const currentPage = searchParams.get("page") ? parseInt(searchParams.get("page")!) - 1 : 0;

    const refreshData = async () => {
        const status = searchParams.get("status") as PaymentStatus | null;
        const page = searchParams.get("page") ? parseInt(searchParams.get("page")!) - 1 : 0;
        const fresh = await paymentsApi.getPayments({ status: status ?? undefined, page });
        setData(fresh);
    };

    const handlePageChange = (newPage: number) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("page", (newPage + 1).toString());
        router.push(`${pathname}?${params.toString()}`);
    };

    const handleApprove = async () => {
        if (!approveTarget) return;
        setApproving(true);
        try {
            await paymentsApi.approvePayment(approveTarget.id, approveNotes.trim() || undefined);
            setApproveTarget(null);
            setApproveNotes("");
            await refreshData();
        } catch (err) {
            console.error("Failed to approve payment", err);
        } finally {
            setApproving(false);
        }
    };

    const handleReject = async () => {
        if (!rejectTarget || !rejectReason.trim()) return;
        setRejecting(true);
        try {
            await paymentsApi.rejectPayment(rejectTarget.id, rejectReason.trim());
            setRejectTarget(null);
            setRejectReason("");
            await refreshData();
        } catch (err) {
            console.error("Failed to reject payment", err);
        } finally {
            setRejecting(false);
        }
    };

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle>Payments List</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>User</TableHead>
                                <TableHead>Phone</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Method</TableHead>
                                <TableHead>Submitted</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Receipt</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.content.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center text-muted-foreground py-10">
                                        No payments found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                data.content.map((payment) => (
                                    <TableRow key={payment.id}>
                                        <TableCell className="font-medium">
                                            <div>{formatName(payment)}</div>
                                            <div className="text-xs text-muted-foreground">@{payment.userUsername}</div>
                                        </TableCell>
                                        <TableCell>{payment.userPhone ?? "—"}</TableCell>
                                        <TableCell className="font-mono">
                                            {payment.amount} {payment.currency}
                                        </TableCell>
                                        <TableCell className="text-sm">{payment.paymentMethod}</TableCell>
                                        <TableCell className="text-sm">{formatDate(payment.submittedAt ?? payment.createdAt)}</TableCell>
                                        <TableCell><StatusBadge status={payment.status} /></TableCell>
                                        <TableCell>
                                            {payment.receiptUrl ? (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => window.open(payment.receiptUrl!, "_blank")}
                                                    title="View receipt"
                                                >
                                                    <ExternalLink className="h-4 w-4" />
                                                </Button>
                                            ) : (
                                                <span className="text-muted-foreground text-sm">—</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => { setApproveTarget(payment); setApproveNotes(""); }}
                                                    disabled={!APPROVABLE.includes(payment.status)}
                                                    className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                                    title="Approve"
                                                >
                                                    <CheckCircle2 className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => { setRejectTarget(payment); setRejectReason(""); }}
                                                    disabled={!REJECTABLE.includes(payment.status)}
                                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                    title="Reject"
                                                >
                                                    <XCircle className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>

                    <TablePagination
                        page={currentPage}
                        totalPages={data.totalPages}
                        totalElements={data.totalElements}
                        size={data.size}
                        first={data.first}
                        last={data.last}
                        onPageChange={handlePageChange}
                    />
                </CardContent>
            </Card>

            {/* Approve Dialog */}
            <Dialog open={!!approveTarget} onOpenChange={(open) => !open && setApproveTarget(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Approve Payment</DialogTitle>
                        <DialogDescription>
                            Approve payment from <strong>{approveTarget ? formatName(approveTarget) : ""}</strong> for{" "}
                            <strong>{approveTarget?.amount} {approveTarget?.currency}</strong>.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-2">
                        <Label htmlFor="approve-notes">Admin Notes (optional)</Label>
                        <Textarea
                            id="approve-notes"
                            placeholder="Add notes about this approval..."
                            value={approveNotes}
                            onChange={(e) => setApproveNotes(e.target.value)}
                            rows={3}
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setApproveTarget(null)} disabled={approving}>
                            Cancel
                        </Button>
                        <Button onClick={handleApprove} disabled={approving} className="bg-green-600 hover:bg-green-700">
                            {approving ? "Approving..." : "Approve"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Reject Dialog */}
            <Dialog open={!!rejectTarget} onOpenChange={(open) => !open && setRejectTarget(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Reject Payment</DialogTitle>
                        <DialogDescription>
                            Reject payment from <strong>{rejectTarget ? formatName(rejectTarget) : ""}</strong> for{" "}
                            <strong>{rejectTarget?.amount} {rejectTarget?.currency}</strong>.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-2">
                        <Label htmlFor="reject-reason">
                            Reason <span className="text-red-500">*</span>
                        </Label>
                        <Textarea
                            id="reject-reason"
                            placeholder="Provide a reason for rejecting this payment..."
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            rows={3}
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setRejectTarget(null)} disabled={rejecting}>
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleReject}
                            disabled={rejecting || !rejectReason.trim()}
                        >
                            {rejecting ? "Rejecting..." : "Reject"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
