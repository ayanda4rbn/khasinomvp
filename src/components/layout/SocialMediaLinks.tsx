
import React from 'react';
import { Facebook, Youtube, Instagram } from 'lucide-react';

export const SocialMediaLinks = () => {
  return (
    <div className="flex gap-4">
      <a 
        href="https://www.facebook.com/khasino.za" 
        target="_blank" 
        rel="noopener noreferrer"
        className="text-white hover:text-casino-gold transition-colors cursor-pointer p-2 hover:bg-white/10 rounded-full"
      >
        <Facebook className="w-5 h-5" />
      </a>
      <a 
        href="https://www.youtube.com/@khasinoZA" 
        target="_blank" 
        rel="noopener noreferrer"
        className="text-white hover:text-casino-gold transition-colors cursor-pointer p-2 hover:bg-white/10 rounded-full"
      >
        <Youtube className="w-5 h-5" />
      </a>
      <a 
        href="https://www.instagram.com/khasino.za" 
        target="_blank" 
        rel="noopener noreferrer"
        className="text-white hover:text-casino-gold transition-colors cursor-pointer p-2 hover:bg-white/10 rounded-full"
      >
        <Instagram className="w-5 h-5" />
      </a>
    </div>
  );
};
