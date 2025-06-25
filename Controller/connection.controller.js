import { io, userSocketMap } from "../index.js";
import Connection from "../Models/connection.model.js";
import Notification from "../Models/notification.model.js";
import User from "../Models/user.model.js";

export const sendConnection = async (req, res) => {
  try {
    let { id } = req.params;

    console.log(id);

    let sender = req.userId;
    console.log(sender);

    let user = await User.findById(sender);

    if (sender == id) {
      return res
        .status(400)
        .json({ message: "you can not send requet yourself" });
    }
    if (user.connection.includes(id)) {
      return res.status(400).json({ message: "you are already connected" });
    }

    let existConnection = await Connection.findOne({
      sender,
      receiver: id,
      status: "pending",
    });
    if (existConnection) {
      return res.status(400).json({ message: "your are already connected" });
    }

    let newConnection = await Connection.create({ sender, receiver: id });

    let recieverSocketId = userSocketMap.get(id);
    let senderSocketId = userSocketMap.get(sender);

    if (recieverSocketId) {
      io.to(recieverSocketId).emit("statusUpdate", {
        updatedUserId: sender,
        newStatus: "received",
      });
    }
    if (senderSocketId) {
      io.to(senderSocketId).emit("statusUpdate", {
        updatedUserId: id,
        newStatus: "pending",
      });
    }

    return res.status(200).json(newConnection);
  } catch (error) {
    return res.status(500).json({ message: `Send Connection error ${error}` });
  }
};

export const acceptConnection = async (req, res) => {
  try {
    let { connectionId } = req.params;
    let userId = req.userId;

    if (!connectionId) {
      return res
        .status(400)
        .json({ message: "connectionId is required and must be valid" });
    }

    let connection = await Connection.findById(connectionId);

    if (!connection) {
      return res.status(400).json({ message: "connection doesn't exist" });
    }
    if (connection.status != "pending") {
      return res.status(400).json({ message: "request unsder process" });
    }

    connection.status = "accepted";
    let notification = await Notification.create({
      receiver: connection.sender,
      type: "connectionAccepted",
      relatedUser: userId,
    });

    await connection.save();

    await User.findByIdAndUpdate(req.userId, {
      $addToSet: { connection: connection.sender._id },
    });

    await User.findByIdAndUpdate(connection.sender._id, {
      $addToSet: { connection: req.userId },
    });

    let recieverSocketId = userSocketMap.get(
      connection.receiver._id.toString()
    );
    let senderSocketId = userSocketMap.get(connection.sender._id.toString());

    if (recieverSocketId) {
      io.to(recieverSocketId).emit("statusUpdate", {
        updatedUserId: connection.sender._id,
        newStatus: "disconnect",
      });
    }
    if (senderSocketId) {
      io.to(senderSocketId).emit("statusUpdate", {
        updatedUserId: req.userId,
        newStatus: "disconnect",
      });
    }
    return res.status(200).json({ message: "connection accepted" });
  } catch (error) {
    console.log(error);

    return res
      .status(500)
      .json({ message: `connection accepted error ${error}` });
  }
};

export const rejectConnection = async (req, res) => {
  try {
    let { connectionId } = req.params;
    let connection = await Connection.findById(connectionId);

    if (!connection) {
      return res.status(400).json({ message: "connection doexm't exist" });
    }
    if (connection.status != "pending") {
      return res.status(400).json({ message: "request under process" });
    }
    connection.status = "rejected";
    await connection.save();
    let recieverSocketId = userSocketMap.get(
      connection.receiver._id.toString()
    );
    let senderSocketId = userSocketMap.get(connection.sender._id.toString());

    if (recieverSocketId) {
      io.to(recieverSocketId).emit("statusUpdate", {
        updatedUserId: connection.sender._id,
        newStatus: "Connect",
      });
    }
    if (senderSocketId) {
      io.to(senderSocketId).emit("statusUpdate", {
        updatedUserId: req.userId,
        newStatus: "Connect",
      });
    }
    return res.status(200).json({ message: "connection rejected" });
  } catch (error) {
    return res.status(500).json({
      message: `conection rejected error ${error}`,
    });
  }
};

export const getConnectionStatus = async (req, res) => {
  try {
    const targetUserId = req.params.userId;
    const currentUserId = req.userId;

    if (!currentUserId || !targetUserId) {
      return res.status(400).json({ message: "Invalid user id" });
    }

    let currentUser = await User.findById(currentUserId);

    if (currentUser.connection.includes(targetUserId)) {
      return res.json({ status: "disconnect" });
    }

    const pendingRequest = await Connection.findOne({
      $or: [
        {
          sender: currentUserId,
          receiver: targetUserId,
        },
        {
          sender: targetUserId,
          receiver: currentUserId,
        },
      ],
      status: "pending",
    });

    if (pendingRequest) {
      if (pendingRequest.sender.toString() === currentUserId.toString()) {
        return res.json({ status: "pending" });
      } else {
        return res.json({ status: "received", requestId: pendingRequest._id });
      }
    }

    // if no connection and pending request found
    return res.json({
      status: "Connect",
    });
  } catch (error) {
    return res.status(500).json({ message: `get Connection error ${error}` });
  }
};

export const removeConnection = async (req, res) => {
  try {
    const myId = req.userId;
    const otherId = req.params.userId;

    await User.findByIdAndUpdate(myId, {
      $pull: {
        connection: otherId,
      },
    });

    await User.findByIdAndUpdate(otherId, {
      $pull: {
        connection: myId,
      },
    });

    let recieverSocketId = userSocketMap.get(otherId);
    let senderSocketId = userSocketMap.get(myId);

    if (recieverSocketId) {
      io.to(recieverSocketId).emit("statusUpdate", {
        updatedUserId: myId,
        newStatus: "connect",
      });
    }
    if (senderSocketId) {
      io.to(senderSocketId).emit("statusUpdate", {
        updatedUserId: otherId,
        newStatus: "connect",
      });
    }

    res.json({ message: "connection remove successfully" });
  } catch (error) {
    return res.status(500).json({ message: "removeConnection error" });
  }
};

export const getConnectionRequest = async (req, res) => {
  try {
    const userId = req.userId;
    console.log("userId:", userId);

    if (!userId) {
      return res.status(400).json({ message: "User not authenticated" });
    }

    const request = await Connection.find({
      receiver: userId,
      status: "pending",
    }).populate(
      "sender",
      "firstName lastName email userName profileImage headline"
    );

    return res.status(200).json(request);
  } catch (error) {
    console.log("getConnectionRequest error:", error);
    return res.status(500).json({ message: "server error" });
  }
};

export const getUserConnections = async (req, res) => {
  try {
    const userId = req.userId;

    const user = await User.findById(userId).populate(
      "connection",
      "firstName lastName userName profileImage headline connection "
    );

    return res.status(200).json(user.connection);
  } catch (error) {
    console.error("Error in getUserConnection Controller :", error);
    return res.status(500).json({ message: "Server error" });
  }
};
