import { RateLimiterPrisma } from 'rate-limiter-flexible';
import { prisma } from './db';
import { auth } from '@clerk/nextjs/server';

const FREE_POINTS = 5;
const PRO_POINTS = 100;
const FREE_DURATION = 1 * 24 * 60 * 60; // 1 day in seconds
const PRO_DURATION = 30 * 24 * 60 * 60; // 30 days (1 month) in seconds
const GENERATION_COST = 2;

export async function getUsageTracker() {
    const { has } = await auth()
    const hasProAccess = has({ plan: "pro" })

    const usageTracker = new RateLimiterPrisma({
        storeClient: prisma,
        tableName: "Usage",
        points: hasProAccess ? PRO_POINTS : FREE_POINTS,
        duration: hasProAccess ? PRO_DURATION : FREE_DURATION,
    });
    return usageTracker;
};

export async function consumeCredites() {
    const { userId } = await auth();

    if (!userId) {
        throw new Error("User not authenticated");
    }
    const usageTracker = await getUsageTracker();
    const result = await usageTracker.consume(userId, GENERATION_COST);
    return result;
};

export async function getUsageStatus() {
    const { userId } = await auth();

    if (!userId) {
        throw new Error('User not authenticated');
    }

    const usageTracker = await getUsageTracker();
    const result = await usageTracker.get(userId);
    return result;
};