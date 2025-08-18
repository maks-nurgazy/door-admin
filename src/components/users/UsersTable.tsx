"use client";

import {useState} from "react";
import Image from "next/image";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Badge} from "@/components/ui/badge";
import {Dialog, DialogContent, DialogHeader, DialogTitle,} from "@/components/ui/dialog";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue,} from "@/components/ui/select";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow,} from "@/components/ui/table";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Label} from "@/components/ui/label";
import {Ban, CheckCircle2, Eye, Pencil, Receipt} from "lucide-react";
import {format} from "date-fns";

export function UsersTable({pageData}: { pageData: any }) {
    const {data: paginatedUsers, totalPages} = pageData;
    const [users, setUsers] = useState(paginatedUsers);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [paymentFilter, setPaymentFilter] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isReceiptDialogOpen, setIsReceiptDialogOpen] = useState(false);
    const [editForm, setEditForm] = useState({
        fullName: "",
        email: "",
        phoneNumber: "",
    });

    const handleStatusChange = (userId: number, newStatus: string) => {
        setUsers(users.map(user =>
            user.id === userId ? {...user, registrationStatus: newStatus} : user
        ));
    };

    const handleEditUser = (user: any) => {
        setSelectedUser(user);
        setEditForm({
            fullName: user.fullName,
            email: user.email,
            phoneNumber: user.phoneNumber,
        });
        setIsEditDialogOpen(true);
    };

    const handleSaveEdit = () => {
        if (selectedUser) {
            setUsers(users.map(user =>
                user.id === selectedUser.id ? {...user, ...editForm} : user
            ));
            setIsEditDialogOpen(false);
            setSelectedUser(null);
        }
    };

    const handleViewReceipt = (user: any) => {
        setSelectedUser(user);
        setIsReceiptDialogOpen(true);
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "APPROVED":
                return <Badge className="bg-green-500">Approved</Badge>;
            case "BANNED":
                return <Badge variant="destructive">Banned</Badge>;
            default:
                return <Badge variant="secondary">Pending</Badge>;
        }
    };

    const getPaymentBadge = (status: string) => {
        return status === "PAID"
            ? <Badge className="bg-green-500">Paid</Badge>
            : <Badge variant="secondary">Unpaid</Badge>;
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Users Management</h1>
            </div>

            {/* Filters */}
            <div className="flex gap-4 flex-wrap">
                <Input
                    placeholder="Search by name, email, or phone..."
                    value={searchQuery}
                    onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setCurrentPage(1); // Reset to first page on search
                    }}
                    className="max-w-xs"
                />
                <Select
                    value={statusFilter}
                    onValueChange={(value) => {
                        setStatusFilter(value);
                        setCurrentPage(1); // Reset to first page on filter change
                    }}
                >
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter by status"/>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="banned">Banned</SelectItem>
                    </SelectContent>
                </Select>
                <Select
                    value={paymentFilter}
                    onValueChange={(value) => {
                        setPaymentFilter(value);
                        setCurrentPage(1); // Reset to first page on filter change
                    }}
                >
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter by payment"/>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Payments</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="unpaid">Unpaid</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Users Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Users List</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Full Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Phone Number</TableHead>
                                <TableHead>Registration Date</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Payment</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedUsers.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell
                                        className="font-medium">{`${user.firstName} ${user.lastName}`}</TableCell>
                                    <TableCell>{user.email || '-'}</TableCell>
                                    <TableCell>{user.phone}</TableCell>
                                    <TableCell>{format(user.createdAt, 'LLLL d, yyyy')}</TableCell>
                                    <TableCell>{getStatusBadge(user.status)}</TableCell>
                                    <TableCell>{getPaymentBadge(user.paymentStatus)}</TableCell>
                                    <TableCell>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleEditUser(user)}
                                            >
                                                <Pencil className="h-4 w-4"/>
                                            </Button>
                                            {user.registrationStatus !== "BANNED" ? (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleStatusChange(user.id, "BANNED")}
                                                    className="text-red-500"
                                                >
                                                    <Ban className="h-4 w-4"/>
                                                </Button>
                                            ) : (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleStatusChange(user.id, "APPROVED")}
                                                    className="text-green-500"
                                                >
                                                    <CheckCircle2 className="h-4 w-4"/>
                                                </Button>
                                            )}
                                            {user.paymentStatus === "UNPAID" && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleViewReceipt(user)}
                                                >
                                                    <Receipt className="h-4 w-4"/>
                                                </Button>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="flex justify-center gap-2 mt-4">
                            <Button
                                variant="outline"
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                            >
                                Previous
                            </Button>
                            <span className="py-2 px-4">
                Page {currentPage} of {totalPages}
              </span>
                            <Button
                                variant="outline"
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                            >
                                Next
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Edit User Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit User Details</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="fullName">Full Name</Label>
                            <Input
                                id="fullName"
                                value={editForm.fullName}
                                onChange={(e) => setEditForm({...editForm, fullName: e.target.value})}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={editForm.email}
                                onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input
                                id="phone"
                                value={editForm.phoneNumber}
                                onChange={(e) => setEditForm({...editForm, phoneNumber: e.target.value})}
                                placeholder="+996XXXXXXXXX"
                            />
                        </div>
                    </div>
                    <div className="flex justify-end gap-3">
                        <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSaveEdit}>
                            Save Changes
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* View Receipt Dialog */}
            <Dialog open={isReceiptDialogOpen} onOpenChange={setIsReceiptDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Payment Receipt</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        {selectedUser?.paymentReceipt ? (
                            <div className="space-y-4">
                                <div className="relative w-full h-64 rounded-lg overflow-hidden">
                                    <Image
                                        src={selectedUser.paymentReceipt}
                                        alt="Payment Receipt"
                                        fill
                                        className="object-contain"
                                    />
                                </div>
                                <div className="flex justify-end gap-3">
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            window.open(selectedUser.paymentReceipt, '_blank');
                                        }}
                                    >
                                        <Eye className="h-4 w-4 mr-2"/>
                                        View Full Size
                                    </Button>
                                    <Button
                                        onClick={() => {
                                            setUsers(users.map(user =>
                                                user.id === selectedUser.id
                                                    ? {...user, paymentStatus: "paid"}
                                                    : user
                                            ));
                                            setIsReceiptDialogOpen(false);
                                        }}
                                    >
                                        <CheckCircle2 className="h-4 w-4 mr-2"/>
                                        Verify Payment
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <p className="text-center text-muted-foreground">
                                No receipt uploaded yet.
                            </p>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}