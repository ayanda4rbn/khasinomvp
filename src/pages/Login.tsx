
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { toast } from "@/components/ui/use-toast";
import { Spade } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { GuestForm } from "@/components/auth/GuestForm";

const Login = () => {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isGuestMode, setIsGuestMode] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [guestName, setGuestName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isGuestMode) {
        if (!guestName.trim()) {
          toast({
            title: "Error",
            description: "Please enter a guest name",
            variant: "destructive",
          });
          return;
        }
        localStorage.setItem("guestName", guestName);
        navigate("/game");
        toast({
          title: "Welcome!",
          description: `Playing as guest: ${guestName}`,
        });
        return;
      }

      if (isForgotPassword) {
        const { error } = await supabase.auth.resetPasswordForEmail(email);
        if (error) throw error;
        toast({
          title: "Password Reset Email Sent",
          description: "Check your email for the password reset link.",
        });
      } else if (isSignUp) {
        if (password !== confirmPassword) {
          toast({
            title: "Error",
            description: "Passwords do not match.",
            variant: "destructive",
          });
          return;
        }
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        toast({
          title: "Sign Up Successful!",
          description: "Please check your email to verify your account.",
        });
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        navigate("/game");
        toast({
          title: "Login Successful!",
          description: "Welcome back!",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setGuestName("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-casino-green relative overflow-hidden">
      <Spade className="absolute top-10 left-10 w-32 h-32 text-casino-gold opacity-20" />

      <Card className="w-full max-w-md bg-[#1A4423] border-casino-gold">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center text-white">
            {isGuestMode
              ? "Play as Guest"
              : isForgotPassword
              ? "Reset Password"
              : isSignUp
              ? "Create Account"
              : "Login"}
          </CardTitle>
          <CardDescription className="text-casino-gold text-center">
            {isGuestMode
              ? "Enter your name to start playing"
              : isForgotPassword
              ? "Enter your email to receive a reset link"
              : isSignUp
              ? "Enter your details to create an account"
              : "Enter your credentials to access the game"}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="grid gap-4">
            {isGuestMode ? (
              <div className="grid gap-2">
                <Label htmlFor="guestName" className="text-white">
                  Name
                </Label>
                <Input
                  id="guestName"
                  type="text"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  required
                  placeholder="Enter your name"
                  className="bg-[#21592C] border-casino-gold text-white placeholder:text-gray-400"
                />
              </div>
            ) : (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="email" className="text-white">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-[#21592C] border-casino-gold text-white placeholder:text-gray-400"
                  />
                </div>
                {!isForgotPassword && (
                  <div className="grid gap-2">
                    <Label htmlFor="password" className="text-white">
                      Password
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="bg-[#21592C] border-casino-gold text-white placeholder:text-gray-400"
                    />
                  </div>
                )}
                {isSignUp && (
                  <div className="grid gap-2">
                    <Label htmlFor="confirmPassword" className="text-white">
                      Confirm Password
                    </Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="bg-[#21592C] border-casino-gold text-white placeholder:text-gray-400"
                    />
                  </div>
                )}
              </>
            )}
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button
              type="submit"
              className="w-full bg-casino-gold hover:bg-yellow-600 text-black font-bold"
              disabled={isLoading}
            >
              {isLoading
                ? "Loading..."
                : isGuestMode
                ? "Start Playing"
                : isForgotPassword
                ? "Send Reset Link"
                : isSignUp
                ? "Sign Up"
                : "Login"}
            </Button>
            <div className="flex flex-col items-center gap-2 text-sm">
              {!isGuestMode && !isForgotPassword && (
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    resetForm();
                  }}
                  className="text-casino-gold hover:text-yellow-600"
                >
                  {isSignUp
                    ? "Already have an account? Login"
                    : "Don't have an account? Sign Up"}
                </button>
              )}
              {!isSignUp && !isForgotPassword && !isGuestMode && (
                <button
                  type="button"
                  onClick={() => {
                    setIsForgotPassword(true);
                    resetForm();
                  }}
                  className="text-casino-gold hover:text-yellow-600"
                >
                  Forgot password?
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  setIsGuestMode(!isGuestMode);
                  setIsForgotPassword(false);
                  setIsSignUp(false);
                  resetForm();
                }}
                className="text-casino-gold hover:text-yellow-600"
              >
                {isGuestMode ? "Back to Login" : "Play as Guest"}
              </button>
              {(isSignUp || isForgotPassword) && (
                <button
                  type="button"
                  onClick={() => {
                    setIsForgotPassword(false);
                    setIsSignUp(false);
                    resetForm();
                  }}
                  className="text-casino-gold hover:text-yellow-600"
                >
                  Back to Login
                </button>
              )}
            </div>
          </CardFooter>
        </form>
      </Card>

      <div className="absolute bottom-4 text-white opacity-75">
        © {new Date().getFullYear()} Khasino. All rights reserved.
      </div>
    </div>
  );
};

export default Login;
