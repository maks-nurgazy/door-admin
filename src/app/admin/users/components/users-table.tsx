"use client";

import {useState} from "react";
import {useRouter, useSearchParams} from "next/navigation";
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,} from "@/components/ui/dialog";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow,} from "@/components/ui/table";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Label} from "@/components/ui/label";
import {TablePagination} from "@/components/table-pagination";
import {Input} from "@/components/ui/input";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Ban, CheckCircle2, Pencil, Eye} from "lucide-react";
import {User, usersApi, UsersResponse, UserStatus} from "@/lib/api/users";
import { format } from "date-fns";

interface UsersTableProps {
    initialData: UsersResponse;
}

export function UsersTable({initialData: usersData}: UsersTableProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
    const [editForm, setEditForm] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        status: "",
    });

    const currentPage = searchParams.get("page")
        ? parseInt(searchParams.get("page")!) - 1
        : 0;

    const handlePageChange = (newPage: number) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("page", (newPage + 1).toString());
        router.push(`?${params.toString()}`);
    };

    const handleStatusChange = async (userId: number, newStatus: UserStatus) => {
        try {
            await usersApi.updateUserStatus(userId, newStatus);
            router.refresh();
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
            phone: user.phone ?? "",
            status: user.status,
        });
        setIsEditDialogOpen(true);
    };

    const handleViewUser = (user: User) => {
        setSelectedUser(user);
        setIsDetailDialogOpen(true);
    };

    const handleSaveEdit = async () => {
        if (selectedUser && editForm.status) {
            try {
                await usersApi.updateUserStatus(selectedUser.id, editForm.status as UserStatus);
                router.refresh();
                setIsEditDialogOpen(false);
                setSelectedUser(null);
            } catch (error) {
                console.error('Failed to update user:', error);
            }
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "ACTIVE":
                return <Badge className="bg-green-500">Active</Badge>;
            case "BANNED":
                return <Badge variant="destructive">Banned</Badge>;
            case "PAYMENT_SUBMITTED":
                return <Badge className="bg-blue-500">Payment Submitted</Badge>;
            case "PENDING_PAYMENT":
            default:
                return <Badge variant="secondary">Pending Payment</Badge>;
        }
    };

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
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {usersData.content.map((user) => (
                            <TableRow key={user.id}>
                                <TableCell className="font-medium">{`${user.firstName} ${user.lastName}`}</TableCell>
                                <TableCell>{user.username}</TableCell>
                                <TableCell>{user.email || '-'}</TableCell>
                                <TableCell>{user.phone ?? '-'}</TableCell>
                                <TableCell>{format(new Date(user.createdAt), "MMM dd, yyyy")}</TableCell>
                                <TableCell>{getStatusBadge(user.status)}</TableCell>
                                <TableCell>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleViewUser(user)}
                                            title="View Details"
                                        >
                                            <Eye className="h-4 w-4"/>
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleEditUser(user)}
                                            title="Edit User"
                                        >
                                            <Pencil className="h-4 w-4"/>
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>

                <TablePagination
                    page={currentPage}
                    totalPages={usersData.totalPages}
                    totalElements={usersData.totalElements}
                    size={usersData.size}
                    first={usersData.first}
                    last={usersData.last}
                    onPageChange={handlePageChange}
                />

                {/* Edit User Dialog */}
                <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Edit User Details</DialogTitle>
                            <DialogDescription>Update user information and settings</DialogDescription>
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
                            <div className="grid gap-2">
                                <Label htmlFor="status">Status</Label>
                                <Select
                                    value={editForm.status}
                                    onValueChange={(value) => setEditForm({...editForm, status: value})}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="PENDING_PAYMENT">Pending Payment</SelectItem>
                                        <SelectItem value="PAYMENT_SUBMITTED">Payment Submitted</SelectItem>
                                        <SelectItem value="ACTIVE">Active</SelectItem>
                                        <SelectItem value="BANNED">Banned</SelectItem>
                                    </SelectContent>
                                </Select>
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

                {/* User Detail Dialog */}
                <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>User Details</DialogTitle>
                            <DialogDescription>View complete information about this user</DialogDescription>
                        </DialogHeader>
                        {selectedUser && (
                            <div className="grid gap-6 py-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-muted-foreground">Full Name</Label>
                                        <p className="text-sm">{`${selectedUser.firstName} ${selectedUser.lastName}`}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-muted-foreground">Username</Label>
                                        <p className="text-sm">{selectedUser.username}</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                                        <p className="text-sm">{selectedUser.email || '-'}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-muted-foreground">Phone Number</Label>
                                        <p className="text-sm">{selectedUser.phone}</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-muted-foreground">Registration Date</Label>
                                        <p className="text-sm">{format(new Date(selectedUser.createdAt), "MMM dd, yyyy 'at' HH:mm")}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-muted-foreground">User ID</Label>
                                        <p className="text-sm">{selectedUser.id}</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                                        <div>{getStatusBadge(selectedUser.status)}</div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div className="flex justify-end">
                            <Button variant="outline" onClick={() => setIsDetailDialogOpen(false)}>
                                Close
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </CardContent>
        </Card>
    );
}