import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Mail, Lock, AlertCircle, Shield, Globe } from "lucide-react";

const AdminLogin = () => {
  const [language, setLanguage] = useState("hi");
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);

  const { login, loginWithGoogle, resetPassword } = useAuth();
  const navigate = useNavigate();

  const content = {
    hi: {
      title: "एडमिन लॉगिन",
      subtitle: "प्रशासनिक पैनल तक सुरक्षित पहुंच",
      adminEmail: "एडमिन ईमेल",
      emailPlaceholder: "एडमिन ईमेल दर्ज करें",
      password: "पासवर्ड",
      passwordPlaceholder: "पासवर्ड दर्ज करें",
      signIn: "एडमिन के रूप में साइन इन करें",
      signingIn: "साइन इन हो रहे हैं...",
      forgotPassword: "अपना पासवर्ड भूल गए?",
      continueWithGoogle: "Google के साथ जारी रखें",
      backToLogin: "← मुख्य लॉगिन पर वापस जाएं",
      accessRestricted: "एडमिन पहुंच प्रतिबंधित है। क्रेडेंशियल के लिए सिस्टम एडमिनिस्ट्रेटर से संपर्क करें।",
      fillAllFields: "कृपया सभी फ़ील्ड भरें",
      invalidCredentials: "अमान्य एडमिन क्रेडेंशियल",
      enterEmailFirst: "कृपया पहले अपना ईमेल पता दर्ज करें",
      resetEmailSent: "पासवर्ड रीसेट ईमेल भेजा गया! अपना इनबॉक्स चेक करें।"
    },
    en: {
      title: "Admin Login",
      subtitle: "Secure access to administrative panel",
      adminEmail: "Admin Email",
      emailPlaceholder: "Enter admin email",
      password: "Password",
      passwordPlaceholder: "Enter password",
      signIn: "Sign In as Admin",
      signingIn: "Signing in...",
      forgotPassword: "Forgot your password?",
      continueWithGoogle: "Continue with Google",
      backToLogin: "← Back to main login",
      accessRestricted: "Admin access is restricted. Contact system administrator for credentials.",
      fillAllFields: "Please fill in all fields",
      invalidCredentials: "Invalid admin credentials",
      enterEmailFirst: "Please enter your email address first",
      resetEmailSent: "Password reset email sent! Check your inbox."
    }
  };

  const t = content[language];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError(t.fillAllFields);
      return;
    }

    try {
      setError('');
      setLoading(true);
      await login(email, password);
      // After login, the ProfileGuard will check if user is admin
      // If not admin, they'll be redirected appropriately
      navigate('/admin', { replace: true });
    } catch (error: any) {
      if (error.message.includes('user-not-found') || error.message.includes('wrong-password')) {
        setError(t.invalidCredentials);
      } else {
        setError(error.message);
      }
    }
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    try {
      setError('');
      setLoading(true);
      console.log('AdminLogin: Starting Google login...');
      await loginWithGoogle(); // Use default redirect mode to avoid CORS issues
      console.log('AdminLogin: Google login successful, checking admin access...');
      // After successful Google login, redirect to admin panel
      // The ProfileGuard will handle checking if user has admin role
      navigate('/admin', { replace: true });
    } catch (error: any) {
      console.error('Google login error in AdminLogin:', error);
      setError(error.message);
    }
    setLoading(false);
  };

  const handleResetPassword = async () => {
    if (!email) {
      setError(t.enterEmailFirst);
      return;
    }

    try {
      setError('');
      await resetPassword(email);
      setResetEmailSent(true);
    } catch (error: any) {
      setError(error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          {/* Language Toggle */}
          <div className="flex justify-end mb-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLanguage(language === 'hi' ? 'en' : 'hi')}
              className="flex items-center gap-2"
            >
              <Globe className="w-4 h-4" />
              {language === 'hi' ? 'EN' : 'हिं'}
            </Button>
          </div>
          
          <div className="mx-auto w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
            <Shield className="w-6 h-6 text-purple-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-purple-700">{t.title}</CardTitle>
          <CardDescription>{t.subtitle}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {resetEmailSent && (
            <Alert>
              <Mail className="h-4 w-4" />
              <AlertDescription>
                {t.resetEmailSent}
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t.adminEmail}</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder={t.emailPlaceholder}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">{t.password}</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder={t.passwordPlaceholder}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-700"
              disabled={loading}
            >
              {loading ? t.signingIn : t.signIn}
            </Button>
          </form>

          <div className="text-center">
            <button
              type="button"
              onClick={handleResetPassword}
              className="text-sm text-purple-600 hover:text-purple-700 underline"
            >
              {t.forgotPassword}
            </button>
          </div>

          <Separator />

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleGoogleLogin}
            disabled={loading}
          >
            <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {t.continueWithGoogle}
          </Button>

          <div className="text-center text-sm text-gray-600">
            <Link to="/login" className="text-purple-600 hover:text-purple-700 font-medium">
              {t.backToLogin}
            </Link>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <p className="text-xs text-amber-700 text-center">
              <AlertCircle className="w-3 h-3 inline mr-1" />
              {t.accessRestricted}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;
