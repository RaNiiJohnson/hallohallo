import { MINUTE, RateLimiter } from "@convex-dev/rate-limiter";
import { components } from "./_generated/api";

export const limiter = new RateLimiter(components.rateLimiter, {
  // 2 posts max par minute par utilisateur
  createPostPerUser: {
    kind: "token bucket",
    rate: 2,
    period: 5 * MINUTE,
    capacity: 2,
  },
});
