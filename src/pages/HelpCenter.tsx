import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";

const HelpCenter = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Link to="/">
                <h1 className="text-2xl font-bold text-green-600">Poultry Mitra</h1>
              </Link>
            </div>
            <nav className="hidden md:flex space-x-8">
              <Link to="/about" className="text-gray-500 hover:text-gray-900">About</Link>
              <Link to="/services" className="text-gray-500 hover:text-gray-900">Services</Link>
              <Link to="/contact" className="text-gray-500 hover:text-gray-900">Contact</Link>
            </nav>
            <div className="flex space-x-4">
              <Link to="/login">
                <Button className="bg-white text-green-600 hover:bg-gray-100">Login</Button>
              </Link>
              <Link to="/register">
                <Button className="bg-green-600 hover:bg-green-700">Register</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Help <span className="text-green-600">Center</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Find answers to common questions and get the help you need to make the most of Poultry Mitra.
          </p>
          
          {/* Search Bar - Commented out for now */}
          {/* 
          <div className="max-w-2xl mx-auto mb-8">
            <div className="flex gap-2">
              <Input 
                placeholder="Search for help articles, guides, and FAQs..." 
                className="flex-1"
              />
              <Button className="bg-green-600 hover:bg-green-700">Search</Button>
            </div>
          </div>
          */}
        </div>
      </section>

      {/* Quick Help Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Popular Help Topics</h2>
            <p className="text-lg text-gray-600">Quick access to the most common questions</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="text-green-600">Getting Started</CardTitle>
                <CardDescription>Learn the basics of using Poultry Mitra</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Creating your account</li>
                  <li>• Setting up your farm profile</li>
                  <li>• Adding your first crop</li>
                  <li>• Dashboard overview</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="text-green-600">Farm Management</CardTitle>
                <CardDescription>Managing your daily farm operations</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Adding and tracking crops</li>
                  <li>• Managing farm tasks</li>
                  <li>• Recording daily activities</li>
                  <li>• Equipment management</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="text-green-600">Financial Tracking</CardTitle>
                <CardDescription>Managing expenses and income</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Recording expenses</li>
                  <li>• Tracking income</li>
                  <li>• Generating reports</li>
                  <li>• Understanding analytics</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="text-green-600">Health Management</CardTitle>
                <CardDescription>Monitoring animal health and vaccines</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Vaccination schedules</li>
                  <li>• Health record keeping</li>
                  <li>• Disease monitoring</li>
                  <li>• Veterinary contacts</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="text-green-600">FCR Calculator</CardTitle>
                <CardDescription>Understanding feed conversion ratios</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• How FCR is calculated</li>
                  <li>• Interpreting FCR results</li>
                  <li>• Improving feed efficiency</li>
                  <li>• Cost optimization tips</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="text-green-600">Account & Billing</CardTitle>
                <CardDescription>Managing your account and subscription</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Account settings</li>
                  <li>• Subscription management</li>
                  <li>• Payment methods</li>
                  <li>• Billing history</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-lg text-gray-600">Common questions from our users</p>
          </div>
          
          <div className="space-y-6 max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>How do I reset my password?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Click on "Forgot Password" on the login page, enter your email address, and follow the instructions sent to your email to reset your password.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Can I access Poultry Mitra on my mobile device?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Yes! Poultry Mitra is fully responsive and works on all devices including smartphones and tablets. Simply visit our website on your mobile browser.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>How do I add multiple farms to my account?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  You can manage multiple farms from a single account. Go to your dashboard and click "Add Farm" to create additional farm profiles.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Is my data secure?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Yes, we use industry-standard encryption and security measures to protect your data. All information is stored securely and we never share your data without your consent.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>How do I contact support?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  You can reach our support team via email at support@poultrymitra.com, phone at +91 12345 67890, or through our contact form. We typically respond within 24 hours.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>What if I need help during off-hours?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Our help center is available 24/7 with self-service options. For critical emergencies, premium customers have access to our 24/7 emergency hotline.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact Support Section */}
      <section className="py-16 bg-green-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Still Need Help?</h2>
          <p className="text-xl text-green-100 mb-8">Our support team is here to assist you</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/contact">
              <Button size="lg" className="bg-white text-green-600 hover:bg-gray-100">
                Contact Support
              </Button>
            </Link>
            <Button size="lg" className="bg-white text-green-600 hover:bg-gray-100">
              Schedule a Call
            </Button>
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
                <li><Link to="/contact" className="text-gray-300 hover:text-white" onClick={scrollToTop}>Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Support</h4>
              <ul className="space-y-2">
                <li><Link to="/help" className="text-white font-medium" onClick={scrollToTop}>Help Center</Link></li>
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

export default HelpCenter;
