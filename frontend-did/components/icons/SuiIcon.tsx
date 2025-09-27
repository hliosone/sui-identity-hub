import React from 'react';

interface SuiLogoProps {
    className?: string;
    size?: number;
}

export function SuiLogo({ className = "", size = 24 }: SuiLogoProps) {
    return (
        <svg 
        width={size} 
        height={size} 
        viewBox="0 0 32 32" 
        fill="none" 
        className={className}
        xmlns="http://www.w3.org/2000/svg"
        >
        <defs>
            <linearGradient id="suiGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4da2ff" />
            <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>
        </defs>
        
        {/* SUI Wave Logo - Stylized */}
        <path
            d="M8 6C8 4.89543 8.89543 4 10 4H22C23.1046 4 24 4.89543 24 6V10C24 11.1046 23.1046 12 22 12H18L20 16H22C23.1046 16 24 16.8954 24 18V22C24 23.1046 23.1046 24 22 24H10C8.89543 24 8 23.1046 8 22V18C8 16.8954 8.89543 16 10 16H12L10 12H10C8.89543 12 8 11.1046 8 10V6Z"
            fill="url(#suiGradient)"
        />
        
        {/* Inner wave pattern */}
        <path
            d="M12 8H20V10H16L18 12H20V14H12V12H16L14 10H12V8Z"
            fill="white"
            opacity="0.8"
        />
        
        {/* Bottom wave */}
        <path
            d="M12 18H20V20H16L18 22H12V20H16L14 18Z"
            fill="white"
            opacity="0.6"
        />
        </svg>
    );
    }

    export function SuiIcon({ className = "", size = 16 }: SuiLogoProps) {
    return (
        <svg 
        width={size} 
        height={size} 
        viewBox="0 0 16 16" 
        fill="none" 
        className={className}
        xmlns="http://www.w3.org/2000/svg"
        >
        <defs>
            <linearGradient id="suiIconGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4da2ff" />
            <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>
        </defs>
        
        {/* Simplified SUI wave for small icon */}
        <path
            d="M2 2C2 1.44772 2.44772 1 3 1H13C13.5523 1 14 1.44772 14 2V5C14 5.55228 13.5523 6 13 6H9L11 9H13C13.5523 9 14 9.44772 14 10V13C14 13.5523 13.5523 14 13 14H3C2.44772 14 2 13.5523 2 13V10C2 9.44772 2.44772 9 3 9H5L3 6H3C2.44772 6 2 5.55228 2 5V2Z"
            fill="url(#suiIconGradient)"
        />
        
        <path
            d="M4 3H12V4H8L10 6H12V7H4V6H8L6 4H4V3Z"
            fill="white"
            opacity="0.9"
        />
        
        <path
            d="M4 10H12V11H8L10 13H4V12H8L6 10Z"
            fill="white"
            opacity="0.7"
        />
        </svg>
    );
}