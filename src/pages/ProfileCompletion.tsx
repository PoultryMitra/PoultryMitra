import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { User, Phone, MapPin, AlertCircle, CheckCircle } from "lucide-react";

const ProfileCompletion = () => {
  const [formData, setFormData] = useState({
    phone: '',
    location: '',
    role: '',
    farmSize: '',
    birdCount: '',
    businessName: '',
    clientCount: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { currentUser, updateUserProfile } = useAuth();
  const navigate = useNavigate();

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.role) {
      setError('Please select your account type');
      return;
    }

    try {
      setError('');
      setLoading(true);
      
      const profileData = {
        role: formData.role as 'farmer' | 'dealer',
        phone: formData.phone,
        location: formData.location,
        ...(formData.role === 'farmer' && { 
          farmSize: formData.farmSize,
          birdCount: formData.birdCount ? parseInt(formData.birdCount) : undefined
        }),
        ...(formData.role === 'dealer' && { 
          businessName: formData.businessName,
          clientCount: formData.clientCount ? parseInt(formData.clientCount) : undefined
        })
      };

      await updateUserProfile(profileData);
      
      // Redirect based on role
      if (formData.role === 'farmer') {
        navigate('/farmer/dashboard', { replace: true });
      } else if (formData.role === 'dealer') {
        navigate('/dealer/dashboard', { replace: true });
      }
    } catch (error: any) {
      setError(error.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-green-700">Complete Your Profile</CardTitle>
          <CardDescription>
            Welcome {currentUser?.displayName}! Please complete your profile to get started.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="role">Account Type *</Label>
              <Select value={formData.role} onValueChange={(value) => handleChange('role', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select account type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="farmer">Farmer</SelectItem>
                  <SelectItem value="dealer">Dealer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Enter your phone number"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="location"
                  type="text"
                  placeholder="Enter your location"
                  value={formData.location}
                  onChange={(e) => handleChange('location', e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {formData.role === 'farmer' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="farmSize">Farm Size</Label>
                  <Input
                    id="farmSize"
                    type="text"
                    placeholder="e.g., 25 acres"
                    value={formData.farmSize}
                    onChange={(e) => handleChange('farmSize', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="birdCount">Number of Birds (Optional)</Label>
                  <Input
                    id="birdCount"
                    type="number"
                    placeholder="e.g., 5000"
                    value={formData.birdCount}
                    onChange={(e) => handleChange('birdCount', e.target.value)}
                  />
                </div>
              </>
            )}

            {formData.role === 'dealer' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="businessName">Business Name</Label>
                  <Input
                    id="businessName"
                    type="text"
                    placeholder="Enter your business name"
                    value={formData.businessName}
                    onChange={(e) => handleChange('businessName', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clientCount">Number of Clients (Optional)</Label>
                  <Input
                    id="clientCount"
                    type="number"
                    placeholder="e.g., 45"
                    value={formData.clientCount}
                    onChange={(e) => handleChange('clientCount', e.target.value)}
                  />
                </div>
              </>
            )}

            <Button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700"
              disabled={loading}
            >
              {loading ? 'Completing Profile...' : 'Complete Profile'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileCompletion;
