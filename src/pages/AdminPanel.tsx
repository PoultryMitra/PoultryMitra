import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ResponsiveTable } from "@/components/ui/responsive-table";
import { useState, useEffect } from "react";
import { fixConnectionData, fixAllConnectionsWithPlaceholderData } from "@/services/connectionFixService";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { collection, getDocs, doc, deleteDoc, updateDoc, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Pencil, Trash2, FileText, Users, BarChart3, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface User {
  id: string;
  email: string;
  displayName: string;
  role: string;
  createdAt?: any;
  profileComplete?: boolean;
}

interface Connection {
  id: string;
  connectionId: string;
  dealerId: string;
  farmerId: string;
  dealerName: string;
  dealerEmail: string;
  farmerName: string;
  farmerEmail: string;
}

export default function AdminPanel() {
  const [isFixingConnections, setIsFixingConnections] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState({
    displayName: '',
    email: '',
    role: ''
  });
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { toast } = useToast();
  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();

  // Load real data from Firebase
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load users
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const usersData = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as User[];
      setUsers(usersData);

      // Load connections with potential issues
      const farmerDealersSnapshot = await getDocs(collection(db, 'farmerDealers'));
      const connectionsData = farmerDealersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Connection[];
      setConnections(connectionsData);

      console.log('Loaded users:', usersData.length);
      console.log('Loaded connections:', connectionsData.length);
      
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "Failed to load admin data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string, email: string) => {
    if (!confirm(`Are you sure you want to delete user ${email}?`)) {
      return;
    }

    try {
      console.log('Attempting to delete user:', userId, email);
      console.log('Current user:', currentUser?.uid);
      console.log('Current user profile:', userProfile);
      
      await deleteDoc(doc(db, 'users', userId));
      toast({
        title: "Success",
        description: `User ${email} deleted successfully`,
      });
      // Reload data
      loadData();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: "Error",
        description: `Failed to delete user: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const handleEditUser = (user: User) => {
    console.log('Edit button clicked for user:', user);
    setEditingUser(user);
    setEditForm({
      displayName: user.displayName || '',
      email: user.email || '',
      role: user.role || ''
    });
    setIsEditDialogOpen(true);
    console.log('Edit dialog should be open now:', true);
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;

    try {
      await updateDoc(doc(db, 'users', editingUser.id), {
        displayName: editForm.displayName,
        email: editForm.email,
        role: editForm.role
      });
      
      toast({
        title: "Success",
        description: `User ${editForm.email} updated successfully`,
      });
      
      setIsEditDialogOpen(false);
      setEditingUser(null);
      loadData();
    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        title: "Error",
        description: "Failed to update user",
        variant: "destructive",
      });
    }
  };

  const handleFixSpecificConnection = async () => {
    setIsFixingConnections(true);
    try {
      // Fix the specific connection we identified
      await fixConnectionData('gLx4IutFQalTLwEPng3F');
      toast({
        title: "Success",
        description: "Connection data fixed successfully!",
      });
      // Reload connections data
      loadData();
    } catch (error) {
      console.error('Error fixing connection:', error);
      toast({
        title: "Error",
        description: "Failed to fix connection data.",
        variant: "destructive",
      });
    } finally {
      setIsFixingConnections(false);
    }
  };

  const handleFixAllConnections = async () => {
    setIsFixingConnections(true);
    try {
      await fixAllConnectionsWithPlaceholderData();
      toast({
        title: "Success",
        description: "All placeholder connections fixed successfully!",
      });
      // Reload connections data
      loadData();
    } catch (error) {
      console.error('Error fixing connections:', error);
      toast({
        title: "Error",
        description: "Failed to fix placeholder connections.",
        variant: "destructive",
      });
    } finally {
      setIsFixingConnections(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">Loading admin data...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Admin Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/admin/posts')}>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Posts & Guides</h3>
                <p className="text-sm text-gray-600">Manage content and tutorials</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer opacity-50">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">User Management</h3>
                <p className="text-sm text-gray-600">Coming soon</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer opacity-50">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <BarChart3 className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Analytics</h3>
                <p className="text-sm text-gray-600">Coming soon</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Connection Data Fix Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Connection Data Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-4">
            <div>
              <h3 className="font-medium text-gray-700 mb-2">Fix Connection Data Issues</h3>
              <p className="text-sm text-gray-600 mb-4">
                Fix connections that have placeholder dealer information instead of real dealer data.
              </p>
              <div className="flex gap-4">
                <Button
                  onClick={handleFixSpecificConnection}
                  disabled={isFixingConnections}
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                >
                  {isFixingConnections ? "Fixing..." : "Fix Current Connection"}
                </Button>
                <Button
                  onClick={handleFixAllConnections}
                  disabled={isFixingConnections}
                  className="bg-green-500 hover:bg-green-600 text-white"
                >
                  {isFixingConnections ? "Fixing..." : "Fix All Placeholder Connections"}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Connections with Issues */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Connection Issues</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveTable
            columns={[
              { key: 'connectionId', label: 'Connection ID', className: 'font-mono text-sm' },
              { 
                key: 'farmerInfo', 
                label: 'Farmer',
                render: (_, row) => (
                  <div>
                    <div className="font-medium">{row.farmerName}</div>
                    <div className="text-sm text-gray-500">{row.farmerEmail}</div>
                  </div>
                )
              },
              { key: 'dealerName', label: 'Dealer Name' },
              { key: 'dealerEmail', label: 'Dealer Email', className: 'text-gray-600' },
              { 
                key: 'status', 
                label: 'Status',
                render: (_, row) => (
                  row.dealerEmail === 'dealer@example.com' || row.dealerName === 'Dealer' ? (
                    <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm">
                      Placeholder Data
                    </span>
                  ) : (
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                      Valid
                    </span>
                  )
                )
              }
            ]}
            data={connections}
            emptyMessage="No connection issues found"
          />
        </CardContent>
      </Card>

      {/* User Accounts Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold">User Accounts</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveTable
            columns={[
              { 
                key: 'displayName', 
                label: 'Name',
                render: (value) => value || 'N/A'
              },
              { key: 'email', label: 'Email', className: 'text-gray-600' },
              { 
                key: 'role', 
                label: 'Role',
                className: 'capitalize'
              },
              { 
                key: 'actions', 
                label: 'Actions',
                render: (_, row) => (
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleEditUser(row)}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 text-sm rounded"
                    >
                      <Pencil className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      onClick={() => handleDeleteUser(row.id, row.email)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 text-sm rounded"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                )
              }
            ]}
            data={users}
            emptyMessage="No users found"
          />
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="displayName" className="text-right">
                Name
              </Label>
              <Input
                id="displayName"
                value={editForm.displayName}
                onChange={(e) => setEditForm({ ...editForm, displayName: e.target.value })}
                className="col-span-3"
                placeholder="Enter name"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-email" className="text-right">
                Email
              </Label>
              <Input
                id="edit-email"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                className="col-span-3"
                placeholder="Enter email"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role" className="text-right">
                Role
              </Label>
              <Select
                value={editForm.role}
                onValueChange={(value) => setEditForm({ ...editForm, role: value })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="farmer">Farmer</SelectItem>
                  <SelectItem value="dealer">Dealer</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                console.log('Cancel clicked');
                setIsEditDialogOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateUser}>
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}