import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface AuthFormsProps {
  isSignUp: boolean;
  formData: {
    email: string;
    password: string;
    username: string;
  };
  setFormData: (data: any) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  setIsSignUp: (value: boolean) => void;
  setIsForgotPassword: (value: boolean) => void;
  setIsGuestMode: (value: boolean) => void;
}

export const AuthForms: React.FC<AuthFormsProps> = ({
  isSignUp,
  formData,
  setFormData,
  onSubmit,
  isLoading,
  setIsSignUp,
  setIsForgotPassword,
  setIsGuestMode,
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
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
          type="button"
        >
          Play as Guest
        </button>
        <button
          onClick={() => setIsSignUp(!isSignUp)}
          className="text-casino-gold hover:text-yellow-600 text-sm"
          type="button"
        >
          {isSignUp ? "Already have an account? Login" : "Create Account"}
        </button>
      </div>

      {!isSignUp && (
        <div className="text-center">
          <button
            onClick={() => setIsForgotPassword(true)}
            className="text-casino-gold hover:text-yellow-600 text-sm"
            type="button"
          >
            Forgot password?
          </button>
        </div>
      )}
    </form>
  );
};