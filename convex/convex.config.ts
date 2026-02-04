import { defineApp } from "convex/server";
import betterAuth from "./betterAuth/convex.config";
import cloudinary from "@imaxis/cloudinary-convex/convex.config";
import stripe from "@convex-dev/stripe/convex.config.js";

const app = defineApp();
app.use(betterAuth);
app.use(cloudinary);
app.use(stripe);

export default app;
