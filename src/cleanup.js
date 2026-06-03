/**
 * Cleanup Script — removes demo student and all their data
 * Usage: node src/cleanup.js
 */

require("dotenv").config();
const mongoose = require("mongoose");
const env = require("./config/env");

const User = require("./models/User.model");
const Post = require("./models/Post.model");
const Comment = require("./models/Comment.model");
const Like = require("./models/Like.model");
const Doubt = require("./models/Doubt.model");
const Answer = require("./models/Answer.model");
const Follow = require("./models/Follow.model");
const Notification = require("./models/Notification.model");
const Project = require("./models/Project.model");

async function cleanup() {
  try {
    await mongoose.connect(env.DATABASE_URL);
    console.log("✅ Connected to MongoDB\n");

    // Find demo student
    const demoUser = await User.findOne({ email: "demo@studybuddy.in" });
    if (!demoUser) {
      console.log("ℹ️  Demo student not found — nothing to delete");
      return;
    }

    const userId = demoUser._id;
    console.log(`🗑️  Found demo student: ${demoUser.name} (${demoUser.email})`);
    console.log("   Deleting all associated data...\n");

    // Delete all data belonging to demo student
    const [posts, comments, likes, doubts, answers, follows, notifications, projects] =
      await Promise.all([
        Post.deleteMany({ author: userId }),
        Comment.deleteMany({ author: userId }),
        Like.deleteMany({ user: userId }),
        Doubt.deleteMany({ author: userId }),
        Answer.deleteMany({ author: userId }),
        Follow.deleteMany({ $or: [{ follower: userId }, { following: userId }] }),
        Notification.deleteMany({ $or: [{ recipient: userId }, { sender: userId }] }),
        Project.deleteMany({ owner: userId }),
      ]);

    console.log(`   Posts deleted       : ${posts.deletedCount}`);
    console.log(`   Comments deleted    : ${comments.deletedCount}`);
    console.log(`   Likes deleted       : ${likes.deletedCount}`);
    console.log(`   Doubts deleted      : ${doubts.deletedCount}`);
    console.log(`   Answers deleted     : ${answers.deletedCount}`);
    console.log(`   Follows deleted     : ${follows.deletedCount}`);
    console.log(`   Notifications deleted: ${notifications.deletedCount}`);
    console.log(`   Projects deleted    : ${projects.deletedCount}`);

    // Finally delete the user
    await User.deleteOne({ _id: userId });
    console.log("\n✅ Demo student user deleted");
    console.log("🎉 Cleanup complete!\n");

  } catch (err) {
    console.error("❌ Cleanup failed:", err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

cleanup();
