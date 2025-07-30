import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Sprout, Plus, Calendar, TrendingUp, Droplets, Sun, AlertTriangle } from "lucide-react";
import { fetchWeatherData, type WeatherData } from "@/lib/weather";
import MapComponent from "@/components/MapComponent";

const cropTypes = [
  "Corn (Maize)",
  "Wheat",
  "Rice",
  "Soybean",
  "Barley",
  "Oats",
  "Sorghum",
  "Millet",
  "Sunflower",
  "Cotton",
  "Vegetables",
  "Other",
];

const growthStages = [
  "Planted",
  "Germination",
  "Seedling",
  "Vegetative",
  "Flowering",
  "Fruiting",
  "Maturation",
  "Harvested",
];

const mockCrops = [
  {
    id: 1,
    name: "Corn Field A",
    type: "Corn (Maize)",
    area: "5.2",
    plantedDate: "2024-03-15",
    expectedHarvest: "2024-07-20",
    stage: "Flowering",
    health: "Good",
    notes: "Regular watering, pest control applied",
  },
  {
    id: 2,
    name: "Wheat Section B",
    type: "Wheat",
    area: "3.8",
    plantedDate: "2024-02-10",
    expectedHarvest: "2024-06-25",
    stage: "Maturation",
    health: "Excellent",
    notes: "Ready for harvest soon",
  },
  {
    id: 3,
    name: "Vegetable Garden",
    type: "Vegetables",
    area: "1.5",
    plantedDate: "2024-04-01",
    expectedHarvest: "2024-08-15",
    stage: "Vegetative",
    health: "Fair",
    notes: "Needs more irrigation",
  },
];

const mockWeather = {
  temperature: "28°C",
  humidity: "65%",
  rainfall: "12mm",
  forecast: "Partly cloudy with chance of rain",
};

