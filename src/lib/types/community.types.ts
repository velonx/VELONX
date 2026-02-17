/**
 * Community Discussion Rooms - Type Definitions
 * 
 * This file contains all TypeScript interfaces and types for the Community Discussion Rooms feature.
 * These types are used across components, services, and API routes.
 */

// ============================================================================
// Core Data Types
// ============================================================================

/**
 * Discussion Room data structure
 */
export interface DiscussionRoomData {
  id: string
  name: string
  description: string
  isPrivate: boolean
  creatorId: string
  imageUrl?: string
  memberCount: number
  lastActivity?: Date
  createdAt: Date
}

/**
 * Community Group data structure
 */
export interface CommunityGroupData {
  id: string
  name: string
  description: string
  isPrivate: boolean
  ownerId: string
  imageUrl?: string
  memberCount: number
  postCount: number
  createdAt: Date
}

/**
 * Chat Message data structure
 */
export interface ChatMessageData {
  id: string
  content: string
  roomId?: string
  groupId?: string
  authorId: string
  authorName: string
  authorImage?: string
  isEdited: boolean
  isDeleted: boolean
  createdAt: Date
  updatedAt: Date
}

/**
 * Post visibility options
 */
export type PostVisibility = 'PUBLIC' | 'FOLLOWERS' | 'GROUP'

/**
 * Reaction types for posts
 */
export type ReactionType = 'LIKE' | 'LOVE' | 'INSIGHTFUL' | 'CELEBRATE'

/**
 * Community Post data structure
 */
export interface CommunityPostData {
  id: string
  content: string
  authorId: string
  authorName: string
  authorImage?: string
  groupId?: string
  visibility: PostVisibility
  imageUrls: string[]
  linkUrls: string[]
  isEdited: boolean
  isPinned: boolean
  reactionCount: number
  commentCount: number
  createdAt: Date
  updatedAt: Date
}

/**
 * Feed item wrapper for posts
 */
export interface FeedItemData {
  type: 'POST' | 'SHARED_POST'
  post: CommunityPostData
  sharedBy?: {
    id: string
    name: string
    image?: string
  }
}

/**
 * Post reaction data structure
 */
export interface PostReactionData {
  id: string
  postId: string
  userId: string
  type: ReactionType
  createdAt: Date
}

/**
 * Post comment data structure
 */
export interface PostCommentData {
  id: string
  postId: string
  authorId: string
  authorName: string
  authorImage?: string
  content: string
  createdAt: Date
  updatedAt: Date
}

/**
 * Follow relationship data structure
 */
export interface FollowData {
  id: string
  followerId: string
  followingId: string
  createdAt: Date
}

/**
 * User mute data structure
 */
export interface UserMuteData {
  id: string
  roomId?: string
  groupId?: string
  userId: string
  mutedBy: string
  reason?: string
  expiresAt: Date
  createdAt: Date
}

/**
 * User block data structure
 */
export interface UserBlockData {
  id: string
  blockerId: string
  blockedId: string
  createdAt: Date
}

/**
 * Moderation action types
 */
export type ModerationType = 
  | 'MESSAGE_DELETE'
  | 'POST_DELETE'
  | 'USER_MUTE'
  | 'USER_KICK'
  | 'CONTENT_FLAG'
  | 'POST_PIN'
  | 'POST_UNPIN'

/**
 * Moderation log data structure
 */
export interface ModerationLogData {
  id: string
  moderatorId: string
  targetId: string
  type: ModerationType
  reason?: string
  metadata?: Record<string, unknown>
  createdAt: Date
}

/**
 * Group join request status
 */
export type RequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

/**
 * Group join request data structure
 */
export interface GroupJoinRequestData {
  id: string
  groupId: string
  userId: string
  userName: string
  userImage?: string
  status: RequestStatus
  createdAt: Date
  updatedAt: Date
}

// ============================================================================
// WebSocket Message Types
// ============================================================================

/**
 * WebSocket message types
 */
