/**
 * Cleanup Script — wipes ALL dummy/seed data except admin user
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
const MockTest = require("./models/MockTest.model");
const HiringPost = require("./models/HiringPost.model");
const Topic = require("./models/Topic.model");
const AuraSession = require("./models/AuraSession.model");
const AuraMemory = require("./models/AuraMemory.model");
const Streak = require("./models/Streak.model");
const StudyRoom = require("./models/StudyRoom.model");
const Message = require("./models/Message.model");
const Subscription = require("./models/Subscription.model");
const TestAttempt = require("./models/TestAttempt.model");

async function cleanup() {
  try {
    await mongoose.connect(env.DATABASE_URL);
    console.log("✅ Connected to MongoDB\n");
    console.log("🗑️  Starting full cleanup...\n");

    // Delete all non-admin users
    const deletedUsers = await User.deleteMany({ role: { $ne: "admin" } });
    console.log(`   Users deleted        : ${deletedUsers.deletedCount}`);

    // Delete ALL community/content data
    const [
      posts, comments, likes, doubts, answers,
      follows, notifications, projects, mockTests,
      hiringPosts, topics, auraSessions, auraMemories,
      streaks, rooms, messages, subscriptions, testAttempts
    ] = await Promise.all([
      Post.deleteMany({}),
      Comment.deleteMany({}),
      Like.deleteMany({}),
      Doubt.deleteMany({}),
      Answer.deleteMany({}),
      Follow.deleteMany({}),
      Notification.deleteMany({}),
      Project.deleteMany({}),
      MockTest.deleteMany({}),
      HiringPost.deleteMany({}),
      Topic.deleteMany({}),
      AuraSession.deleteMany({}),
      AuraMemory.deleteMany({}),
      Streak.deleteMany({}),
      StudyRoom.deleteMany({}),
      Message.deleteMany({}),
      Subscription.deleteMany({}),
      TestAttempt.deleteMany({}),
    ]);

    console.log(`   Posts deleted        : ${posts.deletedCount}`);
    console.log(`   Comments deleted     : ${comments.deletedCount}`);
    console.log(`   Likes deleted        : ${likes.deletedCount}`);
    console.log(`   Doubts deleted       : ${doubts.deletedCount}`);
    console.log(`   Answers deleted      : ${answers.deletedCount}`);
    console.log(`   Follows deleted      : ${follows.deletedCount}`);
    console.log(`   Notifications deleted: ${notifications.deletedCount}`);
    console.log(`   Projects deleted     : ${projects.deletedCount}`);
    console.log(`   Mock Tests deleted   : ${mockTests.deletedCount}`);
    console.log(`   Hiring Posts deleted : ${hiringPosts.deletedCount}`);
    console.log(`   Topics deleted       : ${topics.deletedCount}`);
    console.log(`   Aura Sessions deleted: ${auraSessions.deletedCount}`);
    console.log(`   Aura Memories deleted: ${auraMemories.deletedCount}`);
    console.log(`   Streaks deleted      : ${streaks.deletedCount}`);
    console.log(`   Study Rooms deleted  : ${rooms.deletedCount}`);
    console.log(`   Messages deleted     : ${messages.deletedCount}`);
    console.log(`   Subscriptions deleted: ${subscriptions.deletedCount}`);
    console.log(`   Test Attempts deleted: ${testAttempts.deletedCount}`);

    console.log("\n✅ Database is clean — only admin user remains");
    console.log("🎉 Cleanup complete!\n");

  } catch (err) {
    console.error("❌ Cleanup failed:", err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

cleanup();
