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
import { useEnhancedTranslation } from "@/contexts/EnhancedTranslationContext";
import { LanguageToggle, TranslationStatus } from "@/components/TranslationComponents";

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState("");
  const navigate = useNavigate();
  const { language, t } = useEnhancedTranslation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate registration
    setTimeout(() => {
      setIsLoading(false);
      navigate("/dashboard");
    }, 1000);
  };

  // Enhanced translation function that prioritizes Google Translate
  const bt = (key: string): string => {
    // First try Enhanced Translation Context (Google Translate)
    const dynamicTranslation = t(key);
    if (dynamicTranslation && dynamicTranslation !== key) {
      console.log(`🌍 Google Translate used for Register: ${key} -> ${dynamicTranslation}`);
      return dynamicTranslation;
    }

    // Fallback to static translations
    const translations = {
      'register.title': { hi: "खाता बनाएं", en: "Create Account" },
      'register.subtitle': { hi: "अपना पोल्ट्री केयर खाता बनाएं", en: "Sign up for your PoultryCare account" },
      'register.signUp': { hi: "साइन अप करें", en: "Sign Up" },
      'register.createAccount': { hi: "शुरू करने के लिए अपना खाता बनाएं", en: "Create your account to get started" },
      'register.firstName': { hi: "पहला नाम", en: "First Name" },
      'register.lastName': { hi: "अंतिम नाम", en: "Last Name" },
      'register.email': { hi: "ईमेल", en: "Email" },
      'register.phone': { hi: "फोन नंबर", en: "Phone Number" },
      'register.role': { hi: "भूमिका", en: "Role" },
      'register.farmer': { hi: "किसान", en: "Farmer" },
      'register.dealer': { hi: "डीलर", en: "Dealer" },
      'register.flockSize': { hi: "मुर्गी की संख्या", en: "Flock Size (Number of Birds)" },
      'register.password': { hi: "पासवर्ड", en: "Password" },
      'register.confirmPassword': { hi: "पासवर्ड की पुष्टि करें", en: "Confirm Password" },
      'register.createBtn': { hi: "खाता बनाएं", en: "Create Account" },
      'register.creating': { hi: "खाता बनाया जा रहा है...", en: "Creating account..." },
      'register.haveAccount': { hi: "पहले से खाता है?", en: "Already have an account?" },
      'register.signIn': { hi: "साइन इन करें", en: "Sign in" },
      'register.leftTitle': { hi: "आज ही PoultryCare में शामिल हों", en: "Join PoultryCare Today" },
      'register.leftSubtitle': { hi: "हमारे उन्नत उपकरणों और अंतर्दृष्टि के साथ अपने पोल्ट्री फार्म को कुशलता से प्रबंधित करना शुरू करें।", en: "Start managing your poultry farm efficiently with our advanced tools and insights." },
      'register.enterFlockSize': { hi: "मुर्गी की संख्या दर्ज करें", en: "Enter flock size" }
    };
    
    const translation = translations[key as keyof typeof translations];
    if (translation) {
      const staticTranslation = translation[language] || translation.en;
      console.log(`📚 Static content used for Register: ${key} -> ${staticTranslation}`);
      return staticTranslation;
    }
    
    console.log(`❌ No translation found for Register: ${key}`);
    return key;
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Image/Illustration */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary/10 to-accent/10 items-center justify-center p-8">
        <div className="text-center space-y-6 max-w-md">
          <div className="w-64 h-64 mx-auto bg-gradient-to-br from-accent to-primary rounded-full flex items-center justify-center">
            <Bird className="w-20 h-20 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">
            {bt('register.leftTitle')}
          </h2>
          <p className="text-muted-foreground text-lg">
            {bt('register.leftSubtitle')}
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
            <h1 className="text-3xl font-bold text-foreground">{bt('register.title')}</h1>
            <p className="text-muted-foreground">
              {bt('register.subtitle')}
            </p>
          </div>

          <div className="flex justify-center space-x-2">
            <LanguageToggle />
            <TranslationStatus />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{bt('register.signUp')}</CardTitle>
              <CardDescription>
                {bt('register.createAccount')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">{bt('register.firstName')}</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="firstName"
                        placeholder={bt('register.firstName')}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">{bt('register.lastName')}</Label>
                    <Input
                      id="lastName"
                      placeholder={bt('register.lastName')}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">{bt('register.email')}</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder={bt('register.email')}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">{bt('register.phone')}</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder={bt('register.phone')}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">{bt('register.role')}</Label>
                  <Select onValueChange={setSelectedRole}>
                    <SelectTrigger>
                      <SelectValue placeholder={`${bt('register.role')} चुनें / Select ${bt('register.role')}`} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="farmer">{bt('register.farmer')}</SelectItem>
                      <SelectItem value="dealer">{bt('register.dealer')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Show flock size field only for farmers */}
                {selectedRole === "farmer" && (
                  <div className="space-y-2">
                    <Label htmlFor="flockSize">{bt('register.flockSize')}</Label>
                    <div className="relative">
                      <Bird className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="flockSize"
                        type="number"
                        placeholder={bt('register.enterFlockSize')}
                        className="pl-10"
                        min="1"
                        required
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="password">{bt('register.password')}</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder={bt('register.password')}
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
                  <Label htmlFor="confirmPassword">{bt('register.confirmPassword')}</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder={bt('register.confirmPassword')}
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
                  {isLoading ? bt('register.creating') : bt('register.createBtn')}
                </Button>

                <div className="text-center text-sm">
                  <span className="text-muted-foreground">{bt('register.haveAccount')} </span>
                  <Link to="/login" className="text-primary hover:underline">
                    {bt('register.signIn')}
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