export type WSMessageType = 
  | 'CHAT_MESSAGE'
  | 'TYPING'
  | 'USER_JOINED'
  | 'USER_LEFT'
  | 'MESSAGE_EDIT'
  | 'MESSAGE_DELETE'
  | 'POST_CREATED'
  | 'POST_UPDATED'
  | 'POST_DELETED'
  | 'REACTION_ADDED'
  | 'COMMENT_ADDED'

/**
 * Base WebSocket message structure
 */
export interface WSMessage<T = unknown> {
  type: WSMessageType
  payload: T
}

/**
 * Chat message WebSocket payload
 */
export interface ChatMessagePayload {
  message: ChatMessageData
  roomId?: string
  groupId?: string
}

/**
 * Typing indicator WebSocket payload
 */
export interface TypingPayload {
  userId: string
  userName: string
  roomId?: string
  groupId?: string
  isTyping: boolean
}

/**
 * User joined/left WebSocket payload
 */
export interface UserPresencePayload {
  userId: string
  userName: string
  userImage?: string
  roomId?: string
  groupId?: string
}

/**
 * Message edit WebSocket payload
 */
export interface MessageEditPayload {
  messageId: string
  content: string
  roomId?: string
  groupId?: string
  editedAt: Date
}

/**
 * Message delete WebSocket payload
 */
export interface MessageDeletePayload {
  messageId: string
  roomId?: string
  groupId?: string
}

/**
 * Post created WebSocket payload
 */
export interface PostCreatedPayload {
  post: CommunityPostData
  groupId?: string
}

/**
 * Reaction added WebSocket payload
 */
export interface ReactionAddedPayload {
  postId: string
  userId: string
  type: ReactionType
}

/**
 * Comment added WebSocket payload
 */
export interface CommentAddedPayload {
  comment: PostCommentData
  postId: string
}

// ============================================================================
// API Request Types
// ============================================================================

/**
 * Create discussion room request
 */
export interface CreateRoomRequest {
  name: string
  description: string
  isPrivate: boolean
  imageUrl?: string
}

/**
 * Create community group request
 */
export interface CreateGroupRequest {
  name: string
  description: string
  isPrivate: boolean
  imageUrl?: string
}

/**
 * Update group request
 */
export interface UpdateGroupRequest {
  name?: string
  description?: string
  imageUrl?: string
}

/**
 * Create post request
 */
export interface CreatePostRequest {
  content: string
  groupId?: string
  visibility: PostVisibility
  imageUrls?: string[]
  linkUrls?: string[]
}

/**
 * Update post request
 */
export interface UpdatePostRequest {
  content: string
}

/**
 * Send message request
 */
export interface SendMessageRequest {
  content: string
  roomId?: string
  groupId?: string
}

/**
 * Edit message request
 */
export interface EditMessageRequest {
  content: string
}

/**
 * React to post request
 */
export interface ReactToPostRequest {
  type: ReactionType
}

/**
 * Comment on post request
 */
export interface CommentOnPostRequest {
  content: string
}

/**
 * Follow user request
 */
export interface FollowUserRequest {
  userId: string
}

/**
 * Mute user request
 */
export interface MuteUserRequest {
  userId: string
  roomId?: string
  groupId?: string
  duration: number // in seconds
  reason?: string
}

/**
 * Flag content request
 */
export interface FlagContentRequest {
  contentId: string
  contentType: 'POST' | 'MESSAGE' | 'COMMENT'
  reason?: string
}

/**
 * Block user request
 */
export interface BlockUserRequest {
  userId: string
}

/**
 * Kick member request
 */
export interface KickMemberRequest {
  userId: string
  reason?: string
}

/**
 * Assign moderator request
 */
export interface AssignModeratorRequest {
  userId: string
}

// ============================================================================
// API Response Types
// ============================================================================

/**
 * Paginated response wrapper
 */
export interface PaginatedResponse<T> {
  data: T[]
  cursor?: string
  hasMore: boolean
  total?: number
}

/**
 * Feed query parameters
 */
export interface FeedQuery {
  cursor?: string
  limit?: number
  filter?: 'ALL' | 'FOLLOWING' | 'GROUPS'
}

/**
 * Search query parameters
 */
