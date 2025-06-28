import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import {
  Database,
  Plus,
  Search,
  Download,
  Copy,
  Trash2,
  Phone,
  User,
  LogOut,
  List,
  PlusCircle,
  ChartLine,
  UserPlus,
  Settings,
  Sun,
  Moon,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { insertNumberSchema, type InsertNumber, type Number } from "@shared/schema";
import { authApi } from "@/lib/auth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/components/ThemeProvider";
import { AddUserModal } from "@/components/AddUserModal";
import { DeveloperProfile } from "@/components/DeveloperProfile";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [showDeveloperProfile, setShowDeveloperProfile] = useState(false);

  // Get user info
  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ["/api/auth/me"],
    queryFn: () => authApi.getMe(),
  });

  // Show developer profile popup after successful login
  useEffect(() => {
    const hasShownProfile = sessionStorage.getItem('hasShownDeveloperProfile');
    if (!hasShownProfile && user?.isAuthenticated) {
      const timer = setTimeout(() => {
        setShowDeveloperProfile(true);
        sessionStorage.setItem('hasShownDeveloperProfile', 'true');
      }, 1000); // Show after 1 second delay
      
      return () => clearTimeout(timer);
    }
  }, [user?.isAuthenticated]);

  const form = useForm<InsertNumber>({
    resolver: zodResolver(insertNumberSchema),
    defaultValues: {
      number: "",
      note: "",
    },
  });

  // Get numbers  
  const { data: numbers = [], isLoading } = useQuery<Number[]>({
    queryKey: ["/api/numbers"],
    enabled: user?.isAuthenticated,
  });

  // Add number mutation
  const addNumberMutation = useMutation({
    mutationFn: (data: InsertNumber) => apiRequest("POST", "/api/numbers", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/numbers"] });
      form.reset();
      toast({
        title: "Number Added",
        description: "Number has been saved to the database",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add number",
        variant: "destructive",
      });
    },
  });

  // Delete number mutation
  const deleteNumberMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/numbers/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/numbers"] });
      toast({
        title: "Number Deleted",
        description: "Number has been removed from the database",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete number",
        variant: "destructive",
      });
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      queryClient.clear();
      setLocation("/");
      toast({
        title: "Logged Out",
        description: "You have been safely logged out",
      });
    },
  });

  const onSubmit = (data: InsertNumber) => {
    addNumberMutation.mutate(data);
  };

  const handleCopy = (number: string) => {
    navigator.clipboard.writeText(number);
    toast({
      title: "Copied",
      description: "Number copied to clipboard",
    });
  };

  const handleDelete = (id: number) => {
    if (!user?.role || user.role !== "admin") {
      toast({
        title: "Access Denied",
        description: "Only admin can delete numbers",
        variant: "destructive",
      });
      return;
    }
    
    if (confirm("Are you sure you want to delete this number?")) {
      deleteNumberMutation.mutate(id);
    }
  };

  const handleExport = () => {
    const data = JSON.stringify(numbers, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `numbers-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Export Successful",
      description: "Numbers exported to JSON file",
    });
  };

  // Filter numbers based on search
  const filteredNumbers = numbers.filter((number: Number) =>
    number.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (number.note && number.note.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Show loading while checking authentication
  if (userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user?.isAuthenticated) {
    setLocation("/");
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Developer Profile Modal */}
      <DeveloperProfile 
        isOpen={showDeveloperProfile} 
        onClose={() => setShowDeveloperProfile(false)} 
      />
      
      {/* Header */}
      <header className="bg-card shadow-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Database className="h-6 w-6 text-primary mr-3" />
              <h1 className="text-xl font-semibold text-foreground">Number Database</h1>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-sm text-muted-foreground flex items-center">
                <User className="h-4 w-4 mr-2" />
                {user.username} ({user.role})
              </span>
              
              {/* Theme Toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="w-9 h-9 p-0"
              >
                {theme === "dark" ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </Button>
              
              {/* Developer Profile Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDeveloperProfile(true)}
                className="w-9 h-9 p-0"
              >
                <Users className="h-4 w-4" />
              </Button>
              
              {user.role === "admin" && (
                <AddUserModal>
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/30"
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Kelola User
                  </Button>
                </AddUserModal>
              )}
              
              <Button
                variant="destructive"
                size="sm"
                onClick={() => logoutMutation.mutate()}
                disabled={logoutMutation.isPending}
                className="ml-2"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Add Number Section */}
          <div className="lg:col-span-1">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <PlusCircle className="h-5 w-5 text-primary mr-3" />
                  Add New Number
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="number"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g., +62812345678"
                              {...field}
                              className="h-12"
                            />
                          </FormControl>
                          <p className="text-xs text-muted-foreground">Enter phone number with country code</p>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="note"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Note (Optional)</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Add a note about this number..."
                              rows={3}
                              className="resize-none"
                              {...field}
                              value={field.value ?? ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      className="w-full h-12"
                      disabled={addNumberMutation.isPending}
                    >
                      {addNumberMutation.isPending ? (
                        "Adding..."
                      ) : (
                        <>
                          <Plus className="mr-2 h-4 w-4" />
                          Add Number
                        </>
                      )}
                    </Button>
                  </form>
                </Form>

                {/* Stats Card */}
                <div className="mt-6 bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-primary font-medium">Total Numbers</p>
                      <p className="text-2xl font-bold text-primary">{numbers.length}</p>
                    </div>
                    <ChartLine className="h-8 w-8 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Numbers List Section */}
          <div className="lg:col-span-2">
            <Card className="shadow-lg">
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <CardTitle className="flex items-center">
                    <List className="h-5 w-5 text-primary mr-3" />
                    Stored Numbers
                  </CardTitle>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <div className="relative">
                      <Input
                        placeholder="Search numbers..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 pr-4 py-2 text-sm w-full sm:w-64"
                      />
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    </div>
                    <Button
                      onClick={handleExport}
                      className="bg-green-500 hover:bg-green-600 flex-shrink-0"
                      size="sm"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Export
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="flex items-center space-x-4 p-4">
                        <Skeleton className="w-10 h-10 rounded-full" />
                        <div className="space-y-2 flex-1">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                        <Skeleton className="w-8 h-8" />
                        <Skeleton className="w-8 h-8" />
                      </div>
                    ))}
                  </div>
                ) : filteredNumbers.length === 0 ? (
                  <div className="text-center py-12">
                    <Database className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {searchQuery ? "No numbers found" : "No numbers stored yet"}
                    </h3>
                    <p className="text-gray-500 mb-6">
                      {searchQuery 
                        ? "Try adjusting your search query"
                        : "Add your first phone number to get started"
                      }
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredNumbers.map((number: Number) => (
                      <div
                        key={number.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                            <Phone className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{number.number}</p>
                            <p className="text-sm text-gray-500">
                              Added: {new Date(number.createdAt).toLocaleString()}
                            </p>
                            {number.note && (
                              <p className="text-sm text-gray-600">{number.note}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopy(number.number)}
                            className="text-gray-400 hover:text-primary"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          {user?.role === "admin" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(number.id)}
                              disabled={deleteNumberMutation.isPending}
                              className="text-gray-400 hover:text-red-500"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
