const mongoose = require("mongoose");

const HiringPostSchema = new mongoose.Schema(
  {
    companyName: { type: String, required: true, trim: true },
    role: { type: String, required: true, trim: true },
    skills: [{ type: String, trim: true }],
    salary: { type: String, required: true },
    location: { type: String, required: true },
    type: { type: String, enum: ["full-time", "internship", "part-time", "contract"], default: "full-time" },
    description: { type: String, required: true, maxlength: 3000 },
    applyUrl: String,
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    isActive: { type: Boolean, default: true },
    postedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

HiringPostSchema.index({ isActive: 1, postedAt: -1 });

module.exports = mongoose.model("HiringPost", HiringPostSchema);
