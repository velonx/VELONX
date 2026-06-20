import { prisma } from '@/lib/prisma';
import {
  EmailNotificationCategory,
  EmailNotificationFrequency,
} from '@/lib/prisma-enums';

// ─────────────────────────────────────────────────────────────────────────────
// Default frequency per category (used when no DB row exists for a user)
// ─────────────────────────────────────────────────────────────────────────────
export const CATEGORY_DEFAULTS: Record<
  EmailNotificationCategory,
  EmailNotificationFrequency
> = {
  JOB_POSTED: EmailNotificationFrequency.INSTANT,
  EVENT_POSTED: EmailNotificationFrequency.DAILY,
  SWAG_ANNOUNCED: EmailNotificationFrequency.DAILY,
  POST_COMMENT: EmailNotificationFrequency.INSTANT,
  PROJECT_UPDATED: EmailNotificationFrequency.DAILY,
  RESOURCE_ADDED: EmailNotificationFrequency.WEEKLY,
  BLOG_POST_PUBLISHED: EmailNotificationFrequency.WEEKLY,
};

// Human-readable labels for the settings UI
export const CATEGORY_LABELS: Record<EmailNotificationCategory, string> = {
  JOB_POSTED: 'New Job Posted',
  EVENT_POSTED: 'New Event Published',
  SWAG_ANNOUNCED: 'Swag Drop Announced',
  POST_COMMENT: 'Comment on Your Post',
  PROJECT_UPDATED: 'Project Updated',
  RESOURCE_ADDED: 'New Resource Added',
  BLOG_POST_PUBLISHED: 'New Blog Post Published',
};

