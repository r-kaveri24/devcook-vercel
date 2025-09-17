import Link from "next/link";
import Image from "next/image";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ChevronDownIcon, ChevronLeftIcon } from "lucide-react";

import { useTRPC } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface Props {
    projectId: string;
    mobileActions?: React.ReactNode;
}

export const ProjectHeader = ({ projectId, mobileActions }: Props) => {
    const trpc = useTRPC();
    const isMobile = useIsMobile();

    const { data: project } = useSuspenseQuery(trpc.projects.getOne.queryOptions({
        id: projectId,
    }));

    return (
        <header className="p-2 flex justify-between items-center border-b">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="focus-visible:ring-0 hover:bg-transparent hover:opacity-75 transition-opacity pl-2!"
                    >
                        <Image src="/cookdev_logo.png" alt="DevCook" width={18} height={18} />
                        <span className="text-sm font-medium">{project.name}</span>
                        <ChevronDownIcon />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="bottom" align="start">
                    <DropdownMenuItem asChild>
                        <Link href={"/"}>
                            <ChevronLeftIcon />
                            <span>Back to Kitchen</span>
                        </Link>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile actions (UserControl + Upgrade button) */}
            {isMobile && mobileActions && (
                <div className="flex items-center gap-x-2">
                    {mobileActions}
                </div>
            )}
        </header>
    );
}