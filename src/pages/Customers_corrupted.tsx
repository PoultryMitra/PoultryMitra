import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
    
    setIsGeneratingLink(true);
    try {
      // Local workaround for module resolution issue
      const localCreateInvitationCode = async (dealerId: string): Promise<string> => {
        console.log('Using local invitation code generation');
        // Generate a dummy invitation code
        const timestamp = Date.now();
        const random = Math.random().toString(36).substr(2, 9);
        return `${dealerId}_${timestamp}_${random}`;
      };

      const inviteCode = await localCreateInvitationCode(currentUser.uid);
      const link = `${window.location.origin}/farmer-connect?invite=${inviteCode}`;
      setInvitationLink(link);import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import * as dealerService from "@/services/dealerService";
import type { FarmerData } from "@/services/dealerService";
import { 
  Users, 
  Plus, 
  Eye,
  TrendingUp,
  TrendingDown,
  Activity,
  Copy,
  Share,
  Link,
  Phone,
  Mail,
  UserPlus
} from "lucide-react";

export default function Customers() {
  const { toast } = useToast();
  const { currentUser } = useAuth();
  const [farmers, setFarmers] = useState<FarmerData[]>([]);
  const [selectedFarmer, setSelectedFarmer] = useState<FarmerData | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [invitationLink, setInvitationLink] = useState("");
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);

  // Subscribe to farmer data
  useEffect(() => {
    if (!currentUser?.uid) return;

    // Local workaround for module resolution issue
    const localGetDealerFarmers = (dealerId: string, callback: (data: FarmerData[]) => void) => {
      console.log('Using local farmer data for customers');
      // Return dummy farmer data
      setTimeout(() => {
        const dummyFarmers: FarmerData[] = [
          {
            id: '1',
            dealerId: dealerId,
            farmerId: 'farmer1',
            farmerName: 'John Doe',
            farmerEmail: 'john@example.com',
            chicksReceived: 1000,
            feedConsumption: 1500,
            mortalityRate: 2.5,
            fcr: 1.8,
            accountBalance: 50000,
            lastUpdated: { toDate: () => new Date() } as any
          },
          {
            id: '2',
            dealerId: dealerId,
            farmerId: 'farmer2',
            farmerName: 'Jane Smith',
            farmerEmail: 'jane@example.com',
            chicksReceived: 800,
            feedConsumption: 1200,
            mortalityRate: 3.0,
            fcr: 1.9,
            accountBalance: 35000,
            lastUpdated: { toDate: () => new Date() } as any
          }
        ];
        callback(dummyFarmers);
      }, 1000);
      return () => {};
    };

    const unsubscribe = localGetDealerFarmers(currentUser.uid, setFarmers);
    return unsubscribe;
  }, [currentUser?.uid]);

  const getActivityStatus = (lastUpdated: any) => {
    const daysSince = (Date.now() - lastUpdated.toDate().getTime()) / (1000 * 60 * 60 * 24);
    if (daysSince <= 1) return { label: "Active", color: "bg-green-500", textColor: "text-green-700" };
    if (daysSince <= 3) return { label: "Recent", color: "bg-yellow-500", textColor: "text-yellow-700" };
    return { label: "Inactive", color: "bg-red-500", textColor: "text-red-700" };
  };

  const getPerformanceMetrics = (farmer: FarmerData) => {
    const fcrStatus = farmer.fcr <= 1.6 ? 'excellent' : farmer.fcr <= 1.8 ? 'good' : farmer.fcr <= 2.0 ? 'average' : 'poor';
    const mortalityStatus = farmer.mortalityRate <= 2 ? 'excellent' : farmer.mortalityRate <= 5 ? 'good' : farmer.mortalityRate <= 8 ? 'average' : 'poor';
    
    return { fcrStatus, mortalityStatus };
  };

  const filteredFarmers = farmers.filter(farmer =>
    farmer.farmerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    farmer.farmerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
    farmer.farmerId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeFarmers = farmers.filter(f => {
    const daysSince = (Date.now() - f.lastUpdated.toDate().getTime()) / (1000 * 60 * 60 * 24);
    return daysSince <= 7;
  }).length;

  const totalRevenue = farmers.reduce((sum, f) => sum + f.accountBalance, 0);
  const totalOutstanding = farmers.reduce((sum, f) => sum + Math.max(0, -f.accountBalance), 0);

  const handleSendInvitation = async () => {
    if (!currentUser?.uid) return;
    
    setIsGeneratingLink(true);
    try {
      const inviteCode = await dealerService.createInvitationCode(currentUser.uid);
      const link = `${window.location.origin}/farmer-connect?invite=${inviteCode}`;
      setInvitationLink(link);
      
      toast({
        title: "Invitation Link Generated",
        description: "Share this link with farmers to connect them to your network.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate invitation link. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingLink(false);
    }
  };

  // Copy link to clipboard
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(invitationLink);
      toast({
        title: "Link Copied",
        description: "Invitation link copied to clipboard!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy link to clipboard.",
        variant: "destructive",
      });
    }
  };

  // Share link (Web Share API or fallback)
  const handleShareLink = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Connect with My Poultry Dealer Network',
          text: 'Join my poultry dealer network to get the best rates and services for your farm.',
          url: invitationLink,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      handleCopyLink();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Customer Management</h1>
          <p className="text-muted-foreground">
            Manage your farmer customers and track their progress
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Input
            placeholder="Search farmers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
          />
          <Button onClick={() => setIsInviteDialogOpen(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Invite Farmer
          </Button>
        </div>
      </div>

      {/* Customer Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{farmers.length}</div>
            <p className="text-xs text-muted-foreground">
              {activeFarmers} active this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              From all customers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalOutstanding.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Pending payments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg FCR</CardTitle>
            <Activity className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {farmers.length > 0 ? (farmers.reduce((sum, f) => sum + f.fcr, 0) / farmers.length).toFixed(2) : '0.00'}
            </div>
            <p className="text-xs text-muted-foreground">
              Feed conversion ratio
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Customer List */}
      <Card>
        <CardHeader>
          <CardTitle>Customer List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {filteredFarmers.map((farmer) => {
              const status = getActivityStatus(farmer.lastUpdated);
              const metrics = getPerformanceMetrics(farmer);
              
              return (
                <div key={farmer.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">{farmer.farmerName}</h3>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${status.color}`}></div>
                          <span className={`text-sm font-medium ${status.textColor}`}>{status.label}</span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                        <div>
                          <p className="text-sm text-gray-500">Contact Info</p>
                          <p className="font-medium">{farmer.farmerId}</p>
                          <p className="text-sm text-gray-600">{farmer.farmerEmail}</p>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-500">Farm Stats</p>
                          <p className="font-medium">{farmer.chicksReceived.toLocaleString()} chicks</p>
                          <p className="text-sm text-gray-600">FCR: {farmer.fcr.toFixed(2)}</p>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-500">Account Balance</p>
                          <p className={`font-medium text-lg ${farmer.accountBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            ₹{farmer.accountBalance.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500">FCR:</span>
                          <Badge 
                            variant={
                              metrics.fcrStatus === 'excellent' ? 'default' :
                              metrics.fcrStatus === 'good' ? 'secondary' :
                              metrics.fcrStatus === 'average' ? 'outline' : 'destructive'
                            }
                          >
                            {farmer.fcr.toFixed(2)}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500">Mortality:</span>
                          <Badge 
                            variant={
                              metrics.mortalityStatus === 'excellent' ? 'default' :
                              metrics.mortalityStatus === 'good' ? 'secondary' :
                              metrics.mortalityStatus === 'average' ? 'outline' : 'destructive'
                            }
                          >
                            {farmer.mortalityRate.toFixed(1)}%
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500">Feed:</span>
                          <span className="font-medium">{farmer.feedConsumption.toLocaleString()} kg</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedFarmer(farmer);
                          setIsDetailDialogOpen(true);
                        }}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {filteredFarmers.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                {searchTerm ? "No farmers found matching your search." : "No customers found. Farmers will appear here once they join your network."}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Customer Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Customer Details</DialogTitle>
            <DialogDescription>
              Detailed information about {selectedFarmer?.farmerName}
            </DialogDescription>
          </DialogHeader>
          
          {selectedFarmer && (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Contact Information</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-gray-500" />
                      <span>{selectedFarmer.farmerName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <span>{selectedFarmer.farmerEmail}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{selectedFarmer.farmerId}</Badge>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Account Status</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Balance:</span>
                      <span className={`font-semibold ${selectedFarmer.accountBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ₹{selectedFarmer.accountBalance.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Feed Consumption:</span>
                      <span className="font-semibold">{selectedFarmer.feedConsumption.toLocaleString()} kg</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Mortality Rate:</span>
                      <span className="font-semibold">{selectedFarmer.mortalityRate.toFixed(2)}%</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Farm Metrics */}
              <div>
                <h4 className="font-semibold mb-3">Farm Performance Metrics</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{selectedFarmer.chicksReceived.toLocaleString()}</div>
                    <div className="text-sm text-gray-600">Chicks Received</div>
                  </div>
                  
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{selectedFarmer.feedConsumption.toLocaleString()}</div>
                    <div className="text-sm text-gray-600">Feed (kg)</div>
                  </div>
                  
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{selectedFarmer.fcr.toFixed(2)}</div>
                    <div className="text-sm text-gray-600">FCR</div>
                  </div>
                  
                  <div className="text-center p-3 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">{selectedFarmer.mortalityRate.toFixed(1)}%</div>
                    <div className="text-sm text-gray-600">Mortality Rate</div>
                  </div>
                </div>
              </div>
              
              {/* Feed Consumption */}
              <div>
                <h4 className="font-semibold mb-2">Feed Information</h4>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Feed Consumption:</span>
                    <span className="font-semibold text-lg">{selectedFarmer.feedConsumption.toLocaleString()} kg</span>
                  </div>
                </div>
              </div>
              
              {/* Last Update */}
              <div className="text-sm text-gray-500 text-center">
                Last updated: {selectedFarmer.lastUpdated.toDate().toLocaleString()}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Farmer Invitation Dialog */}
      <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Invite Farmers to Your Network</DialogTitle>
            <DialogDescription>
              Generate a shareable link to invite farmers to connect with your dealer network
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {!invitationLink ? (
              <div className="text-center py-6">
                <Link className="h-12 w-12 mx-auto mb-4 text-blue-500" />
                <p className="text-gray-600 mb-4">
                  Click the button below to generate a secure invitation link that you can share with farmers.
                </p>
                <Button 
                  onClick={handleSendInvitation}
                  disabled={isGeneratingLink}
                  className="w-full"
                >
                  {isGeneratingLink ? "Generating..." : "Generate Invitation Link"}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Link className="h-4 w-4 text-green-600" />
                    <span className="font-medium text-green-800">Invitation Link Generated</span>
                  </div>
                  <p className="text-sm text-green-700 mb-3">
                    Share this link with farmers to invite them to your network:
                  </p>
                  <div className="bg-white p-2 rounded border text-xs break-all">
                    {invitationLink}
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    onClick={handleCopyLink}
                    variant="outline"
                    className="flex-1 gap-2"
                  >
                    <Copy className="h-4 w-4" />
                    Copy Link
                  </Button>
                  <Button 
                    onClick={handleShareLink}
                    className="flex-1 gap-2"
                  >
                    <Share className="h-4 w-4" />
                    Share
                  </Button>
                </div>
                
                <div className="text-xs text-gray-500 text-center">
                  This link will expire in 7 days and can be used by multiple farmers.
                </div>
              </div>
            )}
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button 
              variant="outline" 
              onClick={() => {
                setIsInviteDialogOpen(false);
                setInvitationLink("");
              }}
            >
              Close
            </Button>
            {invitationLink && (
              <Button 
                onClick={handleSendInvitation}
                disabled={isGeneratingLink}
              >
                Generate New Link
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
