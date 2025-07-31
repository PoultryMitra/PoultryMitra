import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { getDealerFarmers, getFarmerDealers } from '@/services/connectionService';

const ConnectionTest: React.FC = () => {
  const { currentUser } = useAuth();
  const [dealerFarmers, setDealerFarmers] = useState<any[]>([]);
  const [farmerDealers, setFarmerDealers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser?.uid) return;

    console.log('🧪 Connection Test - Current User:', {
      uid: currentUser.uid,
      email: currentUser.email,
      displayName: currentUser.displayName
    });

    // Test both directions
    const unsubscribeDealerFarmers = getDealerFarmers(currentUser.uid, (farmers) => {
      console.log('👥 As Dealer - Found farmers:', farmers);
      setDealerFarmers(farmers);
      setLoading(false);
    });

    const unsubscribeFarmerDealers = getFarmerDealers(currentUser.uid, (dealers) => {
      console.log('🏪 As Farmer - Found dealers:', dealers);
      setFarmerDealers(dealers);
      setLoading(false);
    });

    return () => {
      unsubscribeDealerFarmers();
      unsubscribeFarmerDealers();
    };
  }, [currentUser?.uid]);

  if (!currentUser) {
    return <div className="p-6">Please log in first</div>;
  }

  if (loading) {
    return <div className="p-6">Loading connection data...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Connection Test Page</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Current User</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p><strong>UID:</strong> {currentUser.uid}</p>
            <p><strong>Email:</strong> {currentUser.email}</p>
            <p><strong>Display Name:</strong> {currentUser.displayName || 'Not set'}</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>As Dealer - My Farmers ({dealerFarmers.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {dealerFarmers.length > 0 ? (
              <div className="space-y-3">
                {dealerFarmers.map((farmer, index) => (
                  <div key={index} className="p-3 border rounded">
                    <p><strong>Name:</strong> {farmer.farmerName}</p>
                    <p><strong>Email:</strong> {farmer.farmerEmail}</p>
                    <p><strong>Farmer ID:</strong> {farmer.farmerId}</p>
                    <p><strong>FCR:</strong> {farmer.fcr}</p>
                    <p><strong>Last Update:</strong> {farmer.lastUpdated?.toDate?.()?.toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No farmers found for this dealer</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>As Farmer - My Dealers ({farmerDealers.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {farmerDealers.length > 0 ? (
              <div className="space-y-3">
                {farmerDealers.map((dealer, index) => (
                  <div key={index} className="p-3 border rounded">
                    <p><strong>Name:</strong> {dealer.dealerName}</p>
                    <p><strong>Email:</strong> {dealer.dealerEmail}</p>
                    <p><strong>Dealer ID:</strong> {dealer.dealerId}</p>
                    <p><strong>Connected:</strong> {dealer.connectedDate?.toDate?.()?.toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No dealers found for this farmer</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Firebase Data Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm space-y-2 font-mono">
            <p>Current user queries Firestore for:</p>
            <p>• <strong>dealerFarmers</strong> collection where dealerId == {currentUser.uid}</p>
            <p>• <strong>farmerDealers</strong> collection where farmerId == {currentUser.uid}</p>
            <br />
            <p>Based on your Firebase data:</p>
            <p>• User <strong>75AsBEgjdyYB dAtTa6uee19DMAi2</strong> should see dealers (as farmer)</p>
            <p>• User <strong>nOMLKq4wDAeSRIGfkM736OZY4ws1</strong> should see farmers (as dealer)</p>
            <p>• User <strong>9Oo8a8oxWSQdjSp42sHr8qbRmU12</strong> has active invitations</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConnectionTest;
