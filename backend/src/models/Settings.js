import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema({
  autoBlogEmail: {
    type: Boolean,
    default: false
  },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
}, { timestamps: true });

export default mongoose.model("Settings", settingsSchema);
