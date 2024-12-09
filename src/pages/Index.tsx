import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-casino-green">
      <div className="text-center space-y-8">
        <h1 className="text-6xl font-bold text-white mb-4">Welcome to Cassino</h1>
        <p className="text-xl text-casino-gold mb-8">The #1 Free Casino Game</p>
        <div className="space-x-4">
          <Button 
            onClick={() => navigate("/game")} 
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
      <footer className="absolute bottom-4 text-white opacity-75">
        © 2024 Cassino. All rights reserved.
      </footer>
    </div>
  );
};

export default Index;