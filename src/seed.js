/**
 * Seed Script — run once to populate initial data
 * Usage: node src/seed.js
 *
 * Creates:
 *  - 1 Admin user
 *  - 1 Student user
 *  - Topics
 *  - 3 Sample Mock Tests
 *  - 2 Sample Hiring Posts
 */

require("dotenv").config();
const mongoose = require("mongoose");
const env = require("./config/env");
const { hashPassword } = require("./utils/hash.utils");

// Models
const User = require("./models/User.model");
const MockTest = require("./models/MockTest.model");
const HiringPost = require("./models/HiringPost.model");
const Topic = require("./models/Topic.model");

async function seed() {
  try {
    await mongoose.connect(env.DATABASE_URL);
    console.log("✅ Connected to MongoDB");

    // ── Users ──────────────────────────────────────────────
    const adminExists = await User.findOne({ email: "admin@studybuddy.in" });
    let adminUser;

    if (!adminExists) {
      const hashed = await hashPassword("Admin@1234");
      adminUser = await User.create({
        name: "Study Buddy Admin",
        username: "sb_admin",
        email: "admin@studybuddy.in",
        password: hashed,
        role: "admin",
        plan: "elite",
        isVerified: true,
        xp: 9999,
        level: 10,
      });
      console.log("✅ Admin user created — email: admin@studybuddy.in | password: Admin@1234");
    } else {
      adminUser = adminExists;
      console.log("ℹ️  Admin user already exists");
    }

    const studentExists = await User.findOne({ email: "demo@studybuddy.in" });
    if (!studentExists) {
      const hashed = await hashPassword("Demo@1234");
      await User.create({
        name: "Demo Student",
        username: "demo_student",
        email: "demo@studybuddy.in",
        password: hashed,
        role: "student",
        plan: "free",
        xp: 250,
        level: 3,
        currentStreak: 5,
        bio: "Learning Robotics & AI 🤖",
        city: "Mumbai",
        state: "Maharashtra",
      });
      console.log("✅ Demo student created — email: demo@studybuddy.in | password: Demo@1234");
    } else {
      console.log("ℹ️  Demo student already exists");
    }

    // ── Topics ─────────────────────────────────────────────
    const topicCount = await Topic.countDocuments();
    if (topicCount === 0) {
      await Topic.insertMany([
        { name: "Arduino", slug: "arduino", category: "robotics", icon: "🤖", color: "#00979D" },
        { name: "Raspberry Pi", slug: "raspberry-pi", category: "robotics", icon: "🍓", color: "#C51A4A" },
        { name: "ROS", slug: "ros", category: "robotics", icon: "⚙️", color: "#22314E" },
        { name: "ESP32/ESP8266", slug: "esp32", category: "iot", icon: "📡", color: "#E74C3C" },
        { name: "MQTT Protocol", slug: "mqtt", category: "iot", icon: "📨", color: "#8E44AD" },
        { name: "Home Automation", slug: "home-automation", category: "iot", icon: "🏠", color: "#1ABC9C" },
        { name: "Machine Learning", slug: "machine-learning", category: "ai", icon: "🧠", color: "#9B59B6" },
        { name: "Computer Vision", slug: "computer-vision", category: "ai", icon: "👁️", color: "#27AE60" },
        { name: "LLMs & Prompt Engineering", slug: "llm", category: "ai", icon: "✨", color: "#7C3AED" },
      ]);
      console.log("✅ Topics seeded");
    } else {
      console.log("ℹ️  Topics already exist");
    }

    // ── Mock Tests ─────────────────────────────────────────
    const testCount = await MockTest.countDocuments();
    if (testCount === 0) {
      await MockTest.insertMany([
        {
          title: "Arduino Fundamentals",
          topic: "arduino",
          difficulty: "easy",
          duration: 15,
          createdBy: adminUser._id,
          questions: [
            {
              question: "Which function runs once when an Arduino program starts?",
              options: ["loop()", "setup()", "init()", "start()"],
              correctAnswer: "setup()",
              explanation: "setup() runs once at startup for initialization. loop() runs repeatedly after that.",
              type: "mcq",
            },
            {
              question: "What does analogWrite() do on Arduino?",
              options: ["Reads analog voltage", "Outputs a PWM signal", "Writes to EEPROM", "Reads digital pin"],
              correctAnswer: "Outputs a PWM signal",
              explanation: "analogWrite() generates a PWM (Pulse Width Modulation) signal on PWM-capable pins.",
              type: "mcq",
            },
            {
              question: "What is the default baud rate used in most Arduino Serial examples?",
              options: ["4800", "9600", "115200", "57600"],
              correctAnswer: "9600",
              explanation: "9600 baud is the most commonly used rate in beginner Arduino Serial examples.",
              type: "mcq",
            },
            {
              question: "Arduino Uno has how many analog input pins?",
              options: ["4", "6", "8", "10"],
              correctAnswer: "6",
              explanation: "Arduino Uno has 6 analog input pins (A0 to A5).",
              type: "mcq",
            },
            {
              question: "Which Arduino function is used to read a digital pin?",
              options: ["analogRead()", "digitalRead()", "pinRead()", "readPin()"],
              correctAnswer: "digitalRead()",
              explanation: "digitalRead() reads the value from a digital pin — either HIGH or LOW.",
              type: "mcq",
            },
          ],
        },
        {
          title: "IoT & MQTT Basics",
          topic: "mqtt",
          difficulty: "medium",
          duration: 20,
          createdBy: adminUser._id,
          questions: [
            {
              question: "What does MQTT stand for?",
              options: ["Message Queuing Telemetry Transport", "Mobile Queue Transfer Technology", "Managed Queue Telemetry Tool", "Message Queue Transfer Tech"],
              correctAnswer: "Message Queuing Telemetry Transport",
              explanation: "MQTT stands for Message Queuing Telemetry Transport — a lightweight pub/sub messaging protocol.",
              type: "mcq",
            },
            {
              question: "What is the default port for MQTT?",
              options: ["80", "443", "1883", "8883"],
              correctAnswer: "1883",
              explanation: "MQTT uses port 1883 by default. Port 8883 is for MQTT over TLS/SSL.",
              type: "mcq",
            },
            {
              question: "In MQTT, what is a 'broker'?",
              options: ["A device that publishes messages", "A server that routes messages between clients", "A client that subscribes to topics", "A type of network protocol"],
              correctAnswer: "A server that routes messages between clients",
              explanation: "The MQTT broker is the central server that receives all messages and routes them to appropriate subscribers.",
              type: "mcq",
            },
            {
              question: "Which QoS level in MQTT guarantees exactly-once delivery?",
              options: ["QoS 0", "QoS 1", "QoS 2", "QoS 3"],
              correctAnswer: "QoS 2",
              explanation: "QoS 2 (exactly once) is the highest level ensuring the message is received exactly once.",
              type: "mcq",
            },
            {
              question: "ESP32 can connect to MQTT broker using Wi-Fi.",
              options: ["True", "False"],
              correctAnswer: "True",
              explanation: "ESP32 has built-in Wi-Fi and can connect to any MQTT broker over the network.",
              type: "true_false",
            },
          ],
        },
        {
          title: "Machine Learning Concepts",
          topic: "machine-learning",
          difficulty: "hard",
          duration: 25,
          createdBy: adminUser._id,
          questions: [
            {
              question: "Which algorithm is used for classification tasks where the output is a probability between 0 and 1?",
              options: ["Linear Regression", "Logistic Regression", "K-Means", "PCA"],
              correctAnswer: "Logistic Regression",
              explanation: "Logistic Regression uses the sigmoid function to output probabilities between 0 and 1 for classification.",
              type: "mcq",
            },
            {
              question: "What is overfitting in machine learning?",
              options: [
                "Model performs well on training and test data",
                "Model performs well on training data but poorly on unseen data",
                "Model performs poorly on training data",
                "Model has too few parameters",
              ],
              correctAnswer: "Model performs well on training data but poorly on unseen data",
              explanation: "Overfitting occurs when a model learns noise in training data and fails to generalize.",
              type: "mcq",
            },
            {
              question: "Which technique is used to prevent overfitting by randomly dropping neurons during training?",
              options: ["Batch Normalization", "Dropout", "L2 Regularization", "Data Augmentation"],
              correctAnswer: "Dropout",
              explanation: "Dropout randomly deactivates neurons during training, forcing the network to learn robust features.",
              type: "mcq",
            },
            {
              question: "In a confusion matrix, what does 'True Positive' mean?",
              options: [
                "Model predicted negative, actual was positive",
                "Model predicted positive, actual was positive",
                "Model predicted positive, actual was negative",
                "Model predicted negative, actual was negative",
              ],
              correctAnswer: "Model predicted positive, actual was positive",
              explanation: "True Positive means the model correctly predicted the positive class.",
              type: "mcq",
            },
            {
              question: "Which optimization algorithm adapts the learning rate for each parameter?",
              options: ["SGD", "Momentum", "Adam", "RMSprop"],
              correctAnswer: "Adam",
              explanation: "Adam (Adaptive Moment Estimation) combines momentum and RMSprop to adapt learning rates per parameter.",
              type: "mcq",
            },
          ],
        },
      ]);
      console.log("✅ Mock Tests seeded (3 tests)");
    } else {
      console.log("ℹ️  Mock Tests already exist");
    }

    // ── Hiring Posts ───────────────────────────────────────
    const hiringCount = await HiringPost.countDocuments();
    if (hiringCount === 0) {
      await HiringPost.insertMany([
        {
          companyName: "Ather Energy",
          role: "Embedded Systems Engineer",
          skills: ["Arduino", "C/C++", "CAN Bus", "RTOS"],
          salary: "₹8-14 LPA",
          location: "Bengaluru",
          type: "full-time",
          description: "Work on next-gen EV firmware and embedded control systems. Strong background in embedded C/C++ and microcontroller programming required.",
          postedBy: adminUser._id,
        },
        {
          companyName: "Bosch India",
          role: "IoT Developer Intern",
          skills: ["ESP32", "MQTT", "Python", "AWS IoT"],
          salary: "₹25,000/month",
          location: "Pune",
          type: "internship",
          description: "6-month internship working on connected device solutions. Experience with ESP32 and cloud IoT platforms preferred.",
          postedBy: adminUser._id,
        },
        {
          companyName: "TCS Research",
          role: "AI/ML Engineer",
          skills: ["Python", "TensorFlow", "PyTorch", "Computer Vision"],
          salary: "₹12-18 LPA",
          location: "Hyderabad",
          type: "full-time",
          description: "Build and deploy ML models for industrial automation. Strong Python and deep learning framework knowledge required.",
          postedBy: adminUser._id,
        },
      ]);
      console.log("✅ Hiring Posts seeded (3 posts)");
    } else {
      console.log("ℹ️  Hiring Posts already exist");
    }

    console.log("\n🎉 Seed complete!\n");
    console.log("Login credentials:");
    console.log("  Admin  → admin@studybuddy.in  / Admin@1234");
    console.log("  Student→ demo@studybuddy.in   / Demo@1234\n");

  } catch (err) {
    console.error("❌ Seed failed:", err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seed();
