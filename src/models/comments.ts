import { Document, Schema, Model, model, Mongoose } from "mongoose";
import bcrypt from "bcryptjs";
import { config } from "../config/config";

const saltRounds = 13;

export interface IComment {
  ticketId: string;
  queryId: Schema.Types.ObjectId;
  commentedUserId: Schema.Types.ObjectId;
  content : string;
  createdOn?: Date;
  updatedOn?: Date;
}

export interface ICommentModel extends IComment, Document {}

export const CommentSchema: Schema = new Schema(
  {
    ticketId: String,
    queryId: Schema.Types.ObjectId,
    commentedUserId: Schema.Types.ObjectId,
    content: String,    
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

CommentSchema.set("toObject", { virtuals: true });
CommentSchema.set("toJSON", { virtuals: true });

export const CommentModel: Model<ICommentModel> = model<ICommentModel>(
  "comments",
  CommentSchema,
  "comments"
);

export var findById = function (id: Schema.Types.ObjectId, cb: Function) {
  CommentModel.findById(id).exec(function (err, Comment) {
    cb(err, Comment);
  });
};

export var findByCommentId = function (commentId: any, cb: Function) {
  CommentModel.findOne({ commentId: commentId }).exec(function (err, Comment) {
    cb(err, Comment);
  });
};

export var findByFieldName = function (query: any, cb: Function) {
    CommentModel.findOne(query).exec(function (err, Comment) {
      cb(err, Comment);
    });
  };

export var queryComment = (
  query: any,
  projection: any,
  options: any,
  cb: Function
) => {
  CommentModel.find(query, projection, options, (err, data) => {
    cb(err, data);
  });
};

export var createComment = function (CommentObj: any, cb: Function) {
  CommentModel.insertMany([CommentObj], function (err, Comment) {
    cb(err, Comment);
  });
};

export var updateCommentById = function (
  CommentId: string,
  CommentObj: any,
  cb: Function
) {
  CommentModel.updateOne(
    { _id: CommentId },
    { $set: CommentObj },
    { upsert: false },
    function (err, Comment) {
      cb(err, Comment);
    }
  );
};

export var aggregateComment = function (aggArray: any, cb: Function) {
  CommentModel.aggregate([aggArray], function (err, Comment) {
    cb(err, Comment);
  });
};

export var deleteComment = (CommentId: string, cb: Function) => {
  CommentModel.deleteOne({ CommentId: CommentId }, (err) => {
    cb(err);
  });
};
