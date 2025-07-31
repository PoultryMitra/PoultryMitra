import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Connection ID</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Farmer</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Dealer Name</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Dealer Email</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {connections.map((connection) => (
                  <tr key={connection.id} className="border-b border-gray-100">
                    <td className="py-3 px-4 text-gray-900 text-sm font-mono">{connection.connectionId}</td>
                    <td className="py-3 px-4 text-gray-900">{connection.farmerName} ({connection.farmerEmail})</td>
                    <td className="py-3 px-4 text-gray-900">{connection.dealerName}</td>
                    <td className="py-3 px-4 text-gray-600">{connection.dealerEmail}</td>
                    <td className="py-3 px-4">
                      {connection.dealerEmail === 'dealer@example.com' || connection.dealerName === 'Dealer' ? (
                        <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm">
                          Placeholder Data
                        </span>
                      ) : (
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                          Valid
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* User Accounts Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold">User Accounts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Name</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Email</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Role</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-gray-100">
                    <td className="py-3 px-4 text-gray-900">{user.displayName || 'N/A'}</td>
                    <td className="py-3 px-4 text-gray-600">{user.email}</td>
                    <td className="py-3 px-4 text-gray-900 capitalize">{user.role}</td>
                    <td className="py-3 px-4">
                      <Button
                        onClick={() => handleDeleteUser(user.id, user.email)}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 text-sm rounded"
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}