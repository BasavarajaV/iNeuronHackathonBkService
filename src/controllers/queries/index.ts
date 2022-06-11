import * as Queries from "../../models/queries";
import * as Tickets from "../../models/tickets";
import { Request, Response, NextFunction } from "express";
import { ErrorCodes } from "../../models/models";
import * as logger from "../../models/logs";
import uniqid from "uniqid";

export function generateTicketId() {
  return uniqid("T");
}

export async function addQueries(
  req: Request | any,
  res: Response,
  next: NextFunction
) {
  req.checkBody("studentId", "studentId is required").notEmpty();
  req.checkBody("title", "title is required").notEmpty();
  req.checkBody("description", "description is required").notEmpty();

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

  payload["ticketId"] = generateTicketId();

  payload["mentorsInvolved"] = [req.user._id];
  payload["primaryMentor"] = req.user._id;

  Queries.createQuery(payload, (err: any, result: any) => {
    console.log("err", err);

    if (err || !result) {
      req.apiStatus = {
        isSuccess: false,
        error: ErrorCodes[1002],
        customMsg: "Failed to create query",
        data: {},
      };
      next();
      return;
    }

    req.apiStatus = {
      isSuccess: true,
      customMsg: "query created successfully",
      data: {
        ticketId: payload.ticketId,
      },
    };
    next();
    return;

    // createTicketEntry(payload, result, (err: any, response: any) => {
    //   if (err) {
    //     req.apiStatus = {
    //       isSuccess: false,
    //       error: ErrorCodes[1002],
    //       customMsg: "Failed to create ticket",
    //       data: {},
    //     };
    //     next();
    //     return;
    //   }
    //   if (response) {
    //     req.apiStatus = {
    //       isSuccess: true,
    //       customMsg: "Ticket created successfully",
    //       data: {
    //         ticketId: payload.ticketId,
    //       },
    //     };
    //     next();
    //     return;
    //   }
    // });
  });
}

export function createTicketEntry(payload: any, queryEntry: any, cb: Function) {
  //   console.log("queryEntry", queryEntry);
  queryEntry = JSON.parse(JSON.stringify(queryEntry[0]));

  if (!queryEntry._id) {
    cb("queryId is required", null);
    return;
  }
  let ticketEntry: any = {
    ticketId: payload.ticketId,
    queryId: queryEntry._id,
    mentorsInvolved: payload.mentorsInvolved,
    primaryMentor: payload.primaryMentor,
  };

  //   console.log("ticketEntry", ticketEntry);

  Tickets.createTicket(ticketEntry, (err: any, result: any) => {
    if (err || !result) {
      console.log("err  createTicket :: ", err || result);
      cb("Failed to create ticket", null);
      return;
    }
    console.log("ticket created succssfully");
    cb(null, "ticket created succssfully");
    return;
  });
}
export async function getQueryByID(
  req: Request | any,
  res: Response,
  next: NextFunction
) {

    console.log("req.params", req.params);
    
  let id = req.params.id || null;

  if (!id) {
    req.apiStatus = {
      isSuccess: false,
      error: ErrorCodes[1001],
      customMsg: "primary id is missing",
      data: {},
    };
    next();
    return;
  }

  Queries.findById(id, (err: any, result: any) => {
    console.log("err", err);

    if (err || !result) {
      req.apiStatus = {
        isSuccess: false,
        error: ErrorCodes[1002],
        customMsg: "Failed to find ticket",
        data: {},
      };
      next();
      return;
    }

    req.apiStatus = {
      isSuccess: true,
      data: result,
    };
    next();
    return;
  });
}

export async function getQueries(
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

  Queries.queryQuery(query, {}, {}, (err: any, result: any) => {
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

export async function updateQuery(
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

  Queries.findById(id, (err: any, ticket: any) => {
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

      Queries.updateQueryById(id, payload, (err: any, result: any) => {
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
          customMsg: "Updated query successfully",
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
