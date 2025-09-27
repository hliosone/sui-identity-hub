'use client';

import React, { useState } from 'react';
import { LayoutDashboard, Menu, X, Wallet, Award, FileText, TrendingUp, User } from 'lucide-react';
import { Button } from './ui/button';
import { SuiLogoIconWhite } from './icons/SuiIconWhite';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';

export function Header() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { user, handleLogOut } = useDynamicContext();

    const navItems = [
        { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/manage', label: 'Passport', icon: Wallet },
        { href: '/credentials', label: 'Credentials', icon: Award },
        { href: '/issue', label: 'Issuance', icon: FileText },
        { href: '/demo', label: 'Demo', icon: TrendingUp }
    ];

    return (
        <nav className="bg-white border-b shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
                <SuiLogoIconWhite size={32} className="mr-2" />
                <span className="text-lg md:text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                SUI Identity Hub
                </span>
            </div>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center space-x-3">
                {navItems.map(({ href, label, icon: Icon }) => (
                <Button
                    key={href}
                    variant="ghost"
                    className="flex items-center gap-2"
                    asChild
                >
                    <a href={href}>
                    <Icon className="h-4 w-4" />
                    {label}
                    </a>
                </Button>
                ))}

                {/* Dummy user info (replace with real auth later) */}
                <div className="flex items-center gap-2 ml-4 pl-4 border-l border-slate-200">
                <User className="h-4 w-4" />
                <span className="text-sm hidden xl:inline">{user ? user.username : "Guest"}</span>
                <Button variant="outline" size="sm" className="ml-2" onClick={() => handleLogOut()}>
                    Logout
                </Button>
                </div>
            </div>

            {/* Mobile Menu Toggle */}
            <div className="lg:hidden flex items-center">
                <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileMenuOpen((prev) => !prev)}
                className="p-2"
                aria-label="Toggle menu"
                >
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </Button>
            </div>
            </div>
        </div>

        {/* Mobile Nav */}
        {isMobileMenuOpen && (
            <div className="lg:hidden bg-white border-t shadow-lg">
            <div className="px-4 py-3 space-y-2">
                {navItems.map(({ href, label, icon: Icon }) => (
                <Button
                    key={href}
                    variant="ghost"
                    className="w-full justify-start flex items-center gap-2"
                    asChild
                >
                    <a href={href}>
                    <Icon className="h-4 w-4" />
                    {label}
                    </a>
                </Button>
                ))}

                <div className="pt-3 border-t mt-3 flex items-center gap-2 text-sm text-slate-600">
                <User className="h-4 w-4" />
                { user ? user.username : "Guest" }
                </div>
                <div className="pt-2">
                <Button variant="outline" size="sm" className="w-full" onClick={() => handleLogOut()}>
                    Logout
                </Button>
                </div>
            </div>
            </div>
        )}
        </nav>
    );
}
