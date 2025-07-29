import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";

const TermsOfService = () => {
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
            Terms of <span className="text-green-600">Service</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Please read these terms and conditions carefully before using our services.
          </p>
          <p className="text-sm text-gray-500">Last updated: January 29, 2025</p>
        </div>
      </section>

      {/* Terms Content */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-8">
            
            <Card>
              <CardHeader>
                <CardTitle className="text-green-600">1. Acceptance of Terms</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600">
                  By accessing and using Poultry Mitra's services, you accept and agree to be bound by 
                  the terms and provision of this agreement. If you do not agree to abide by the above, 
                  please do not use this service.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-green-600">2. Service Description</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600">
                  Poultry Mitra provides a comprehensive farm management platform designed to help 
                  poultry farmers manage their operations, track expenses, monitor health, calculate 
                  FCR, and optimize their business processes. Our services include but are not limited to:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-600">
                  <li>Farm operation management tools</li>
                  <li>Financial tracking and reporting</li>
                  <li>Health management systems</li>
                  <li>FCR calculation tools</li>
                  <li>Market rate information</li>
                  <li>Customer relationship management</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-green-600">3. User Accounts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Account Creation</h4>
                  <p className="text-gray-600">
                    To use our services, you must create an account by providing accurate and complete 
                    information. You are responsible for maintaining the confidentiality of your account 
                    credentials.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Account Security</h4>
                  <p className="text-gray-600">
                    You are responsible for all activities that occur under your account. You must 
                    immediately notify us of any unauthorized use of your account.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Account Termination</h4>
                  <p className="text-gray-600">
                    We reserve the right to suspend or terminate your account if you violate these terms 
                    or engage in activities that may harm our services or other users.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-green-600">4. User Responsibilities</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600">As a user of our services, you agree to:</p>
                <ul className="list-disc list-inside space-y-2 text-gray-600">
                  <li>Provide accurate and truthful information</li>
                  <li>Use the services only for lawful purposes</li>
                  <li>Not interfere with or disrupt the services</li>
                  <li>Not attempt to gain unauthorized access to our systems</li>
                  <li>Respect the intellectual property rights of others</li>
                  <li>Comply with all applicable laws and regulations</li>
                  <li>Maintain the security of your account credentials</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-green-600">5. Prohibited Uses</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600">You may not use our services for:</p>
                <ul className="list-disc list-inside space-y-2 text-gray-600">
                  <li>Any unlawful purpose or to solicit others to perform unlawful acts</li>
                  <li>Violating any international, federal, provincial, or state regulations, rules, laws, or local ordinances</li>
                  <li>Infringing upon or violating our intellectual property rights or the intellectual property rights of others</li>
                  <li>Harassing, abusing, insulting, harming, defaming, slandering, disparaging, intimidating, or discriminating</li>
                  <li>Submitting false or misleading information</li>
                  <li>Uploading or transmitting viruses or any other type of malicious code</li>
                  <li>Collecting or tracking the personal information of others</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-green-600">6. Payment Terms</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Subscription Fees</h4>
                  <p className="text-gray-600">
                    Certain features of our services require payment of subscription fees. All fees are 
                    non-refundable unless otherwise stated in our refund policy.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Payment Processing</h4>
                  <p className="text-gray-600">
                    Payments are processed through secure third-party payment processors. You agree to 
                    provide current, complete, and accurate purchase and account information.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Auto-Renewal</h4>
                  <p className="text-gray-600">
                    Subscriptions automatically renew unless cancelled before the renewal date. You can 
                    cancel your subscription at any time through your account settings.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-green-600">7. Intellectual Property</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600">
                  The service and its original content, features, and functionality are and will remain 
                  the exclusive property of Poultry Mitra and its licensors. The service is protected 
                  by copyright, trademark, and other laws. Our trademarks and trade dress may not be 
                  used in connection with any product or service without our prior written consent.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-green-600">8. Privacy Policy</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600">
                  Your privacy is important to us. Please review our Privacy Policy, which also governs 
                  your use of the service, to understand our practices.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-green-600">9. Disclaimer of Warranties</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600">
                  The information on this platform is provided on an "as is" basis. To the fullest 
                  extent permitted by law, we exclude all representations, warranties, and conditions 
                  relating to our services and the use of this platform.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-green-600">10. Limitation of Liability</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600">
                  In no event shall Poultry Mitra, nor its directors, employees, partners, agents, 
                  suppliers, or affiliates, be liable for any indirect, incidental, special, consequential, 
                  or punitive damages arising from your use of the service.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-green-600">11. Indemnification</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600">
                  You agree to defend, indemnify, and hold harmless Poultry Mitra and its licensee and 
                  licensors, and their employees, contractors, agents, officers and directors, from and 
                  against any and all claims, damages, obligations, losses, liabilities, costs or debt, 
                  and expenses (including but not limited to attorney's fees).
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-green-600">12. Termination</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600">
                  We may terminate or suspend your account and bar access to the service immediately, 
                  without prior notice or liability, under our sole discretion, for any reason whatsoever 
                  and without limitation, including but not limited to a breach of the terms.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-green-600">13. Governing Law</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600">
                  These terms shall be interpreted and governed by the laws of India, without regard to 
                  its conflict of law provisions. Our failure to enforce any right or provision of these 
                  terms will not be considered a waiver of those rights.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-green-600">14. Changes to Terms</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600">
                  We reserve the right, at our sole discretion, to modify or replace these terms at any 
                  time. If a revision is material, we will provide at least 30 days notice prior to any 
                  new terms taking effect.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-green-600">15. Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600">
                  If you have any questions about these Terms of Service, please contact us at:
                </p>
                <div className="space-y-2 text-gray-600">
                  <p>Email: legal@poultrymitra.com</p>
                  <p>Phone: +91 12345 67890</p>
                  <p>Address: 123 Agricultural Tech Park, Bangalore, Karnataka 560001, India</p>
                </div>
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
                <li><Link to="/terms" className="text-white font-medium">Terms of Service</Link></li>
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

export default TermsOfService;
