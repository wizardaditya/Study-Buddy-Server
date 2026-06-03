const mongoose = require("mongoose");

const TopicSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true },
  category: { type: String, enum: ["robotics", "iot", "ai"], required: true },
  icon: { type: String, required: true },
  color: { type: String, required: true },
  isActive: { type: Boolean, default: true },
});

module.exports = mongoose.model("Topic", TopicSchema);
