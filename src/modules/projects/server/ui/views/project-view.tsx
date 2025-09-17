"use client";

import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable";
import { MessagesContainer } from "@/modules/projects/server/ui/components/messages-container";
import { Suspense, useState } from "react";
import { Fragment } from "@/generated/prisma";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CodeIcon, CrownIcon, EyeIcon, MessageSquareIcon } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

import { ProjectHeader } from "../components/project-header";
import { FragmentWeb } from "../components/fragment-web";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CodeView } from "@/components/code-view";
import { FileExplorer } from "@/components/file-explorer";
import { UserControl } from "@/components/user-control";
import { useAuth } from "@clerk/nextjs";
import { ErrorBoundary } from "react-error-boundary";

interface Props {
    projectId: string;
};

export const ProjectView = ({ projectId }: Props) => {
    const { has } = useAuth();
    const hasProAccess = has?.({ plan: "pro" });
    const isMobile = useIsMobile();
    const [activeFragment, setActiveFragment] = useState<Fragment | null>(null);
    const [tabState, setTabState] = useState<"preview" | "code">("preview");
    const [mobileView, setMobileView] = useState<"messages" | "content">("messages");

    // Mobile actions for header
    const mobileActions = (
        <>
            {!hasProAccess && (
                <Button asChild variant="tertiary" size="sm">
                    <Link href="/pricing">
                        <CrownIcon className="w-4 h-4 mr-1" /> Upgrade
                    </Link>
                </Button>
            )}
            <UserControl />
        </>
    );

    // Mobile layout
    if (isMobile) {
        return (
            <div className="h-screen flex flex-col">
                {/* Header with user controls */}
                <div className="flex-shrink-0">
                    <ErrorBoundary fallback={<p>Oops! Kitchen equipment malfunction!</p>}>
                        <Suspense fallback={<p>Prepping your recipe...</p>}>
                            <ProjectHeader projectId={projectId} mobileActions={mobileActions} />
                        </Suspense>
                    </ErrorBoundary>

                    {/* Mobile Toggle Buttons */}
                    <div className="flex border-b bg-background">
                        <Button
                            variant={mobileView === "messages" ? "default" : "ghost"}
                            className="flex-1 rounded-none border-r"
                            onClick={() => setMobileView("messages")}
                        >
                            <MessageSquareIcon className="w-4 h-4 mr-2" />
                            Messages
                        </Button>
                        <Button
                            variant={mobileView === "content" ? "default" : "ghost"}
                            className="flex-1 rounded-none"
                            onClick={() => setMobileView("content")}
                        >
                            {tabState === "preview" ? (
                                <><EyeIcon className="w-4 h-4 mr-2" />Demo</>
                            ) : (
                                <><CodeIcon className="w-4 h-4 mr-2" />Code</>
                            )}
                        </Button>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 min-h-0">
                    {mobileView === "messages" ? (
                        <ErrorBoundary fallback={<p>Recipe book seems to be missing pages!</p>}>
                            <Suspense fallback={<p>Gathering ingredients...</p>}>
                                <MessagesContainer
                                    projectId={projectId}
                                    activeFragment={activeFragment}
                                    setActiveFragment={setActiveFragment}
                                />
                            </Suspense>
                        </ErrorBoundary>
                    ) : (
                        <div className="h-full flex flex-col">
                            {/* Tab Controls for Content View - removed UserControl and Upgrade button */}
                            <div className="flex-shrink-0 p-2 border-b">
                                <div className="flex items-center gap-x-2">
                                    <div className="flex border rounded-md">
                                        <Button
                                            variant={tabState === "preview" ? "default" : "ghost"}
                                            size="sm"
                                            className="rounded-r-none"
                                            onClick={() => setTabState("preview")}
                                        >
                                            <EyeIcon className="w-4 h-4 mr-1" />
                                            Demo
                                        </Button>
                                        <Button
                                            variant={tabState === "code" ? "default" : "ghost"}
                                            size="sm"
                                            className="rounded-l-none border-l"
                                            onClick={() => setTabState("code")}
                                        >
                                            <CodeIcon className="w-4 h-4 mr-1" />
                                            Code
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            {/* Tab Content */}
                            <div className="flex-1 min-h-0">
                                {tabState === "preview" ? (
                                    <div className="h-full">
                                        {!!activeFragment && <FragmentWeb data={activeFragment} />}
                                    </div>
                                ) : (
                                    <div className="h-full">
                                        {!!activeFragment?.files && (
                                            <FileExplorer files={activeFragment.files as { [path: string]: string }} />
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // Desktop layout (unchanged)
    return (
        <div className="h-screen ">
            <ResizablePanelGroup direction="horizontal">
                <ResizablePanel
                    defaultSize={35}
                    minSize={20}
                    className="flex flex-col min-h-0"
                >
                    <ErrorBoundary fallback={<p>Oops! Kitchen equipment malfunction!</p>}>
                        <Suspense fallback={<p>Prepping your recipe...</p>}>
                            <ProjectHeader projectId={projectId} />
                        </Suspense>
                    </ErrorBoundary>
                    <ErrorBoundary fallback={<p>Recipe book seems to be missing pages!</p>}>
                        <Suspense fallback={<p>Gathering ingredients...</p>}>
                            <MessagesContainer
                                projectId={projectId}
                                activeFragment={activeFragment}
                                setActiveFragment={setActiveFragment}
                            />
                        </Suspense>
                    </ErrorBoundary>
                </ResizablePanel>
                <ResizableHandle className="hover:bg-primary transition-colors" />
                <ResizablePanel
                    defaultSize={65}
                    minSize={50}
                    className="flex flex-col min-h-0"
                >
                    <Tabs className="h-full gap-y-0 " defaultValue="preview" value={tabState} onValueChange={(value) => setTabState(value as "preview" | "code")}>
                        <div className="w-full flex items-center p-2 border-b gap-x-2">
                            <TabsList className="h-8 p-0 border rounded-md">
                                <TabsTrigger value="preview" className="rounded-md">
                                    <EyeIcon /> <span>Demo</span>
                                </TabsTrigger>
                                <TabsTrigger value="code" className="rounded-md">
                                    <CodeIcon /> <span>Code</span>
                                </TabsTrigger>
                            </TabsList>
                            <div className="ml-auto flex items-center gap-x-2">
                                {!hasProAccess && (
                                    <Button asChild variant="tertiary" size="sm">
                                        <Link href="/pricing">
                                            <CrownIcon /> Upgrade
                                        </Link>
                                    </Button>
                                )}
                                <UserControl />
                            </div>
                        </div>
                        <TabsContent value="preview">
                            {!!activeFragment && <FragmentWeb data={activeFragment} />}
                        </TabsContent>
                        <TabsContent value="code" className="min-h-0">
                            {!!activeFragment?.files && (
                                <FileExplorer files={activeFragment.files as { [path: string]: string }} />
                            )}
                        </TabsContent>
                    </Tabs>
                </ResizablePanel>
            </ResizablePanelGroup>
        </div>
    )
}