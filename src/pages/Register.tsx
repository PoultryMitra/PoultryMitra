import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, User, Phone, Globe, Bird } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [language, setLanguage] = useState("hi"); // Default to Hindi
  const [selectedRole, setSelectedRole] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate registration
    setTimeout(() => {
      setIsLoading(false);
      navigate("/dashboard");
    }, 1000);
  };

  const content = {
    hi: {
      title: "खाता बनाएं",
      subtitle: "अपना पोल्ट्री केयर खाता बनाएं",
      signUp: "साइन अप करें",
      createAccount: "शुरू करने के लिए अपना खाता बनाएं",
      firstName: "पहला नाम",
      lastName: "अंतिम नाम",
      email: "ईमेल",
      phone: "फोन नंबर",
      role: "भूमिका",
      farmer: "किसान",
      dealer: "डीलर",
      flockSize: "मुर्गी की संख्या",
      password: "पासवर्ड",
      confirmPassword: "पासवर्ड की पुष्टि करें",
      createBtn: "खाता बनाएं",
      creating: "खाता बनाया जा रहा है...",
      haveAccount: "पहले से खाता है?",
      signIn: "साइन इन करें",
      leftTitle: "आज ही PoultryCare में शामिल हों",
      leftSubtitle: "हमारे उन्नत उपकरणों और अंतर्दृष्टि के साथ अपने पोल्ट्री फार्म को कुशलता से प्रबंधित करना शुरू करें।",
      enterFlockSize: "मुर्गी की संख्या दर्ज करें"
    },
    en: {
      title: "Create Account",
      subtitle: "Sign up for your PoultryCare account",
      signUp: "Sign Up",
      createAccount: "Create your account to get started",
      firstName: "First Name",
      lastName: "Last Name",
      email: "Email",
      phone: "Phone Number",
      role: "Role",
      farmer: "Farmer",
      dealer: "Dealer",
      flockSize: "Flock Size (Number of Birds)",
      password: "Password",
      confirmPassword: "Confirm Password",
      createBtn: "Create Account",
      creating: "Creating account...",
      haveAccount: "Already have an account?",
      signIn: "Sign in",
      leftTitle: "Join PoultryCare Today",
      leftSubtitle: "Start managing your poultry farm efficiently with our advanced tools and insights.",
      enterFlockSize: "Enter number of birds"
    }
  };

  const t = content[language as keyof typeof content];

  return (
    <div className="min-h-screen flex">
      {/* Left side - Image/Illustration */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary/10 to-accent/10 items-center justify-center p-8">
        <div className="text-center space-y-6 max-w-md">
          <div className="w-64 h-64 mx-auto bg-gradient-to-br from-accent to-primary rounded-full flex items-center justify-center">
            <Bird className="w-20 h-20 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">
            {t.leftTitle}
          </h2>
          <p className="text-muted-foreground text-lg">
            {t.leftSubtitle}
          </p>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gradient-to-br from-background to-muted/20">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center space-y-2">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center mb-4">
              <Bird className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">{t.title}</h1>
            <p className="text-muted-foreground">
              {t.subtitle}
            </p>
          </div>

          <div className="flex justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLanguage(language === "en" ? "hi" : "en")}
              className="gap-2"
            >
              <Globe className="h-4 w-4" />
              {language === "en" ? "English" : "हिंदी"}
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{t.signUp}</CardTitle>
              <CardDescription>
                {t.createAccount}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">{t.firstName}</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="firstName"
                        placeholder={t.firstName}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">{t.lastName}</Label>
                    <Input
                      id="lastName"
                      placeholder={t.lastName}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">{t.email}</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder={t.email}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">{t.phone}</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder={t.phone}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">{t.role}</Label>
                  <Select onValueChange={setSelectedRole}>
                    <SelectTrigger>
                      <SelectValue placeholder={`${t.role} चुनें / Select ${t.role}`} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="farmer">{t.farmer}</SelectItem>
                      <SelectItem value="dealer">{t.dealer}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Show flock size field only for farmers */}
                {selectedRole === "farmer" && (
                  <div className="space-y-2">
                    <Label htmlFor="flockSize">{t.flockSize}</Label>
                    <div className="relative">
                      <Bird className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="flockSize"
                        type="number"
                        placeholder={t.enterFlockSize}
                        className="pl-10"
                        min="1"
                        required
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="password">{t.password}</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder={t.password}
                      className="pl-10 pr-10"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1 h-8 w-8"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">{t.confirmPassword}</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder={t.confirmPassword}
                      className="pl-10 pr-10"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1 h-8 w-8"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? t.creating : t.createBtn}
                </Button>

                <div className="text-center text-sm">
                  <span className="text-muted-foreground">{t.haveAccount} </span>
                  <Link to="/login" className="text-primary hover:underline">
                    {t.signIn}
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}