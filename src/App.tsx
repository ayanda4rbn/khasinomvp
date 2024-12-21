import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "sonner";
import Game from "@/pages/Game";
import Index from "@/pages/Index";
import Login from "@/pages/Login";
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/game" element={<Game />} />
        <Route path="/login" element={<Login />} />
      </Routes>
      <Toaster />
      <SonnerToaster position="top-center" />
    </Router>
  );
}

export default App;