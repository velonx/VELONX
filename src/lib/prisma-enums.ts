/**
 * Email notification enum shims.
 *
 * Prisma generates these enums into `.prisma/client` which @prisma/client
 * re-exports. When the IDE's TypeScript server can't resolve that symlink, the
 * enums appear missing. We re-declare them here as const objects with matching
 * values so they are always visible — identical to the generated types.
 *
 * ⚠ Keep in sync with prisma/schema.prisma if categories/frequencies change.
 */

export const EmailNotificationCategory = {
    JOB_POSTED: 'JOB_POSTED',
    EVENT_POSTED: 'EVENT_POSTED',
    SWAG_ANNOUNCED: 'SWAG_ANNOUNCED',
    POST_COMMENT: 'POST_COMMENT',
    PROJECT_UPDATED: 'PROJECT_UPDATED',
    RESOURCE_ADDED: 'RESOURCE_ADDED',
    BLOG_POST_PUBLISHED: 'BLOG_POST_PUBLISHED',
} as const;
export type EmailNotificationCategory =
    (typeof EmailNotificationCategory)[keyof typeof EmailNotificationCategory];

export const EmailNotificationFrequency = {
    INSTANT: 'INSTANT',
    DAILY: 'DAILY',
    WEEKLY: 'WEEKLY',
    OFF: 'OFF',
} as const;
export type EmailNotificationFrequency =
    (typeof EmailNotificationFrequency)[keyof typeof EmailNotificationFrequency];
