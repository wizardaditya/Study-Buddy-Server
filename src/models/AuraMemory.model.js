const mongoose = require("mongoose");

const AuraMemorySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ["fact", "preference", "achievement", "struggle", "topic"], required: true },
    content: { type: String, required: true, maxlength: 1000 },
    embedding: [{ type: Number }],
    metadata: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

AuraMemorySchema.index({ user: 1, type: 1 });

module.exports = mongoose.model("AuraMemory", AuraMemorySchema);
