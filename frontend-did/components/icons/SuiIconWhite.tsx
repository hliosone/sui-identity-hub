import React from 'react';

interface SuiLogoIconWhiteProps {
    className?: string;
    size?: number;
}

export function SuiLogoIconWhite({ className = "", size = 24 }: SuiLogoIconWhiteProps) {
    return (
        <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 300 300" 
        width={size} 
        height={size} 
        className={className}
        aria-labelledby="title"
        >
        <title id="title">SUI icon with 3D floating document badge</title>

        <defs>
            {/* Drop shadow filter for the badge */}
            <filter id="badgeShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="rgba(0,0,0,0.35)" />
            </filter>

            {/* Inner highlight gradient for 3D rim */}
            <linearGradient id="badgeGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#59ACFF"/>
            <stop offset="100%" stopColor="#3A82E0"/>
            </linearGradient>
        </defs>

        {/* Blue background */}
        <rect x="0" y="0" width="300" height="300" rx="20" ry="20" fill="#499BFD"/>

        {/* SUI Logo (white) with padding */}
        <g transform="translate(45,8) scale(0.70)">
            <path fill="#ffffff" fillRule="evenodd" clipRule="evenodd"
            d="M240.1,159.9c15.6,19.6,25,44.5,25,71.5s-9.6,52.6-25.7,72.4l-1.4,1.7l-0.4-2.2
            c-0.3-1.8-0.7-3.7-1.1-5.6c-8-35.3-34.2-65.6-77.4-90.2c-29.1-16.5-45.8-36.4-50.2-59
            c-2.8-14.6-0.7-29.3,3.3-41.9c4.1-12.6,10.1-23.1,15.2-29.4l16.8-20.5c2.9-3.6,8.5-3.6,11.4,0L240.1,159.9z
            M266.6,139.4L154.2,2c-2.1-2.6-6.2-2.6-8.3,0L33.4,139.4c-21,26.2-33.4,58.8-33.4,94.3
            c0,82.7,67.2,149.8,150,149.8c82.8,0,150-67.1,150-149.8c0-35.5-12.4-68.1-33.1-93.8z
            M60.3,159.5l10-12.3l0.3,2.3c0.2,1.8,0.5,3.6,0.9,5.4c6.5,34.1,29.8,62.6,68.6,84.6
            c33.8,19.2,53.4,41.3,59.1,65.6c2.4,10.1,2.8,20.1,1.8,28.8l-0.1,0.5l-0.5,0.2
            c-15.2,7.4-32.4,11.6-50.5,11.6c-63.5,0-115-51.4-115-114.8
            C34.9,204.2,44.4,179.1,60.3,159.5z"/>
        </g>

        {/* Floating Document Badge with 3D effect */}
        <g transform="translate(175,175)" filter="url(#badgeShadow)">
            {/* Badge background with gradient for depth */}
            <rect x="0" y="0" width="96" height="96" rx="16" ry="16" fill="url(#badgeGradient)" stroke="#ffffff" strokeWidth="3"/>

            {/* Paper with folded corner */}
            <g transform="translate(28,24)">
            <rect x="0" y="0" width="40" height="48" rx="3" ry="3" fill="#ffffff" />
            <polygon points="40,0 28,0 40,12" fill="#cce2ff"/>
            {/* Text lines */}
            <rect x="6" y="14" width="24" height="3" rx="1.5" fill="#499BFD"/>
            <rect x="6" y="22" width="28" height="3" rx="1.5" fill="#499BFD"/>
            <rect x="6" y="30" width="18" height="3" rx="1.5" fill="#499BFD"/>
            </g>
        </g>
        </svg>
    );
}