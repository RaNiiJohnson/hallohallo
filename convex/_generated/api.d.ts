/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as aggregates from "../aggregates.js";
import type * as auth_auth from "../auth/auth.js";
import type * as auth_users from "../auth/users.js";
import type * as bookmarks_mutations from "../bookmarks/mutations.js";
import type * as bookmarks_queries from "../bookmarks/queries.js";
import type * as cascadeDeletes from "../cascadeDeletes.js";
import type * as cascadeHelpers from "../cascadeHelpers.js";
import type * as chat_mutations from "../chat/mutations.js";
import type * as chat_queries from "../chat/queries.js";
import type * as communities_actions from "../communities/actions.js";
import type * as communities_mutations from "../communities/mutations.js";
import type * as communities_queries from "../communities/queries.js";
import type * as email from "../email.js";
import type * as http from "../http.js";
import type * as integrations_cloudinary from "../integrations/cloudinary.js";
import type * as integrations_r2 from "../integrations/r2.js";
import type * as integrations_stripe from "../integrations/stripe.js";
import type * as jobs_mutations from "../jobs/mutations.js";
import type * as jobs_queries from "../jobs/queries.js";
import type * as listings_mutations from "../listings/mutations.js";
import type * as listings_queries from "../listings/queries.js";
import type * as notifications_mutations from "../notifications/mutations.js";
import type * as notifications_queries from "../notifications/queries.js";
import type * as posts_actions from "../posts/actions.js";
import type * as posts_comments_mutations from "../posts/comments/mutations.js";
import type * as posts_likes_mutations from "../posts/likes/mutations.js";
import type * as posts_mutations from "../posts/mutations.js";
import type * as posts_queries from "../posts/queries.js";
import type * as rateLimits from "../rateLimits.js";
import type * as sendEmails from "../sendEmails.js";
import type * as utils_clean from "../utils/clean.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  aggregates: typeof aggregates;
  "auth/auth": typeof auth_auth;
  "auth/users": typeof auth_users;
  "bookmarks/mutations": typeof bookmarks_mutations;
  "bookmarks/queries": typeof bookmarks_queries;
  cascadeDeletes: typeof cascadeDeletes;
  cascadeHelpers: typeof cascadeHelpers;
  "chat/mutations": typeof chat_mutations;
  "chat/queries": typeof chat_queries;
  "communities/actions": typeof communities_actions;
  "communities/mutations": typeof communities_mutations;
  "communities/queries": typeof communities_queries;
  email: typeof email;
  http: typeof http;
  "integrations/cloudinary": typeof integrations_cloudinary;
  "integrations/r2": typeof integrations_r2;
  "integrations/stripe": typeof integrations_stripe;
  "jobs/mutations": typeof jobs_mutations;
  "jobs/queries": typeof jobs_queries;
  "listings/mutations": typeof listings_mutations;
  "listings/queries": typeof listings_queries;
  "notifications/mutations": typeof notifications_mutations;
  "notifications/queries": typeof notifications_queries;
  "posts/actions": typeof posts_actions;
  "posts/comments/mutations": typeof posts_comments_mutations;
  "posts/likes/mutations": typeof posts_likes_mutations;
  "posts/mutations": typeof posts_mutations;
  "posts/queries": typeof posts_queries;
  rateLimits: typeof rateLimits;
  sendEmails: typeof sendEmails;
  "utils/clean": typeof utils_clean;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {
  betterAuth: import("../betterAuth/_generated/component.js").ComponentApi<"betterAuth">;
  cloudinary: import("@imaxis/cloudinary-convex/_generated/component.js").ComponentApi<"cloudinary">;
  stripe: import("@convex-dev/stripe/_generated/component.js").ComponentApi<"stripe">;
  convexCascadingDeletes: import("@sholajegede/convex-cascading-deletes/_generated/component.js").ComponentApi<"convexCascadingDeletes">;
  resend: import("@convex-dev/resend/_generated/component.js").ComponentApi<"resend">;
  r2: import("@convex-dev/r2/_generated/component.js").ComponentApi<"r2">;
  rateLimiter: import("@convex-dev/rate-limiter/_generated/component.js").ComponentApi<"rateLimiter">;
  aggregateByLikesPosts: import("@convex-dev/aggregate/_generated/component.js").ComponentApi<"aggregateByLikesPosts">;
  aggregateByLikesComments: import("@convex-dev/aggregate/_generated/component.js").ComponentApi<"aggregateByLikesComments">;
  aggregateByComments: import("@convex-dev/aggregate/_generated/component.js").ComponentApi<"aggregateByComments">;
  aggregateByCommunityPosts: import("@convex-dev/aggregate/_generated/component.js").ComponentApi<"aggregateByCommunityPosts">;
  aggregateByCommunityMembers: import("@convex-dev/aggregate/_generated/component.js").ComponentApi<"aggregateByCommunityMembers">;
  postShuffle: import("@convex-dev/aggregate/_generated/component.js").ComponentApi<"postShuffle">;
  postSortedByDate: import("@convex-dev/aggregate/_generated/component.js").ComponentApi<"postSortedByDate">;
  postSortedByLikes: import("@convex-dev/aggregate/_generated/component.js").ComponentApi<"postSortedByLikes">;
  migrations: import("@convex-dev/migrations/_generated/component.js").ComponentApi<"migrations">;
};
