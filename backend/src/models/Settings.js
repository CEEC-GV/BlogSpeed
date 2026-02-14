import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema({
  autoBlogEmail: {
    type: Boolean,
    default: false
  },
  companyName: {
    type: String,
    trim: true,
    maxlength: 100
  },
  companyLink: {
    type: String,
    trim: true,
    maxlength: 200
  },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
}, { timestamps: true });

export default mongoose.model("Settings", settingsSchema);
