import { getQueryClient, trpc } from "@/trpc/server";
import { ErrorBoundary } from 'react-error-boundary'
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { ProjectView } from "@/modules/projects/server/ui/views/project-view";
import { Suspense } from "react";

interface Props {
    params: Promise<{
        projectId: string;
    }>
}


const Page = async ({ params }: Props) => {
    const { projectId } = await params;

    const queryClient = getQueryClient();
    void queryClient.prefetchQuery(trpc.messages.getMany.queryOptions({
        projectId,
    }));
    void queryClient.prefetchQuery(trpc.projects.getOne.queryOptions({
        id: projectId,
    }));
    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <ErrorBoundary fallback={<p>Recipe seems to have gone missing from the kitchen!</p>}>
                <Suspense fallback={<p>Setting up your cooking station...</p>}>
                    <ProjectView projectId={projectId} />
                </Suspense>
            </ErrorBoundary>
        </HydrationBoundary>
    )
}
export default Page;