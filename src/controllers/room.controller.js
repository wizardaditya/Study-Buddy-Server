const crypto = require("crypto");
const StudyRoom = require("../models/StudyRoom.model");
const { sendSuccess, sendError } = require("../utils/response.utils");

async function getRooms(req, res) {
  try {
    const rooms = await StudyRoom.find({ isLive: true })
      .sort({ createdAt: -1 })
      .populate("host", "name username avatar").lean();
    return sendSuccess(res, rooms);
  } catch (err) {
    return sendError(res, "Failed to get rooms", 500);
  }
}

async function createRoom(req, res) {
  try {
    const { name, topic, maxParticipants } = req.body;
    const roomCode = crypto.randomBytes(4).toString("hex").toUpperCase();
    const room = await StudyRoom.create({
      name, topic, maxParticipants: maxParticipants || 10,
      host: req.user.userId,
      participants: [req.user.userId],
      roomCode,
    });
    await room.populate("host", "name username avatar");
    return sendSuccess(res, room.toObject(), "Room created", 201);
  } catch (err) {
    return sendError(res, "Failed to create room", 500);
  }
}

async function getRoom(req, res) {
  try {
    const room = await StudyRoom.findById(req.params.id)
      .populate("host", "name username avatar")
      .populate("participants", "name username avatar").lean();
    if (!room) return sendError(res, "Room not found", 404);
    return sendSuccess(res, room);
  } catch (err) {
    return sendError(res, "Failed to get room", 500);
  }
}

async function joinRoom(req, res) {
  try {
    const room = await StudyRoom.findById(req.params.id);
    if (!room || !room.isLive) return sendError(res, "Room not found or not live", 404);
    if (room.participantsCount >= room.maxParticipants) return sendError(res, "Room is full", 400);
    if (!room.participants.includes(req.user.userId)) {
      room.participants.push(req.user.userId);
      room.participantsCount += 1;
      await room.save();
    }
    return sendSuccess(res, { roomCode: room.roomCode }, "Joined room");
  } catch (err) {
    return sendError(res, "Failed to join room", 500);
  }
}

async function leaveRoom(req, res) {
  try {
    const room = await StudyRoom.findById(req.params.id);
    if (!room) return sendError(res, "Room not found", 404);
    room.participants = room.participants.filter((p) => p.toString() !== req.user.userId);
    room.participantsCount = Math.max(0, room.participantsCount - 1);
    if (room.host.toString() === req.user.userId) room.isLive = false;
    await room.save();
    return sendSuccess(res, null, "Left room");
  } catch (err) {
    return sendError(res, "Failed to leave room", 500);
  }
}

module.exports = { getRooms, createRoom, getRoom, joinRoom, leaveRoom };
