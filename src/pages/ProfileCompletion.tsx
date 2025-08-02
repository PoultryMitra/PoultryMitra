import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { User, Phone, MapPin, AlertCircle, CheckCircle, Lock, Shield } from "lucide-react";

const ProfileCompletion = () => {
  const [formData, setFormData] = useState({
    phone: '',
    location: '',
    role: '',
    farmSize: '',
    flockSize: '',
    farmCapacity: '',
    businessName: '',
    clientCount: ''
  });
  const [passwordData, setPasswordData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPasswordSetup, setShowPasswordSetup] = useState(false);
  const [isGoogleUser, setIsGoogleUser] = useState(false);

  const { currentUser, updateUserProfile, addPasswordToGoogleAccount, userProfile } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Check if this is a Google user
    const googleParam = searchParams.get('google');
    const setupPasswordParam = searchParams.get('setup-password');
    
    if (googleParam === 'true') {
      setIsGoogleUser(true);
      
      // Check if user needs to set up password
      if (setupPasswordParam === 'true' || (userProfile && !userProfile.hasPassword)) {
        setShowPasswordSetup(true);
      }
    }
  }, [searchParams, userProfile]);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordData(prev => ({ ...prev, [field]: value }));
  };

  const handlePasswordSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!passwordData.password || passwordData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (passwordData.password !== passwordData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      setError('');
      setLoading(true);
      
      await addPasswordToGoogleAccount(passwordData.password);
      setShowPasswordSetup(false);
      setPasswordData({ password: '', confirmPassword: '' });
      
      // Show success message
      setError('');
      alert('Password set successfully! You can now login with email and password.');
      
    } catch (error: any) {
      setError(error.message);
    }
    setLoading(false);
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
        role: formData.role as 'farmer' | 'dealer' | 'admin',
        phone: formData.phone,
        location: formData.location,
        ...(formData.role === 'farmer' && { 
          farmSize: formData.farmSize || '',
          flockSize: formData.flockSize ? parseInt(formData.flockSize) : 0,
          farmCapacity: formData.farmCapacity || ''
        }),
        ...(formData.role === 'dealer' && { 
          businessName: formData.businessName || '',
          clientCount: formData.clientCount ? parseInt(formData.clientCount) : 0
        })
      };

      await updateUserProfile(profileData);
      
      // Redirect based on role
      if (formData.role === 'farmer') {
        navigate('/farmer/dashboard', { replace: true });
      } else if (formData.role === 'dealer') {
        navigate('/dealer/dashboard', { replace: true });
      } else if (formData.role === 'admin') {
        navigate('/admin', { replace: true });
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
            {isGoogleUser && (
              <div className="mt-2 text-sm text-blue-600">
                You signed in with Google. You can optionally set up a password for email login.
              </div>
            )}
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
                  <SelectItem value="admin">Administrator</SelectItem>
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
                  <Label htmlFor="flockSize">Current Flock Size (Number of Birds)</Label>
                  <Input
                    id="flockSize"
                    type="number"
                    placeholder="e.g., 5000"
                    value={formData.flockSize}
                    onChange={(e) => handleChange('flockSize', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="farmCapacity">Farm Capacity</Label>
                  <Input
                    id="farmCapacity"
                    type="text"
                    placeholder="e.g., 10,000 birds capacity"
                    value={formData.farmCapacity}
                    onChange={(e) => handleChange('farmCapacity', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="farmSize">Farm Size (Optional)</Label>
                  <Input
                    id="farmSize"
                    type="text"
                    placeholder="e.g., 25 acres"
                    value={formData.farmSize}
                    onChange={(e) => handleChange('farmSize', e.target.value)}
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

          {/* Password Setup Section for Google Users */}
          {isGoogleUser && (
            <>
              <Separator className="my-6" />
              <div className="space-y-4">
                <div className="text-center">
                  <Shield className="mx-auto w-8 h-8 text-blue-600 mb-2" />
                  <h3 className="text-lg font-semibold text-gray-900">Optional: Set up Password</h3>
                  <p className="text-sm text-gray-600">
                    Create a password to login with email instead of Google
                  </p>
                </div>

                {!showPasswordSetup ? (
                  <Button
                    onClick={() => setShowPasswordSetup(true)}
                    variant="outline"
                    className="w-full border-blue-600 text-blue-600 hover:bg-blue-50"
                  >
                    <Lock className="w-4 h-4 mr-2" />
                    Set up Password
                  </Button>
                ) : (
                  <form onSubmit={handlePasswordSetup} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="password">Create Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="password"
                          type="password"
                          placeholder="Enter password (min 6 characters)"
                          value={passwordData.password}
                          onChange={(e) => handlePasswordChange('password', e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="confirmPassword"
                          type="password"
                          placeholder="Confirm your password"
                          value={passwordData.confirmPassword}
                          onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        type="submit"
                        className="flex-1 bg-blue-600 hover:bg-blue-700"
                        disabled={loading}
                      >
                        {loading ? 'Setting up...' : 'Set Password'}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setShowPasswordSetup(false);
                          setPasswordData({ password: '', confirmPassword: '' });
                          setError('');
                        }}
                        disabled={loading}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileCompletion;
