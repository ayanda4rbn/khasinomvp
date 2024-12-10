import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface GuestFormProps {
  guestName: string;
  setGuestName: (name: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
}

export const GuestForm: React.FC<GuestFormProps> = ({
  guestName,
  setGuestName,
  onSubmit,
  isLoading
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
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
    </form>
  );
};