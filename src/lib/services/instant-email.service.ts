/**
 * InstantEmailService
 *
 * Sends targeted, real-time emails for INSTANT-frequency notification categories.
 * Designed to be called fire-and-forget from API route handlers after a DB write:
 *
 *   InstantEmailService.dispatch('JOB_POSTED', jobPayload).catch(console.error);
 *
 * Each category defines its own payload type and resolves which users to email.
 */

import { EmailNotificationCategory } from '@/lib/prisma-enums';

import { EmailPreferenceService } from './email-preference.service';
import { EmailService } from './email.service';
import { prisma } from '@/lib/prisma';

// ─────────────────────────────────────────────────────────────────────────────
// Payload shapes per category
// ─────────────────────────────────────────────────────────────────────────────

export interface JobPostedPayload {
  opportunityId: string;
  title: string;
  company: string;
  location: string;
  type: 'JOB' | 'INTERNSHIP';
  applyUrl: string;
  salary?: string;
}

export interface EventPostedPayload {
  eventId: string;
  title: string;
  description: string;
  date: Date;
  location?: string;
  meetingLink?: string;
  type: string;
}

export interface SwagAnnouncedPayload {
  swagId: string;
  name: string;
  description: string;
  imageUrl?: string;
}

export interface PostCommentPayload {
  postId: string;
  postAuthorId: string; // the user who should receive the email
  postExcerpt: string;
  commenterName: string;
  commentExcerpt: string;
}

export type CategoryPayload =
  | { category: 'JOB_POSTED'; payload: JobPostedPayload }
  | { category: 'EVENT_POSTED'; payload: EventPostedPayload }
  | { category: 'SWAG_ANNOUNCED'; payload: SwagAnnouncedPayload }
  | { category: 'POST_COMMENT'; payload: PostCommentPayload };

// ─────────────────────────────────────────────────────────────────────────────
// Service
// ─────────────────────────────────────────────────────────────────────────────

export class InstantEmailService {
  /**
   * Dispatch an instant email for the given category.
   *
   * For personal categories (POST_COMMENT), the relevant user ID is derived
   * from the payload. For broadcast categories (JOB_POSTED, EVENT_POSTED,
   * SWAG_ANNOUNCED) all opted-in users are targeted.
   *
   * Errors are caught per-user so one failed send never aborts the rest.
   */
  static async dispatch(event: CategoryPayload): Promise<void> {
    try {
      switch (event.category) {
        case 'JOB_POSTED':
          await this._dispatchJobPosted(event.payload);
          break;
        case 'EVENT_POSTED':
          await this._dispatchEventPosted(event.payload);
          break;
        case 'SWAG_ANNOUNCED':
          await this._dispatchSwagAnnounced(event.payload);
          break;
        case 'POST_COMMENT':
          await this._dispatchPostComment(event.payload);
          break;
        default:
          console.warn('[InstantEmail] Unknown category received');
      }
    } catch (err) {
      console.error('[InstantEmail] Top-level dispatch error:', err);
    }
  }

  // ─── Private per-category dispatchers ────────────────────────────────────

  private static async _dispatchJobPosted(payload: JobPostedPayload) {
    const recipientIds = await EmailPreferenceService.getInstantRecipients(
      EmailNotificationCategory.JOB_POSTED
    );
    if (!recipientIds.length) return;

    const users = await prisma.user.findMany({
      where: { id: { in: recipientIds } },
      select: { id: true, email: true, name: true },
    });

    await Promise.allSettled(
      users.map((user) =>
        EmailService.sendJobAlert(user, payload).catch((e) =>
          console.error(`[InstantEmail] JOB_POSTED send failed for ${user.id}:`, e)
        )
      )
    );
  }

  private static async _dispatchEventPosted(payload: EventPostedPayload) {
    const recipientIds = await EmailPreferenceService.getInstantRecipients(
      EmailNotificationCategory.EVENT_POSTED
    );
    if (!recipientIds.length) return;

    const users = await prisma.user.findMany({
      where: { id: { in: recipientIds } },
      select: { id: true, email: true, name: true },
    });

    await Promise.allSettled(
      users.map((user) =>
        EmailService.sendEventAnnouncement(user, payload).catch((e) =>
          console.error(`[InstantEmail] EVENT_POSTED send failed for ${user.id}:`, e)
        )
      )
    );
  }

  private static async _dispatchSwagAnnounced(payload: SwagAnnouncedPayload) {
    const recipientIds = await EmailPreferenceService.getInstantRecipients(
      EmailNotificationCategory.SWAG_ANNOUNCED
    );
    if (!recipientIds.length) return;

    // SWAG_ANNOUNCED default is DAILY, so the only users dispatched here are
    // those who explicitly set INSTANT. Swag send reuses the generic event email
    // with adapted copy — a dedicated template can be added later.
    const users = await prisma.user.findMany({
      where: { id: { in: recipientIds } },
      select: { id: true, email: true, name: true },
    });

    await Promise.allSettled(
      users.map((user) =>
        EmailService.sendSwagAnnouncement(user, payload).catch((e) =>
          console.error(`[InstantEmail] SWAG_ANNOUNCED send failed for ${user.id}:`, e)
        )
      )
    );
  }

  private static async _dispatchPostComment(payload: PostCommentPayload) {
    // Personal category — only notify the post author
    const recipientIds = await EmailPreferenceService.getInstantRecipients(
      EmailNotificationCategory.POST_COMMENT,
      [payload.postAuthorId]
    );
    if (!recipientIds.length) return;

    const user = await prisma.user.findUnique({
      where: { id: payload.postAuthorId },
      select: { id: true, email: true, name: true },
    });
    if (!user) return;

    await EmailService.sendPostCommentAlert(user, payload).catch((e) =>
      console.error('[InstantEmail] POST_COMMENT send failed:', e)
    );
  }
}
