import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema({
  autoBlogEmail: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

export default mongoose.model("Settings", settingsSchema);