export default function Crops() {
  const [crops, setCrops] = useState(mockCrops);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingCropId, setEditingCropId] = useState<number | null>(null);
  const [weather, setWeather] = useState(mockWeather);
  const [isWeatherLoading, setIsWeatherLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    area: "",
    plantedDate: "",
    expectedHarvest: "",
    stage: "Planted",
    health: "Good",
    notes: "",
  });

  // Fetch weather data using the utility function
  const handleWeatherRefresh = async () => {
    setIsWeatherLoading(true);
    try {
      const newWeatherData = await fetchWeatherData();
      setWeather(newWeatherData);
    } catch (error) {
      console.error('Error fetching weather:', error);
    } finally {
      setIsWeatherLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isEditMode && editingCropId) {
      // Update existing crop
      setCrops(crops.map(crop => 
        crop.id === editingCropId 
          ? { ...crop, ...formData }
          : crop
      ));
    } else {
      // Add new crop
      const newCrop = {
        id: crops.length + 1,
        ...formData,
      };
      setCrops([newCrop, ...crops]);
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: "",
      type: "",
      area: "",
      plantedDate: "",
      expectedHarvest: "",
      stage: "Planted",
      health: "Good",
      notes: "",
    });
    setIsDialogOpen(false);
    setIsEditMode(false);
    setEditingCropId(null);
  };

  const handleEdit = (crop: any) => {
    setFormData({
      name: crop.name,
      type: crop.type,
      area: crop.area,
      plantedDate: crop.plantedDate,
      expectedHarvest: crop.expectedHarvest,
      stage: crop.stage,
      health: crop.health,
      notes: crop.notes,
    });
    setEditingCropId(crop.id);
    setIsEditMode(true);
    setIsDialogOpen(true);
  };

  const handleDelete = (cropId: number) => {
    if (window.confirm('Are you sure you want to delete this crop?')) {
      setCrops(crops.filter(crop => crop.id !== cropId));
    }
  };

  const updateCropStage = (cropId: number, newStage: string) => {
    setCrops(crops.map(crop => 
      crop.id === cropId 
        ? { ...crop, stage: newStage }
        : crop
    ));
  };

  const getHealthBadge = (health: string) => {
    const variants: Record<string, string> = {
      "Excellent": "bg-green-500",
      "Good": "bg-blue-500", 
      "Fair": "bg-yellow-500",
      "Poor": "bg-red-500",
    };
    
    return <Badge className={variants[health] || "bg-gray-500"}>{health}</Badge>;
  };

  const getStageBadge = (stage: string) => {
    const isEarly = ["Planted", "Germination", "Seedling"].includes(stage);
    const isMid = ["Vegetative", "Flowering", "Fruiting"].includes(stage);
    const isLate = ["Maturation", "Harvested"].includes(stage);
    
    if (isEarly) return <Badge variant="secondary">{stage}</Badge>;
    if (isMid) return <Badge variant="default">{stage}</Badge>;
    if (isLate) return <Badge className="bg-green-600">{stage}</Badge>;
    return <Badge variant="outline">{stage}</Badge>;
  };

  const totalArea = crops.reduce((sum, crop) => sum + parseFloat(crop.area), 0);
  const activeCrops = crops.filter(crop => crop.stage !== "Harvested").length;
  const readyToHarvest = crops.filter(crop => crop.stage === "Maturation").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Crop Management</h1>
          <p className="text-muted-foreground">
            Monitor and manage your crops for optimal yield
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Crop
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{isEditMode ? 'Edit Crop' : 'Add New Crop'}</DialogTitle>
              <DialogDescription>
                {isEditMode ? 'Update crop information' : 'Add a new crop to your management system'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Crop Name/Field</Label>
                <Input
                  id="name"
                  placeholder="e.g., Corn Field A"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Crop Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select crop type" />
                  </SelectTrigger>
                  <SelectContent>
                    {cropTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="area">Area (acres)</Label>
                  <Input
                    id="area"
                    type="number"
                    step="0.1"
                    placeholder="e.g., 5.2"
                    value={formData.area}
                    onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stage">Growth Stage</Label>
                  <Select
                    value={formData.stage}
                    onValueChange={(value) => setFormData({ ...formData, stage: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {growthStages.map((stage) => (
                        <SelectItem key={stage} value={stage}>
                          {stage}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="plantedDate">Planted Date</Label>
                  <Input
                    id="plantedDate"
                    type="date"
                    value={formData.plantedDate}
                    onChange={(e) => setFormData({ ...formData, plantedDate: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expectedHarvest">Expected Harvest</Label>
                  <Input
                    id="expectedHarvest"
                    type="date"
                    value={formData.expectedHarvest}
                    onChange={(e) => setFormData({ ...formData, expectedHarvest: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="health">Health Status</Label>
                <Select
                  value={formData.health}
                  onValueChange={(value) => setFormData({ ...formData, health: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Excellent">Excellent</SelectItem>
                    <SelectItem value="Good">Good</SelectItem>
                    <SelectItem value="Fair">Fair</SelectItem>
                    <SelectItem value="Poor">Poor</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Additional notes about the crop"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>

              <Button type="submit" className="w-full">
                {isEditMode ? 'Update Crop' : 'Add Crop'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Area</CardTitle>
            <Sprout className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{totalArea.toFixed(1)} acres</div>
            <p className="text-xs text-muted-foreground">
              Under cultivation
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Crops</CardTitle>
            <TrendingUp className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{activeCrops}</div>
            <p className="text-xs text-muted-foreground">
              Currently growing
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ready to Harvest</CardTitle>
            <Calendar className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{readyToHarvest}</div>
            <p className="text-xs text-muted-foreground">
              Maturation stage
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Weather</CardTitle>
            <Sun className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">{weather.temperature}</div>
            <p className="text-xs text-muted-foreground">
              {weather.humidity} humidity
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Weather Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sun className="h-5 w-5" />
            Weather Conditions
          </CardTitle>
          <CardDescription>Current weather and forecast for farming activities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <Sun className="h-4 w-4 text-orange-500" />
              <div>
                <p className="text-sm font-medium">Temperature</p>
                <p className="text-lg font-bold">{weather.temperature}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Droplets className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Humidity</p>
                <p className="text-lg font-bold">{weather.humidity}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Droplets className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm font-medium">Rainfall</p>
                <p className="text-lg font-bold">{weather.rainfall}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              <div>
                <p className="text-sm font-medium">Forecast</p>
                <p className="text-sm">{weather.forecast}</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleWeatherRefresh}
                  disabled={isWeatherLoading}
                  className="mt-2"
                >
                  {isWeatherLoading ? 'Updating...' : 'Refresh'}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Crops List */}
      <Card>
        <CardHeader>
          <CardTitle>Crop Inventory</CardTitle>
          <CardDescription>
            All crops currently being managed
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {crops.map((crop) => (
              <div key={crop.id} className="flex items-start justify-between p-4 border rounded-lg">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{crop.name}</h3>
                    {getStageBadge(crop.stage)}
                    {getHealthBadge(crop.health)}
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Type:</p>
                      <p className="font-medium">{crop.type}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Area:</p>
                      <p className="font-medium">{crop.area} acres</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Planted:</p>
                      <p className="font-medium">{new Date(crop.plantedDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Expected Harvest:</p>
                      <p className="font-medium">{new Date(crop.expectedHarvest).toLocaleDateString()}</p>
                    </div>
                  </div>
                  {crop.notes && (
                    <div>
                      <p className="text-muted-foreground text-sm">Notes:</p>
                      <p className="text-sm">{crop.notes}</p>
                    </div>
                  )}
                </div>
                
                <div className="flex flex-col gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleEdit(crop)}
                  >
                    Edit
                  </Button>
                  <Select onValueChange={(value) => updateCropStage(crop.id, value)}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Update Stage" />
                    </SelectTrigger>
                    <SelectContent>
                      {growthStages.map((stage) => (
                        <SelectItem key={stage} value={stage}>
                          {stage}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => handleDelete(crop.id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Map Component */}
      <MapComponent height="300px" />
    </div>
  );
}
