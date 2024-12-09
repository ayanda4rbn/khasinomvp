import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Heart, Spade, Diamond, Club } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    username: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-casino-green relative overflow-hidden">
      {/* Background Suit Symbols */}
      <div className="absolute inset-0 opacity-10">
        <Heart className="absolute top-[10%] left-[10%] w-32 h-32" />
        <Club className="absolute top-[30%] right-[15%] w-32 h-32" />
        <Diamond className="absolute bottom-[20%] left-[15%] w-32 h-32" />
        <Spade className="absolute bottom-[40%] right-[10%] w-32 h-32" />
      </div>

      <div className="bg-[#0B2E13] p-8 rounded-lg shadow-lg w-full max-w-md relative z-10">
        <div className="flex justify-center mb-6">
          <Spade className="w-12 h-12 text-casino-gold" />
        </div>
        
        <h2 className="text-3xl font-bold text-center mb-6 text-white">
          {isSignUp ? "Create Account" : "Login to Cassino"}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div>
              <Input
                placeholder="Username"
                type="text"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                required={isSignUp}
                className="w-full bg-[#1A4423] border-casino-gold text-white placeholder:text-gray-400"
              />
            </div>
          )}
          <div>
            <Input
              placeholder="Email"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              required
              className="w-full bg-[#1A4423] border-casino-gold text-white placeholder:text-gray-400"
            />
          </div>
          <div>
            <Input
              placeholder="Password"
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              required
              className="w-full bg-[#1A4423] border-casino-gold text-white placeholder:text-gray-400"
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-casino-gold hover:bg-yellow-600 text-black font-bold"
            disabled={isLoading}
          >
            {isLoading
              ? "Loading..."
              : isSignUp
              ? "Create Account"
              : "Login"}
          </Button>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-casino-gold hover:text-yellow-600 text-sm"
          >
            {isSignUp
              ? "Already have an account? Login"
              : "Don't have an account? Sign up"}
          </button>
        </div>

        <div className="mt-4 text-center">
          <button
            onClick={() => navigate("/")}
            className="text-casino-gold hover:text-yellow-600 text-sm"
          >
            Back to Home
          </button>
        </div>

        {!isSignUp && (
          <div className="mt-2 text-center">
            <button className="text-casino-gold hover:text-yellow-600 text-sm">
              Forgot password?
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;