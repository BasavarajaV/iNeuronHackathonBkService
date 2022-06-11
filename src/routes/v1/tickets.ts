import express from "express";
import passport from "passport";
import { entryPoint } from "../../middlewares/entryPoint";
import { exitPoint } from "../../middlewares/exitPoint";
import { config } from "../../config/config";
import * as Tickets from "../../controllers/tickets/index"

let router = express.Router();



// =========================  routes ========================

router.post("/add", 
entryPoint,
passport.authenticate("bearer", { session: false }),
Tickets.addTickets,
exitPoint);

router.get("/getTicketsForMentors", 
entryPoint,
passport.authenticate("bearer", { session: false }),
Tickets.getTicketsForMentors,
exitPoint);

router.put("/updateStatus/:id", 
entryPoint,
passport.authenticate("bearer", { session: false }),
Tickets.updateStatus,
exitPoint);


// =========================  end of routes   ========================
module.exports = router;