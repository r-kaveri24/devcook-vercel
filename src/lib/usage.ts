import { RateLimiterPrisma } from 'rate-limiter-flexible';
import { prisma } from './db';
import { auth } from '@clerk/nextjs/server';

const FREE_POINTS = 5;
const BASIC_POINTS = 100;
const STANDARD_POINTS = 200;
const ENTERPRISE_POINTS = 500;
const FREE_DURATION = 1 * 24 * 60 * 60; // 1 day in seconds
const PRO_DURATION = 30 * 24 * 60 * 60; // 30 days (1 month) in seconds
const GENERATION_COST = 1;

export async function getUsageTracker() {
    const { has } = await auth()

    // Check for different plan types
    const hasBasicAccess = has({ plan: "basic" })
    const hasStandardAccess = has({ plan: "standard" })
    const hasEnterpriseAccess = has({ plan: "enterprise" })

    // Determine points based on plan
    let points = FREE_POINTS;
    let duration = FREE_DURATION;

    if (hasEnterpriseAccess) {
        points = ENTERPRISE_POINTS;
        duration = PRO_DURATION;
    } else if (hasStandardAccess) {
        points = STANDARD_POINTS;
        duration = PRO_DURATION;
    } else if (hasBasicAccess) {
        points = BASIC_POINTS;
        duration = PRO_DURATION;
    }

    const usageTracker = new RateLimiterPrisma({
        storeClient: prisma,
        tableName: "Usage",
        points: points,
        duration: duration,
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