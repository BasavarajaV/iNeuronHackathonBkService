import * as Comments from "../../models/comments";
import * as Tickets from "../../models/tickets";
import { Request, Response, NextFunction } from "express";
import { ErrorCodes } from "../../models/models";
import * as logger from "../../models/logs";
import uniqid from "uniqid";

export function generateTicketId() {
  return uniqid("T");
}

export async function addComment(
  req: Request | any,
  res: Response,
  next: NextFunction
) {
  req.checkBody("queryId", "queryId is required").notEmpty();
  req.checkBody("content ", "content  is required").notEmpty();

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

  payload["commentedUserId"] = [req.user._id];

  console.log("payload", payload);

  Comments.createComment(payload, (err: any, result: any) => {
    console.log("err", err);

    if (err || !result) {
      req.apiStatus = {
        isSuccess: false,
        error: ErrorCodes[1002],
        customMsg: "Failed to create comment",
        data: {},
      };
      next();
      return;
    }

    req.apiStatus = {
      isSuccess: true,
      customMsg: "comment created successfully",
      data: {
        ticketId: payload.ticketId,
      },
    };
    next();
    return;
  });
}

export async function getCommentById(
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

  Comments.findById(id, (err: any, result: any) => {
    console.log("err", err);

    if (err || !result) {
      req.apiStatus = {
        isSuccess: false,
        error: ErrorCodes[1002],
        customMsg: "Failed to find comment",
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

export async function getComments(
  req: Request | any,
  res: Response,
  next: NextFunction
) {
  let queryId = req.body.queryId || null;

  if (!queryId) {
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
    queryId: queryId,
  };

  Comments.queryComment(query, {}, {}, (err: any, result: any) => {
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

export async function updateComment(
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

  let payload: any = req.body;

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
  if (payload.queryId) {
    delete payload.queryId;
  }

  let commentedUserId: any = req.user._id;

  Comments.findById(id, (err: any, comment: any) => {
    if (err || !comment) {
      req.apiStatus = {
        isSuccess: false,
        error: ErrorCodes[1003],
        customMsg: "Failed to find ticket",
        data: {},
      };
      next();
      return;
    }
    comment = JSON.parse(JSON.stringify(comment));
    console.log("comment", comment);
    if (
      comment &&
      comment.commentedUserId &&
      comment.commentedUserId == commentedUserId
    ) {
      Comments.updateCommentById(id, payload, (err: any, result: any) => {
        if (err || !result) {
          req.apiStatus = {
            isSuccess: false,
            error: ErrorCodes[1007],
            customMsg: "Failed to update comment",
            data: {},
          };
          next();
          return;
        }

        req.apiStatus = {
          isSuccess: true,
          customMsg: "Updated comment successfully",
          data: {},
        };
        next();
        return;
      });
    } else {
      req.apiStatus = {
        isSuccess: false,
        error: ErrorCodes[1103],
        customMsg: "Failed to varify commented user",
        data: {},
      };
      next();
      return;
    }
  });
}
