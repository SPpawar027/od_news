import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Users,
  UserCheck,
  UserX,
  Shield,
  Settings,
  Key,
  Crown,
  User,
  AlertTriangle
} from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import type { AdminUser, InsertAdminUser } from "@shared/schema";

const userSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Valid email is required"),
  password: z.string().min(6, "Password must be at least 6 characters").optional(),
  role: z.enum(["manager", "editor", "limited_editor"]),
  isActive: z.boolean().default(true),
});

type UserFormData = z.infer<typeof userSchema>;

export default function UserManagement() {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [showPermissions, setShowPermissions] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      role: "limited_editor",
      isActive: true,
    },
  });

  const { data: users = [], isLoading } = useQuery<AdminUser[]>({
    queryKey: ["/api/admin/users"],
    queryFn: async () => {
      const response = await fetch("/api/admin/users", {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem('admin_token')}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch users");
      return response.json();
    },
  });

  const createUserMutation = useMutation({
    mutationFn: async (data: UserFormData) => {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem('admin_token')}`,
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create user");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setShowAddDialog(false);
      form.reset();
      toast({
        title: "User created successfully",
      });
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<UserFormData> }) => {
      const payload = { ...data };
      if (!payload.password) {
        delete payload.password;
      }

      const response = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem('admin_token')}`,
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error("Failed to update user");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setEditingUser(null);
      toast({
        title: "User updated successfully",
      });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/admin/users/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem('admin_token')}`,
        },
      });
      if (!response.ok) throw new Error("Failed to delete user");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "User deleted successfully",
      });
    },
  });

  const toggleUserMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => {
      const response = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem('admin_token')}`,
        },
        body: JSON.stringify({ isActive: !isActive }),
      });
      if (!response.ok) throw new Error("Failed to toggle user status");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
    },
  });

  const handleEdit = (user: AdminUser) => {
    setEditingUser(user);
    form.reset({
      username: user.username,
      email: user.email,
      password: "", // Don't populate password for editing
      role: user.role as "manager" | "editor" | "limited_editor",
      isActive: user.isActive,
    });
    setShowAddDialog(true);
  };

  const handleSave = (data: UserFormData) => {
    if (editingUser) {
      updateUserMutation.mutate({ id: editingUser.id, data });
    } else {
      createUserMutation.mutate(data);
    }
  };

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      "manager": { color: "bg-red-500", icon: Crown, label: "Manager" },
      "editor": { color: "bg-blue-500", icon: Edit, label: "Editor" },
      "limited_editor": { color: "bg-green-500", icon: User, label: "Limited Editor" }
    };
    
    const config = roleConfig[role as keyof typeof roleConfig] || roleConfig.limited_editor;
    const IconComponent = config.icon;
    
    return (
      <Badge className={`${config.color} text-white flex items-center gap-1`}>
        <IconComponent className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  const getPermissions = (role: string) => {
    const permissions = {
      "manager": [
        "Create, edit, delete articles",
        "Manage live streams",
        "Manage videos", 
        "Manage RSS feeds",
        "Manage users",
        "System settings"
      ],
      "editor": [
        "Create, edit, delete articles",
        "Manage live streams",
        "Manage videos",
        "Manage RSS feeds"
      ],
      "limited_editor": [
        "Create, edit own articles",
        "View live streams",
        "View videos"
      ]
    };
    
    return permissions[role as keyof typeof permissions] || permissions.limited_editor;
  };

  const stats = {
    total: users.length,
    active: users.filter(u => u.isActive).length,
    managers: users.filter(u => u.role === 'manager').length,
    editors: users.filter(u => u.role === 'editor').length,
    limitedEditors: users.filter(u => u.role === 'limited_editor').length,
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Users</p>
                <p className="text-xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-green-600" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Active</p>
                <p className="text-xl font-bold">{stats.active}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Crown className="w-4 h-4 text-red-600" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Managers</p>
                <p className="text-xl font-bold">{stats.managers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Edit className="w-4 h-4 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Editors</p>
                <p className="text-xl font-bold">{stats.editors}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-green-600" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Limited</p>
                <p className="text-xl font-bold">{stats.limitedEditors}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Role Permissions Info */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Role Permissions</CardTitle>
            <Button
              variant="outline"
              onClick={() => setShowPermissions(!showPermissions)}
            >
              <Shield className="w-4 h-4 mr-2" />
              {showPermissions ? "Hide" : "Show"} Permissions
            </Button>
          </div>
        </CardHeader>
        {showPermissions && (
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Crown className="w-5 h-5 text-red-500" />
                  <h3 className="font-semibold">Manager</h3>
                </div>
                <ul className="space-y-1 text-sm">
                  {getPermissions("manager").map((permission, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <div className="w-1 h-1 bg-red-500 rounded-full"></div>
                      {permission}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Edit className="w-5 h-5 text-blue-500" />
                  <h3 className="font-semibold">Editor</h3>
                </div>
                <ul className="space-y-1 text-sm">
                  {getPermissions("editor").map((permission, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
                      {permission}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5 text-green-500" />
                  <h3 className="font-semibold">Limited Editor</h3>
                </div>
                <ul className="space-y-1 text-sm">
                  {getPermissions("limited_editor").map((permission, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                      {permission}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* User Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>User Role Management</CardTitle>
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button 
                  onClick={() => {
                    setEditingUser(null);
                    form.reset();
                  }}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add User
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>
                    {editingUser ? "Edit User" : "Add New User"}
                  </DialogTitle>
                </DialogHeader>
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleSave)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username *</FormLabel>
                          <FormControl>
                            <Input placeholder="johndoe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email *</FormLabel>
                          <FormControl>
                            <Input placeholder="john@odnews.com" type="email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Password {editingUser ? "(leave blank to keep current)" : "*"}
                          </FormLabel>
                          <FormControl>
                            <Input 
                              placeholder={editingUser ? "Leave blank to keep current" : "Enter password"}
                              type="password" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="role"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Role *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select role" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="manager">
                                <div className="flex items-center gap-2">
                                  <Crown className="w-4 h-4 text-red-500" />
                                  Manager (Full Access)
                                </div>
                              </SelectItem>
                              <SelectItem value="editor">
                                <div className="flex items-center gap-2">
                                  <Edit className="w-4 h-4 text-blue-500" />
                                  Editor (Content & Media)
                                </div>
                              </SelectItem>
                              <SelectItem value="limited_editor">
                                <div className="flex items-center gap-2">
                                  <User className="w-4 h-4 text-green-500" />
                                  Limited Editor (Articles Only)
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="isActive"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Active User</FormLabel>
                            <div className="text-sm text-muted-foreground">
                              Allow this user to access the admin panel
                            </div>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                        Cancel
                      </Button>
                      <Button 
                        type="submit" 
                        disabled={createUserMutation.isPending || updateUserMutation.isPending}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        {editingUser ? "Update" : "Create"} User
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      Loading users...
                    </TableCell>
                  </TableRow>
                ) : users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      No users found. Add your first user to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-full">
                            <User className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-medium">{user.username}</h4>
                            <p className="text-sm text-gray-500">{user.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getRoleBadge(user.role)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${
                            user.isActive ? 'bg-green-500' : 'bg-red-500'
                          }`}></div>
                          <span>{user.isActive ? 'Active' : 'Inactive'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {user.lastLoginAt ? (
                          format(new Date(user.lastLoginAt), "MMM dd, yyyy")
                        ) : (
                          <span className="text-gray-500">Never</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {format(new Date(user.createdAt), "MMM dd, yyyy")}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleUserMutation.mutate({
                              id: user.id,
                              isActive: user.isActive
                            })}
                          >
                            {user.isActive ? <UserX className="w-3 h-3" /> : <UserCheck className="w-3 h-3" />}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(user)}
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          {user.role !== 'manager' && (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => deleteUserMutation.mutate(user.id)}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}