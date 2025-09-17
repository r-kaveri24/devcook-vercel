"use client"

import Link from "next/link";
import Image from "next/image";

import { SignedIn } from "@clerk/nextjs";
import { UserControl } from "@/components/user-control";
import { useScroll } from "@/hooks/use-scroll";
import { cn } from "@/lib/utils";

export const Navbar = () => {
    const isScrolled = useScroll();
    return (
        <nav className={cn("p-4 bg-transparent fixed top-0 left-0 right-0 z-50 transition-all duration-200 border-b border-transparent",
            isScrolled && "bg-black/5 backdrop-blur-sm "
        )}>
            <div className="container mx-auto flex justify-between items-center">
                <div className="max-w-5xl mx-auto w-full flex justify-between items-center">
                    <Link href="/" className="flex items-center gap-2">
                        <Image src='/cookdev_logo.png' alt="logo" width={24} height={24} />
                        <span className='text-lg font-semibold'>DEVCOOK</span>
                    </Link>
                    <SignedIn>
                        <UserControl showName={true} />
                    </SignedIn>
                </div>
            </div>
        </nav>
    )
}