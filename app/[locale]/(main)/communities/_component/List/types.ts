import { Id } from "@convex/_generated/dataModel";

export type SortMode = "shuffle" | "recent" | "oldest" | "top" | "bookmarked";

export type Post = {
  _id: Id<"posts">;
  _creationTime: number;
  title: string;
  content?: string;
  slug: string;
  communitySlug?: string;
  communityName: string;
  authorName?: string;
  likesCount: number;
  commentsCount: number;
  userHasLiked: boolean;
  isBookmarked?: boolean;
  author?: { slug: string; imageUrl?: string | null } | null;
};

export type Comment = {
  _id: Id<"postComments">;
  _creationTime: number;
  authorId?: string;
  authorName?: string;
  content: string;
  likes: { userId: string }[];
  likesCount: number;
  userHasLiked?: boolean;
  replies: ({
    _id: Id<"postCommentReplies">;
    _creationTime: number;
    authorId?: string;
    authorName?: string;
    content: string;
    likes: { userId: string }[];
    likesCount: number;
    userHasLiked?: boolean;
  } | null)[];
};

export type PostsResult = {
  posts: Post[];
  hasMore: boolean;
  hasPrevPage: boolean;
  totalCount: number;
};

export const PAGE_SIZE = 10;
