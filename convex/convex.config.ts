import { defineApp } from "convex/server";
import betterAuth from "./betterAuth/convex.config";
import cloudinary from "@imaxis/cloudinary-convex/convex.config";
import stripe from "@convex-dev/stripe/convex.config.js";
import aggregate from "@convex-dev/aggregate/convex.config.js";

const app = defineApp();
app.use(betterAuth);
app.use(cloudinary);
app.use(stripe);

app.use(aggregate, { name: "aggregateByLikesPosts" });
app.use(aggregate, { name: "aggregateByLikesComments" });
app.use(aggregate, { name: "aggregateByLikesReplyComments" });
app.use(aggregate, { name: "aggregateByComments" });
app.use(aggregate, { name: "aggregateByCommunityPosts" });
app.use(aggregate, { name: "aggregateByCommunityMembers" });

export default app;
