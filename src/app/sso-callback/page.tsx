'use client';

import { AuthenticateWithRedirectCallback } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import Image from 'next/image';

export default function SSOCallback() {
    const [progress, setProgress] = useState(0);
    const [isComplete, setIsComplete] = useState(false);
    const [statusMessage, setStatusMessage] = useState('Authenticating...');

    useEffect(() => {
        // Smooth progress animation
        const progressInterval = setInterval(() => {
            setProgress(prev => {
                if (prev < 85) {
                    // Fast initial progress
                    return prev + Math.random() * 8 + 2;
                } else if (prev < 95) {
                    // Slower progress near the end
                    return prev + Math.random() * 2 + 0.5;
                }
                return prev;
            });
        }, 150);

        // Status message updates
        const messageTimeout1 = setTimeout(() => {
            setStatusMessage('Verifying credentials...');
        }, 2000);

        const messageTimeout2 = setTimeout(() => {
            setStatusMessage('Setting up your workspace...');
        }, 4000);

        // Complete the process after authentication
        const completeTimeout = setTimeout(() => {
            setProgress(100);
            setIsComplete(true);
            setStatusMessage('Welcome! Redirecting...');
            clearInterval(progressInterval);
        }, 6000);

        return () => {
            clearInterval(progressInterval);
            clearTimeout(messageTimeout1);
            clearTimeout(messageTimeout2);
            clearTimeout(completeTimeout);
        };
    }, []);

    return (
        <div className="min-h-screen bg-black relative overflow-hidden flex items-center justify-center">
            {/* Background Video */}
            <video
                autoPlay
                muted
                loop
                className="absolute inset-0 w-full h-full object-cover opacity-30"
            >
                <source src="/video/9694443-hd_1920_1080_25fps.mp4" type="video/mp4" />
            </video>

            {/* Overlay */}
            <div className="absolute inset-0 bg-black/60" />

            {/* Loading Content */}
            <div className="relative z-10 text-center space-y-8 px-4">
                {/* Logo */}
                <div className="flex justify-center mb-8">
                    <div className="relative w-20 h-20 animate-pulse">
                        <Image
                            src="/cookdev_logo.png"
                            alt="Devcook Logo"
                            fill
                            className="object-contain filter brightness-110"
                        />
                    </div>
                </div>

                {/* Progress Circle */}
                <div className="relative w-32 h-32 mx-auto">
                    <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
                        {/* Background Circle */}
                        <circle
                            cx="60"
                            cy="60"
                            r="50"
                            stroke="rgba(255,255,255,0.1)"
                            strokeWidth="8"
                            fill="none"
                        />
                        {/* Progress Circle */}
                        <circle
                            cx="60"
                            cy="60"
                            r="50"
                            stroke="url(#gradient)"
                            strokeWidth="8"
                            fill="none"
                            strokeLinecap="round"
                            strokeDasharray={`${2 * Math.PI * 50}`}
                            strokeDashoffset={`${2 * Math.PI * 50 * (1 - progress / 100)}`}
                            className="transition-all duration-300 ease-out"
                        />
                        {/* Gradient Definition */}
                        <defs>
                            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#3b82f6" />
                                <stop offset="50%" stopColor="#8b5cf6" />
                                <stop offset="100%" stopColor="#06b6d4" />
                            </linearGradient>
                        </defs>
                    </svg>

                    {/* Progress Percentage */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-2xl font-bold text-white transition-all duration-300">
                            {Math.round(progress)}%
                        </span>
                    </div>
                </div>

                {/* Status Message */}
                <div className="space-y-4">
                    <h2 className="text-2xl font-semibold text-white animate-fade-in">
                        {statusMessage}
                    </h2>

                    {/* Animated Dots */}
                    <div className="flex justify-center space-x-1">
                        {[0, 1, 2].map((i) => (
                            <div
                                key={i}
                                className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                                style={{
                                    animationDelay: `${i * 0.2}s`,
                                    animationDuration: '1s'
                                }}
                            />
                        ))}
                    </div>
                </div>

            </div>

            {/* Hidden Clerk Component */}
            <div className="hidden">
                <AuthenticateWithRedirectCallback />
            </div>

            <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes scale-in {
          from { transform: scale(0); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
        
        .animate-scale-in {
          animation: scale-in 0.5s ease-out;
        }
      `}</style>
        </div>
    );
}