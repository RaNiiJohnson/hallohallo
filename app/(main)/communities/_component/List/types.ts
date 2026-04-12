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

export type PostsResult = {
  posts: Post[];
  hasMore: boolean;
  hasPrevPage: boolean;
  totalCount: number;
};

export const PAGE_SIZE = 10;
