
import React from 'react';
import { Facebook, Youtube, Instagram } from 'lucide-react';

export const SocialMediaLinks = () => {
  return (
    <div className="flex gap-4">
      <a 
        href="htts://www.facebook.com/khasino.za" 
        target="_blank" 
        rel="noopener noreferrer"
        className="text-white hover:text-casino-gold transition-colors cursor-pointer"
      >
        <Facebook className="w-5 h-5" />
      </a>
      <a 
        href="htts://www.youtube.com/@khasinoZA" 
        target="_blank" 
        rel="noopener noreferrer"
        className="text-white hover:text-casino-gold transition-colors cursor-pointer"
      >
        <Youtube className="w-5 h-5" />
      </a>
      <a 
        href="htts://www.instagram.com/khasino.za" 
        target="_blank" 
        rel="noopener noreferrer"
        className="text-white hover:text-casino-gold transition-colors cursor-pointer"
      >
        <Instagram className="w-5 h-5" />
      </a>
    </div>
  );
};
