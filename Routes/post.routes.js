import express from "express";
import {
  comment,
  createPost,
  getPost,
  like,
} from "../Controller/post.controller.js";
import isAuth from "../MiddleWares/isAuth.js";
import upload from "../MiddleWares/multer.js";
let postRoute = express.Router();

postRoute.post("/createpost", isAuth, upload.single("image"), createPost);
postRoute.get("/getpost", isAuth, getPost);
postRoute.get("/like/:id", isAuth, like);
postRoute.post("/comment/:id", isAuth, comment);
export default postRoute;
