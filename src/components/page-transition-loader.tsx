"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

interface PageTransitionLoaderProps {
  children: React.ReactNode;
}

export const PageTransitionLoader = ({ children }: PageTransitionLoaderProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleStart = () => setIsLoading(true);
    const handleComplete = () => setIsLoading(false);

    // Listen for navigation events
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a');
      
      if (link && link.href && !link.href.startsWith('mailto:') && !link.href.startsWith('tel:')) {
        const url = new URL(link.href);
        if (url.pathname !== pathname && url.origin === window.location.origin) {
          handleStart();
        }
      }
    };

    document.addEventListener('click', handleClick);

    // Handle browser back/forward buttons
    const handlePopState = () => {
      handleStart();
      setTimeout(handleComplete, 500);
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      document.removeEventListener('click', handleClick);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [pathname]);

  useEffect(() => {
    // Complete loading when pathname changes
    setIsLoading(false);
  }, [pathname]);

  return (
    <>
      {isLoading && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-16 h-16">
            <svg
              viewBox="0 0 80 80"
              className="w-full h-full"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Outer rotating ring */}
              <circle
                cx="40"
                cy="40"
                r="35"
                fill="none"
                stroke="#ec4899"
                strokeWidth="2"
                strokeDasharray="10 5"
                opacity="0.8"
              >
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  values="0 40 40;360 40 40"
                  dur="3s"
                  repeatCount="indefinite"
                />
              </circle>

              {/* Static cooking elements in center */}
              {/* Chef's hat */}
              <ellipse cx="40" cy="45" rx="8" ry="3" fill="#3b82f6" opacity="0.9" />
              <rect x="35" y="35" width="10" height="10" rx="2" fill="#3b82f6" opacity="0.9" />
              <circle cx="37" cy="32" r="2" fill="#3b82f6" opacity="0.7" />
              <circle cx="43" cy="32" r="2" fill="#3b82f6" opacity="0.7" />

              {/* Fork */}
              <line x1="28" y1="35" x2="28" y2="45" stroke="#ec4899" strokeWidth="1.5" opacity="0.9" />
              <line x1="26" y1="35" x2="26" y2="40" stroke="#ec4899" strokeWidth="1" opacity="0.9" />
              <line x1="30" y1="35" x2="30" y2="40" stroke="#ec4899" strokeWidth="1" opacity="0.9" />

              {/* Spoon */}
              <ellipse cx="52" cy="37" rx="2" ry="3" fill="#ec4899" opacity="0.9" />
              <line x1="52" y1="40" x2="52" y2="45" stroke="#ec4899" strokeWidth="1.5" opacity="0.9" />

              {/* Animated steam bubbles */}
              <circle cx="35" cy="25" r="1" fill="#3b82f6" opacity="0.6">
                <animate attributeName="cy" values="25;15;25" dur="2s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.6;0.2;0.6" dur="2s" repeatCount="indefinite" />
              </circle>
              <circle cx="40" cy="20" r="1.5" fill="#ec4899" opacity="0.5">
                <animate attributeName="cy" values="20;10;20" dur="2.5s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.5;0.1;0.5" dur="2.5s" repeatCount="indefinite" />
              </circle>
              <circle cx="45" cy="25" r="1" fill="#3b82f6" opacity="0.6">
                <animate attributeName="cy" values="25;15;25" dur="1.8s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.6;0.2;0.6" dur="1.8s" repeatCount="indefinite" />
              </circle>

              {/* Small orbiting dots */}
              <circle cx="55" cy="40" r="2" fill="#3b82f6" opacity="0.7">
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  values="0 40 40;360 40 40"
                  dur="4s"
                  repeatCount="indefinite"
                />
              </circle>
              <circle cx="25" cy="40" r="2" fill="#ec4899" opacity="0.7">
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  values="0 40 40;360 40 40"
                  dur="4s"
                  repeatCount="indefinite"
                />
              </circle>
              <circle cx="40" cy="25" r="1.5" fill="#3b82f6" opacity="0.6">
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  values="0 40 40;360 40 40"
                  dur="5s"
                  repeatCount="indefinite"
                />
              </circle>
              <circle cx="40" cy="55" r="1.5" fill="#ec4899" opacity="0.6">
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  values="0 40 40;360 40 40"
                  dur="5s"
                  repeatCount="indefinite"
                />
              </circle>
            </svg>
          </div>
        </div>
      )}
      {children}
    </>
  );
};