// Force TypeScript to reload Prisma types
// Run this to help your IDE recognize the new Prisma fields

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Type check - these should all be valid
type UserWithEmailPrefs = {
    emailNotifications: boolean;
    eventReminders: boolean;
    mentorNotifications: boolean;
    projectNotifications: boolean;
    weeklyDigest: boolean;
    unsubscribeToken?: string | null;
};

// This will fail at compile time if the types don't exist
const testTypes = async () => {
    const user = await prisma.user.findFirst({
        select: {
            emailNotifications: true,
            eventReminders: true,
            mentorNotifications: true,
            projectNotifications: true,
            weeklyDigest: true,
            unsubscribeToken: true,
        },
    });

    if (user) {
        console.log('Email preferences:', {
            emailNotifications: user.emailNotifications,
            eventReminders: user.eventReminders,
            mentorNotifications: user.mentorNotifications,
            projectNotifications: user.projectNotifications,
            weeklyDigest: user.weeklyDigest,
            unsubscribeToken: user.unsubscribeToken,
        });
    }
};

export { testTypes };
