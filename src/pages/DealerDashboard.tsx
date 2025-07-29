import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const farmerAccounts = [
  {
    id: "F001",
    name: "John Doe",
    totalExpenses: "$12,500",
    contact: "john.doe@example.com",
  },
  {
    id: "F002",
    name: "Jane Smith",
    totalExpenses: "$8,200",
    contact: "jane.smith@example.com",
  },
  {
    id: "F003",
    name: "Robert Johnson",
    totalExpenses: "$15,100",
    contact: "robert.j@example.com",
  },
  {
    id: "F004",
    name: "Emily Davis",
    totalExpenses: "$9,800",
    contact: "emily.d@example.com",
  },
];

export default function DealerDashboard() {
  return (
    <div className="space-y-6">
      {/* Farmer Accounts Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Farmer Accounts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Farmer Name</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">ID</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Total Expenses</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Contact</th>
                </tr>
              </thead>
              <tbody>
                {farmerAccounts.map((farmer) => (
                  <tr key={farmer.id} className="border-b border-gray-100">
                    <td className="py-3 px-4 text-gray-900">{farmer.name}</td>
                    <td className="py-3 px-4 text-gray-600">{farmer.id}</td>
                    <td className="py-3 px-4 text-gray-900">{farmer.totalExpenses}</td>
                    <td className="py-3 px-4 text-gray-600">{farmer.contact}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Current Broiler Rate */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Current Broiler Rate</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-green-600 mb-2">₹ 120 / kg</div>
          <p className="text-gray-600">Last updated: 2024-07-10</p>
        </CardContent>
      </Card>
    </div>
  );
}