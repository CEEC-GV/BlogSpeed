import mongoose from "mongoose";

const webhookEventSchema = new mongoose.Schema(
  {
    eventId: {
      type: String,
      required: true,
      unique: true
    },
    eventType: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
);

export default mongoose.model("WebhookEvent", webhookEventSchema);
