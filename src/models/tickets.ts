import { Document, Schema, Model, model, Mongoose } from "mongoose";
import bcrypt from "bcryptjs";
import { config } from "../config/config";

const saltRounds = 13;

export enum STATUS {
  PENDING = "PENDING",
  INPROGRESS = "INPROGRESS",
  COMPLETED = "COMPLETED",
}

export interface ITicket {
  ticketId: string;
  queryId: Schema.Types.ObjectId;
  mentorsInvolved: [string];
  primaryMentor: Schema.Types.ObjectId;
  status: STATUS;
  createdOn?: Date;
  updatedOn?: Date;
}

export interface ITicketModel extends ITicket, Document {}

export const TicketSchema: Schema = new Schema(
  {
    ticketId: String,
    queryId: Schema.Types.ObjectId,
    mentorsInvolved: {
      type: [String],
      default: [],
    },
    primaryMentor: Schema.Types.ObjectId,
    status: {
      type: String,
      enum: [STATUS.PENDING, STATUS.INPROGRESS, STATUS.COMPLETED],
      default: STATUS.PENDING,
    },
    createdOn: {
      type: Date,
      default: Date.now,
      index: true,
    },
    updatedOn: {
      type: Date,
      default: Date.now,
    },
  },
  {
    usePushEach: true,
    bufferCommands: false,
    versionKey: false,
  }
);

TicketSchema.set("toObject", { virtuals: true });
TicketSchema.set("toJSON", { virtuals: true });

export const TicketModel: Model<ITicketModel> = model<ITicketModel>(
  "tickets",
  TicketSchema,
  "tickets"
);

export var findById = function (id: Schema.Types.ObjectId, cb: Function) {
  TicketModel.findById(id).exec(function (err, Ticket) {
    cb(err, Ticket);
  });
};

export var findByTicketId = function (ticketId: any, cb: Function) {
  TicketModel.findOne({ ticketId: ticketId }).exec(function (err, Ticket) {
    cb(err, Ticket);
  });
};

export var queryTicket = (
  query: any,
  projection: any,
  options: any,
  cb: Function
) => {
  TicketModel.find(query, projection, options, (err, data) => {
    cb(err, data);
  });
};

export var createTicket = function (TicketObj: any, cb: Function) {
  TicketModel.insertMany([TicketObj], function (err, Ticket) {
    cb(err, Ticket);
  });
};

export var updateTicketById = function (
  TicketId: string,
  TicketObj: any,
  cb: Function
) {
  TicketModel.updateOne(
    { _id: TicketId },
    { $set: TicketObj },
    { upsert: false },
    function (err, Ticket) {
      cb(err, Ticket);
    }
  );
};

export var aggregateTicket = function (aggArray: any, cb: Function) {
  TicketModel.aggregate([aggArray], function (err, Ticket) {
    cb(err, Ticket);
  });
};

export var deleteTicket = (TicketId: string, cb: Function) => {
  TicketModel.deleteOne({ TicketId: TicketId }, (err) => {
    cb(err);
  });
};
