import { prisma } from "@/lib/db";
import { inngest } from "@/inngest/client";
import { protectedProcedure, createTRPCRouter } from "@/trpc/init";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { consumeCredites } from "@/lib/usage";

export const messageRouter = createTRPCRouter({
    getMany: protectedProcedure
        .input(
            z.object({
                projectId: z.string().min(1, { message: "Project ID is required" })
            }),
        )
        .query(async ({ input, ctx }) => {
            const messages = await prisma.message.findMany({
                where: {
                    projectId: input.projectId,
                    Project: {
                        userId: ctx.auth.userId,
                    },
                },
                include: {
                    fragment: true,
                },
                orderBy: {
                    updatedAt: "asc",
                },
            });
            return messages;
        }),
    create: protectedProcedure
        .input(
            z.object({
                value: z.string().min(1, { message: "Value is required" }).max(10000, { message: "Value is too long" }),
                projectId: z.string().min(1, { message: "Project ID is required" })
            }),
        )
        .mutation(async ({ input, ctx }) => {
            const existingProject = await prisma.project.findUnique({
                where: {
                    id: input.projectId,
                    userId: ctx.auth.userId,
                },
            });
            if (!existingProject) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Project not found",
                });
            }

            try {
                await consumeCredites();
            } catch (error) {
                if (error instanceof Error) {
                    throw new TRPCError({
                        code: "BAD_REQUEST",
                        message: "something bad happened",
                    });
                } else {
                    throw new TRPCError({
                        code: "TOO_MANY_REQUESTS",
                        message: "you have run out of credits",
                    });
                }
            }



            const createdMessage = await prisma.message.create({
                data: {
                    projectId: input.projectId,
                    content: input.value,
                    role: "USER",
                    type: "RESULT",
                },
            });
            await inngest.send({
                name: "code-agent/run",
                data: {
                    value: input.value,
                    projectId: input.projectId,
                }
            });
            return createdMessage;
        }),
});