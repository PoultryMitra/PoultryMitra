import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";
import { Globe } from "lucide-react";

const Contact = () => {
  const [language, setLanguage] = useState("hi");
  
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const content = {
    hi: {
      header: {
        title: "पोल्ट्री मित्र",
        about: "हमारे बारे में",
        services: "सेवाएं",
        contact: "संपर्क",
        login: "लॉग इन",
        register: "रजिस्टर करें"
      },
      hero: {
        title: "संपर्क करें",
        subtitle: "हमारी टीम से जुड़ें और अपने सवालों के जवाब पाएं"
      },
      form: {
        title: "हमें संदेश भेजें",
        subtitle: "हम यहाँ मदद के लिए हैं",
        name: "नाम",
        namePlaceholder: "आपका नाम",
        email: "ईमेल",
        emailPlaceholder: "आपका ईमेल",
        subject: "विषय",
        subjectPlaceholder: "संदेश का विषय",
        message: "संदेश",
        messagePlaceholder: "आपका संदेश...",
        send: "संदेश भेजें",
        thankYou: "आपके संदेश के लिए धन्यवाद! हम जल्द ही आपसे संपर्क करेंगे।"
      }
    },
    en: {
      header: {
        title: "Poultry Mitra",
        about: "About",
        services: "Services",
        contact: "Contact",
        login: "Login",
        register: "Register"
      },
      hero: {
        title: "Contact Us",
        subtitle: "Get in touch with our team and get answers to your questions"
      },
      form: {
        title: "Send us a message",
        subtitle: "We're here to help",
        name: "Name",
        namePlaceholder: "Your name",
        email: "Email",
        emailPlaceholder: "Your email",
        subject: "Subject",
        subjectPlaceholder: "Message subject",
        message: "Message",
        messagePlaceholder: "Your message...",
        send: "Send Message",
        thankYou: "Thank you for your message! We'll get back to you soon."
      }
    }
  };

  const t = content[language];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    alert(t.form.thankYou);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Link to="/">
                <h1 className="text-2xl font-bold text-green-600">{t.header.title}</h1>
              </Link>
            </div>
            <nav className="hidden md:flex space-x-8">
              <Link to="/about" className="text-gray-500 hover:text-gray-900">{t.header.about}</Link>
              <Link to="/services" className="text-gray-500 hover:text-gray-900">{t.header.services}</Link>
              <Link to="/contact" className="text-gray-900 font-medium">{t.header.contact}</Link>
            </nav>
            <div className="flex items-center space-x-4">
              {/* Language Toggle */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLanguage(language === 'hi' ? 'en' : 'hi')}
                className="flex items-center gap-2"
              >
                <Globe className="w-4 h-4" />
                {language === 'hi' ? 'EN' : 'हिं'}
              </Button>
              
              <Link to="/login">
                <Button variant="outline">{t.header.login}</Button>
              </Link>
              <Link to="/register">
                <Button className="bg-green-600 hover:bg-green-700">{t.header.register}</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            <span className="text-green-600">{t.hero.title}</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            {t.hero.subtitle}
          </p>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl text-green-600">{t.form.title}</CardTitle>
                  <CardDescription>
                    {t.form.subtitle}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName">{t.form.name}</Label>
                        <Input id="firstName" placeholder={t.form.namePlaceholder} required />
                      </div>
                      <div>
                        <Label htmlFor="lastName">{t.form.name}</Label>
                        <Input id="lastName" placeholder={t.form.namePlaceholder} required />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="email">{t.form.email}</Label>
                      <Input id="email" type="email" placeholder={t.form.emailPlaceholder} required />
                    </div>
                    
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input id="phone" type="tel" placeholder="+91 12345 67890" />
                    </div>
                    
                    <div>
                      <Label htmlFor="subject">{t.form.subject}</Label>
                      <Input id="subject" placeholder={t.form.subjectPlaceholder} required />
                    </div>
                    
                    <div>
                      <Label htmlFor="message">{t.form.message}</Label>
                      <Textarea 
                        id="message" 
                        placeholder={t.form.messagePlaceholder} 
                        rows={5}
                        required 
                      />
                    </div>
                    
                    <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">
                      {t.form.send}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Contact Information */}
            <div className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle className="text-green-600">Get in Touch</CardTitle>
                  <CardDescription>
                    Multiple ways to reach our support team
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Email Support</h4>
                    <p className="text-gray-600">support@poultrymitra.com</p>
                    <p className="text-sm text-gray-500">We typically respond within 24 hours</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Phone Support</h4>
                    <p className="text-gray-600">+91 12345 67890</p>
                    <p className="text-sm text-gray-500">Mon-Fri, 9:00 AM - 6:00 PM IST</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Office Address</h4>
                    <p className="text-gray-600">
                      123 Agricultural Tech Park<br />
                      Bangalore, Karnataka 560001<br />
                      India
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Business Hours</h4>
                    <p className="text-gray-600">
                      Monday - Friday: 9:00 AM - 6:00 PM<br />
                      Saturday: 10:00 AM - 4:00 PM<br />
                      Sunday: Closed
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-green-600">Emergency Support</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    For critical farm emergencies requiring immediate attention:
                  </p>
                  <p className="font-semibold text-gray-900">Emergency Hotline: +91 98765 43210</p>
                  <p className="text-sm text-gray-500">Available 24/7 for premium customers</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-lg text-gray-600">Quick answers to common questions</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>How do I get started?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Simply register for an account, complete your profile, and start managing your farm operations immediately.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Is there a free trial?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Yes! We offer a 30-day free trial with full access to all features.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>What support do you provide?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  We provide email support, phone support, and access to agricultural experts and veterinarians.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Can I use this on mobile?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Yes, our platform is fully responsive and works great on mobile devices and tablets.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <h3 className="text-2xl font-bold mb-4">Poultry Mitra</h3>
              <p className="text-gray-300 mb-4">
                Empowering poultry farmers with technology to improve productivity and profitability.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><Link to="/about" className="text-gray-300 hover:text-white" onClick={scrollToTop}>About Us</Link></li>
                <li><Link to="/services" className="text-gray-300 hover:text-white" onClick={scrollToTop}>Services</Link></li>
                <li><Link to="/contact" className="text-white font-medium" onClick={scrollToTop}>Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Support</h4>
              <ul className="space-y-2">
                <li><Link to="/help" className="text-gray-300 hover:text-white" onClick={scrollToTop}>Help Center</Link></li>
                <li><Link to="/privacy" className="text-gray-300 hover:text-white" onClick={scrollToTop}>Privacy Policy</Link></li>
                <li><Link to="/terms" className="text-gray-300 hover:text-white" onClick={scrollToTop}>Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p className="text-gray-300">&copy; 2025 Poultry Mitra. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Contact;
