import React from 'react';
import { Facebook, Youtube, Twitter, Instagram } from 'lucide-react';

export const SocialMediaLinks = () => {
  return (
    <div className="flex gap-4">
      <a 
        href="https://facebook.com" 
        target="_blank" 
        rel="noopener noreferrer"
        className="text-white hover:text-casino-gold transition-colors cursor-pointer"
      >
        <Facebook className="w-5 h-5" />
      </a>
      <a 
        href="https://youtube.com" 
        target="_blank" 
        rel="noopener noreferrer"
        className="text-white hover:text-casino-gold transition-colors cursor-pointer"
      >
        <Youtube className="w-5 h-5" />
      </a>
      <a 
        href="https://twitter.com" 
        target="_blank" 
        rel="noopener noreferrer"
        className="text-white hover:text-casino-gold transition-colors cursor-pointer"
      >
        <Twitter className="w-5 h-5" />
      </a>
      <a 
        href="https://instagram.com" 
        target="_blank" 
        rel="noopener noreferrer"
        className="text-white hover:text-casino-gold transition-colors cursor-pointer"
      >
        <Instagram className="w-5 h-5" />
      </a>
    </div>
  );
};