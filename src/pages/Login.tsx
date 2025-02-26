import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Heart, Spade, Diamond, Club } from "lucide-react";
import { SocialMediaLinks } from "@/components/layout/SocialMediaLinks";
import { GuestForm } from "@/components/auth/GuestForm";
import { AuthForms } from "@/components/auth/AuthForms";
import { Button } from "@/components/ui/button";

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [guestName, setGuestName] = useState("");
  const [isGuestMode, setIsGuestMode] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    username: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isGuestMode) {
        if (!guestName.trim()) {
          throw new Error("Please enter a guest name");
        }
        localStorage.setItem("guestName", guestName);
        navigate("/game");
        return;
      }

      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              username: formData.username,
            },
          },
        });
        if (error) throw error;
        toast({
          title: "Success!",
          description: "Please check your email to verify your account.",
        });
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });
        if (error) throw error;
        navigate("/");
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      toast({
        title: "Success",
        description: "Password reset link has been sent to your email.",
      });
      setIsForgotPassword(false);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-casino-green relative overflow-hidden">
      {/* Header with Logo and Social Media */}
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center">
        <div 
          className="flex items-center gap-2 cursor-pointer" 
          onClick={() => navigate("/")}
        >
          <Spade className="w-8 h-8 text-casino-gold" />
          <span className="text-2xl font-bold text-white">Khasino</span>
        </div>
        <div className="flex items-center gap-6">
          <Button 
            variant="link" 
            className="text-white hover:text-casino-gold"
            onClick={() => window.open("https://orchid-hemisphere-162.notion.site/Rules-Ver-2-084f1c0258b2469283cf51aba325f23a?pvs=4", "_blank")}
          >
            Rules
          </Button>
          <SocialMediaLinks />
        </div>
      </div>

      {/* Background Suit Symbols with increased spacing */}
      <div className="absolute inset-0 opacity-10">
        <Heart className="absolute top-[15%] left-[15%] w-32 h-32" />
        <Club className="absolute top-[35%] right-[20%] w-32 h-32" />
        <Diamond className="absolute bottom-[25%] left-[20%] w-32 h-32" />
        <Spade className="absolute bottom-[45%] right-[15%] w-32 h-32" />
      </div>

      <div className="bg-[#0B2E13] p-8 rounded-lg shadow-lg w-full max-w-md relative z-10">
        {isForgotPassword ? (
          <>
            <h2 className="text-3xl font-bold text-center mb-6 text-white">
              Forgot Password
            </h2>
            <p className="text-center text-white mb-6">
              Enter your email address and we'll send you a link to reset your password.
            </p>
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <input
                placeholder="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="w-full bg-[#1A4423] border-casino-gold text-white placeholder:text-gray-400 p-2 rounded"
              />
              <Button
                type="submit"
                className="w-full bg-casino-gold hover:bg-yellow-600 text-black font-bold"
                disabled={isLoading}
              >
                {isLoading ? "Sending..." : "Send Reset Link"}
              </Button>
              <div className="text-center">
                <button
                  onClick={() => setIsForgotPassword(false)}
                  className="text-casino-gold hover:text-yellow-600 text-sm"
                >
                  Back to Login
                </button>
              </div>
            </form>
          </>
        ) : isGuestMode ? (
          <>
            <h2 className="text-3xl font-bold text-center mb-6 text-white">
              Play as Guest
            </h2>
            <GuestForm
              guestName={guestName}
              setGuestName={setGuestName}
              onSubmit={handleSubmit}
              isLoading={isLoading}
            />
            <div className="text-center mt-4">
              <button
                onClick={() => setIsGuestMode(false)}
                className="text-casino-gold hover:text-yellow-600 text-sm"
              >
                Back to Login
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="flex justify-center mb-6">
              <Spade className="w-12 h-12 text-casino-gold" />
            </div>
            
            <h2 className="text-3xl font-bold text-center mb-6 text-white">
              {isSignUp ? "Create Account" : "Login to Khasino"}
            </h2>
            
            <AuthForms
              isSignUp={isSignUp}
              formData={formData}
              setFormData={setFormData}
              onSubmit={handleSubmit}
              isLoading={isLoading}
              setIsSignUp={setIsSignUp}
              setIsForgotPassword={setIsForgotPassword}
              setIsGuestMode={setIsGuestMode}
            />
          </>
        )}
      </div>

      <div className="absolute bottom-4 text-white opacity-75">
        © 2024 Khasino. All rights reserved.
      </div>
    </div>
  );
};

export default Login;
