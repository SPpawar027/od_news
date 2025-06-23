import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function AdminForgotPasswordPage() {
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { toast } = useToast();

  const forgotPasswordMutation = useMutation({
    mutationFn: async (email: string) => {
      return apiRequest("/api/admin/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
    },
    onSuccess: () => {
      toast({
        title: "सफलता",
        description: "OTP टेलीग्राम पर भेजा गया है",
      });
      setStep('otp');
    },
    onError: (error: any) => {
      toast({
        title: "त्रुटि",
        description: error.message || "OTP भेजने में विफल",
        variant: "destructive",
      });
    },
  });

  const verifyOtpMutation = useMutation({
    mutationFn: async (data: { email: string; otp: string; newPassword: string }) => {
      return apiRequest("/api/admin/verify-otp", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({
        title: "सफलता",
        description: "पासवर्ड सफलतापूर्वक अपडेट हो गया",
      });
      window.location.href = '/admin/login';
    },
    onError: (error: any) => {
      toast({
        title: "त्रुटि",
        description: error.message || "OTP सत्यापन विफल",
        variant: "destructive",
      });
    },
  });

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({
        title: "त्रुटि",
        description: "कृपया ईमेल दर्ज करें",
        variant: "destructive",
      });
      return;
    }
    forgotPasswordMutation.mutate(email);
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || !newPassword || !confirmPassword) {
      toast({
        title: "त्रुटि",
        description: "सभी फ़ील्ड आवश्यक हैं",
        variant: "destructive",
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({
        title: "त्रुटि",
        description: "पासवर्ड मैच नहीं कर रहे",
        variant: "destructive",
      });
      return;
    }
    verifyOtpMutation.mutate({ email, otp, newPassword });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-900">
            पासवर्ड रीसेट करें
          </CardTitle>
          <p className="text-sm text-gray-600 mt-2">
            {step === 'email' ? 'अपना ईमेल दर्ज करें' : 'OTP और नया पासवर्ड दर्ज करें'}
          </p>
        </CardHeader>
        <CardContent>
          {step === 'email' ? (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email">ईमेल</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@odnews.com"
                  required
                />
              </div>
              <Button 
                type="submit" 
                className="w-full bg-red-600 hover:bg-red-700"
                disabled={forgotPasswordMutation.isPending}
              >
                {forgotPasswordMutation.isPending ? "भेजा जा रहा है..." : "OTP भेजें"}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleOtpSubmit} className="space-y-4">
              <div>
                <Label htmlFor="otp">OTP (टेलीग्राम से)</Label>
                <Input
                  id="otp"
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="123456"
                  maxLength={6}
                  required
                />
              </div>
              <div>
                <Label htmlFor="newPassword">नया पासवर्ड</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="नया पासवर्ड दर्ज करें"
                  required
                />
              </div>
              <div>
                <Label htmlFor="confirmPassword">पासवर्ड कन्फर्म करें</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="पासवर्ड दोबारा दर्ज करें"
                  required
                />
              </div>
              <Button 
                type="submit" 
                className="w-full bg-red-600 hover:bg-red-700"
                disabled={verifyOtpMutation.isPending}
              >
                {verifyOtpMutation.isPending ? "अपडेट हो रहा है..." : "पासवर्ड अपडेट करें"}
              </Button>
              <Button 
                type="button" 
                variant="outline"
                className="w-full"
                onClick={() => setStep('email')}
              >
                वापस जाएं
              </Button>
            </form>
          )}
          
          <div className="mt-6 text-center">
            <Link href="/admin/login">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                लॉगिन पर वापस
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}