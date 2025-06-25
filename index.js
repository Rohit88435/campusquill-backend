import express from "express";
import dotenv from "dotenv";
import connectDb from "./Config/db.js";
import { authRouter } from "./Routes/auth.routes.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import userRouter from "./Routes/user.routes.js";
import postRoute from "./Routes/post.routes.js";
import connectionRoute from "./Routes/connection.routes.js";
import http from "http";
import { Server } from "socket.io";
import notificationRouter from "./Routes/notification.routes.js";
dotenv.config();

// instance (express)
let app = express();

let server = http.createServer(app);

// socket io
export const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true,
  },
});

app.use(express.json());

app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173", // your frontend URL
    credentials: true,
  })
);
// middlewares
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/post", postRoute);
app.use("/api/connection", connectionRoute);
app.use("/api/notification", notificationRouter);

//map using
export const userSocketMap = new Map();

// socket on
io.on("connection", (socket) => {
  console.log("userconnected", socket.id);

  socket.on("register", (userId) => {
    userSocketMap.set(userId, socket.id);
  });
  socket.on("disconnect", (socket) => {});
});

//  app listen
server.listen(process.env.PORT || 9000, () => {
  connectDb();
  console.log("connectDb");

  console.log("Server Started");
});
