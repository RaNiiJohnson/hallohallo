import aggregate from "@convex-dev/aggregate/convex.config.js";
import migrations from "@convex-dev/migrations/convex.config";
import r2 from "@convex-dev/r2/convex.config.js";
import rateLimiter from "@convex-dev/rate-limiter/convex.config.js";
import resend from "@convex-dev/resend/convex.config.js";
import stripe from "@convex-dev/stripe/convex.config.js";
import cloudinary from "@imaxis/cloudinary-convex/convex.config";
import convexCascadingDeletes from "@sholajegede/convex-cascading-deletes/convex.config.js";
import { defineApp } from "convex/server";
import betterAuth from "./betterAuth/convex.config";

const app = defineApp();
app.use(betterAuth);
app.use(cloudinary);
app.use(stripe);
app.use(convexCascadingDeletes);
app.use(resend);
app.use(r2);
app.use(rateLimiter);

app.use(aggregate, { name: "aggregateByLikesPosts" });
app.use(aggregate, { name: "aggregateByLikesComments" });
app.use(aggregate, { name: "aggregateByComments" });
app.use(aggregate, { name: "aggregateByCommunityPosts" });
app.use(aggregate, { name: "aggregateByCommunityMembers" });
app.use(aggregate, { name: "postShuffle" });
app.use(aggregate, { name: "postSortedByDate" });
app.use(aggregate, { name: "postSortedByLikes" });

app.use(migrations);

export default app;
