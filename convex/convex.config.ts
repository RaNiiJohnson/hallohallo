import { defineApp } from "convex/server";
import betterAuth from "./betterAuth/convex.config";
import cloudinary from "@imaxis/cloudinary-convex/convex.config";

const app = defineApp();
app.use(betterAuth);
app.use(cloudinary);

export default app;
