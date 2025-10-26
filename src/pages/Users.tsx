import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Search, Edit, Trash2, Shield, User, ArrowUpDown, Menu, X } from 'lucide-react';
import { toast } from 'sonner';

interface UserType {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'admin' | 'user';
}

const INITIAL_USERS: UserType[] = [
  { id: '1', firstName: 'Admin', lastName: 'User', email: 'admin@nexora.io', role: 'admin' },
  { id: '2', firstName: 'Normal', lastName: 'User', email: 'user@nexora.io', role: 'user' },
  { id: '3', firstName: 'John', lastName: 'Doe', email: 'john@nexora.io', role: 'user' },
  { id: '4', firstName: 'Jane', lastName: 'Smith', email: 'jane@nexora.io', role: 'user' },
];

type SortField = 'name' | 'email' | 'role';
type SortDirection = 'asc' | 'desc';

const Users = () => {
  const [users, setUsers] = useState<UserType[]>(INITIAL_USERS);
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserType | null>(null);
  const [editingUser, setEditingUser] = useState<UserType | null>(null);
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [mobileSortOpen, setMobileSortOpen] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: 'user' as 'admin' | 'user',
  });

  const filteredUsers = users.filter((user) => {
    const query = searchQuery.toLowerCase();
    return (
      user.firstName.toLowerCase().includes(query) ||
      user.lastName.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query)
    );
  });

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    let aValue: string;
    let bValue: string;

    switch (sortField) {
      case 'name':
        aValue = `${a.firstName} ${a.lastName}`.toLowerCase();
        bValue = `${b.firstName} ${b.lastName}`.toLowerCase();
        break;
      case 'email':
        aValue = a.email.toLowerCase();
        bValue = b.email.toLowerCase();
        break;
      case 'role':
        aValue = a.role;
        bValue = b.role;
        break;
      default:
        return 0;
    }

    if (aValue < bValue) {
      return sortDirection === 'asc' ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortDirection === 'asc' ? 1 : -1;
    }
    return 0;
  });

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setMobileSortOpen(false);
  };

  const handleOpenDialog = (user?: UserType) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      });
    } else {
      setEditingUser(null);
      setFormData({ firstName: '', lastName: '', email: '', role: 'user' });
    }
    setDialogOpen(true);
  };

  const handleSaveUser = () => {
    if (!formData.firstName || !formData.lastName || !formData.email) {
      toast.error('All fields are required');
      return;
    }

    if (editingUser) {
      setUsers(
        users.map((u) =>
          u.id === editingUser.id ? { ...u, ...formData } : u
        )
      );
      toast.success('User updated successfully! ✨');
    } else {
      const newUser: UserType = {
        id: Date.now().toString(),
        ...formData,
      };
      setUsers([...users, newUser]);
      toast.success('User added successfully! 🎉');
    }

    setDialogOpen(false);
  };

  const handleDeleteClick = (user: UserType) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (userToDelete) {
      setUsers(users.filter((u) => u.id !== userToDelete.id));
      toast.success(`User ${userToDelete.firstName} ${userToDelete.lastName} has been deleted`);
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setUserToDelete(null);
  };

  const handleChangeRole = (id: string, newRole: 'admin' | 'user') => {
    setUsers(users.map((u) => (u.id === id ? { ...u, role: newRole } : u)));
    toast.success(`Role changed to ${newRole}`);
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3 h-3 sm:w-4 sm:h-4 ml-1 opacity-50" />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUpDown className="w-3 h-3 sm:w-4 sm:h-4 ml-1" />
    ) : (
      <ArrowUpDown className="w-3 h-3 sm:w-4 sm:h-4 ml-1 transform rotate-180" />
    );
  };

  return (
    <div className="p-3 sm:p-4 md:p-6 lg:p-8 space-y-4 sm:space-y-6 md:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gradient mb-1 sm:mb-2 break-words">
            Manage Users
          </h1>
          <p className="text-muted-foreground text-xs sm:text-sm md:text-base truncate">
            Add, edit, and manage user accounts
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              className="gradient-primary hover-glow w-full sm:w-auto mt-2 sm:mt-0"
              onClick={() => handleOpenDialog()}
              size="sm"
            >
              <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <span className="text-xs sm:text-sm">Add User</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-strong border-border max-w-[95vw] rounded-lg sm:rounded-xl mx-2 sm:mx-0 sm:max-w-md md:max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl">
                {editingUser ? 'Edit User' : 'Add New User'}
              </DialogTitle>
              <DialogDescription className="text-sm sm:text-base">
                {editingUser ? 'Update user information' : 'Create a new user account'}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 sm:space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-sm sm:text-base">First Name</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) =>
                      setFormData({ ...formData, firstName: e.target.value })
                    }
                    className="glass text-sm sm:text-base"
                    placeholder="Enter first name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-sm sm:text-base">Last Name</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) =>
                      setFormData({ ...formData, lastName: e.target.value })
                    }
                    className="glass text-sm sm:text-base"
                    placeholder="Enter last name"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm sm:text-base">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="glass text-sm sm:text-base"
                  placeholder="Enter email address"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role" className="text-sm sm:text-base">Role</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value: 'admin' | 'user') =>
                    setFormData({ ...formData, role: value })
                  }
                >
                  <SelectTrigger className="glass text-sm sm:text-base">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent className="glass-strong border-border z-50">
                    <SelectItem value="user" className="text-sm sm:text-base">Normal User</SelectItem>
                    <SelectItem value="admin" className="text-sm sm:text-base">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-4 sm:mt-6">
              <Button 
                variant="outline" 
                onClick={() => setDialogOpen(false)} 
                className="glass w-full sm:w-auto order-2 sm:order-1 text-sm sm:text-base"
                size="sm"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSaveUser} 
                className="gradient-primary hover-glow w-full sm:w-auto order-1 sm:order-2 text-sm sm:text-base"
                size="sm"
              >
                {editingUser ? 'Update' : 'Create'} User
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="glass-strong border-border max-w-[95vw] rounded-lg sm:rounded-xl mx-2 sm:mx-0 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl text-destructive">
              Delete User
            </DialogTitle>
            <DialogDescription className="text-sm sm:text-base">
              {userToDelete && (
                <>
                  Are you sure you want to delete <strong>{userToDelete.firstName} {userToDelete.lastName}</strong>?
                  This action cannot be undone and all their data will be permanently removed.
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-4 sm:mt-6">
            <Button 
              variant="outline" 
              onClick={handleCancelDelete}
              className="glass w-full sm:w-auto order-2 sm:order-1 text-sm sm:text-base"
              size="sm"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 w-full sm:w-auto order-1 sm:order-2 text-sm sm:text-base"
              size="sm"
            >
              <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              Delete User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Search and Sort Controls */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-between items-stretch sm:items-center">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 sm:pl-10 glass w-full text-sm sm:text-base"
          />
        </div>

        {/* Desktop Sort Buttons */}
        <div className="hidden sm:flex gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            onClick={() => handleSort('name')}
            className="glass flex items-center justify-center text-xs sm:text-sm"
            size="sm"
          >
            Name
            {getSortIcon('name')}
          </Button>
          <Button
            variant="outline"
            onClick={() => handleSort('email')}
            className="glass flex items-center justify-center text-xs sm:text-sm"
            size="sm"
          >
            Email
            {getSortIcon('email')}
          </Button>
          <Button
            variant="outline"
            onClick={() => handleSort('role')}
            className="glass flex items-center justify-center text-xs sm:text-sm"
            size="sm"
          >
            Role
            {getSortIcon('role')}
          </Button>
        </div>

        {/* Mobile Sort Dropdown */}
        <div className="sm:hidden relative">
          <Button
            variant="outline"
            onClick={() => setMobileSortOpen(!mobileSortOpen)}
            className="glass w-full flex items-center justify-between text-sm"
            size="sm"
          >
            <span>Sort by: {sortField}</span>
            {mobileSortOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </Button>
          
          {mobileSortOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 glass-strong border border-border rounded-lg shadow-lg z-10">
              <div className="p-2 space-y-1">
                <button
                  onClick={() => handleSort('name')}
                  className="w-full text-left px-3 py-2 rounded-md hover:bg-accent/30 transition-colors flex items-center justify-between text-sm"
                >
                  Name {getSortIcon('name')}
                </button>
                <button
                  onClick={() => handleSort('email')}
                  className="w-full text-left px-3 py-2 rounded-md hover:bg-accent/30 transition-colors flex items-center justify-between text-sm"
                >
                  Email {getSortIcon('email')}
                </button>
                <button
                  onClick={() => handleSort('role')}
                  className="w-full text-left px-3 py-2 rounded-md hover:bg-accent/30 transition-colors flex items-center justify-between text-sm"
                >
                  Role {getSortIcon('role')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Users Table */}
      <Card className="glass-strong overflow-hidden border-0 sm:border">
        {/* Desktop Table */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead className="border-b border-border">
              <tr>
                <th className="text-left p-3 sm:p-4 font-medium text-muted-foreground text-sm">User</th>
                <th className="text-left p-3 sm:p-4 font-medium text-muted-foreground text-sm">Email</th>
                <th className="text-left p-3 sm:p-4 font-medium text-muted-foreground text-sm">Role</th>
                <th className="text-right p-3 sm:p-4 font-medium text-muted-foreground text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedUsers.map((user) => (
                <tr key={user.id} className="border-b border-border/50 hover:bg-accent/30 transition-colors">
                  <td className="p-3 sm:p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full gradient-secondary flex items-center justify-center text-white font-bold text-sm">
                        {user.firstName[0]}{user.lastName[0]}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm sm:text-base truncate">
                          {user.firstName} {user.lastName}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="p-3 sm:p-4 text-muted-foreground text-sm truncate max-w-[120px] lg:max-w-none">
                    {user.email}
                  </td>
                  <td className="p-3 sm:p-4">
                    <Select
                      value={user.role}
                      onValueChange={(value: 'admin' | 'user') =>
                        handleChangeRole(user.id, value)
                      }
                    >
                      <SelectTrigger className="w-28 lg:w-32 glass text-xs sm:text-sm">
                        <div className="flex items-center">
                          {user.role === 'admin' ? (
                            <Shield className="w-3 h-3 sm:w-4 sm:h-4 mr-2 text-primary" />
                          ) : (
                            <User className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                          )}
                          <SelectValue />
                        </div>
                      </SelectTrigger>
                      <SelectContent className="glass-strong border-border z-50">
                        <SelectItem value="user" className="text-sm">User</SelectItem>
                        <SelectItem value="admin" className="text-sm">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="p-3 sm:p-4">
                    <div className="flex items-center justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => handleOpenDialog(user)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        onClick={() => handleDeleteClick(user)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="sm:hidden space-y-3 p-3">
          {sortedUsers.map((user) => (
            <Card key={user.id} className="glass p-4 border-border/50">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-full gradient-secondary flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {user.firstName[0]}{user.lastName[0]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm truncate">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-muted-foreground text-xs truncate mt-1">
                      {user.email}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <Select
                  value={user.role}
                  onValueChange={(value: 'admin' | 'user') =>
                    handleChangeRole(user.id, value)
                  }
                >
                  <SelectTrigger className="w-32 glass text-xs">
                    <div className="flex items-center">
                      {user.role === 'admin' ? (
                        <Shield className="w-3 h-3 mr-2 text-primary" />
                      ) : (
                        <User className="w-3 h-3 mr-2" />
                      )}
                      <SelectValue />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="glass-strong border-border z-50">
                    <SelectItem value="user" className="text-xs">User</SelectItem>
                    <SelectItem value="admin" className="text-xs">Admin</SelectItem>
                  </SelectContent>
                </Select>
                
                <div className="flex items-center space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => handleOpenDialog(user)}
                  >
                    <Edit className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                    onClick={() => handleDeleteClick(user)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {sortedUsers.length === 0 && (
          <div className="p-6 sm:p-8 text-center">
            <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 rounded-full gradient-secondary flex items-center justify-center">
              <User className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
            <h3 className="text-base sm:text-lg font-bold mb-1 sm:mb-2">No users found</h3>
            <p className="text-muted-foreground text-sm sm:text-base mb-4 sm:mb-4">
              {searchQuery 
                ? 'Try adjusting your search terms' 
                : 'No users have been added yet'
              }
            </p>
            {!searchQuery && (
              <Button 
                onClick={() => handleOpenDialog()} 
                className="gradient-primary hover-glow text-sm sm:text-base"
                size="sm"
              >
                <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                Add First User
              </Button>
            )}
          </div>
        )}
      </Card>
    </div>
  );
};

export default Users;