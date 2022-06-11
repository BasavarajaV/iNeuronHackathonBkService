import express from "express";
import passport from "passport";
import { entryPoint } from "../../middlewares/entryPoint";
import { exitPoint } from "../../middlewares/exitPoint";
import { config } from "../../config/config";
import * as Chats from "../../controllers/chats/index";

let router = express.Router();

// =========================  routes ========================

// router.post(
//   "/add",
//   entryPoint,
//   passport.authenticate("bearer", { session: false }),
//   Comments.addComment,
//   exitPoint
// );

router.get(
  "/getUserChat/:id",
  entryPoint,
  passport.authenticate("bearer", { session: false }),
  Chats.getUserChat,
  exitPoint
);

router.get(
  "/getAllChatUsers",
  entryPoint,
  passport.authenticate("bearer", { session: false }),
  Chats.getAllChatUsers,
  exitPoint
);

// router.put(
//   "/updateComment/:id",
//   entryPoint,
//   passport.authenticate("bearer", { session: false }),
//   Comments.updateComment,
//   exitPoint
// );

// =========================  end of routes   ========================
module.exports = router;
