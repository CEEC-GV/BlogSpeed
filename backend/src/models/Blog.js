import mongoose from "mongoose";
import slugify from "slugify";

const blogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true },
    content: { type: String, required: true },
    excerpt: { type: String, trim: true }, // meta description
    coverImage: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    author: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ["Published", "Draft"],
      default: "Draft"
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    // ✅ SEO (WordPress-style, optional, non-breaking)
    seo: {
      metaDescription: { type: String, trim: true },
      primaryKeyphrase: { type: String, trim: true },
      secondaryKeyphrases: [{ type: String, trim: true }]
    }
  },
  { timestamps: true }
);

blogSchema.pre("validate", function (next) {
  // Auto slug (WordPress-like)
  if (!this.slug && this.title) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }

  // Auto meta description fallback
  if (!this.excerpt && this.content) {
    this.excerpt = this.content.slice(0, 160);
  }

  // Sync SEO meta description if missing
  if (!this.seo?.metaDescription && this.excerpt) {
    this.seo = {
      ...this.seo,
      metaDescription: this.excerpt
    };
  }

  next();
});

export default mongoose.model("Blog", blogSchema);

