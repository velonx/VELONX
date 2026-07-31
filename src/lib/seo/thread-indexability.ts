import { normalizeStylizedText } from "@/lib/utils";

/**
 * Single source of truth for whether a community thread meets the SEO indexing
 * quality bar. Used by both the sitemap (which URLs to advertise) and the thread
 * page's `robots` metadata (whether to set index:true). Keep these in sync by
 * importing this helper in both places — never re-implement the rule inline.
 *
 * A thread is indexable if:
 *   1. The post is substantial on its own (>= 40 words), OR
 *   2. It has a real reply from a different user and the thread totals >= 35 words, OR
 *   3. It has multiple real replies (>= 2) from different users.
 */
export function getThreadIndexability(
  content: string,
  authorId: string,
  comments: { authorId: string; content: string }[]
): boolean {
  const normalized = normalizeStylizedText(content);
  const postWordCount = normalized.trim().split(/\s+/).filter(Boolean).length;

  const externalReplies = comments.filter((c) => c.authorId !== authorId);
  const externalReplyCount = externalReplies.length;

  const totalExternalCommentsWordCount = externalReplies.reduce((acc, c) => {
    return acc + c.content.trim().split(/\s+/).filter(Boolean).length;
  }, 0);

  const totalWordCount = postWordCount + totalExternalCommentsWordCount;

  return (
    postWordCount >= 40 ||
    (externalReplyCount > 0 && totalWordCount >= 35) ||
    externalReplyCount >= 2
  );
}
