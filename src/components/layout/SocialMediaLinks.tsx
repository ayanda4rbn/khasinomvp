import React from 'react';
import { Facebook, Youtube, Twitter, Instagram } from 'lucide-react';

export const SocialMediaLinks = () => {
  return (
    <div className="flex gap-6">
      <a 
        href="https://facebook.com" 
        target="_blank" 
        rel="noopener noreferrer"
        className="text-white hover:text-casino-gold transition-colors"
      >
        <Facebook className="w-6 h-6" />
      </a>
      <a 
        href="https://youtube.com" 
        target="_blank" 
        rel="noopener noreferrer"
        className="text-white hover:text-casino-gold transition-colors"
      >
        <Youtube className="w-6 h-6" />
      </a>
      <a 
        href="https://twitter.com" 
        target="_blank" 
        rel="noopener noreferrer"
        className="text-white hover:text-casino-gold transition-colors"
      >
        <Twitter className="w-6 h-6" />
      </a>
      <a 
        href="https://instagram.com" 
        target="_blank" 
        rel="noopener noreferrer"
        className="text-white hover:text-casino-gold transition-colors"
      >
        <Instagram className="w-6 h-6" />
      </a>
    </div>
  );
};