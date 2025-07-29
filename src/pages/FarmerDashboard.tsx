import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const vaccineReminders = [
  { name: "Fowl Pox", date: "2024-07-15" },
  { name: "Marek's Disease", date: "2024-08-01" },
];

export default function FarmerDashboard() {
  const [fcrResult, setFcrResult] = useState<number | null>(null);
  const [feedIntake, setFeedIntake] = useState("");
  const [bodyWeight, setBodyWeight] = useState("");

  const calculateFCR = () => {
    const feed = parseFloat(feedIntake);
    const weight = parseFloat(bodyWeight);
    if (feed && weight) {
      const result = feed / weight;
      setFcrResult(result);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Add Expense/Income */}
      <Card>
        <CardHeader>
          <CardTitle>Add Expense/Income</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="type">Type</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Income" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="income">Income</SelectItem>
                <SelectItem value="expense">Expense</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="amount">Amount</Label>
            <Input id="amount" placeholder="e.g., 5000" />
          </div>

          <div>
            <Label htmlFor="note">Note</Label>
            <Textarea 
              id="note" 
              placeholder="e.g., Sale of crops" 
              className="resize-none"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="date">Date</Label>
            <Input id="date" type="date" />
          </div>

          <Button className="w-full bg-green-500 hover:bg-green-600 text-white">
            Add Transaction
          </Button>
        </CardContent>
      </Card>

      {/* FCR Calculator */}
      <Card>
        <CardHeader>
          <CardTitle>FCR Calculator</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="feedIntake">Feed Intake (kg)</Label>
            <Input 
              id="feedIntake" 
              placeholder="e.g., 100"
              value={feedIntake}
              onChange={(e) => setFeedIntake(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="bodyWeight">Body Weight (kg)</Label>
            <Input 
              id="bodyWeight" 
              placeholder="e.g., 50"
              value={bodyWeight}
              onChange={(e) => setBodyWeight(e.target.value)}
            />
          </div>

          <Button 
            onClick={calculateFCR}
            className="w-full bg-green-500 hover:bg-green-600 text-white"
          >
            Calculate FCR
          </Button>

          {fcrResult && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <div className="text-lg font-semibold">FCR: {fcrResult.toFixed(1)}</div>
              <div className="text-sm text-gray-600 mt-1">
                Formula: FCR = Feed Intake / Body Weight
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Vaccine Reminders */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Vaccine Reminders</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <Label htmlFor="vaccineName">Vaccine Name</Label>
              <Input id="vaccineName" placeholder="e.g., Newcastle Disease" />
            </div>
            <div>
              <Label htmlFor="dueDate">Due Date</Label>
              <Input id="dueDate" type="date" />
            </div>
          </div>

          <Button className="bg-green-500 hover:bg-green-600 text-white mb-6">
            Add Reminder
          </Button>

          {/* Existing Reminders */}
          <div className="space-y-3">
            {vaccineReminders.map((reminder, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="font-medium">{reminder.name}</span>
                <span className="text-gray-600">{reminder.date}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
