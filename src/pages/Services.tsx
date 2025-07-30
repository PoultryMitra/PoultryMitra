import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";

const Services = () => {
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
              <Link to="/services" className="text-gray-900 font-medium">Services</Link>
              <Link to="/contact" className="text-gray-500 hover:text-gray-900">Contact</Link>
            </nav>
            <div className="flex space-x-4">
              <Link to="/login">
                <Button variant="outline">Login</Button>
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
            Our <span className="text-green-600">Services</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Comprehensive solutions designed to revolutionize your poultry farming operations and maximize profitability.
          </p>
        </div>
      </section>

      {/* Core Services Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Core Services</h2>
            <p className="text-lg text-gray-600">Everything you need to manage your poultry business efficiently</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-green-600">Farm Management</CardTitle>
                <CardDescription>Complete farm operation management</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mb-4">Track daily operations, manage crops, and monitor farm health with our comprehensive tools.</p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Crop monitoring and management</li>
                  <li>• Daily task scheduling</li>
                  <li>• Farm activity logging</li>
                  <li>• Equipment tracking</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-green-600">Financial Tracking</CardTitle>
                <CardDescription>Expense and income management</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mb-4">Monitor your expenses, track income, and get detailed financial reports for better decision making.</p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Expense categorization</li>
                  <li>• Income tracking</li>
                  <li>• Profit/loss analysis</li>
                  <li>• Financial reporting</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-green-600">FCR Calculator</CardTitle>
                <CardDescription>Feed Conversion Ratio optimization</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mb-4">Calculate and monitor Feed Conversion Ratio to optimize feed efficiency and reduce costs.</p>
                <ul className="text-sm text-gray-600 space-y-1 mb-4">
                  <li>• Real-time FCR calculation</li>
                  <li>• Feed efficiency tracking</li>
                  <li>• Cost optimization analysis</li>
                  <li>• Profitability insights</li>
                </ul>
                <Link to="/fcr-calculator">
                  <Button className="bg-green-600 hover:bg-green-700 text-white">
                    Try Calculator
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-green-600">Health Management</CardTitle>
                <CardDescription>Comprehensive health monitoring</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mb-4">Keep track of vaccination schedules, health records, and get timely reminders.</p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Vaccination scheduling</li>
                  <li>• Health record keeping</li>
                  <li>• Disease monitoring</li>
                  <li>• Veterinary reminders</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-green-600">Market Intelligence</CardTitle>
                <CardDescription>Real-time market information</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mb-4">Stay updated with current broiler and egg rates in your region for better pricing decisions.</p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Live market rates</li>
                  <li>• Price trend analysis</li>
                  <li>• Regional comparisons</li>
                  <li>• Market forecasting</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-green-600">Customer Management</CardTitle>
                <CardDescription>Dealer and customer relations</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mb-4">Manage customer relationships, track orders, and maintain communication with dealers.</p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Customer database</li>
                  <li>• Order management</li>
                  <li>• Communication tools</li>
                  <li>• Sales analytics</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Additional Services Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Additional Services</h2>
            <p className="text-lg text-gray-600">Value-added services to enhance your farming experience</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-green-600">Expert Consultation</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4">Access to agricultural experts and veterinarians for guidance and support.</p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• On-demand expert advice</li>
                  <li>• Veterinary consultations</li>
                  <li>• Best practice guidance</li>
                  <li>• Problem-solving support</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-green-600">Training & Education</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4">Educational resources and training programs to improve farming techniques.</p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Video tutorials</li>
                  <li>• Webinar sessions</li>
                  <li>• Best practice guides</li>
                  <li>• Certification programs</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-green-600">Data Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4">Advanced analytics and reporting to help you understand trends and optimize operations.</p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Performance analytics</li>
                  <li>• Trend analysis</li>
                  <li>• Predictive insights</li>
                  <li>• Custom reports</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-green-600">24/7 Support</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4">Round-the-clock technical support to ensure your operations never stop.</p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• 24/7 help desk</li>
                  <li>• Technical support</li>
                  <li>• Emergency assistance</li>
                  <li>• User training</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-green-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Get Started?</h2>
          <p className="text-xl text-green-100 mb-8">Choose the plan that's right for your farm</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button size="lg" className="bg-white text-green-600 hover:bg-gray-100">
                Start Free Trial
              </Button>
            </Link>
            <Link to="/contact">
              <Button size="lg" className="bg-white text-green-600 hover:bg-gray-100">
                Contact Sales
              </Button>
            </Link>
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
                <li><Link to="/services" className="text-white font-medium" onClick={scrollToTop}>Services</Link></li>
                <li><Link to="/contact" className="text-gray-300 hover:text-white" onClick={scrollToTop}>Contact</Link></li>
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

export default Services;
