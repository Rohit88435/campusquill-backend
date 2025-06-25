import express from "express";
import isAuth from "../MiddleWares/isAuth.js";
import {
  clearAllNotification,
  deleteNotification,
  getNotification,
} from "../Controller/notification.controllers.js";

let notificationRouter = express.Router();

notificationRouter.get("/get", isAuth, getNotification);
notificationRouter.delete("/deleteone/:id", isAuth, deleteNotification);
notificationRouter.delete("/clearall", isAuth, clearAllNotification);
export default notificationRouter;
