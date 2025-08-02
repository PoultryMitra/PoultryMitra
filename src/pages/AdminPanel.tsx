import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ResponsiveTable } from "@/components/ui/responsive-table";
import { useState, useEffect } from "react";
import { fixConnectionData, fixAllConnectionsWithPlaceholderData } from "@/services/connectionFixService";
import { useToast } from "@/hooks/use-toast";
import { collection, getDocs, doc, deleteDoc, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";

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
  const { toast } = useToast();

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
        description: "Failed to delete user",
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
                  <Button
                    onClick={() => handleDeleteUser(row.id, row.email)}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 text-sm rounded"
                  >
                    Delete
                  </Button>
                )
              }
            ]}
            data={users}
            emptyMessage="No users found"
          />
        </CardContent>
      </Card>
    </div>
  );
}