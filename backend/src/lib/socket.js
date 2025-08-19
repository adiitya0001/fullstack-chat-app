import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: ["http://localhost:5173"],
        methods: ["GET", "POST"],
    },
});

const userSocketMap = {}; // { userId: socketId }

export const getReceiverSocketId = (receiverId) => {
    return userSocketMap[receiverId];
};

io.on("connection", (socket) => {
    console.log("✅ A user connected:", socket.id);
    const userId = socket.handshake.query.userId;

    if (userId !== "undefined") {
        userSocketMap[userId] = socket.id;
        console.log("   ➡️ User mapped:", { userId, socketId: socket.id });
    }

    // Log the current state of all connected users
    console.log("   🗺️ Current online users:", userSocketMap);

    // Send the list of online users to all clients
    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    // Listen for sendMessage event
    socket.on("sendMessage", ({ receiverId, message }) => {
        console.log("   📩 Message received on server:", { receiverId, message });
        const receiverSocketId = getReceiverSocketId(receiverId);

        if (receiverSocketId) {
            console.log("   🎯 Found receiver, sending message to:", receiverSocketId);
            io.to(receiverSocketId).emit("newMessage", message);
        } else {
            console.log("   ❌ Receiver not found or offline.");
        }
    });

    // Handle disconnection
    socket.on("disconnect", () => {
        console.log("🔌 A user disconnected:", socket.id);
        // Find and remove the user from the map
        const disconnectedUserId = Object.keys(userSocketMap).find(
            (key) => userSocketMap[key] === socket.id
        );
        if (disconnectedUserId) {
            delete userSocketMap[disconnectedUserId];
            console.log("   ⬅️ User unmapped:", { userId: disconnectedUserId });
        }
        
        console.log("   🗺️ Current online users after disconnect:", userSocketMap);
        io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });
});

export { app, io, server };