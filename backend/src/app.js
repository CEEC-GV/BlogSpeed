import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import mongoSanitize from "express-mongo-sanitize";

import authRoutes from "./routes/authRoutes.js";
import blogRoutes from "./routes/blogRoutes.js";
import adminBlogRoutes from "./routes/adminBlogRoutes.js";
import adminSeoRoutes from "./routes/adminSeoRoutes.js";
import trendsRoutes from "./routes/trendsRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import subscriberRoutes from "./routes/subscriberRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import settingsRoutes from "./routes/settingsRoutes.js"; 

import { notFound, errorHandler } from "./middleware/errorHandler.js";

const app = express();

app.get("/ping", (req, res) => {
  res.json({ status: "ok" });
});

app.use(
  cors({
    origin: ["http://localhost:5173", "*", "http://localhost:5174"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.options("*", cors());

app.use(helmet());
app.use(morgan("dev"));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: false }));
app.use(mongoSanitize());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/admin/blogs", adminBlogRoutes);
app.use("/api/admin", adminSeoRoutes); 
app.use("/api/trends", trendsRoutes);
app.use("/api/admin/analytics", analyticsRoutes);
app.use("/api/subscribers", subscriberRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/admin/settings", settingsRoutes); 

app.use(notFound);
app.use(errorHandler);

export default app;