export const CATEGORY_DESCRIPTIONS: Record<EmailNotificationCategory, string> = {
  JOB_POSTED:
    'Get notified when a new job or internship opportunity is posted.',
  EVENT_POSTED: 'Get notified when a new event is published on VELONX.',
  SWAG_ANNOUNCED: 'Get notified about new swag drops and merchandise.',
  POST_COMMENT:
    "Get notified immediately when someone comments on your post — it's personal and time-sensitive.",
  PROJECT_UPDATED:
    'Get notified when projects you belong to are updated or have new members.',
  RESOURCE_ADDED:
    'Get notified when new learning resources are added to the library.',
  BLOG_POST_PUBLISHED:
    'Get notified when new blog posts are published by the VELONX team.',
};

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface PreferenceRow {
  category: EmailNotificationCategory;
  frequency: EmailNotificationFrequency;
  label: string;
  description: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Service
// ─────────────────────────────────────────────────────────────────────────────

export class EmailPreferenceService {
  /**
   * Get the effective frequency for a single user+category.
   * Falls back to the category default when no row exists.
   */
  static async getFrequency(
    userId: string,
    category: EmailNotificationCategory
  ): Promise<EmailNotificationFrequency> {
    const row = await prisma.emailNotificationPreference.findUnique({
      where: { userId_category: { userId, category } },
      select: { frequency: true },
    });
    return row?.frequency ?? CATEGORY_DEFAULTS[category];
  }

  /**
   * Upsert the frequency for a single user+category.
   */
  static async setFrequency(
    userId: string,
    category: EmailNotificationCategory,
    frequency: EmailNotificationFrequency
  ): Promise<void> {
    await prisma.emailNotificationPreference.upsert({
      where: { userId_category: { userId, category } },
      create: { userId, category, frequency },
      update: { frequency },
    });
  }

  /**
   * Return all 7 categories with their current frequency for the authenticated user.
   * Fills in defaults for any missing rows.
   */
  static async getAllPreferences(userId: string): Promise<PreferenceRow[]> {
    const rows = await prisma.emailNotificationPreference.findMany({
      where: { userId },
    });

    const rowMap = new Map<EmailNotificationCategory, EmailNotificationFrequency>(
        rows.map((r: { category: EmailNotificationCategory; frequency: EmailNotificationFrequency }) => [r.category, r.frequency])
    );


    return (Object.keys(CATEGORY_DEFAULTS) as EmailNotificationCategory[]).map(
      (category) => ({
        category,
        frequency: rowMap.get(category) ?? CATEGORY_DEFAULTS[category],
        label: CATEGORY_LABELS[category],
        description: CATEGORY_DESCRIPTIONS[category],
      })
    );
  }

  /**
   * Return IDs of all active users who have INSTANT set for the given category.
   * Users with emailNotifications=false are excluded (global kill-switch).
   * For personal categories (e.g. POST_COMMENT) pass a targetUserIds override
   * instead of broadcasting to everyone.
   */
  static async getInstantRecipients(
    category: EmailNotificationCategory,
    targetUserIds?: string[]
  ): Promise<string[]> {
    // Fetch users whose explicit preference is INSTANT (or who have no row and the default is INSTANT)
    const defaultIsInstant =
      CATEGORY_DEFAULTS[category] === EmailNotificationFrequency.INSTANT;

    if (targetUserIds && targetUserIds.length > 0) {
      // Personal category — only check the specified users
      return this._filterUsersByPreference(
        targetUserIds,
        category,
        EmailNotificationFrequency.INSTANT,
        defaultIsInstant
      );
    }

    // Broadcast category — start from all active users
    const allUsers = await prisma.user.findMany({
      where: { emailNotifications: true },
      select: { id: true },
    });
    const allIds = allUsers.map((u) => u.id);

    return this._filterUsersByPreference(
      allIds,
      category,
      EmailNotificationFrequency.INSTANT,
      defaultIsInstant
    );
  }

  /**
   * Return all users who have at least one category matching the given digest frequency.
   * Users with emailNotifications=false are excluded.
   */
  static async getDigestRecipients(
    frequency: 'DAILY' | 'WEEKLY'
  ): Promise<string[]> {
    const freq =
      frequency === 'DAILY'
        ? EmailNotificationFrequency.DAILY
        : EmailNotificationFrequency.WEEKLY;

    // Users with an explicit preference for this frequency
    const explicitRows = await prisma.emailNotificationPreference.findMany({
      where: { frequency: freq },
      select: { userId: true },
      distinct: ['userId'],
    });
    const explicitIds = new Set(explicitRows.map((r) => r.userId));

    // Users who haven't set a preference but the default matches
    const defaultCategories = (
      Object.entries(CATEGORY_DEFAULTS) as [
        EmailNotificationCategory,
        EmailNotificationFrequency
      ][]
    )
      .filter(([, f]) => f === freq)
      .map(([cat]) => cat);

    if (defaultCategories.length > 0) {
      // These users qualify if they have NO explicit row for at least one default-matching category
      // Simplification: include all users with emailNotifications=true and let the digest builder
      // decide if they have any content. They'll be skipped if all sections are empty.
      const allUsers = await prisma.user.findMany({
        where: { emailNotifications: true },
        select: { id: true },
      });
      allUsers.forEach((u) => explicitIds.add(u.id));
    }

    // Exclude globally unsubscribed users
    const opted = await prisma.user.findMany({
      where: { id: { in: [...explicitIds] }, emailNotifications: true },
      select: { id: true },
    });
    return opted.map((u) => u.id);
  }

  // ─── Private helpers ───────────────────────────────────────────────────────

  private static async _filterUsersByPreference(
    userIds: string[],
    category: EmailNotificationCategory,
    wantFrequency: EmailNotificationFrequency,
    defaultMatchesWant: boolean
  ): Promise<string[]> {
    if (userIds.length === 0) return [];

    // Fetch explicit preferences for these users and this category
    const rows = await prisma.emailNotificationPreference.findMany({
      where: { userId: { in: userIds }, category },
      select: { userId: true, frequency: true },
    });

    const prefMap = new Map(rows.map((r) => [r.userId, r.frequency]));

    return userIds.filter((id) => {
      const freq = prefMap.get(id);
      if (freq !== undefined) return freq === wantFrequency;
      // No explicit row — use default
      return defaultMatchesWant;
    });
  }
}
