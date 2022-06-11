import { Document, Schema, Model, model, Mongoose } from "mongoose";
import bcrypt from "bcryptjs";
import { config } from "../config/config";

const saltRounds = 13;


export interface IQuery {
  title: string;
  description: string;
  docs: [string];
  ticketId: string;
  studentId: Schema.Types.ObjectId;
  mentorsInvolved: [string];
  primaryMentor: Schema.Types.ObjectId;
  createdOn?: Date;
  updatedOn?: Date;
}

export interface IQueryModel extends IQuery, Document {}

export const QuerySchema: Schema = new Schema(
  {
    title: String,
    ticketId: String,
    description: String,
    mentorsInvolved: {
      type: [String],
      default: [],
    },
    docs: {
        type: [String],
        default: [],
      },
    primaryMentor: Schema.Types.ObjectId,
    studentId: Schema.Types.ObjectId,
    
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

QuerySchema.set("toObject", { virtuals: true });
QuerySchema.set("toJSON", { virtuals: true });

export const QueryModel: Model<IQueryModel> = model<IQueryModel>(
  "queries",
  QuerySchema,
  "queries"
);

export var findById = function (id: Schema.Types.ObjectId, cb: Function) {
  QueryModel.findById(id).exec(function (err, Query) {
    cb(err, Query);
  });
};

export var findByQueryId = function (queryId: any, cb: Function) {
  QueryModel.findOne({ queryId: queryId }).exec(function (err, Query) {
    cb(err, Query);
  });
};

export var queryQuery = (
  query: any,
  projection: any,
  options: any,
  cb: Function
) => {
  QueryModel.find(query, projection, options, (err, data) => {
    cb(err, data);
  });
};

export var createQuery = function (QueryObj: any, cb: Function) {
  QueryModel.insertMany([QueryObj], function (err, Query) {
    cb(err, Query);
  });
};

export var updateQueryById = function (
  QueryId: string,
  QueryObj: any,
  cb: Function
) {
  QueryModel.updateOne(
    { _id: QueryId },
    { $set: QueryObj },
    { upsert: false },
    function (err, Query) {
      cb(err, Query);
    }
  );
};

export var aggregateQuery = function (aggArray: any, cb: Function) {
  QueryModel.aggregate([aggArray], function (err, Query) {
    cb(err, Query);
  });
};

export var deleteQuery = (QueryId: string, cb: Function) => {
  QueryModel.deleteOne({ QueryId: QueryId }, (err) => {
    cb(err);
  });
};
