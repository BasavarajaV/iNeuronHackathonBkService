import * as Tickets from "../../models/tickets";
import { Request, Response, NextFunction } from "express";
import { ErrorCodes } from "../../models/models";
import * as logger from "../../models/logs";
import uniqid from "uniqid";

export function generateTicketId() {
  return uniqid("T");
}

export async function addTickets(
  req: Request | any,
  res: Response,
  next: NextFunction
) {
  //   req.checkBody("ticketId", "ticketId is required").notEmpty();
  req.checkBody("queryId", "queryId is required").notEmpty();

  var errors = req.validationErrors();

  if (errors) {
    req.apiStatus = {
      isSuccess: false,
      error: ErrorCodes[1001],
      data: errors[0].msg,
    };
    next();
    return;
  }

  let payload: any = req.body;

  //   let uniqueTicketId: any = await getuniqueTicketId();

  //   if (!uniqueTicketId) {
  //     req.apiStatus = {
  //       isSuccess: false,
  //       error: ErrorCodes[1102],
  //       customMsg: "Failed to generate uniqueTicketId",
  //       data: {},
  //     };
  //     next();
  //     return;
  //   }

  payload["ticketId"] = generateTicketId();

  payload["mentorsInvolved"] = [req.user._id];
  payload["primaryMentor"] = req.user._id;

  Tickets.createTicket(payload, (err: any, result: any) => {
    console.log("err", err);

    if (err || !result) {
      req.apiStatus = {
        isSuccess: false,
        error: ErrorCodes[1002],
        customMsg: "Failed to create ticket",
        data: {},
      };
      next();
      return;
    }

    req.apiStatus = {
      isSuccess: true,
      customMsg: "Ticket created successfully",
      data: {},
    };
    next();
    return;
  });
}

export async function getTicketsForMentors(
  req: Request | any,
  res: Response,
  next: NextFunction
) {
  let mentorId = req.user._id || null;

  if (!mentorId) {
    req.apiStatus = {
      isSuccess: false,
      error: ErrorCodes[1001],
      customMsg: "metorId is missing",
      data: {},
    };
    next();
    return;
  }

  let query: any = {
    primaryMentor: mentorId,
  };

  Tickets.queryTicket(query, {}, {}, (err: any, result: any) => {
    console.log("err", err);

    if (err || !result) {
      req.apiStatus = {
        isSuccess: false,
        error: ErrorCodes[1002],
        customMsg: "Failed to create ticket",
        data: {},
      };
      next();
      return;
    }

    req.apiStatus = {
      isSuccess: true,
      data: {
        list: result,
        count: result.length,
      },
    };
    next();
    return;
  });
}

export async function getuniqueTicketId() {
  let uniqueTicketId = null;
  let isTicketGenertaed = false;

  let ticketId = generateTicketId();

  while (!isTicketGenertaed) {
    Tickets.findByTicketId(ticketId, async (err: any, dbTicket: any) => {
      if (err) {
        console.log("Tickets.findById", err);
      }

      if (dbTicket) {
        //   await getuniqueTicketId();
      } else {
        isTicketGenertaed = true;
        uniqueTicketId = ticketId;
      }
    });
  }

  setTimeout(() => {
    return null;
  }, 5000);

  return uniqueTicketId;
}

export async function updateStatus(
  req: Request | any,
  res: Response,
  next: NextFunction
) {
  let id = req.params.id;

  if (!id) {
    req.apiStatus = {
      isSuccess: false,
      error: ErrorCodes[1001],
      customMsg: "id is missing",
      data: {},
    };
    next();
    return;
  }

  let payload = req.body;

  if (!Object.keys(payload).length) {
    req.apiStatus = {
      isSuccess: false,
      error: ErrorCodes[1009],
      customMsg: "Payload is missing",
      data: {},
    };
    next();
    return;
  }

  let mentorId: any = req.user._id;

  Tickets.findById(id, (err: any, ticket: any) => {
    if (err || !ticket) {
      req.apiStatus = {
        isSuccess: false,
        error: ErrorCodes[1003],
        customMsg: "Failed to find ticket",
        data: {},
      };
      next();
      return;
    }
    if (ticket && ticket.primaryMentor && ticket.primaryMentor == mentorId) {
      ticket = JSON.parse(JSON.stringify(ticket));

      Tickets.updateTicketById(id, payload, (err: any, result: any) => {
        console.log("err", err);

        if (err || !result) {
          req.apiStatus = {
            isSuccess: false,
            error: ErrorCodes[1007],
            customMsg: "Failed to update ticket",
            data: {},
          };
          next();
          return;
        }

        req.apiStatus = {
          isSuccess: true,
          customMsg: "Updated status successfully",
          data: {},
        };
        next();
        return;
      });
    } else {
      req.apiStatus = {
        isSuccess: false,
        error: ErrorCodes[1103],
        customMsg: "Failed to varify Mentor",
        data: {},
      };
      next();
      return;
    }
  });
}
