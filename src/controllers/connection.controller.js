const Connection = require("../models/Connection.model");
const User = require("../models/User.model");
const Notification = require("../models/Notification.model");
const { sendSuccess, sendError } = require("../utils/response.utils");

// Send connection request
async function sendRequest(req, res) {
  try {
    const { id: recipientId } = req.params;
    const requesterId = req.user.userId;

    if (requesterId === recipientId)
      return sendError(res, "Cannot connect with yourself", 400);

    const recipient = await User.findById(recipientId);
    if (!recipient) return sendError(res, "User not found", 404);

    // Check if already connected or pending
    const existing = await Connection.findOne({
      $or: [
        { requester: requesterId, recipient: recipientId },
        { requester: recipientId, recipient: requesterId },
      ],
    });

    if (existing) {
      if (existing.status === "accepted") return sendError(res, "Already connected", 409);
      if (existing.status === "pending") return sendError(res, "Request already sent", 409);
    }

    const connection = await Connection.create({ requester: requesterId, recipient: recipientId });

    // Send notification to recipient
    try {
      await Notification.create({
        recipient: recipientId,
        sender: requesterId,
        type: "connection_request",
        message: `sent you a connection request`,
        refId: connection._id,
        refModel: "Connection",
      });
      // Emit socket notification
      const io = req.app.get("io");
      if (io) io.to(`user:${recipientId}`).emit("notification", { type: "connection_request" });
    } catch (e) { /* notification failure should not block */ }

    return sendSuccess(res, { status: "pending" }, "Connection request sent", 201);
  } catch (err) {
    if (err.code === 11000) return sendError(res, "Request already sent", 409);
    return sendError(res, "Failed to send request", 500);
  }
}

// Accept connection request
async function acceptRequest(req, res) {
  try {
    const { id: connectionId } = req.params;
    const connection = await Connection.findOne({
      _id: connectionId,
      recipient: req.user.userId,
      status: "pending",
    });
    if (!connection) return sendError(res, "Connection request not found", 404);

    connection.status = "accepted";
    await connection.save();

    // Notify requester
    try {
      await Notification.create({
        recipient: connection.requester,
        sender: req.user.userId,
        type: "connection_accepted",
        message: `accepted your connection request`,
        refId: connection._id,
        refModel: "Connection",
      });
      const io = req.app.get("io");
      if (io) io.to(`user:${connection.requester}`).emit("notification", { type: "connection_accepted" });
    } catch (e) { /* ignore */ }

    return sendSuccess(res, { status: "accepted" }, "Connection accepted");
  } catch (err) {
    return sendError(res, "Failed to accept request", 500);
  }
}

// Reject or remove connection
async function removeConnection(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    // Can be connectionId or userId of the other person
    let connection = await Connection.findOne({
      _id: id,
      $or: [{ requester: userId }, { recipient: userId }],
    });

    // If not found by connectionId, try by other userId
    if (!connection) {
      connection = await Connection.findOne({
        $or: [
          { requester: userId, recipient: id },
          { requester: id, recipient: userId },
        ],
      });
    }

    if (!connection) return sendError(res, "Connection not found", 404);

    await connection.deleteOne();
    return sendSuccess(res, null, "Connection removed");
  } catch (err) {
    return sendError(res, "Failed to remove connection", 500);
  }
}

// Get connection status between current user and another user
async function getConnectionStatus(req, res) {
  try {
    const { id: otherUserId } = req.params;
    const userId = req.user.userId;

    const connection = await Connection.findOne({
      $or: [
        { requester: userId, recipient: otherUserId },
        { requester: otherUserId, recipient: userId },
      ],
    });

    if (!connection) return sendSuccess(res, { status: "none", connectionId: null });

    const isSentByMe = connection.requester.toString() === userId;
    return sendSuccess(res, {
      status: connection.status,
      connectionId: connection._id,
      isSentByMe,
    });
  } catch (err) {
    return sendError(res, "Failed to get status", 500);
  }
}

// Get all connections (accepted) for current user
async function getMyConnections(req, res) {
  try {
    const userId = req.user.userId;
    const connections = await Connection.find({
      $or: [{ requester: userId }, { recipient: userId }],
      status: "accepted",
    })
      .populate("requester", "name username avatar bio role")
      .populate("recipient", "name username avatar bio role")
      .sort({ updatedAt: -1 })
      .lean();

    const users = connections.map((c) => {
      const other = c.requester._id.toString() === userId ? c.recipient : c.requester;
      return { ...other, connectionId: c._id };
    });

    return sendSuccess(res, users);
  } catch (err) {
    return sendError(res, "Failed to get connections", 500);
  }
}

// Get pending requests (received)
async function getPendingRequests(req, res) {
  try {
    const requests = await Connection.find({
      recipient: req.user.userId,
      status: "pending",
    })
      .populate("requester", "name username avatar bio role skills")
      .sort({ createdAt: -1 })
      .lean();

    return sendSuccess(res, requests);
  } catch (err) {
    return sendError(res, "Failed to get requests", 500);
  }
}

// Get sent pending requests
async function getSentRequests(req, res) {
  try {
    const requests = await Connection.find({
      requester: req.user.userId,
      status: "pending",
    })
      .populate("recipient", "name username avatar bio role")
      .sort({ createdAt: -1 })
      .lean();

    return sendSuccess(res, requests);
  } catch (err) {
    return sendError(res, "Failed to get sent requests", 500);
  }
}

module.exports = {
  sendRequest,
  acceptRequest,
  removeConnection,
  getConnectionStatus,
  getMyConnections,
  getPendingRequests,
  getSentRequests,
};
