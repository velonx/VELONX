# Community Post Voting & Comment System

## Features Implemented

### 1. Post Voting (Upvote/Downvote)
- Users can upvote or downvote posts
- Each user can only vote once per post
- Clicking the same vote again removes it
- Changing vote updates both counters

**API Endpoint:** `POST /api/community/posts/[postId]/vote`
**Request Body:** `{ "value": 1 | -1 }` (1 = upvote, -1 = downvote)
**Response:** `{ "success": true, "data": { "voted": boolean, "value": number } }`

### 2. Comment Voting (Upvote/Downvote)
- Users can upvote or downvote comments
- Each user can only vote once per comment
- Same toggle behavior as post voting

**API Endpoint:** `POST /api/community/comments/[commentId]/vote`
**Request Body:** `{ "value": 1 | -1 }` (1 = upvote, -1 = downvote)
**Response:** `{ "success": true, "data": { "voted": boolean, "value": number } }`

### 3. Comment Creation
- Users can comment on posts
- Supports nested comments (replies) via `parentId`
- Returns author information with comment

**API Endpoint:** `POST /api/community/posts/[postId]/comments`
**Request Body:** `{ "content": string, "parentId"?: string }`
**Response:** `{ "success": true, "data": { comment with author } }`

### 4. Edit Post
- Users can only edit their own posts
- Supports updating content, images, and links
- Sets `isEdited` flag to true

**API Endpoint:** `PATCH /api/community/posts/[postId]`
**Request Body:** `{ "content": string, "imageUrls"?: string[], "linkUrls"?: string[] }`
**Response:** `{ "success": true, "data": { updated post } }`

### 5. Delete Post
- Users can only delete their own posts
- Cascades to delete all votes, comments, and reactions

**API Endpoint:** `DELETE /api/community/posts/[postId]`
**Response:** `{ "success": true }`

## Database Schema Changes

### New Models

#### PostVote
```prisma
model PostVote {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  postId    String   @db.ObjectId
  userId    String   @db.ObjectId
  value     Int      // 1 for upvote, -1 for downvote
  createdAt DateTime @default(now())

  post CommunityPost @relation(fields: [postId], references: [id], onDelete: Cascade)

  @@unique([postId, userId])
  @@index([postId])
  @@index([userId])
  @@map("post_votes")
}
```

#### CommentVote
```prisma
model CommentVote {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  commentId String   @db.ObjectId
  userId    String   @db.ObjectId
  value     Int      // 1 for upvote, -1 for downvote
  createdAt DateTime @default(now())

  comment PostComment @relation(fields: [commentId], references: [id], onDelete: Cascade)

  @@unique([commentId, userId])
  @@index([commentId])
  @@index([userId])
  @@map("comment_votes")
}
```

## Service Layer

**File:** `/src/lib/services/community.service.ts`

### Methods

- `votePost(postId, userId, value)` - Vote on a post
- `voteComment(commentId, userId, value)` - Vote on a comment
- `createComment(postId, userId, content, parentId?)` - Create a comment
- `editPost(postId, userId, content, imageUrls?, linkUrls?)` - Edit a post
- `deletePost(postId, userId)` - Delete a post
- `getUserPostVote(postId, userId)` - Get user's vote on a post
- `getUserCommentVote(commentId, userId)` - Get user's vote on a comment

## Vote Logic

### Toggle Behavior
1. **No existing vote + upvote** → Add upvote, increment upvotes
2. **No existing vote + downvote** → Add downvote, increment downvotes
3. **Existing upvote + upvote** → Remove vote, decrement upvotes
4. **Existing downvote + downvote** → Remove vote, decrement downvotes
5. **Existing upvote + downvote** → Change to downvote, decrement upvotes, increment downvotes
6. **Existing downvote + upvote** → Change to upvote, increment upvotes, decrement downvotes

## Authorization

- **Voting:** Any authenticated user can vote
- **Commenting:** Any authenticated user can comment
- **Editing:** Only post author can edit their own posts
- **Deleting:** Only post author can delete their own posts

## Error Handling

All endpoints return consistent error responses:
```json
{
  "success": false,
  "error": "Error message"
}
```

Status codes:
- `401` - Unauthorized (not logged in)
- `403` - Forbidden (not post owner)
- `404` - Not found (post/comment doesn't exist)
- `400` - Bad request (invalid input)
- `500` - Server error

## Usage Example

### Frontend Implementation

```typescript
// Vote on a post
async function votePost(postId: string, value: 1 | -1) {
  const response = await fetch(`/api/community/posts/${postId}/vote`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ value }),
  });
  return response.json();
}

// Add a comment
async function addComment(postId: string, content: string, parentId?: string) {
  const response = await fetch(`/api/community/posts/${postId}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content, parentId }),
  });
  return response.json();
}

// Edit a post
async function editPost(postId: string, content: string) {
  const response = await fetch(`/api/community/posts/${postId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content }),
  });
  return response.json();
}

// Delete a post
async function deletePost(postId: string) {
  const response = await fetch(`/api/community/posts/${postId}`, {
    method: 'DELETE',
  });
  return response.json();
}
```

## Files Created/Modified

### Created Files:
1. `/src/lib/services/community.service.ts` - Service layer for community operations
2. `/src/app/api/community/posts/[postId]/vote/route.ts` - Post voting endpoint
3. `/src/app/api/community/posts/[postId]/comments/route.ts` - Comment creation endpoint
4. `/src/app/api/community/posts/[postId]/route.ts` - Edit/delete post endpoint
5. `/src/app/api/community/comments/[commentId]/vote/route.ts` - Comment voting endpoint

### Modified Files:
1. `/prisma/schema.prisma` - Added PostVote and CommentVote models

## Next Steps

To complete the implementation, you'll need to:

1. **Create UI Components:**
   - Vote buttons (up/down arrows) with active states
   - Comment form and comment list
   - Edit/delete buttons for post authors
   - Vote count displays

2. **Add Real-time Updates:**
   - WebSocket integration for live vote counts
   - Optimistic UI updates

3. **Add Notifications:**
   - Notify post author when someone comments
   - Notify comment author when someone replies