export interface SearchQuery {
  query: string
  type?: 'ALL' | 'ROOMS' | 'GROUPS' | 'POSTS' | 'USERS'
  limit?: number
}

/**
 * Search results
 */
export interface SearchResults {
  rooms: DiscussionRoomData[]
  groups: CommunityGroupData[]
  posts: CommunityPostData[]
  users: UserSearchResult[]
}

/**
 * User search result
 */
export interface UserSearchResult {
  id: string
  name: string
  email: string
  image?: string
  role: string
  isFollowing?: boolean
}

/**
 * Room member data
 */
export interface RoomMemberData {
  id: string
  userId: string
  userName: string
  userImage?: string
  joinedAt: Date
  isOnline?: boolean
  isModerator?: boolean
}

/**
 * Group member data
 */
export interface GroupMemberData {
  id: string
  userId: string
  userName: string
  userImage?: string
  joinedAt: Date
  isModerator?: boolean
}

/**
 * Follower/Following data
 */
export interface FollowUserData {
  id: string
  name: string
  email: string
  image?: string
  role: string
  followedAt: Date
}

/**
 * Online status data
 */
export interface OnlineStatusData {
  userId: string
  isOnline: boolean
  lastSeen?: Date
}

/**
 * Trending post data
 */
export interface TrendingPostData extends CommunityPostData {
  trendingScore: number
  engagementRate: number
}

// ============================================================================
// Error Types
// ============================================================================

/**
 * API error codes
 */
export enum ErrorCode {
  // Authentication Errors
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  
  // Validation Errors
  INVALID_INPUT = 'INVALID_INPUT',
  INVALID_IMAGE_FORMAT = 'INVALID_IMAGE_FORMAT',
  INVALID_URL = 'INVALID_URL',
  CONTENT_TOO_LONG = 'CONTENT_TOO_LONG',
  
  // Resource Errors
  NOT_FOUND = 'NOT_FOUND',
  ALREADY_EXISTS = 'ALREADY_EXISTS',
  ALREADY_MEMBER = 'ALREADY_MEMBER',
  NOT_MEMBER = 'NOT_MEMBER',
  
  // Permission Errors
  NOT_MODERATOR = 'NOT_MODERATOR',
  NOT_OWNER = 'NOT_OWNER',
  CANNOT_SELF_FOLLOW = 'CANNOT_SELF_FOLLOW',
  USER_MUTED = 'USER_MUTED',
  USER_BLOCKED = 'USER_BLOCKED',
  
  // Rate Limiting
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  
  // Server Errors
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  WEBSOCKET_ERROR = 'WEBSOCKET_ERROR',
}

/**
 * API error response
 */
export interface ApiError {
  code: ErrorCode
  message: string
  details?: Record<string, unknown>
}

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Message pagination options
 */
export interface MessagePaginationOptions {
  cursor?: string
  limit?: number
  roomId?: string
  groupId?: string
}

/**
 * Post pagination options
 */
export interface PostPaginationOptions {
  cursor?: string
  limit?: number
  groupId?: string
  authorId?: string
}

/**
 * Notification preference types
 */
export type NotificationPreferenceType = 
  | 'COMMENT'
  | 'REACTION'
  | 'MENTION'
  | 'JOIN_REQUEST_APPROVED'
  | 'MODERATOR_ASSIGNED'
  | 'NEW_FOLLOWER'

/**
 * Notification preferences
 */
export interface NotificationPreferences {
  [key: string]: boolean
  COMMENT: boolean
  REACTION: boolean
  MENTION: boolean
  JOIN_REQUEST_APPROVED: boolean
  MODERATOR_ASSIGNED: boolean
  NEW_FOLLOWER: boolean
}

/**
 * WebSocket connection state
 */
export type ConnectionState = 
  | 'CONNECTING'
  | 'CONNECTED'
  | 'DISCONNECTED'
  | 'RECONNECTING'
  | 'ERROR'

/**
 * WebSocket connection info
 */
export interface ConnectionInfo {
  state: ConnectionState
  userId: string
  roomIds: string[]
  groupIds: string[]
  connectedAt?: Date
  lastPing?: Date
}
