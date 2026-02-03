import mongoose from "mongoose";

const blogAnalyticsSchema = new mongoose.Schema(
  {
    blogId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Blog",
      required: true,
      unique: true,
      index: true
    },

    // Simple counters
    totalViews: { type: Number, default: 0 },
    uniqueViews: { type: Number, default: 0 },

    // Store visitor IDs for unique detection (last 1000)
    uniqueVisitorIds: [{ type: String }],

    // Geographic tracking
    viewsByCountry: [
      {
        country: String,
        views: { type: Number, default: 0 }
      }
    ],

    // Daily views (last 30 days)
    dailyViews: [
      {
        date: Date,
        views: { type: Number, default: 0 }
      }
    ],

    lastViewed: { type: Date }
  },
  { timestamps: true }
);

// Keep only last 30 days of daily data
blogAnalyticsSchema.pre("save", function(next) {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  if (this.dailyViews) {
    this.dailyViews = this.dailyViews.filter(
      entry => entry.date >= thirtyDaysAgo
    );
  }
  
  // Keep only last 1000 visitor IDs
  if (this.uniqueVisitorIds && this.uniqueVisitorIds.length > 1000) {
    this.uniqueVisitorIds = this.uniqueVisitorIds.slice(-1000);
  }
  
  next();
});

export default mongoose.model("BlogAnalytics", blogAnalyticsSchema);