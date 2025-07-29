import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-green-600">Poultry Mitra</h1>
            </div>
            <nav className="hidden md:flex space-x-8">
              <Link to="/about" className="text-gray-500 hover:text-gray-900">About</Link>
              <Link to="/services" className="text-gray-500 hover:text-gray-900">Services</Link>
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
            Welcome to <span className="text-green-600">Poultry Mitra</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Your comprehensive platform for poultry farm management. Track expenses, monitor health, 
            calculate FCR, and manage your poultry business efficiently.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/farmer-login">
              <Button size="lg" className="bg-green-600 hover:bg-green-700">
                Farmer Login
              </Button>
            </Link>
            <Link to="/dealer-login">
              <Button size="lg" variant="outline">
                Dealer Login
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Services</h2>
            <p className="text-lg text-gray-600">Everything you need to manage your poultry business</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Farm Management</CardTitle>
                <CardDescription>Complete farm operation management</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Track daily operations, manage crops, and monitor farm health with our comprehensive tools.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Financial Tracking</CardTitle>
                <CardDescription>Expense and income management</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Monitor your expenses, track income, and get detailed financial reports for better decision making.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>FCR Calculator</CardTitle>
                <CardDescription>Feed Conversion Ratio tracking</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Calculate and monitor Feed Conversion Ratio to optimize feed efficiency and reduce costs.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Health Management</CardTitle>
                <CardDescription>Vaccine and health tracking</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Keep track of vaccination schedules, health records, and get timely reminders.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Market Rates</CardTitle>
                <CardDescription>Real-time market information</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Stay updated with current broiler and egg rates in your region for better pricing decisions.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Customer Management</CardTitle>
                <CardDescription>Dealer and customer relations</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Manage customer relationships, track orders, and maintain communication with dealers.</p>
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
                <li><Link to="/about" className="text-gray-300 hover:text-white">About Us</Link></li>
                <li><Link to="/services" className="text-gray-300 hover:text-white">Services</Link></li>
                <li><Link to="/contact" className="text-gray-300 hover:text-white">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Support</h4>
              <ul className="space-y-2">
                <li><Link to="/help" className="text-gray-300 hover:text-white">Help Center</Link></li>
                <li><Link to="/privacy" className="text-gray-300 hover:text-white">Privacy Policy</Link></li>
                <li><Link to="/terms" className="text-gray-300 hover:text-white">Terms of Service</Link></li>
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

export default Index;
