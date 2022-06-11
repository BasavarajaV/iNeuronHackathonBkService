import express from "express";
import passport from "passport";
import { entryPoint } from "../../middlewares/entryPoint";
import { exitPoint } from "../../middlewares/exitPoint";
import { config } from "../../config/config";
import * as Queries from "../../controllers/queries";

let router = express.Router();

// =========================  routes ========================

router.post(
  "/add",
  entryPoint,
  passport.authenticate("bearer", { session: false }),
  Queries.addQueries,
  exitPoint
);

router.get(
  "/getQueriesForMentors",
  entryPoint,
  passport.authenticate("bearer", { session: false }),
  // Queries.getQueriesForMentors,
  exitPoint
);

router.put(
  "/updateStatus/:id",
  entryPoint,
  passport.authenticate("bearer", { session: false }),
  Queries.updateStatus,
  exitPoint
);

// =========================  end of routes   ========================
module.exports = router;
