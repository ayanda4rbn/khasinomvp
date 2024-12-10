import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Heart, Spade } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { SocialMediaLinks } from "@/components/layout/SocialMediaLinks";

const Index = () => {
  const navigate = useNavigate();
  const [guestDialogOpen, setGuestDialogOpen] = useState(false);
  const [guestName, setGuestName] = useState("");

  const handleGuestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (guestName.trim()) {
      localStorage.setItem("guestName", guestName);
      navigate("/game");
      toast({
        title: "Welcome!",
        description: `Playing as guest: ${guestName}`,
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-between bg-casino-green relative overflow-hidden">
      {/* Background Suit Symbols */}
      <div className="absolute inset-0 opacity-10">
        <Heart className="absolute top-[10%] left-[10%] w-32 h-32" />
        <Spade className="absolute bottom-[40%] right-[10%] w-32 h-32" />
      </div>
      
      {/* Header */}
      <header className="w-full p-4 flex justify-between items-center">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
          <Spade className="w-8 h-8 text-casino-gold" />
          <span className="text-2xl font-bold text-white">Cassino</span>
        </div>
        <div className="flex items-center gap-6">
          <Button 
            variant="link" 
            className="text-white hover:text-casino-gold"
          >
            Rules
          </Button>
          <SocialMediaLinks />
        </div>
      </header>

      {/* Main Content */}
      <div className="text-center space-y-8 z-10">
        <h1 className="text-6xl font-bold text-white mb-4">Welcome to Cassino</h1>
        <p className="text-xl text-casino-gold mb-8">The #1 Free Casino Game</p>
        <div className="space-x-4">
          <Button 
            onClick={() => setGuestDialogOpen(true)} 
            className="bg-casino-gold hover:bg-yellow-500 text-black px-8 py-6 text-lg"
          >
            Play as Guest
          </Button>
          <Button 
            onClick={() => navigate("/login")} 
            className="bg-white hover:bg-gray-100 text-black px-8 py-6 text-lg"
          >
            Login
          </Button>
        </div>
      </div>

      {/* Guest Name Dialog */}
      <Dialog open={guestDialogOpen} onOpenChange={setGuestDialogOpen}>
        <DialogContent className="bg-casino-green border-casino-gold">
          <DialogHeader>
            <DialogTitle className="text-white">Enter Your Name</DialogTitle>
            <DialogDescription className="text-casino-gold">
              Please enter your name to continue as a guest
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleGuestSubmit} className="space-y-4">
            <Input
              placeholder="Your name"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              required
              className="bg-[#1A4423] border-casino-gold text-white placeholder:text-gray-400"
            />
            <Button 
              type="submit" 
              className="w-full bg-casino-gold hover:bg-yellow-600 text-black font-bold"
            >
              Start Game
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <footer className="w-full p-4 text-center">
        <span className="text-white opacity-75">© 2024 Cassino. All rights reserved.</span>
      </footer>
    </div>
  );
};

export default Index;