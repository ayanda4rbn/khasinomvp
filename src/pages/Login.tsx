import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-casino-green">
      <div className="text-center space-y-8">
        <h2 className="text-4xl font-bold text-white mb-8">Login</h2>
        <p className="text-casino-gold mb-4">
          Login functionality will be implemented with Supabase in the next iteration
        </p>
        <Button 
          onClick={() => navigate("/")}
          className="bg-white hover:bg-gray-100 text-black px-8 py-6 text-lg"
        >
          Back to Home
        </Button>
      </div>
    </div>
  );
};

export default Login;