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

const Login = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (username === "khasino" && password === "password") {
      localStorage.setItem("isLoggedIn", "true");
      navigate("/game");
      toast({
        title: "Login Successful!",
        description: "You are now logged in.",
      });
    } else {
      toast({
        title: "Login Failed",
        description: "Invalid username or password.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-casino-green relative overflow-hidden">
      {/* Suit Symbol */}
      <Spade className="absolute top-10 left-10 w-32 h-32 text-casino-gold opacity-20" />

      <Card className="w-full max-w-md bg-[#1A4423] border-casino-gold z-10">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center text-white">Login</CardTitle>
          <CardDescription className="text-casino-gold text-center">
            Enter your username and password to access the game.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="username" className="text-white">
              Username
            </Label>
            <Input
              id="username"
              placeholder="khasino"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="bg-[#21592C] border-casino-gold text-white placeholder:text-gray-400"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password" className="text-white">
              Password
            </Label>
            <Input
              id="password"
              placeholder="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-[#21592C] border-casino-gold text-white placeholder:text-gray-400"
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full bg-casino-gold hover:bg-yellow-600 text-black font-bold" onClick={handleSubmit}>
            Login
          </Button>
        </CardFooter>
      </Card>

      <div className="absolute bottom-4 text-white opacity-75">
        © {new Date().getFullYear()} Khasino. All rights reserved.
      </div>
    </div>
  );
};

export default Login;
