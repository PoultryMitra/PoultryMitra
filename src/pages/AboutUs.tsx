import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";

const AboutUs = () => {
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
              <Link to="/about" className="text-gray-900 font-medium">About</Link>
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
            About <span className="text-green-600">Poultry Mitra</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Empowering poultry farmers with technology to improve productivity and profitability through innovative digital solutions.
          </p>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl text-green-600">Our Mission</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 leading-relaxed">
                  To revolutionize poultry farming through innovative technology solutions that help farmers 
                  optimize their operations, increase productivity, and achieve sustainable profitability. 
                  We believe in empowering farmers with the tools and knowledge they need to succeed in 
                  today's competitive market.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-2xl text-green-600">Our Vision</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 leading-relaxed">
                  To become the leading platform for poultry farm management globally, creating a 
                  sustainable ecosystem where farmers, dealers, and customers can connect, collaborate, 
                  and thrive together while ensuring food security and environmental responsibility.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Poultry Mitra?</h2>
            <p className="text-lg text-gray-600">Comprehensive solutions for modern poultry farming</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Comprehensive Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p>All-in-one platform for managing every aspect of your poultry farm from crops to customers.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Real-time Monitoring</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Track farm performance, health metrics, and financial data in real-time for better decision making.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Expert Support</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Access to agricultural experts and veterinarians for guidance and support when you need it.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Data-Driven Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Advanced analytics and reporting to help you understand trends and optimize operations.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>User-Friendly Interface</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Intuitive design that's easy to use for farmers of all technical backgrounds.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Scalable Solutions</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Whether you're a small farm or large operation, our platform scales with your business needs.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-green-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Transform Your Farm?</h2>
          <p className="text-xl text-green-100 mb-8">Join thousands of farmers who are already using Poultry Mitra</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button size="lg" className="bg-white text-green-600 hover:bg-gray-100">
                Get Started Today
              </Button>
            </Link>
            <Link to="/contact">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-green-600">
                Contact Us
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
                <li><Link to="/about" className="text-white font-medium">About Us</Link></li>
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

export default AboutUs;
