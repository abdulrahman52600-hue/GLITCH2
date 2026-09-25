import React from 'react';

export default function NexBridgeLogo({ className = "h-9 w-auto", showText = true }) {
  if (!showText) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36" className={className} fill="none">
        <rect width="36" height="36" rx="9" fill="#B8D8A2" />
        <path d="M10 24C12.5 16 19.5 16 22 24M14 16C16.5 11 21.5 11 24 16" stroke="#142611" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="12" cy="24" r="2" fill="#3a6127"/>
        <circle cx="24" cy="16" r="2" fill="#3a6127"/>
      </svg>
    );
  }

  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 40" className={className} fill="none">
      <rect x="2" y="4" width="32" height="32" rx="8" fill="#B8D8A2" />
      <path d="M10 24C12.5 16 19.5 16 22 24M14 16C16.5 11 21.5 11 24 16" stroke="#142611" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="12" cy="24" r="2" fill="#3a6127"/>
      <circle cx="24" cy="16" r="2" fill="#3a6127"/>
      <text x="42" y="25" fontFamily="'Plus Jakarta Sans', -apple-system, sans-serif" fontSize="18" fontWeight="700" fill="#0F172A" letterSpacing="-0.5">NexBridge</text>
      <text x="42" y="34" fontFamily="'Plus Jakarta Sans', -apple-system, sans-serif" fontSize="8.5" fontWeight="700" fill="#3a6127" letterSpacing="0.8">STUDENT × INDUSTRY</text>
    </svg>
  );
}
