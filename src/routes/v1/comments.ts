import express from "express";
import passport from "passport";
import { entryPoint } from "../../middlewares/entryPoint";
import { exitPoint } from "../../middlewares/exitPoint";
import { config } from "../../config/config";
import * as Comments from "../../controllers/comments/index";

let router = express.Router();

// =========================  routes ========================

router.post(
  "/add",
  entryPoint,
  passport.authenticate("bearer", { session: false }),
  Comments.addComment,
  exitPoint
);

router.get(
    "/getComment/:id",
    entryPoint,
    passport.authenticate("bearer", { session: false }),
    Comments.getCommentById,
    exitPoint
  );

router.get(
  "/getComments",
  entryPoint,
  passport.authenticate("bearer", { session: false }),
  Comments.getComments,
  exitPoint
);

router.put(
  "/updateComment/:id",
  entryPoint,
  passport.authenticate("bearer", { session: false }),
  Comments.updateComment,
  exitPoint
);

// =========================  end of routes   ========================
module.exports = router;
