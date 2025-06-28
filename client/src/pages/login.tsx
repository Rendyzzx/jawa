import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Database, Eye, EyeOff, Lock, User, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { loginSchema, type LoginRequest } from "@shared/schema";
import { authApi } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showPassword, setShowPassword] = useState(false);

  // Check if user is already authenticated
  const { data: auth, isLoading: authLoading } = useQuery({
    queryKey: ["/api/auth/me"],
    queryFn: () => authApi.getMe(),
    retry: false,
    refetchOnWindowFocus: false,
  });

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (!authLoading && auth?.isAuthenticated) {
      setLocation("/dashboard");
    }
  }, [auth?.isAuthenticated, authLoading, setLocation]);

  const form = useForm<LoginRequest>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const loginMutation = useMutation({
    mutationFn: (data: LoginRequest) => authApi.login(data.username, data.password),
    onSuccess: () => {
      // Invalidate auth cache to refresh user data
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      toast({
        title: "Login Successful", 
        description: "Welcome to the database management system",
      });
      // Navigate to dashboard
      setTimeout(() => {
        setLocation("/dashboard");
      }, 100);
    },
    onError: (error: any) => {
      toast({
        title: "Login Failed",
        description: error.message || "Invalid username or password",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: LoginRequest) => {
    loginMutation.mutate(data);
  };

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Don't render login form if already authenticated (will redirect)
  if (auth?.isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background animate-in fade-in-0 duration-500">
      <div className="max-w-md w-full animate-in slide-in-from-bottom duration-700 delay-200">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-full mb-4 animate-in zoom-in-50 duration-500 delay-400 hover:scale-110 transition-transform">
            <Database className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2 animate-in slide-in-from-top duration-500 delay-600">Database Management</h1>
          <p className="text-muted-foreground animate-in fade-in-50 duration-500 delay-700">Secure access to number database system</p>
        </div>

        {/* Login Form */}
        <Card className="shadow-lg animate-in slide-in-from-bottom duration-500 delay-800 hover:shadow-xl transition-all">
          <CardContent className="p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem className="animate-in slide-in-from-left duration-500 delay-900">
                      <FormLabel className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Username
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your username"
                          {...field}
                          className="h-12 transition-all duration-200 focus:scale-[1.02] focus:border-primary"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem className="animate-in slide-in-from-right duration-500 delay-1000">
                      <FormLabel className="flex items-center gap-2">
                        <Lock className="h-4 w-4" />
                        Password
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter your password"
                            {...field}
                            className="h-12 pr-12 transition-all duration-200 focus:scale-[1.02] focus:border-primary"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent transition-all duration-200 hover:scale-110"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <Eye className="h-4 w-4 text-muted-foreground" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full h-12 animate-in slide-in-from-bottom duration-500 delay-1100 transition-all duration-200 hover:scale-105 active:scale-95"
                  disabled={loginMutation.isPending}
                >
                  {loginMutation.isPending ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Signing in...
                    </div>
                  ) : (
                    <>
                      <User className="mr-2 h-4 w-4" />
                      Sign In
                    </>
                  )}
                </Button>
              </form>
            </Form>

            {/* Security Notice */}
            <div className="mt-6 p-4 bg-muted/50 rounded-lg animate-in fade-in-50 duration-500 delay-1200">
              <div className="flex items-start">
                <Shield className="h-5 w-5 text-primary mt-0.5 mr-3" />
                <div className="text-sm text-muted-foreground">
                  <p className="font-medium mb-1 text-foreground">Security Notice</p>
                  <p>All data is stored securely outside the public directory. Session timeout occurs after 30 minutes of inactivity.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
