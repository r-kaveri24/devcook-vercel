"use client"

import Image from "next/image";
import { dark } from "@clerk/themes"
import { PricingTable } from "@clerk/nextjs";

import { useCurrentTheme } from "@/hooks/use-current-theme";

const Page = () => {
    const currentTheme = useCurrentTheme();
    return (
        <div className="flex flex-col max-w-3xl mx-auto w-full">
            <section className="space-y-6 pt-[16vh] 2xl:pt-48">
                <div className="flex justify-center items-center gap-3">
                    {/* <Image src='/cookdev_logo.png' alt='cookdev logo' width={50} height={50} className="hiddden md:block " />
                    <span className="hidden md:block text-3xl font-semibold">DevCook</span> */}

                    <Image
                        src='/betalogo.png'
                        alt='DevCook logo'
                        width={200}
                        height={60}
                        className="opacity-80 object-contain"
                        priority
                    />
                </div>
                <h1 className="text-xl md:text-3xl font-bold text-center ">Pricing</h1>
                <p className="text-muted-foreground text-sm text-center md:text-base">
                    Choose the plan that fits your needs
                </p>
                <PricingTable
                    appearance={{
                        baseTheme: currentTheme == "dark" ? dark : undefined,
                        elements: {
                            pricingTableCard: "border! shadow-none! rounded-lg!"
                        }
                    }}
                />
            </section>
        </div>
    )
}
export default Page;