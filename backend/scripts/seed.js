import dotenv from "dotenv";
import mongoose from "mongoose";
import Admin from "../src/models/Admin.js";
import Blog from "../src/models/Blog.js";

dotenv.config();

const sampleBlogs = [
  {
    title: "Designing Calm Interfaces",
    content:
      "# Designing Calm Interfaces\n\nGreat reading experiences are built on rhythm. Pair generous line-height with soft contrast, give the eyes a place to rest, and let spacing do the heavy lifting.",
    excerpt:
      "Great reading experiences are built on rhythm. Pair generous line-height with soft contrast and let spacing do the heavy lifting.",
    coverImage:
      "https://images.unsplash.com/photo-1483058712412-4245e9b90334?auto=format&fit=crop&w=1600&q=80",
    category: "Design",
    author: "Ava Thompson",
    status: "Published"
  },
  {
    title: "Product Narratives That Convert",
    content:
      "# Product Narratives That Convert\n\nA premium blog should read like a story. Lead with tension, resolve with clarity, and always invite the next click.",
    excerpt:
      "A premium blog should read like a story. Lead with tension, resolve with clarity, and invite the next click.",
    coverImage:
      "https://images.unsplash.com/photo-1487611459768-bd414656ea10?auto=format&fit=crop&w=1600&q=80",
    category: "Product",
    author: "Leo Park",
    status: "Published"
  },
  {
    title: "Engineering a Fast Editorial Stack",
    content:
      "# Engineering a Fast Editorial Stack\n\nPerformance is part of the brand. Cache what you can, keep payloads lean, and respect the reader's time.",
    excerpt:
      "Performance is part of the brand. Cache what you can, keep payloads lean, and respect the reader's time.",
    coverImage:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1600&q=80",
    category: "Engineering",
    author: "Mina Harper",
    status: "Published"
  },
  {
    title: "Marketing the Quiet Way",
    content:
      "# Marketing the Quiet Way\n\nThe best content platforms whisper, not shout. Let the insights carry the message and keep the interface focused.",
    excerpt:
      "The best content platforms whisper, not shout. Let the insights carry the message and keep the interface focused.",
    coverImage:
      "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1600&q=80",
    category: "Marketing",
    author: "Riley Chen",
    status: "Published"
  },
  {
    title: "Scaling Editorial Operations",
    content:
      "# Scaling Editorial Operations\n\nA small team can publish like a studio. Build templates, reuse components, and keep every workflow clean.",
    excerpt:
      "A small team can publish like a studio. Build templates, reuse components, and keep every workflow clean.",
    coverImage:
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1600&q=80",
    category: "Business",
    author: "Jordan Blake",
    status: "Published"
  },
  {
    title: "Research-Driven Editorial Strategy",
    content:
      "# Research-Driven Editorial Strategy\n\nStart with insight maps, validate through interviews, and craft narratives that answer real questions.",
    excerpt:
      "Start with insight maps, validate through interviews, and craft narratives that answer real questions.",
    coverImage:
      "https://images.unsplash.com/photo-1484981138541-3d074aa97716?auto=format&fit=crop&w=1600&q=80",
    category: "Research",
    author: "Noah Patel",
    status: "Published"
  },
  {
    title: "Draft: Editorial Calendar 101",
    content:
      "# Draft: Editorial Calendar 101\n\nPlanning ahead keeps a premium publishing cadence steady.",
    excerpt: "Planning ahead keeps a premium publishing cadence steady.",
    coverImage:
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1600&q=80",
    category: "Business",
    author: "Ava Thompson",
    status: "Draft"
  },
  {
    title: "Draft: Building with MERN",
    content:
      "# Draft: Building with MERN\n\nA brief outline of a minimal blog stack with a premium UI.",
    excerpt:
      "A brief outline of a minimal blog stack with a premium UI.",
    coverImage:
      "https://images.unsplash.com/photo-1457305237443-44c3d5a30b89?auto=format&fit=crop&w=1600&q=80",
    category: "Engineering",
    author: "Mina Harper",
    status: "Draft"
  }
];

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  const adminUsername = process.env.ADMIN_USERNAME || "admin";
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123";

  const existingAdmin = await Admin.findOne({ username: adminUsername });
  if (!existingAdmin) {
    await Admin.create({ username: adminUsername, password: adminPassword });
  }

  await Blog.deleteMany({});
  await Blog.insertMany(sampleBlogs);

  console.log("Seed complete");
  await mongoose.disconnect();
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
