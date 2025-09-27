import React from 'react';

interface SNSLogoProps {
    size?: number;
    className?: string;
}

export function SNSLogo({ size = 24, className = '' }: SNSLogoProps) {
    return (
        <img 
        src="/sns-logo.png" 
        alt="SUI Name Service" 
        width={size} 
        height={size}
        className={`rounded-full ${className}`}
        />
    );
}