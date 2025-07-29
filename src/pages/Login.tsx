import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Login() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <Card className="text-center">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-green-600">Welcome to Poultry Mitra</CardTitle>
            <CardDescription className="text-lg">Choose your login type to continue</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Link to="/farmer-login">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-green-300">
                  <CardHeader>
                    <CardTitle className="text-green-600">Farmer Login</CardTitle>
                    <CardDescription>
                      Access farm management tools, track expenses, monitor crops, and more.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full bg-green-600 hover:bg-green-700">
                      Continue as Farmer
                    </Button>
                  </CardContent>
                </Card>
              </Link>

              <Link to="/dealer-login">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-blue-300">
                  <CardHeader>
                    <CardTitle className="text-blue-600">Dealer Login</CardTitle>
                    <CardDescription>
                      Manage orders, customers, products, and view market rates.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full bg-blue-600 hover:bg-blue-700">
                      Continue as Dealer
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            </div>

            <div className="border-t pt-6">
              <p className="text-sm text-gray-600 mb-4">
                Don't have an account?{" "}
                <Link to="/register" className="text-green-600 hover:underline font-medium">
                  Register here
                </Link>
              </p>
              <p className="text-sm text-gray-600">
                <Link to="/" className="text-green-600 hover:underline">
                  ← Back to home
                </Link>
              </p>
              <p className="text-xs text-gray-500 mt-4">
                Admin access:{" "}
                <Link to="/admin" className="text-gray-600 hover:underline">
                  Admin Portal
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}