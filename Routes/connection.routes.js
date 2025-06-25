import express from "express";
import {
  acceptConnection,
  getConnectionRequest,
  getConnectionStatus,
  getUserConnections,
  rejectConnection,
  removeConnection,
  sendConnection,
} from "../Controller/connection.controller.js";
import isAuth from "../MiddleWares/isAuth.js";

let connectionRoute = express.Router();

connectionRoute.post("/send/:id", isAuth, sendConnection);
connectionRoute.put("/accept/:connectionId", isAuth, acceptConnection);
connectionRoute.put("/reject/:connectionId", isAuth, rejectConnection);
connectionRoute.get("/getstatus/:userId", isAuth, getConnectionStatus);
connectionRoute.delete("/remove/:userId", isAuth, removeConnection);
connectionRoute.get("/request", isAuth, getConnectionRequest);
connectionRoute.get("/", isAuth, getUserConnections);

export default connectionRoute;
