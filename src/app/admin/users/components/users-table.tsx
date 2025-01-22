"use client";

import {useEffect, useState} from "react";
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";
import {Dialog, DialogContent, DialogHeader, DialogTitle,} from "@/components/ui/dialog";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow,} from "@/components/ui/table";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {Ban, CheckCircle2, Pencil} from "lucide-react";
import {User, UserFilters, usersApi, UsersResponse} from "@/lib/api/users";

interface UsersTableProps {
    filters: UserFilters;
}

export function UsersTable({filters}: UsersTableProps) {
    const [usersData, setUsersData] = useState<UsersResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(0);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editForm, setEditForm] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
    });

    useEffect(() => {
        fetchUsers();
    }, [currentPage, filters]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const data = await usersApi.getUsers({
                ...filters,
                page: currentPage,
            });
            setUsersData(data);
        } catch (error) {
            console.error('Failed to fetch users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (userId: number, newStatus: string) => {
        try {
            await usersApi.updateUserStatus(userId, newStatus);
            fetchUsers();
        } catch (error) {
            console.error('Failed to update user status:', error);
        }
    };

    const handleEditUser = (user: User) => {
        setSelectedUser(user);
        setEditForm({
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email || "",
            phone: user.phone,
        });
        setIsEditDialogOpen(true);
    };

    const handleSaveEdit = async () => {
        if (selectedUser) {
            try {
                await usersApi.updateUser(selectedUser.id, editForm);
                fetchUsers();
                setIsEditDialogOpen(false);
                setSelectedUser(null);
            } catch (error) {
                console.error('Failed to update user:', error);
            }
        }
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

    const getPaymentBadge = (status: string | null) => {
        return status === "PAID"
            ? <Badge className="bg-green-500">Paid</Badge>
            : <Badge variant="secondary">Unpaid</Badge>;
    };

    if (loading) {
        return (
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center justify-center">
                        <p>Loading users...</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Users List</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Full Name</TableHead>
                            <TableHead>Username</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Phone Number</TableHead>
                            <TableHead>Registration Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Payment</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {usersData?.data.map((user) => (
                            <TableRow key={user.id}>
                                <TableCell className="font-medium">{`${user.firstName} ${user.lastName}`}</TableCell>
                                <TableCell>{user.username}</TableCell>
                                <TableCell>{user.email || '-'}</TableCell>
                                <TableCell>{user.phone}</TableCell>
                                <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
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
                                        {user.status !== "BANNED" ? (
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
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>

                {usersData && usersData.totalPages > 1 && (
                    <div className="flex justify-center gap-2 mt-4">
                        <Button
                            variant="outline"
                            onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                            disabled={currentPage === 0}
                        >
                            Previous
                        </Button>
                        <span className="py-2 px-4">
              Page {currentPage + 1} of {usersData.totalPages}
            </span>
                        <Button
                            variant="outline"
                            onClick={() => setCurrentPage(p => Math.min(usersData.totalPages - 1, p + 1))}
                            disabled={currentPage === usersData.totalPages - 1}
                        >
                            Next
                        </Button>
                    </div>
                )}

                {/* Edit User Dialog */}
                <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Edit User Details</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="firstName">First Name</Label>
                                <Input
                                    id="firstName"
                                    value={editForm.firstName}
                                    onChange={(e) => setEditForm({...editForm, firstName: e.target.value})}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="lastName">Last Name</Label>
                                <Input
                                    id="lastName"
                                    value={editForm.lastName}
                                    onChange={(e) => setEditForm({...editForm, lastName: e.target.value})}
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
                                    value={editForm.phone}
                                    onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
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
            </CardContent>
        </Card>
    );
}