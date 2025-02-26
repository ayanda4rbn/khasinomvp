
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

  const handleRulesClick = () => {
    window.open("https://orchid-hemisphere-162.notion.site/Rules-Ver-2-084f1c0258b2469283cf51aba325f23a?pvs=4", "_blank");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-between bg-[#1A4423] relative overflow-hidden">
      {/* Background Suit Symbols */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <Heart className="absolute top-[10%] left-[10%] w-32 h-32 text-white" />
        <Spade className="absolute bottom-[40%] right-[10%] w-32 h-32 text-white" />
      </div>
      
      {/* Header */}
      <header className="w-full p-4 flex justify-between items-center relative z-20">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
          <Spade className="w-8 h-8 text-[#FFD700]" />
          <span className="text-2xl font-bold text-white">Khasino</span>
        </div>
        <div className="flex items-center gap-6">
          <button 
            onClick={handleRulesClick}
            className="text-white hover:text-[#FFD700] hover:bg-white/10 transition-colors cursor-pointer px-4 py-2 rounded-md relative z-20"
          >
            Rules
          </button>
          <SocialMediaLinks />
        </div>
      </header>

      {/* Main Content */}
      <main className="text-center space-y-8 z-10 flex-1 flex flex-col items-center justify-center">
        <h1 className="text-6xl font-bold text-white mb-4">Welcome to Khasino</h1>
        <p className="text-xl text-[#FFD700] mb-8">The #1 Free Khasino Game</p>
        <div className="space-x-4">
          <Button 
            onClick={() => setGuestDialogOpen(true)} 
            className="bg-[#FFD700] hover:bg-yellow-500 text-black px-8 py-6 text-lg"
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
      </main>

      {/* Guest Name Dialog */}
      <Dialog open={guestDialogOpen} onOpenChange={setGuestDialogOpen}>
        <DialogContent className="bg-[#1A4423] border-[#FFD700]">
          <DialogHeader>
            <DialogTitle className="text-white">Enter Your Name</DialogTitle>
            <DialogDescription className="text-[#FFD700]">
              Please enter your name to continue as a guest
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleGuestSubmit} className="space-y-4">
            <Input
              placeholder="Your name"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              required
              className="bg-[#1A4423] border-[#FFD700] text-white placeholder:text-gray-400"
            />
            <Button 
              type="submit" 
              className="w-full bg-[#FFD700] hover:bg-yellow-600 text-black font-bold"
            >
              Start Game
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <footer className="w-full p-4 text-center">
        <span className="text-white opacity-75">© {new Date().getFullYear()} Khasino. All rights reserved.</span>
      </footer>
    </div>
  );
};

export default Index;
