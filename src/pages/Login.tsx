import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Heart, Spade, Diamond, Club, Facebook, Youtube } from "lucide-react";

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
        // Store guest name in localStorage for game display
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
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
          <Spade className="w-8 h-8 text-casino-gold" />
          <span className="text-2xl font-bold text-white">Cassino</span>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="link" className="text-white hover:text-casino-gold">
            Rules
          </Button>
          <a href="#" className="text-white hover:text-casino-gold">
            <Facebook className="w-6 h-6" />
          </a>
          <a href="#" className="text-white hover:text-casino-gold">
            <Youtube className="w-6 h-6" />
          </a>
        </div>
      </div>

      {/* Background Suit Symbols */}
      <div className="absolute inset-0 opacity-10">
        <Heart className="absolute top-[10%] left-[10%] w-32 h-32" />
        <Club className="absolute top-[30%] right-[15%] w-32 h-32" />
        <Diamond className="absolute bottom-[20%] left-[15%] w-32 h-32" />
        <Spade className="absolute bottom-[40%] right-[10%] w-32 h-32" />
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
              <Input
                placeholder="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="w-full bg-[#1A4423] border-casino-gold text-white placeholder:text-gray-400"
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
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                placeholder="Enter your name"
                type="text"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                required
                className="w-full bg-[#1A4423] border-casino-gold text-white placeholder:text-gray-400"
              />
              <Button
                type="submit"
                className="w-full bg-casino-gold hover:bg-yellow-600 text-black font-bold"
                disabled={isLoading}
              >
                Start Playing
              </Button>
              <div className="text-center">
                <button
                  onClick={() => setIsGuestMode(false)}
                  className="text-casino-gold hover:text-yellow-600 text-sm"
                >
                  Back to Login
                </button>
              </div>
            </form>
          </>
        ) : (
          <>
            <div className="flex justify-center mb-6">
              <Spade className="w-12 h-12 text-casino-gold" />
            </div>
            
            <h2 className="text-3xl font-bold text-center mb-6 text-white">
              {isSignUp ? "Create Account" : "Login to Cassino"}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUp && (
                <Input
                  placeholder="Username"
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  required={isSignUp}
                  className="w-full bg-[#1A4423] border-casino-gold text-white placeholder:text-gray-400"
                />
              )}
              <Input
                placeholder="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="w-full bg-[#1A4423] border-casino-gold text-white placeholder:text-gray-400"
              />
              <Input
                placeholder="Password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                className="w-full bg-[#1A4423] border-casino-gold text-white placeholder:text-gray-400"
              />
              <Button
                type="submit"
                className="w-full bg-casino-gold hover:bg-yellow-600 text-black font-bold"
                disabled={isLoading}
              >
                {isLoading ? "Loading..." : isSignUp ? "Create Account" : "Login"}
              </Button>

              <div className="flex justify-between">
                <button
                  onClick={() => setIsGuestMode(true)}
                  className="text-casino-gold hover:text-yellow-600 text-sm"
                >
                  Play as Guest
                </button>
                <button
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-casino-gold hover:text-yellow-600 text-sm"
                >
                  {isSignUp ? "Already have an account? Login" : "Create Account"}
                </button>
              </div>

              {!isSignUp && (
                <div className="text-center">
                  <button
                    onClick={() => setIsForgotPassword(true)}
                    className="text-casino-gold hover:text-yellow-600 text-sm"
                  >
                    Forgot password?
                  </button>
                </div>
              )}
            </form>
          </>
        )}
      </div>

      <div className="absolute bottom-4 text-white opacity-75">
        © 2024 Cassino. All rights reserved.
      </div>
    </div>
  );
};

export default Login;