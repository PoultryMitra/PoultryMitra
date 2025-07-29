import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const userAccounts = [
  {
    name: "Alice Johnson",
    email: "alice@example.com",
    role: "Admin",
  },
  {
    name: "Bob Williams",
    email: "bob@example.com",
    role: "Dealer",
  },
  {
    name: "Charlie Brown",
    email: "charlie@example.com",
    role: "Farmer",
  },
  {
    name: "Diana Prince",
    email: "diana@example.com",
    role: "Farmer",
  },
];

export default function AdminPanel() {
  const handleDelete = (email: string) => {
    console.log("Deleting user:", email);
    // Handle delete logic
  };

  return (
    <div className="space-y-6">
      {/* User Accounts Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold">User Accounts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Name</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Email</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Role</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {userAccounts.map((user) => (
                  <tr key={user.email} className="border-b border-gray-100">
                    <td className="py-3 px-4 text-gray-900">{user.name}</td>
                    <td className="py-3 px-4 text-gray-600">{user.email}</td>
                    <td className="py-3 px-4 text-gray-900">{user.role}</td>
                    <td className="py-3 px-4">
                      <Button
                        onClick={() => handleDelete(user.email)}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 text-sm rounded"
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}