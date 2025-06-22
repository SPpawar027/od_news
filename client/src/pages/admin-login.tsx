import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, Shield, Clock, Moon, Sun } from "lucide-react";
import { useAdminAuth } from "@/hooks/useAdminAuth";

export default function AdminLogin() {
  const [email, setEmail] = useState("admin@jwt.com");
  const [password, setPassword] = useState("Admin@123");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isDarkMode, setIsDarkMode] = useState(false);

  const { login, isLoginPending, isAuthenticated } = useAdminAuth();

  // Real-time clock
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Dark mode toggle
  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setIsDarkMode(isDark);
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    document.documentElement.classList.toggle('dark', newDarkMode);
    localStorage.setItem('theme', newDarkMode ? 'dark' : 'light');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Email and password are required");
      return;
    }

    login({ email, password }, {
      onSuccess: () => {
        if (rememberMe) {
          localStorage.setItem('admin_remember_me', 'true');
        }
        window.location.href = "/admin";
      },
      onError: (error: any) => {
        setError(error.message || "Login failed");
      }
    });
  };

  if (isAuthenticated) {
    window.location.href = "/admin";
    return null;
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour12: true,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Background Image with Glass Overlay */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1588681664899-f142ff2dc9b1?w=1200&h=800&fit=crop')`
          }}
        />
        
        {/* Glass Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-red-900/80 via-red-800/70 to-red-700/60 backdrop-blur-sm" />
        
        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 text-white w-full">
          {/* Logo and Title */}
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold tracking-tight">Justice Wave</h1>
                <p className="text-red-100 text-xl font-medium">News Admin Panel</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">Comprehensive News Management</h2>
              <ul className="space-y-2 text-red-100">
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-red-300 rounded-full" />
                  <span>AI-Enhanced Content Management System</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-red-300 rounded-full" />
                  <span>Live TV Stream Management</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-red-300 rounded-full" />
                  <span>RSS Feed Integration & Auto-Import</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-red-300 rounded-full" />
                  <span>Video Management with Subtitles</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-red-300 rounded-full" />
                  <span>Role-Based Access Control</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Real-time Clock */}
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
            <div className="flex items-center space-x-3 mb-2">
              <Clock className="w-5 h-5" />
              <span className="font-medium">Current Time</span>
            </div>
            <div className="text-2xl font-mono font-bold">{formatTime(currentTime)}</div>
            <div className="text-red-100 text-sm">{formatDate(currentTime)}</div>
          </div>

          {/* Breaking News Ticker */}
          <div className="bg-red-600/90 backdrop-blur-md rounded-lg p-4 border border-red-500/50">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse" />
              <span className="font-semibold text-sm">BREAKING NEWS</span>
            </div>
            <div className="text-sm overflow-hidden">
              <div className="animate-pulse">
                Supreme Court delivers landmark judgment on digital privacy rights...
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 relative">
        {/* Dark Mode Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleDarkMode}
          className="absolute top-6 right-6 z-10"
        >
          {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </Button>

        <Card className="w-full max-w-md shadow-2xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <CardHeader className="space-y-1 text-center pb-8">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center mb-4 shadow-lg">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-3xl font-bold text-gray-900 dark:text-white">
              Welcome Back
            </CardTitle>
            <p className="text-gray-600 dark:text-gray-300">
              Sign in to your Justice Wave News admin account
            </p>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700 dark:text-gray-300 font-medium">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@jwt.com"
                  className="h-12 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:border-red-500 dark:focus:border-red-400 transition-colors"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700 dark:text-gray-300 font-medium">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="h-12 pr-12 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:border-red-500 dark:focus:border-red-400 transition-colors"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-12 w-12 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="remember-me" 
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked === true)}
                  className="border-gray-300 dark:border-gray-600"
                />
                <Label htmlFor="remember-me" className="text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
                  Remember me for 30 days
                </Label>
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                disabled={isLoginPending}
              >
                {isLoginPending ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Signing In...</span>
                  </div>
                ) : (
                  "Sign In to Admin Panel"
                )}
              </Button>

              <div className="text-center text-sm text-gray-500 dark:text-gray-400">
                <p>Protected by enterprise-grade security</p>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="absolute bottom-6 left-8 right-8 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>© 2025 Justice Wave News | Powered by Replit</p>
        </div>
      </div>
    </div>
  );
}